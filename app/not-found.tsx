import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full text-center">
        {/* Ilustrasi angka 404 */}
        <div className="mb-8">
          <h1 className="text-8xl sm:text-9xl font-bold text-emerald-600 leading-none">
            404
          </h1>
          <div className="text-6xl mt-4">📚</div>
        </div>

        {/* Pesan */}
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">
          Halaman Tidak Ditemukan
        </h2>
        <p className="text-slate-600 mb-8 leading-relaxed">
          Maaf, halaman yang Anda cari tidak ada atau sudah dipindahkan.
          Mungkin Anda salah ketik URL atau halaman sudah dihapus.
        </p>

        {/* Tombol aksi */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg"
          >
            🏠 Kembali ke Beranda
          </Link>
          <Link
            href="/katalog"
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-emerald-700 border-2 border-emerald-200 hover:border-emerald-300 font-bold px-6 py-3 rounded-xl transition"
          >
            📚 Lihat Katalog
          </Link>
        </div>

        {/* Link cepat */}
        <div className="mt-12 pt-8 border-t border-emerald-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Halaman Populer
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link
              href="/kirim-naskah"
              className="text-xs text-slate-600 hover:text-emerald-600 bg-white hover:bg-emerald-50 px-3 py-1.5 rounded-full border border-slate-200 hover:border-emerald-200 transition"
            >
              📝 Kirim Naskah
            </Link>
            <Link
              href="/cek-naskah"
              className="text-xs text-slate-600 hover:text-emerald-600 bg-white hover:bg-emerald-50 px-3 py-1.5 rounded-full border border-slate-200 hover:border-emerald-200 transition"
            >
              🔍 Cek Naskah
            </Link>
            <Link
              href="/tentang"
              className="text-xs text-slate-600 hover:text-emerald-600 bg-white hover:bg-emerald-50 px-3 py-1.5 rounded-full border border-slate-200 hover:border-emerald-200 transition"
            >
              ℹ️ Tentang Kami
            </Link>
            <Link
              href="/kontak"
              className="text-xs text-slate-600 hover:text-emerald-600 bg-white hover:bg-emerald-50 px-3 py-1.5 rounded-full border border-slate-200 hover:border-emerald-200 transition"
            >
              📬 Kontak
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}