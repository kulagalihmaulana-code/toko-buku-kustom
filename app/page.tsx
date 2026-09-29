import { supabase } from '@/lib/supabase';

export const revalidate = 0; // Memastikan data selalu segar/terbaru dari database

export default async function HomePage() {
  // Ambil data buku dari tabel 'books'
  const { data: books, error } = await supabase
    .from('books')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching books:', error);
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

        {/* Jika belum ada buku / terjadi error */}
        {(!books || books.length === 0) ? (
          <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
            Belum ada buku yang tersedia saat ini.
          </div>
        ) : (
          /* Grid Kartu Buku */
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
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {book.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-gray-50 mt-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-green-600">
                    Rp {Number(book.price).toLocaleString('id-ID')}
                  </span>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    Beli Buku
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
export const dynamic = 'force-dynamic';