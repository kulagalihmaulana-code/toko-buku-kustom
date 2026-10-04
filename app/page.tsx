import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic';

function formatRupiah(amount: number | string | null | undefined) {
  if (!amount) return '0';
  const num = typeof amount === 'number' ? amount : parseFloat(amount);
  if (isNaN(num)) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export default async function HomePage() {
  let books: any[] | null = [];
  let errorMessage: string | null = null;

  try {
    const supabase = supabaseAdmin;
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .limit(6)
      .order('created_at', { ascending: false });

    if (error) errorMessage = error.message;
    books = data;
  } catch (err: any) {
    errorMessage = err.message;
  }

  return (
    <div className="bg-white">
      {/* ============================================ */}
      {/* HERO SECTION */}
      {/* ============================================ */}
      <section className="relative bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '32px 32px',
            }}
          ></div>
        </div>

        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl"></div>

        <div className="relative max-w-6xl mx-auto px-4 py-20 sm:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-xs font-medium mb-6">
              <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></span>
              Penerbitan Mandiri Profesional
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4">
              MUSTAWA
              <span className="block text-emerald-200 text-2xl sm:text-3xl lg:text-4xl mt-2 font-normal">
                Publishing
              </span>
            </h1>

            <p className="text-xl sm:text-2xl lg:text-3xl text-emerald-50 mb-8 leading-snug font-light">
              Tempat Gagasan Mulia Mulai Dituliskan
            </p>

            <p className="text-base sm:text-lg text-emerald-100/90 mb-10 leading-relaxed max-w-2xl">
              Wadah profesional bagi para penulis untuk melahirkan karya
              berkualitas, berbobot, dan menginspirasi dunia.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-12">
              <Link
                href="/kirim-naskah"
                className="inline-flex items-center justify-center gap-2 bg-white text-emerald-700 hover:bg-emerald-50 font-bold px-6 py-3.5 rounded-xl transition shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                📝 Kirim Naskah
              </Link>
              <Link
                href="/katalog"
                className="inline-flex items-center justify-center gap-2 bg-emerald-800/40 hover:bg-emerald-800/60 border border-white/20 backdrop-blur-sm text-white font-bold px-6 py-3.5 rounded-xl transition hover:-translate-y-0.5"
              >
                📚 Lihat Katalog
              </Link>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs text-emerald-100/80">
              <div className="flex items-center gap-2">
                <span className="text-emerald-300">✓</span>
                <span>ISBN Gratis dari Perpusnas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-300">✓</span>
                <span>Editor Profesional</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-300">✓</span>
                <span>Cetak & E-Book</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-300">✓</span>
                <span>Distribusi Nasional</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/0 to-white"></div>
      </section>

      {/* ============================================ */}
      {/* FILOSOFI / PROFIL */}
      {/* ============================================ */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-emerald-50 text-emerald-700 rounded-full px-4 py-1.5 text-xs font-semibold mb-4">
            TENTANG KAMI
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-6">
            Filosofi <span className="text-emerald-600">Mustawa</span>
          </h2>

          <div className="text-justify max-w-3xl mx-auto space-y-5 text-slate-600 leading-relaxed hyphens-auto">
            <p>
              Nama <strong className="text-slate-800">"Mustawa"</strong>{' '}
              diangkat dari sebuah momentum agung dalam sejarah spiritualitas
              dan literasi peradaban. Terinspirasi dari kisah perjalanan
              Mi&apos;raj Nabi Muhammad ﷺ, Mustawa adalah tempat tertinggi di
              atas langit ketujuh yang menjadi saksi dua peristiwa mahapenting:
              diterimanya perintah shalat lima waktu, serta terdengarnya suara
              gesekan pena-pena takdir yang sedang mencatat ketetapan ilahi.
            </p>
            <p>
              Bagi kami, peristiwa spiritual ini adalah simbol kesempurnaan.
              Perintah shalat yang diterima di sana melambangkan fondasi hukum
              dan spiritualitas terdalam, sementara gesekan pena menegaskan
              bahwa{' '}
              <strong className="text-slate-800">
                tulisan, ilmu, dan kebenaran memiliki kedudukan yang sangat
                mulia
              </strong>{' '}
              di sisi Allah ﷻ.
            </p>
            <p>
              Berangkat dari filosofi luhur tersebut, Mustawa Publishing
              berkomitmen untuk menjadi ruang bagi setiap penulis dalam
              menggoreskan penanya untuk menyebarkan kebenaran. Kata Mustawa
              yang dalam bahasa modern juga berarti{' '}
              <strong className="text-slate-800">"Tingkat"</strong> atau{' '}
              <strong className="text-slate-800">"Standar"</strong>, menjadi
              pemacu kami untuk terus mendampingi para penulis dalam menaikkan
              level kualitas karya mereka hingga mencapai standar literasi dan
              kemanfaatan tertinggi.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* VISI & MISI */}
      {/* ============================================ */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-2xl mb-4">
                🎯
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Visi</h3>
              <p className="text-slate-600 leading-relaxed">
                Menjadi mitra penerbitan mandiri terpercaya yang mampu mencetak
                generasi penulis berintegritas dan menerbitkan buku-buku yang
                memberi dampak positif bagi masyarakat luas.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-2xl mb-4">
                🚀
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Misi</h3>
              <ul className="space-y-3 text-slate-600">
                <li className="flex gap-2">
                  <span className="text-emerald-500 flex-shrink-0">✓</span>
                  <span className="text-sm">
                    Menyediakan layanan penerbitan yang transparan, mudah, dan
                    akuntabel
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-500 flex-shrink-0">✓</span>
                  <span className="text-sm">
                    Menjaga mutu penyuntingan, tata letak, dan desain visual
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-500 flex-shrink-0">✓</span>
                  <span className="text-sm">
                    Mendukung gerakan literasi nasional dengan distribusi bacaan
                    bermutu
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* KEUNGGULAN */}
      {/* ============================================ */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-emerald-50 text-emerald-700 rounded-full px-4 py-1.5 text-xs font-semibold mb-4">
              KEUNGGULAN
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">
              Mengapa Memilih Mustawa Publishing?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: '✏️',
                title: 'Editing Profesional',
                desc: 'Naskah Anda disunting oleh editor berpengalaman untuk hasil terbaik.',
              },
              {
                icon: '🎨',
                title: 'Desain Cover Custom',
                desc: 'Cover buku dirancang khusus sesuai genre dan target pembaca.',
              },
              {
                icon: '📐',
                title: 'Layout Standar Industri',
                desc: 'Tata letak nyaman dibaca sesuai standar penerbitan nasional.',
              },
              {
                icon: '📚',
                title: 'Pengurusan ISBN',
                desc: 'Fasilitas pengurusan ISBN gratis dari Perpusnas untuk buku yang memenuhi syarat.',
              },
              {
                icon: '🖨️',
                title: 'Cetak & E-book',
                desc: 'Pilihan terbit cetak fisik atau e-book digital sesuai kebutuhan Anda.',
              },
              {
                icon: '🌐',
                title: 'Distribusi Online',
                desc: 'Buku Anda dijual langsung melalui platform digital kami.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition"
              >
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="font-bold text-slate-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* KATALOG PREVIEW */}
      {/* ============================================ */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-emerald-50 text-emerald-700 rounded-full px-4 py-1.5 text-xs font-semibold mb-4">
              KATALOG
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3">
              Buku-Buku Terbitan Kami
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Koleksi buku pilihan dari penulis-penulis berbakat yang telah
              mempercayakan karyanya kepada Mustawa Publishing.
            </p>
          </div>

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm mb-6">
              Error: {errorMessage}
            </div>
          )}

          {books && books.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => {
                const isBoth = book.format === 'both';
                const displayPrice = isBoth
                  ? Number(book.price_ebook || book.price || 0)
                  : Number(book.price || 0);

                return (
                  <Link
                    key={book.id}
                    href={`/katalog/${book.id}`}
                    className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition"
                  >
                    <div className="aspect-[3/4] bg-slate-100 overflow-hidden relative">
                      {book.cover_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={book.cover_url}
                          alt={book.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl text-slate-300">
                          📖
                        </div>
                      )}

                      <div className="absolute top-3 left-3">
                        <span className="inline-block px-2.5 py-1 text-xs font-bold rounded-lg bg-white/95 backdrop-blur-sm text-emerald-700 uppercase shadow-sm">
                          {book.format === 'ebook'
                            ? 'E-Book'
                            : book.format === 'physical'
                            ? 'Cetak'
                            : 'Cetak + E-Book'}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-slate-800 mb-1 line-clamp-2 group-hover:text-emerald-600 transition">
                        {book.title}
                      </h3>
                      <p className="text-sm text-slate-500 mb-3">
                        {book.author}
                      </p>
                      <p className="font-bold text-emerald-600 text-lg">
                        {isBoth && 'Mulai '}
                        Rp {formatRupiah(displayPrice)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <p className="text-4xl mb-3">📚</p>
              <p className="text-slate-500">
                Belum ada buku yang dipublikasikan.
              </p>
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              href="/katalog"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl transition"
            >
              Lihat Semua Buku →
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* CTA KIRIM NASKAH */}
      {/* ============================================ */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-700 text-white overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-teal-300/20 rounded-full blur-3xl"></div>

        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Punya Naskah yang Siap Diterbitkan?
          </h2>
          <p className="text-emerald-50 text-lg mb-8 leading-relaxed">
            Kami membuka peluang bagi penulis terpilih. Kirimkan naskah Anda
            untuk direview oleh tim editor kami.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/kirim-naskah"
              className="inline-flex items-center justify-center gap-2 bg-white text-emerald-700 hover:bg-emerald-50 font-bold px-6 py-3.5 rounded-xl transition shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              📝 Kirim Naskah Sekarang
            </Link>
            <Link
              href="/kontak"
              className="inline-flex items-center justify-center gap-2 bg-emerald-800/40 hover:bg-emerald-800/60 border border-white/20 backdrop-blur-sm text-white font-bold px-6 py-3.5 rounded-xl transition hover:-translate-y-0.5"
            >
              💬 Hubungi Kami
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}