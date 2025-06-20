'use client';

import { useQuery } from '@tanstack/react-query';
import { getFeeGrowthData, getHistoricalData, getFeeCollections } from '@/lib/api-client';

/**
 * Hook to fetch fee growth data for a specific wallet
 */
export function useFeeGrowthData(walletAddress: string, timeframe = '7d') {
  return useQuery({
    queryKey: ['fee-growth', walletAddress, timeframe],
    queryFn: () => getFeeGrowthData(walletAddress, timeframe),
    enabled: !!walletAddress && (walletAddress.length >= 32 || walletAddress.startsWith('0x')),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch historical portfolio data for a specific wallet
 */
export function useHistoricalData(walletAddress: string, timeframe = '7d') {
  return useQuery({
    queryKey: ['historical-data', walletAddress, timeframe],
    queryFn: () => getHistoricalData(walletAddress, timeframe),
    enabled: !!walletAddress && (walletAddress.length >= 32 || walletAddress.startsWith('0x')),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch fee collection events for a specific wallet
 */
export function useFeeCollections(walletAddress: string, timeframe = '30d') {
  return useQuery({
    queryKey: ['fee-collections', walletAddress, timeframe],
    queryFn: () => getFeeCollections(walletAddress, timeframe),
    enabled: !!walletAddress && (walletAddress.length >= 32 || walletAddress.startsWith('0x')),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch analytics data for multiple wallets
 */
export function useMultiWalletAnalytics(walletAddresses: string[], timeframe = '7d') {
  return useQuery({
    queryKey: ['multi-wallet-analytics', walletAddresses, timeframe],
    queryFn: async () => {
      const promises = walletAddresses.map(async (address) => {
        try {
          const [feeGrowth, historical] = await Promise.all([
            getFeeGrowthData(address, timeframe),
            getHistoricalData(address, timeframe)
          ]);
          return { address, feeGrowth, historical };
        } catch (error) {
          console.error(`Error fetching data for wallet ${address}:`, error);
          return { address, feeGrowth: null, historical: null, error };
        }
      });
      return Promise.all(promises);
    },
    enabled: walletAddresses.length > 0,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
} 