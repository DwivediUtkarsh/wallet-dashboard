import { NextResponse } from 'next/server';

// Spreadsheet details
const SHEET_ID = '1apfrsTan5mZqkuup9Sri6bNOwj_wXkbvtj8B-HV3KJU';
// The Google API key is public-read-only and provided via environment variable
const API_KEY = process.env.NEXT_PUBLIC_GSHEETS_KEY;

// If we ever need ISR we can drop dynamic, but keep it for fresh data
export const dynamic = 'force-dynamic';

/**
 * GET /api/ppa
 *
 * Returns JSON: {
 *   apr: string,
 *   totalPnl: string,
 *   fundsDeployed: string,
 *   pnl24h: string
 * }
 */
export async function GET() {
  if (!API_KEY) {
    return NextResponse.json(
      { error: 'Missing NEXT_PUBLIC_GSHEETS_KEY' },
      { status: 500 },
    );
  }

  // Prepare batch ranges – two single cells + whole columns B and D
  const ranges = ['I5', 'I6', 'B:B', 'D:D']
    .map((r) => `ranges=${encodeURIComponent(r)}`)
    .join('&');

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values:batchGet?${ranges}&majorDimension=COLUMNS&key=${API_KEY}`;

  try {
    const res = await fetch(url, {
      // We pass no-cache so viewers always see the latest edit (sheet is updated daily)
      next: { revalidate: 0 },
    });

    if (!res.ok) throw new Error(`Sheets API error ${res.status}`);

    const data = await res.json();
    const [totalPnlRange, aprRange, fundsCol, pnlCol] = data.valueRanges;

    const totalPnl = totalPnlRange?.values?.[0]?.[0] ?? '0';
    const apr = aprRange?.values?.[0]?.[0] ?? '0';

    // Get last non-empty entries of columns B and D (funds deployed and 24h PnL)
    const reversedFunds = [...(fundsCol?.values?.[0] ?? [])].reverse();
    const reversedPnl = [...(pnlCol?.values?.[0] ?? [])].reverse();

    const fundsDeployed = reversedFunds.find((v) => v?.length) ?? '0';
    const pnl24h = reversedPnl.find((v) => v?.length) ?? '0';

    return NextResponse.json({ apr, totalPnl, fundsDeployed, pnl24h });
  } catch (err) {
    console.error('[api/ppa] error:', err);
    return NextResponse.json({ error: 'Failed to fetch sheet data' }, { status: 500 });
  }
} 