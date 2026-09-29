import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabaseClient } from '@/lib/supabase';

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

  // 2. Fallback: Jika item_details kosong, cari buku di Supabase yang ID-nya diawali oleh shortId dari orderId
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
      return;
    }

    if (book) {
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
}

// Fungsi eksekusi saat pembayaran GAGAL / EXPIRED
async function handlePaymentFailure(orderId: string, status: string) {
  console.log(`[FAILED] Transaksi ${orderId} berstatus: ${status}`);
}