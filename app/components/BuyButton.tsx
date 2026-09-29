'use client';

import { useState } from 'react';

// Menambahkan tipe data global agar TypeScript mengenali window.snap
declare global {
  interface Window {
    snap: any;
  }
}

interface BuyButtonProps {
  bookId: string;
  title: string;
  price: number;
}

export default function BuyButton({ bookId, title, price }: BuyButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    try {
      // 1. Minta Token Transaksi dari API Backend Next.js (/api/tokenizer)
      const response = await fetch('/api/tokenizer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: bookId,
          title: title,
          price: price,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Gagal membuat transaksi: ${data.error}`);
        setLoading(false);
        return;
      }

      // 2. Munculkan Popup Midtrans Snap menggunakan token yang didapat
      if (window.snap) {
        window.snap.pay(data.token, {
          onSuccess: function (result: any) {
            alert('Pembayaran Berhasil!');
            console.log('Success:', result);
          },
          onPending: function (result: any) {
            alert('Menunggu pembayaran...');
            console.log('Pending:', result);
          },
          onError: function (result: any) {
            alert('Pembayaran Gagal!');
            console.log('Error:', result);
          },
          onClose: function () {
            alert('Anda menutup halaman pembayaran sebelum selesai.');
          },
        });
      } else {
        alert('Script Midtrans belum siap, coba refresh halaman.');
      }
    } catch (error) {
      console.error('Error payment:', error);
      alert('Terjadi kesalahan saat memproses pembayaran.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400"
    >
      {loading ? 'Memproses...' : `Beli Sekarang (Rp ${price.toLocaleString('id-ID')})`}
    </button>
  );
}