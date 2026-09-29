import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { id, title, price } = await request.json();

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      return NextResponse.json({ error: 'Server Key Midtrans belum dikonfigurasi' }, { status: 500 });
    }

    // Mengambil 8 karakter pertama dari ID agar aman dari batas 50 karakter Midtrans
    const shortId = String(id).slice(0, 8);
    const orderId = `BOOK-${shortId}-${Date.now()}`;

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: Number(price),
      },
      item_details: [
        {
          id: String(id).slice(0, 50),
          price: Number(price),
          quantity: 1,
          name: title.slice(0, 50),
        },
      ],
      customer_details: {
        first_name: 'Pembeli',
        email: 'pembeli@example.com',
      },
    };

    const authString = Buffer.from(`${serverKey}:`).toString('base64');
    const response = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${authString}`,
      },
      body: JSON.stringify(parameter),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error_messages || 'Gagal membuat transaksi' }, { status: response.status });
    }

    return NextResponse.json({ token: data.token });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}