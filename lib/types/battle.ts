// Battle system type definitions

import { CaughtToken, Move, TokenStats } from './token';

export interface BattleState {
  id: string;
  type: 'gym' | 'wild' | 'pvp';

  // Participants
  player: BattleParticipant;
  opponent: BattleParticipant;

  // State
  turn: 'player' | 'opponent';
  turnNumber: number;
  phase: 'select_move' | 'animating' | 'ended';

  // Battle log
  log: BattleLogEntry[];

  // Gym specific
  gymData?: {
    gymId: string;
    gymLeader: string;
    badge?: Badge;
  };

  // Results
  winner?: 'player' | 'opponent';
  rewards?: BattleRewards;
}

export interface BattleParticipant {
  name: string;
  token: CaughtToken;
  currentHP: number;
  temporaryStats: TokenStats;  // For buffs/debuffs
  statusEffects: StatusEffect[];
  selectedMove?: Move;
  isDefending: boolean;
}

export interface BattleLogEntry {
  timestamp: number;
  turn: number;
  message: string;
  type: 'move' | 'damage' | 'heal' | 'status' | 'result' | 'miss';
}

export interface StatusEffect {
  type: 'burn' | 'poison' | 'defense_up' | 'attack_up' | 'sleep';
  duration: number;
  value?: number;
}

export interface BattleRewards {
  usdc?: number;
  items?: Array<{ type: string; quantity: number }>;
  experience?: number;
  badge?: Badge;
}

export interface Badge {
  id: string;
  name: string;
  gymName: string;
  gymLeader: string;
  description: string;
  icon: string;
  earnedAt?: number;
  order: number;  // 1-8
}

// Gym leader configurations
export interface GymLeader {
  id: string;
  name: string;
  gymName: string;
  specialty: string;
  description: string;
  badge: Omit<Badge, 'earnedAt'>;
  team: GymLeaderToken[];
}

export interface GymLeaderToken {
  symbol: string;
  level: number;
  moves?: Move[];
}

// Pre-defined gym leaders
export const GYM_LEADERS: GymLeader[] = [
  {
    id: 'gym1',
    name: 'Peg Master',
    gymName: 'Stablecoin Gym',
    specialty: 'Stablecoins',
    description: 'Master of stable assets and consistent value.',
    badge: {
      id: 'stable_badge',
      name: 'Stable Badge',
      gymName: 'Stablecoin Gym',
      gymLeader: 'Peg Master',
      description: 'Proof of mastery over stable assets',
      icon: '⚖️',
      order: 1,
    },
    team: [
      { symbol: 'USDC', level: 5 },
    ],
  },
  {
    id: 'gym2',
    name: 'Protocol Pete',
    gymName: 'DeFi Blue Chip Gym',
    specialty: 'DeFi Protocols',
    description: 'Veteran of decentralized finance.',
    badge: {
      id: 'defi_badge',
      name: 'DeFi Badge',
      gymName: 'DeFi Blue Chip Gym',
      gymLeader: 'Protocol Pete',
      description: 'Proof of DeFi protocol mastery',
      icon: '🏦',
      order: 2,
    },
    team: [
      { symbol: 'UNI', level: 8 },
      { symbol: 'AAVE', level: 7 },
    ],
  },
  {
    id: 'gym3',
    name: 'Scaler Sam',
    gymName: 'Layer 2 Gym',
    specialty: 'Layer 2 Solutions',
    description: 'Specialist in scaling technologies.',
    badge: {
      id: 'scale_badge',
      name: 'Scale Badge',
      gymName: 'Layer 2 Gym',
      gymLeader: 'Scaler Sam',
      description: 'Proof of scaling solution mastery',
      icon: '⚡',
      order: 3,
    },
    team: [
      { symbol: 'OP', level: 10 },
      { symbol: 'ARB', level: 10 },
    ],
  },
  {
    id: 'gym4',
    name: 'Viral Vince',
    gymName: 'Meme Gym',
    specialty: 'Meme Coins',
    description: 'The chaos of viral tokens.',
    badge: {
      id: 'meme_badge',
      name: 'Meme Badge',
      gymName: 'Meme Gym',
      gymLeader: 'Viral Vince',
      description: 'Proof of meme mastery',
      icon: '🐕',
      order: 4,
    },
    team: [
      { symbol: 'DOGE', level: 12 },
      { symbol: 'SHIB', level: 11 },
    ],
  },
  {
    id: 'gym5',
    name: 'CEX Charlie',
    gymName: 'Exchange Token Gym',
    specialty: 'Exchange Tokens',
    description: 'Master of centralized exchange tokens.',
    badge: {
      id: 'exchange_badge',
      name: 'Exchange Badge',
      gymName: 'Exchange Token Gym',
      gymLeader: 'CEX Charlie',
      description: 'Proof of exchange token mastery',
      icon: '💱',
      order: 5,
    },
    team: [
      { symbol: 'BNB', level: 15 },
      { symbol: 'CRO', level: 14 },
    ],
  },
  {
    id: 'gym6',
    name: 'DAO Diana',
    gymName: 'Governance Gym',
    specialty: 'Governance Tokens',
    description: 'Champion of decentralized governance.',
    badge: {
      id: 'governance_badge',
      name: 'Governance Badge',
      gymName: 'Governance Gym',
      gymLeader: 'DAO Diana',
      description: 'Proof of governance mastery',
      icon: '🗳️',
      order: 6,
    },
    team: [
      { symbol: 'COMP', level: 17 },
      { symbol: 'MKR', level: 16 },
      { symbol: 'ENS', level: 15 },
    ],
  },
  {
    id: 'gym7',
    name: 'Wrapper Will',
    gymName: 'Wrapped Asset Gym',
    specialty: 'Wrapped Assets',
    description: 'Expert in bridged and wrapped tokens.',
    badge: {
      id: 'wrapped_badge',
      name: 'Wrapped Badge',
      gymName: 'Wrapped Asset Gym',
      gymLeader: 'Wrapper Will',
      description: 'Proof of wrapped asset mastery',
      icon: '🎁',
      order: 7,
    },
    team: [
      { symbol: 'WETH', level: 20 },
      { symbol: 'WBTC', level: 19 },
      { symbol: 'stETH', level: 18 },
    ],
  },
  {
    id: 'gym8',
    name: 'Satoshi Supreme',
    gymName: 'Elite Gym',
    specialty: 'Mixed Elite',
    description: 'The ultimate champion of all token types.',
    badge: {
      id: 'champion_badge',
      name: 'Champion Badge',
      gymName: 'Elite Gym',
      gymLeader: 'Satoshi Supreme',
      description: 'Proof of ultimate mastery',
      icon: '👑',
      order: 8,
    },
    team: [
      { symbol: 'WETH', level: 25 },
      { symbol: 'UNI', level: 24 },
      { symbol: 'LINK', level: 23 },
    ],
  },
];
