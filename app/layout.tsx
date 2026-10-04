import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://toko-buku-kustom-t4mr.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Mustawa Publishing — Tempat Gagasan Mulia Mulai Dituliskan',
    template: '%s | Mustawa Publishing',
  },
  description:
    'Platform penerbitan mandiri (self-publishing) profesional yang hadir sebagai wadah bagi para penulis untuk melahirkan karya-karya berkualitas, berbobot, dan menginspirasi dunia.',
  keywords: [
    'penerbit buku',
    'self publishing',
    'mustawa publishing',
    'penerbitan mandiri',
    'ISBN gratis',
    'jual buku online',
    'penerbit islami',
    'penerbit buku islami',
    'self publishing indonesia',
    'penerbit buku majalengka',
  ],
  authors: [{ name: 'Mustawa Publishing' }],
  creator: 'Mustawa Publishing',
  publisher: 'Mustawa Publishing',
  applicationName: 'Mustawa Publishing',
  category: 'Publishing',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: baseUrl,
    siteName: 'Mustawa Publishing',
    title: 'Mustawa Publishing — Tempat Gagasan Mulia Mulai Dituliskan',
    description:
      'Platform penerbitan mandiri profesional untuk penulis Indonesia. Dapatkan ISBN gratis dari Perpusnas.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Mustawa Publishing — Tempat Gagasan Mulia Mulai Dituliskan',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mustawa Publishing',
    description: 'Tempat Gagasan Mulia Mulai Dituliskan',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  alternates: {
    canonical: baseUrl,
  },
  verification: {
    // Ganti dengan kode dari Google Search Console nanti
    // google: 'xxxxx',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />

        <main className="flex-1">{children}</main>

        <Footer />

        {/* Script Midtrans Snap Sandbox */}
        <Script
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}