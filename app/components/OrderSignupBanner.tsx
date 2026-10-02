'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface OrderSignupBannerProps {
  customerEmail: string;
}

export default function OrderSignupBanner({
  customerEmail,
}: OrderSignupBannerProps) {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Cek apakah email user sama dengan email pembeli order
        const sameEmail =
          user.email?.toLowerCase() === customerEmail?.toLowerCase();

        if (sameEmail) {
          setIsLoggedIn(true);
        }
      }

      setLoading(false);
    }

    checkUser();
  }, [customerEmail]);

  // Kalau loading atau user sudah login → jangan tampilkan
  if (loading || isLoggedIn) {
    return null;
  }

  // Kalau belum login → tampilkan banner signup
  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-xl shadow-sm border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <h3 className="font-bold text-base text-slate-100">
          Ingin Akses Permanen?
        </h3>
        <p className="text-xs text-slate-300 mt-1 max-w-md">
          Buat akun dengan email{' '}
          <span className="text-emerald-400 font-medium">
            {customerEmail}
          </span>{' '}
          untuk menyimpan pesanan ini dan mengakses perpustakaan digital Anda
          kapan saja.
        </p>
      </div>
      <Link
        href={`/register?email=${encodeURIComponent(customerEmail)}`}
        className="whitespace-nowrap bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-lg text-xs transition-colors"
      >
        Buat Akun Gratis
      </Link>
    </div>
  );
}