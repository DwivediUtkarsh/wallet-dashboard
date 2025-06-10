import { TokenListProvider, TokenInfo as RegistryTokenInfo } from '@solana/spl-token-registry';
// Modern Metaplex UMI imports for on-chain metadata
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplTokenMetadata, fetchDigitalAsset } from "@metaplex-foundation/mpl-token-metadata";
import { publicKey } from "@metaplex-foundation/umi";

/**
 * Unified metadata interface
 */
export interface TokenMetadata {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string | null;
  uri?: string | null;
  source?: string;
  [key: string]: unknown;
}

/**
 * Token info object returned by getTokenInfo
 */
export interface TokenInfo {
  mint: string;
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  metadata: TokenMetadata | null;
  [key: string]: unknown;
}

/**
 * Jupiter token response interface
 */
interface JupiterTokenResponse {
  address: string;
  symbol?: string;
  name?: string;
  decimals?: number;
  logoURI?: string;
  [key: string]: unknown;
}

/**
 * Helius token response interface
 */
interface HeliusTokenResponse {
  symbol?: string;
  name?: string;
  decimals?: number;
  image?: string;
  [key: string]: unknown;
}

/**
 * Error type for handling various errors
 */
interface TokenError extends Error {
  message: string;
  code?: string | number;
}

// Constants
const DEFAULT_RPC_ENDPOINT = "https://api.mainnet-beta.solana.com";
const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY || '';
const HELIUS_ASSET_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

// Caching
const tokenMetadataCache = new Map<string, TokenMetadata>();
let jupiterTokensLoaded = false;
let registryLoaded = false;
let jupiterTokens: TokenMetadata[] = [];

/**
 * Load token registry
 */
async function preloadTokenRegistry(): Promise<void> {
  if (registryLoaded) return;
  
  try {
    console.log('Loading Solana token registry...');
    const provider = new TokenListProvider();
    const tokenList = await provider.resolve();
    const tokenMap = tokenList.filterByChainId(101).getList(); // Mainnet
    
    tokenMap.forEach((token: RegistryTokenInfo) => {
      const metadata: TokenMetadata = {
        address: token.address,
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        logoURI: token.logoURI
      };
      tokenMetadataCache.set(token.address, metadata);
    });
    
    registryLoaded = true;
    console.log(`Loaded ${tokenMap.length} tokens from registry`);
  } catch (err) {
    const error = err as TokenError;
    console.warn('Failed to load token registry:', error.message);
    registryLoaded = true; // Mark as loaded to prevent retries
  }
}

/**
 * Load Jupiter token list with timeout and error handling
 */
export async function preloadJupiterTokens(): Promise<void> {
  if (jupiterTokensLoaded) return;
  
  try {
    console.log('Loading Jupiter token list...');
    
    // Add timeout for Jupiter API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch('https://token.jup.ag/all', {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Jupiter API returned ${response.status}`);
    }
    
    const tokens: JupiterTokenResponse[] = await response.json();
    
    jupiterTokens = tokens.map((token: JupiterTokenResponse) => ({
      address: token.address,
      symbol: token.symbol || token.address.slice(0, 6),
      name: token.name || 'Unknown Token',
      decimals: token.decimals || 9,
      logoURI: token.logoURI || null
    }));
    
    for (const token of jupiterTokens) {
      if (!tokenMetadataCache.has(token.address)) {
        tokenMetadataCache.set(token.address, token);
      }
    }
    jupiterTokensLoaded = true;
    console.log(`Loaded ${jupiterTokens.length} tokens from Jupiter API`);
  } catch (err) {
    const error = err as TokenError;
    console.warn('Failed to load Jupiter tokens:', error.message);
    // Don't throw - we can continue without Jupiter tokens
    jupiterTokensLoaded = true; // Mark as loaded to prevent retries
  }
}

/**
 * Fetch on-chain metadata using modern Metaplex UMI
 */
