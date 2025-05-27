import { NextRequest, NextResponse } from 'next/server';

// Configuration for API endpoint
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Set the route to be dynamically rendered
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest
) {
  try {
    // Extract wallet directly from the URL path
    const pathname = request.nextUrl.pathname;
    const walletMatch = pathname.match(/\/api\/history\/([^\/]+)/);
    
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
    const metric = searchParams.get('metric') || 'total';
    
    // Build the URL for the backend API
    const url = `${API_BASE_URL}/history/${wallet}?timeframe=${timeframe}&metric=${metric}`;
    
    // Call the backend API
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch historical data: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in history API route:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch historical data' },
      { status: 500 }
    );
  }
} 