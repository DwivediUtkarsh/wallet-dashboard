'use client';

import { useWallets, usePortfolioSummary } from '@/hooks/use-portfolio';
import { useState } from 'react';
import WalletList from '@/components/wallet-list';
import PortfolioSummaryAggregate from '@/components/portfolio-summary-aggregate';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function HomePage() {
  const { data: walletsData, isLoading: isLoadingWallets } = useWallets();
  const { data: summaryData, isLoading: isLoadingSummary } = usePortfolioSummary();
  const [activeTab, setActiveTab] = useState('all');

  // Group wallets by chain if available
  const solanaWallets = walletsData?.filter(wallet => wallet.chain === 'solana') || [];
  const evmWallets = walletsData?.filter(wallet => wallet.chain === 'evm') || [];
  const hyperliquidWallets = walletsData?.filter(wallet => wallet.chain === 'hyperliquid') || [];

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Portfolio Dashboard</h1>
      
      {isLoadingSummary ? (
              <Card>
                <CardHeader>
            <Skeleton className="h-8 w-1/3" />
                </CardHeader>
                <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array(4).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-32" />
                        ))}
                  </div>
                </CardContent>
              </Card>
      ) : (
        summaryData && <PortfolioSummaryAggregate data={summaryData} />
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Wallets</TabsTrigger>
          <TabsTrigger value="solana">Solana</TabsTrigger>
          <TabsTrigger value="evm">EVM</TabsTrigger>
          <TabsTrigger value="hyperliquid">Hyperliquid</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          {isLoadingWallets ? (
            <Skeleton className="h-64" />
          ) : (
            <WalletList wallets={walletsData || []} />
          )}
        </TabsContent>
        <TabsContent value="solana">
          {isLoadingWallets ? (
            <Skeleton className="h-64" />
          ) : (
            <WalletList wallets={solanaWallets} />
          )}
            </TabsContent>
        <TabsContent value="evm">
          {isLoadingWallets ? (
            <Skeleton className="h-64" />
          ) : (
            <WalletList wallets={evmWallets} />
          )}
            </TabsContent>
        <TabsContent value="hyperliquid">
          {isLoadingWallets ? (
            <Skeleton className="h-64" />
          ) : (
            <WalletList wallets={hyperliquidWallets} />
              )}
            </TabsContent>
          </Tabs>
        </div>
  );
}
