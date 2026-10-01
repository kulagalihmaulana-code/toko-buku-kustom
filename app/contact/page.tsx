import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kontak & FAQ | Toko Buku Digital',
  description:
    'Hubungi tim Toko Buku Digital. Temukan jawaban pertanyaan umum tentang pembelian, e-book, dan pengiriman.',
};

const faqs = [
  {
    q: 'Bagaimana cara membeli e-book?',
    a: 'Pilih buku yang Anda inginkan, klik "Beli Sekarang", isi data pembeli, dan selesaikan pembayaran melalui Midtrans. Link download akan otomatis dikirim ke email Anda setelah pembayaran lunas.',
  },
  {
    q: 'Apakah saya perlu membuat akun untuk membeli?',
    a: 'Tidak wajib! Anda bisa checkout sebagai tamu. Namun, membuat akun memudahkan Anda mengakses riwayat pembelian dan mengunduh ulang e-book kapan saja.',
  },
  {
    q: 'Berapa lama link download berlaku?',
    a: 'Link download e-book berlaku selama 24 jam. Jika kedaluwarsa, Anda bisa membuka portal pesanan atau login ke akun untuk mengunduh ulang.',
  },
  {
    q: 'Bagaimana jika saya tidak menerima email invoice?',
    a: 'Cek folder Spam atau Promotions di email Anda. Jika tetap tidak ada, hubungi kami dengan menyertakan nomor order ID Anda.',
  },
  {
    q: 'Metode pembayaran apa saja yang tersedia?',
    a: 'Kami menerima berbagai metode melalui Midtrans: transfer bank (BCA, BNI, BRI, Mandiri), GoPay, OVO, DANA, ShopeePay, QRIS, dan kartu kredit.',
  },
  {
    q: 'Berapa lama pengiriman buku fisik?',
    a: 'Buku fisik dikirim dalam 1-3 hari kerja setelah pembayaran. Nomor resi akan dikirim ke email Anda begitu paket dikirim.',
  },
  {
    q: 'Bisakah saya mengembalikan buku?',
    a: 'E-book tidak dapat dikembalikan karena sifat produk digital. Untuk buku fisik yang rusak atau salah kirim, silakan hubungi kami dalam 3 hari setelah penerimaan.',
  },
  {
    q: 'Bagaimana cara menjadi penulis di platform ini?',
    a: 'Kami membuka peluang untuk penulis independen. Hubungi kami melalui email di bawah dengan proposal dan contoh karya Anda.',
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-200">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Kontak & FAQ
          </h1>
          <p className="text-slate-500">
            Ada pertanyaan? Kami siap membantu.
          </p>
        </div>

        {/* Kontak */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-5">
            📞 Hubungi Kami
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase">
                Email
              </p>
              <p className="font-medium text-slate-800 mt-1 break-all">
                support@tokobukudigital.com
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Balas dalam 1×24 jam
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase">
                WhatsApp
              </p>
              <p className="font-medium text-slate-800 mt-1">
                +62 812-3456-7890
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Senin–Jumat, 09.00–17.00 WIB
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-800">
              💡 <strong>Untuk pertanyaan tentang pesanan tertentu</strong>,
              sertakan <strong>Order ID</strong> (contoh: <code className="text-xs bg-white px-1 py-0.5 rounded">BOOK-xxxx</code>) agar kami bisa bantu lebih cepat.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-5">
            ❓ Pertanyaan Umum (FAQ)
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition"
              >
                <summary className="cursor-pointer font-semibold text-slate-800 text-sm list-none flex justify-between items-center">
                  {faq.q}
                  <span className="text-slate-400 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>

        <Link href="/" className="text-sm text-blue-600 hover:underline">
          ← Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}