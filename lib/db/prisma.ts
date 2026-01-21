/**
 * Prisma Client Singleton
 *
 * Ensures a single instance of PrismaClient across the application
 * to avoid connection pool exhaustion in development.
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Helper to ensure database connection
export async function ensureConnection() {
  try {
    await prisma.$connect();
    console.log('[DB] Connected to database');
  } catch (error) {
    console.error('[DB] Failed to connect:', error);
    throw error;
  }
}

// Helper to seed tokens if they don't exist
export async function seedTokens() {
  const tokens = [
    {
      address: '0x078d782b760474a361dda0af3839290b0ef57ad6',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      chainId: 130,
    },
    {
      address: '0x4200000000000000000000000000000000000006',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      chainId: 130,
    },
    {
      address: '0x927b51f251480a681271180da4de28d44ec4afb8',
      symbol: 'WBTC',
      name: 'Wrapped Bitcoin',
      decimals: 8,
      chainId: 130,
    },
    {
      address: '0x20cab320a855b39f724131c69424240519573f81',
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
      chainId: 130,
    },
    {
      address: '0x9151434b16b9763660705744891fa906f660ecc5',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      chainId: 130,
    },
    {
      address: '0x8f187aa05619a017077f5308904739877ce9ea21',
      symbol: 'UNI',
      name: 'Uniswap',
      decimals: 18,
      chainId: 130,
    },
    {
      address: '0x7e10036acc4b56d4dfca3b77810356ce52313f9c',
      symbol: 'USDS',
      name: 'USDS Stablecoin',
      decimals: 18,
      chainId: 130,
    },
  ];

  for (const token of tokens) {
    await prisma.token.upsert({
      where: { address: token.address.toLowerCase() },
      update: {},
      create: {
        ...token,
        address: token.address.toLowerCase(),
      },
    });
  }

  console.log(`[DB] Seeded ${tokens.length} tokens`);
}
