import { Skeleton } from "@/components/ui/skeleton";
export default function Loading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-lg" />)}
      </div>
      <div className="space-y-2">
        {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}
      </div>
    </div>
  );
}
