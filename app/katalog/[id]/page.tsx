import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import type { Metadata } from 'next';
import BuyButton from '@/app/components/BuyButton';

export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function formatRupiah(amount: number | string | null | undefined) {
  if (!amount) return '0';
  const num = typeof amount === 'number' ? amount : parseFloat(amount);
  if (isNaN(num)) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}): Promise<Metadata> {
  const resolvedParams = await params;
  const { data: book } = await supabaseAdmin
    .from('books')
    .select('title, author, description, cover_url')
    .eq('id', resolvedParams.id)
    .single();

  if (!book) {
    return { title: 'Buku tidak ditemukan | Mustawa Publishing' };
  }

  return {
    title: `${book.title} — ${book.author} | Mustawa Publishing`,
    description:
      book.description?.slice(0, 160) ||
      `Beli buku ${book.title} karya ${book.author} di Mustawa Publishing.`,
    openGraph: {
      title: book.title,
      description: book.description || '',
      images: book.cover_url ? [book.cover_url] : [],
    },
  };
}

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = await params;

  const { data: book } = await supabaseAdmin
    .from('books')
    .select('*')
    .eq('id', resolvedParams.id)
    .single();

  if (!book) {
    return notFound();
  }

  const formatLabel =
    book.format === 'ebook'
      ? 'E-Book (PDF)'
      : book.format === 'physical'
      ? 'Buku Cetak'
      : 'Buku Cetak + E-Book';

  const isAvailable =
    book.format === 'ebook' ||
    book.format === 'both' ||
    (book.stock !== null && book.stock > 0);

  const hasPhysical = book.format === 'physical' || book.format === 'both';

  // Hitung hemat bundle
  const bundleSave =
    book.format === 'both' && book.price_ebook && book.price_physical && book.price_bundle
      ? Number(book.price_ebook) + Number(book.price_physical) - Number(book.price_bundle)
      : 0;

  // Metadata wajib untuk Perpusnas
  const metadata = [
    { label: 'ISBN', value: book.isbn || '—' },
    { label: 'Penulis', value: book.author || '—' },
    { label: 'Editor', value: book.editor || '—' },
    { label: 'Penerjemah', value: book.translator || '—' },
    { label: 'Penerbit', value: book.publisher_name || 'Mustawa Publishing' },
    { label: 'Tahun Terbit', value: book.publication_year || '—' },
    { label: 'Ukuran', value: book.book_size || '—' },
    {
      label: 'Jumlah Halaman',
      value: book.page_count ? `${book.page_count} hlm` : '—',
    },
    { label: 'Jenis Kertas', value: book.paper_type || '—' },
    { label: 'Edisi', value: book.edition || 'Cetakan 1' },
    { label: 'Bahasa', value: book.language || 'Indonesia' },
    { label: 'Format', value: formatLabel },
    { label: 'Kategori', value: book.category || '—' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-emerald-600">
            Beranda
          </Link>
          <span className="mx-2">/</span>
          <Link href="/katalog" className="hover:text-emerald-600">
            Katalog
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700">{book.title}</span>
        </nav>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 sm:p-10">
            {/* Cover */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="aspect-[3/4] bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-md">
                  {book.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={book.cover_url}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-8xl text-slate-300">
                      📖
                    </div>
                  )}
                </div>

                {/* Badge format */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-block px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 uppercase">
                    {formatLabel}
                  </span>
                  {book.category && (
                    <span className="inline-block px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700">
                      {book.category}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Detail */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">
                  {book.title}
                </h1>
                {book.subtitle && (
                  <p className="text-lg text-slate-500 mb-2">{book.subtitle}</p>
                )}
                <p className="text-slate-600">
                  oleh{' '}
                  <span className="font-semibold text-slate-800">
                    {book.author}
                  </span>
                </p>
              </div>

              {/* Harga & Beli */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 mb-8">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    {book.format === 'both' ? (
                      <>
                        <p className="text-xs font-semibold text-emerald-700 uppercase mb-2">
                          Harga
                        </p>
                        <div className="space-y-1.5">
                          <div className="flex items-baseline gap-2">
                            <span className="text-base">📱</span>
                            <span className="text-base font-bold text-emerald-700">
                              Rp {formatRupiah(book.price_ebook || 0)}
                            </span>
                            <span className="text-xs text-slate-500">
                              E-Book
                            </span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-base">📦</span>
                            <span className="text-base font-bold text-emerald-700">
                              Rp {formatRupiah(book.price_physical || 0)}
                            </span>
                            <span className="text-xs text-slate-500">
                              Buku Fisik
                            </span>
                          </div>
                          <div className="flex items-baseline gap-2 pt-2 border-t border-emerald-200 mt-1">
                            <span className="text-base">📚</span>
                            <span className="text-xl font-bold text-emerald-700">
                              Rp {formatRupiah(book.price_bundle || 0)}
                            </span>
                            <span className="text-xs text-emerald-600 font-semibold">
                              Bundle
                            </span>
                          </div>
                          {bundleSave > 0 && (
                            <p className="text-xs text-amber-700 bg-amber-100 inline-block px-2 py-0.5 rounded-full font-semibold mt-1">
                              ⭐ Hemat {formatRupiah(bundleSave)} dengan bundle
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-xs font-semibold text-emerald-700 uppercase mb-1">
                          Harga
                        </p>
                        <p className="text-3xl sm:text-4xl font-bold text-emerald-700">
                          Rp {formatRupiah(book.price)}
                        </p>
                        {hasPhysical && (
                          <p className="text-xs text-emerald-600 mt-1">
                            Belum termasuk ongkos kirim
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {isAvailable ? (
                    <div className="min-w-[240px] w-full sm:w-auto">
                      <BuyButton
                        bookId={book.id}
                        title={book.title}
                        price={Number(book.price)}
                        author={book.author}
                        format={book.format || 'ebook'}
                        priceEbook={
                          book.price_ebook ? Number(book.price_ebook) : null
                        }
                        pricePhysical={
                          book.price_physical
                            ? Number(book.price_physical)
                            : null
                        }
                        priceBundle={
                          book.price_bundle
                            ? Number(book.price_bundle)
                            : null
                        }
                      />
                    </div>
                  ) : (
                    <span className="inline-block bg-slate-200 text-slate-500 font-bold px-8 py-3.5 rounded-xl whitespace-nowrap">
                      Stok Habis
                    </span>
                  )}
                </div>

                {/* Info stok fisik / ebook */}
                {hasPhysical ? (
                  <div className="mt-4 pt-4 border-t border-emerald-200 space-y-1">
                    <p className="text-xs text-emerald-700">
                      {book.stock && book.stock > 0
                        ? `✓ Stok tersedia: ${book.stock} buku`
                        : '⚠️ Stok sedang habis'}
                    </p>
                    <p className="text-xs text-emerald-600">
                      📦 Dikirim dari Majalengka, Jawa Barat
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-emerald-700 mt-3">
                    ✓ E-book tersedia — download langsung setelah pembayaran
                  </p>
                )}
              </div>

              {/* Metadata Buku (WAJIB untuk Perpusnas) */}
              <div className="mb-8">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  📋 Detail Buku
                </h2>
                <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-slate-200">
                      {metadata.map((item, i) => (
                        <tr key={i}>
                          <td className="px-4 py-3 text-slate-500 font-medium w-1/3">
                            {item.label}
                          </td>
                          <td className="px-4 py-3 text-slate-800 font-semibold">
                            {item.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sinopsis */}
              {book.description && (
                <div>
                  <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    📖 Sinopsis
                  </h2>
                  <div className="text-slate-700 leading-relaxed whitespace-pre-line">
                    {book.description}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Kembali */}
        <div className="mt-8">
          <Link
            href="/katalog"
            className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            ← Kembali ke Katalog
          </Link>
        </div>
      </div>
    </div>
  );
}