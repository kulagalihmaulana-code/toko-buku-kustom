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
  const [editor, setEditor] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isbn, setIsbn] = useState('');
  const [pageCount, setPageCount] = useState('');
  const [publicationYear, setPublicationYear] = useState('');
  const [bookSize, setBookSize] = useState('');
  const [format, setFormat] = useState<'ebook' | 'physical' | 'both'>('ebook');
  const [stock, setStock] = useState('');

  // Harga
  const [price, setPrice] = useState('');
  const [priceEbook, setPriceEbook] = useState('');
  const [pricePhysical, setPricePhysical] = useState('');
  const [priceBundle, setPriceBundle] = useState('');

  // File
  const [currentCover, setCurrentCover] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [ebookFile, setEbookFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState('');

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

      // Isi form
      setTitle(book.title || '');
      setAuthor(book.author || '');
      setEditor(book.editor || '');
      setDescription(book.description || '');
      setCategory(book.category || '');
      setIsbn(book.isbn || '');
      setPageCount(book.page_count ? String(book.page_count) : '');
      setPublicationYear(
        book.publication_year ? String(book.publication_year) : ''
      );
      setBookSize(book.book_size || '');
      setFormat(book.format || 'ebook');
      setStock(
        book.stock !== null && book.stock !== undefined
          ? String(book.stock)
          : ''
      );

      setPrice(String(book.price || ''));
      setPriceEbook(book.price_ebook ? String(book.price_ebook) : '');
      setPricePhysical(
        book.price_physical ? String(book.price_physical) : ''
      );
      setPriceBundle(book.price_bundle ? String(book.price_bundle) : '');

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
      // Validasi harga
      if (format === 'both') {
        if (!priceEbook || !pricePhysical || !priceBundle) {
          throw new Error('Isi semua 3 harga (E-Book, Fisik, Bundle)');
        }
      } else {
        if (!price) {
          throw new Error('Isi harga buku');
        }
      }

      // Hitung nilai SEBELUM blok if (biar TS tidak menyempitkan tipe)
      const mainPrice =
        format === 'both' ? Number(priceEbook) : Number(price);
      const priceEbookValue = format === 'both' ? Number(priceEbook) : null;
      const pricePhysicalValue =
        format === 'both' ? Number(pricePhysical) : null;
      const priceBundleValue =
        format === 'both' ? Number(priceBundle) : null;
      const stockValue =
        format === 'physical' || format === 'both'
          ? Number(stock) || 0
          : null;

      let coverUrl = currentCover;
      let filePath = currentFile;

      // Upload cover baru
      if (coverFile) {
        setUploadProgress('Upload cover baru...');
        const coverExt = coverFile.name.split('.').pop();
        const coverName = `cover-${Date.now()}.${coverExt}`;

        const { error: coverError } = await supabase.storage
          .from('covers')
          .upload(coverName, coverFile, { upsert: true });

        if (coverError)
          throw new Error('Gagal upload cover: ' + coverError.message);

        const { data: coverData } = supabase.storage
          .from('covers')
          .getPublicUrl(coverName);

        coverUrl = coverData.publicUrl;
      }

      // Upload ebook baru
      if (ebookFile && (format === 'ebook' || format === 'both')) {
        setUploadProgress('Upload e-book PDF baru...');
        const pdfName = `${Date.now()}-${ebookFile.name}`;

        const { error: pdfError } = await supabase.storage
          .from('ebooks')
          .upload(pdfName, ebookFile, { upsert: true });

        if (pdfError) throw new Error('Gagal upload PDF: ' + pdfError.message);

        filePath = pdfName;
      }

      // Update
      setUploadProgress('Menyimpan perubahan...');
      const { error: updateError } = await supabase
        .from('books')
        .update({
          title,
          author,
          editor: editor || null,
          description,
          category: category || null,
          isbn: isbn || null,
          page_count: pageCount ? Number(pageCount) : null,
          publication_year: publicationYear
            ? Number(publicationYear)
            : null,
          book_size: bookSize || null,
          price: mainPrice,
          price_ebook: priceEbookValue,
          price_physical: pricePhysicalValue,
          price_bundle: priceBundleValue,
          format,
          stock: stockValue,
          cover_url: coverUrl,
          file_path: filePath,
        })
        .eq('id', bookId);

      if (updateError) throw new Error('Gagal update: ' + updateError.message);

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

  const sumSingle = Number(priceEbook || 0) + Number(pricePhysical || 0);
  const bundleDiscount =
    sumSingle > 0 && Number(priceBundle) > 0
      ? sumSingle - Number(priceBundle)
      : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
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

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-5"
      >
        {/* DATA DASAR */}
        <div>
          <h3 className="font-bold text-slate-800 text-sm mb-3 pb-2 border-b border-slate-100">
            📖 Data Dasar
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Judul Buku *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Penulis *
                </label>
                <input
                  type="text"
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Editor
                </label>
                <input
                  type="text"
                  value={editor}
                  onChange={(e) => setEditor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Kategori
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Deskripsi / Sinopsis
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* DETAIL PENERBITAN */}
        <div>
          <h3 className="font-bold text-slate-800 text-sm mb-3 pb-2 border-b border-slate-100">
            📚 Detail Penerbitan
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                ISBN
              </label>
              <input
                type="text"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="978-xxx-xxx-xxx-x"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Tahun Terbit
              </label>
              <input
                type="number"
                value={publicationYear}
                onChange={(e) => setPublicationYear(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Jumlah Halaman
              </label>
              <input
                type="number"
                value={pageCount}
                onChange={(e) => setPageCount(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Ukuran Buku
              </label>
              <input
                type="text"
                value={bookSize}
                onChange={(e) => setBookSize(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Contoh: 14x20 cm"
              />
            </div>
          </div>
        </div>

        {/* FORMAT */}
        <div>
          <h3 className="font-bold text-slate-800 text-sm mb-3 pb-2 border-b border-slate-100">
            🎯 Format Buku
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(
              [
                { value: 'ebook', label: 'E-Book Saja', icon: '📱' },
                { value: 'physical', label: 'Fisik Saja', icon: '📦' },
                { value: 'both', label: 'Keduanya', icon: '📚' },
              ] as const
            ).map((opt) => (
              <label
                key={opt.value}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition ${
                  format === opt.value
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="format"
                  value={opt.value}
                  checked={format === opt.value}
                  onChange={() => setFormat(opt.value)}
                  className="accent-emerald-600"
                />
                <p className="font-semibold text-slate-800 text-sm">
                  {opt.icon} {opt.label}
                </p>
              </label>
            ))}
          </div>
        </div>

        {/* HARGA */}
        <div>
          <h3 className="font-bold text-slate-800 text-sm mb-3 pb-2 border-b border-slate-100">
            💰 Harga
          </h3>

          {format === 'both' ? (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-800">
                  💡 <strong>Format "Keduanya"</strong> — isi 3 harga berbeda
                  untuk pembeli yang mau beli terpisah atau bundling.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    📱 Harga E-Book *
                  </label>
                  <input
                    type="number"
                    required={format === 'both'}
                    min="0"
                    value={priceEbook}
                    onChange={(e) => setPriceEbook(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="50000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    📦 Harga Fisik *
                  </label>
                  <input
                    type="number"
                    required={format === 'both'}
                    min="0"
                    value={pricePhysical}
                    onChange={(e) => setPricePhysical(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="75000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    📚 Harga Bundle *
                  </label>
                  <input
                    type="number"
                    required={format === 'both'}
                    min="0"
                    value={priceBundle}
                    onChange={(e) => setPriceBundle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="100000"
                  />
                </div>
              </div>

              {sumSingle > 0 && Number(priceBundle) > 0 && (
                <div
                  className={`p-3 rounded-lg border ${
                    bundleDiscount > 0
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <p
                    className={`text-xs ${
                      bundleDiscount > 0
                        ? 'text-emerald-800'
                        : 'text-red-800'
                    }`}
                  >
                    {bundleDiscount > 0 ? (
                      <>
                        💰 Pembeli hemat{' '}
                        <strong>
                          Rp {bundleDiscount.toLocaleString('id-ID')}
                        </strong>{' '}
                        ({Math.round((bundleDiscount / sumSingle) * 100)}%) jika
                        ambil bundle.
                      </>
                    ) : (
                      <>
                        ⚠️ Bundle lebih mahal dari beli terpisah. Turunkan harga
                        bundle atau naikkan harga satuan.
                      </>
                    )}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-xs">
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Harga (Rp) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          {(format === 'physical' || format === 'both') && (
            <div className="mt-4 max-w-xs">
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Stok Buku Fisik
              </label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}
        </div>

        {/* FILE */}
        <div>
          <h3 className="font-bold text-slate-800 text-sm mb-3 pb-2 border-b border-slate-100">
            📎 File
          </h3>

          <div className="space-y-4">
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
                    <p className="text-slate-400">
                      Pilih file baru untuk mengganti
                    </p>
                  </div>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-700 file:font-medium hover:file:bg-emerald-100"
              />
              {coverFile && (
                <p className="text-xs text-emerald-600 mt-1">
                  ✓ File baru dipilih: {coverFile.name}
                </p>
              )}
            </div>

            {(format === 'ebook' || format === 'both') && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  File E-Book (PDF)
                </label>

                {currentFile && !ebookFile && (
                  <div className="mb-2 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                    <p className="font-semibold text-slate-700">
                      File PDF saat ini
                    </p>
                    <p className="text-slate-500 break-all mt-0.5">
                      {currentFile}
                    </p>
                  </div>
                )}

                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setEbookFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-700 file:font-medium hover:file:bg-emerald-100"
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
          </div>
        </div>

        {uploadProgress && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
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
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-medium transition disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </div>
  );
}