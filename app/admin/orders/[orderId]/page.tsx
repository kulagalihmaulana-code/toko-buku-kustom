'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type Order = {
  id: string;
  order_id: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: string;
  created_at: string;
  shipping_address?: string;
  tracking_number?: string;
};

type OrderItem = {
  id: string;
  order_id: string;
  book_id: string;
  quantity: number;
  price: number;
  books?: {
    title: string;
    author: string;
    format: string;
  };
};

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function checkAndFetch() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        alert('Anda bukan admin');
        router.push('/');
        return;
      }

      // Ambil order
      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (!orderData) {
        setLoading(false);
        return;
      }

      setOrder(orderData);
      setTrackingNumber(orderData.tracking_number || '');

      // Ambil order items
      const { data: itemsData } = await supabase
        .from('order_items')
        .select('*, books(title, author, format)')
        .eq('order_id', orderId);

      setItems(itemsData || []);
      setLoading(false);
    }

    checkAndFetch();
  }, [router, orderId]);

  async function handleSaveTracking() {
    if (!trackingNumber.trim()) {
      setMessage('Nomor resi tidak boleh kosong');
      return;
    }

    setSaving(true);
    setMessage('');

    const { error } = await supabase
      .from('orders')
      .update({ tracking_number: trackingNumber })
      .eq('order_id', orderId);

    if (error) {
      setMessage('❌ Gagal simpan: ' + error.message);
    } else {
      setMessage('✅ Nomor resi berhasil disimpan');
      if (order) setOrder({ ...order, tracking_number: trackingNumber });
    }

    setSaving(false);
  }

  async function handleUpdateStatus(newStatus: string) {
    setSaving(true);
    setMessage('');

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('order_id', orderId);

    if (error) {
      setMessage('❌ Gagal update status: ' + error.message);
    } else {
      setMessage('✅ Status berhasil diupdate menjadi ' + newStatus);
      if (order) setOrder({ ...order, status: newStatus });
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Memuat detail pesanan...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Pesanan tidak ditemukan</p>
        <Link
          href="/admin/orders"
          className="text-blue-600 hover:underline text-sm mt-4 inline-block"
        >
          ← Kembali ke Daftar Pesanan
        </Link>
      </div>
    );
  }

  const hasPhysical = items.some(
    (item) =>
      item.books?.format === 'physical' || item.books?.format === 'both'
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/orders"
          className="text-sm text-slate-500 hover:text-slate-700 inline-flex items-center gap-1"
        >
          ← Kembali ke Daftar Pesanan
        </Link>
        <h1 className="text-2xl font-bold text-slate-800 mt-2">Detail Pesanan</h1>
        <p className="font-mono text-xs text-slate-500 mt-1">{order.order_id}</p>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.startsWith('✅')
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message}
        </div>
      )}

      {/* Status & Tanggal */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-800">Status Pesanan</h2>
          {order.status === 'paid' ? (
            <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">
              ✓ Lunas
            </span>
          ) : (
            <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">
              ⏳ Pending
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500 text-xs">Tanggal Pesanan</p>
            <p className="font-medium text-slate-800 mt-0.5">
              {new Date(order.created_at).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <div>
            <p className="text-slate-500 text-xs">Total Pembayaran</p>
            <p className="font-bold text-sky-600 mt-0.5">
              Rp {Number(order.total_amount).toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        {/* Update Status Buttons */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-500 mb-2">Ubah status:</p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleUpdateStatus('pending')}
              disabled={saving || order.status === 'pending'}
              className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 px-3 py-1.5 rounded disabled:opacity-50"
            >
              ⏳ Pending
            </button>
            <button
              onClick={() => handleUpdateStatus('paid')}
              disabled={saving || order.status === 'paid'}
              className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded disabled:opacity-50"
            >
              ✓ Lunas
            </button>
          </div>
        </div>
      </div>

      {/* Data Pembeli */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="font-bold text-slate-800 mb-4">Data Pembeli</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500 text-xs">Nama</p>
            <p className="font-medium text-slate-800 mt-0.5">
              {order.customer_name}
            </p>
          </div>
          <div>
            <p className="text-slate-500 text-xs">Email</p>
            <p className="font-medium text-slate-800 mt-0.5 break-all">
              {order.customer_email}
            </p>
          </div>
        </div>
      </div>

      {/* Item yang Dibeli */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="font-bold text-slate-800 mb-4">
          Item yang Dibeli ({items.length})
        </h2>
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-slate-50 rounded-lg border border-slate-100"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-slate-800">
                    {item.books?.title || 'Buku'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {item.books?.author} • {item.books?.format}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">
                    {item.quantity} × Rp{' '}
                    {Number(item.price).toLocaleString('id-ID')}
                  </p>
                  <p className="font-bold text-slate-800 mt-0.5">
                    Rp{' '}
                    {Number(item.price * item.quantity).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input Resi (Kalau Ada Buku Fisik) */}
      {hasPhysical && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="font-bold text-slate-800 mb-4">
            📦 Pengiriman Buku Fisik
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Pesanan ini mencakup buku fisik. Masukkan nomor resi setelah
            dikirim.
          </p>

          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Nomor Resi
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Contoh: JNE1234567890"
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              onClick={handleSaveTracking}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>

          {order.tracking_number && (
            <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-xs text-emerald-700">
                ✓ Resi saat ini: <strong>{order.tracking_number}</strong>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Link ke Portal Pesanan */}
      <div className="bg-slate-100 p-4 rounded-xl text-center">
        <p className="text-xs text-slate-500 mb-2">
          Pembeli bisa akses portal pesanan ini
        </p>
        <Link
          href={`/orders/${order.order_id}`}
          target="_blank"
          className="text-sm text-blue-600 hover:underline font-medium"
        >
          Buka Portal Pesanan Publik →
        </Link>
      </div>
    </div>
  );
}