'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoonIcon, SunIcon, WalletIcon } from "@heroicons/react/24/outline";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isWalletPage = pathname?.startsWith('/dashboard/') || false;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5" />
      <div className="relative container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-200" />
            <div className="relative bg-background p-2 rounded-lg">
              <WalletIcon className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-xl bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Wallet Tracker
            </h1>
            <p className="text-xs text-muted-foreground">Portfolio Dashboard</p>
          </div>
        </Link>
        
        <div className="flex items-center gap-4">
          {isWalletPage && (
            <Link 
              href="/"
              className="text-sm px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border border-blue-500/20 rounded-lg transition-all duration-200 font-medium"
            >
              ← All Wallets
            </Link>
          )}
          
          {mounted && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="h-9 w-9 p-0"
                    suppressHydrationWarning
                  >
                    <SunIcon className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <MoonIcon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle theme</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </nav>
  );
} 