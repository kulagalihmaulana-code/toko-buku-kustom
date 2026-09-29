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

  // Ambil ID Buku dari Order ID (Format: BOOK-[bookId]-[timestamp])
  const parts = orderId.split('-');
  if (parts.length >= 2) {
    const bookId = parts[1];

    // Ambil data buku saat ini untuk mengecek stok
    const { data: book, error: fetchError } = await supabase
      .from('books')
      .select('id, stock, format, title')
      .eq('id', bookId)
      .single();

    if (!fetchError && book) {
      // Jika buku memiliki stok fisik, kurangi stoknya 1
      if (typeof book.stock === 'number' && book.stock > 0) {
        await supabase
          .from('books')
          .update({ stock: book.stock - 1 })
          .eq('id', bookId);
        
        console.log(`[STOK] Stok buku "${book.title}" berhasil dikurangi. Stok sisa: ${book.stock - 1}`);
      }
    }
  }
}

// Fungsi eksekusi saat pembayaran GAGAL / EXPIRED
async function handlePaymentFailure(orderId: string, status: string) {
  console.log(`[FAILED] Transaksi ${orderId} berstatus: ${status}`);
}