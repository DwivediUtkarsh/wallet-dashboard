import { useQuery } from "@tanstack/react-query";
import Decimal from "decimal.js";

const JITOSOL_MINT =
  "J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn";
const SOL_MINT =
  "So11111111111111111111111111111111111111112";
const QUOTE_URL = "https://quote-api.jup.ag/v6/quote";

/**
 * Build the query URL that Jupiter expects.
 * Note: `amount` must be provided in raw lamports (atomic units).
 */
function buildQuoteUrl(amountLamports: string) {
  return (
    `${QUOTE_URL}?inputMint=${JITOSOL_MINT}` +
    `&outputMint=${SOL_MINT}` +
    `&amount=${amountLamports}` +
    `&slippageBps=50`
  );
}

interface QuoteResponse {
  outAmount: string; // raw lamports
  priceImpactPct: string;
  routePlan: unknown[];
  // ... we ignore the rest for now
}

/**
 * React-Query powered hook that returns the SOL quote for a given JitoSOL amount (in UI units).
 *
 * @param jitoAmountUi – amount of JitoSOL expressed in human-readable units (e.g. "1.234")
 */
export function useJitoSolQuote(jitoAmountUi: number | string | undefined) {
  const enabled = !!jitoAmountUi && Number(jitoAmountUi) > 0;

  return useQuery<QuoteResponse | null, Error>({
    queryKey: ["jitosol-quote", jitoAmountUi],
    enabled,
    // Re-fetch every 8 s so the quote stays reasonably fresh
    refetchInterval: 8_000,
    staleTime: 8_000,
    queryFn: async () => {
      if (!enabled) return null;

      // Convert UI amount → lamports using Decimal to avoid JS float imprecision
      const lamports = new Decimal(jitoAmountUi as Decimal.Value)
        .mul(1e9)
        .toFixed(0);

      const url = buildQuoteUrl(lamports);
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to fetch quote – status ${res.status}`);
      }
      const data: QuoteResponse = await res.json();
      return data;
    },
  });
} 