import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Inisialisasi Resend Client
const resend = new Resend(process.env.RESEND_API_KEY);

// Inisialisasi Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = body;

    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';

    // 1. Verifikasi Keaslian Notifikasi (Signature Key Check)
    const hash = crypto
      .createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest('hex');

    if (hash !== signature_key) {
      return NextResponse.json({ error: 'Signature Key tidak valid' }, { status: 400 });
    }

    // 2. Evaluasi Status Pembayaran
    if (transaction_status === 'capture') {
      if (fraud_status === 'accept') {
        await handlePaymentSuccess(order_id, body);
      }
    } else if (transaction_status === 'settlement') {
      await handlePaymentSuccess(order_id, body);
    } else if (
      transaction_status === 'cancel' ||
      transaction_status === 'deny' ||
      transaction_status === 'expire'
    ) {
      await handlePaymentFailure(order_id, transaction_status);
    }

    return NextResponse.json({ status: 'OK' });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
  }
}

// Fungsi eksekusi saat pembayaran BERHASIL
async function handlePaymentSuccess(orderId: string, payload: any) {
  console.log(`[PAID] Transaksi ${orderId} berhasil dikonfirmasi!`);

  // A. Update status order menjadi 'paid' di Supabase
  await supabaseAdmin
    .from('orders')
    .update({ status: 'paid' })
    .eq('order_id', orderId);

  // B. Cari ID buku dari item_details Midtrans
  let bookId = payload.item_details?.[0]?.id || payload.item?.[0]?.id;

  // Fallback: Jika item_details kosong, cari via shortId
  if (!bookId) {
    const parts = orderId.split('-');
    if (parts.length >= 2) {
      const shortId = parts[1];
      const { data: allBooks } = await supabaseAdmin
        .from('books')
        .select('id, stock, title, file_path, format');

      const matchedBook = allBooks?.find((b) => String(b.id).startsWith(shortId));
      if (matchedBook) {
        bookId = matchedBook.id;
      }
    }
  }

  let downloadUrl = '';
  let bookTitle = 'Buku Digital / Fisik';
  let bookFormat = 'ebook'; // Default format

  // C. Potong stok, cek format, & Buat Signed URL jika e-book
  if (bookId) {
    const { data: book, error: fetchError } = await supabaseAdmin
      .from('books')
      .select('id, stock, title, file_path, format')
      .eq('id', bookId)
      .single();

    if (fetchError) {
      console.error('[SUPABASE ERROR]', fetchError.message);
    } else if (book) {
      bookTitle = book.title || 'Buku Digital / Fisik';
      bookFormat = book.format || 'ebook';

      // 1. Potong Stok Buku
      const currentStock = Number(book.stock) || 0;
      if (currentStock > 0) {
        await supabaseAdmin
          .from('books')
          .update({ stock: currentStock - 1 })
          .eq('id', bookId);
      }

      // 2. Buat Signed URL HANYA jika produk memiliki format 'ebook' atau 'both'
      if ((bookFormat === 'ebook' || bookFormat === 'both') && book.file_path) {
        const { data: signedData, error: signedError } = await supabaseAdmin
          .storage
          .from('ebooks')
          .createSignedUrl(book.file_path, 86400);

        if (signedError) {
          console.error('[STORAGE ERROR]', signedError.message);
        } else if (signedData) {
          downloadUrl = signedData.signedUrl;
          console.log('[SUCCESS] Signed URL berhasil dibuat!');
        }
      }
    }
  }

  // D. Pengisian Konten Email Berdasarkan Format Produk
  const recipientEmail = payload.customer_details?.email;
  const recipientName = payload.customer_details?.first_name || 'Pembeli';

  let productDetailsHtml = '';

  // Template Konten E-Book
  const ebookBlock = downloadUrl
    ? `
      <div style="margin: 25px 0; text-align: center; background-color: #eff6ff; padding: 20px; border-radius: 8px; border: 1px solid #bfdbfe;">
        <h4 style="margin: 0 0 10px 0; color: #1e40af;">Akses E-Book Anda</h4>
        <a href="${downloadUrl}" 
           style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block; font-size: 15px;">
          📥 Download E-Book (PDF)
        </a>
        <p style="font-size: 12px; color: #64748b; margin-top: 10px; margin-bottom: 0;">
          *Link berlaku 24 jam demi keamanan file.
        </p>
      </div>
    `
    : `
      <div style="margin: 20px 0; padding: 15px; background-color: #fef2f2; border-radius: 6px; border: 1px solid #fecaca; color: #991b1b; font-size: 13px;">
        File e-book sedang disiapkan. Jika tombol unduh belum muncul, hubungi layanan pelanggan kami.
      </div>
    `;

  // Template Konten Buku Fisik
  const physicalBlock = `
    <div style="margin: 25px 0; background-color: #f0fdf4; padding: 20px; border-radius: 8px; border: 1px solid #bbf7d0;">
      <h4 style="margin: 0 0 10px 0; color: #166534;">📦 Informasi Pengiriman Buku Fisik</h4>
      <p style="margin: 0; font-size: 14px; color: #15803d; line-height: 1.5;">
        Pesanan buku fisik Anda sedang dikemas oleh tim logistik kami. Nomor resi pengiriman akan diperbarui secara otomatis setelah kurir mengangkut paket Anda.
      </p>
    </div>
  `;

  // Gabungkan Blok Email Sesuai Format
  if (bookFormat === 'ebook') {
    productDetailsHtml = ebookBlock;
  } else if (bookFormat === 'physical') {
    productDetailsHtml = physicalBlock;
  } else if (bookFormat === 'both') {
    productDetailsHtml = ebookBlock + physicalBlock;
  }

  // E. Pengiriman Email via Resend
  if (recipientEmail) {
    try {
      await resend.emails.send({
        from: 'Toko Buku Digital <onboarding@resend.dev>',
        to: recipientEmail,
        subject: `[Konfirmasi Pesanan] Invoice & Detail Produk - ${orderId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #0f172a; margin-top: 0;">Pembayaran Berhasil!</h2>
            <p>Halo <strong>${recipientName}</strong>,</p>
            <p>Terima kasih atas pesanan Anda. Pembayaran untuk order <strong>${orderId}</strong> telah kami terima.</p>
            
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; font-weight: bold; color: #334155;">Detail Pesanan:</p>
              <p style="margin: 5px 0 0 0; font-size: 15px; color: #0f172a; font-weight: bold;">${bookTitle}</p>
              <p style="margin: 5px 0 0 0; font-size: 16px; color: #0284c7; font-weight: bold;">
                Total: Rp ${Number(payload.gross_amount).toLocaleString('id-ID')}
              </p>
            </div>

            ${productDetailsHtml}

            <!-- MODEL C HYBRID: Link Portal Pesanan -->
            <div style="margin-top: 25px; padding-top: 20px; border-top: 1px dashed #cbd5e1; text-align: center;">
              <p style="font-size: 13px; color: #475569; margin-bottom: 10px;">
                Ingin melihat status & riwayat lengkap pesanan ini di web?
              </p>
              <a href="https://toko-buku-kustom-t4mr.vercel.app/orders/${orderId}" 
                 style="color: #0284c7; font-weight: bold; text-decoration: underline; font-size: 14px;">
                🌐 Buka Halaman Portal Pesanan Anda →
              </a>
            </div>

            <p style="font-size: 12px; color: #94a3b8; margin-top: 30px; text-align: center;">
              Toko Buku Digital — Layanan Otomatis 24/7
            </p>
          </div>
        `
      });
      console.log(`[EMAIL SUCCESS] Email dual-template + Portal Link berhasil dikirim ke: ${recipientEmail}`);
    } catch (emailError: any) {
      console.error('[EMAIL ERROR]', emailError.message);
    }
  }
}

// Fungsi eksekusi saat pembayaran GAGAL / EXPIRED
async function handlePaymentFailure(orderId: string, status: string) {
  console.log(`[FAILED] Transaksi ${orderId} berstatus: ${status}`);
  await supabaseAdmin
    .from('orders')
    .update({ status: 'failed' })
    .eq('order_id', orderId);
}