async function fetchOnChainMetadata(mintAddress: string, rpcEndpoint?: string): Promise<TokenMetadata | null> {
  try {
    console.log(`Fetching on-chain metadata for ${mintAddress}...`);
    
    // Use provided RPC endpoint or default
    const endpoint = rpcEndpoint || DEFAULT_RPC_ENDPOINT;
    
    // 1️⃣ Boot an Umi client and install the Token-Metadata plugin
    const umi = createUmi(endpoint).use(mplTokenMetadata());

    // 2️⃣ Convert to PublicKey and let the helper do the PDA lookup + fetch
    const asset = await fetchDigitalAsset(umi, publicKey(mintAddress));

    // 3️⃣ Extract the metadata
    const metadataAccount = asset.metadata;
    const mint = asset.mint;

    if (!metadataAccount || !metadataAccount.symbol) {
      console.log(`No valid on-chain metadata found for ${mintAddress}`);
      return null;
    }

    const metadata: TokenMetadata = {
      address: mintAddress,
      symbol: metadataAccount.symbol.trim() || mintAddress.slice(0, 6),
      name: metadataAccount.name.trim() || 'Unknown Token',
      decimals: mint.decimals || 9,
      logoURI: null, // URI is for off-chain metadata, not logo directly
      uri: metadataAccount.uri || null
    };

    console.log(`Found on-chain metadata for ${mintAddress}: ${metadata.symbol}`);
    return metadata;
  } catch (error) {
    const err = error as TokenError;
    console.log(`On-chain metadata fetch failed for ${mintAddress}: ${err.message}`);
    return null;
  }
}

/**
 * Fetch metadata via Helius DAS endpoint (NEW - matching backend)
 */
async function fetchHeliusMetadata(mintAddress: string): Promise<TokenMetadata | null> {
  if (!HELIUS_API_KEY) {
    console.log(`Helius API key not available, skipping Helius metadata for ${mintAddress}`);
    return null;
  }
  
  try {
    console.log(`Fetching Helius metadata for ${mintAddress}...`);
    const res = await fetch(HELIUS_ASSET_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assetId: mintAddress, showFungible: true })
    });
    
    if (!res.ok) {
      console.log(`Helius API returned ${res.status} for ${mintAddress}`);
      return null;
    }
    
    const json = await res.json() as HeliusTokenResponse;
    
    // Verify essential properties exist
    if (!json || !json.symbol) {
      console.log(`No valid Helius metadata found for ${mintAddress}`);
      return null;
    }
    
    const md: TokenMetadata = {
      address: mintAddress,
      symbol: json.symbol,
      name: json.name || mintAddress.slice(0, 4),
      decimals: json.decimals ?? 9,
      logoURI: json.image || null
    };
    
    console.log(`Found Helius metadata for ${mintAddress}: ${md.symbol}`);
    return md;
  } catch (err) {
    const error = err as TokenError;
    console.log(`Helius metadata fetch failed for ${mintAddress}: ${error.message}`);
    return null;
  }
}

/**
 * UPDATED: Main function to get token metadata - MATCHING BACKEND PRIORITY
 * 
 * Priority order (same as backend):
 * 1. Local cache (Jupiter + Registry tokens)
 * 2. On-chain Metaplex metadata (UMI)
 * 3. Helius DAS API
 * 4. Truncated address fallback
 */
