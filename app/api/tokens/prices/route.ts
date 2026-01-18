import { NextRequest, NextResponse } from 'next/server';
import { fetchTokenPrices } from '@/lib/services/priceService';

/**
 * POST /api/tokens/prices
 * Batch fetch current prices for multiple token addresses
 *
 * Body: { addresses: string[] }
 * Returns: { [address: string]: number }
 *
 * Note: addresses can be either actual addresses or symbol:address format
 */
export async function POST(req: NextRequest) {
  try {
    const { addresses } = await req.json();

    if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
      return NextResponse.json(
        { error: 'Invalid addresses array' },
        { status: 400 }
      );
    }

    // Extract symbols from addresses (format: "SYMBOL" or "SYMBOL:address")
    const symbolMap = new Map<string, string>();
    const symbols: string[] = [];

    for (const addr of addresses) {
      // Check if address is in "SYMBOL" or "SYMBOL:address" format
      const parts = addr.split(':');
      const symbol = parts[0];

      symbols.push(symbol);
      symbolMap.set(symbol, addr);
    }

    // Fetch prices using symbols
    const symbolPrices = await fetchTokenPrices(symbols);

    // Map back to original addresses
    const prices: Record<string, number> = {};
    for (const [symbol, address] of symbolMap.entries()) {
      if (symbolPrices[symbol]) {
        prices[address] = symbolPrices[symbol];
      }
    }

    return NextResponse.json(prices);
  } catch (error) {
    console.error('Failed to fetch prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token prices' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/tokens/prices
 * Get prices for multiple tokens via query params
 *
 * Query: ?addresses=SYMBOL1,SYMBOL2 or ?addresses=0x123,0x456
 * Returns: { [address: string]: number }
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const addressesParam = searchParams.get('addresses');

    if (!addressesParam) {
      return NextResponse.json(
        { error: 'Missing addresses parameter' },
        { status: 400 }
      );
    }

    const addresses = addressesParam.split(',').map((a) => a.trim());

    // Extract symbols from addresses
    const symbolMap = new Map<string, string>();
    const symbols: string[] = [];

    for (const addr of addresses) {
      const parts = addr.split(':');
      const symbol = parts[0];

      symbols.push(symbol);
      symbolMap.set(symbol, addr);
    }

    // Fetch prices using symbols
    const symbolPrices = await fetchTokenPrices(symbols);

    // Map back to original addresses
    const prices: Record<string, number> = {};
    for (const [symbol, address] of symbolMap.entries()) {
      if (symbolPrices[symbol]) {
        prices[address] = symbolPrices[symbol];
      }
    }

    return NextResponse.json(prices);
  } catch (error) {
    console.error('Failed to fetch prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token prices' },
      { status: 500 }
    );
  }
}
