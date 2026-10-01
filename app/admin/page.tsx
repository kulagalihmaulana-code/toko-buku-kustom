'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalOrders: 0,
    paidOrders: 0,
    revenue: 0,
  });

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Cek role admin
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

      setIsAdmin(true);

      // Ambil statistik
      const [booksRes, ordersRes] = await Promise.all([
        supabase.from('books').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('*'),
      ]);

      const orders = ordersRes.data || [];
      const paidOrders = orders.filter((o) => o.status === 'paid');
      const revenue = paidOrders.reduce(
        (sum, o) => sum + Number(o.total_amount || 0),
        0
      );

      setStats({
        totalBooks: booksRes.count || 0,
        totalOrders: orders.length,
        paidOrders: paidOrders.length,
        revenue,
      });

      setLoading(false);
    }

    checkAdmin();
  }, [router]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Memverifikasi akses admin...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Admin</h1>
        <p className="text-slate-500 text-sm mt-1">
          Selamat datang! Kelola toko buku digital Anda dari sini.
        </p>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Buku"
          value={stats.totalBooks}
          icon="📚"
          color="blue"
        />
        <StatCard
          title="Total Pesanan"
          value={stats.totalOrders}
          icon="🛒"
          color="purple"
        />
        <StatCard
          title="Pesanan Lunas"
          value={stats.paidOrders}
          icon="✅"
          color="emerald"
        />
        <StatCard
          title="Total Pendapatan"
          value={`Rp ${stats.revenue.toLocaleString('id-ID')}`}
          icon="💰"
          color="amber"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="font-bold text-slate-800 mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/admin/books/new"
            className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition"
          >
            <span className="text-2xl">➕</span>
            <div>
              <p className="font-semibold text-slate-800 text-sm">Upload Buku Baru</p>
              <p className="text-xs text-slate-500">Tambah e-book atau buku fisik</p>
            </div>
          </Link>

          <Link
            href="/admin/orders"
            className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition"
          >
            <span className="text-2xl">📦</span>
            <div>
              <p className="font-semibold text-slate-800 text-sm">Lihat Pesanan</p>
              <p className="text-xs text-slate-500">Kelola & kirim pesanan</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'purple' | 'emerald' | 'amber';
}) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200',
    purple: 'bg-purple-50 border-purple-200',
    emerald: 'bg-emerald-50 border-emerald-200',
    amber: 'bg-amber-50 border-amber-200',
  };

  return (
    <div className={`p-4 rounded-xl border ${colors[color]}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-600 uppercase">{title}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-slate-800 mt-2">{value}</p>
    </div>
  );
}