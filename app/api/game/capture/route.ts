/**
 * Token Capture Registration API
 *
 * POST /api/game/capture
 * Registers a successful token capture after verifying the on-chain transaction.
 *
 * Flow:
 * 1. Receive tx hash from client
 * 2. Verify transaction on-chain (correct token, ~1 USDC spent, correct user)
 * 3. Store capture in database with purchase price
 * 4. Return capture details
 */

import { NextResponse } from 'next/server';
import { createPublicClient, http, parseAbi } from 'viem';
import { unichain } from 'viem/chains';
import { prisma } from '@/lib/db/prisma';

const publicClient = createPublicClient({
  chain: unichain,
  transport: http(),
});

// ERC20 ABI for checking transfer events
const ERC20_ABI = parseAbi([
  'event Transfer(address indexed from, address indexed to, uint256 value)',
]);

interface CaptureRequest {
  txHash: string;
  walletAddress: string;
  tokenAddress: string;
  expectedAmount: string; // Amount of token expected to receive
  usdcSpent: string; // Amount of USDC spent (should be ~1 USDC)
}

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Handle preflight OPTIONS request
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body: CaptureRequest = await request.json();
    const { txHash, walletAddress, tokenAddress, expectedAmount, usdcSpent } = body;

    // Validate inputs
    if (!txHash || !walletAddress || !tokenAddress || !expectedAmount || !usdcSpent) {
      return NextResponse.json(
        { error: 'Missing required fields: txHash, walletAddress, tokenAddress, expectedAmount, usdcSpent' },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log('[Capture] Verifying transaction:', { txHash, walletAddress, tokenAddress });

    // Check if capture already exists
    const existing = await prisma.tokenCapture.findUnique({
      where: { txHash: txHash.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Transaction already registered', capture: existing },
        { status: 409, headers: corsHeaders }
      );
    }

    // Verify transaction on-chain
    const receipt = await publicClient.getTransactionReceipt({ hash: txHash as `0x${string}` });

    if (!receipt) {
      return NextResponse.json(
        { error: 'Transaction not found or not yet mined' },
        { status: 404, headers: corsHeaders }
      );
    }

    if (receipt.status !== 'success') {
      return NextResponse.json(
        { error: 'Transaction failed on-chain' },
        { status: 400, headers: corsHeaders }
      );
    }

    const tx = await publicClient.getTransaction({ hash: txHash as `0x${string}` });

    // Verify transaction is from the correct wallet
    if (tx.from.toLowerCase() !== walletAddress.toLowerCase()) {
      return NextResponse.json(
        { error: 'Transaction sender does not match wallet address' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Verify USDC was spent (check for Transfer event from user for USDC)
    const USDC_ADDRESS = '0x078d782b760474a361dda0af3839290b0ef57ad6';
    const usdcTransfers = receipt.logs.filter(
      (log) =>
        log.address.toLowerCase() === USDC_ADDRESS.toLowerCase() &&
        log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' // Transfer event signature
    );

    if (usdcTransfers.length === 0) {
      return NextResponse.json(
        { error: 'No USDC transfer found in transaction' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Get or create user
    const user = await prisma.user.upsert({
      where: { address: walletAddress.toLowerCase() },
      update: {},
      create: { address: walletAddress.toLowerCase() },
    });

    // Get or create token
    const token = await prisma.token.upsert({
      where: { address: tokenAddress.toLowerCase() },
      update: {},
      create: {
        address: tokenAddress.toLowerCase(),
        symbol: 'UNKNOWN',
        name: 'Unknown Token',
        decimals: 18,
        chainId: 130,
      },
    });

    // Calculate purchase price (will be updated by price oracle)
    // For now, assume 1 USDC spent equals the purchase price in USD
    const purchasePrice = (Number(usdcSpent) / 1_000_000).toFixed(6); // Convert from 6 decimals to USD

    // Create capture record
    const capture = await prisma.tokenCapture.create({
      data: {
        userId: user.id,
        tokenId: token.id,
        txHash: txHash.toLowerCase(),
        purchasePrice,
        amountCaptured: expectedAmount,
        usdcSpent,
        verified: true,
        verifiedAt: new Date(),
      },
      include: {
        token: true,
      },
    });

    console.log('[Capture] Successfully registered:', capture.id);

    return NextResponse.json({
      success: true,
      capture: {
        id: capture.id,
        token: {
          address: capture.token.address,
          symbol: capture.token.symbol,
          name: capture.token.name,
        },
        amountCaptured: capture.amountCaptured,
        purchasePrice: capture.purchasePrice,
        capturedAt: capture.capturedAt,
      },
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('[Capture] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to register capture' },
      { status: 500, headers: corsHeaders }
    );
  }
}
