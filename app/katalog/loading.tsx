import { BookGridSkeleton } from '@/app/components/Skeletons';

export default function KatalogLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header skeleton */}
      <section className="bg-gradient-to-br from-emerald-700 to-teal-700 text-white py-14 px-4">
        <div className="max-w-6xl mx-auto animate-pulse">
          <div className="h-6 bg-white/20 rounded-full w-48 mb-4"></div>
          <div className="h-10 bg-white/20 rounded w-64 mb-3"></div>
          <div className="h-4 bg-white/20 rounded w-96 max-w-full"></div>
        </div>
      </section>

      {/* Filter skeleton */}
      <section className="max-w-6xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-5">
          <div className="h-10 bg-slate-200 rounded-xl animate-pulse"></div>
        </div>
      </section>

      {/* Grid skeleton */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-6">
          <div className="h-4 bg-slate-200 rounded w-48 animate-pulse"></div>
        </div>
        <BookGridSkeleton count={8} />
      </section>
    </div>
  );
}