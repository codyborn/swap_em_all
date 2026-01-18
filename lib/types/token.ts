// Token type definitions for Swap 'Em All

export interface CaughtToken {
  // Core identity
  symbol: string;
  name: string;
  address: string;
  caughtAt: number;

  // Price tracking
  purchasePrice: number;
  currentPrice: number;
  peakPrice: number;
  maxGain: number; // Maximum relative gain (high-water mark)
  lastPriceUpdate: number;
  priceHistory: PricePoint[];

  // Leveling
  level: number;
  maxLevel: number;
  experience: number;

  // Health
  health: number;
  maxHealth: number;
  isKnockedOut: boolean;
  lastHealthUpdate: number;

  // Battle stats
  stats: TokenStats;

  // Moves
  moves: Move[];

  // Metadata
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  type: TokenType;
  description: string;

  // History
  levelHistory: LevelHistoryEntry[];

  // Legacy field for backward compatibility
  amount?: string;
}

export interface TokenStats {
  attack: number;
  defense: number;
  speed: number;
  hp: number;
}

export interface PricePoint {
  price: number;
  timestamp: number;
}

export interface LevelHistoryEntry {
  level: number;
  price: number;
  timestamp: number;
  event: 'level_up' | 'damage_taken' | 'healed' | 'caught' | 'revived';
}

export type TokenType =
  | 'defi'
  | 'layer1'
  | 'layer2'
  | 'meme'
  | 'exchange'
  | 'governance'
  | 'wrapped'
  | 'unknown';

// Move definition
export interface Move {
  id: string;
  name: string;
  type: MoveType;
  power: number;
  accuracy: number;
  description: string;
  effect?: MoveEffect;
  animation?: string;
  learnedAt: number;
}

export type MoveType = 'attack' | 'defend' | 'special' | 'status';

export interface MoveEffect {
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'status';
  value: number;
  duration?: number;
  target: 'self' | 'opponent';
  stat?: 'attack' | 'defense' | 'speed';
}

// Default moves available to all tokens
export const DEFAULT_MOVES: Move[] = [
  {
    id: 'attack',
    name: 'Attack',
    type: 'attack',
    power: 40,
    accuracy: 95,
    description: 'A basic attack that deals damage.',
    learnedAt: 1,
  },
  {
    id: 'defend',
    name: 'Defend',
    type: 'defend',
    power: 0,
    accuracy: 100,
    description: 'Reduce damage by 50% and restore 10% HP.',
    effect: {
      type: 'buff',
      value: 50,
      duration: 1,
      target: 'self',
      stat: 'defense',
    },
    learnedAt: 1,
  },
  {
    id: 'rest',
    name: 'Rest',
    type: 'status',
    power: 0,
    accuracy: 100,
    description: 'Sleep for one turn to restore 50% HP.',
    effect: {
      type: 'heal',
      value: 50,
      target: 'self',
    },
    learnedAt: 5,
  },
];

// Helper to determine token type based on symbol
export function getTokenType(symbol: string): TokenType {
  const typeMap: Record<string, TokenType> = {
    // Layer 1
    ETH: 'layer1',
    BTC: 'layer1',
    SOL: 'layer1',
    AVAX: 'layer1',

    // Layer 2
    OP: 'layer2',
    ARB: 'layer2',
    MATIC: 'layer2',

    // DeFi
    UNI: 'defi',
    AAVE: 'defi',
    LINK: 'defi',
    SUSHI: 'defi',
    CRV: 'defi',
    SNX: 'defi',
    USDC: 'defi',
    DAI: 'defi',

    // Meme
    DOGE: 'meme',
    SHIB: 'meme',
    PEPE: 'meme',

    // Exchange
    BNB: 'exchange',
    CRO: 'exchange',

    // Governance
    COMP: 'governance',
    MKR: 'governance',
    ENS: 'governance',

    // Wrapped
    WETH: 'wrapped',
    WBTC: 'wrapped',
    stETH: 'wrapped',
  };

  return typeMap[symbol] || 'unknown';
}

// Helper to get base stats for token type
export function getBaseStats(tokenType: TokenType): Partial<TokenStats> {
  const baseStatsMap: Record<TokenType, Partial<TokenStats>> = {
    layer1: { attack: 12, defense: 12, speed: 8, hp: 55 },
    defi: { attack: 11, defense: 10, speed: 12, hp: 50 },
    layer2: { attack: 10, defense: 11, speed: 14, hp: 48 },
    meme: { attack: 15, defense: 8, speed: 15, hp: 45 },
    exchange: { attack: 11, defense: 11, speed: 11, hp: 52 },
    governance: { attack: 10, defense: 12, speed: 9, hp: 53 },
    wrapped: { attack: 12, defense: 11, speed: 10, hp: 54 },
    unknown: { attack: 10, defense: 10, speed: 10, hp: 50 },
  };

  return baseStatsMap[tokenType];
}
