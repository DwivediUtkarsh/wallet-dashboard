'use client';

import { useParams } from 'next/navigation';
import FeeAnalytics from '@/components/fee-analytics';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, ChartBarIcon } from 'lucide-react';

export default function FeeAnalyticsPage() {
  const { wallet } = useParams() as { wallet: string };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-500/5">
      <main className="container mx-auto py-6 px-4 md:px-6">
        {/* Header Section */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Back Button */}
          <div className="mb-6 animate-in fade-in slide-in-from-left-2 duration-500">
            <Link href={`/dashboard/${wallet}`}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border border-blue-500/20 transition-all duration-200 group"
              >
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          
          {/* Title Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center animate-in zoom-in duration-700 delay-200">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur opacity-20" />
                <div className="relative bg-background p-4 rounded-full border border-green-500/20">
                  <ChartBarIcon className="h-8 w-8 text-green-500" />
                </div>
              </div>
            </div>
            
            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                Fee Analytics
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Comprehensive analysis of fee collections and JitoSol conversions for your wallet
              </p>
            </div>

            {/* Wallet Address Display */}
            <div className="inline-block bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg px-4 py-2 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-400">
              <span className="text-xs text-muted-foreground">Analyzing wallet:</span>
              <div className="font-mono text-sm mt-1 break-all">
                {wallet}
              </div>
            </div>
          </div>
        </div>
        
        {/* Analytics Content */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-700 delay-500">
          <FeeAnalytics walletAddress={wallet} />
        </div>
      </main>
    </div>
  );
} 