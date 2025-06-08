import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto py-12 px-4">
      <Skeleton className="h-12 w-64 mb-8" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4">
            <Skeleton className="h-5 w-24 mb-3" />
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
      
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 mb-4" />
        
        <div className="border rounded-lg p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 