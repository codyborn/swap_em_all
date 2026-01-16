import { NextResponse } from 'next/server';

// Top tokens on Base by volume (hardcoded for MVP)
// In production, this would fetch from Uniswap API or The Graph
const TOP_TOKENS = [
  {
    address: '0x4200000000000000000000000000000000000006',
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
    volume24h: 50000000,
    rarity: 'uncommon',
    creatureName: 'Etheron',
  },
  {
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    volume24h: 100000000,
    rarity: 'common',
    creatureName: 'Stablecoin',
  },
  {
    address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    volume24h: 30000000,
    rarity: 'common',
    creatureName: 'Daicoin',
  },
  {
    address: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
    symbol: 'USDbC',
    name: 'USD Base Coin',
    decimals: 6,
    volume24h: 40000000,
    rarity: 'common',
    creatureName: 'Basecoin',
  },
  {
    address: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22',
    symbol: 'cbETH',
    name: 'Coinbase Wrapped Staked ETH',
    decimals: 18,
    volume24h: 25000000,
    rarity: 'uncommon',
    creatureName: 'Stakeron',
  },
  {
    address: '0x0000000000000000000000000000000000000000',
    symbol: 'PEPE',
    name: 'Pepe',
    decimals: 18,
    volume24h: 15000000,
    rarity: 'rare',
    creatureName: 'Pepe',
  },
  {
    address: '0x0000000000000000000000000000000000000001',
    symbol: 'DEGEN',
    name: 'Degen',
    decimals: 18,
    volume24h: 8000000,
    rarity: 'rare',
    creatureName: 'Degemon',
  },
  {
    address: '0x0000000000000000000000000000000000000002',
    symbol: 'TOSHI',
    name: 'Toshi',
    decimals: 18,
    volume24h: 5000000,
    rarity: 'rare',
    creatureName: 'Toshimon',
  },
  {
    address: '0x0000000000000000000000000000000000000003',
    symbol: 'BRETT',
    name: 'Brett',
    decimals: 18,
    volume24h: 3000000,
    rarity: 'legendary',
    creatureName: 'Brettasaurus',
  },
  {
    address: '0x0000000000000000000000000000000000000004',
    symbol: 'MFER',
    name: 'Mfer',
    decimals: 18,
    volume24h: 2000000,
    rarity: 'legendary',
    creatureName: 'Mfermon',
  },
];

export async function GET() {
  try {
    // In production, fetch from Uniswap API or The Graph
    // For now, return our hardcoded list with some randomization

    // Calculate total volume for weighted selection
    const totalVolume = TOP_TOKENS.reduce((sum, token) => sum + token.volume24h, 0);

    const tokensWithProbability = TOP_TOKENS.map(token => ({
      ...token,
      encounterProbability: token.volume24h / totalVolume,
      spriteUrl: `/assets/sprites/tokens/${token.symbol.toLowerCase()}.png`,
    }));

    return NextResponse.json({
      tokens: tokensWithProbability,
      totalVolume,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tokens' },
      { status: 500 }
    );
  }
}
