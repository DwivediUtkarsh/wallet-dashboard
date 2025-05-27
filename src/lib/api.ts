// API endpoints for wallet data

import { PortfolioData } from '@/types/api';

// Base URL - We'll use relative URLs for our API endpoints
const BASE_URL = '/api';

// Utility function for API requests with error handling
export async function fetchJSON(url: string, options: RequestInit = {}) {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || `API error: ${response.status}`);
  }
  
  return response.json();
}

// Get all portfolio data for a wallet
export async function getPortfolioData(walletAddress: string): Promise<PortfolioData> {
  try {
    // For development, use the local API route
    const response = await fetch(`/api/portfolio/${walletAddress}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch portfolio data');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching portfolio data:', error);
    throw error;
  }
}

// Get token balances for a wallet
export async function getTokenBalances(walletAddress: string) {
  return fetchJSON(`${BASE_URL}/tokens/${walletAddress}`);
}

// Get LP positions for a wallet
export async function getLPPositions(walletAddress: string) {
  return fetchJSON(`${BASE_URL}/positions/${walletAddress}`);
}

// Get Marginfi positions for a wallet
export async function getMarginfiPositions(walletAddress: string) {
  return fetchJSON(`${BASE_URL}/marginfi/${walletAddress}`);
}

// Validate Solana wallet address (base58 encoded, 32-44 chars)
export function isValidSolanaAddress(address: string): boolean {
  if (!address) return false;
  
  // Basic length check
  if (address.length < 32 || address.length > 44) return false;
  
  // Base58 character check (alphanumeric without 0, O, I, l)
  const base58Regex = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;
  return base58Regex.test(address);
} 