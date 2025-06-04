"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { PriceServiceConnection } from "@pythnetwork/price-service-client";
import Decimal from "decimal.js";

// Price data interface
interface PriceData {
  [address: string]: {
    price: number;
    confidence?: number;
    ema?: number;
    publishTime?: number;
  };
}

// Context interface
interface PriceContextProps {
  prices: PriceData;
  setPrices: React.Dispatch<React.SetStateAction<PriceData>>;
  loading: boolean;
  setLoading: (value: boolean) => void;
  
  // Pyth-specific methods
  addTokensToWatch: (tokens: string[]) => void;
  removeTokensFromWatch: (tokens: string[]) => void;
  getPriceForToken: (tokenAddress: string) => number | null;
  refreshPrices: () => Promise<void>;
}

// Known Pyth feed IDs for common tokens
const PYTH_FEEDS: Record<string, string> = {
  // Solana tokens
  "So11111111111111111111111111111111111111112": "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43", // SOL
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a", // USDC
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB": "0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b", // USDT
  
  // Sui tokens  
  "0x2::sui::SUI": "0xe7ec56cf30aa5db18114dc8e95f5bdbe50201f1ebb56f7cae5ff6c1b7d02d66f", // SUI
  "0x2::usdc::USDC": "0xfbd7e900c6197bca81367447b000ab5d542efed0b0a9ffbe2207d154ed1b83e2", // USDC on Sui
  "0x2::deep::DEEP": "0x9b4274d223767fa6e2c81bdbb136a7fb22535e9d7986e1d1f6f68c2efe55ac2e", // DEEP
};

const PriceContext = createContext<PriceContextProps | undefined>(undefined);

interface PriceProviderProps {
  children: ReactNode;
}

export const PriceProvider: React.FC<PriceProviderProps> = ({ children }) => {
  const [prices, setPrices] = useState<PriceData>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [watchedTokens, setWatchedTokens] = useState<Set<string>>(new Set());
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pythConnection = useRef<PriceServiceConnection | null>(null);

  // Initialize Pyth connection
  useEffect(() => {
    pythConnection.current = new PriceServiceConnection("https://hermes.pyth.network");
  }, []);

  // Add tokens to watch list
  const addTokensToWatch = (tokens: string[]) => {
    const newTokens = new Set(watchedTokens);
    tokens.forEach(token => {
      if (PYTH_FEEDS[token]) {
        newTokens.add(token);
      }
    });
    setWatchedTokens(newTokens);
  };

  // Remove tokens from watch list
  const removeTokensFromWatch = (tokens: string[]) => {
    const newTokens = new Set(watchedTokens);
    tokens.forEach(token => newTokens.delete(token));
    setWatchedTokens(newTokens);
  };

  // Get price for a specific token
  const getPriceForToken = (tokenAddress: string): number | null => {
    return prices[tokenAddress]?.price || null;
  };

  // Fetch prices from Pyth
  const refreshPrices = useCallback(async (): Promise<void> => {
    if (!pythConnection.current || watchedTokens.size === 0) return;

    setLoading(true);
    try {
      const feedIds = Array.from(watchedTokens)
        .map(token => PYTH_FEEDS[token])
        .filter(Boolean);

      if (feedIds.length === 0) {
        setLoading(false);
        return;
      }

      const priceFeeds = await pythConnection.current.getLatestPriceFeeds(feedIds);
      
      if (!priceFeeds) {
        console.warn("No price feeds returned from Pyth");
        setLoading(false);
        return;
      }

      const newPrices: PriceData = { ...prices };

      // Map feed IDs back to token addresses
      for (const [tokenAddress, feedId] of Object.entries(PYTH_FEEDS)) {
        if (watchedTokens.has(tokenAddress)) {
          const feed = priceFeeds.find(f => f.id === feedId);
          if (feed) {
            const priceData = feed.getPriceUnchecked();
            const emaData = feed.getEmaPriceUnchecked();
            
            if (priceData) {
              const price = new Decimal(priceData.price).mul(
                new Decimal(10).pow(priceData.expo)
              );
              const confidence = new Decimal(priceData.conf).mul(
                new Decimal(10).pow(priceData.expo)
              );
              
              let ema: number | undefined;
              if (emaData) {
                ema = new Decimal(emaData.price).mul(
                  new Decimal(10).pow(emaData.expo)
                ).toNumber();
              }

              newPrices[tokenAddress] = {
                price: price.toNumber(),
                confidence: confidence.toNumber(),
                ema,
                publishTime: priceData.publishTime,
              };
            }
          }
        }
      }

      setPrices(newPrices);
    } catch (error) {
      console.error("Error fetching prices from Pyth:", error);
    } finally {
      setLoading(false);
    }
  }, [watchedTokens, prices]);

  // Auto-refresh prices when watched tokens change
  useEffect(() => {
    if (watchedTokens.size > 0) {
      // Initial fetch
      refreshPrices();

      // Set up interval for updates
      intervalRef.current = setInterval(() => {
        refreshPrices();
      }, 10000); // Update every 10 seconds
    } else {
      // Clear interval if no tokens to watch
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [watchedTokens.size, refreshPrices]);

  return (
    <PriceContext.Provider
      value={{
        prices,
        setPrices,
        loading,
        setLoading,
        addTokensToWatch,
        removeTokensFromWatch,
        getPriceForToken,
        refreshPrices,
      }}
    >
      {children}
    </PriceContext.Provider>
  );
};

export const usePriceContext = () => {
  const context = useContext(PriceContext);
  if (!context) {
    throw new Error("usePriceContext must be used within a PriceProvider");
  }
  return context;
}; 