import { NextRequest, NextResponse } from 'next/server';

// Configuration for API endpoint
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Set the route to be dynamically rendered
export const dynamic = 'force-dynamic';

// Handle GET requests to /api/fee-growth/[wallet]
export async function GET(
  request: NextRequest
) {
  try {
    // Extract wallet directly from the URL path to avoid params issues
    const pathname = request.nextUrl.pathname;
    const walletMatch = pathname.match(/\/api\/fee-growth\/([^\/]+)/);
    
    if (!walletMatch || !walletMatch[1]) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }
    
    const wallet = walletMatch[1];
    const searchParams = request.nextUrl.searchParams;
    
    // Get query parameters
    const timeframe = searchParams.get('timeframe') || '7d';
    const position = searchParams.get('position') || null;
    const debug = searchParams.get('debug') === 'true';
    
    // Validate the wallet address (simple check for now)
    if (wallet.length < 10) {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      );
    }
    
    console.log(`Forwarding request to: ${API_BASE_URL}/fee-growth/${wallet}?timeframe=${timeframe}`);
    
    // Prepare API URL with parameters
    let apiUrl = `${API_BASE_URL}/fee-growth/${wallet}?timeframe=${timeframe}`;
    
    if (position) {
      apiUrl += `&position=${position}`;
    }
    
    if (debug) {
      apiUrl += '&debug=true';
    }
    
    // Forward the request to the backend API
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Return the data from the API
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in fee-growth API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fee growth data' },
      { status: 500 }
    );
  }
} 