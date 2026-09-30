import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabaseClient } from '@/lib/supabase';
import { Resend } from 'resend';

// Inisialisasi Resend Client
const resend = new Resend(process.env.RESEND_API_KEY);

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
  
  const supabase = getSupabaseClient();

  // 1. Ambil ID buku dari item_details payload Midtrans
  let bookId = payload.item_details?.[0]?.id || payload.item?.[0]?.id;

  // 2. Fallback: Jika item_details kosong, cari buku di Supabase
  if (!bookId) {
    const parts = orderId.split('-'); // Format: BOOK-[shortId]-[timestamp]
    if (parts.length >= 2) {
      const shortId = parts[1];
      
      const { data: allBooks } = await supabase
        .from('books')
        .select('id, stock, title');

      const matchedBook = allBooks?.find((b) => String(b.id).startsWith(shortId));
      if (matchedBook) {
        bookId = matchedBook.id;
      }
    }
  }

  // 3. Eksekusi pemotongan stok jika ID buku ditemukan
  if (bookId) {
    const { data: book, error: fetchError } = await supabase
      .from('books')
      .select('id, stock, title')
      .eq('id', bookId)
      .single();

    if (fetchError) {
      console.error('[SUPABASE ERROR]', fetchError.message);
    } else if (book) {
      const currentStock = Number(book.stock) || 0;
      
      if (currentStock > 0) {
        const newStock = currentStock - 1;

        const { error: updateError } = await supabase
          .from('books')
          .update({ stock: newStock })
          .eq('id', bookId);

        if (updateError) {
          console.error('[UPDATE STOK ERROR]', updateError.message);
        } else {
          console.log(`[SUCCESS] Stok buku "${book.title}" berhasil berkurang dari ${currentStock} menjadi ${newStock}`);
        }
      }
    }
  } else {
    console.log('[WARNING] ID Buku tidak ditemukan sama sekali dalam payload atau database');
  }

  // 4. Pengiriman Email Konfirmasi via Resend API
  const recipientEmail = payload.customer_details?.email;
  const recipientName = payload.customer_details?.first_name || 'Pembeli';

  if (recipientEmail) {
    try {
      await resend.emails.send({
        from: 'Toko Buku Digital <onboarding@resend.dev>',
        to: recipientEmail,
        subject: `Invoice & Konfirmasi Pembayaran - ${orderId}`,
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

            <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
              *Jika Anda membeli produk e-book, akses link download akan dikirimkan secara terpisah atau dapat diakses via sistem.
            </p>
          </div>
        `
      });
      console.log(`[EMAIL SUCCESS] Email invoice berhasil dikirim ke: ${recipientEmail}`);
    } catch (emailError: any) {
      console.error('[EMAIL ERROR]', emailError.message);
    }
  } else {
    console.log('[WARNING] Email customer tidak ditemukan dalam payload');
  }
}

// Fungsi eksekusi saat pembayaran GAGAL / EXPIRED
async function handlePaymentFailure(orderId: string, status: string) {
  console.log(`[FAILED] Transaksi ${orderId} berstatus: ${status}`);
}