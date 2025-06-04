'use client';

import { useQuery } from '@tanstack/react-query';
import { getPortfolioData, getPortfolioSummary, getTopTokens, getWallets } from '@/lib/api-client';
import { PortfolioData, PortfolioSummaryData, TopTokenData, WalletInfo } from '@/types/api';

/**
 * Hook to fetch portfolio data for a specific wallet
 */
export function usePortfolio(walletAddress: string) {
  return useQuery<PortfolioData, Error>({
    queryKey: ['portfolio', walletAddress],
    queryFn: () => getPortfolioData(walletAddress),
    enabled: !!walletAddress && (walletAddress.length >= 32 || walletAddress.startsWith('0x')),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch the list of all tracked wallets
 */
export function useWallets() {
  return useQuery<WalletInfo[], Error>({
    queryKey: ['wallets'],
    queryFn: getWallets,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch the combined portfolio summary for all wallets
 */
export function usePortfolioSummary() {
  return useQuery<PortfolioSummaryData, Error>({
    queryKey: ['portfolio-summary'],
    queryFn: getPortfolioSummary,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch the top tokens across all wallets
 */
export function useTopTokens(limit = 20) {
  return useQuery<TopTokenData[], Error>({
    queryKey: ['top-tokens', limit],
    queryFn: () => getTopTokens(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
} 