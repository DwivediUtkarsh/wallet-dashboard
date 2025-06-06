import { NextRequest, NextResponse } from 'next/server';

// Configuration for API endpoint
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Set the route to be dynamically rendered
export const dynamic = 'force-dynamic';

// Handle GET requests to /api/fee-collections/[wallet]
export async function GET(
  request: NextRequest
) {
  try {
    // Extract wallet directly from the URL path to avoid params issues
    const pathname = request.nextUrl.pathname;
    const walletMatch = pathname.match(/\/api\/fee-collections\/([^\/]+)/);
    
    if (!walletMatch || !walletMatch[1]) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }
    
    const wallet = walletMatch[1];
    const searchParams = request.nextUrl.searchParams;
    
    // Get query parameters
    const timeframe = searchParams.get('timeframe') || '30d';
    
    // Validate the wallet address (simple check for now)
    if (wallet.length < 10) {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      );
    }
    
    console.log(`Forwarding request to: ${API_BASE_URL}/fee-collections/${wallet}?timeframe=${timeframe}`);
    
    // Prepare API URL with parameters
    const apiUrl = `${API_BASE_URL}/fee-collections/${wallet}?timeframe=${timeframe}`;
    
    // Forward the request to the backend API
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Return the data from the API with cache-busting headers
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      }
    });
  } catch (error) {
    console.error('Error in fee-collections API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fee collections data' },
      { status: 500 }
    );
  }
} 