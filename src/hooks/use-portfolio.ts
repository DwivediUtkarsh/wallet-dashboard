'use client';

import { useQuery } from '@tanstack/react-query';
import { getPortfolioData, getPortfolioSummary, getTopTokens, getWallets, getLendingSummary, getExposure } from '@/lib/api-client';
import { PortfolioData, PortfolioSummaryData, TopTokenData, WalletInfo, LendingSummaryData } from '@/types/api';

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

/**
 * Hook to fetch lending and borrowing summary across all wallets
 */
export function useLendingSummary() {
  return useQuery<LendingSummaryData, Error>({
    queryKey: ['lending-summary'],
    queryFn: getLendingSummary,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch specific token holdings for target tokens
 */
export function useTargetTokenHoldings() {
  return useQuery({
    queryKey: ['target-token-holdings'],
    queryFn: async () => {
      // Get exposure data for specific tokens
      const exposureData = await getExposure(100); // Get more data to ensure we capture all relevant tokens
      
      // Debug: Log all exposure data to see what we have
      console.log('All exposure data:', exposureData.map(t => ({ 
        symbol: t.symbol, 
        sources: t.sources.map(s => s.source_type) 
      })));
      
      // Filter for BTC-related tokens
      const btcHoldings = exposureData.filter(token => 
        ['BTC', 'WBTC', 'CBBTC'].includes(token.symbol.toUpperCase())
      );
      
      // Find JitoSOL holdings instead of SOL
      const jitoSolHoldings = exposureData.find(token => 
        token.symbol.toUpperCase() === 'JITOSOL'
      );
      
      // Find HYPE holdings
      const hypeHoldings = exposureData.find(token => 
        token.symbol.toUpperCase() === 'HYPE'
      );
      
      // Debug: Log what we found
      console.log('BTC holdings found:', btcHoldings.map(t => ({ 
        symbol: t.symbol, 
        sources: t.sources.map(s => ({ type: s.source_type, amount: s.amount }))
      })));
      console.log('JitoSOL holdings found:', jitoSolHoldings ? { 
        symbol: jitoSolHoldings.symbol, 
        sources: jitoSolHoldings.sources.map(s => ({ type: s.source_type, amount: s.amount }))
      } : 'None');
      console.log('HYPE holdings found:', hypeHoldings ? { 
        symbol: hypeHoldings.symbol, 
        sources: hypeHoldings.sources.map(s => ({ type: s.source_type, amount: s.amount }))
      } : 'None');
      
      // Calculate BTC on EVM lending (BASE AAVE3 would be included in evm_lending_supply)
      const btcOnEvm = btcHoldings.reduce((total, token) => {
        const evmLendingSources = token.sources.filter(source => 
          source.source_type === 'evm_lending_supply'
        );
        return total + evmLendingSources.reduce((sum, source) => sum + source.amount, 0);
      }, 0);
      
      // Calculate JitoSOL on Marginfi deposits
      const jitoSolOnMarginfi = jitoSolHoldings?.sources
        .filter(source => source.source_type === 'marginfi_deposit')
        .reduce((sum, source) => sum + source.amount, 0) || 0;
      
      // Calculate HYPE staked
      const hypeStaked = hypeHoldings?.sources
        .filter(source => source.source_type === 'hyperliquid_staking')
        .reduce((sum, source) => sum + source.amount, 0) || 0;

      // Calculate HYPE spot holdings
      const hypeSpot = hypeHoldings?.sources
        .filter(source => source.source_type === 'hyperliquid_spot')
        .reduce((sum, source) => sum + source.amount, 0) || 0;

      // Total HYPE (staked + spot)
      const hypeTotal = hypeStaked + hypeSpot;
      
      // Get prices for USD values
      const btcPrice = btcHoldings.find(t => t.symbol.toUpperCase() === 'BTC')?.price_usd || 
                      btcHoldings.find(t => t.symbol.toUpperCase() === 'WBTC')?.price_usd || 
                      btcHoldings.find(t => t.symbol.toUpperCase() === 'CBBTC')?.price_usd || 0;
      const jitoSolPrice = jitoSolHoldings?.price_usd || 0;
      const hypePrice = hypeHoldings?.price_usd || 0;
      
      const result = {
        btc_on_base_aave3: btcOnEvm,
        jitosol_on_marginfi: jitoSolOnMarginfi,
        hype_staked: hypeStaked,
        hype_spot: hypeSpot,
        hype_total: hypeTotal,
        btc_price: btcPrice,
        jitosol_price: jitoSolPrice,
        hype_price: hypePrice,
        btc_value_usd: btcOnEvm * btcPrice,
        jitosol_value_usd: jitoSolOnMarginfi * jitoSolPrice,
        hype_value_usd: hypeTotal * hypePrice
      };
      
      console.log('Final result:', result);
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
} 