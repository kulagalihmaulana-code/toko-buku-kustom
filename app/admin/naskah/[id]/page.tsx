'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type Submission = {
  id: string;
  submission_code: string;
  author_name: string;
  author_email: string;
  author_phone: string | null;
  author_bio: string | null;
  book_title: string;
  book_category: string | null;
  book_synopsis: string;
  estimated_pages: number | null;
  manuscript_url: string | null;
  manuscript_filename: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

const STATUS_OPTIONS = [
  {
    value: 'received',
    label: '📥 Diterima',
    desc: 'Naskah baru masuk, belum direview',
    color: 'bg-emerald-50 text-emerald-700 border-sky-200',
  },
  {
    value: 'reviewing',
    label: '🔍 Sedang Direview',
    desc: 'Tim editor sedang meninjau naskah',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    value: 'accepted',
    label: '✅ Diterima',
    desc: 'Naskah lolos seleksi, siap proses penerbitan',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    value: 'rejected',
    label: '❌ Ditolak',
    desc: 'Naskah belum dapat diterbitkan',
    color: 'bg-red-50 text-red-700 border-red-200',
  },
  {
    value: 'published',
    label: '🎉 Sudah Terbit',
    desc: 'Buku sudah resmi diterbitkan',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
  },
];

export default function AdminNaskahDetailPage() {
  const router = useRouter();
  const params = useParams();
  const submissionId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [status, setStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>(
    'success'
  );
  const [downloadUrl, setDownloadUrl] = useState('');

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

      const { data: sub } = await supabase
        .from('submissions')
        .select('*')
        .eq('id', submissionId)
        .single();

      if (!sub) {
        router.push('/admin/naskah');
        return;
      }

      setSubmission(sub);
      setStatus(sub.status);
      setAdminNotes(sub.admin_notes || '');

      // Generate signed URL untuk file naskah (berlaku 1 jam)
      if (sub.manuscript_url) {
        const { data: signed } = await supabase.storage
          .from('manuscripts')
          .createSignedUrl(sub.manuscript_url, 3600);

        if (signed) setDownloadUrl(signed.signedUrl);
      }

      setLoading(false);
    }

    checkAndFetch();
  }, [router, submissionId]);

  async function handleSave() {
    setSaving(true);
    setMessage('');

    const statusChanged = submission && submission.status !== status;

    // 1. Update submission di database
    const { error } = await supabase
      .from('submissions')
      .update({
        status,
        admin_notes: adminNotes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', submissionId);

    if (error) {
      setMessage('❌ Gagal menyimpan: ' + error.message);
      setMessageType('error');
      setSaving(false);
      return;
    }

    // 2. Kalau status berubah, kirim email notifikasi
    if (statusChanged && submission) {
      try {
        const res = await fetch('/api/notify-submission', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            submissionId,
            newStatus: status,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          setMessage(
            `✅ Status diperbarui & email notifikasi terkirim ke ${submission.author_email}`
          );
          setMessageType('success');
        } else {
          setMessage(
            `⚠️ Status diperbarui, tapi email gagal terkirim: ${
              data.error || 'Unknown error'
            }`
          );
          setMessageType('error');
        }
      } catch (err: any) {
        setMessage(
          `⚠️ Status diperbarui, tapi email gagal dikirim (network error)`
        );
        setMessageType('error');
      }
    } else {
      setMessage('✅ Perubahan berhasil disimpan (status tidak berubah)');
      setMessageType('success');
    }

    // 3. Update state local
    if (submission) {
      setSubmission({
        ...submission,
        status,
        admin_notes: adminNotes,
        updated_at: new Date().toISOString(),
      });
    }

    setSaving(false);

    // Auto-dismiss pesan setelah 5 detik
    setTimeout(() => setMessage(''), 5000);
  }

  async function handleConvertToBook() {
    if (
      !confirm(
        'Ubah naskah ini menjadi buku di katalog? Anda akan diarahkan ke halaman upload buku dengan data terisi otomatis.'
      )
    ) {
      return;
    }

    router.push(`/admin/books/new?from_submission=${submissionId}`);
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Memuat naskah...</p>
      </div>
    );
  }

  if (!submission) return null;

  const statusInfo = STATUS_OPTIONS.find((s) => s.value === submission.status);
  const hasStatusChanged = submission.status !== status;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/naskah"
          className="text-sm text-slate-500 hover:text-slate-700 inline-flex items-center gap-1"
        >
          ← Kembali ke Daftar Naskah
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-2">
          <div>
            <p className="font-mono text-xs text-slate-500">
              {submission.submission_code}
            </p>
            <h1 className="text-2xl font-bold text-slate-800 mt-1">
              {submission.book_title}
            </h1>
          </div>
          {statusInfo && (
            <span
              className={`inline-block px-3 py-1.5 text-xs font-semibold rounded-full border ${statusInfo.color}`}
            >
              {statusInfo.label}
            </span>
          )}
        </div>
      </div>

      {/* Pesan */}
      {message && (
        <div
          className={`p-4 rounded-xl text-sm ${
            messageType === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}
        >
          {message}
        </div>
      )}

      {/* Data Penulis */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          👤 Data Penulis
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-slate-500 uppercase">Nama</p>
            <p className="font-medium text-slate-800 mt-0.5">
              {submission.author_name}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase">Email</p>
            <a
              href={`mailto:${submission.author_email}`}
              className="font-medium text-emerald-600 hover:underline mt-0.5 block break-all"
            >
              {submission.author_email}
            </a>
          </div>
          {submission.author_phone && (
            <div>
              <p className="text-xs text-slate-500 uppercase">WhatsApp</p>
              <a
                href={`https://wa.me/${submission.author_phone.replace(
                  /\D/g,
                  ''
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-emerald-600 hover:underline mt-0.5 block"
              >
                {submission.author_phone}
              </a>
            </div>
          )}
          {submission.book_category && (
            <div>
              <p className="text-xs text-slate-500 uppercase">Kategori</p>
              <p className="font-medium text-slate-800 mt-0.5">
                {submission.book_category}
              </p>
            </div>
          )}
          {submission.estimated_pages && (
            <div>
              <p className="text-xs text-slate-500 uppercase">
                Estimasi Halaman
              </p>
              <p className="font-medium text-slate-800 mt-0.5">
                {submission.estimated_pages} hlm
              </p>
            </div>
          )}
          <div>
            <p className="text-xs text-slate-500 uppercase">Tanggal Kirim</p>
            <p className="font-medium text-slate-800 mt-0.5">
              {new Date(submission.created_at).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        {submission.author_bio && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500 uppercase mb-1">
              Biografi Penulis
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">
              {submission.author_bio}
            </p>
          </div>
        )}
      </div>

      {/* Sinopsis */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          📖 Sinopsis Naskah
        </h2>
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
          {submission.book_synopsis}
        </p>
      </div>

      {/* File Naskah */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          📎 File Naskah
        </h2>
        {submission.manuscript_filename ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📄</span>
              <div>
                <p className="text-sm font-medium text-slate-800 break-all">
                  {submission.manuscript_filename}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Klik tombol di kanan untuk download
                </p>
              </div>
            </div>
            {downloadUrl ? (
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition whitespace-nowrap"
              >
                📥 Download Naskah
              </a>
            ) : (
              <span className="text-xs text-slate-500">Generating link...</span>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-500">File naskah tidak tersedia</p>
        )}
        <p className="text-xs text-slate-400 mt-3">
          ℹ️ Link download berlaku 1 jam. Refresh halaman jika expired.
        </p>
      </div>

      {/* Update Status & Notes */}
      <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-emerald-200">
        <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          ⚙️ Update Status & Catatan
        </h2>

        {/* Notifikasi email */}
        {hasStatusChanged && (
          <div className="mb-5 p-3 bg-emerald-600 border border-emerald-200 rounded-lg">
            <p className="text-xs text-emerald-800">
              📧 <strong>Status akan berubah.</strong> Email notifikasi akan
              otomatis dikirim ke{' '}
              <strong>{submission.author_email}</strong> saat Anda klik Simpan.
            </p>
          </div>
        )}

        {/* Status Options */}
        <div className="space-y-2 mb-6">
          <p className="text-sm font-semibold text-slate-700 mb-3">
            Status Naskah:
          </p>
          {STATUS_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition ${
                status === opt.value
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="status"
                value={opt.value}
                checked={status === opt.value}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-0.5 accent-emerald-600"
              />
              <div className="flex-1">
                <p className="font-semibold text-slate-800 text-sm">
                  {opt.label}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>

        {/* Admin Notes */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            📝 Catatan untuk Penulis
          </label>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={5}
            placeholder="Catatan ini akan terlihat oleh penulis di halaman Cek Naskah & email. Kosongkan jika tidak ada catatan."
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
          <p className="text-xs text-slate-500 mt-1">
            💡 Catatan akan muncul di halaman Cek Naskah & email ke penulis.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : '💾 Simpan Perubahan'}
          </button>

          {submission.status === 'accepted' && (
            <button
              onClick={handleConvertToBook}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition"
            >
              📚 Ubah Jadi Buku
            </button>
          )}
        </div>
      </div>

      {/* Info Bantuan */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
        <p className="text-xs text-emerald-800 leading-relaxed">
          💡 <strong>Tips:</strong> Setelah naskah berstatus{' '}
          <strong>"Diterima"</strong>, klik tombol{' '}
          <strong>"Ubah Jadi Buku"</strong> untuk upload buku tersebut ke
          katalog dengan data penulis yang sudah terisi otomatis.
        </p>
      </div>
    </div>
  );
}