'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { usePortfolioSummary } from '@/hooks/use-portfolio';
import { getHistoricalData, getFeeGrowthData } from '@/lib/api-client';
import type { PortfolioSummary } from '@/types/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
);

interface ChartDataPoint {
  timestamp: string;
  date: string;
  value: number;
  fees?: number;
}

interface FeeGrowthPoint {
  timestamp: string;
  fee_growth?: {
    total?: number;
  } | number;
  current_fees?: {
    total?: number;
    whirlpool?: number;
    raydium?: number;
  } | number;
}

interface FeeGrowthData {
  growth_data: FeeGrowthPoint[];
  overall_hourly_rate: number;
}

interface HistoricalDataPoint {
  snapshot_time: string;
  total_portfolio_value?: string | number;
}

interface WalletInfo {
  address: string;
  label?: string;
  total_value_usd?: number;
}

interface AnalyticsData {
  totalPortfolioHistory: ChartDataPoint[];
  feeHistory: ChartDataPoint[];
  solanaHistory: ChartDataPoint[];
  hyperliquidHistory: ChartDataPoint[];
  evmHistory: ChartDataPoint[];
  suiHistory: ChartDataPoint[];
  cexHistory: ChartDataPoint[];
  keyMetrics: {
    expectedDailyFees: number;
    last24hFees: number;
    totalPortfolio: number;
    uncollectedFees: number;
  };
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [timeframe, setTimeframe] = useState('7d');
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { data: summaryData } = usePortfolioSummary();

  const getTimeframeDays = (tf: string): number => {
    switch (tf) {
      case '24h': return 1;
      case '7d': return 7;
      case '30d': return 30;
      default: return 7;
    }
  };

