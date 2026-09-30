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

    // 1. Update status order menjadi paid
    await supabaseAdmin
      .from('orders')
      .update({ status: 'paid' })
      .eq('order_id', order_id);

    // 2. Ambil detail pesanan beserta data bukunya
    const { data: orderItems, error: orderError } = await supabaseAdmin
      .from('order_items')
      .select('*, books(*)')
      .eq('order_id', order_id);

    // Ambil info pembeli dari tabel orders
    const { data: orderData } = await supabaseAdmin
      .from('orders')
      .select('customer_name, customer_email')
      .eq('order_id', order_id)
      .single();

    if (orderError || !orderItems || !orderData) {
      return NextResponse.json({ error: 'Order detail tidak ditemukan' }, { status: 404 });
    }

    const downloadLinks: { bookTitle: string; url: string }[] = [];

    // 3. Proses potong stok & buat Signed URL untuk E-Book
    for (const item of orderItems) {
      // Potong stok via RPC
      await supabaseAdmin.rpc('decrement_stock', {
        book_id: item.book_id,
        quantity: item.quantity,
      });

      // Jika ada file_path e-book, buat Signed URL (24 jam)
      if (item.books && item.books.file_path) {
        const { data: signedData } = await supabaseAdmin
          .storage
          .from('ebooks')
          .createSignedUrl(item.books.file_path, 86400);

        if (signedData?.signedUrl) {
          downloadLinks.push({
            bookTitle: item.books.title,
            url: signedData.signedUrl,
          });
        }
      }
    }

    // 4. Kirim Email Invoice + Link E-Book via Resend
    await resend.emails.send({
      from: 'Toko Buku Digital <onboarding@resend.dev>',
      to: [orderData.customer_email],
      subject: `[Lunas] Akses E-Book & Invoice Pesanan #${order_id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Halo, ${orderData.customer_name}!</h2>
          <p>Pembayaran untuk pesanan <strong>#${order_id}</strong> telah berhasil diproses.</p>
          ${
            downloadLinks.length > 0
              ? `
            <div style="background-color: #f4f4f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3>Akses E-Book Anda:</h3>
              <p style="font-size: 13px; color: #52525b;">Link di bawah ini bersifat privat dan akan <strong>hangus dalam 24 jam</strong>.</p>
              ${downloadLinks
                .map(
                  (link) => `
                <div style="margin-bottom: 10px;">
                  <strong>${link.bookTitle}</strong><br/>
                  <a href="${link.url}" style="display: inline-block; margin-top: 5px; padding: 10px 15px; background-color: #2563eb; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">Download E-Book</a>
                </div>
              `
                )
                .join('')}
            </div>
          `
              : `<p>Pesanan buku fisik Anda sedang diproses.</p>`
          }
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: 'Webhook diproses' });
  } catch (error: any) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}