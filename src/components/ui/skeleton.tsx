import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => {
  return (
    <div className={cn("animate-pulse rounded-md bg-secondary/50", className)} />
  );
};

export const TableSkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32 mr-auto" />
      </div>
      <div className="rounded-xl border border-border/40 overflow-hidden">
        <div className="bg-muted/50 p-4 border-b border-border/40">
          <Skeleton className="h-6 w-full" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 border-b border-border/40 last:border-0 flex gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
};
