'use client';

import { useState } from 'react';

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
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Kirim data buku + customer_details ke API Tokenizer
      const response = await fetch('/api/tokenizer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: bookId,
          title: title,
          price: price,
          customerDetails: {
            first_name: name,
            email: email,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Gagal membuat transaksi: ${data.error}`);
        setLoading(false);
        return;
      }

      // Tutup modal form setelah token berhasil didapatkan
      setIsOpen(false);

      // 2. Munculkan Popup Midtrans Snap
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
    <>
      {/* Tombol Beli Utama */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
      >
        Beli Sekarang (Rp {price.toLocaleString('id-ID')})
      </button>

      {/* Pop-up Modal Form Input Email & Nama */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md text-gray-800">
            <h3 className="text-xl font-bold mb-1">Informasi Pembeli</h3>
            <p className="text-sm text-gray-500 mb-4">
              Masukkan email Anda untuk menerima invoice digital dan akses buku.
            </p>

            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Galih Maulana"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alamat Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <p className="text-xs text-amber-600 mt-1">
                  *Gunakan email akun Resend Anda untuk pengujian mode Sandbox.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors disabled:bg-gray-400"
                >
                  {loading ? 'Memproses...' : 'Lanjut Bayar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}