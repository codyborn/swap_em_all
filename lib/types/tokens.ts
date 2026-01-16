export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  chainId: number;
}

export interface TokenWithVolume extends Token {
  volume24h: number;
  price: number;
  priceChange24h: number;
}

export interface SwapQuote {
  tokenIn: Token;
  tokenOut: Token;
  amountIn: string;
  amountOut: string;
  priceImpact: number;
  gasEstimate: string;
  route: string[];
}

export interface EncounterToken extends TokenWithVolume {
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  creatureName: string;
  spriteUrl: string;
}
