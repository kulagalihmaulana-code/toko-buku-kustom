import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import OrderSignupBanner from '@/app/components/OrderSignupBanner';

// Inisialisasi Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function OrderPortalPage({
  params,
}: {
  params: Promise<{ orderId: string }> | { orderId: string };
}) {
  const resolvedParams = await params;
  const { orderId } = resolvedParams;

  // 1. Ambil data transaksi dari tabel 'orders'
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('order_id', orderId)
    .single();

  if (orderError || !order) {
    return notFound();
  }

  // 2. Ambil detail item buku yang dibeli
  const { data: orderItems } = await supabaseAdmin
    .from('order_items')
    .select('*, books(*)')
    .eq('order_id', orderId);

  const item = orderItems?.[0];
  const book = item?.books;

  // 3. Buat Signed URL jika pembayaran LUNAS ('paid') dan produk memiliki e-book
  let downloadUrl = '';
  if (
    order.status === 'paid' &&
    book?.file_path &&
    (book.format === 'ebook' || book.format === 'both')
  ) {
    const { data: signedData } = await supabaseAdmin.storage
      .from('ebooks')
      .createSignedUrl(book.file_path, 86400); // Masa berlaku 24 jam

    if (signedData) {
      downloadUrl = signedData.signedUrl;
    }
  }

  const isPaid = order.status === 'paid';

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header Status Transaksi */}
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                ID Pesanan
              </p>
              <h1 className="text-lg font-bold text-slate-800">
                {order.order_id}
              </h1>
            </div>
            <div>
              <span
                className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                  isPaid
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {isPaid ? '✓ Pembayaran Lunas' : 'Menunggu Pembayaran'}
              </span>
            </div>
          </div>

          {/* Rincian Produk */}
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              Pembeli:{' '}
              <span className="font-medium text-slate-700">
                {order.customer_name}
              </span>{' '}
              ({order.customer_email})
            </p>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex justify-between items-center">
              <div>
                <p className="font-semibold text-slate-800">
                  {book?.title || 'Buku Digital / Fisik'}
                </p>
                <p className="text-xs text-slate-500 uppercase mt-0.5">
                  Format: {book?.format || 'ebook'}
                </p>
              </div>
              <p className="text-base font-bold text-emerald-600">
                Rp {Number(order.total_amount).toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          {/* Akses E-Book (Jika Lunas & Ada Ebook) */}
          {isPaid && downloadUrl && (
            <div className="mt-6 p-5 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
              <h3 className="font-bold text-emerald-900 text-base mb-1">
                Akses File E-Book Anda
              </h3>
              <p className="text-xs text-emerald-700 mb-4">
                Klik tombol di bawah ini untuk mengunduh e-book Anda.
              </p>
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-sm text-sm"
              >
                📥 Download E-Book (PDF)
              </a>
            </div>
          )}

          {/* Akses Fisik (Jika Ada Produk Fisik) */}
          {isPaid &&
            (book?.format === 'physical' || book?.format === 'both') && (
              <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <h4 className="font-semibold text-emerald-900 text-sm">
                  📦 Pengiriman Buku Fisik
                </h4>
                <p className="text-xs text-emerald-700 mt-1">
                  Pesanan Anda sedang disiapkan oleh tim logistik. Nomor resi
                  pengiriman akan dikirimkan via email.
                </p>
              </div>
            )}
        </div>

        {/* BENTENG MODEL C (HYBRID): Opsi opsional buat akun */}
        <OrderSignupBanner customerEmail={order.customer_email} />
      </div>
    </div>
  );
}