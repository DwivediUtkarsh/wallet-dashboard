'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { usePortfolio } from '@/hooks/use-portfolio';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import TokensTable from '@/components/tokens-table';
import PositionsTable from '@/components/positions-table';
import MarginfiTable from '@/components/marginfi-table';
import KaminoTable from '@/components/kamino-table';
import HyperliquidTable from '@/components/hyperliquid-table';
import EvmDashboard from '@/components/evm-dashboard';
import PortfolioSummaryComponent from '@/components/portfolio-summary';
import FeeGrowthChart from '@/components/fee-growth-chart';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const { wallet } = useParams() as { wallet: string };
  const { data, isLoading, isError, error } = usePortfolio(wallet);

  useEffect(() => {
    if (isError) {
      toast.error(error instanceof Error ? error.message : 'Failed to load portfolio data');
    }
  }, [isError, error]);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(wallet);
    toast.success('Address copied to clipboard');
  };

  // Determine wallet type based on data from API and address format as fallback
  const walletChain = data?.chain || (wallet.startsWith('0x') && wallet.includes('hyper') ? 'hyperliquid' : 
                      wallet.startsWith('0x') ? 'evm' : 'solana');
  
  // Check if we have EVM data
  const hasEvmData = data?.evm_data && data.evm_data.chains && data.evm_data.chains.length > 0;

  return (
    <main className="container mx-auto py-6 px-4 md:px-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Portfolio Dashboard</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="font-mono">{wallet}</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCopyAddress}
            className="h-6 px-2 text-xs"
          >
            Copy
          </Button>
          {walletChain === 'hyperliquid' && (
            <Badge variant="secondary">Hyperliquid</Badge>
          )}
          {walletChain === 'evm' && (
            <Badge variant="secondary">EVM</Badge>
          )}
          {walletChain === 'solana' && (
            <Badge variant="secondary">Solana</Badge>
          )}
        </div>
      </div>

      {isLoading ? (
        <DashboardSkeleton />
      ) : isError ? (
        <div className="flex flex-col items-center justify-center p-8 rounded-lg border border-red-200 bg-red-50 text-red-700">
          <h3 className="text-lg font-medium mb-2">Error Loading Portfolio</h3>
          <p className="text-center text-sm">
            {error instanceof Error ? error.message : 'Failed to fetch portfolio data. Please try again.'}
          </p>
        </div>
      ) : data ? (
        <div className="space-y-6">
          <PortfolioSummaryComponent summary={data.summary} chain={walletChain as 'solana' | 'hyperliquid' | 'evm'} />
          
          {walletChain === 'evm' && hasEvmData ? (
            // Render EVM Dashboard for EVM wallets
            <EvmDashboard data={data.evm_data!} />
          ) : walletChain === 'hyperliquid' ? (
            // Render Hyperliquid Dashboard for Hyperliquid wallets
            <Tabs defaultValue="hyperliquid" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="hyperliquid">Hyperliquid</TabsTrigger>
                <TabsTrigger value="tokens">Tokens</TabsTrigger>
              </TabsList>
              
              <TabsContent value="hyperliquid" className="mt-4">
                <HyperliquidTable 
                  account={data.hyperliquid_account} 
                  positions={data.hyperliquid_positions || []} 
                  staking={data.hyperliquid_staking}
                />
              </TabsContent>
              
              <TabsContent value="tokens" className="mt-4">
                <TokensTable tokens={data.token_balances} />
              </TabsContent>
            </Tabs>
          ) : (
            // Render standard Solana dashboard for Solana wallets
            <Tabs defaultValue="tokens" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="tokens">Tokens</TabsTrigger>
                <TabsTrigger value="whirlpool">Whirlpool</TabsTrigger>
                <TabsTrigger value="raydium">Raydium</TabsTrigger>
                <TabsTrigger value="marginfi">Marginfi</TabsTrigger>
                <TabsTrigger value="kamino">Kamino</TabsTrigger>
                <TabsTrigger value="fees">Fee Growth</TabsTrigger>
              </TabsList>
              
              <TabsContent value="tokens" className="mt-4">
                <TokensTable tokens={data.token_balances} />
              </TabsContent>
              
              <TabsContent value="whirlpool" className="mt-4">
                <PositionsTable 
                  positions={data.whirlpool_positions} 
                  title="Orca Whirlpool Positions" 
                  emptyMessage="No Whirlpool positions found" 
                />
              </TabsContent>
              
              <TabsContent value="raydium" className="mt-4">
                <PositionsTable 
                  positions={data.raydium_positions} 
                  title="Raydium Positions" 
                  emptyMessage="No Raydium positions found" 
                />
              </TabsContent>
              
              <TabsContent value="marginfi" className="mt-4">
                <MarginfiTable accounts={data.marginfi_accounts} />
              </TabsContent>
              
              <TabsContent value="kamino" className="mt-4">
                <KaminoTable accounts={data.kamino_accounts} />
              </TabsContent>
              
              <TabsContent value="fees" className="mt-4">
                <FeeGrowthChart walletAddress={wallet} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      ) : (
        <div className="flex justify-center p-12">
          <p>No data available</p>
        </div>
      )}
    </main>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 