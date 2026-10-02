import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

function formatRupiah(amount: number): string {
  return 'Rp ' + Number(amount).toLocaleString('id-ID');
}

// Helper: delay
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Helper: ambil order_items dengan retry
async function getOrderItemsWithRetry(orderId: string, maxRetries = 5) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const { data: items } = await supabaseAdmin
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (items && items.length > 0) {
      return items;
    }

    console.log(
      `[Webhook] order_items kosong (attempt ${attempt}/${maxRetries}), retry dalam 2 detik...`
    );

    // Tunggu 2 detik sebelum retry
    await sleep(2000);
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { transaction_status, order_id, fraud_status } = body;
    const isSettled =
      transaction_status === 'settlement' ||
      (transaction_status === 'capture' && fraud_status === 'accept');

    if (!isSettled) {
      return NextResponse.json(
        { message: 'Transaksi belum settlement' },
        { status: 200 }
      );
    }

    console.log(`[Webhook] Processing order: ${order_id}`);

    // 1. Update status order
    await supabaseAdmin
      .from('orders')
      .update({ status: 'paid' })
      .eq('order_id', order_id);

    // 2. Ambil data order
    const { data: orderData } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('order_id', order_id)
      .single();

    if (!orderData) {
      console.error(`[Webhook] Order tidak ditemukan: ${order_id}`);
      return NextResponse.json(
        { error: 'Order tidak ditemukan' },
        { status: 404 }
      );
    }

    // 3. Ambil order_items dengan RETRY
    const orderItems = await getOrderItemsWithRetry(order_id);

    if (!orderItems || orderItems.length === 0) {
      console.error(
        `[Webhook] GAGAL ambil order_items setelah retry: ${order_id}`
      );
      return NextResponse.json(
        { error: 'Order items tidak ditemukan setelah retry' },
        { status: 404 }
      );
    }

    console.log(`[Webhook] Dapat ${orderItems.length} order items`);

    const downloadLinks: { bookTitle: string; url: string }[] = [];
    const physicalItems: { title: string }[] = [];
    let debugLog = '';

    // 4. Looping item
    for (const item of orderItems) {
      // Potong stok
      await supabaseAdmin.rpc('decrement_stock', {
        book_id: item.book_id,
        quantity: item.quantity,
      });

      // Ambil data buku dengan QUERY TERPISAH (lebih reliable dari join)
      const { data: bookData, error: bookError } = await supabaseAdmin
        .from('books')
        .select('title, file_path, format')
        .eq('id', item.book_id)
        .single();

      if (bookError || !bookData) {
        debugLog += `[Buku tidak ditemukan: ${item.book_id}] `;
        continue;
      }

      const filePath = bookData.file_path;
      const bookTitle = bookData.title || 'Buku';

      // PENTING: pakai format_type dari order_items (pilihan pembeli)
      // fallback ke book.format kalau format_type kosong
      const effectiveFormat = item.format_type || bookData.format || 'ebook';

      console.log(
        `[Webhook] Item: ${bookTitle}, format_type: ${item.format_type}, effective: ${effectiveFormat}, file: ${filePath}`
      );

      // ============ EBOOK ============
      if (effectiveFormat === 'ebook' || effectiveFormat === 'both') {
        if (!filePath) {
          debugLog += `[File PDF tidak ada untuk: ${bookTitle}] `;
        } else {
          const { data: signedData, error: signedError } =
            await supabaseAdmin.storage
              .from('ebooks')
              .createSignedUrl(filePath, 86400);

          if (signedData?.signedUrl) {
            downloadLinks.push({
              bookTitle,
              url: signedData.signedUrl,
            });
            console.log(`[Webhook] ✓ Signed URL dibuat untuk: ${bookTitle}`);
          } else {
            debugLog += `[Err: ${
              signedError?.message || 'Unknown'
            }, Path: ${filePath}] `;
            console.error(
              `[Webhook] Gagal buat signed URL:`,
              signedError
            );
          }
        }
      }

      // ============ BUKU FISIK ============
      if (effectiveFormat === 'physical' || effectiveFormat === 'both') {
        physicalItems.push({ title: bookTitle });
      }
    }

    // ============ SUSUN EMAIL ============
    const hasEbook = downloadLinks.length > 0;
    const hasPhysical = physicalItems.length > 0;

    console.log(
      `[Webhook] Email: ${downloadLinks.length} ebook, ${physicalItems.length} fisik, debug: ${debugLog}`
    );

    // Section ebook
    const ebookSection = hasEbook
      ? `
        <div style="background-color: #ecfdf5; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #a7f3d0;">
          <h3 style="margin-top: 0; color: #065f46; font-size: 16px;">📚 Akses Download E-Book</h3>
          <p style="font-size: 12px; color: #047857; margin-bottom: 15px;">
            Demi keamanan, link di bawah ini berlaku selama <strong>24 jam</strong>.
          </p>
          ${downloadLinks
            .map(
              (link) => `
            <div style="margin-bottom: 12px; padding: 14px; background: #ffffff; border-radius: 8px; border: 1px solid #d1fae5;">
              <strong style="font-size: 14px; color: #0f172a; display: block; margin-bottom: 10px;">${link.bookTitle}</strong>
              <a href="${link.url}" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #059669; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 13px;">
                📥 Download E-Book (PDF)
              </a>
            </div>
          `
            )
            .join('')}
        </div>
      `
      : debugLog && !hasPhysical
      ? `
        <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #fecaca;">
          <p style="color: #991b1b; margin: 0; font-weight: bold; font-size: 14px;">⚠️ Link Download Belum Tersedia</p>
          <p style="color: #7f1d1d; font-size: 11px; margin-top: 6px;">${debugLog}</p>
          <p style="color: #7f1d1d; font-size: 11px; margin-top: 6px;">Hubungi kami di mustawa.publishing@gmail.com untuk bantuan.</p>
        </div>
      `
      : '';

    // Section buku fisik
    const physicalSection = hasPhysical
      ? `
        <div style="background-color: #eff6ff; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #bfdbfe;">
          <h3 style="margin-top: 0; color: #1e40af; font-size: 16px;">📦 Buku Fisik — Dalam Proses Pengiriman</h3>
          <p style="font-size: 13px; color: #1e3a8a; margin-bottom: 12px;">
            Buku fisik akan dikirim ke alamat berikut:
          </p>
          <div style="background: #ffffff; padding: 14px; border-radius: 8px; border: 1px solid #dbeafe; font-size: 13px; color: #1e3a8a; line-height: 1.7;">
            <strong>${orderData.shipping_name || orderData.customer_name}</strong><br/>
            ${orderData.shipping_phone || ''}<br/>
            ${orderData.shipping_address || ''}<br/>
            ${orderData.shipping_city || ''}, ${orderData.shipping_province || ''} ${orderData.shipping_postal_code || ''}
          </div>
          <p style="font-size: 12px; color: #1e40af; margin-top: 12px;">
            Buku yang akan dikirim:
          </p>
          <ul style="margin: 6px 0 0 0; padding-left: 20px; color: #1e3a8a; font-size: 13px;">
            ${physicalItems.map((item) => `<li>${item.title}</li>`).join('')}
          </ul>
          <p style="font-size: 12px; color: #1e40af; margin-top: 12px;">
            📦 Estimasi pengiriman: 2-5 hari kerja dari Majalengka, Jawa Barat.<br/>
            📱 Nomor resi akan dikirim ke email ini setelah paket dikirim.
          </p>
        </div>
      `
      : '';

    // Subtitle dinamis
    const orderSubtitle = hasEbook && hasPhysical
      ? 'Pembayaran Anda telah kami terima. E-book siap diunduh dan buku fisik akan segera dikirim.'
      : hasEbook
      ? 'Pembayaran Anda telah kami terima. E-book Anda siap diunduh.'
      : hasPhysical
      ? 'Pembayaran Anda telah kami terima. Buku fisik akan segera dikirim.'
      : 'Pembayaran Anda telah kami terima.';

    // ============ KIRIM EMAIL ============
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || 'https://tokobuku.com';

    await resend.emails.send({
      from: 'Mustawa Publishing <onboarding@resend.dev>',
      to: [orderData.customer_email],
      subject: `[Lunas] Pesanan #${order_id} — Mustawa Publishing`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc;">
          <div style="background: white; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">

            <!-- Header -->
            <div style="background: linear-gradient(135deg, #059669 0%, #0d9488 100%); padding: 32px 24px; text-align: center;">
              <h1 style="color: white; font-size: 22px; margin: 0; font-weight: 700; letter-spacing: 1px;">
                MUSTAWA PUBLISHING
              </h1>
              <p style="color: #d1fae5; font-size: 11px; margin: 8px 0 0 0; letter-spacing: 1px;">
                TEMPAT GAGASAN MULIA MULAI DITULISKAN
              </p>
            </div>

            <!-- Content -->
            <div style="padding: 32px 24px;">

              <div style="text-align: center; margin-bottom: 24px;">
                <div style="font-size: 48px; margin-bottom: 12px;">✅</div>
                <h2 style="color: #0f172a; font-size: 22px; margin: 0 0 8px 0; font-weight: 700;">
                  Pembayaran Berhasil!
                </h2>
                <p style="color: #64748b; font-size: 14px; margin: 0;">
                  Terima kasih, <strong>${orderData.customer_name}</strong>
                </p>
              </div>

              <p style="color: #475569; font-size: 14px; line-height: 1.7; margin: 0 0 24px 0; text-align: center;">
                ${orderSubtitle}
              </p>

              <!-- Box Order -->
              <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
                  <tr>
                    <td style="color: #64748b; padding: 6px 0;">Order ID</td>
                    <td style="color: #0f172a; font-weight: 700; text-align: right; font-family: monospace; font-size: 12px;">${order_id}</td>
                  </tr>
                  ${
                    orderData.subtotal
                      ? `
                  <tr>
                    <td style="color: #64748b; padding: 6px 0;">Subtotal</td>
                    <td style="color: #0f172a; text-align: right;">${formatRupiah(orderData.subtotal)}</td>
                  </tr>
                  `
                      : ''
                  }
                  ${
                    orderData.shipping_cost
                      ? `
                  <tr>
                    <td style="color: #64748b; padding: 6px 0;">Ongkir (${orderData.shipping_zone === 'jawa' ? 'Jawa' : 'Luar Jawa'})</td>
                    <td style="color: #0f172a; text-align: right;">${formatRupiah(orderData.shipping_cost)}</td>
                  </tr>
                  `
                      : ''
                  }
                  <tr>
                    <td style="color: #64748b; padding: 12px 0 0 0; border-top: 1px solid #e2e8f0; font-weight: 600;">Total Dibayar</td>
                    <td style="color: #059669; font-weight: 700; text-align: right; font-size: 16px; padding: 12px 0 0 0; border-top: 1px solid #e2e8f0;">${formatRupiah(orderData.total_amount)}</td>
                  </tr>
                </table>
              </div>

              ${ebookSection}
              ${physicalSection}

              <!-- CTA Portal -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${baseUrl}/orders/${order_id}"
                   style="display: inline-block; background: #059669; color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px;">
                  🔍 Buka Portal Pesanan
                </a>
                <p style="color: #94a3b8; font-size: 11px; margin-top: 12px;">
                  Simpan email ini — Anda bisa akses pesanan kapan saja
                </p>
              </div>

              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />

              <p style="color: #94a3b8; font-size: 12px; line-height: 1.6; margin: 0; text-align: center;">
                Ada pertanyaan? Hubungi kami di<br />
                <a href="mailto:mustawa.publishing@gmail.com" style="color: #059669; text-decoration: none; font-weight: 600;">
                  mustawa.publishing@gmail.com
                </a>
              </p>
            </div>

            <!-- Footer -->
            <div style="background: #0f172a; padding: 20px; text-align: center;">
              <p style="color: #94a3b8; font-size: 11px; margin: 0;">
                © ${new Date().getFullYear()} Mustawa Publishing
              </p>
            </div>
          </div>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: 'Webhook diproses & email terkirim',
    });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}