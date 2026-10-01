import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan | Toko Buku Digital',
  description:
    'Syarat dan ketentuan serta kebijakan privasi Toko Buku Digital.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-200">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Syarat & Ketentuan
          </h1>
          <p className="text-slate-500 text-sm mb-8">
            Terakhir diperbarui: 1 Oktober 2026
          </p>

          <div className="prose prose-slate max-w-none space-y-8 text-slate-700 text-sm leading-relaxed">
            {/* Syarat & Ketentuan */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">
                1. Ketentuan Umum
              </h2>
              <p>
                Dengan menggunakan layanan <strong>Toko Buku Digital</strong>,
                Anda menyetujui syarat dan ketentuan yang berlaku. Jika Anda
                tidak setuju, mohon untuk tidak menggunakan layanan kami.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">
                2. Akun Pengguna
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Anda bertanggung jawab menjaga kerahasiaan akun dan password Anda.</li>
                <li>Kami berhak menangguhkan akun yang melanggar ketentuan.</li>
                <li>Satu email hanya untuk satu akun.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">
                3. Pembelian & Pembayaran
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Semua harga dalam Rupiah dan sudah termasuk pajak.</li>
                <li>Pembayaran diproses melalui Midtrans, gateway berlisensi Bank Indonesia.</li>
                <li>Pesanan dianggap sah setelah pembayaran lunas terverifikasi.</li>
                <li>Kami berhak membatalkan pesanan jika ada indikasi kecurangan.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">
                4. Produk Digital (E-Book)
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>E-book dilindungi hak cipta. Dilarang memperbanyak, menjual ulang, atau mendistribusikan tanpa izin.</li>
                <li>Link download bersifat pribadi dan berlaku 24 jam.</li>
                <li>E-book yang sudah dibeli <strong>tidak dapat dikembalikan</strong> (non-refundable).</li>
                <li>Kami berhak menindak tegas pelanggaran hak cipta sesuai hukum yang berlaku.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">
                5. Produk Fisik
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Buku fisik dikirim dalam 1-3 hari kerja setelah pembayaran.</li>
                <li>Risiko kerusakan/kehilangan selama pengiriman ditanggung ekspedisi.</li>
                <li>Klaim kerusakan maksimal 3 hari setelah paket diterima.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">
                6. Pembatalan & Pengembalian
              </h2>
              <p>
                Pesanan dapat dibatalkan sebelum pembayaran. Setelah pembayaran
                lunas, pembatalan tidak dapat dilakukan, kecuali ada kesalahan
                dari pihak kami.
              </p>
            </section>

            <section className="pt-6 border-t border-slate-100">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">
                Kebijakan Privasi
              </h2>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">
                1. Data yang Kami Kumpulkan
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Nama lengkap dan email</li>
                <li>Alamat pengiriman (untuk buku fisik)</li>
                <li>Riwayat transaksi</li>
                <li>Data teknis (browser, IP, untuk keamanan)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">
                2. Penggunaan Data
              </h2>
              <p>Data Anda kami gunakan untuk:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Memproses pesanan dan pengiriman</li>
                <li>Mengirim invoice & informasi pesanan</li>
                <li>Memberikan dukungan pelanggan</li>
                <li>Mencegah penipuan</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">
                3. Keamanan Data
              </h2>
              <p>
                Data Anda disimpan dengan enkripsi menggunakan teknologi
                Supabase (PostgreSQL). Kami tidak pernah menyimpan informasi
                kartu kredit — semua pembayaran diproses langsung oleh
                Midtrans.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">
                4. Berbagi Data dengan Pihak Ketiga
              </h2>
              <p>
                Kami hanya membagikan data Anda kepada pihak yang diperlukan
                untuk memproses pesanan:
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong>Midtrans</strong> — untuk memproses pembayaran</li>
                <li><strong>Ekspedisi</strong> — untuk pengiriman buku fisik</li>
                <li><strong>Resend</strong> — untuk mengirim email transaksi</li>
              </ul>
              <p className="mt-3">
                Kami <strong>tidak menjual</strong> data Anda ke pihak lain.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">
                5. Hak Anda
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Meminta salinan data pribadi Anda</li>
                <li>Meminta penghapusan akun & data</li>
                <li>Menarik persetujuan pemasaran kapan saja</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">
                6. Cookie
              </h2>
              <p>
                Kami menggunakan cookie untuk menjaga sesi login dan
                meningkatkan pengalaman pengguna. Anda dapat menonaktifkan
                cookie di pengaturan browser.
              </p>
            </section>

            <section className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
              <p className="text-sm text-blue-800">
                <strong>Pertanyaan?</strong> Hubungi kami di{' '}
                <Link href="/contact" className="underline">
                  halaman kontak
                </Link>{' '}
                atau email ke{' '}
                <strong>support@tokobukudigital.com</strong>
              </p>
            </section>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-100">
            <Link href="/" className="text-sm text-blue-600 hover:underline">
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}