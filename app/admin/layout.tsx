import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import Link from 'next/link';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ⚠️ PENTING: layout ini butuh pengecekan di server
  // Tapi karena kita pakai @supabase/supabase-js (bukan @supabase/ssr),
  // kita pakai alternatif: cek via client-side di halaman masing-masing
  // Untuk sementara, tampilkan navigasi admin + children

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header Admin */}
      <header className="bg-slate-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-bold text-lg">
              🛠️ Admin Panel
            </Link>
            <nav className="hidden sm:flex gap-4 text-sm">
              <Link href="/admin" className="hover:text-sky-400 transition">
                Dashboard
              </Link>
              <Link href="/admin/books" className="hover:text-sky-400 transition">
                Buku
              </Link>
              <Link href="/admin/orders" className="hover:text-sky-400 transition">
                Pesanan
              </Link>
            </nav>
          </div>
          <Link
            href="/"
            className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded transition"
          >
            ← Ke Toko
          </Link>
        </div>
      </header>

      {/* Konten Admin */}
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}