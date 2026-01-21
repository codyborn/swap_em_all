/**
 * User Stats API
 *
 * GET /api/game/stats?address=0x...
 * Returns user's captured tokens with current stats (purchase price, current price, profit/loss)
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

interface TokenStat {
  captureId: string;
  token: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
  };
  amountCaptured: string;
  purchasePrice: string; // USD at time of capture
  currentPrice: string; // Latest USD price
  profitLoss: string; // Difference in USD
  profitLossPercent: string; // Percentage change
  capturedAt: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { error: 'Missing required parameter: address' },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { address: address.toLowerCase() },
      include: {
        captures: {
          include: {
            token: {
              include: {
                prices: {
                  orderBy: { timestamp: 'desc' },
                  take: 1, // Get latest price
                },
              },
            },
          },
          orderBy: { capturedAt: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json({
        totalCaptures: 0,
        totalValue: '0',
        totalProfitLoss: '0',
        captures: [],
      });
    }

    // Calculate stats for each capture
    const stats: TokenStat[] = user.captures.map((capture) => {
      const latestPrice = capture.token.prices[0];
      const currentPrice = latestPrice?.price || '0';
      const purchasePrice = capture.purchasePrice;

      // Calculate profit/loss
      const purchasePriceNum = parseFloat(purchasePrice);
      const currentPriceNum = parseFloat(currentPrice);
      const profitLoss = currentPriceNum - purchasePriceNum;
      const profitLossPercent =
        purchasePriceNum > 0 ? ((profitLoss / purchasePriceNum) * 100).toFixed(2) : '0';

      return {
        captureId: capture.id,
        token: {
          address: capture.token.address,
          symbol: capture.token.symbol,
          name: capture.token.name,
          decimals: capture.token.decimals,
        },
        amountCaptured: capture.amountCaptured,
        purchasePrice: purchasePrice,
        currentPrice: currentPrice,
        profitLoss: profitLoss.toFixed(6),
        profitLossPercent: profitLossPercent,
        capturedAt: capture.capturedAt.toISOString(),
      };
    });

    // Calculate totals
    const totalValue = stats.reduce((sum, stat) => sum + parseFloat(stat.currentPrice), 0);
    const totalPurchaseValue = stats.reduce((sum, stat) => sum + parseFloat(stat.purchasePrice), 0);
    const totalProfitLoss = totalValue - totalPurchaseValue;

    return NextResponse.json({
      totalCaptures: stats.length,
      totalValue: totalValue.toFixed(6),
      totalProfitLoss: totalProfitLoss.toFixed(6),
      totalProfitLossPercent:
        totalPurchaseValue > 0 ? ((totalProfitLoss / totalPurchaseValue) * 100).toFixed(2) : '0',
      captures: stats,
    });
  } catch (error) {
    console.error('[Stats] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
