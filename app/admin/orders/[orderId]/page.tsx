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
  subtotal: number | null;
  status: string;
  created_at: string;
  tracking_number: string | null;
  shipping_name: string | null;
  shipping_phone: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_province: string | null;
  shipping_postal_code: string | null;
  shipping_zone: string | null;
  shipping_cost: number | null;
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
  const [sendingEmail, setSendingEmail] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

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
      setMessageType('error');
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
      setMessageType('error');
    } else {
      setMessage('✅ Nomor resi berhasil disimpan');
      setMessageType('success');
      if (order) setOrder({ ...order, tracking_number: trackingNumber });
    }

    setSaving(false);
    setTimeout(() => setMessage(''), 4000);
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
      setMessageType('error');
    } else {
      setMessage('✅ Status berhasil diupdate');
      setMessageType('success');
      if (order) setOrder({ ...order, status: newStatus });
    }

    setSaving(false);
    setTimeout(() => setMessage(''), 4000);
  }

  async function handleSendTrackingEmail() {
    if (!order || !order.tracking_number) {
      setMessage('Simpan nomor resi terlebih dahulu');
      setMessageType('error');
      return;
    }

    setSendingEmail(true);
    setMessage('');

    try {
      const res = await fetch('/api/notify-shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.order_id }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(
          `✅ Email notifikasi resi terkirim ke ${order.customer_email}`
        );
        setMessageType('success');
      } else {
        setMessage(`❌ Gagal kirim email: ${data.error}`);
        setMessageType('error');
      }
    } catch (err: any) {
      setMessage(`❌ Error: ${err.message}`);
      setMessageType('error');
    }

    setSendingEmail(false);
    setTimeout(() => setMessage(''), 6000);
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
          className="text-emerald-600 hover:underline text-sm mt-4 inline-block"
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

  const hasShippingInfo = !!order.shipping_address;

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

      {/* Pesan */}
      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            messageType === 'success'
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
            <p className="font-bold text-emerald-600 mt-0.5">
              Rp {Number(order.total_amount).toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        {/* Update Status */}
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

      {/* Rincian Biaya */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="font-bold text-slate-800 mb-4">💰 Rincian Biaya</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Subtotal Produk</span>
            <span className="font-medium text-slate-800">
              Rp{' '}
              {Number(
                order.subtotal || order.total_amount - (order.shipping_cost || 0)
              ).toLocaleString('id-ID')}
            </span>
          </div>

          {order.shipping_cost !== null && order.shipping_cost > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-600">
                Ongkos Kirim ({order.shipping_zone === 'jawa' ? 'Dalam Jawa' : 'Luar Jawa'})
              </span>
              <span className="font-medium text-slate-800">
                Rp {Number(order.shipping_cost).toLocaleString('id-ID')}
              </span>
            </div>
          )}

          <div className="flex justify-between pt-2 border-t border-slate-100 font-bold">
            <span className="text-slate-800">Total</span>
            <span className="text-emerald-600">
              Rp {Number(order.total_amount).toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </div>

      {/* Data Pembeli */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="font-bold text-slate-800 mb-4">👤 Data Pembeli</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500 text-xs">Nama</p>
            <p className="font-medium text-slate-800 mt-0.5">
              {order.customer_name}
            </p>
          </div>
          <div>
            <p className="text-slate-500 text-xs">Email</p>
            <a
              href={`mailto:${order.customer_email}`}
              className="font-medium text-emerald-600 hover:underline mt-0.5 block break-all"
            >
              {order.customer_email}
            </a>
          </div>
        </div>
      </div>

      {/* Alamat Pengiriman */}
      {hasShippingInfo && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="font-bold text-slate-800 mb-4">
            📦 Alamat Pengiriman
          </h2>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <p className="font-semibold text-slate-800">
              {order.shipping_name || order.customer_name}
            </p>
            {order.shipping_phone && (
              <p className="text-sm text-slate-600 mt-1">
                📱 {order.shipping_phone}
              </p>
            )}
            <p className="text-sm text-slate-700 mt-2 leading-relaxed">
              {order.shipping_address}
              <br />
              {order.shipping_city}, {order.shipping_province}
              {order.shipping_postal_code && ` ${order.shipping_postal_code}`}
            </p>
          </div>

          {order.shipping_zone && (
            <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-xs text-emerald-700">
                📍 Zona:{' '}
                <strong>
                  {order.shipping_zone === 'jawa'
                    ? 'Dalam Pulau Jawa'
                    : 'Luar Pulau Jawa'}
                </strong>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Item yang Dibeli */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="font-bold text-slate-800 mb-4">
          📚 Item yang Dibeli ({items.length})
        </h2>
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-slate-50 rounded-lg border border-slate-100"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">
                    {item.books?.title || 'Buku'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {item.books?.author} •{' '}
                    <span className="uppercase">{item.books?.format}</span>
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

      {/* Pengiriman Buku Fisik + Resi */}
      {hasPhysical && (
        <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-emerald-200">
          <h2 className="font-bold text-slate-800 mb-4">
            🚚 Pengiriman Buku Fisik
          </h2>

          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Nomor Resi
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Contoh: JNE1234567890"
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
            <button
              onClick={handleSaveTracking}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition disabled:opacity-50 whitespace-nowrap"
            >
              {saving ? 'Menyimpan...' : '💾 Simpan'}
            </button>
          </div>

          {order.tracking_number && (
            <div className="mt-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-xs text-emerald-700 mb-2">
                ✓ Resi saat ini: <strong>{order.tracking_number}</strong>
              </p>
              <button
                onClick={handleSendTrackingEmail}
                disabled={sendingEmail}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 rounded-lg transition disabled:opacity-50"
              >
                {sendingEmail
                  ? 'Mengirim email...'
                  : '📧 Kirim Email Notifikasi Resi ke Pembeli'}
              </button>
            </div>
          )}

          <p className="text-xs text-slate-400 mt-3">
            ℹ️ Setelah resi disimpan, klik tombol di atas untuk kirim email ke
            pembeli.
          </p>
        </div>
      )}

      {/* Portal Pesanan */}
      <div className="bg-slate-100 p-4 rounded-xl text-center">
        <p className="text-xs text-slate-500 mb-2">
          Pembeli bisa akses portal pesanan ini
        </p>
        <Link
          href={`/orders/${order.order_id}`}
          target="_blank"
          className="text-sm text-emerald-600 hover:underline font-medium"
        >
          Buka Portal Pesanan Publik →
        </Link>
      </div>
    </div>
  );
}