import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import midtransClient from 'midtrans-client';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Setup Midtrans Snap
const snap = new midtransClient.Snap({
  isProduction: process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      bookId,
      customerName,
      customerEmail,
      shipping,
      formatType, // <-- dari CheckoutModal: 'ebook' | 'physical' | 'both'
    } = body;

    // Validasi
    if (!bookId || !customerName || !customerEmail) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      );
    }

    // Ambil data buku lengkap dari database
    const { data: book, error: bookError } = await supabaseAdmin
      .from('books')
      .select(
        'id, title, price, format, price_ebook, price_physical, price_bundle'
      )
      .eq('id', bookId)
      .single();

    if (bookError || !book) {
      return NextResponse.json(
        { error: 'Buku tidak ditemukan' },
        { status: 404 }
      );
    }

    // ============================================
    // TENTUKAN HARGA SESUAI FORMAT YANG DIPILIH
    // ============================================
    let serverSubtotal = 0;
    let chosenFormatType = formatType || book.format;
    let itemName = book.title;

    if (book.format === 'both') {
      // Pembeli memilih salah satu dari 3 opsi
      if (chosenFormatType === 'ebook') {
        serverSubtotal = Number(book.price_ebook || 0);
        itemName = `${book.title} (E-Book)`;
      } else if (chosenFormatType === 'physical') {
        serverSubtotal = Number(book.price_physical || 0);
        itemName = `${book.title} (Buku Fisik)`;
      } else {
        // bundle
        chosenFormatType = 'both';
        serverSubtotal = Number(book.price_bundle || 0);
        itemName = `${book.title} (Bundle E-Book + Fisik)`;
      }
    } else if (book.format === 'ebook') {
      chosenFormatType = 'ebook';
      serverSubtotal = Number(book.price);
      itemName = `${book.title} (E-Book)`;
    } else {
      // physical
      chosenFormatType = 'physical';
      serverSubtotal = Number(book.price);
      itemName = `${book.title} (Buku Fisik)`;
    }

    // ============================================
    // VALIDASI: Pastikan pembeli benar-benar bayar sesuai harga
    // ============================================
    if (serverSubtotal <= 0) {
      return NextResponse.json(
        { error: 'Harga buku tidak valid' },
        { status: 400 }
      );
    }

    // ============================================
    // HITUNG ONGKIR (HANYA kalau ada fisik)
    // ============================================
    const needsShipping =
      chosenFormatType === 'physical' || chosenFormatType === 'both';

    let serverShippingCost = 0;
    if (needsShipping && shipping?.cost) {
      serverShippingCost = Number(shipping.cost);
    }

    const serverTotal = serverSubtotal + serverShippingCost;

    // Generate Order ID unik
    const orderId = `BOOK-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()}`;

    // ============================================
    // SIMPAN ORDER
    // ============================================
    const { error: orderError } = await supabaseAdmin.from('orders').insert({
      order_id: orderId,
      customer_name: customerName,
      customer_email: customerEmail,
      total_amount: serverTotal,
      subtotal: serverSubtotal,
      status: 'pending',
      shipping_name: needsShipping ? shipping?.name || null : null,
      shipping_phone: needsShipping ? shipping?.phone || null : null,
      shipping_address: needsShipping ? shipping?.address || null : null,
      shipping_city: needsShipping ? shipping?.city || null : null,
      shipping_province: needsShipping ? shipping?.province || null : null,
      shipping_postal_code: needsShipping
        ? shipping?.postalCode || null
        : null,
      shipping_zone: needsShipping ? shipping?.zone || null : null,
      shipping_cost: serverShippingCost,
    });

    if (orderError) {
      console.error('Order insert error:', orderError);
      return NextResponse.json(
        { error: 'Gagal menyimpan order: ' + orderError.message },
        { status: 500 }
      );
    }

    // ============================================
    // SIMPAN ORDER ITEM (dengan format_type)
    // ============================================
    const { error: itemError } = await supabaseAdmin
      .from('order_items')
      .insert({
        order_id: orderId,
        book_id: book.id,
        quantity: 1,
        price: serverSubtotal,
        format_type: chosenFormatType,
      });

    if (itemError) {
      console.error('Order item error:', itemError);
      // Lanjut saja, tidak block transaksi
    }

    // ============================================
    // SUSUN ITEM DETAILS MIDTRANS
    // ============================================
    const itemDetails: any[] = [
      {
        id: book.id,
        price: serverSubtotal,
        quantity: 1,
        name: itemName.substring(0, 50),
      },
    ];

    if (serverShippingCost > 0) {
      itemDetails.push({
        id: 'SHIPPING',
        price: serverShippingCost,
        quantity: 1,
        name: 'Ongkos Kirim',
      });
    }

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: serverTotal,
      },
      item_details: itemDetails,
      customer_details: {
        first_name: customerName,
        email: customerEmail,
        phone: needsShipping ? shipping?.phone || undefined : undefined,
        shipping_address:
          needsShipping && shipping
            ? {
                first_name: shipping.name,
                phone: shipping.phone,
                address: shipping.address,
                city: shipping.city,
                postal_code: shipping.postalCode,
                country_code: 'IDN',
              }
            : undefined,
      },
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/orders/${orderId}`,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    return NextResponse.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      orderId,
    });
  } catch (error: any) {
    console.error('Tokenizer error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}