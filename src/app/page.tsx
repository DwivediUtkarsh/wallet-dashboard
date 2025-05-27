'use client';

import { usePortfolioSummary, useWallets } from '@/hooks/use-portfolio';
import PortfolioSummaryComponent from '@/components/portfolio-summary';
import WalletList from '@/components/wallet-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SummaryPositionsTable from '@/components/summary-positions-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDollar } from '@/lib/utils';

export default function HomePage() {
  const { data: walletsData, isLoading: isWalletsLoading } = useWallets();
  const { data: summaryData, isLoading: isSummaryLoading } = usePortfolioSummary();

  return (
    <main className="container mx-auto py-6 px-4 md:px-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Portfolio Dashboard</h1>
        <p className="text-gray-500">Combined overview of all tracked wallets</p>
      </div>

      {isSummaryLoading ? (
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      ) : summaryData ? (
        <div className="space-y-6">
          <PortfolioSummaryComponent 
            summary={summaryData.summary}
            walletCount={summaryData.wallet_count}
            isAggregate={true}
          />
          
          <Tabs defaultValue="positions" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="positions">Positions</TabsTrigger>
              <TabsTrigger value="tokens">Tokens</TabsTrigger>
              <TabsTrigger value="lending">Lending</TabsTrigger>
              <TabsTrigger value="wallets">Wallets</TabsTrigger>
            </TabsList>
            
            <TabsContent value="positions" className="mt-4 space-y-6">
              <SummaryPositionsTable 
                positions={summaryData.whirlpool_positions} 
                title="Orca Whirlpool Positions" 
                protocol="whirlpool"
              />
              <SummaryPositionsTable 
                positions={summaryData.raydium_positions} 
                title="Raydium Positions" 
                protocol="raydium"
              />
            </TabsContent>
            
            <TabsContent value="tokens" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Token Holdings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-xs text-gray-500 border-b">
                          <th className="pb-2 font-medium">Token</th>
                          <th className="pb-2 font-medium text-right">Amount</th>
                          <th className="pb-2 font-medium text-right">Price</th>
                          <th className="pb-2 font-medium text-right">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {summaryData.token_balances.map((token) => (
                          <tr key={token.symbol} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3">
                              <div className="font-medium">{token.symbol}</div>
                              <div className="text-xs text-gray-500">{token.name}</div>
                            </td>
                            <td className="py-3 text-right">{token.amount.toFixed(4)}</td>
                            <td className="py-3 text-right">{formatDollar(token.price_usd)}</td>
                            <td className="py-3 text-right font-medium">{formatDollar(token.value_usd)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="lending" className="mt-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Marginfi Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total Collateral Value:</span>
                        <span className="font-medium">{formatDollar(summaryData.marginfi_summary.total_collateral_value)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total Borrow Value:</span>
                        <span className="font-medium">{formatDollar(summaryData.marginfi_summary.total_borrow_value)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Net Value:</span>
                        <span className="font-medium">{formatDollar(summaryData.marginfi_summary.net_value)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Account Count:</span>
                        <span className="font-medium">{summaryData.marginfi_summary.account_count}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Kamino Lend Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total Supplied Value:</span>
                        <span className="font-medium">{formatDollar(summaryData.kamino_lend_summary.total_supplied_value)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total Borrowed Value:</span>
                        <span className="font-medium">{formatDollar(summaryData.kamino_lend_summary.total_borrowed_value)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Net Value:</span>
                        <span className="font-medium">{formatDollar(summaryData.kamino_lend_summary.net_value)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Account Count:</span>
                        <span className="font-medium">{summaryData.kamino_lend_summary.account_count}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="wallets" className="mt-4">
              {isWalletsLoading ? (
                <div className="animate-pulse">
                  <div className="h-64 bg-gray-200 rounded"></div>
                </div>
              ) : walletsData ? (
                <WalletList wallets={walletsData} />
              ) : (
                <p>No wallet data available</p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="text-center py-12">
          <p>No portfolio data available. Please check the backend connection.</p>
        </div>
      )}
    </main>
  );
}
