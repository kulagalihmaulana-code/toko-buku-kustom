'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type Order = {
  id: string;
  order_id: string;
  total_amount: number;
  status: string;
  created_at: string;
};

type Profile = {
  full_name: string;
  email: string;
  role: string;
  created_at: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({ total: 0, paid: 0, spent: 0 });

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Ambil profil
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(profileData);

      // Ambil pesanan berdasarkan email user
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_email', user.email)
        .order('created_at', { ascending: false });

      setOrders(ordersData || []);

      // Statistik
      const total = ordersData?.length || 0;
      const paid = ordersData?.filter((o) => o.status === 'paid').length || 0;
      const spent =
        ordersData
          ?.filter((o) => o.status === 'paid')
          .reduce((sum, o) => sum + Number(o.total_amount || 0), 0) || 0;

      setStats({ total, paid, spent });
      setLoading(false);
    }

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Memuat profil...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Profil tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Profil */}
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-bold">
              {profile.full_name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-800">
                {profile.full_name || 'Pembeli'}
              </h1>
              <p className="text-sm text-slate-500">{profile.email}</p>
            </div>
          </div>
        </div>

        {/* Statistik */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase">
              Total Pesanan
            </p>
            <p className="text-3xl font-bold text-slate-800 mt-2">
              {stats.total}
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase">
              Pesanan Lunas
            </p>
            <p className="text-3xl font-bold text-emerald-600 mt-2">
              {stats.paid}
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase">
              Total Belanja
            </p>
            <p className="text-2xl font-bold text-emerald-600 mt-2">
              Rp {stats.spent.toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        {/* Daftar Pesanan */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="font-bold text-slate-800">Riwayat Pesanan</h2>
            <p className="text-xs text-slate-500 mt-1">
              Klik pesanan untuk melihat detail & download e-book
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-4xl mb-3">📚</p>
              <p className="text-slate-500 text-sm">Belum ada pesanan</p>
              <Link
                href="/"
                className="inline-block mt-4 text-sm bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-medium transition"
              >
                Mulai Belanja
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.order_id}`}
                  className="block p-5 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-mono text-xs text-slate-500 truncate">
                          {order.order_id}
                        </p>
                        {order.status === 'paid' ? (
                          <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-emerald-50 text-emerald-700">
                            ✓ Lunas
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-amber-50 text-amber-700">
                            ⏳ Pending
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(order.created_at).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-800">
                        Rp {Number(order.total_amount).toLocaleString('id-ID')}
                      </p>
                      <p className="text-xs text-emerald-600 mt-1">
                        Lihat Detail →
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Info Tambahan */}
        <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-xl">
          <p className="text-sm text-emerald-800">
            💡 <strong>Tips:</strong> Simpan halaman ini sebagai bookmark. Anda
            bisa buka kapan saja untuk mengakses semua e-book yang sudah dibeli.
          </p>
        </div>
      </div>
    </div>
  );
}