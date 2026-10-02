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
    totalSubmissions: 0,
    newSubmissions: 0,
    acceptedSubmissions: 0,
  });

  useEffect(() => {
    async function checkAdmin() {
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

      setIsAdmin(true);

      // Ambil semua statistik sekaligus
      const [booksRes, ordersRes, submissionsRes] = await Promise.all([
        supabase.from('books').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('*'),
        supabase.from('submissions').select('*'),
      ]);

      const orders = ordersRes.data || [];
      const paidOrders = orders.filter((o) => o.status === 'paid');
      const revenue = paidOrders.reduce(
        (sum, o) => sum + Number(o.total_amount || 0),
        0
      );

      const submissions = submissionsRes.data || [];
      const newSubmissions = submissions.filter(
        (s) => s.status === 'received'
      ).length;
      const acceptedSubmissions = submissions.filter(
        (s) => s.status === 'accepted'
      ).length;

      setStats({
        totalBooks: booksRes.count || 0,
        totalOrders: orders.length,
        paidOrders: paidOrders.length,
        revenue,
        totalSubmissions: submissions.length,
        newSubmissions,
        acceptedSubmissions,
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Dashboard Mustawa Publishing
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Kelola penerbitan, naskah, buku, dan pesanan dari sini.
        </p>
      </div>

      {/* Notifikasi Naskah Baru */}
      {stats.newSubmissions > 0 && (
        <Link
          href="/admin/naskah?filter=received"
          className="flex items-center gap-4 p-4 bg-amber-50 border-2 border-amber-300 rounded-xl hover:bg-amber-100 transition"
        >
          <span className="text-3xl">🔔</span>
          <div className="flex-1">
            <p className="font-bold text-amber-900">
              {stats.newSubmissions} naskah baru menunggu review!
            </p>
            <p className="text-sm text-amber-700 mt-0.5">
              Klik untuk melihat dan meninjau naskah dari penulis.
            </p>
          </div>
          <span className="text-amber-600 text-xl">→</span>
        </Link>
      )}

      {/* Statistik Naskah */}
      <div>
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
          📥 Naskah
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Naskah"
            value={stats.totalSubmissions}
            icon="📄"
            color="blue"
          />
          <StatCard
            title="Naskah Baru"
            value={stats.newSubmissions}
            icon="🔔"
            color="amber"
            highlight={stats.newSubmissions > 0}
          />
          <StatCard
            title="Diterima"
            value={stats.acceptedSubmissions}
            icon="✅"
            color="emerald"
          />
        </div>
      </div>

      {/* Statistik Toko */}
      <div>
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
          🛒 Toko Buku
        </h2>
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
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="font-bold text-slate-800 mb-4">⚡ Aksi Cepat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/admin/naskah"
            className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:border-emerald-400 hover:bg-emerald-50 transition"
          >
            <span className="text-2xl">📥</span>
            <div>
              <p className="font-semibold text-slate-800 text-sm">
                Review Naskah
              </p>
              <p className="text-xs text-slate-500">
                Tinjau naskah dari penulis
              </p>
            </div>
          </Link>

          <Link
            href="/admin/books/new"
            className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:border-emerald-400 hover:bg-emerald-50 transition"
          >
            <span className="text-2xl">➕</span>
            <div>
              <p className="font-semibold text-slate-800 text-sm">
                Upload Buku
              </p>
              <p className="text-xs text-slate-500">
                Tambah buku ke katalog
              </p>
            </div>
          </Link>

          <Link
            href="/admin/orders"
            className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:border-emerald-400 hover:bg-emerald-50 transition"
          >
            <span className="text-2xl">📦</span>
            <div>
              <p className="font-semibold text-slate-800 text-sm">
                Lihat Pesanan
              </p>
              <p className="text-xs text-slate-500">
                Kelola & kirim pesanan
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Alur Kerja */}
      <div className="bg-gradient-to-br from-slate-50 to-emerald-50 p-6 rounded-xl border border-emerald-200">
        <h2 className="font-bold text-slate-800 mb-4">📖 Alur Kerja Penerbitan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <span className="text-emerald-600 font-bold">1.</span>{' '}
            <span className="text-slate-700">Penulis kirim naskah</span>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <span className="text-emerald-600 font-bold">2.</span>{' '}
            <span className="text-slate-700">Anda review & ubah status</span>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <span className="text-emerald-600 font-bold">3.</span>{' '}
            <span className="text-slate-700">Upload buku ke katalog</span>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <span className="text-emerald-600 font-bold">4.</span>{' '}
            <span className="text-slate-700">Pembeli beli & ebook terkirim</span>
          </div>
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
  highlight = false,
}: {
  title: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'purple' | 'emerald' | 'amber';
  highlight?: boolean;
}) {
  const colors = {
    blue: 'bg-emerald-600 border-emerald-200',
    purple: 'bg-purple-50 border-purple-200',
    emerald: 'bg-emerald-50 border-emerald-200',
    amber: 'bg-amber-50 border-amber-200',
  };

  return (
    <div
      className={`p-4 rounded-xl border ${colors[color]} ${
        highlight ? 'ring-2 ring-amber-400 animate-pulse' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-600 uppercase">
          {title}
        </p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-slate-800 mt-2">{value}</p>
    </div>
  );
}