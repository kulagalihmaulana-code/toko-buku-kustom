import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Inisialisasi Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { id, title, price, customerDetails } = await request.json();

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      return NextResponse.json({ error: 'Server Key Midtrans belum dikonfigurasi' }, { status: 500 });
    }

    // Format order_id pendek untuk Midtrans (Maks 50 karakter)
    const shortId = String(id).slice(0, 8);
    const orderId = `BOOK-${shortId}-${Date.now()}`;

    // A. Simpan Transaksi Pending ke Database Supabase
    const { error: insertOrderError } = await supabaseAdmin.from('orders').insert({
      order_id: orderId,
      customer_name: customerDetails?.first_name || 'Pembeli',
      customer_email: customerDetails?.email || 'pembeli@example.com',
      total_amount: Number(price),
      status: 'pending',
    });

    if (insertOrderError) {
      console.error('[ERROR ORDERS]:', insertOrderError.message, '| Details:', insertOrderError.details, '| Hint:', insertOrderError.hint);
    } else {
      // Simpan item yang dibeli
      const { error: insertItemError } = await supabaseAdmin.from('order_items').insert({
        order_id: orderId,
        book_id: id,
        quantity: 1,
        price: Number(price),
      });

      if (insertItemError) {
        console.error('[ERROR ORDER ITEMS]:', insertItemError.message, '| Details:', insertItemError.details, '| Hint:', insertItemError.hint);
      } else {
        console.log('[SUCCESS]: Order dan Order Item berhasil dicatat di Supabase!');
      }
    }

    // B. Minta Snap Token dari Midtrans
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: Number(price),
      },
      item_details: [
        {
          id: String(id),
          price: Number(price),
          quantity: 1,
          name: title ? String(title).slice(0, 50) : 'Buku',
        },
      ],
      customer_details: {
        first_name: customerDetails?.first_name || 'Pembeli',
        email: customerDetails?.email || 'pembeli@example.com',
      },
    };

    const authString = Buffer.from(`${serverKey}:`).toString('base64');
    const response = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: `Basic ${authString}`,
      },
      body: JSON.stringify(parameter),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error_messages || 'Gagal membuat transaksi' }, { status: response.status });
    }

    return NextResponse.json({ token: data.token, orderId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}