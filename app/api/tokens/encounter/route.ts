import { NextResponse } from 'next/server';
import { fetchTokenPrice } from '@/lib/services/priceService';
import { TOKENS } from '@/lib/web3/config';

// Wild token encounters - Base mainnet tokens available for real swaps
// These match the tokens in lib/web3/config.ts with real contract addresses
const BASE_TOKENS = [
  // Common - Stablecoins and wrapped assets (most liquid)
  {
    ...TOKENS.USDC,
    volume24h: 100000000,
    rarity: 'common',
    priceSymbol: 'usd-coin', // CoinGecko ID
  },
  {
    ...TOKENS.DAI,
    volume24h: 90000000,
    rarity: 'common',
    priceSymbol: 'dai',
  },
  {
    ...TOKENS.WETH,
    volume24h: 80000000,
    rarity: 'common',
    priceSymbol: 'weth',
  },

  // Uncommon - Base ecosystem token
  {
    ...TOKENS.AERO,
    volume24h: 40000000,
    rarity: 'uncommon',
    priceSymbol: 'aerodrome-finance',
  },

  // Rare - Meme tokens on Base
  {
    ...TOKENS.BRETT,
    volume24h: 20000000,
    rarity: 'rare',
    priceSymbol: 'based-brett',
  },
  {
    ...TOKENS.DEGEN,
    volume24h: 15000000,
    rarity: 'rare',
    priceSymbol: 'degen-base',
  },

  // Legendary - Rare Base meme
  {
    ...TOKENS.TOSHI,
    volume24h: 5000000,
    rarity: 'legendary',
    priceSymbol: 'toshi',
  },
];

// Volume-weighted random token selection
function selectRandomToken() {
  const totalVolume = BASE_TOKENS.reduce((sum, token) => sum + token.volume24h, 0);
  let random = Math.random() * totalVolume;

  for (const token of BASE_TOKENS) {
    random -= token.volume24h;
    if (random <= 0) {
      return token;
    }
  }

  return BASE_TOKENS[0]; // Fallback
}

export async function GET() {
  try {
    const selectedToken = selectRandomToken();

    // Fetch real-time price using CoinGecko ID
    const price = await fetchTokenPrice(selectedToken.priceSymbol);

    return NextResponse.json({
      token: {
        symbol: selectedToken.symbol,
        name: selectedToken.name,
        address: selectedToken.address,
        decimals: selectedToken.decimals,
        rarity: selectedToken.rarity,
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
