'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type OrderItem = {
  books?: {
    title: string;
  };
};

type Order = {
  id: string;
  order_id: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: string;
  created_at: string;
  order_items?: OrderItem[];
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [search, setSearch] = useState('');

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

      const { data } = await supabase
        .from('orders')
        .select('*, order_items(books(title))')
        .order('created_at', { ascending: false });

      setOrders(data || []);
      setLoading(false);
    }

    checkAndFetch();
  }, [router]);

  const filteredOrders = orders
    .filter((o) => filter === 'all' || o.status === filter)
    .filter((o) => {
      const matchSearch =
        o.order_id.toLowerCase().includes(search.toLowerCase()) ||
        o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
        o.customer_email?.toLowerCase().includes(search.toLowerCase());

      const matchBook = o.order_items?.some((item) =>
        item.books?.title?.toLowerCase().includes(search.toLowerCase())
      );

      return matchSearch || matchBook;
    });

  const stats = {
    all: orders.length,
    paid: orders.filter((o) => o.status === 'paid').length,
    pending: orders.filter((o) => o.status === 'pending').length,
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Memuat pesanan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Daftar Pesanan</h1>
        <p className="text-slate-500 text-sm mt-1">
          Total {orders.length} pesanan
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === 'all'
              ? 'bg-slate-800 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
          }`}
        >
          Semua ({stats.all})
        </button>
        <button
          onClick={() => setFilter('paid')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === 'paid'
              ? 'bg-emerald-600 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
          }`}
        >
          ✅ Lunas ({stats.paid})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === 'pending'
              ? 'bg-amber-600 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
          }`}
        >
          ⏳ Pending ({stats.pending})
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <input
          type="text"
          placeholder="Cari order ID, nama, email, atau judul buku..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      {/* Tabel Pesanan */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-400 text-sm">
              {search || filter !== 'all'
                ? 'Tidak ada pesanan yang cocok'
                : 'Belum ada pesanan'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600 w-12">
                    No
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">
                    Order & Buku
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">
                    Pembeli
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">
                    Total
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">
                    Tanggal
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order, index) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-center text-slate-500 font-medium">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs font-medium text-slate-800">
                        {order.order_id}
                      </p>
                      {order.order_items && order.order_items.length > 0 && (
                        <p className="text-xs text-slate-600 mt-1">
                          📚{' '}
                          {order.order_items
                            .map((item) => item.books?.title || 'Buku')
                            .join(', ')}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">
                        {order.customer_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {order.customer_email}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-800">
                      Rp {Number(order.total_amount).toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {order.status === 'paid' ? (
                        <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-emerald-50 text-emerald-700">
                          ✓ Lunas
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-amber-50 text-amber-700">
                          ⏳ Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">
                      {new Date(order.created_at).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/orders/${order.order_id}`}
                        className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded transition"
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}