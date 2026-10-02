'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function KirimNaskahPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submissionCode, setSubmissionCode] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  // Form state
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [authorPhone, setAuthorPhone] = useState('');
  const [authorBio, setAuthorBio] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [bookCategory, setBookCategory] = useState('');
  const [bookSynopsis, setBookSynopsis] = useState('');
  const [estimatedPages, setEstimatedPages] = useState('');
  const [manuscriptFile, setManuscriptFile] = useState<File | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);
    setUploadProgress('');

    try {
      if (!manuscriptFile) {
        throw new Error('File naskah wajib diunggah');
      }

      const maxSize = 20 * 1024 * 1024;
      if (manuscriptFile.size > maxSize) {
        throw new Error('Ukuran file maksimal 20 MB');
      }

      const allowedExt = ['.doc', '.docx', '.pdf'];
      const fileExt = '.' + manuscriptFile.name.split('.').pop()?.toLowerCase();
      if (!allowedExt.includes(fileExt)) {
        throw new Error('Format file harus .doc, .docx, atau .pdf');
      }

      setUploadProgress('Mengunggah naskah...');
      const timestamp = Date.now();
      const safeName = manuscriptFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${timestamp}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from('manuscripts')
        .upload(fileName, manuscriptFile, {
          contentType: manuscriptFile.type,
          upsert: false,
        });

      if (uploadError) {
        throw new Error('Gagal upload naskah: ' + uploadError.message);
      }

      setUploadProgress('Menyimpan data...');
      const { data: submission, error: insertError } = await supabase
        .from('submissions')
        .insert({
          author_name: authorName,
          author_email: authorEmail,
          author_phone: authorPhone,
          author_bio: authorBio,
          book_title: bookTitle,
          book_category: bookCategory,
          book_synopsis: bookSynopsis,
          estimated_pages: estimatedPages ? Number(estimatedPages) : null,
          manuscript_url: fileName,
          manuscript_filename: manuscriptFile.name,
        })
        .select('submission_code')
        .single();

      if (insertError) {
        throw new Error('Gagal menyimpan data: ' + insertError.message);
      }

      setSubmissionCode(submission.submission_code);
      setSuccess(true);
      setUploadProgress('');
    } catch (err: any) {
      setMessage('❌ ' + err.message);
      setIsError(true);
      setUploadProgress('');
    } finally {
      setLoading(false);
    }
  }

  // ============================================
  // TAMPILAN SUKSES
  // ============================================
  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-4xl mb-5">
            ✅
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-3">
            Naskah Berhasil Dikirim!
          </h1>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            Terima kasih telah mempercayakan naskah Anda kepada Mustawa
            Publishing. Tim editor kami akan meninjau naskah dalam 3-7 hari
            kerja.
          </p>

          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-5 mb-6">
            <p className="text-xs font-semibold text-emerald-700 uppercase mb-2">
              Kode Naskah Anda
            </p>
            <p className="text-2xl font-bold font-mono text-emerald-800 tracking-wide">
              {submissionCode}
            </p>
            <p className="text-xs text-emerald-700 mt-3">
              ⚠️ <strong>Simpan kode ini!</strong> Gunakan untuk mengecek status
              naskah Anda.
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 text-left">
            <p className="text-xs text-emerald-800 leading-relaxed">
              📧 <strong>Cek email Anda</strong> ({authorEmail}) untuk
              konfirmasi. Jika tidak ada, hubungi kami via{' '}
              <a
                href="mailto:mustawa.publishing@gmail.com"
                className="underline font-medium"
              >
                email
              </a>
              .
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/cek-naskah?code=${submissionCode}`}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition text-sm"
            >
              Cek Status Naskah
            </Link>
            <Link
              href="/"
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition text-sm"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // TAMPILAN FORM
  // ============================================
  const alurPenerbitan = [
    {
      step: '01',
      title: 'Kirim Naskah',
      icon: '📤',
      desc: 'Anda mengirimkan naskah lengkap melalui formulir ini.',
    },
    {
      step: '02',
      title: 'Review & Estimasi',
      icon: '🔍',
      desc: 'Tim editor meninjau naskah dan memberi estimasi biaya.',
    },
    {
      step: '03',
      title: 'Editing & Layout',
      icon: '✏️',
      desc: 'Naskah disunting, di-layout, dan didesain cover.',
    },
    {
      step: '04',
      title: 'Pengurusan ISBN',
      icon: '📚',
      desc: 'ISBN gratis dari Perpusnas untuk naskah yang lolos.',
    },
    {
      step: '05',
      title: 'Cetak & Terbit',
      icon: '🎉',
      desc: 'Buku dicetak atau dipublikasikan sebagai e-book.',
    },
  ];

  const syarat = [
    'Naskah lengkap dalam format .doc, .docx, atau .pdf',
    'Judul dan subjudul (jika ada)',
    'Daftar isi',
    'Kata pengantar',
    'Biografi penulis (maksimal 1 halaman)',
    'Sinopsis (150-300 kata)',
    'Isi naskah utuh (minimal 60 halaman)',
    'Bebas dari plagiarisme',
  ];

  const kategori = [
    '1. Khazanah Islami — Akidah (Tauhid, Iman, Teologi)',
    '1. Khazanah Islami — Fikih (Ibadah, Muamalah)',
    '1. Khazanah Islami — Tasawuf (Tazkiyatun Nafs, Akhlak)',
    '1. Khazanah Islami — Filsafat Islam (Mantiq, Pemikiran)',
    '2. Pengembangan Diri Islami — Produktivitas Muslim',
    '2. Pengembangan Diri Islami — Manajemen Waktu Islami',
    '2. Pengembangan Diri Islami — Psikologi Islami',
    '2. Pengembangan Diri Islami — Self-Development',
    '3. Akademik & Pendidikan — Buku Ajar (Dosen/Sekolah)',
    '3. Akademik & Pendidikan — Buku Referensi',
    '3. Akademik & Pendidikan — Hasil Penelitian',
    '3. Akademik & Pendidikan — Konversi Tesis/Disertasi',
    '4. Biografi & Kisah Nyata — Biografi Tokoh Islam',
    '4. Biografi & Kisah Nyata — Memoar Ulama/Aktivis',
    '4. Biografi & Kisah Nyata — Perjalanan Hidup',
    '4. Biografi & Kisah Nyata — Sejarah Lokal',
    '5. Anak & Remaja Islami — Buku Cerita Anak',
    '5. Anak & Remaja Islami — Komik Islami',
    '5. Anak & Remaja Islami — Buku Aktivitas',
    '5. Anak & Remaja Islami — Novel Remaja Islami',
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-700 to-teal-700 text-white py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-xs font-medium mb-4">
            ✍️ Panduan & Formulir
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Kirimkan Naskah Anda
          </h1>
          <p className="text-emerald-50 text-lg max-w-2xl mx-auto">
            Wujudkan impian menjadi penulis. Mustawa Publishing siap
            mendampingi perjalanan literasi Anda.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
        {/* Alur Penerbitan */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
              Alur Penerbitan
            </h2>
            <p className="text-slate-500">
              Proses terstruktur dari naskah sampai buku terbit
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {alurPenerbitan.map((item, i) => (
              <div
                key={i}
                className="relative bg-white p-5 rounded-xl border border-slate-200 hover:border-emerald-300 transition"
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <div className="text-xs font-bold text-emerald-600 mb-1">
                  LANGKAH {item.step}
                </div>
                <h3 className="font-bold text-slate-800 mb-2 text-sm">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Syarat Naskah */}
        <section>
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              📋 Syarat Naskah
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {syarat.map((item, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="text-emerald-500 flex-shrink-0 font-bold mt-0.5">
                    ✓
                  </span>
                  <span className="text-slate-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* KATEGORI VISUAL */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
            🏷️ Kategori yang Kami Terima
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            Mustawa Publishing menerima naskah dari 5 kategori utama:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Khazanah Islami */}
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <h4 className="font-bold text-emerald-900 text-sm mb-2">
                1. 📿 KHAZANAH ISLAMI
              </h4>
              <ul className="space-y-1 text-xs text-emerald-800">
                <li>• Akidah — Tauhid, Iman, Teologi</li>
                <li>• Fikih — Ibadah, Muamalah</li>
                <li>• Tasawuf — Tazkiyatun Nafs, Akhlak</li>
                <li>• Filsafat Islam — Mantiq, Pemikiran</li>
              </ul>
            </div>

            {/* 2. Pengembangan Diri Islami */}
            <div className="p-4 bg-sky-50 rounded-xl border border-sky-200">
              <h4 className="font-bold text-sky-900 text-sm mb-2">
                2. 🚀 PENGEMBANGAN DIRI ISLAMI
              </h4>
              <ul className="space-y-1 text-xs text-sky-800">
                <li>• Produktivitas Muslim</li>
                <li>• Manajemen Waktu Islami</li>
                <li>• Psikologi Islami</li>
                <li>• Self-Development</li>
              </ul>
            </div>

            {/* 3. Akademik & Pendidikan */}
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <h4 className="font-bold text-amber-900 text-sm mb-2">
                3. 🎓 AKADEMIK & PENDIDIKAN
              </h4>
              <ul className="space-y-1 text-xs text-amber-800">
                <li>• Buku Ajar (Dosen/Sekolah)</li>
                <li>• Buku Referensi</li>
                <li>• Hasil Penelitian</li>
                <li>• Konversi Tesis/Disertasi</li>
              </ul>
            </div>

            {/* 4. Biografi & Kisah Nyata */}
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
              <h4 className="font-bold text-purple-900 text-sm mb-2">
                4. 👤 BIOGRAFI & KISAH NYATA
              </h4>
              <ul className="space-y-1 text-xs text-purple-800">
                <li>• Biografi Tokoh Islam</li>
                <li>• Memoar Ulama/Aktivis</li>
                <li>• Perjalanan Hidup</li>
                <li>• Sejarah Lokal</li>
              </ul>
            </div>

            {/* 5. Anak & Remaja Islami */}
            <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 md:col-span-2">
              <h4 className="font-bold text-rose-900 text-sm mb-2">
                5. 👶 ANAK & REMAJA ISLAMI
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-rose-800">
                <li>• Buku Cerita Anak</li>
                <li>• Komik Islami</li>
                <li>• Buku Aktivitas</li>
                <li>• Novel Remaja Islami</li>
              </ul>
            </div>
          </div>

          <p className="text-xs text-slate-500 mt-4 text-center">
            📝 Naskah di luar kategori ini tetap bisa dipertimbangkan — kirim via email.
          </p>
        </section>

        {/* Info Penting */}
        <section className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
            ⚠️ Informasi Penting
          </h3>
          <div className="space-y-2 text-sm text-amber-900/90 leading-relaxed">
            <p>
              <strong>Penerimaan naskah bersifat terbatas dan selektif.</strong>{' '}
              Tidak semua naskah yang masuk dapat kami terbitkan.
            </p>
            <p>
              <strong>Pengurusan ISBN gratis</strong> dari Perpustakaan
              Nasional RI diberikan untuk naskah yang lolos seleksi.{' '}
              <strong>Kami tidak memperjualbelikan nomor ISBN.</strong>
            </p>
          </div>
        </section>

        {/* FORM SUBMISSION */}
        <section
          id="form"
          className="bg-white p-6 sm:p-10 rounded-2xl shadow-sm border-2 border-emerald-200"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
              Formulir Pengiriman Naskah
            </h2>
            <p className="text-slate-500 text-sm">
              Isi data di bawah dengan lengkap. Tanda (*) wajib diisi.
            </p>
          </div>

          {message && (
            <div
              className={`mb-6 p-4 rounded-xl text-sm ${
                isError
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* DATA PENULIS */}
            <div className="border-b border-slate-100 pb-5">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                👤 Data Penulis
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    placeholder="Nama sesuai KTP"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Email Aktif *
                  </label>
                  <input
                    type="email"
                    required
                    value={authorEmail}
                    onChange={(e) => setAuthorEmail(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    placeholder="email@contoh.com"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Nomor WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={authorPhone}
                    onChange={(e) => setAuthorPhone(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Biografi Singkat
                  </label>
                  <textarea
                    value={authorBio}
                    onChange={(e) => setAuthorBio(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    placeholder="Ceritakan singkat tentang Anda (maksimal 100 kata)"
                  />
                </div>
              </div>
            </div>

            {/* DATA NASKAH */}
            <div className="border-b border-slate-100 pb-5">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                📖 Data Naskah
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Judul Buku *
                  </label>
                  <input
                    type="text"
                    required
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    placeholder="Judul lengkap naskah Anda"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Kategori *
                    </label>
                    <select
                      required
                      value={bookCategory}
                      onChange={(e) => setBookCategory(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    >
                      <option value="">-- Pilih kategori --</option>
                      <optgroup label="1. Khazanah Islami">
                        <option value="1. Khazanah Islami — Akidah (Tauhid, Iman, Teologi)">
                          📿 Akidah (Tauhid, Iman, Teologi)
                        </option>
                        <option value="1. Khazanah Islami — Fikih (Ibadah, Muamalah)">
                          📿 Fikih (Ibadah, Muamalah)
                        </option>
                        <option value="1. Khazanah Islami — Tasawuf (Tazkiyatun Nafs, Akhlak)">
                          📿 Tasawuf (Tazkiyatun Nafs, Akhlak)
                        </option>
                        <option value="1. Khazanah Islami — Filsafat Islam (Mantiq, Pemikiran)">
                          📿 Filsafat Islam (Mantiq, Pemikiran)
                        </option>
                      </optgroup>
                      <optgroup label="2. Pengembangan Diri Islami">
                        <option value="2. Pengembangan Diri Islami — Produktivitas Muslim">
                          🚀 Produktivitas Muslim
                        </option>
                        <option value="2. Pengembangan Diri Islami — Manajemen Waktu Islami">
                          🚀 Manajemen Waktu Islami
                        </option>
                        <option value="2. Pengembangan Diri Islami — Psikologi Islami">
                          🚀 Psikologi Islami
                        </option>
                        <option value="2. Pengembangan Diri Islami — Self-Development">
                          🚀 Self-Development
                        </option>
                      </optgroup>
                      <optgroup label="3. Akademik & Pendidikan">
                        <option value="3. Akademik & Pendidikan — Buku Ajar (Dosen/Sekolah)">
                          🎓 Buku Ajar (Dosen/Sekolah)
                        </option>
                        <option value="3. Akademik & Pendidikan — Buku Referensi">
                          🎓 Buku Referensi
                        </option>
                        <option value="3. Akademik & Pendidikan — Hasil Penelitian">
                          🎓 Hasil Penelitian
                        </option>
                        <option value="3. Akademik & Pendidikan — Konversi Tesis/Disertasi">
                          🎓 Konversi Tesis/Disertasi
                        </option>
                      </optgroup>
                      <optgroup label="4. Biografi & Kisah Nyata">
                        <option value="4. Biografi & Kisah Nyata — Biografi Tokoh Islam">
                          👤 Biografi Tokoh Islam
                        </option>
                        <option value="4. Biografi & Kisah Nyata — Memoar Ulama/Aktivis">
                          👤 Memoar Ulama/Aktivis
                        </option>
                        <option value="4. Biografi & Kisah Nyata — Perjalanan Hidup">
                          👤 Perjalanan Hidup
                        </option>
                        <option value="4. Biografi & Kisah Nyata — Sejarah Lokal">
                          👤 Sejarah Lokal
                        </option>
                      </optgroup>
                      <optgroup label="5. Anak & Remaja Islami">
                        <option value="5. Anak & Remaja Islami — Buku Cerita Anak">
                          👶 Buku Cerita Anak
                        </option>
                        <option value="5. Anak & Remaja Islami — Komik Islami">
                          👶 Komik Islami
                        </option>
                        <option value="5. Anak & Remaja Islami — Buku Aktivitas">
                          👶 Buku Aktivitas
                        </option>
                        <option value="5. Anak & Remaja Islami — Novel Remaja Islami">
                          👶 Novel Remaja Islami
                        </option>
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Estimasi Jumlah Halaman
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={estimatedPages}
                      onChange={(e) => setEstimatedPages(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      placeholder="Contoh: 120"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Sinopsis *
                  </label>
                  <textarea
                    required
                    value={bookSynopsis}
                    onChange={(e) => setBookSynopsis(e.target.value)}
                    rows={5}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    placeholder="Ringkasan isi buku (150-300 kata)"
                  />
                </div>
              </div>
            </div>

            {/* FILE NASKAH */}
            <div>
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                📎 File Naskah
              </h3>

              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-emerald-400 transition">
                <input
                  type="file"
                  accept=".doc,.docx,.pdf"
                  onChange={(e) =>
                    setManuscriptFile(e.target.files?.[0] || null)
                  }
                  className="hidden"
                  id="manuscript-input"
                />
                <label
                  htmlFor="manuscript-input"
                  className="cursor-pointer inline-flex flex-col items-center"
                >
                  <span className="text-4xl mb-3">📄</span>
                  <span className="text-sm font-medium text-emerald-600 hover:underline">
                    Klik untuk pilih file naskah
                  </span>
                  <span className="text-xs text-slate-500 mt-2">
                    Format: .doc, .docx, atau .pdf (maksimal 20 MB)
                  </span>
                </label>
              </div>

              {manuscriptFile && (
                <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-emerald-800 truncate">
                      ✓ {manuscriptFile.name}
                    </p>
                    <p className="text-xs text-emerald-600 mt-0.5">
                      {(manuscriptFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setManuscriptFile(null)}
                    className="text-xs text-red-600 hover:text-red-700 font-medium ml-3"
                  >
                    Hapus
                  </button>
                </div>
              )}
            </div>

            {/* Upload Progress */}
            {uploadProgress && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 flex items-center gap-2">
                <span className="animate-pulse">⏳</span>
                {uploadProgress}
              </div>
            )}

            {/* Syarat Persetujuan */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  className="mt-0.5 w-4 h-4 accent-emerald-600"
                />
                <span className="text-xs text-slate-600 leading-relaxed">
                  Saya menyatakan bahwa naskah ini{' '}
                  <strong>karya asli saya sendiri</strong>, bebas dari
                  plagiarisme, dan saya setuju dengan{' '}
                  <strong>syarat & ketentuan</strong> Mustawa Publishing.
                  Pengurusan ISBN diberikan gratis untuk naskah yang lolos
                  seleksi.
                </span>
              </label>
            </div>

            {/* Tombol Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition disabled:opacity-50 text-base"
            >
              {loading ? 'Mengirim naskah...' : '🚀 Kirim Naskah Sekarang'}
            </button>

            <p className="text-center text-xs text-slate-500">
              Tim kami akan merespon dalam 3-7 hari kerja
            </p>
          </form>
        </section>

        {/* Cek Status Naskah */}
        <section className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 text-center">
          <h3 className="font-bold text-slate-800 mb-2">
            Sudah pernah kirim naskah?
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Cek status naskah Anda dengan kode yang sudah diberikan.
          </p>
          <Link
            href="/cek-naskah"
            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-lg text-sm transition"
          >
            Cek Status Naskah →
          </Link>
        </section>
      </div>
    </div>
  );
}