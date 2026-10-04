import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tentang Kami | Mustawa Publishing',
  description:
    'Mustawa Publishing adalah platform penerbitan mandiri profesional yang menjadi wadah bagi penulis untuk melahirkan karya berkualitas dan menginspirasi dunia.',
};

export default function TentangPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-700 to-teal-700 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-xs font-medium mb-4">
            🏛️ Profil Penerbit
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Tentang Mustawa Publishing
          </h1>
          <p className="text-emerald-50 text-lg max-w-2xl mx-auto">
            Tempat Gagasan Mulia Mulai Dituliskan
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        {/* Filosofi */}
        <section className="bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-5 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-xl">
              ✨
            </span>
            Filosofi Mustawa
          </h2>

          <div className="space-y-4 text-slate-700 leading-relaxed text-justify hyphens-auto">
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
        </section>

        {/* Visi Misi */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  akuntabel bagi penulis mandiri
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-500 flex-shrink-0">✓</span>
                <span className="text-sm">
                  Menjaga mutu penyuntingan, tata letak, dan desain visual di
                  setiap buku yang diterbitkan
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-500 flex-shrink-0">✓</span>
                <span className="text-sm">
                  Mendukung gerakan literasi nasional dengan mendistribusikan
                  bahan bacaan yang bermutu
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* Layanan */}
        <section className="bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            Layanan Kami
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                icon: '✏️',
                title: 'Editing Profesional',
                desc: 'Penyuntingan naskah oleh editor berpengalaman',
              },
              {
                icon: '🎨',
                title: 'Desain Cover',
                desc: 'Desain sampul buku custom sesuai genre',
              },
              {
                icon: '📐',
                title: 'Layout & Tata Letak',
                desc: 'Tata letak nyaman dibaca sesuai standar industri',
              },
              {
                icon: '📚',
                title: 'Pengurusan ISBN',
                desc: 'Fasilitas ISBN gratis dari Perpusnas RI',
              },
              {
                icon: '🖨️',
                title: 'Cetak Buku',
                desc: 'Cetak fisik atau e-book sesuai kebutuhan',
              },
              {
                icon: '🌐',
                title: 'Distribusi',
                desc: 'Distribusi online melalui platform digital kami',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100"
              >
                <div className="text-2xl flex-shrink-0">{item.icon}</div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm mb-0.5">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Legalitas */}
        <section className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-xl text-white">
              🏛️
            </span>
            Legalitas & Kredibilitas
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl border border-emerald-100">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                Badan Usaha
              </p>
              <p className="font-bold text-slate-800">
                Usaha Dagang (UD) / Perorangan
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-emerald-100">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                Nama Penerbit
              </p>
              <p className="font-bold text-slate-800">Mustawa Publishing</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-emerald-100">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                NIB (Nomor Induk Berusaha)
              </p>
              <p className="font-bold text-slate-800 text-sm">
                {/* Ganti dengan NIB asli setelah Anda dapat */}
                Dalam Proses
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-emerald-100">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                Status Registrasi
              </p>
              <p className="font-bold text-slate-800 text-sm">
                Berkomitmen Terdaftar di Perpustakaan Nasional RI
              </p>
            </div>
          </div>

          <div className="bg-white border border-emerald-200 rounded-xl p-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong className="text-emerald-700">
                Catatan Penting:
              </strong>{' '}
              Mustawa Publishing adalah penerbit resmi yang berkomitmen untuk
              terdaftar di Perpustakaan Nasional RI. Layanan pengurusan ISBN
              diberikan{' '}
              <strong className="text-slate-800">
                secara gratis sebagai fasilitas dari pemerintah
              </strong>{' '}
              bagi setiap naskah yang memenuhi syarat dan lolos seleksi
              internal untuk diterbitkan oleh kami.{' '}
              <strong className="text-red-600">
                Kami tidak memperjualbelikan nomor ISBN.
              </strong>
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-3">
            Bergabunglah Bersama Kami
          </h3>
          <p className="text-emerald-50 mb-6 max-w-xl mx-auto">
            Jadilah bagian dari gerakan literasi nasional. Kirimkan naskah Anda
            atau jelajahi koleksi buku kami.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/kirim-naskah"
              className="inline-flex items-center justify-center gap-2 bg-white text-emerald-700 hover:bg-emerald-50 font-bold px-6 py-3.5 rounded-xl transition shadow-lg"
            >
              📝 Kirim Naskah
            </Link>
            <Link
              href="/katalog"
              className="inline-flex items-center justify-center gap-2 bg-emerald-800/40 hover:bg-emerald-800/60 border border-white/20 backdrop-blur-sm text-white font-bold px-6 py-3.5 rounded-xl transition"
            >
              📚 Lihat Katalog
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}