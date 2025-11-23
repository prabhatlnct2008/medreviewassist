import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-200',
        className
      )}
    />
  );
}

// Pre-built skeleton variants
export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-4', i === lines - 1 ? 'w-3/4' : 'w-full')}
        />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
}

export function SkeletonTableRow() {
  return (
    <tr className="border-b">
      <td className="py-3"><Skeleton className="h-4 w-24" /></td>
      <td className="py-3"><Skeleton className="h-4 w-16" /></td>
      <td className="py-3"><Skeleton className="h-4 w-20" /></td>
      <td className="py-3"><Skeleton className="h-4 w-20" /></td>
      <td className="py-3"><Skeleton className="h-6 w-16 rounded-full" /></td>
      <td className="py-3"><Skeleton className="h-4 w-12" /></td>
    </tr>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b">
          <th className="pb-3"><Skeleton className="h-4 w-16" /></th>
          <th className="pb-3"><Skeleton className="h-4 w-12" /></th>
          <th className="pb-3"><Skeleton className="h-4 w-14" /></th>
          <th className="pb-3"><Skeleton className="h-4 w-14" /></th>
          <th className="pb-3"><Skeleton className="h-4 w-14" /></th>
          <th className="pb-3"><Skeleton className="h-4 w-14" /></th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonTableRow key={i} />
        ))}
      </tbody>
    </table>
  );
}

export function SkeletonForm() {
  return (
    <div className="space-y-4">
      <div>
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div>
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div>
        <Skeleton className="h-4 w-16 mb-2" />
        <Skeleton className="h-24 w-full" />
      </div>
      <Skeleton className="h-10 w-24" />
    </div>
  );
}
