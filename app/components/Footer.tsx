import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-bold text-white text-lg mb-2">
              📚 Toko Buku Digital
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Platform self-publishing & jual beli e-book dan buku fisik
              berkualitas untuk pembaca Indonesia.
            </p>
          </div>

          {/* Navigasi */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">
              Navigasi
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  Kontak & FAQ
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition">
                  Syarat & Ketentuan
                </Link>
              </li>
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">
              Hubungi
            </h4>
            <ul className="space-y-2 text-sm">
              <li>📧 support@tokobukudigital.com</li>
              <li>📱 +62 812-3456-7890</li>
              <li className="text-slate-400 text-xs">
                Senin–Jumat, 09.00–17.00 WIB
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-slate-500">
            © {year} Toko Buku Digital. All rights reserved.
          </p>
          <p className="text-xs text-slate-500">
            Dibuat dengan ❤️ di Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}