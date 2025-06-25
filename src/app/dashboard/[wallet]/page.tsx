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
import SuiDashboard from '@/components/sui-dashboard';
import PortfolioSummaryComponent from '@/components/portfolio-summary';
import FeeGrowthChart from '@/components/fee-growth-chart';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { 
  ChartPieIcon, 
  WalletIcon, 
  DocumentDuplicateIcon,
  ExclamationCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const { wallet } = useParams() as { wallet: string };
  const { data, isLoading, isError, error } = usePortfolio(wallet);

  useEffect(() => {
    if (isError) {
      toast.error(error instanceof Error ? error.message : 'Failed to load portfolio data');
    }
  }, [isError, error]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(wallet);
    toast.success('Address copied to clipboard');
  };

  // Determine wallet type based on data from API and address format as fallback
  const walletChain = data?.chain || (
    wallet.startsWith('0x') && wallet.length === 66 ? 'sui' :
    wallet.startsWith('0x') && wallet.includes('hyper') ? 'hyperliquid' : 
    wallet.startsWith('0x') && wallet.length === 42 ? 'evm' : 
    'solana'
  );
  
  // Check if we have specific chain data
  const hasEvmData = data?.evm_data && data.evm_data.chains && data.evm_data.chains.length > 0;
  const hasSuiData = data?.sui_data && (
    data.sui_data.token_balances.length > 0 || 
    data.sui_data.bluefin_positions.length > 0 || 
    data.sui_data.suilend_positions.length > 0
  );

  const getChainConfig = (chain: string) => {
    switch (chain) {
      case 'solana':
        return {
          name: '🟣 Solana',
          variant: 'default' as const,
          gradient: 'from-purple-500 to-pink-500',
          bgGradient: 'from-purple-500/10 to-pink-500/10'
        };
      case 'evm':
        return {
          name: '🔷 EVM',
          variant: 'secondary' as const,
          gradient: 'from-blue-500 to-indigo-500',
          bgGradient: 'from-blue-500/10 to-indigo-500/10'
        };
      case 'hyperliquid':
        return {
          name: '⚡ Hyperliquid',
          variant: 'outline' as const,
          gradient: 'from-orange-500 to-red-500',
          bgGradient: 'from-orange-500/10 to-red-500/10'
        };
      case 'sui':
        return {
          name: '🌊 Sui',
          variant: 'destructive' as const,
          gradient: 'from-teal-500 to-cyan-500',
          bgGradient: 'from-teal-500/10 to-cyan-500/10'
        };
      default:
        return {
          name: 'Unknown',
          variant: 'outline' as const,
          gradient: 'from-gray-500 to-gray-600',
          bgGradient: 'from-gray-500/10 to-gray-600/10'
        };
    }
  };

  const chainConfig = getChainConfig(walletChain);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-500/5">
    <main className="container mx-auto py-6 px-4 md:px-6">
        {/* Header Section */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                Portfolio Dashboard
              </h1>
              <p className="text-muted-foreground">Detailed analytics for your wallet</p>
            </div>
            
          {walletChain === 'solana' && (
            <Link href={`/dashboard/${wallet}/fee-analytics`}>
                <Button 
                  variant="outline" 
                  className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border-blue-500/20 transition-all duration-200"
                >
                  <ChartPieIcon className="h-4 w-4 mr-2" />
                  Fee Analytics
              </Button>
            </Link>
          )}
        </div>
          
          {/* Wallet Address Card */}
          <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-r ${chainConfig.bgGradient} opacity-30`} />
            <CardContent className="relative p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${chainConfig.gradient} text-white shadow-lg`}>
                    <WalletIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-muted-foreground">Wallet Address</span>
                      <Badge variant={chainConfig.variant} className="text-xs">
                        {chainConfig.name}
                      </Badge>
                    </div>
                    <div className="font-mono text-sm md:text-base break-all">
                      {wallet}
                    </div>
                  </div>
                </div>
                
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCopyAddress}
                  className="bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all duration-200 group ml-auto"
          >
                  <DocumentDuplicateIcon className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  Copy Address
          </Button>
              </div>
            </CardContent>
          </Card>
      </div>

        {/* Content */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-700 delay-100">
      {isLoading ? (
        <DashboardSkeleton />
      ) : isError ? (
            <div className="animate-in zoom-in duration-500">
              <Card className="border-0 shadow-lg bg-red-500/5 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-4 bg-red-500/10 rounded-full">
                      <ExclamationCircleIcon className="h-12 w-12 text-red-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-red-600 mb-2">Error Loading Portfolio</h3>
                      <p className="text-red-600/80 max-w-md">
            {error instanceof Error ? error.message : 'Failed to fetch portfolio data. Please try again.'}
          </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
        </div>
      ) : data ? (
            <div className="space-y-8">
          <PortfolioSummaryComponent summary={data.summary} chain={walletChain as 'solana' | 'hyperliquid' | 'evm' | 'sui'} />
          
          {walletChain === 'evm' && hasEvmData ? (
            <EvmDashboard data={data.evm_data!} />
          ) : walletChain === 'sui' && hasSuiData ? (
            <SuiDashboard data={data.sui_data!} />
          ) : walletChain === 'hyperliquid' ? (
            <Tabs defaultValue="hyperliquid" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 p-1 bg-gradient-to-r from-muted/50 to-muted/30 backdrop-blur-sm">
                    <TabsTrigger value="hyperliquid" className="text-sm font-medium">
                      ⚡ Hyperliquid
                    </TabsTrigger>
                    <TabsTrigger value="tokens" className="text-sm font-medium">
                      🪙 Tokens
                    </TabsTrigger>
              </TabsList>
              
                  <TabsContent value="hyperliquid" className="mt-6">
                <HyperliquidTable 
                  account={data.hyperliquid_account} 
                  positions={data.hyperliquid_positions || []} 
                  staking={data.hyperliquid_staking}
                  spotHoldings={data.hyperliquid_spot_holdings || []}
                />
              </TabsContent>
              
                  <TabsContent value="tokens" className="mt-6">
                <TokensTable tokens={data.token_balances} />
              </TabsContent>
            </Tabs>
          ) : (
            <Tabs defaultValue="tokens" className="w-full">
                  <TabsList className="grid w-full grid-cols-6 p-1 bg-gradient-to-r from-muted/50 to-muted/30 backdrop-blur-sm">
                    <TabsTrigger value="tokens" className="text-xs md:text-sm">🪙 Tokens</TabsTrigger>
                    <TabsTrigger value="whirlpool" className="text-xs md:text-sm">🌊 Whirlpool</TabsTrigger>
                    <TabsTrigger value="raydium" className="text-xs md:text-sm">☀️ Raydium</TabsTrigger>
                    <TabsTrigger value="marginfi" className="text-xs md:text-sm">📊 Marginfi</TabsTrigger>
                    <TabsTrigger value="kamino" className="text-xs md:text-sm">🌾 Kamino</TabsTrigger>
                    <TabsTrigger value="fees" className="text-xs md:text-sm">💰 Fees</TabsTrigger>
              </TabsList>
              
                  <TabsContent value="tokens" className="mt-6">
                <TokensTable tokens={data.token_balances} />
              </TabsContent>
              
                  <TabsContent value="whirlpool" className="mt-6">
                <PositionsTable 
                  positions={data.whirlpool_positions} 
                  title="Orca Whirlpool Positions" 
                  emptyMessage="No Whirlpool positions found" 
                />
              </TabsContent>
              
                  <TabsContent value="raydium" className="mt-6">
                <PositionsTable 
                  positions={data.raydium_positions} 
                  title="Raydium Positions" 
                  emptyMessage="No Raydium positions found" 
                />
              </TabsContent>
              
                  <TabsContent value="marginfi" className="mt-6">
                <MarginfiTable accounts={data.marginfi_accounts} />
              </TabsContent>
              
                  <TabsContent value="kamino" className="mt-6">
                <KaminoTable accounts={data.kamino_accounts} />
              </TabsContent>
              
                  <TabsContent value="fees" className="mt-6">
                <FeeGrowthChart walletAddress={wallet} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      ) : (
            <div className="animate-in zoom-in duration-500">
              <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-4 bg-blue-500/10 rounded-full">
                      <InformationCircleIcon className="h-12 w-12 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">No Portfolio Data</h3>
                      <p className="text-muted-foreground max-w-md">
                        No portfolio data found for this wallet address. The wallet may be empty or not yet indexed.
          </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
    </main>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Portfolio Summary Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array(5).fill(0).map((_, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-lg border-0 shadow-lg bg-card/50 backdrop-blur-sm p-4 space-y-3 animate-in fade-in zoom-in duration-500"
            style={{ animationDelay: `${i * 100}ms` }}
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
      
      {/* Tabs Skeleton */}
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-muted/50 to-muted/30 backdrop-blur-sm rounded-lg p-1">
          <div className="grid grid-cols-6 gap-1">
            {Array(6).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-10 rounded-md" />
            ))}
          </div>
        </div>
        
        {/* Content Skeleton */}
        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
} 