'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type Submission = {
  id: string;
  submission_code: string;
  author_name: string;
  book_title: string;
  book_category: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

const STATUS_MAP: Record<
  string,
  { label: string; color: string; bg: string; icon: string; desc: string }
> = {
  received: {
    label: 'Naskah Diterima',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-sky-200',
    icon: '📥',
    desc: 'Naskah Anda sudah kami terima dan sedang dalam antrian review.',
  },
  reviewing: {
    label: 'Sedang Direview',
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
    icon: '🔍',
    desc: 'Tim editor kami sedang meninjau naskah Anda.',
  },
  accepted: {
    label: 'Diterima',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
    icon: '✅',
    desc: 'Selamat! Naskah Anda lolos seleksi. Kami akan menghubungi Anda untuk proses selanjutnya.',
  },
  rejected: {
    label: 'Belum Dapat Kami Terbitkan',
    color: 'text-red-700',
    bg: 'bg-red-50 border-red-200',
    icon: '❌',
    desc: 'Mohon maaf, naskah Anda belum dapat kami terbitkan saat ini.',
  },
  published: {
    label: 'Sudah Diterbitkan',
    color: 'text-purple-700',
    bg: 'bg-purple-50 border-purple-200',
    icon: '🎉',
    desc: 'Buku Anda sudah resmi diterbitkan oleh Mustawa Publishing!',
  },
};

function CekNaskahContent() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [error, setError] = useState('');

  // Auto-isi kode dari URL
  useEffect(() => {
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      setCode(codeFromUrl);
      handleCheck(codeFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function handleCheck(codeParam?: string) {
    const codeToCheck = (codeParam || code).trim().toUpperCase();

    if (!codeToCheck) {
      setError('Masukkan kode naskah terlebih dahulu');
      return;
    }

    setLoading(true);
    setError('');
    setSubmission(null);

    const { data, error: fetchError } = await supabase
      .from('submissions')
      .select('*')
      .eq('submission_code', codeToCheck)
      .maybeSingle();

    if (fetchError) {
      setError('Terjadi kesalahan: ' + fetchError.message);
      setLoading(false);
      return;
    }

    if (!data) {
      setError(
        'Kode naskah tidak ditemukan. Pastikan kode sesuai dengan yang Anda terima (contoh: NSK-2026-0001).'
      );
      setLoading(false);
      return;
    }

    setSubmission(data);
    setLoading(false);
  }

  const statusInfo = submission ? STATUS_MAP[submission.status] : null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-700 to-teal-700 text-white py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-xs font-medium mb-4">
            🔍 Cek Status Naskah
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            Lacak Naskah Anda
          </h1>
          <p className="text-emerald-50 max-w-xl mx-auto">
            Masukkan kode naskah yang Anda terima saat mengirim naskah untuk
            melihat status terkini.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        {/* Form Pencarian */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Kode Naskah
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Contoh: NSK-2026-0001"
              className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm uppercase"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCheck();
              }}
            />
            <button
              onClick={() => handleCheck()}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl transition disabled:opacity-50 text-sm whitespace-nowrap"
            >
              {loading ? 'Mencari...' : '🔍 Cek Status'}
            </button>
          </div>

          <p className="text-xs text-slate-500 mt-3">
            💡 Kode naskah dikirim ke email Anda saat pertama kali mengirim
            naskah.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
            <p className="text-sm text-red-700">❌ {error}</p>
          </div>
        )}

        {/* Hasil */}
        {submission && statusInfo && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header Kode */}
            <div className="bg-slate-50 p-5 border-b border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                Kode Naskah
              </p>
              <p className="font-mono text-lg font-bold text-slate-800">
                {submission.submission_code}
              </p>
            </div>

            {/* Status Box */}
            <div className={`p-6 border-b border-slate-100 ${statusInfo.bg}`}>
              <div className="flex items-start gap-4">
                <span className="text-3xl flex-shrink-0">
                  {statusInfo.icon}
                </span>
                <div>
                  <p
                    className={`text-lg font-bold mb-1 ${statusInfo.color}`}
                  >
                    {statusInfo.label}
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {statusInfo.desc}
                  </p>
                </div>
              </div>
            </div>

            {/* Detail Naskah */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                    Judul Buku
                  </p>
                  <p className="font-medium text-slate-800">
                    {submission.book_title}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                    Penulis
                  </p>
                  <p className="font-medium text-slate-800">
                    {submission.author_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                    Kategori
                  </p>
                  <p className="text-sm text-slate-700">
                    {submission.book_category || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                    Tanggal Kirim
                  </p>
                  <p className="text-sm text-slate-700">
                    {new Date(submission.created_at).toLocaleDateString(
                      'id-ID',
                      {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      }
                    )}
                  </p>
                </div>
              </div>

              {/* Catatan Admin */}
              {submission.admin_notes && (
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                    📝 Catatan dari Tim Mustawa
                  </p>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                      {submission.admin_notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Info Update */}
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  Terakhir diperbarui:{' '}
                  {new Date(submission.updated_at).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bantuan */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
          <h3 className="font-bold text-emerald-900 mb-2">
            🆘 Tidak menemukan kode Anda?
          </h3>
          <p className="text-sm text-emerald-800 leading-relaxed mb-3">
            Cek folder Spam atau Promotions di email Anda. Jika masih tidak
            ditemukan, hubungi kami dengan menyertakan nama lengkap dan judul
            naskah.
          </p>
          <Link
            href="/kontak"
            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2 rounded-lg text-sm transition"
          >
            Hubungi Kami →
          </Link>
        </div>

        {/* CTA Kirim Naskah */}
        <div className="text-center">
          <p className="text-sm text-slate-500 mb-3">
            Belum pernah mengirim naskah?
          </p>
          <Link
            href="/kirim-naskah"
            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition"
          >
            📝 Kirim Naskah Sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CekNaskahPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-slate-500">Memuat...</p>
        </div>
      }
    >
      <CekNaskahContent />
    </Suspense>
  );
}