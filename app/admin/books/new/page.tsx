'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function NewBookPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [format, setFormat] = useState<'ebook' | 'physical' | 'both'>('ebook');
  const [stock, setStock] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [ebookFile, setEbookFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState('');

  // Cek admin
  useEffect(() => {
    async function checkAdmin() {
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
    }

    checkAdmin();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);
    setUploadProgress('');

    try {
      let coverUrl = null;
      let filePath = null;

      // 1. Upload cover jika ada
      if (coverFile) {
        setUploadProgress('Upload cover...');
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

      // 2. Upload file ebook jika ada
      if (ebookFile && (format === 'ebook' || format === 'both')) {
        setUploadProgress('Upload e-book PDF...');
        const pdfName = `${Date.now()}-${ebookFile.name}`;

        const { error: pdfError } = await supabase.storage
          .from('ebooks')
          .upload(pdfName, ebookFile, { upsert: true });

        if (pdfError) throw new Error('Gagal upload PDF: ' + pdfError.message);

        filePath = pdfName;
      }

      // 3. Insert data buku ke tabel
      setUploadProgress('Menyimpan data buku...');
      const { error: insertError } = await supabase.from('books').insert({
        title,
        author,
        description,
        price: Number(price),
        format,
        stock: format === 'physical' || format === 'both' ? Number(stock) || 0 : null,
        cover_url: coverUrl,
        file_path: filePath,
      });

      if (insertError) throw new Error('Gagal simpan: ' + insertError.message);

      // 4. Sukses
      setMessage('✅ Buku berhasil ditambahkan!');
      setIsError(false);

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

  if (checking) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Memverifikasi akses...</p>
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
        <h1 className="text-2xl font-bold text-slate-800 mt-2">Upload Buku Baru</h1>
        <p className="text-slate-500 text-sm mt-1">
          Isi data buku di bawah ini. Tanda (*) wajib diisi.
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
            placeholder="Contoh: Panduan Bisnis Digital"
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
            placeholder="Nama penulis"
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
            placeholder="Deskripsi singkat buku"
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
              placeholder="50000"
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

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Gambar Cover
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium hover:file:bg-blue-100"
          />
          <p className="text-xs text-slate-400 mt-1">
            Format: JPG, PNG. Disarankan ukuran maksimal 2MB.
          </p>
        </div>

        {(format === 'ebook' || format === 'both') && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              File E-Book (PDF)
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setEbookFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium hover:file:bg-blue-100"
            />
            <p className="text-xs text-slate-400 mt-1">
              File ini akan otomatis terkirim ke pembeli setelah pembayaran lunas.
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
            {loading ? 'Menyimpan...' : 'Simpan Buku'}
          </button>
        </div>
      </form>
    </div>
  );
}