import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ExclamationTriangleIcon, HomeIcon } from "@heroicons/react/24/outline";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-500/5 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Icon */}
        <div className="mx-auto animate-in zoom-in duration-500 delay-200">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full blur opacity-20" />
            <div className="relative bg-background p-6 rounded-full border border-orange-500/20">
              <ExclamationTriangleIcon className="h-16 w-16 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-foreground">
            Page Not Found
          </h2>
          <p className="text-lg text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        {/* Action Button */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-400">
          <Link href="/">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <HomeIcon className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 