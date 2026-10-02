import Link from 'next/link';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header Admin */}
      <header className="bg-slate-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="flex items-center gap-2.5 font-bold text-lg"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-icon.png"
                alt="Mustawa"
                className="h-8 w-11 object-contain flex-shrink-0 bg-white rounded p-0.5"
              />
              <div
                className="hidden sm:flex flex-col justify-center h-9"
                style={{ minWidth: '100px' }}
              >
                <p
                  className="font-bold text-white"
                  style={{
                    fontSize: '13px',
                    lineHeight: '1',
                    letterSpacing: '0.02em',
                  }}
                >
                  MUSTAWA
                </p>
                <p
                  className="text-emerald-400 font-semibold"
                  style={{
                    fontSize: '8px',
                    lineHeight: '1',
                    marginTop: '3px',
                    letterSpacing: '0.28em',
                    paddingLeft: '0.1em',
                  }}
                >
                  PUBLISHING
                </p>
              </div>
            </Link>

            <nav className="hidden md:flex gap-1 text-sm">
              <Link
                href="/admin"
                className="px-3 py-1.5 rounded-md hover:bg-slate-800 hover:text-emerald-400 transition"
              >
                📊 Dashboard
              </Link>
              <Link
                href="/admin/naskah"
                className="px-3 py-1.5 rounded-md hover:bg-slate-800 hover:text-emerald-400 transition"
              >
                📥 Naskah
              </Link>
              <Link
                href="/admin/books"
                className="px-3 py-1.5 rounded-md hover:bg-slate-800 hover:text-emerald-400 transition"
              >
                📚 Buku
              </Link>
              <Link
                href="/admin/orders"
                className="px-3 py-1.5 rounded-md hover:bg-slate-800 hover:text-emerald-400 transition"
              >
                🛒 Pesanan
              </Link>
            </nav>
          </div>

          <Link
            href="/"
            className="text-xs bg-slate-700 hover:bg-emerald-700 px-3 py-1.5 rounded-md transition whitespace-nowrap"
          >
            ← Ke Website
          </Link>
        </div>

        {/* Menu Mobile */}
        <div className="md:hidden border-t border-slate-800 px-4 py-2 flex gap-2 overflow-x-auto">
          <Link
            href="/admin"
            className="text-xs whitespace-nowrap px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 transition"
          >
            📊 Dashboard
          </Link>
          <Link
            href="/admin/naskah"
            className="text-xs whitespace-nowrap px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 transition"
          >
            📥 Naskah
          </Link>
          <Link
            href="/admin/books"
            className="text-xs whitespace-nowrap px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 transition"
          >
            📚 Buku
          </Link>
          <Link
            href="/admin/orders"
            className="text-xs whitespace-nowrap px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 transition"
          >
            🛒 Pesanan
          </Link>
        </div>
      </header>

      {/* Konten Admin */}
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}