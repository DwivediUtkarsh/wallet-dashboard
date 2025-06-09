'use client';

import { useWallets, usePortfolioSummary, useTopTokens } from '@/hooks/use-portfolio';
import { useExposure } from '@/hooks/useExposure';
import { useState } from 'react';
import WalletList from '@/components/wallet-list';
import TopTokensTable from '@/components/top-tokens-table';
import ExposureTable from '@/components/exposure-table';
import PortfolioSummaryAggregate from '@/components/portfolio-summary-aggregate';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function HomePage() {
  const { data: walletsData, isLoading: isLoadingWallets } = useWallets();
  const { data: summaryData, isLoading: isLoadingSummary } = usePortfolioSummary();
  const { data: topTokensData, isLoading: isLoadingTopTokens } = useTopTokens(20);
  const { exposures: exposureData, isLoading: isLoadingExposure } = useExposure(20);
  const [activeSection, setActiveSection] = useState('wallets');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-500/5">
      <div className="container mx-auto p-4 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
            Portfolio Dashboard
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Track your multi-chain wallet positions across different protocols with real-time analytics
          </p>
        </div>

        {/* Portfolio Summary */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-700 delay-100">
          {isLoadingSummary ? (
            <Card className="border-0 shadow-lg bg-gradient-to-r from-card/50 to-card/30 backdrop-blur-sm">
              <CardHeader>
                <Skeleton className="h-8 w-1/3" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                  {Array(6).fill(0).map((_, i) => (
                    <div
                      key={i}
                      className="animate-in fade-in zoom-in duration-500"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <Skeleton className="h-32 rounded-lg" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            summaryData && <PortfolioSummaryAggregate data={summaryData} />
          )}
        </div>

        {/* Main Content Tabs */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-700 delay-200">
          <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 p-1 bg-muted/50 backdrop-blur-sm">
              <TabsTrigger value="wallets" className="text-sm font-medium">
                💼 Wallets
              </TabsTrigger>
              <TabsTrigger value="tokens" className="text-sm font-medium">
                🪙 Top Tokens
              </TabsTrigger>
              <TabsTrigger value="exposure" className="text-sm font-medium">
                📊 Exposure
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="wallets" className="space-y-6">
              {isLoadingWallets ? (
                <div className="animate-pulse">
                  <Skeleton className="h-64 rounded-lg" />
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <WalletList wallets={walletsData || []} />
                </div>
              )}
            </TabsContent>
        
            <TabsContent value="tokens">
              {isLoadingTopTokens ? (
                <div className="animate-pulse">
                  <Skeleton className="h-64 rounded-lg" />
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {topTokensData && summaryData && (
                    <TopTokensTable 
                      tokens={topTokensData} 
                      totalPortfolioValue={summaryData.summary.total_value} 
                    />
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="exposure">
              {isLoadingExposure ? (
                <div className="animate-pulse">
                  <Skeleton className="h-64 rounded-lg" />
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {exposureData && (
                    <ExposureTable 
                      exposures={exposureData} 
                    />
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
