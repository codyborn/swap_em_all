import { NextResponse } from 'next/server';

// Import the token list with prices
const TOP_TOKENS = [
  { symbol: 'WETH', name: 'Etheron', volume24h: 50000000, rarity: 'uncommon', address: '0x4200000000000000000000000000000000000006', price: 3250 },
  { symbol: 'USDC', name: 'Stablecoin', volume24h: 100000000, rarity: 'common', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', price: 1 },
  { symbol: 'DAI', name: 'Daicoin', volume24h: 30000000, rarity: 'common', address: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA', price: 0.999 },
  { symbol: 'USDbC', name: 'Basecoin', volume24h: 40000000, rarity: 'common', address: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22', price: 1 },
  { symbol: 'cbETH', name: 'Stakeron', volume24h: 25000000, rarity: 'uncommon', address: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22', price: 3100 },
  { symbol: 'PEPE', name: 'Pepe', volume24h: 15000000, rarity: 'rare', address: '0x0000000000000000000000000000000000000000', price: 0.000015 },
  { symbol: 'DEGEN', name: 'Degemon', volume24h: 8000000, rarity: 'rare', address: '0x0000000000000000000000000000000000000001', price: 0.012 },
  { symbol: 'TOSHI', name: 'Toshimon', volume24h: 5000000, rarity: 'rare', address: '0x0000000000000000000000000000000000000002', price: 0.0008 },
  { symbol: 'BRETT', name: 'Brettasaurus', volume24h: 3000000, rarity: 'legendary', address: '0x0000000000000000000000000000000000000003', price: 0.15 },
  { symbol: 'MFER', name: 'Mfermon', volume24h: 2000000, rarity: 'legendary', address: '0x0000000000000000000000000000000000000004', price: 0.025 },
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

    return NextResponse.json({
      token: {
        ...selectedToken,
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
