import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/tokens/prices
 * Batch fetch current prices for multiple token addresses
 *
 * Body: { addresses: string[] }
 * Returns: { [address: string]: number }
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

    // For MVP, we'll simulate price fetching
    // In production, this would call CoinGecko, CoinMarketCap, or a price oracle
    const prices: Record<string, number> = {};

    // Simulate prices based on token symbol
    // In production, you'd batch fetch from an API
    for (const address of addresses) {
      prices[address] = await fetchTokenPrice(address);
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
 * Fetch price for a single token
 * This is a simplified version - in production, use real API
 */
async function fetchTokenPrice(address: string): Promise<number> {
  // Simulated prices for demo purposes
  // In production, call actual price APIs
  const mockPrices: Record<string, number> = {
    // Real addresses from Base chain
    '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913': 1.0,    // USDC
    '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb': 0.999, // DAI
    '0x4200000000000000000000000000000000000006': 3250,  // WETH
    '0x940181a94A35A4569E4529A3CDfB74e38FD98631': 25,    // AAVE
    '0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452': 10.5,  // wstETH (simulated)
  };

  // If address is in mock data, return it
  if (mockPrices[address]) {
    return mockPrices[address];
  }

  // Otherwise, generate a semi-random price that varies slightly
  // This simulates market movement for demo purposes
  const basePrice = 100;
  const variation = (Math.random() - 0.5) * 20; // ±10%

  return basePrice + variation;
}

/**
 * GET /api/tokens/prices
 * Get prices for multiple tokens via query params
 *
 * Query: ?addresses=0x123,0x456
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

    const addresses = addressesParam.split(',');
    const prices: Record<string, number> = {};

    for (const address of addresses) {
      prices[address] = await fetchTokenPrice(address.trim());
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
