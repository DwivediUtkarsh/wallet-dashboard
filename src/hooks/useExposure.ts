import { useState, useEffect, useCallback } from 'react';
import { TokenExposureData } from '@/types/api';
import { getExposure } from '@/lib/api-client';

interface UseExposureReturn {
  exposures: TokenExposureData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useExposure(limit: number = 20): UseExposureReturn {
  const [exposures, setExposures] = useState<TokenExposureData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExposures = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await getExposure(limit);
      setExposures(data);
    } catch (err) {
      console.error('Error fetching exposure data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch exposure data');
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchExposures();
  }, [fetchExposures]);

  return {
    exposures,
    isLoading,
    error,
    refetch: fetchExposures
  };
} 