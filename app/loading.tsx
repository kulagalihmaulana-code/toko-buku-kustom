export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero skeleton */}
      <section className="bg-gradient-to-br from-emerald-700 to-teal-700 py-20 px-4">
        <div className="max-w-6xl mx-auto animate-pulse">
          <div className="h-6 bg-white/20 rounded-full w-64 mb-6"></div>
          <div className="h-12 bg-white/20 rounded w-96 mb-4"></div>
          <div className="h-6 bg-white/20 rounded w-80 mb-8"></div>
          <div className="flex gap-3">
            <div className="h-12 bg-white/20 rounded-xl w-40"></div>
            <div className="h-12 bg-white/20 rounded-xl w-40"></div>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm mt-4">Memuat...</p>
        </div>
      </div>
    </div>
  );
}