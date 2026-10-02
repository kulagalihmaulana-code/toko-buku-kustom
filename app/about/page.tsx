import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tentang Kami | Toko Buku Digital',
  description:
    'Toko Buku Digital adalah platform jual beli e-book dan buku fisik berkualitas untuk pembaca Indonesia.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-200">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Tentang Toko Buku Digital
          </h1>
          <p className="text-slate-500 mb-8">
            Misi kami: membuat buku berkualitas mudah diakses semua orang.
          </p>

          <div className="prose prose-slate max-w-none space-y-6 text-slate-700">
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">
                📚 Siapa Kami
              </h2>
              <p className="leading-relaxed">
                <strong>Toko Buku Digital</strong> adalah platform self-publishing
                yang menghubungkan penulis dengan pembaca di seluruh Indonesia.
                Kami menyediakan e-book dan buku fisik berkualitas dari penulis
                independen, akademisi, dan praktisi di berbagai bidang.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">
                ✨ Kenapa Memilih Kami
              </h2>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <div>
                    <strong>Kurasi Berkualitas</strong>
                    <p className="text-sm text-slate-600">
                      Setiap buku melewati proses seleksi untuk memastikan
                      kualitas konten.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <div>
                    <strong>Download Instan</strong>
                    <p className="text-sm text-slate-600">
                      E-book bisa langsung diunduh setelah pembayaran lunas.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <div>
                    <strong>Pembayaran Aman</strong>
                    <p className="text-sm text-slate-600">
                      Transaksi diproses melalui Midtrans, gateway pembayaran
                      terpercaya di Indonesia.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <div>
                    <strong>Pengiriman Nasional</strong>
                    <p className="text-sm text-slate-600">
                      Buku fisik dikirim ke seluruh Indonesia dengan tracking
                      resi.
                    </p>
                  </div>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">
                🎯 Visi Kami
              </h2>
              <p className="leading-relaxed">
                Menjadi platform self-publishing terdepan di Indonesia yang
                memberdayakan penulis lokal dan memudahkan pembaca mengakses
                buku berkualitas kapan saja, di mana saja.
              </p>
            </section>

            <section className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-emerald-900 mb-3">
                🤝 Ingin Bekerja Sama?
              </h2>
              <p className="text-emerald-800 text-sm mb-4">
                Untuk penulis, penerbit, atau institusi yang ingin bekerja sama,
                silakan hubungi kami.
              </p>
              <Link
                href="/contact"
                className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition"
              >
                Hubungi Kami →
              </Link>
            </section>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-100">
            <Link
              href="/"
              className="text-sm text-emerald-600 hover:underline"
            >
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}