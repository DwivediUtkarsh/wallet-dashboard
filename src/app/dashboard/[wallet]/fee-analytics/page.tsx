'use client';

import { useParams } from 'next/navigation';
import FeeAnalytics from '@/components/fee-analytics';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function FeeAnalyticsPage() {
  const { wallet } = useParams() as { wallet: string };
  
  return (
    <main className="container mx-auto py-6 px-4 md:px-6">
      <div className="mb-6">
        <Link href={`/dashboard/${wallet}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        
        <h1 className="text-3xl font-bold mb-2">Fee Analytics</h1>
        <div className="text-sm text-gray-500">
          Analyzing fee collections and JitoSol conversions
        </div>
      </div>
      
      <FeeAnalytics walletAddress={wallet} />
    </main>
  );
} 