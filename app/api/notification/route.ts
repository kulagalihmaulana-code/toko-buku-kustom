import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Inisialisasi Resend Client
const resend = new Resend(process.env.RESEND_API_KEY);

// Inisialisasi Supabase Admin Client agar bisa membuat Signed URL dari bucket private
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

  // Fallback: Jika item_details kosong, cari buku via shortId
  if (!bookId) {
    const parts = orderId.split('-');
    if (parts.length >= 2) {
      const shortId = parts[1];
      const { data: allBooks } = await supabaseAdmin
        .from('books')
        .select('id, stock, title, file_path');

      const matchedBook = allBooks?.find((b) => String(b.id).startsWith(shortId));
      if (matchedBook) {
        bookId = matchedBook.id;
      }
    }
  }

  let downloadUrl = '';
  let bookTitle = 'E-Book Digital';

  // C. Potong stok & Buat Signed URL (Link Download)
  if (bookId) {
    const { data: book, error: fetchError } = await supabaseAdmin
      .from('books')
      .select('id, stock, title, file_path')
      .eq('id', bookId)
      .single();

    if (fetchError) {
      console.error('[SUPABASE ERROR]', fetchError.message);
    } else if (book) {
      bookTitle = book.title || 'E-Book Digital';

      // 1. Potong Stok Buku
      const currentStock = Number(book.stock) || 0;
      if (currentStock > 0) {
        await supabaseAdmin
          .from('books')
          .update({ stock: currentStock - 1 })
          .eq('id', bookId);
      }

      // 2. Buat Signed URL dari Storage Bucket 'ebooks' (Berlaku 24 Jam)
      if (book.file_path) {
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

  // D. Pengiriman Email Konfirmasi + Tombol Download via Resend
  const recipientEmail = payload.customer_details?.email;
  const recipientName = payload.customer_details?.first_name || 'Pembeli';

  if (recipientEmail) {
    try {
      // Menyiapkan Tampilan Tombol Download
      const downloadButtonHtml = downloadUrl
        ? `
          <div style="margin: 30px 0; text-align: center;">
            <a href="${downloadUrl}" 
               style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block; font-size: 16px;">
              📥 Download E-Book (${bookTitle})
            </a>
            <p style="font-size: 12px; color: #64748b; margin-top: 10px; line-height: 1.4;">
              *Link download ini berlaku selama 24 jam demi keamanan file.
            </p>
          </div>
        `
        : `
          <p style="font-size: 13px; color: #dc2626; line-height: 1.5; margin-top: 20px;">
            File e-book sedang disiapkan. Jika tombol belum muncul, silakan hubungi layanan pelanggan kami.
          </p>
        `;

      await resend.emails.send({
        from: 'Toko Buku Digital <onboarding@resend.dev>',
        to: recipientEmail,
        subject: `[Akses E-Book] Invoice & Download - ${orderId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #0f172a; margin-top: 0;">Pembayaran Berhasil!</h2>
            <p>Halo <strong>${recipientName}</strong>,</p>
            <p>Terima kasih atas pesanan Anda. Pembayaran untuk order <strong>${orderId}</strong> telah kami terima.</p>
            
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; font-weight: bold; color: #334155;">Total Pembayaran:</p>
              <p style="margin: 5px 0 0 0; font-size: 18px; color: #0284c7; font-weight: bold;">
                Rp ${Number(payload.gross_amount).toLocaleString('id-ID')}
              </p>
            </div>

            ${downloadButtonHtml}

          </div>
        `
      });
      console.log(`[EMAIL SUCCESS] Email invoice & link download berhasil dikirim ke: ${recipientEmail}`);
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