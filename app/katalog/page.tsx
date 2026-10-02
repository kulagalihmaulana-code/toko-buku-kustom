import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Katalog Buku | Mustawa Publishing',
  description:
    'Jelajahi koleksi buku berkualitas dari Mustawa Publishing — e-book, buku cetak, dan paket lengkap.',
};

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

export default async function KatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; format?: string }> | { q?: string; format?: string };
}) {
  const params = await searchParams;
  const searchQuery = params.q || '';
  const formatFilter = params.format || '';

  let books: any[] | null = null;

  try {
    let query = supabaseAdmin
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });

    if (formatFilter && formatFilter !== 'all') {
      if (formatFilter === 'ebook') {
        query = query.in('format', ['ebook', 'both']);
      } else if (formatFilter === 'physical') {
        query = query.in('format', ['physical', 'both']);
      }
    }

    const { data } = await query;
    books = data;

    // Filter pencarian di client (karena Supabase ilike case-sensitive)
    if (searchQuery && books) {
      const q = searchQuery.toLowerCase();
      books = books.filter(
        (b) =>
          b.title?.toLowerCase().includes(q) ||
          b.author?.toLowerCase().includes(q) ||
          b.description?.toLowerCase().includes(q)
      );
    }
  } catch (err) {
    console.error(err);
  }

  const filterOptions = [
    { value: 'all', label: 'Semua' },
    { value: 'ebook', label: '📱 E-Book' },
    { value: 'physical', label: '📖 Cetak' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-emerald-700 to-teal-700 text-white py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-xs font-medium mb-4">
            📚 Katalog Mustawa Publishing
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Koleksi Buku Kami
          </h1>
          <p className="text-emerald-100 max-w-2xl">
            Jelajahi karya-karya berkualitas dari penulis-penulis pilihan
            Mustawa Publishing.
          </p>
        </div>
      </section>

      {/* Filter & Search */}
      <section className="max-w-6xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-5">
          <form method="get" className="space-y-4">
            {/* Search bar */}
            <div className="flex gap-2">
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
                placeholder="Cari judul buku, penulis, atau kata kunci..."
                className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition"
              >
                Cari
              </button>
            </div>

            {/* Filter format */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-semibold text-slate-500 uppercase mr-1">
                Filter:
              </span>
              {filterOptions.map((opt) => {
                const isActive =
                  (opt.value === 'all' && !formatFilter) ||
                  formatFilter === opt.value;
                return (
                  <Link
                    key={opt.value}
                    href={`/katalog?${new URLSearchParams({
                      ...(searchQuery && { q: searchQuery }),
                      ...(opt.value !== 'all' && { format: opt.value }),
                    }).toString()}`}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {opt.label}
                  </Link>
                );
              })}
            </div>
          </form>
        </div>
      </section>

      {/* Grid Buku */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        {/* Info jumlah */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-slate-600">
            Menampilkan{' '}
            <span className="font-bold text-slate-800">{books?.length || 0}</span>{' '}
            buku
            {searchQuery && (
              <>
                {' '}
                untuk pencarian{' '}
                <span className="font-medium">"{searchQuery}"</span>
              </>
            )}
          </p>
          {(searchQuery || formatFilter) && (
            <Link
              href="/katalog"
              className="text-xs text-emerald-600 hover:underline font-medium"
            >
              ✕ Reset filter
            </Link>
          )}
        </div>

        {books && books.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {books.map((book) => (
              <Link
                key={book.id}
                href={`/katalog/${book.id}`}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition flex flex-col"
              >
                <div className="aspect-[3/4] bg-slate-100 overflow-hidden relative">
                  {book.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={book.cover_url}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl text-slate-300">
                      📖
                    </div>
                  )}

                  {/* Badge format */}
                  <div className="absolute top-3 left-3">
                    <span className="inline-block px-2.5 py-1 text-xs font-bold rounded-lg bg-white/95 backdrop-blur-sm text-emerald-700 uppercase shadow-sm">
                      {book.format === 'ebook'
                        ? 'E-Book'
                        : book.format === 'physical'
                        ? 'Cetak'
                        : 'Cetak + E-Book'}
                    </span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-slate-800 mb-1 line-clamp-2 group-hover:text-emerald-600 transition text-sm sm:text-base">
                    {book.title}
                  </h3>
                  <p className="text-xs text-slate-500 mb-3 line-clamp-1">
                    oleh {book.author}
                  </p>
                  <p className="mt-auto font-bold text-emerald-600 text-base">
                    Rp {formatRupiah(book.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <p className="text-5xl mb-4">🔍</p>
            <h3 className="font-bold text-slate-700 text-lg mb-2">
              Tidak ada buku ditemukan
            </h3>
            <p className="text-sm text-slate-500 mb-5">
              {searchQuery
                ? `Coba kata kunci lain atau reset filter.`
                : 'Belum ada buku yang dipublikasikan.'}
            </p>
            <Link
              href="/katalog"
              className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition"
            >
              Lihat Semua Buku
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}