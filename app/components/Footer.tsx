import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Baris 1: Brand + Navigasi + Layanan + Kontak */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-icon.png"
                alt="Mustawa Publishing"
                className="h-8 w-11 object-contain flex-shrink-0 bg-white rounded p-0.5"
              />
              <div
                className="flex flex-col justify-center h-12"
                style={{ minWidth: '135px' }}
              >
                <p
                  className="font-bold text-white"
                  style={{
                    fontSize: '17px',
                    lineHeight: '1',
                    letterSpacing: '0.02em',
                  }}
                >
                  MUSTAWA
                </p>
                <p
                  className="text-emerald-400 font-semibold"
                  style={{
                    fontSize: '10px',
                    lineHeight: '1',
                    marginTop: '4px',
                    letterSpacing: '0.28em',
                    paddingLeft: '0.1em',
                  }}
                >
                  PUBLISHING
                </p>
              </div>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Tempat Gagasan Mulia Mulai Dituliskan. Platform penerbitan
              mandiri profesional untuk penulis Indonesia.
            </p>
          </div>

          {/* Navigasi */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Navigasi
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-slate-400 hover:text-emerald-400 transition"
                >
                  Beranda
                </Link>
              </li>
              <li>
                <Link
                  href="/katalog"
                  className="text-slate-400 hover:text-emerald-400 transition"
                >
                  Katalog Buku
                </Link>
              </li>
              <li>
                <Link
                  href="/kirim-naskah"
                  className="text-slate-400 hover:text-emerald-400 transition"
                >
                  Kirim Naskah
                </Link>
              </li>
              <li>
                <Link
                  href="/cek-naskah"
                  className="text-slate-400 hover:text-emerald-400 transition"
                >
                  Cek Status Naskah
                </Link>
              </li>
              <li>
                <Link
                  href="/tentang"
                  className="text-slate-400 hover:text-emerald-400 transition"
                >
                  Tentang Kami
                </Link>
              </li>
            </ul>
          </div>

          {/* Layanan */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Layanan
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/kontak"
                  className="text-slate-400 hover:text-emerald-400 transition"
                >
                  Hubungi Kami
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="text-slate-400 hover:text-emerald-400 transition"
                >
                  Akun Saya
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-slate-400 hover:text-emerald-400 transition"
                >
                  Masuk
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-slate-400 hover:text-emerald-400 transition"
                >
                  Daftar Akun
                </Link>
              </li>
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Hubungi Kami
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 flex-shrink-0">📧</span>
                <a
                  href="mailto:mustawa.publishing@gmail.com"
                  className="text-slate-400 hover:text-emerald-400 transition break-all"
                >
                  mustawa.publishing@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 flex-shrink-0">💬</span>
                <a
                  href="https://wa.me/6281234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-emerald-400 transition"
                >
                  +62 812-3456-7890
                </a>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 flex-shrink-0">📍</span>
                <span className="text-slate-400">
                  Majalengka, Jawa Barat, Indonesia
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 flex-shrink-0">🕐</span>
                <span className="text-slate-400">
                  Senin-Jumat, 09.00-17.00 WIB
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Baris 2: Disclaimer ISBN */}
        <div className="bg-emerald-950/40 border border-emerald-800/50 rounded-xl p-5 mb-8">
          <div className="flex items-start gap-3">
            <span className="text-emerald-400 flex-shrink-0 text-lg">📚</span>
            <div className="text-xs text-slate-300 leading-relaxed">
              <p className="font-semibold text-emerald-400 mb-1">
                Catatan Penting:
              </p>
              <p>
                <strong className="text-white">Mustawa Publishing</strong>{' '}
                adalah penerbit resmi yang terdaftar di Perpustakaan Nasional
                RI. Layanan pengurusan ISBN diberikan{' '}
                <strong className="text-emerald-400">
                  secara gratis sebagai fasilitas dari pemerintah
                </strong>{' '}
                bagi setiap naskah yang memenuhi syarat dan lolos seleksi
                internal untuk diterbitkan oleh kami.{' '}
                <strong className="text-red-400">
                  Kami tidak memperjualbelikan nomor ISBN.
                </strong>
              </p>
            </div>
          </div>
        </div>

        {/* Baris 3: Legalitas + Copyright */}
        <div className="border-t border-slate-800 pt-6">
          {/* Info Legalitas */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500 mb-4">
            <span>
              <strong className="text-slate-400">Badan Usaha:</strong> UD /
              Perorangan
            </span>
            <span>
              <strong className="text-slate-400">NIB:</strong> Dalam Proses
            </span>
            <span>
              <strong className="text-slate-400">Penerbit:</strong> Mustawa
              Publishing
            </span>
          </div>

          {/* Copyright */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
            <p>
              © {year}{' '}
              <span className="text-slate-400">Mustawa Publishing.</span> All
              rights reserved.
            </p>
            <div className="flex gap-4">
              <Link
                href="/tentang"
                className="hover:text-emerald-400 transition"
              >
                Tentang
              </Link>
              <Link
                href="/kontak"
                className="hover:text-emerald-400 transition"
              >
                Kontak
              </Link>
              <span className="text-slate-600">
                Dibuat dengan ❤️ di Indonesia
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}