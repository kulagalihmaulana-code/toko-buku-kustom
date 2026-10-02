'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type Submission = {
  id: string;
  submission_code: string;
  author_name: string;
  author_email: string;
  author_phone: string | null;
  book_title: string;
  book_category: string | null;
  status: string;
  created_at: string;
};

const STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
  received: { label: '📥 Diterima', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  reviewing: {
    label: '🔍 Direview',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
  },
  accepted: {
    label: '✅ Diterima',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
  },
  rejected: { label: '❌ Ditolak', bg: 'bg-red-50', text: 'text-red-700' },
  published: {
    label: '🎉 Terbit',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
  },
};

export default function AdminNaskahPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filter, setFilter] = useState<string>('all');
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
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false });

      setSubmissions(data || []);
      setLoading(false);
    }

    checkAndFetch();
  }, [router]);

  const filteredSubmissions = submissions
    .filter((s) => filter === 'all' || s.status === filter)
    .filter(
      (s) =>
        s.submission_code.toLowerCase().includes(search.toLowerCase()) ||
        s.book_title?.toLowerCase().includes(search.toLowerCase()) ||
        s.author_name?.toLowerCase().includes(search.toLowerCase()) ||
        s.author_email?.toLowerCase().includes(search.toLowerCase())
    );

  const stats = {
    all: submissions.length,
    received: submissions.filter((s) => s.status === 'received').length,
    reviewing: submissions.filter((s) => s.status === 'reviewing').length,
    accepted: submissions.filter((s) => s.status === 'accepted').length,
    rejected: submissions.filter((s) => s.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Memuat naskah...</p>
      </div>
    );
  }

  const filterTabs = [
    { key: 'all', label: '📋 Semua', count: stats.all, color: 'bg-slate-800' },
    {
      key: 'received',
      label: '📥 Baru',
      count: stats.received,
      color: 'bg-sky-600',
    },
    {
      key: 'reviewing',
      label: '🔍 Direview',
      count: stats.reviewing,
      color: 'bg-amber-600',
    },
    {
      key: 'accepted',
      label: '✅ Diterima',
      count: stats.accepted,
      color: 'bg-emerald-600',
    },
    {
      key: 'rejected',
      label: '❌ Ditolak',
      count: stats.rejected,
      color: 'bg-red-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          📥 Naskah Masuk
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Review naskah dari penulis dan kelola status penerbitan
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs font-semibold text-slate-500 uppercase">
            Total
          </p>
          <p className="text-2xl font-bold text-slate-800 mt-1">
            {stats.all}
          </p>
        </div>
        <div className="bg-emerald-50 p-4 rounded-xl border border-sky-200">
          <p className="text-xs font-semibold text-emerald-700 uppercase">
            Baru
          </p>
          <p className="text-2xl font-bold text-sky-800 mt-1">
            {stats.received}
          </p>
        </div>
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
          <p className="text-xs font-semibold text-amber-700 uppercase">
            Direview
          </p>
          <p className="text-2xl font-bold text-amber-800 mt-1">
            {stats.reviewing}
          </p>
        </div>
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
          <p className="text-xs font-semibold text-emerald-700 uppercase">
            Diterima
          </p>
          <p className="text-2xl font-bold text-emerald-800 mt-1">
            {stats.accepted}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === tab.key
                ? `${tab.color} text-white`
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <input
          type="text"
          placeholder="Cari kode naskah, judul, penulis, atau email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
        />
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {filteredSubmissions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-slate-500 text-sm">
              {search || filter !== 'all'
                ? 'Tidak ada naskah yang cocok'
                : 'Belum ada naskah masuk'}
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
                    Kode & Judul
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">
                    Penulis
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
                {filteredSubmissions.map((sub, index) => {
                  const st = STATUS_MAP[sub.status] || STATUS_MAP.received;
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-center text-slate-500 font-medium">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-mono text-xs text-slate-500">
                          {sub.submission_code}
                        </p>
                        <p className="font-medium text-slate-800 mt-0.5">
                          {sub.book_title}
                        </p>
                        {sub.book_category && (
                          <p className="text-xs text-slate-400 mt-0.5">
                            {sub.book_category}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">
                          {sub.author_name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {sub.author_email}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 text-xs font-semibold rounded ${st.bg} ${st.text}`}
                        >
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">
                        {new Date(sub.created_at).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/naskah/${sub.id}`}
                          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded transition"
                        >
                          Detail
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}