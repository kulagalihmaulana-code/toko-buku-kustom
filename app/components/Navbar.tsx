'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cek user saat ini
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);

      // Cek apakah admin
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        setIsAdmin(profile?.role === 'admin');
      }

      setLoading(false);
    });

    // Dengarkan perubahan login/logout
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);

        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          setIsAdmin(profile?.role === 'admin');
        } else {
          setIsAdmin(false);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-bold text-lg text-gray-900">
          📚 Toko Buku Digital
        </Link>

        {/* Menu Kanan */}
        <div className="flex items-center gap-4">
          {loading ? (
            <span className="text-sm text-gray-400">...</span>
          ) : user ? (
            <>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-sm bg-slate-800 text-white px-3 py-1.5 rounded-md hover:bg-slate-700 font-medium"
                >
                  🛠️ Admin
                </Link>
              )}
              <Link
                href="/profile"
                className="text-sm text-gray-700 hover:text-blue-600 font-medium"
              >
                {user.user_metadata?.full_name || user.email}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-gray-700 hover:text-blue-600 font-medium"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
              >
                Daftar
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}