import { useQuery } from '@tanstack/react-query';

interface PPAResponse {
  apr: string;
  totalPnl: string;
  fundsDeployed: string;
  pnl24h: string;
}

export function usePPA24h() {
  return useQuery<PPAResponse, Error>({
    queryKey: ['ppa-24h'],
    queryFn: async () => {
      const res = await fetch('/api/ppa');
      if (!res.ok) {
        throw new Error('Failed to fetch PPA sheet data');
      }
      return res.json();
    },
    staleTime: 60 * 60 * 1000, // 1 hour, sheet updates daily
    refetchOnWindowFocus: false,
  });
} 