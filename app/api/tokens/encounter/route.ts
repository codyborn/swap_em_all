import { NextResponse } from 'next/server';
import { fetchTokenPrice } from '@/lib/services/priceService';

// Wild token encounters - using real tokens with CoinGecko support
// address field uses symbol for price lookups
const TOP_TOKENS = [
  // Common - Stablecoins and wrapped assets
  { symbol: 'USDC', name: 'USDC', volume24h: 100000000, rarity: 'common', address: 'USDC' },
  { symbol: 'DAI', name: 'DAI', volume24h: 90000000, rarity: 'common', address: 'DAI' },
  { symbol: 'WETH', name: 'Wrapped Ether', volume24h: 80000000, rarity: 'common', address: 'WETH' },

  // Uncommon - Major DeFi tokens
  { symbol: 'UNI', name: 'Uniswap', volume24h: 60000000, rarity: 'uncommon', address: 'UNI' },
  { symbol: 'LINK', name: 'Chainlink', volume24h: 55000000, rarity: 'uncommon', address: 'LINK' },
  { symbol: 'AAVE', name: 'Aave', volume24h: 50000000, rarity: 'uncommon', address: 'AAVE' },

  // Rare - Layer 2 and specialized DeFi
  { symbol: 'OP', name: 'Optimism', volume24h: 30000000, rarity: 'rare', address: 'OP' },
  { symbol: 'ARB', name: 'Arbitrum', volume24h: 28000000, rarity: 'rare', address: 'ARB' },
  { symbol: 'CRV', name: 'Curve', volume24h: 20000000, rarity: 'rare', address: 'CRV' },
  { symbol: 'SNX', name: 'Synthetix', volume24h: 18000000, rarity: 'rare', address: 'SNX' },

  // Legendary - Meme coins and governance
  { symbol: 'DOGE', name: 'Dogecoin', volume24h: 15000000, rarity: 'legendary', address: 'DOGE' },
  { symbol: 'SHIB', name: 'Shiba Inu', volume24h: 12000000, rarity: 'legendary', address: 'SHIB' },
  { symbol: 'PEPE', name: 'Pepe', volume24h: 10000000, rarity: 'legendary', address: 'PEPE' },
  { symbol: 'MKR', name: 'Maker', volume24h: 8000000, rarity: 'legendary', address: 'MKR' },
];

// Volume-weighted random token selection
function selectRandomToken() {
  const totalVolume = TOP_TOKENS.reduce((sum, token) => sum + token.volume24h, 0);
  let random = Math.random() * totalVolume;

  for (const token of TOP_TOKENS) {
    random -= token.volume24h;
    if (random <= 0) {
      return token;
    }
  }

  return TOP_TOKENS[0]; // Fallback
}

export async function GET() {
  try {
    const selectedToken = selectRandomToken();

    // Fetch real-time price
    const price = await fetchTokenPrice(selectedToken.symbol);

    return NextResponse.json({
      token: {
        ...selectedToken,
        price, // Real-time price from CoinGecko
        spriteUrl: `/assets/sprites/tokens/${selectedToken.symbol.toLowerCase()}.png`,
        encounterText: `A wild ${selectedToken.name} appeared!`,
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error generating encounter:', error);
    return NextResponse.json(
      { error: 'Failed to generate encounter' },
      { status: 500 }
    );
  }
}
