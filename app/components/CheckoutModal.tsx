'use client';

import { useState, useEffect } from 'react';
import {
  PROVINCES_BY_ZONE,
  calculateShipping,
  formatRupiah,
  type ShippingZone,
} from '@/lib/shipping';

type CheckoutModalProps = {
  book: {
    id: string;
    title: string;
    author: string;
    price: number;
    format: string;
    price_ebook?: number | null;
    price_physical?: number | null;
    price_bundle?: number | null;
  };
  onClose: () => void;
  onSuccess: (orderData: any) => void;
};

type FormatChoice = 'ebook' | 'physical' | 'both';

export default function CheckoutModal({
  book,
  onClose,
  onSuccess,
}: CheckoutModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isBoth = book.format === 'both';

  // STEP 1: pilih format (khusus untuk buku "both")
  // Kalau bukan "both", langsung skip ke step 2
  const [step, setStep] = useState<1 | 2>(isBoth ? 1 : 2);

  // Format choice
  const [formatChoice, setFormatChoice] = useState<FormatChoice>(
    isBoth ? 'both' : (book.format as FormatChoice)
  );

  // Data pembeli
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Data pengiriman
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Harga terpilih
  const getSelectedPrice = () => {
    if (book.format === 'ebook') return Number(book.price);
    if (book.format === 'physical') return Number(book.price);
    if (formatChoice === 'ebook') return Number(book.price_ebook || 0);
    if (formatChoice === 'physical')
      return Number(book.price_physical || 0);
    return Number(book.price_bundle || 0);
  };

  const subtotal = getSelectedPrice();

  const needsShipping =
    formatChoice === 'physical' || formatChoice === 'both';

  // Hitung ongkir
  const [shipping, setShipping] = useState<{
    zone: ShippingZone;
    cost: number;
    label: string;
  } | null>(null);

  useEffect(() => {
    if (needsShipping && province) {
      setShipping(calculateShipping(province));
    } else {
      setShipping(null);
    }
  }, [province, needsShipping]);

  const shippingCost = needsShipping && shipping ? shipping.cost : 0;
  const total = subtotal + shippingCost;

  // Hitung hemat bundle
  const bundleSave =
    book.format === 'both'
      ? Number(book.price_ebook || 0) +
        Number(book.price_physical || 0) -
        Number(book.price_bundle || 0)
      : 0;

  // Label format untuk Step 2
  const formatLabel =
    formatChoice === 'ebook'
      ? '📱 E-Book Saja'
      : formatChoice === 'physical'
      ? '📦 Buku Fisik'
      : '📚 Bundle E-Book + Fisik';

  const apiFormatType =
    book.format === 'both' ? formatChoice : book.format;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/tokenizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: book.id,
          customerName: name,
          customerEmail: email,
          formatType: apiFormatType,
          shipping: needsShipping
            ? {
                name,
                phone,
                address,
                city,
                province,
                postalCode,
                zone: shipping?.zone,
                cost: shippingCost,
              }
            : null,
          subtotal,
          total,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal membuat transaksi');
      }

      onSuccess(data);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 p-4 sm:p-5 border-b border-slate-200 flex items-start justify-between gap-3 bg-white rounded-t-2xl">
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-slate-800 text-base sm:text-lg">
              {step === 1 ? '🎯 Pilih Format Buku' : '🛒 Informasi Pembeli'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {step === 1
                ? 'Pilih format yang Anda inginkan'
                : 'Isi data untuk menerima invoice & akses buku'}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-shrink-0 text-slate-400 hover:text-slate-600 text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition disabled:opacity-50"
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* ============================================ */}
          {/* STEP 1: PILIH FORMAT */}
          {/* ============================================ */}
          {step === 1 && isBoth && (
            <div className="p-4 sm:p-5 space-y-5">
              {/* Ringkasan Buku */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                  Buku yang Dibeli
                </p>
                <p className="font-bold text-slate-800">{book.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  oleh {book.author}
                </p>
              </div>

              {/* Opsi Format */}
              <div>
                <h3 className="font-semibold text-slate-800 text-sm mb-3">
                  🎯 Pilih Format
                </h3>
                <div className="space-y-2">
                  {/* E-Book */}
                  <label
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${
                      formatChoice === 'ebook'
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="format"
                      value="ebook"
                      checked={formatChoice === 'ebook'}
                      onChange={() => setFormatChoice('ebook')}
                      className="accent-emerald-600 w-4 h-4"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 text-sm">
                        📱 E-Book Saja
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Download PDF, langsung akses setelah bayar
                      </p>
                    </div>
                    <span className="font-bold text-emerald-600 text-sm whitespace-nowrap">
                      {formatRupiah(Number(book.price_ebook || 0))}
                    </span>
                  </label>

                  {/* Fisik */}
                  <label
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${
                      formatChoice === 'physical'
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="format"
                      value="physical"
                      checked={formatChoice === 'physical'}
                      onChange={() => setFormatChoice('physical')}
                      className="accent-emerald-600 w-4 h-4"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 text-sm">
                        📦 Buku Fisik Saja
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Dikirim ke alamat Anda
                      </p>
                    </div>
                    <span className="font-bold text-emerald-600 text-sm whitespace-nowrap">
                      {formatRupiah(Number(book.price_physical || 0))}
                    </span>
                  </label>

                  {/* Bundle */}
                  <label
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition relative ${
                      formatChoice === 'both'
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {bundleSave > 0 && (
                      <span className="absolute -top-2 right-4 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
                        ⭐ HEMAT {formatRupiah(bundleSave)}
                      </span>
                    )}
                    <input
                      type="radio"
                      name="format"
                      value="both"
                      checked={formatChoice === 'both'}
                      onChange={() => setFormatChoice('both')}
                      className="accent-emerald-600 w-4 h-4"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 text-sm">
                        📚 E-Book + Buku Fisik
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Dapat keduanya, lebih hemat!
                      </p>
                    </div>
                    <span className="font-bold text-emerald-600 text-sm whitespace-nowrap">
                      {formatRupiah(Number(book.price_bundle || 0))}
                    </span>
                  </label>
                </div>
              </div>

              {/* Tombol Lanjut */}
              <button
                onClick={() => setStep(2)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition"
              >
                Lanjut Isi Data →
              </button>
            </div>
          )}

          {/* ============================================ */}
          {/* STEP 2: ISI DATA */}
          {/* ============================================ */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  ❌ {error}
                </div>
              )}

              {/* Info format terpilih + tombol ganti */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-emerald-700 uppercase">
                    Format Dipilih
                  </p>
                  <p className="font-bold text-slate-800 text-sm mt-0.5 truncate">
                    {formatLabel}
                  </p>
                </div>
                {isBoth && (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-700 font-semibold px-3 py-1.5 rounded-lg transition whitespace-nowrap"
                  >
                    🔄 Ganti
                  </button>
                )}
              </div>

              {/* DATA PEMBELI */}
              <div>
                <h3 className="font-semibold text-slate-800 text-sm mb-3">
                  👤 Data Pembeli
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      placeholder="Nama penerima"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Aktif *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      placeholder="email@contoh.com"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      {needsShipping
                        ? 'Invoice & link download ke email ini'
                        : 'Link download ebook ke email ini'}
                    </p>
                  </div>
                </div>
              </div>

              {/* DATA PENGIRIMAN */}
              {needsShipping && (
                <div className="border-t border-slate-100 pt-5">
                  <h3 className="font-semibold text-slate-800 text-sm mb-3">
                    📦 Alamat Pengiriman
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nomor WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        placeholder="08xxxxxxxxxx"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Provinsi *
                        </label>
                        <select
                          required
                          value={province}
                          onChange={(e) => setProvince(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        >
                          <option value="">-- Pilih provinsi --</option>
                          <optgroup label="📍 Pulau Jawa">
                            {PROVINCES_BY_ZONE.jawa.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="📍 Luar Pulau Jawa">
                            {PROVINCES_BY_ZONE.luar_jawa.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </optgroup>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Kota/Kabupaten *
                        </label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                          placeholder="Contoh: Bandung"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Alamat Lengkap *
                      </label>
                      <textarea
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Kode Pos
                      </label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        placeholder="45411"
                        maxLength={5}
                      />
                    </div>

                    {shipping && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <p className="text-xs text-emerald-800">
                          📍 Zona: <strong>{shipping.label}</strong>
                        </p>
                        <p className="text-xs text-emerald-700 mt-1">
                          Ongkir:{' '}
                          <strong>{formatRupiah(shipping.cost)}</strong>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* RINGKASAN PEMBAYARAN */}
              <div className="border-t border-slate-100 pt-5">
                <h3 className="font-semibold text-slate-800 text-sm mb-3">
                  💰 Ringkasan Pembayaran
                </h3>
                <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">{formatLabel}</span>
                    <span className="font-medium text-slate-800">
                      {formatRupiah(subtotal)}
                    </span>
                  </div>

                  {needsShipping && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Ongkos kirim</span>
                      <span className="font-medium text-slate-800">
                        {shipping ? formatRupiah(shippingCost) : '—'}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between">
                    <span className="font-bold text-slate-800">
                      Total Bayar
                    </span>
                    <span className="font-bold text-emerald-600 text-lg">
                      {formatRupiah(total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tombol */}
              <div className="flex gap-3 pt-2 pb-2">
                {isBoth ? (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    disabled={loading}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 rounded-xl transition disabled:opacity-50"
                  >
                    ← Kembali
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 rounded-xl transition disabled:opacity-50"
                  >
                    Batal
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading || subtotal <= 0}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
                >
                  {loading ? 'Memproses...' : `Bayar ${formatRupiah(total)}`}
                </button>
              </div>

              <p className="text-center text-xs text-slate-500 pb-2">
                🔒 Pembayaran aman via Midtrans
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}