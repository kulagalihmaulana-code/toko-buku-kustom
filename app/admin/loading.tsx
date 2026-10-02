import { StatsCardSkeleton, TableSkeleton } from '@/app/components/Skeletons';

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-7 bg-slate-200 rounded w-64 mb-2 animate-pulse"></div>
        <div className="h-4 bg-slate-200 rounded w-96 animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </div>

      <TableSkeleton rows={5} />
    </div>
  );
}