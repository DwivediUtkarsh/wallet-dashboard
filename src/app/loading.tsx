import { Skeleton } from "@/components/ui/skeleton";
import { WalletIcon } from "@heroicons/react/24/outline";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-500/5">
      <div className="container mx-auto p-4 space-y-8">
        {/* Hero Section Skeleton */}
        <div className="text-center space-y-4 py-8">
          <Skeleton className="h-12 md:h-16 w-64 md:w-96 mx-auto rounded-lg" />
          <Skeleton className="h-6 w-96 max-w-full mx-auto rounded-lg" />
        </div>

        {/* Portfolio Summary Skeletons */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <div
                key={i}
                className="relative overflow-hidden rounded-lg border-0 shadow-lg bg-card/50 backdrop-blur-sm p-4 space-y-3"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-50" />
                <div className="relative space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="space-y-6">
          {/* Tabs Skeleton */}
          <div className="space-y-6">
            <div className="bg-muted/50 backdrop-blur-sm rounded-lg p-1">
              <div className="grid grid-cols-2 gap-1">
                <Skeleton className="h-10 rounded-md" />
                <Skeleton className="h-10 rounded-md" />
              </div>
            </div>

            {/* Sub Tabs Skeleton */}
            <div className="bg-gradient-to-r from-muted/50 to-muted/30 backdrop-blur-sm rounded-lg p-1">
              <div className="grid grid-cols-5 gap-1">
                {Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-10 rounded-md" />
                ))}
              </div>
            </div>

            {/* Wallet Cards Skeleton */}
            <div className="border-0 shadow-lg bg-card/50 backdrop-blur-sm rounded-lg">
              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                      <WalletIcon className="h-5 w-5 text-white" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                  </div>
                  <Skeleton className="h-10 w-full md:w-1/3" />
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array(6).fill(0).map((_, i) => (
                    <div
                      key={i}
                      className="relative overflow-hidden border-0 shadow-md rounded-lg bg-card/50 backdrop-blur-sm p-4 space-y-3"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-30" />
                      <div className="relative space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-6 w-6 rounded-md" />
                            <Skeleton className="h-4 w-20" />
                          </div>
                          <Skeleton className="h-4 w-4" />
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-6 w-24" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-border/50">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-6 w-20" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 