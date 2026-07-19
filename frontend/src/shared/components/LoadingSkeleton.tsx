import { cn } from '@/shared/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  count?: number;
}

export function LoadingSkeleton({ className, count = 1 }: LoadingSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn('h-4 bg-soft-pink rounded animate-pulse', className)}
        />
      ))}
    </div>
  );
}
