'use client';

import { useState } from 'react';
import CheckoutModal from './CheckoutModal';

interface BuyButtonProps {
  bookId: string;
  title: string;
  price: number;
  author?: string;
  format?: string;
  priceEbook?: number | null;
  pricePhysical?: number | null;
  priceBundle?: number | null;
}

export default function BuyButton({
  bookId,
  title,
  price,
  author = '',
  format = 'ebook',
  priceEbook = null,
  pricePhysical = null,
  priceBundle = null,
}: BuyButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const buttonPriceLabel =
    format === 'both' && priceEbook
      ? `Mulai Rp ${Number(priceEbook).toLocaleString('id-ID')}`
      : `Rp ${price.toLocaleString('id-ID')}`;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg transition-colors"
      >
        🛒 Beli Sekarang ({buttonPriceLabel})
      </button>

      {isOpen && (
        <CheckoutModal
          book={{
            id: bookId,
            title,
            author,
            price,
            format,
            price_ebook: priceEbook,
            price_physical: pricePhysical,
            price_bundle: priceBundle,
          }}
          onClose={() => setIsOpen(false)}
          onSuccess={(data) => {
            setIsOpen(false);

            if (typeof window !== 'undefined' && (window as any).snap) {
              (window as any).snap.pay(data.token, {
                onSuccess: function (result: any) {
                  console.log('Success:', result);
                  if (data.orderId) {
                    window.location.href = `/orders/${data.orderId}`;
                  }
                },
                onPending: function (result: any) {
                  console.log('Pending:', result);
                  if (data.orderId) {
                    window.location.href = `/orders/${data.orderId}`;
                  }
                },
                onError: function (result: any) {
                  alert('Pembayaran gagal. Silakan coba lagi.');
                  console.log('Error:', result);
                },
                onClose: function () {
                  alert(
                    'Anda menutup halaman pembayaran sebelum selesai. Anda bisa cek pesanan di portal pesanan.'
                  );
                  if (data.orderId) {
                    window.location.href = `/orders/${data.orderId}`;
                  }
                },
              });
            } else {
              alert('Script Midtrans belum siap. Coba refresh halaman.');
            }
          }}
        />
      )}
    </>
  );
}