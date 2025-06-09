'use client';

import { useState } from 'react';
import { useFeeCollections } from '@/hooks/use-fee-collections';
import { usePortfolio } from '@/hooks/use-portfolio';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { format } from 'date-fns';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';

interface FeeAnalyticsProps {
  walletAddress: string;
}

export default function FeeAnalytics({ walletAddress }: FeeAnalyticsProps) {
  const [timeframe, setTimeframe] = useState<string>('24h');
  const { data: feeData, isLoading: isLoadingFees, isError: isErrorFees } = useFeeCollections(walletAddress, timeframe);
  const { data: portfolioData, isLoading: isLoadingPortfolio } = usePortfolio(walletAddress);

  // Format USD values
  const formatUsd = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Format date values
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  // Get uncollected fees from portfolio data
  const getUncollectedFees = () => {
    if (!portfolioData) return { total: 0, whirlpool: 0, raydium: 0 };
    
    const whirlpoolFees = portfolioData.whirlpool_positions.reduce(
      (sum, pos) => sum + (pos.uncollected_fees_usd || 0), 0
    );
    
    const raydiumFees = portfolioData.raydium_positions.reduce(
      (sum, pos) => sum + (pos.uncollected_fees_usd || 0), 0
    );
    
    return {
      total: whirlpoolFees + raydiumFees,
      whirlpool: whirlpoolFees,
      raydium: raydiumFees
    };
  };

  // Check if all timestamps are the same (indicates data issue)
  const hasTimestampIssue = () => {
    if (!feeData?.fee_collections?.length) return false;
    const timestamps = feeData.fee_collections.map(c => c.collection_time);
    return timestamps.every(t => t === timestamps[0]);
  };

  const uncollectedFees = getUncollectedFees();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Fee Analytics</h2>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
            <SelectItem value="1y">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Uncollected Fees Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Uncollected Fees</CardTitle>
            <CardDescription>Currently accrued fees</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingPortfolio ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={`position-skeleton-${i}`} className="h-12 w-32" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-2xl font-bold">{formatUsd(uncollectedFees.total)}</div>
                <div className="text-sm text-muted-foreground">
                  <div>Whirlpool: {formatUsd(uncollectedFees.whirlpool)}</div>
                  <div>Raydium: {formatUsd(uncollectedFees.raydium)}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Collected Fees Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Collected Fees</CardTitle>
            <CardDescription>Fees collected in this period</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingFees ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={`collection-skeleton-${i}`} className="h-12 w-32" />
                ))}
              </div>
            ) : isErrorFees ? (
              <div className="text-red-500">Error loading data</div>
            ) : (
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {formatUsd(feeData?.summary.total_collected_usd || 0)}
                </div>
                <div className="text-sm text-muted-foreground">
                  <div>{feeData?.summary.collection_events || 0} collection events</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* JitoSol Conversions Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">JitoSol Conversions</CardTitle>
            <CardDescription>Fees converted to JitoSol</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingFees ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={`conversion-skeleton-${i}`} className="h-12 w-32" />
                ))}
              </div>
            ) : isErrorFees ? (
              <div className="text-red-500">Error loading data</div>
            ) : (
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {formatUsd(feeData?.summary.total_converted_usd || 0)}
                </div>
                <div className="text-sm text-muted-foreground">
                  <div>{feeData?.summary.conversion_events || 0} conversion events</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs for detailed views */}
      <Tabs defaultValue="positions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="positions">Uncollected Fees by Position</TabsTrigger>
          <TabsTrigger value="collections">Fee Collections</TabsTrigger>
          <TabsTrigger value="conversions">JitoSol Conversions</TabsTrigger>
        </TabsList>

        {/* Uncollected Fees by Position */}
        <TabsContent value="positions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Uncollected Fees by Position</CardTitle>
              <CardDescription>
                Current uncollected fees in each liquidity position
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPortfolio ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={`position-skeleton-${i}`} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pool</TableHead>
                      <TableHead>Protocol</TableHead>
                      <TableHead>In Range</TableHead>
                      <TableHead className="text-right">Uncollected Fees</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      ...(portfolioData?.whirlpool_positions || []).map(pos => ({...pos, protocol: 'whirlpool'})),
                      ...(portfolioData?.raydium_positions || []).map(pos => ({...pos, protocol: 'raydium'}))
                    ]
                      .sort((a, b) => (b.uncollected_fees_usd || 0) - (a.uncollected_fees_usd || 0))
                      .map((position, index) => (
                        <TableRow key={`pos-${index}-${position.protocol || 'unknown'}-${position.position_address || position.pool || ''}`}>
                          <TableCell className="font-medium">{position.pool}</TableCell>
                          <TableCell>
                            {position.protocol === 'whirlpool' ? 'Orca Whirlpool' : 'Raydium'}
                          </TableCell>
                          <TableCell>
                            {position.in_range ? (
                              <Badge variant="default" className="bg-green-100 text-green-800">In Range</Badge>
                            ) : (
                              <Badge variant="destructive" className="bg-red-100 text-red-800">Out of Range</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatUsd(position.uncollected_fees_usd || 0)}
                          </TableCell>
                        </TableRow>
                      ))}
                    {(!portfolioData?.whirlpool_positions.length && !portfolioData?.raydium_positions.length) && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          No positions found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fee Collections */}
        <TabsContent value="collections" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Fee Collection Events</CardTitle>
              <CardDescription>
                History of fee collection events detected via Helius API
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingFees ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={`collection-skeleton-${i}`} className="h-12 w-full" />
                  ))}
                </div>
              ) : isErrorFees ? (
                <div className="text-red-500 p-4 text-center">Error loading fee collection data</div>
              ) : !feeData?.fee_collections.length ? (
                <div className="text-center py-8 text-muted-foreground">
                  No fee collection events in the selected timeframe
                </div>
              ) : (
                <div>
                  {hasTimestampIssue() && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <div className="flex">
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800">
                            Data Timestamp Issue
                          </h3>
                          <div className="mt-1 text-sm text-yellow-700">
                            All fee collection events are showing the same timestamp. This indicates the data may need to be refreshed.
                            The portfolio tracking server will automatically update this data on its next run.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Token A</TableHead>
                        <TableHead>Token B</TableHead>
                        <TableHead className="text-right">USD Value</TableHead>
                        <TableHead>Transaction</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {feeData.fee_collections.map((collection, idx) => (
                        <TableRow key={`collection-${idx}-${collection.transaction_signature || collection.id || ''}`}>
                          <TableCell>{collection.collection_time ? formatDate(collection.collection_time) : 'N/A'}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {collection.position_address 
                              ? `${collection.position_address.substring(0, 8)}...${collection.position_address.substring(collection.position_address.length - 4)}`
                              : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{collection.token_a_symbol || 'SOL'}</span>
                              <span className="text-xs text-muted-foreground">
                                {collection.native_transfer_net_sol ? `${collection.native_transfer_net_sol.toFixed(6)}` : '0'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{collection.token_b_symbol || 'Token'}</span>
                              <span className="text-xs text-muted-foreground">
                                {collection.token_amount ? `${collection.token_amount.toFixed(6)}` : '0'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {typeof collection.usd_amount === 'number' 
                              ? formatUsd(collection.usd_amount)
                              : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <a 
                              href={`https://solscan.io/tx/${collection.transaction_signature}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700 text-xs font-mono"
                            >
                              {collection.transaction_signature ? `${collection.transaction_signature.substring(0, 8)}...` : 'N/A'}
                            </a>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* JitoSol Conversions */}
        <TabsContent value="conversions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>JitoSol Conversion Events</CardTitle>
              <CardDescription>
                History of fee conversions to JitoSol
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingFees ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={`conversion-skeleton-${i}`} className="h-12 w-full" />
                  ))}
                </div>
              ) : isErrorFees ? (
                <div className="text-red-500 p-4 text-center">Error loading JitoSol conversion data</div>
              ) : !feeData?.jitosol_conversions.length ? (
                <div className="text-center py-8 text-muted-foreground">
                  No JitoSol conversion events in the selected timeframe
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Increase Amount</TableHead>
                      <TableHead className="text-right">Value (USD)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feeData.jitosol_conversions.map((conversion, idx) => (
                      <TableRow key={`conversion-${idx}-${conversion.id || ''}`}>
                        <TableCell>{formatDate(conversion.conversion_time)}</TableCell>
                        <TableCell>
                          {conversion.conversion_type === 'scheduled_midnight' ? (
                            <Badge variant="outline">Scheduled (12 AM)</Badge>
                          ) : (
                            <Badge variant="outline">Other</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {conversion.increase_amount.toFixed(6)} JitoSOL
                        </TableCell>
                        <TableCell className="text-right">
                          {formatUsd(conversion.value_usd)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 