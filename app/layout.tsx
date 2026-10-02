import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mustawa Publishing — Tempat Gagasan Mulia Mulai Dituliskan",
  description:
    "Platform penerbitan mandiri (self-publishing) profesional yang hadir sebagai wadah bagi para penulis untuk melahirkan karya-karya berkualitas, berbobot, dan menginspirasi dunia.",
  keywords: [
    "penerbit buku",
    "self publishing",
    "mustawa publishing",
    "penerbitan mandiri",
    "ISBN gratis",
    "jual buku online",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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