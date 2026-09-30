import { supabaseAdmin } from '@/lib/supabase-admin';
import BuyButton from './components/BuyButton'; // 1. Impor BuyButton di sini

export const dynamic = 'force-dynamic';

function formatRupiah(amount: number | string | null | undefined) {
  if (!amount) return '0';
  const num = typeof amount === 'number' ? amount : parseFloat(amount);
  if (isNaN(num)) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export default async function HomePage() {
  let books: any[] | null = [];
  let errorMessage: string | null = null;

  try {
    const supabase = supabaseAdmin;
    const { data, error } = await supabase.from('books').select('*');

    if (error) {
      errorMessage = error.message;
    } else {
      books = data;
    }
  } catch (err: any) {
    errorMessage = err?.message || 'Gagal terhubung ke database Supabase.';
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Toko Buku Digital
          </h1>
          <p className="text-gray-600">
            Koleksi buku fisik & e-book berkualitas
          </p>
        </header>

        {errorMessage ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg text-center">
            <p className="font-semibold text-lg mb-1">Terjadi Kendala Koneksi:</p>
            <p className="text-sm">{errorMessage}</p>
          </div>
        ) : (!books || books.length === 0) ? (
          <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
            Belum ada buku yang tersedia saat ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {books.map((book) => (
              <div
                key={book.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100 flex flex-col justify-between"
              >
                <div>
                  {book.cover_url && (
                    <img
                      src={book.cover_url}
                      alt={book.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-5">
                    <span className="inline-block text-xs font-semibold px-2 py-1 rounded bg-blue-50 text-blue-600 mb-2 uppercase">
                      {book.format}
                    </span>
                    <h2 className="text-xl font-bold text-gray-800 mb-1">
                      {book.title}
                    </h2>
                    <p className="text-sm text-gray-500 mb-3">
                      Penulis: {book.author}
                    </p>
                    {book.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {book.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-gray-50 mt-4 flex items-center justify-between gap-2">
                  <span className="text-lg font-bold text-green-600 whitespace-nowrap">
                    Rp {formatRupiah(book.price)}
                  </span>
                  
                  {/* 2. Ganti tombol lama dengan komponen BuyButton */}
                  <BuyButton
                    bookId={String(book.id)}
                    title={book.title}
                    price={Number(book.price)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}