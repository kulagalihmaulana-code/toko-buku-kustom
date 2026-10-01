'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function EditBookPage() {
  const router = useRouter();
  const params = useParams();
  const bookId = params.id as string;

  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [format, setFormat] = useState<'ebook' | 'physical' | 'both'>('ebook');
  const [stock, setStock] = useState('');
  const [currentCover, setCurrentCover] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [ebookFile, setEbookFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState('');

  // Cek admin + fetch data buku
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

      setChecking(false);

      // Ambil data buku
      const { data: book, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', bookId)
        .single();

      if (error || !book) {
        alert('Buku tidak ditemukan');
        router.push('/admin/books');
        return;
      }

      // Isi form dengan data existing
      setTitle(book.title || '');
      setAuthor(book.author || '');
      setDescription(book.description || '');
      setPrice(String(book.price || ''));
      setFormat(book.format || 'ebook');
      setStock(book.stock !== null && book.stock !== undefined ? String(book.stock) : '');
      setCurrentCover(book.cover_url || null);
      setCurrentFile(book.file_path || null);
      setFetching(false);
    }

    checkAndFetch();
  }, [router, bookId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);
    setUploadProgress('');

    try {
      let coverUrl = currentCover;
      let filePath = currentFile;

      // 1. Upload cover baru jika ada
      if (coverFile) {
        setUploadProgress('Upload cover baru...');
        const coverExt = coverFile.name.split('.').pop();
        const coverName = `cover-${Date.now()}.${coverExt}`;

        const { error: coverError } = await supabase.storage
          .from('covers')
          .upload(coverName, coverFile, { upsert: true });

        if (coverError) throw new Error('Gagal upload cover: ' + coverError.message);

        const { data: coverData } = supabase.storage
          .from('covers')
          .getPublicUrl(coverName);

        coverUrl = coverData.publicUrl;
      }

      // 2. Upload file ebook baru jika ada
      if (ebookFile && (format === 'ebook' || format === 'both')) {
        setUploadProgress('Upload e-book PDF baru...');
        const pdfName = `${Date.now()}-${ebookFile.name}`;

        const { error: pdfError } = await supabase.storage
          .from('ebooks')
          .upload(pdfName, ebookFile, { upsert: true });

        if (pdfError) throw new Error('Gagal upload PDF: ' + pdfError.message);

        filePath = pdfName;
      }

      // 3. Update data buku
      setUploadProgress('Menyimpan perubahan...');
      const { error: updateError } = await supabase
        .from('books')
        .update({
          title,
          author,
          description,
          price: Number(price),
          format,
          stock:
            format === 'physical' || format === 'both'
              ? Number(stock) || 0
              : null,
          cover_url: coverUrl,
          file_path: filePath,
        })
        .eq('id', bookId);

      if (updateError) throw new Error('Gagal update: ' + updateError.message);

      // 4. Sukses
      setMessage('✅ Buku berhasil diupdate!');
      setIsError(false);
      setCurrentCover(coverUrl);
      setCurrentFile(filePath);
      setCoverFile(null);
      setEbookFile(null);

      setTimeout(() => {
        router.push('/admin/books');
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setMessage('❌ ' + err.message);
      setIsError(true);
      setLoading(false);
      setUploadProgress('');
    }
  }

  if (checking || fetching) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Memuat data buku...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/books"
          className="text-sm text-slate-500 hover:text-slate-700 inline-flex items-center gap-1"
        >
          ← Kembali ke Daftar Buku
        </Link>
        <h1 className="text-2xl font-bold text-slate-800 mt-2">Edit Buku</h1>
        <p className="text-slate-500 text-sm mt-1">
          Update data buku. Kosongkan file jika tidak ingin mengganti.
        </p>
      </div>

      {/* Pesan */}
      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            isError
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}
        >
          {message}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-5"
      >
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Judul Buku *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Penulis *
          </label>
          <input
            type="text"
            required
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Deskripsi
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Harga (Rp) *
            </label>
            <input
              type="number"
              required
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Format *
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ebook">E-Book (PDF)</option>
              <option value="physical">Buku Fisik</option>
              <option value="both">E-Book + Buku Fisik</option>
            </select>
          </div>
        </div>

        {(format === 'physical' || format === 'both') && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Stok Buku Fisik
            </label>
            <input
              type="number"
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contoh: 10"
            />
          </div>
        )}

        {/* Cover */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Gambar Cover
          </label>

          {currentCover && !coverFile && (
            <div className="mb-2 flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentCover}
                alt="Cover saat ini"
                className="w-16 h-20 object-cover rounded border border-slate-200"
              />
              <div className="text-xs text-slate-600">
                <p className="font-semibold">Cover saat ini</p>
                <p className="text-slate-400">Pilih file baru untuk mengganti</p>
              </div>
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium hover:file:bg-blue-100"
          />
          {coverFile && (
            <p className="text-xs text-emerald-600 mt-1">
              ✓ File baru dipilih: {coverFile.name}
            </p>
          )}
        </div>

        {/* Ebook PDF */}
        {(format === 'ebook' || format === 'both') && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              File E-Book (PDF)
            </label>

            {currentFile && !ebookFile && (
              <div className="mb-2 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <p className="font-semibold text-slate-700">File PDF saat ini</p>
                <p className="text-slate-500 break-all mt-0.5">{currentFile}</p>
              </div>
            )}

            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setEbookFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium hover:file:bg-blue-100"
            />
            {ebookFile && (
              <p className="text-xs text-emerald-600 mt-1">
                ✓ File baru dipilih: {ebookFile.name}
              </p>
            )}
            <p className="text-xs text-slate-400 mt-1">
              Biarkan kosong jika tidak ingin mengganti PDF.
            </p>
          </div>
        )}

        {uploadProgress && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
            ⏳ {uploadProgress}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Link
            href="/admin/books"
            className="flex-1 text-center bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-lg font-medium transition"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </div>
  );
}