// API client for connecting to the portfolio tracking backend

import { PortfolioData, WalletInfo, PortfolioSummaryData } from '@/types/api';

// Default to local development API if not set
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Log the API base URL for debugging
console.log('API_BASE_URL:', API_BASE_URL);

/**
 * Base fetch function with error handling
 */
async function fetchWithErrorHandling<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  console.log(`🔍 Fetching: ${fullUrl}`);
  
  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    console.log(`📡 Response for ${endpoint}: Status ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`❌ API Error for ${endpoint}:`, errorData);
      throw new Error(
        errorData.message || `API error: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ API request failed for ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Get list of all tracked wallets
 */
export async function getWallets(): Promise<WalletInfo[]> {
  return fetchWithErrorHandling<WalletInfo[]>('/wallets');
}

/**
 * Get combined portfolio summary for all wallets
 */
export async function getPortfolioSummary(): Promise<PortfolioSummaryData> {
  return fetchWithErrorHandling<PortfolioSummaryData>('/portfolio/summary');
}

/**
 * Get complete portfolio data for a wallet
 */
export async function getPortfolioData(walletAddress: string): Promise<PortfolioData> {
  return fetchWithErrorHandling<PortfolioData>(`/portfolio/${walletAddress}`);
}

/**
 * Get token balances for a wallet
 */
export async function getTokenBalances(walletAddress: string) {
  return fetchWithErrorHandling(`/tokens/${walletAddress}`);
}

/**
 * Get Whirlpool positions for a wallet
 */
export async function getWhirlpoolPositions(walletAddress: string) {
  return fetchWithErrorHandling(`/whirlpool/${walletAddress}`);
}

/**
 * Get Raydium positions for a wallet
 */
export async function getRaydiumPositions(walletAddress: string) {
  return fetchWithErrorHandling(`/raydium/${walletAddress}`);
}

/**
 * Get Marginfi accounts for a wallet
 */
export async function getMarginfiAccounts(walletAddress: string) {
  return fetchWithErrorHandling(`/marginfi/${walletAddress}`);
}

/**
 * Get Kamino accounts for a wallet
 */
export async function getKaminoAccounts(walletAddress: string) {
  return fetchWithErrorHandling(`/kamino/${walletAddress}`);
}

/**
 * Get Hyperliquid data for a wallet
 */
export async function getHyperliquidData(walletAddress: string) {
  return fetchWithErrorHandling(`/hyperliquid/${walletAddress}`);
}

/**
 * Get Hyperliquid historical data for a wallet
 */
export async function getHyperliquidHistory(walletAddress: string, timeframe = '7d') {
  return fetchWithErrorHandling(`/hyperliquid/history/${walletAddress}?timeframe=${timeframe}`);
}

/**
 * Get EVM data for a wallet
 */
export async function getEvmData(walletAddress: string) {
  return fetchWithErrorHandling(`/evm/${walletAddress}`);
}

/**
 * Validate address format based on chain
 */
export function isValidAddress(address: string, chain?: string): boolean {
  if (!address) return false;
  
  // EVM addresses
  if (chain === 'evm' || address.startsWith('0x')) {
    const evmRegex = /^0x[a-fA-F0-9]{40}$/;
    return evmRegex.test(address);
  }
  
  // Hyperliquid addresses (also EVM format)
  if (chain === 'hyperliquid') {
    const evmRegex = /^0x[a-fA-F0-9]{40}$/;
    return evmRegex.test(address);
  }
  
  // Default to Solana
  return isValidSolanaAddress(address);
}

/**
 * Validate Solana address format
 */
export function isValidSolanaAddress(address: string): boolean {
  if (!address) return false;
  
  // Base58 check (alphanumeric except 0, O, I, l)
  const base58Regex = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;
  return address.length >= 32 && address.length <= 44 && base58Regex.test(address);
} 