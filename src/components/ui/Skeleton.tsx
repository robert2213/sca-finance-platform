import clsx from "clsx";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...rest }: SkeletonProps) {
  return <div className={clsx("skeleton-shimmer", className)} {...rest} />;
}

export function KPICardSkeleton() {
  return (
    <div className="card p-5 flex flex-col gap-3">
      <Skeleton className="h-3 w-24 rounded" />
      <Skeleton className="h-8 w-32 rounded" />
      <Skeleton className="h-3 w-20 rounded" />
      <Skeleton className="h-6 w-full rounded-lg" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card">
      <div className="card-header">
        <Skeleton className="h-5 w-48 rounded" />
        <Skeleton className="h-3 w-32 rounded mt-2" />
      </div>
      <div className="divide-y divide-slate-50">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-6 py-4 flex items-center gap-4">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40 rounded" />
              <Skeleton className="h-3 w-28 rounded" />
            </div>
            <Skeleton className="h-4 w-16 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
            <Skeleton className="h-6 w-20 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div className="card">
      <div className="card-header">
        <Skeleton className="h-5 w-64 rounded" />
        <Skeleton className="h-3 w-40 rounded mt-2" />
      </div>
      <div className="card-body flex items-end gap-2 pt-6" style={{ height }}>
        {[65, 85, 55, 90, 70, 95, 60].map((h, i) => (
          <div key={i} className="flex-1 flex flex-col gap-1 items-center">
            <Skeleton className="w-full rounded-t" style={{ height: `${h}%` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="card flex flex-col h-[560px]">
      <div className="card-header flex items-center gap-3">
        <Skeleton className="w-9 h-9 rounded-xl" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-3 w-32 rounded" />
        </div>
      </div>
      <div className="flex-1 p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`flex gap-3 ${i % 2 === 0 ? "justify-end" : ""}`}>
            {i % 2 !== 0 && <Skeleton className="w-7 h-7 rounded-lg shrink-0" />}
            <Skeleton className={`h-16 rounded-2xl ${i % 2 === 0 ? "w-48" : "w-64"}`} />
          </div>
        ))}
      </div>
      <div className="border-t border-slate-100 p-4">
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}
