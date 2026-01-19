import { NextResponse } from 'next/server';

const TRADING_API_BASE = 'https://trade.api.uniswap.org/v1';

const getApiKey = () => {
  return process.env.UNISWAP_API_KEY || process.env.NEXT_PUBLIC_UNISWAP_API_KEY || '';
};

interface ApprovalRequest {
  walletAddress: string;
  token: string;
  amount: string;
  chainId: number;
}

export async function POST(request: Request) {
  try {
    const body: ApprovalRequest = await request.json();
    const { walletAddress, token, amount, chainId } = body;

    // Validate inputs
    if (!walletAddress || !token || !amount || !chainId) {
      return NextResponse.json(
        { error: 'Missing required parameters: walletAddress, token, amount, chainId' },
        { status: 400 }
      );
    }

    const apiKey = getApiKey();

    // If no API key, return mock response (no approval needed)
    if (!apiKey) {
      console.warn('UNISWAP_API_KEY not set - returning mock approval check');
      return NextResponse.json({
        approval: null, // Assume already approved for mock
        mock: true,
        warning: 'Using mock approval check - set UNISWAP_API_KEY for real checks',
      });
    }

    // Call Uniswap Trading API
    const response = await fetch(`${TRADING_API_BASE}/check_approval`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        walletAddress,
        token,
        amount,
        chainId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Uniswap API error:', errorData);
      return NextResponse.json(
        { error: errorData.message || errorData.error || 'Failed to check approval' },
        { status: response.status }
      );
    }

    const approvalData = await response.json();

    return NextResponse.json(approvalData);
  } catch (error) {
    console.error('Error checking approval:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check approval' },
      { status: 500 }
    );
  }
}