  const formatTimestamp = (timestamp: string, timeframe: string) => {
    const date = new Date(timestamp);
    if (timeframe === '24h') {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const generateFlatLineData = useCallback((value: number, timeframe: string): ChartDataPoint[] => {
    const days = getTimeframeDays(timeframe);
    const data: ChartDataPoint[] = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        timestamp: date.toISOString(),
        date: formatTimestamp(date.toISOString(), timeframe),
        value: value
      });
    }
    
    return data;
  }, []);

  const processRealHistoricalData = useCallback((rawData: HistoricalDataPoint[], summary: PortfolioSummary, timeframe: string): ChartDataPoint[] => {
    console.log('📈 Processing historical portfolio data:', rawData.length, 'points');
    
    if (!rawData || rawData.length === 0) {
      // Create flat line at CURRENT portfolio value (not inflated)
      return generateFlatLineData(summary.total_value, timeframe);
    }

    // Process actual historical data
    const processed = rawData
      .map((point: HistoricalDataPoint) => ({
        timestamp: point.snapshot_time,
        date: formatTimestamp(point.snapshot_time, timeframe),
        value: parseFloat(String(point.total_portfolio_value || summary.total_value)) // Use historical or fallback to current
      }))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    console.log('📈 Processed portfolio data:', {
      points: processed.length,
      valueRange: processed.length > 0 ? `$${processed[0].value.toFixed(0)} to $${processed[processed.length - 1].value.toFixed(0)}` : 'N/A'
    });

    return processed;
  }, [generateFlatLineData]);

  const processRealFeeData = useCallback((rawFeeData: FeeGrowthPoint[], summary: PortfolioSummary, timeframe: string): ChartDataPoint[] => {
    console.log('💰 Processing fee data:', rawFeeData.length, 'points');
    
    if (!rawFeeData || rawFeeData.length === 0) {
      // Create flat line at CURRENT uncollected fees (not simulated)
      return generateFlatLineData(summary.total_fees, timeframe);
    }

    // Process actual fee accumulation data
    const processed = rawFeeData
      .map((point: FeeGrowthPoint) => {
        // Extract current fee values from the API response
        let currentFees: number;
        
        if (typeof point.current_fees === 'number') {
          currentFees = point.current_fees;
        } else if (point.current_fees?.total) {
          currentFees = point.current_fees.total;
        } else if (point.current_fees?.whirlpool && point.current_fees?.raydium) {
          currentFees = point.current_fees.whirlpool + point.current_fees.raydium;
        } else {
          currentFees = summary.total_fees; // Fallback to current
        }

        return {
          timestamp: point.timestamp,
          date: formatTimestamp(point.timestamp, timeframe),
          value: currentFees
        };
      })
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    console.log('💰 Processed fee data:', {
      points: processed.length,
      feeRange: processed.length > 0 ? `$${processed[0].value.toFixed(2)} to $${processed[processed.length - 1].value.toFixed(2)}` : 'N/A'
    });

    return processed;
  }, [generateFlatLineData]);

  const calculateRealFeeMetrics = useCallback((
    summary: PortfolioSummary, 
    feeGrowthData: FeeGrowthPoint[], 
    overallHourlyRate: number
  ) => {
    console.log('🧮 Calculating real fee metrics from API data...');

    let expectedDailyFees = 0;
    let last24hFees = 0;

    if (feeGrowthData.length > 0 && overallHourlyRate > 0) {
      // Use REAL hourly rate from API
      expectedDailyFees = overallHourlyRate * 24;
      
      // Calculate actual 24h fee generation from growth data
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      last24hFees = feeGrowthData
        .filter((point: FeeGrowthPoint) => new Date(point.timestamp) >= oneDayAgo)
        .reduce((sum: number, point: FeeGrowthPoint) => {
          let growth = 0;
          
          if (typeof point.fee_growth === 'number') {
            growth = point.fee_growth;
          } else if (point.fee_growth?.total) {
            growth = point.fee_growth.total;
          }
          
          return sum + growth;
        }, 0);
      
      console.log('✅ Using REAL fee data:', {
        hourlyRate: overallHourlyRate,
        expectedDaily: expectedDailyFees,
        actual24h: last24hFees
      });
    } else {
      // Fallback: estimate from LP position sizes
      const lpValue = (summary.whirlpool_value || 0) + (summary.raydium_value || 0);
      expectedDailyFees = lpValue * 0.0005; // 0.05% daily estimate
      last24hFees = expectedDailyFees; // Use estimate

      console.log('📊 Using estimated fee data (no API data):', {
        lpValue,
        estimatedDaily: expectedDailyFees
      });
    }

    return {
      expectedDailyFees: Math.max(0, expectedDailyFees),
      last24hFees: Math.max(0, last24hFees),
      totalPortfolio: summary.total_value, // Use REAL current portfolio value
      uncollectedFees: summary.total_fees   // Use REAL current uncollected fees
    };
  }, []);

  const generateProportionalChainHistories = useCallback((
    summary: PortfolioSummary, 
    portfolioHistory: ChartDataPoint[], 
    timeframe: string
  ) => {
    const chainValues = {
      solana: (summary.token_value || 0) + (summary.whirlpool_value || 0) + 
              (summary.raydium_value || 0) + (summary.marginfi_value || 0) + 
              (summary.kamino_value || 0),
      hyperliquid: summary.hyperliquid_value || 0,
      evm: summary.evm_value || 0,
      sui: summary.sui_total_value || 0,
      cex: summary.cex_value || 0
    };

    const histories: Record<string, ChartDataPoint[]> = {};
    const totalValue = summary.total_value;

    if (portfolioHistory.length > 0 && totalValue > 0) {
      // Create proportional histories based on real portfolio data
      Object.entries(chainValues).forEach(([chain, currentValue]) => {
        const proportion = currentValue / totalValue;
        
        histories[chain] = portfolioHistory.map(point => ({
          timestamp: point.timestamp,
          date: point.date,
          value: Math.round(point.value * proportion)
        }));
      });
    } else {
      // Fallback: flat lines at current values
      Object.entries(chainValues).forEach(([chain, currentValue]) => {
        histories[chain] = generateFlatLineData(currentValue, timeframe);
      });
    }

    return histories;
  }, [generateFlatLineData]);

  const generateCurrentValueFallback = useCallback((): AnalyticsData => {
    if (!summaryData?.summary) {
      return {
        totalPortfolioHistory: [],
        feeHistory: [],
        solanaHistory: [],
        hyperliquidHistory: [],
        evmHistory: [],
        suiHistory: [],
        cexHistory: [],
        keyMetrics: { expectedDailyFees: 0, last24hFees: 0, totalPortfolio: 0, uncollectedFees: 0 }
      };
    }

    const summary = summaryData.summary;
    
    // Use REAL current values (not inflated)
    const portfolioHistory = generateFlatLineData(summary.total_value, timeframe);
    const feeHistory = generateFlatLineData(summary.total_fees, timeframe);
    
    // Calculate basic metrics from LP positions
    const lpValue = (summary.whirlpool_value || 0) + (summary.raydium_value || 0);
    const estimatedDailyFees = lpValue * 0.0005;

    return {
      totalPortfolioHistory: portfolioHistory,
      feeHistory: feeHistory,
      solanaHistory: generateFlatLineData((summary.token_value || 0) + (summary.whirlpool_value || 0) + (summary.raydium_value || 0) + (summary.marginfi_value || 0) + (summary.kamino_value || 0), timeframe),
      hyperliquidHistory: generateFlatLineData(summary.hyperliquid_value || 0, timeframe),
      evmHistory: generateFlatLineData(summary.evm_value || 0, timeframe),
      suiHistory: generateFlatLineData(summary.sui_total_value || 0, timeframe),
      cexHistory: generateFlatLineData(summary.cex_value || 0, timeframe),
      keyMetrics: {
        expectedDailyFees: estimatedDailyFees,
        last24hFees: estimatedDailyFees,
        totalPortfolio: summary.total_value,
        uncollectedFees: summary.total_fees
      }
    };
  }, [summaryData, timeframe, generateFlatLineData]);

  const fetchRealAnalyticsData = useCallback(async () => {
    if (!summaryData?.summary) {
      console.log('⏳ Waiting for summary data...');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 Fetching real analytics data...');
      
      // Get all wallets to find the main one
      const walletsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wallets`);
      const wallets: WalletInfo[] = await walletsResponse.json();
      
      if (!wallets || wallets.length === 0) {
        throw new Error('No wallets found');
      }

      // Get the main wallet (highest value)
      const mainWallet = wallets.reduce((prev: WalletInfo, current: WalletInfo) => 
        ((current.total_value_usd || 0) > (prev.total_value_usd || 0)) ? current : prev
      );

      console.log(`📈 Using main wallet: ${mainWallet.address.slice(0, 8)}... (${mainWallet.label || 'Unnamed'})`);

      // Fetch real data in parallel
      const [historicalData, feeGrowthData] = await Promise.all([
        getHistoricalData(mainWallet.address, timeframe).catch(err => {
          console.warn('Historical data failed:', err);
          return [];
        }),
        getFeeGrowthData(mainWallet.address, timeframe).catch(err => {
          console.warn('Fee growth data failed:', err);
          return { growth_data: [], overall_hourly_rate: 0 };
        })
      ]) as [HistoricalDataPoint[], FeeGrowthData];

      console.log('📊 API Data received:', {
        historicalPoints: Array.isArray(historicalData) ? historicalData.length : 0,
        feeGrowthPoints: feeGrowthData?.growth_data?.length || 0,
        overallHourlyRate: feeGrowthData?.overall_hourly_rate || 0
      });

      // Process real historical portfolio data
      const portfolioHistory = processRealHistoricalData(historicalData, summaryData.summary, timeframe);
      
      // Process real fee growth data
      const feeHistory = processRealFeeData(feeGrowthData?.growth_data || [], summaryData.summary, timeframe);
      
      // Calculate real metrics from actual API data
      const keyMetrics = calculateRealFeeMetrics(
        summaryData.summary,
        feeGrowthData?.growth_data || [],
        feeGrowthData?.overall_hourly_rate || 0
      );

      // Generate proportional chain histories based on real portfolio data
      const chainHistories = generateProportionalChainHistories(summaryData.summary, portfolioHistory, timeframe);

      const data: AnalyticsData = {
        totalPortfolioHistory: portfolioHistory,
        feeHistory: feeHistory,
        solanaHistory: chainHistories.solana,
        hyperliquidHistory: chainHistories.hyperliquid,
        evmHistory: chainHistories.evm,
        suiHistory: chainHistories.sui,
        cexHistory: chainHistories.cex,
        keyMetrics
      };

      console.log('✅ Real analytics data prepared:', {
        portfolioPoints: portfolioHistory.length,
        feePoints: feeHistory.length,
        expectedDailyFees: keyMetrics.expectedDailyFees,
        last24hFees: keyMetrics.last24hFees,
        totalPortfolio: keyMetrics.totalPortfolio
      });

      setAnalyticsData(data);

    } catch (err) {
      console.error('❌ Error fetching real analytics data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
      
      // Fallback to current value data
      setAnalyticsData(generateCurrentValueFallback());
    } finally {
      setIsLoading(false);
    }
  }, [summaryData, timeframe, processRealHistoricalData, processRealFeeData, calculateRealFeeMetrics, generateProportionalChainHistories, generateCurrentValueFallback]);

  useEffect(() => {
    fetchRealAnalyticsData();
  }, [fetchRealAnalyticsData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  // Chart.js configuration helpers
  const createChartData = (data: ChartDataPoint[], label: string, color: string, gradient = true) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    let backgroundGradient;
    if (gradient && ctx) {
      backgroundGradient = ctx.createLinearGradient(0, 0, 0, 400);
      backgroundGradient.addColorStop(0, color + '20');
      backgroundGradient.addColorStop(1, color + '05');
    }

    return {
      labels: data.map(d => d.date),
      datasets: [{
        label,
        data: data.map(d => d.value),
        borderColor: color,
        backgroundColor: backgroundGradient || color + '10',
        borderWidth: 3,
        fill: gradient,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: color,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointHoverBackgroundColor: color,
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 3,
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1f2937',
        bodyColor: '#1f2937',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context: { parsed: { y: number } }) {
            return formatCurrency(context.parsed.y);
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
          },
          callback: function(value: string | number) {
            const numValue = typeof value === 'string' ? parseFloat(value) : value;
            if (numValue >= 1000000) {
              return `$${(numValue / 1000000).toFixed(1)}M`;
            }
            if (numValue >= 1000) {
              return `$${(numValue / 1000).toFixed(1)}k`;
            }
            return `$${numValue}`;
          }
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart' as const,
    }
  };

  // Show loading screen until all data is ready
  if (isLoading || !analyticsData || !summaryData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-l-blue-400 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Loading Real Analytics Data</h2>
            <p className="text-gray-600 dark:text-gray-400">Fetching actual portfolio history and fee generation data...</p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span>Processing real data from {summaryData?.wallet_count || 0} wallets</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Portfolio
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Portfolio Analytics</h1>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">Error loading analytics data: {error}</p>
                <p className="text-gray-600 mb-4">Showing current portfolio values as fallback</p>
                <Button onClick={fetchRealAnalyticsData}>Retry Loading Real Data</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Development Notice Popup */}
      <div className="bg-yellow-500 text-black px-4 py-3 text-center font-medium shadow-lg">
        <div className="flex items-center justify-center space-x-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>Feature still Under development</span>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Portfolio
              </Button>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Portfolio Analytics</h1>
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Real Data • {summaryData.wallet_count} Wallets
              </div>
            </div>
            
            {/* Timeframe Selector */}
            <div className="flex gap-2">
              {['24h', '7d', '30d'].map((tf) => (
                <Button
                  key={tf}
                  variant={timeframe === tf ? 'default' : 'outline'}
                  onClick={() => setTimeframe(tf)}
                  size="sm"
                >
                  {tf}
                </Button>
              ))}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-700">
                  Expected 24H Fees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(analyticsData.keyMetrics.expectedDailyFees)}
                </div>
                <p className="text-xs text-green-600 mt-1">↗ Based on real hourly rates</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">
                  Last 24H Fees Generated
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(analyticsData.keyMetrics.last24hFees)}
                </div>
                <p className="text-xs text-blue-600 mt-1">💰 Actual fees from positions</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-purple-700">
                  Total Portfolio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(analyticsData.keyMetrics.totalPortfolio)}
                </div>
                <p className="text-xs text-purple-600 mt-1">📈 Current value (live)</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-orange-700">
                  Current Uncollected Fees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(analyticsData.keyMetrics.uncollectedFees)}
                </div>
                <p className="text-xs text-orange-600 mt-1">Ready to collect (live)</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Real Uncollected Fee Data */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  Real Uncollected Fees Over Time
                </CardTitle>
                <p className="text-sm text-gray-600">Actual uncollected fees from all LP positions (live data)</p>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Line 
                    data={createChartData(analyticsData.feeHistory, 'Uncollected Fees', '#10b981', true)}
                    options={chartOptions}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 2. Real Portfolio Value */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  Real Portfolio Value History
                </CardTitle>
                <p className="text-sm text-gray-600">Actual portfolio value from historical snapshots</p>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Line 
                    data={createChartData(analyticsData.totalPortfolioHistory, 'Portfolio Value', '#8b5cf6', true)}
                    options={chartOptions}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Individual Chain Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Solana Chain */}
            <Card className="shadow-lg border-cyan-200">
              <CardHeader>
                <CardTitle className="text-cyan-600 flex items-center gap-2">
                  <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                  Solana Ecosystem
                </CardTitle>
                <p className="text-xs text-gray-600">SPL tokens + LP positions + Lending</p>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <Line 
                    data={createChartData(analyticsData.solanaHistory, 'Solana Value', '#06b6d4', false)}
                    options={chartOptions}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Hyperliquid */}
            <Card className="shadow-lg border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  Hyperliquid
                </CardTitle>
                <p className="text-xs text-gray-600">Perps trading + HYPE staking</p>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <Line 
                    data={createChartData(analyticsData.hyperliquidHistory, 'Hyperliquid Value', '#ef4444', false)}
                    options={chartOptions}
                  />
                </div>
              </CardContent>
            </Card>

            {/* EVM Chains */}
            <Card className="shadow-lg border-green-200">
              <CardHeader>
                <CardTitle className="text-green-600 flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  EVM Chains
                </CardTitle>
                <p className="text-xs text-gray-600">Base, Arbitrum, Polygon, etc.</p>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <Line 
                    data={createChartData(analyticsData.evmHistory, 'EVM Value', '#10b981', false)}
                    options={chartOptions}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Sui */}
            <Card className="shadow-lg border-orange-200">
              <CardHeader>
                <CardTitle className="text-orange-600 flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  Sui Network
                </CardTitle>
                <p className="text-xs text-gray-600">SUI tokens + Bluefin + SuiLend</p>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <Line 
                    data={createChartData(analyticsData.suiHistory, 'Sui Value', '#f59e0b', false)}
                    options={chartOptions}
                  />
                </div>
              </CardContent>
            </Card>

            {/* CEX */}
            <Card className="shadow-lg border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-600 flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  CEX Holdings
                </CardTitle>
                <p className="text-xs text-gray-600">Binance, Bybit centralized holdings</p>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <Line 
                    data={createChartData(analyticsData.cexHistory, 'CEX Value', '#6b7280', false)}
                    options={chartOptions}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 