'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const isWalletPage = pathname.startsWith('/dashboard/');

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl">
          Wallet Tracker
        </Link>
        
        {isWalletPage && (
          <div className="flex gap-2">
            <Link 
              href="/"
              className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              All Wallets
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
} 