/**
 * Price Update Cron Job
 *
 * POST /api/cron/update-prices
 * Updates prices for all tokens in the database by fetching quotes from Trading API
 *
 * This endpoint should be called by a cron service every minute.
 * For Vercel deployment, configure in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/update-prices",
 *     "schedule": "* * * * *"
 *   }]
 * }
 *
 * For local development, can be triggered manually or use node-cron.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic';

const TRADING_API_BASE = 'https://trade.api.uniswap.org/v1';
const USDC_ADDRESS = '0x078d782b760474a361dda0af3839290b0ef57ad6';
const CHAIN_ID = 130; // Unichain

// Amount of USDC to use for price quotes (1 USDC)
const QUOTE_AMOUNT = '1000000'; // 1 USDC (6 decimals)

const getApiKey = () => {
  return process.env.UNISWAP_API_KEY || process.env.NEXT_PUBLIC_UNISWAP_API_KEY || '';
};

// Verify request is from authorized source
function verifyAuthorization(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // In production, require authorization header matching secret
  if (process.env.NODE_ENV === 'production') {
    if (!cronSecret) {
      console.error('[Cron] CRON_SECRET not set in production');
      return false;
    }
    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('[Cron] Invalid authorization header');
      return false;
    }
  }

  return true;
}

export async function POST(request: Request) {
  try {
    // Verify authorization
    if (!verifyAuthorization(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = getApiKey();

    if (!apiKey) {
      console.warn('[Cron] No API key, skipping price update');
      return NextResponse.json(
        { error: 'No API key configured', updated: 0 },
        { status: 500 }
      );
    }

    // Get all tokens except USDC (we use USDC as base for quotes)
    const tokens = await prisma.token.findMany({
      where: {
        address: {
          not: USDC_ADDRESS.toLowerCase(),
        },
        chainId: CHAIN_ID,
      },
    });

    console.log(`[Cron] Updating prices for ${tokens.length} tokens`);

    const results: Array<{ token: string; success: boolean; error?: string }> = [];

    // Update prices with delay to avoid rate limiting
    for (const token of tokens) {
      try {
        // Get quote for 1 USDC -> Token
        const quoteResponse = await fetch(`${TRADING_API_BASE}/quote`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
          },
          body: JSON.stringify({
            swapper: '0x0000000000000000000000000000000000000001', // Dummy address
            tokenIn: USDC_ADDRESS,
            tokenOut: token.address,
            tokenInChainId: CHAIN_ID,
            tokenOutChainId: CHAIN_ID,
            amount: QUOTE_AMOUNT,
            type: 'EXACT_INPUT',
            slippageTolerance: 0.5,
          }),
        });

        if (!quoteResponse.ok) {
          const error = await quoteResponse.text();
          console.error(`[Cron] Failed to get quote for ${token.symbol}:`, error);
          results.push({ token: token.symbol, success: false, error });
          continue;
        }

        const quoteData = await quoteResponse.json();
        const outputAmount = BigInt(quoteData.quote.output.amount);

        // Calculate price: 1 USDC / output amount
        // Price = 1 / (outputAmount / 10^decimals)
        const divisor = BigInt(10 ** token.decimals);
        const outputInUnits = Number(outputAmount) / Number(divisor);
        const price = (1 / outputInUnits).toFixed(6);

        // Store price in database
        await prisma.tokenPrice.create({
          data: {
            tokenId: token.id,
            price,
            source: 'trading-api',
          },
        });

        console.log(`[Cron] Updated ${token.symbol}: $${price}`);
        results.push({ token: token.symbol, success: true });

        // Small delay to avoid rate limiting (100ms between requests)
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`[Cron] Error updating ${token.symbol}:`, error);
        results.push({
          token: token.symbol,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    console.log(`[Cron] Price update complete: ${successCount} success, ${failureCount} failures`);

    return NextResponse.json({
      success: true,
      updated: successCount,
      failed: failureCount,
      results,
    });
  } catch (error) {
    console.error('[Cron] Error in price update:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update prices' },
      { status: 500 }
    );
  }
}

// Allow GET for manual testing
export async function GET(request: Request) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Use POST in production' }, { status: 405 });
  }

  return POST(request);
}
