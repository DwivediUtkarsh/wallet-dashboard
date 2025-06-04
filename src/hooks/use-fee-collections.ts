import { useState, useEffect } from 'react';

interface FeeCollection {
  id: number;
  protocol: string;
  position_address?: string;
  pool_name: string;
  token_a_symbol: string;
  token_b_symbol: string;
  usd_amount: number;
  collection_time: string;
  collection_type: string;
  converted_to_jitosol: boolean;
  conversion_time: string | null;
}

interface JitoSolConversion {
  id: number;
  previous_amount: number;
  new_amount: number;
  increase_amount: number;
  price_usd: number;
  value_usd: number;
  conversion_time: string;
  conversion_type: string;
}

interface FeeCollectionsSummary {
  total_collected_usd: number;
  total_converted_usd: number;
  collection_events: number;
  conversion_events: number;
}

interface FeeCollectionsData {
  wallet_address: string;
  timeframe: string;
  summary: FeeCollectionsSummary;
  fee_collections: FeeCollection[];
  jitosol_conversions: JitoSolConversion[];
}

interface UseFeeCollectionsResult {
  data: FeeCollectionsData | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useFeeCollections(
  walletAddress: string,
  timeframe: string = '30d'
): UseFeeCollectionsResult {
  const [data, setData] = useState<FeeCollectionsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [refreshCount, setRefreshCount] = useState<number>(0);

  const refetch = () => setRefreshCount(prev => prev + 1);

  useEffect(() => {
    async function fetchFeeCollections() {
      if (!walletAddress) return;

      setIsLoading(true);
      setIsError(false);
      setError(null);

      try {
        const response = await fetch(`/api/fee-collections/${walletAddress}?timeframe=${timeframe}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch fee collections: ${response.statusText}`);
        }
        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        console.error('Error fetching fee collections:', err);
        setIsError(true);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    }

    fetchFeeCollections();
  }, [walletAddress, timeframe, refreshCount]);

  return { data, isLoading, isError, error, refetch };
} 