export async function getTokenMetadata(tokenAddress: string, rpcEndpoint?: string): Promise<TokenMetadata | null> {
  if (!tokenAddress) {
    console.log("No token address provided to getTokenMetadata");
    return null;
  }
  
  try {
    // 1️⃣ Check if we have it in cache (Jupiter + Registry)
    const cachedMetadata = tokenMetadataCache.get(tokenAddress);
    if (cachedMetadata) {
      console.log(`Using cached metadata for ${tokenAddress}: ${cachedMetadata.symbol}`);
      return cachedMetadata;
    }

    // 2️⃣ Try on-chain Metaplex metadata (most reliable for newer tokens)
    try {
      const onChainMetadata = await fetchOnChainMetadata(tokenAddress, rpcEndpoint);
      if (onChainMetadata) {
        // Cache and return
        tokenMetadataCache.set(tokenAddress, onChainMetadata);
        return onChainMetadata;
      }
    } catch (error) {
      const err = error as TokenError;
      console.log(`On-chain metadata fetch failed for ${tokenAddress}: ${err.message}`);
    }

    // 3️⃣ Try Helius API as fallback (NEW - matching backend)
    try {
      const heliusMetadata = await fetchHeliusMetadata(tokenAddress);
      if (heliusMetadata) {
        // Cache and return
        tokenMetadataCache.set(tokenAddress, heliusMetadata);
        return heliusMetadata;
      }
    } catch (error) {
      const err = error as TokenError;
      console.log(`Helius metadata fetch failed for ${tokenAddress}: ${err.message}`);
    }

    // 4️⃣ Try to load token registry if not loaded
    if (!registryLoaded) {
      await preloadTokenRegistry();
      if (tokenMetadataCache.has(tokenAddress)) {
        console.log(`Found in token registry for ${tokenAddress}`);
        return tokenMetadataCache.get(tokenAddress)!;
      }
    }

    // 5️⃣ Try Jupiter tokens if not loaded
    if (!jupiterTokensLoaded) {
      await preloadJupiterTokens();
      if (tokenMetadataCache.has(tokenAddress)) {
        console.log(`Found in Jupiter tokens for ${tokenAddress}`);
        return tokenMetadataCache.get(tokenAddress)!;
      }
    }
    
    // 6️⃣ Last resort: create minimal metadata with truncated address
    console.log(`No metadata found for ${tokenAddress}, using truncated address fallback`);
    
    const minimalMetadata: TokenMetadata = {
      address: tokenAddress,
      symbol: tokenAddress.slice(0, 6),
      name: tokenAddress.slice(0, 6),
      decimals: 9, // Default to 9 decimals (SOL standard)
      logoURI: null,
      source: 'fallback'
    };
    
    // Cache this minimal metadata to avoid repeated calls
    tokenMetadataCache.set(tokenAddress, minimalMetadata);
    return minimalMetadata;
    
  } catch (error) {
    const err = error as TokenError;
    console.error(`Error in getTokenMetadata for ${tokenAddress}:`, err);
    return null;
  }
}

/**
 * Get token info with metadata
 */
export async function getTokenInfo(mintAddress: string, rpcEndpoint?: string): Promise<TokenInfo | null> {
  try {
    const metadata = await getTokenMetadata(mintAddress, rpcEndpoint);
    
    if (!metadata) {
      return null;
    }

    return {
      mint: mintAddress,
      address: mintAddress,
      symbol: metadata.symbol,
      name: metadata.name,
      decimals: metadata.decimals,
      metadata
    };
  } catch (error) {
    console.error(`Error getting token info for ${mintAddress}:`, error);
    return null;
  }
}

/**
 * Batch fetch token metadata for multiple addresses
 */
export async function getTokenMetadataBatch(tokenAddresses: string[], rpcEndpoint?: string): Promise<Map<string, TokenMetadata>> {
  const results = new Map<string, TokenMetadata>();
  
  // Process in batches to avoid overwhelming the RPC
  const batchSize = 5; // Reduced batch size for better reliability
  for (let i = 0; i < tokenAddresses.length; i += batchSize) {
    const batch = tokenAddresses.slice(i, i + batchSize);
    const promises = batch.map(async (address) => {
      try {
        const metadata = await getTokenMetadata(address, rpcEndpoint);
        if (metadata) {
          results.set(address, metadata);
        }
      } catch (error) {
        console.warn(`Failed to fetch metadata for ${address}:`, error);
      }
    });
    
    await Promise.all(promises);
    
    // Small delay between batches to be nice to RPC
    if (i + batchSize < tokenAddresses.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  return results;
}

/**
 * Clear cache (useful for testing or forcing refresh)
 */
export function clearTokenCache(): void {
  tokenMetadataCache.clear();
  jupiterTokensLoaded = false;
  registryLoaded = false;
  jupiterTokens = [];
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    cacheSize: tokenMetadataCache.size,
    jupiterTokensLoaded,
    registryLoaded,
    jupiterTokenCount: jupiterTokens.length
  };
} 