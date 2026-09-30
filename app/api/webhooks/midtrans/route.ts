import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { transaction_status, order_id, fraud_status } = body;
    const isSettled =
      transaction_status === 'settlement' ||
      (transaction_status === 'capture' && fraud_status === 'accept');

    if (!isSettled) {
      return NextResponse.json({ message: 'Transaksi belum settlement' }, { status: 200 });
    }

    // 1. Update status order di DB
    await supabaseAdmin
      .from('orders')
      .update({ status: 'paid' })
      .eq('order_id', order_id);

    // 2. Ambil detail order_items & data pemesan
    const { data: orderItems } = await supabaseAdmin
      .from('order_items')
      .select('*, books(*)')
      .eq('order_id', order_id);

    const { data: orderData } = await supabaseAdmin
      .from('orders')
      .select('customer_name, customer_email')
      .eq('order_id', order_id)
      .single();

    if (!orderItems || !orderData) {
      return NextResponse.json({ error: 'Order detail tidak ditemukan' }, { status: 404 });
    }

    const downloadLinks: { bookTitle: string; url: string }[] = [];
    let debugLog = '';

    // 3. Looping item & generate Signed URL
    for (const item of orderItems) {
      // Potong stok
      await supabaseAdmin.rpc('decrement_stock', {
        book_id: item.book_id,
        quantity: item.quantity,
      });

      // Ambil data buku
      const bookData = Array.isArray(item.books) ? item.books[0] : item.books;
      let filePath = bookData?.file_path;
      let bookTitle = bookData?.title || 'E-Book';

      // Fallback query jika join Supabase gagal
      if (!filePath && item.book_id) {
        const { data: directBook } = await supabaseAdmin
          .from('books')
          .select('title, file_path')
          .eq('id', item.book_id)
          .single();

        if (directBook) {
          filePath = directBook.file_path;
          bookTitle = directBook.title;
        }
      }

      // Pakai file_path paksa jika masih kosong
      if (!filePath) {
        filePath = 'labirin kehidupan.pdf';
      }

      // Generate Signed URL (24 jam)
      const { data: signedData, error: signedError } = await supabaseAdmin
        .storage
        .from('ebooks')
        .createSignedUrl(filePath, 86400);

      if (signedData?.signedUrl) {
        downloadLinks.push({
          bookTitle,
          url: signedData.signedUrl,
        });
      } else {
        debugLog += `[Err: ${signedError?.message || 'Unknown'}, Path: ${filePath}] `;
      }
    }

    // 4. Kirim Email via Resend
    await resend.emails.send({
      from: 'Toko Buku Digital <onboarding@resend.dev>',
      to: [orderData.customer_email],
      subject: `[Lunas] Akses E-Book Pesanan #${order_id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 8px;">
          <h2 style="color: #18181b;">Terima Kasih, ${orderData.customer_name}!</h2>
          <p style="color: #3f3f46;">Pembayaran untuk pesanan <strong>#${order_id}</strong> telah kami terima.</p>

          ${
            downloadLinks.length > 0
              ? `
            <div style="background-color: #f4f4f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #18181b;">📚 Akses Download E-Book Anda:</h3>
              <p style="font-size: 13px; color: #71717a; margin-bottom: 15px;">
                Demi keamanan, link di bawah ini berlaku selama <strong>24 jam</strong>.
              </p>
              ${downloadLinks
                .map(
                  (link) => `
                <div style="margin-bottom: 15px; padding: 12px; background: #ffffff; border-radius: 6px; border: 1px solid #e4e4e7;">
                  <strong style="font-size: 15px; color: #18181b;">${link.bookTitle}</strong><br/>
                  <a href="${link.url}" target="_blank" style="display: inline-block; margin-top: 10px; padding: 10px 18px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">
                    Download E-Book (PDF)
                  </a>
                </div>
              `
                )
                .join('')}
            </div>
          `
              : `
            <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #fecaca;">
              <p style="color: #991b1b; margin: 0; font-weight: bold;">⚠️ Link Download Gagal Dibuat</p>
              <p style="color: #7f1d1d; font-size: 11px; margin-top: 5px;">Penyebab: ${debugLog || 'Kunci SUPABASE_SERVICE_ROLE_KEY di Vercel belum sesuai'}</p>
            </div>
          `
          }

          <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 20px 0;" />
          <p style="font-size: 12px; color: #a1a1aa; text-align: center;">Toko Buku Digital © 2026</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: 'Webhook diproses' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}