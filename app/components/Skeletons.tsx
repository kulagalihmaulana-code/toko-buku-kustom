export function BookCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 animate-pulse">
      <div className="aspect-[3/4] bg-slate-200"></div>
      <div className="p-5 space-y-3">
        <div className="h-3 bg-slate-200 rounded w-1/3"></div>
        <div className="h-4 bg-slate-200 rounded w-5/6"></div>
        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
        <div className="h-5 bg-slate-200 rounded w-2/5"></div>
      </div>
    </div>
  );
}

export function BookGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <BookCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function OrderRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-3">
        <div className="h-4 bg-slate-200 rounded w-8"></div>
      </td>
      <td className="px-4 py-3">
        <div className="h-3 bg-slate-200 rounded w-32 mb-1"></div>
        <div className="h-3 bg-slate-200 rounded w-24"></div>
      </td>
      <td className="px-4 py-3">
        <div className="h-3 bg-slate-200 rounded w-28"></div>
      </td>
      <td className="px-4 py-3">
        <div className="h-4 bg-slate-200 rounded w-20 ml-auto"></div>
      </td>
    </tr>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-4 py-3 w-12">
              <div className="h-3 bg-slate-200 rounded"></div>
            </th>
            <th className="px-4 py-3">
              <div className="h-3 bg-slate-200 rounded w-24"></div>
            </th>
            <th className="px-4 py-3">
              <div className="h-3 bg-slate-200 rounded w-32"></div>
            </th>
            <th className="px-4 py-3">
              <div className="h-3 bg-slate-200 rounded w-20 ml-auto"></div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {Array.from({ length: rows }).map((_, i) => (
            <OrderRowSkeleton key={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-3 bg-slate-200 rounded w-24"></div>
        <div className="h-6 w-6 bg-slate-200 rounded"></div>
      </div>
      <div className="h-8 bg-slate-200 rounded w-16"></div>
    </div>
  );
}