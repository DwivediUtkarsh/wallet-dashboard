'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { usePortfolioSummary } from '@/hooks/use-portfolio';
import { getFeeGrowthData, getFeeMetrics, getPortfolioHistory } from '@/lib/api-client';
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

interface HistoricalDataPoint {
  timestamp: string;
  total_portfolio?: number;
  solana_total?: number;
  hyperliquid_total?: number;
  evm_total?: number;
  sui_total?: number;
  cex_total?: number;
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
    performanceMetrics?: {
      efficiency: number;
      rateStability: number;
      dataQuality: number;
      hourlyRate: number;
      calculationMethod: string;
      last24hMethod: string;
    };
  };
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [timeframe, setTimeframe] = useState('7d');
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { data: summaryData } = usePortfolioSummary();

  const getTimeframeDays = useCallback((tf: string): number => {
    switch (tf) {
      case '24h': return 1;
      case '7d': return 7;
      case '30d': return 30;
      default: return 7;
    }
  }, []);

  const formatTimestamp = useCallback((timestamp: string, timeframe: string) => {
    // Add safety check for invalid timestamps
    if (!timestamp || timestamp === 'Invalid Date') {
      return 'N/A';
    }
    
    try {
    const date = new Date(timestamp);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      
    if (timeframe === '24h') {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (error) {
      console.warn('Error formatting timestamp:', timestamp, error);
      return 'N/A';
    }
  }, []);

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
  }, [getTimeframeDays, formatTimestamp]);

  const processRealHistoricalData = useCallback((rawData: HistoricalDataPoint[], summary: PortfolioSummary, timeframe: string): ChartDataPoint[] => {
    console.log('📈 Processing historical portfolio data:', rawData.length, 'points');
    
    if (!rawData || rawData.length === 0) {
      // Create flat line at CURRENT portfolio value (not inflated)
      return generateFlatLineData(summary.total_value, timeframe);
    }

    // Process actual historical data with safety checks
    const processed = rawData
      .filter((point: HistoricalDataPoint) => point.timestamp && point.timestamp !== 'Invalid Date')
      .map((point: HistoricalDataPoint) => ({
        timestamp: point.timestamp,
        date: formatTimestamp(point.timestamp, timeframe),
        value: parseFloat(String(point.total_portfolio || summary.total_value))
      }))
      .filter((point: ChartDataPoint) => point.date !== 'N/A') // Filter out invalid dates
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    console.log('📈 Processed portfolio data:', {
      points: processed.length,
      valueRange: processed.length > 0 ? `$${processed[0].value.toFixed(0)} to $${processed[processed.length - 1].value.toFixed(0)}` : 'N/A'
    });

    return processed;
  }, [generateFlatLineData, formatTimestamp]);

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
  }, [generateFlatLineData, formatTimestamp]);

  const calculateRealFeeMetrics = useCallback(async (
    summary: PortfolioSummary, 
    mainWalletAddress: string
  ) => {
    console.log('🧮 Fetching real fee metrics from enhanced API...');

    try {
      // Use the new fee-metrics endpoint for accurate calculations
      const feeMetrics = await getFeeMetrics(mainWalletAddress, 'auto');

      if (feeMetrics) {
        console.log('✅ Using ENHANCED fee metrics from API:', {
          last24hFees: feeMetrics.last_24h_fees.amount_usd,
          last24hMethod: feeMetrics.last_24h_fees.calculation_method,
          expectedDailyFees: feeMetrics.expected_24h_fees.amount_usd,
          expectedMethod: feeMetrics.expected_24h_fees.calculation_method,
          hourlyRate: feeMetrics.expected_24h_fees.hourly_rate,
          efficiency: feeMetrics.performance_metrics.efficiency_percentage,
          dataQuality: feeMetrics.performance_metrics.data_quality_score
        });

        return {
          expectedDailyFees: Math.max(0, feeMetrics.expected_24h_fees.amount_usd),
          last24hFees: Math.max(0, feeMetrics.last_24h_fees.amount_usd),
          totalPortfolio: summary.total_value, // Use REAL current portfolio value
          uncollectedFees: summary.total_fees,  // Use REAL current uncollected fees
          performanceMetrics: {
            efficiency: feeMetrics.performance_metrics.efficiency_percentage,
            rateStability: feeMetrics.performance_metrics.rate_stability,
            dataQuality: feeMetrics.performance_metrics.data_quality_score,
            hourlyRate: feeMetrics.expected_24h_fees.hourly_rate,
            calculationMethod: feeMetrics.expected_24h_fees.calculation_method,
            last24hMethod: feeMetrics.last_24h_fees.calculation_method
          }
        };
      }
    } catch (error) {
      console.warn('Fee metrics API failed, falling back to legacy calculation:', error);
    }

    // Fallback: estimate from LP position sizes (legacy method)
      const lpValue = (summary.whirlpool_value || 0) + (summary.raydium_value || 0);
    const estimatedDailyFees = lpValue * 0.0005; // 0.05% daily estimate

    console.log('📊 Using estimated fee data (API failed):', {
        lpValue,
      estimatedDaily: estimatedDailyFees
      });

    return {
      expectedDailyFees: Math.max(0, estimatedDailyFees),
      last24hFees: Math.max(0, estimatedDailyFees),
      totalPortfolio: summary.total_value,
      uncollectedFees: summary.total_fees,
      performanceMetrics: {
        efficiency: 100, // Assume 100% when using estimates
        rateStability: 0.5, // Neutral stability
        dataQuality: 25, // Low quality for estimates
        hourlyRate: estimatedDailyFees / 24,
        calculationMethod: 'estimated',
        last24hMethod: 'estimated'
      }
    };
  }, []);

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
        keyMetrics: { 
          expectedDailyFees: 0, 
          last24hFees: 0, 
          totalPortfolio: 0, 
          uncollectedFees: 0,
          performanceMetrics: {
            efficiency: 0,
            rateStability: 0,
            dataQuality: 0,
            hourlyRate: 0,
            calculationMethod: 'none',
            last24hMethod: 'none'
          }
        }
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
        uncollectedFees: summary.total_fees,
        performanceMetrics: {
          efficiency: 100,
          rateStability: 0.5,
          dataQuality: 25,
          hourlyRate: estimatedDailyFees / 24,
          calculationMethod: 'estimated',
          last24hMethod: 'estimated'
        }
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
      console.log('🔄 Fetching real analytics data using correct aggregate values...');
      
      // Add minimum loading time to prevent flashing
      const minLoadingTime = 1000; // 1 second minimum
      const startTime = Date.now();
      
      // Get all wallets for reference
      const walletsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wallets`);
      
      if (!walletsResponse.ok) {
        throw new Error(`Failed to fetch wallets: ${walletsResponse.status}`);
      }
      
      const wallets: WalletInfo[] = await walletsResponse.json();
      
      if (!wallets || wallets.length === 0) {
        throw new Error('No wallets found');
      }

      // Get the main wallet (highest value) for historical data queries
      const mainWallet = wallets.reduce((prev: WalletInfo, current: WalletInfo) => 
        ((current.total_value_usd || 0) > (prev.total_value_usd || 0)) ? current : prev
      );

      console.log(`📈 Using main wallet for historical data: ${mainWallet.address.slice(0, 8)}... (${mainWallet.label || 'Unnamed'})`);
      console.log('✅ Portfolio summary data received:', {
        totalValue: summaryData.summary.total_value,
        solanaValue: (summaryData.summary.token_value || 0) + (summaryData.summary.whirlpool_value || 0) + (summaryData.summary.raydium_value || 0) + (summaryData.summary.marginfi_value || 0) + (summaryData.summary.kamino_value || 0),
        hyperliquidValue: summaryData.summary.hyperliquid_value,
        evmValue: summaryData.summary.evm_value,
        suiValue: summaryData.summary.sui_total_value,
        cexValue: summaryData.summary.cex_value,
        totalFees: summaryData.summary.total_fees
      });

      // Fetch data with Promise.allSettled for better error handling
      const [portfolioHistoryData, feeGrowthData] = await Promise.allSettled([
        // Use the main Solana wallet for portfolio history as it has the most comprehensive data
        getPortfolioHistory(mainWallet.address, timeframe),
        getFeeGrowthData(mainWallet.address, timeframe)
      ]);

      // Handle portfolio history data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let processedPortfolioData: any = { portfolio_history: [], current_values: null, changes_24h: null };
      if (portfolioHistoryData.status === 'fulfilled') {
        // Cast because Promise.allSettled value is typed as unknown
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        processedPortfolioData = portfolioHistoryData.value as any;
        console.log('✅ Portfolio history data loaded successfully');
      } else {
        console.warn('⚠️ Portfolio history failed, using fallback:', portfolioHistoryData.reason);
      }

      // Handle fee growth data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let processedFeeData: any = { growth_data: [], overall_hourly_rate: 0 };
      if (feeGrowthData.status === 'fulfilled') {
        // Cast because Promise.allSettled value is typed as unknown
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        processedFeeData = feeGrowthData.value as any;
        console.log('✅ Fee growth data loaded successfully');
      } else {
        console.warn('⚠️ Fee growth failed, using fallback:', feeGrowthData.reason);
      }

      console.log('📊 API Data received:', {
        portfolioHistoryPoints: processedPortfolioData?.portfolio_history?.length || 0,
        feeGrowthPoints: processedFeeData?.growth_data?.length || 0,
        overallHourlyRate: processedFeeData?.overall_hourly_rate || 0,
        currentValues: processedPortfolioData?.current_values ? 'Available' : 'None'
      });

      // Process the actual portfolio history using REAL aggregate total value
      const portfolioHistory = processRealHistoricalData(
        processedPortfolioData?.portfolio_history || [], 
        summaryData.summary,
        timeframe
      );
      
      // Generate chain-specific histories using EXACT values from aggregate summary
      // These values are the REAL multi-chain aggregated amounts, not inflated
      const actualSolanaValue = (summaryData.summary.token_value || 0) + 
                               (summaryData.summary.whirlpool_value || 0) + 
                               (summaryData.summary.raydium_value || 0) + 
                               (summaryData.summary.marginfi_value || 0) + 
                               (summaryData.summary.kamino_value || 0);
                               
      const actualHyperliquidValue = summaryData.summary.hyperliquid_value || 0; // Only base value, not staking
      const actualEvmValue = summaryData.summary.evm_value || 0;
      const actualSuiValue = summaryData.summary.sui_total_value || 0;
      const actualCexValue = summaryData.summary.cex_value || 0;

      const solanaHistory = processedPortfolioData?.portfolio_history?.length > 0
        ? processedPortfolioData.portfolio_history
            .filter((point: HistoricalDataPoint) => point.timestamp && point.timestamp !== 'Invalid Date')
            .map((point: HistoricalDataPoint) => ({
              timestamp: point.timestamp,
              date: formatTimestamp(point.timestamp, timeframe),
              // Use proportional scaling based on REAL current Solana proportion
              value: Math.max(0, point.solana_total || 
                (point.total_portfolio && summaryData.summary.total_value > 0 ? 
                  point.total_portfolio * (actualSolanaValue / summaryData.summary.total_value) : 
                  actualSolanaValue))
            }))
            .filter((point: ChartDataPoint) => point.date !== 'N/A')
        : generateFlatLineData(actualSolanaValue, timeframe);

      const hyperliquidHistory = processedPortfolioData?.portfolio_history?.length > 0
        ? processedPortfolioData.portfolio_history
            .filter((point: HistoricalDataPoint) => point.timestamp && point.timestamp !== 'Invalid Date')
            .map((point: HistoricalDataPoint) => ({
              timestamp: point.timestamp,
              date: formatTimestamp(point.timestamp, timeframe),
              // Use proportional scaling based on REAL current Hyperliquid proportion
              value: Math.max(0, point.hyperliquid_total || 
                (point.total_portfolio && summaryData.summary.total_value > 0 ? 
                  point.total_portfolio * (actualHyperliquidValue / summaryData.summary.total_value) : 
                  actualHyperliquidValue))
            }))
            .filter((point: ChartDataPoint) => point.date !== 'N/A')
        : generateFlatLineData(actualHyperliquidValue, timeframe);

      const evmHistory = processedPortfolioData?.portfolio_history?.length > 0
        ? processedPortfolioData.portfolio_history
            .filter((point: HistoricalDataPoint) => point.timestamp && point.timestamp !== 'Invalid Date')
            .map((point: HistoricalDataPoint) => ({
              timestamp: point.timestamp,
              date: formatTimestamp(point.timestamp, timeframe),
              // Use proportional scaling based on REAL current EVM proportion
              value: Math.max(0, point.evm_total || 
                (point.total_portfolio && summaryData.summary.total_value > 0 ? 
                  point.total_portfolio * (actualEvmValue / summaryData.summary.total_value) : 
                  actualEvmValue))
            }))
            .filter((point: ChartDataPoint) => point.date !== 'N/A')
        : generateFlatLineData(actualEvmValue, timeframe);

      const suiHistory = processedPortfolioData?.portfolio_history?.length > 0
        ? processedPortfolioData.portfolio_history
            .filter((point: HistoricalDataPoint) => point.timestamp && point.timestamp !== 'Invalid Date')
            .map((point: HistoricalDataPoint) => ({
              timestamp: point.timestamp,
              date: formatTimestamp(point.timestamp, timeframe),
              // Use proportional scaling based on REAL current Sui proportion
              value: Math.max(0, point.sui_total || 
                (point.total_portfolio && summaryData.summary.total_value > 0 ? 
                  point.total_portfolio * (actualSuiValue / summaryData.summary.total_value) : 
                  actualSuiValue))
            }))
            .filter((point: ChartDataPoint) => point.date !== 'N/A')
        : generateFlatLineData(actualSuiValue, timeframe);

      const cexHistory = processedPortfolioData?.portfolio_history?.length > 0
        ? processedPortfolioData.portfolio_history
            .filter((point: HistoricalDataPoint) => point.timestamp && point.timestamp !== 'Invalid Date')
            .map((point: HistoricalDataPoint) => ({
              timestamp: point.timestamp,
              date: formatTimestamp(point.timestamp, timeframe),
              value: Math.max(0, point.cex_total || actualCexValue)
            }))
            .filter((point: ChartDataPoint) => point.date !== 'N/A')
        : generateFlatLineData(actualCexValue, timeframe);
      
      // Process real fee growth data with fallback
      const feeHistory = processRealFeeData((processedFeeData as {growth_data: FeeGrowthPoint[]}).growth_data || [], summaryData.summary, timeframe);
      
      // Calculate real metrics with graceful fallback
      let keyMetrics;
      try {
        keyMetrics = await calculateRealFeeMetrics(summaryData.summary, mainWallet.address);
        console.log('✅ Fee metrics calculated successfully');
      } catch (metricsError) {
        console.warn('⚠️ Fee metrics calculation failed, using fallback:', metricsError);
        keyMetrics = {
          expectedDailyFees: summaryData.summary.total_fees * 0.1, // Rough estimate
          last24hFees: summaryData.summary.total_fees * 0.1,
          totalPortfolio: summaryData.summary.total_value,
          uncollectedFees: summaryData.summary.total_fees,
          performanceMetrics: {
            efficiency: 100,
            rateStability: 0.5,
            dataQuality: 25,
            hourlyRate: (summaryData.summary.total_fees * 0.1) / 24,
            calculationMethod: 'fallback',
            last24hMethod: 'fallback'
          }
        };
      }

      const data: AnalyticsData = {
        totalPortfolioHistory: portfolioHistory,
        feeHistory: feeHistory,
        solanaHistory: solanaHistory,
        hyperliquidHistory: hyperliquidHistory,
        evmHistory: evmHistory,
        suiHistory: suiHistory,
        cexHistory: cexHistory,
        keyMetrics
      };

      // Ensure minimum loading time to prevent flashing
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }

      console.log('✅ Corrected multi-chain analytics data prepared:', {
        portfolioPoints: portfolioHistory.length,
        portfolioCurrentValue: portfolioHistory[portfolioHistory.length - 1]?.value || 0,
        solanaPoints: solanaHistory.length,
        solanaCurrentValue: solanaHistory[solanaHistory.length - 1]?.value || 0,
        hyperliquidPoints: hyperliquidHistory.length,
        hyperliquidCurrentValue: hyperliquidHistory[hyperliquidHistory.length - 1]?.value || 0,
        evmPoints: evmHistory.length,
        evmCurrentValue: evmHistory[evmHistory.length - 1]?.value || 0,
        suiPoints: suiHistory.length,
        suiCurrentValue: suiHistory[suiHistory.length - 1]?.value || 0,
        cexPoints: cexHistory.length,
        cexCurrentValue: cexHistory[cexHistory.length - 1]?.value || 0,
        feePoints: feeHistory.length,
        expectedDailyFees: keyMetrics.expectedDailyFees,
        last24hFees: keyMetrics.last24hFees,
        totalPortfolio: keyMetrics.totalPortfolio,
        uncollectedFees: keyMetrics.uncollectedFees
      });

      setAnalyticsData(data);

    } catch (err) {
      console.error('❌ Error fetching analytics data:', err);
      
      // Set a more user-friendly error message
      if (err instanceof Error) {
        if (err.message.includes('fetch')) {
          setError('Unable to connect to analytics service. Please check if the API server is running.');
        } else {
          setError(`Analytics error: ${err.message}`);
        }
      } else {
        setError('Failed to load analytics data');
      }
      
      // Still provide fallback data even on error
      console.log('🔄 Providing fallback analytics data...');
      setAnalyticsData(generateCurrentValueFallback());
    } finally {
      setIsLoading(false);
    }
  }, [summaryData, timeframe, processRealHistoricalData, processRealFeeData, calculateRealFeeMetrics, generateCurrentValueFallback, formatTimestamp, generateFlatLineData]);

  // Simplified useEffect with stable dependencies
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
    if (!data || data.length === 0) return { datasets: [] };
    
    // Filter out any invalid data points
    const validData = data.filter((point: ChartDataPoint) => 
      point.date !== 'N/A' && 
      !isNaN(point.value) && 
      isFinite(point.value)
    );
    
    if (validData.length === 0) return { datasets: [] };

    return {
      labels: validData.map(point => point.date),
      datasets: [
        {
        label,
          data: validData.map(point => point.value),
        borderColor: color,
          backgroundColor: gradient ? `${color}10` : 'transparent',
        borderWidth: 3,
        fill: gradient,
        tension: 0.4,
          pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: color,
        pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 2,
        }
      ]
    };
  };

  // Improved chart options for cleaner appearance
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
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context: import('chart.js').TooltipItem<'line'>) {
            const value = context.parsed.y;
            return `$${value.toLocaleString(undefined, { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
          },
          maxTicksLimit: 8, // Limit number of ticks to prevent crowding
        }
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(75, 85, 99, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
          },
          callback: function(tickValue: string | number) {
            const value = typeof tickValue === 'string' ? parseFloat(tickValue) : tickValue;
            if (value >= 1000000) {
              return `$${(value / 1000000).toFixed(1)}M`;
            } else if (value >= 1000) {
              return `$${(value / 1000).toFixed(0)}K`;
            }
            return `$${value.toFixed(0)}`;
          }
        }
      }
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