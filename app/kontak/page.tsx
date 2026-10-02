import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kontak | Mustawa Publishing',
  description:
    'Hubungi Mustawa Publishing — alamat kantor, email, WhatsApp, dan form pesan untuk pertanyaan penerbitan.',
};

export default function KontakPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-700 to-teal-700 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-xs font-medium mb-4">
            📬 Hubungi Kami
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Mari Terhubung
          </h1>
          <p className="text-emerald-50 text-lg max-w-2xl mx-auto">
            Kami siap membantu Anda. Hubungi kami untuk pertanyaan penerbitan,
            kerja sama, atau informasi lainnya.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
        {/* Kontak Utama - 3 Kolom */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Email */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 flex items-center justify-center text-2xl mb-4">
              📧
            </div>
            <h3 className="font-bold text-slate-800 mb-2">Email</h3>
            <a
              href="mailto:mustawa.publishing@gmail.com"
              className="text-sm text-emerald-600 hover:underline break-all"
            >
              mustawa.publishing@gmail.com
            </a>
            <p className="text-xs text-slate-500 mt-2">
              Balas dalam 1×24 jam
            </p>
          </div>

          {/* WhatsApp */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 flex items-center justify-center text-2xl mb-4">
              💬
            </div>
            <h3 className="font-bold text-slate-800 mb-2">WhatsApp</h3>
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-emerald-600 hover:underline"
            >
              {/* Ganti dengan nomor WA asli */}
              +62 812-3456-7890
            </a>
            <p className="text-xs text-slate-500 mt-2">
              Senin-Jumat, 09.00-17.00 WIB
            </p>
          </div>

          {/* Jam Operasional */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 flex items-center justify-center text-2xl mb-4">
              🕐
            </div>
            <h3 className="font-bold text-slate-800 mb-2">Jam Operasional</h3>
            <p className="text-sm text-slate-700">Senin - Jumat</p>
            <p className="text-sm text-slate-700">09.00 - 17.00 WIB</p>
            <p className="text-xs text-slate-500 mt-2">
              Sabtu, Minggu & Libur Nasional: Tutup
            </p>
          </div>
        </section>

        {/* Alamat & Maps */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Info Alamat */}
            <div className="p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-5 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-xl">
                  📍
                </span>
                Alamat Kantor
              </h2>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                    Alamat Lengkap
                  </p>
                  <p className="text-slate-700 leading-relaxed">
                    {/* GANTI dengan alamat asli Mustawa Publishing */}
                    <em className="text-slate-400">
                      [Alamat kantor Mustawa Publishing — silakan hubungi kami
                      melalui email untuk informasi alamat terkini]
                    </em>
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                    Untuk Kerja Sama
                  </p>
                  <p className="text-sm text-slate-600">
                    Hubungi kami via email dengan subjek{' '}
                    <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">
                      [KERJA SAMA]
                    </code>
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                    Untuk Penulis
                  </p>
                  <p className="text-sm text-slate-600">
                    Kirim naskah via{' '}
                    <Link
                      href="/kirim-naskah"
                      className="text-emerald-600 hover:underline font-medium"
                    >
                      halaman Kirim Naskah
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/* Maps */}
            <div className="bg-slate-100 min-h-[300px] flex items-center justify-center p-8">
              <div className="text-center max-w-sm">
                <p className="text-6xl mb-4">🗺️</p>
                <h3 className="font-bold text-slate-700 mb-2">
                  Lokasi Kantor
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  Peta lokasi akan ditampilkan setelah alamat kantor
                  dikonfirmasi.
                </p>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <p className="text-xs text-emerald-800">
                    💡 <strong>Tips untuk verifikator:</strong> Setelah alamat
                    final, embed Google Maps di sini untuk validasi lokasi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Form Pesan (Mailto) */}
        <section className="bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            📝 Kirim Pesan
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            Isi form di bawah, sistem akan membuka aplikasi email Anda.
          </p>

          <form
            action="mailto:mustawa.publishing@gmail.com"
            method="POST"
            encType="text/plain"
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Nama Anda
                </label>
                <input
                  type="text"
                  name="nama"
                  required
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  placeholder="Nama lengkap"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Email Anda
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  placeholder="email@contoh.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Subjek
              </label>
              <select
                name="subjek"
                required
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              >
                <option value="">-- Pilih subjek --</option>
                <option value="[PERTANYAAN] Info Penerbitan">
                  Pertanyaan tentang Penerbitan
                </option>
                <option value="[NASKAH] Pengiriman Naskah">
                  Pengiriman Naskah
                </option>
                <option value="[KERJA SAMA] Proposal Kerja Sama">
                  Kerja Sama
                </option>
                <option value="[PESANAN] Bantuan Pesanan">
                  Bantuan Pesanan
                </option>
                <option value="[LAINNYA] Pertanyaan Umum">
                  Lainnya
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Pesan
              </label>
              <textarea
                name="pesan"
                required
                rows={5}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                placeholder="Tulis pesan Anda di sini..."
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-xl transition"
            >
              ✉️ Kirim Pesan
            </button>
          </form>

          <div className="mt-6 p-4 bg-emerald-600 border border-emerald-200 rounded-xl">
            <p className="text-xs text-emerald-800">
              💡 <strong>Catatan:</strong> Form ini menggunakan aplikasi email
              default Anda. Jika tidak terbuka otomatis, silakan kirim email
              langsung ke{' '}
              <strong>mustawa.publishing@gmail.com</strong>
            </p>
          </div>
        </section>

        {/* Info Tambahan */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              📚 Untuk Pembeli
            </h3>
            <p className="text-sm text-slate-600 mb-3">
              Ada kendala dengan pesanan atau e-book Anda?
            </p>
            <Link
              href="/profile"
              className="text-sm text-emerald-600 hover:underline font-medium"
            >
              Cek Riwayat Pesanan →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              ✍️ Untuk Penulis
            </h3>
            <p className="text-sm text-slate-600 mb-3">
              Ingin menerbitkan buku Anda bersama kami?
            </p>
            <Link
              href="/kirim-naskah"
              className="text-sm text-emerald-600 hover:underline font-medium"
            >
              Panduan Kirim Naskah →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}