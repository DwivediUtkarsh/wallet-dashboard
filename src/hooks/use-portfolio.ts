'use client';

import { useQuery } from '@tanstack/react-query';
import { getPortfolioData, getPortfolioSummary, getWallets, isValidSolanaAddress } from '@/lib/api-client';
import { PortfolioData, PortfolioSummaryData, WalletInfo } from '@/types/api';

/**
 * Hook to fetch portfolio data for a specific wallet
 */
export function usePortfolio(walletAddress: string) {
  return useQuery<PortfolioData, Error>({
    queryKey: ['portfolio', walletAddress],
    queryFn: () => getPortfolioData(walletAddress),
    enabled: walletAddress?.length >= 32 && isValidSolanaAddress(walletAddress),
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