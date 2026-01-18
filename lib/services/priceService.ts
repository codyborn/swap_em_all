/**
 * Price service for fetching real token prices from CoinGecko
 */

// Map token symbols to CoinGecko IDs
export const COINGECKO_IDS: Record<string, string> = {
  // Layer 1
  ETH: 'ethereum',
  BTC: 'bitcoin',
  SOL: 'solana',
  AVAX: 'avalanche-2',

  // Layer 2
  OP: 'optimism',
  ARB: 'arbitrum',
  MATIC: 'matic-network',

  // DeFi
  UNI: 'uniswap',
  AAVE: 'aave',
  LINK: 'chainlink',
  SUSHI: 'sushi',
  CRV: 'curve-dao-token',
  SNX: 'havven',
  USDC: 'usd-coin',
  DAI: 'dai',

  // Meme
  DOGE: 'dogecoin',
  SHIB: 'shiba-inu',
  PEPE: 'pepe',

  // Exchange
  BNB: 'binancecoin',
  CRO: 'crypto-com-chain',

  // Governance
  COMP: 'compound-governance-token',
  MKR: 'maker',
  ENS: 'ethereum-name-service',

  // Wrapped
  WETH: 'weth',
  WBTC: 'wrapped-bitcoin',
  stETH: 'staked-ether',
};

interface PriceCache {
  price: number;
  timestamp: number;
}

// Cache prices for 1 minute to avoid excessive API calls
const priceCache = new Map<string, PriceCache>();
const CACHE_DURATION = 60 * 1000; // 1 minute

/**
 * Fetch prices for multiple tokens from CoinGecko
 */
export async function fetchTokenPrices(symbols: string[]): Promise<Record<string, number>> {
  const prices: Record<string, number> = {};
  const symbolsToFetch: string[] = [];
  const now = Date.now();

  // Check cache first
  for (const symbol of symbols) {
    const cached = priceCache.get(symbol);
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      prices[symbol] = cached.price;
    } else {
      symbolsToFetch.push(symbol);
    }
  }

  // If all prices are cached, return immediately
  if (symbolsToFetch.length === 0) {
    return prices;
  }

  // Map symbols to CoinGecko IDs
  const ids = symbolsToFetch
    .map((symbol) => COINGECKO_IDS[symbol])
    .filter((id) => id !== undefined);

  if (ids.length === 0) {
    console.warn('No valid CoinGecko IDs found for symbols:', symbolsToFetch);
    return prices;
  }

  try {
    // Batch fetch from CoinGecko
    const idsParam = ids.join(',');
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${idsParam}&vs_currencies=usd`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`CoinGecko API returned ${response.status}`);
    }

    const data = await response.json();

    // Map CoinGecko IDs back to symbols
    for (const symbol of symbolsToFetch) {
      const coinGeckoId = COINGECKO_IDS[symbol];
      if (coinGeckoId && data[coinGeckoId]?.usd) {
        const price = data[coinGeckoId].usd;
        prices[symbol] = price;

        // Update cache
        priceCache.set(symbol, {
          price,
          timestamp: now,
        });
      }
    }

    console.log(`Fetched ${Object.keys(prices).length} prices from CoinGecko`);
  } catch (error) {
    console.error('Failed to fetch from CoinGecko:', error);

    // Fallback to mock prices for demo
    for (const symbol of symbolsToFetch) {
      prices[symbol] = getMockPrice(symbol);
    }
  }

  return prices;
}

/**
 * Get a single token price
 */
export async function fetchTokenPrice(symbol: string): Promise<number> {
  const prices = await fetchTokenPrices([symbol]);
  return prices[symbol] || getMockPrice(symbol);
}

/**
 * Mock prices for fallback/development
 */
function getMockPrice(symbol: string): number {
  const mockPrices: Record<string, number> = {
    // Stablecoins
    USDC: 1.0,
    DAI: 0.999,

    // Layer 1
    ETH: 3250,
    BTC: 65000,
    SOL: 140,
    AVAX: 35,

    // Layer 2
    OP: 2.5,
    ARB: 1.2,
    MATIC: 0.85,

    // DeFi
    UNI: 10.5,
    AAVE: 180,
    LINK: 18,
    SUSHI: 1.2,
    CRV: 0.85,
    SNX: 3.5,

    // Meme
    DOGE: 0.15,
    SHIB: 0.00002,
    PEPE: 0.000012,

    // Exchange
    BNB: 580,
    CRO: 0.12,

    // Governance
    COMP: 65,
    MKR: 2400,
    ENS: 28,

    // Wrapped
    WETH: 3250,
    WBTC: 65000,
    stETH: 3260,
  };

  return mockPrices[symbol] || 100;
}

/**
 * Clear the price cache (useful for testing)
 */
export function clearPriceCache() {
  priceCache.clear();
}
