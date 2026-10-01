'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type Book = {
  id: string;
  title: string;
  author: string;
  price: number;
  format: string;
  stock: number | null;
  file_path: string | null;
  cover_url: string | null;
  created_at: string;
};

export default function AdminBooksPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function checkAndFetch() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        alert('Anda bukan admin');
        router.push('/');
        return;
      }

      const { data } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      setBooks(data || []);
      setLoading(false);
    }

    checkAndFetch();
  }, [router]);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Yakin hapus buku "${title}"? Tindakan ini tidak bisa dibatalkan.`)) {
      return;
    }

    const { error } = await supabase.from('books').delete().eq('id', id);

    if (error) {
      alert('Gagal hapus: ' + error.message);
      return;
    }

    setBooks(books.filter((b) => b.id !== id));
    alert('Buku berhasil dihapus');
  }

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Memuat daftar buku...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Daftar Buku</h1>
          <p className="text-slate-500 text-sm mt-1">
            Total {books.length} buku di toko Anda
          </p>
        </div>
        <Link
          href="/admin/books/new"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition"
        >
          ➕ Upload Buku Baru
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <input
          type="text"
          placeholder="Cari judul atau penulis..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      {/* Tabel Buku */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {filteredBooks.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-400 text-sm">
              {search ? 'Tidak ada buku yang cocok' : 'Belum ada buku'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600 w-12">
                    No
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">
                    Judul
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">
                    Penulis
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">
                    Format
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">
                    Harga
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600">
                    Stok
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBooks.map((book, index) => (
                  <tr key={book.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-center text-slate-500 font-medium">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{book.title}</p>
                      {book.file_path && (
                        <p className="text-xs text-emerald-600 mt-0.5">
                          ✓ File PDF ada
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{book.author}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-blue-50 text-blue-700 uppercase">
                        {book.format}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-800">
                      Rp {Number(book.price).toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600">
                      {book.stock ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/books/edit/${book.id}`}
                          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded transition"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(book.id, book.title)}
                          className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded transition"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}