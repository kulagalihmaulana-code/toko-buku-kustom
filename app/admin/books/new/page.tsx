'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

function NewBookForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromSubmission = searchParams.get('from_submission');

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [format, setFormat] = useState<'ebook' | 'physical' | 'both'>('ebook');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [isbn, setIsbn] = useState('');
  const [pageCount, setPageCount] = useState('');
  const [publicationYear, setPublicationYear] = useState(
    new Date().getFullYear().toString()
  );
  const [bookSize, setBookSize] = useState('');
  const [editor, setEditor] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [ebookFile, setEbookFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState('');

  // 3 kolom harga (untuk format "both")
  const [price, setPrice] = useState('');
  const [priceEbook, setPriceEbook] = useState('');
  const [pricePhysical, setPricePhysical] = useState('');
  const [priceBundle, setPriceBundle] = useState('');

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

      if (fromSubmission) {
        const { data: sub } = await supabase
          .from('submissions')
          .select('*')
          .eq('id', fromSubmission)
          .single();

        if (sub) {
          setTitle(sub.book_title || '');
          setAuthor(sub.author_name || '');
          setDescription(sub.book_synopsis || '');
          setCategory(sub.book_category || '');
          if (sub.estimated_pages) {
            setPageCount(String(sub.estimated_pages));
          }
          setSubmissionId(sub.id);
        }
      }

      setChecking(false);
    }

    checkAdmin();
  }, [router, fromSubmission]);

  function handlePriceChange(field: string, value: string) {
    if (field === 'price') setPrice(value);
    if (field === 'ebook') setPriceEbook(value);
    if (field === 'physical') setPricePhysical(value);
    if (field === 'bundle') setPriceBundle(value);
  }

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
        const sumSingle = Number(priceEbook) + Number(pricePhysical);
        if (Number(priceBundle) >= sumSingle) {
          if (
            !confirm(
              `Bundle (Rp ${Number(priceBundle).toLocaleString(
                'id-ID'
              )}) tidak lebih murah dari total terpisah (Rp ${sumSingle.toLocaleString(
                'id-ID'
              )}). Lanjutkan?`
            )
          ) {
            setLoading(false);
            return;
          }
        }
      } else {
        if (!price) {
          throw new Error('Isi harga buku');
        }
      }

      // Hitung semua nilai SEBELUM blok if (biar TS tidak menyempitkan tipe)
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

      let coverUrl = null;
      let filePath = null;

      // Upload cover
      if (coverFile) {
        setUploadProgress('Upload cover...');
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

      // Upload ebook
      if (ebookFile && (format === 'ebook' || format === 'both')) {
        setUploadProgress('Upload e-book PDF...');
        const pdfName = `${Date.now()}-${ebookFile.name}`;

        const { error: pdfError } = await supabase.storage
          .from('ebooks')
          .upload(pdfName, ebookFile, { upsert: true });

        if (pdfError) throw new Error('Gagal upload PDF: ' + pdfError.message);

        filePath = pdfName;
      }

      setUploadProgress('Menyimpan data buku...');
      const { error: insertError } = await supabase.from('books').insert({
        title,
        author,
        description,
        price: mainPrice,
        price_ebook: priceEbookValue,
        price_physical: pricePhysicalValue,
        price_bundle: priceBundleValue,
        format,
        stock: stockValue,
        cover_url: coverUrl,
        file_path: filePath,
        category: category || null,
        isbn: isbn || null,
        page_count: pageCount ? Number(pageCount) : null,
        publication_year: publicationYear ? Number(publicationYear) : null,
        book_size: bookSize || null,
        editor: editor || null,
        publisher_name: 'Mustawa Publishing',
        language: 'Indonesia',
      });

      if (insertError) throw new Error('Gagal simpan: ' + insertError.message);

      // Update status naskah
      if (submissionId) {
        setUploadProgress('Update status naskah...');
        await supabase
          .from('submissions')
          .update({ status: 'published', updated_at: new Date().toISOString() })
          .eq('id', submissionId);
      }

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

  const sumSingle = Number(priceEbook || 0) + Number(pricePhysical || 0);
  const bundleDiscount =
    sumSingle > 0 && Number(priceBundle) > 0
      ? sumSingle - Number(priceBundle)
      : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href={submissionId ? `/admin/naskah/${submissionId}` : '/admin/books'}
          className="text-sm text-slate-500 hover:text-slate-700 inline-flex items-center gap-1"
        >
          ← Kembali
        </Link>
        <h1 className="text-2xl font-bold text-slate-800 mt-2">
          {submissionId ? 'Ubah Naskah Jadi Buku' : 'Upload Buku Baru'}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {submissionId
            ? 'Data sudah terisi dari naskah. Lengkapi detail buku sebelum publikasi.'
            : 'Isi data buku di bawah ini. Tanda (*) wajib diisi.'}
        </p>
      </div>

      {submissionId && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <p className="text-xs text-emerald-800">
            ✅ <strong>Data terisi otomatis dari naskah.</strong> Status naskah
            akan otomatis berubah menjadi "Terbit" setelah buku disimpan.
          </p>
        </div>
      )}

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
                  placeholder="Nama editor"
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
                placeholder="Contoh: Fiksi, Pendidikan, Agama"
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
                placeholder="Contoh: 120"
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
                    onChange={(e) =>
                      handlePriceChange('ebook', e.target.value)
                    }
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
                    onChange={(e) =>
                      handlePriceChange('physical', e.target.value)
                    }
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
                    onChange={(e) =>
                      handlePriceChange('bundle', e.target.value)
                    }
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
                onChange={(e) => handlePriceChange('price', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="50000"
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
                placeholder="Contoh: 10"
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
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-700 file:font-medium hover:file:bg-emerald-100"
              />
              <p className="text-xs text-slate-400 mt-1">
                Format: JPG, PNG. Maks 2MB.
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
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-700 file:font-medium hover:file:bg-emerald-100"
                />
                <p className="text-xs text-slate-400 mt-1">
                  File ini otomatis terkirim ke pembeli setelah bayar.
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
            href={submissionId ? `/admin/naskah/${submissionId}` : '/admin/books'}
            className="flex-1 text-center bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-lg font-medium transition"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-medium transition disabled:opacity-50"
          >
            {loading
              ? 'Menyimpan...'
              : submissionId
              ? 'Terbitkan Buku'
              : 'Simpan Buku'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewBookPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-12">
          <p className="text-slate-500">Memuat form...</p>
        </div>
      }
    >
      <NewBookForm />
    </Suspense>
  );
}