import { NextResponse } from 'next/server';

const TRADING_API_BASE = 'https://trade.api.uniswap.org/v1';

// Get API key from environment (server-side)
const getApiKey = () => {
  return process.env.UNISWAP_API_KEY || process.env.NEXT_PUBLIC_UNISWAP_API_KEY || '';
};

interface QuoteRequest {
  tokenIn: string;
  tokenOut: string;
  amount: string;
  chainId: number;
  swapper: string;
  slippage?: number;
  type?: 'EXACT_INPUT' | 'EXACT_OUTPUT';
}

export async function POST(request: Request) {
  try {
    const body: QuoteRequest = await request.json();
    const { tokenIn, tokenOut, amount, chainId, swapper, slippage = 0.5, type = 'EXACT_INPUT' } = body;

    // Validate inputs
    if (!tokenIn || !tokenOut || !amount || !chainId || !swapper) {
      return NextResponse.json(
        { error: 'Missing required parameters: tokenIn, tokenOut, amount, chainId, swapper' },
        { status: 400 }
      );
    }

    const apiKey = getApiKey();

    // If no API key, return mock quote for development
    if (!apiKey) {
      console.warn('UNISWAP_API_KEY not set - returning mock quote');
      return NextResponse.json({
        quote: {
          input: { token: tokenIn, amount },
          output: { token: tokenOut, amount: '1000000000000000000' },
          slippage,
          route: [],
          gasFee: '150000',
        },
        routing: 'MOCK',
        mock: true,
        timestamp: Date.now(),
        warning: 'Using mock quote - set UNISWAP_API_KEY for real quotes',
      });
    }

    // Call Uniswap Trading API
    const response = await fetch(`${TRADING_API_BASE}/quote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        swapper,
        tokenIn,
        tokenOut,
        tokenInChainId: chainId,
        tokenOutChainId: chainId,
        amount,
        type,
        slippageTolerance: slippage,
        routingPreference: 'BEST_PRICE',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Uniswap API error:', errorData);

      // Return user-friendly error messages
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Invalid API key' },
          { status: 401 }
        );
      }
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'No route found for this token pair' },
          { status: 404 }
        );
      }
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded, please try again later' },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: errorData.message || errorData.error || 'Failed to get quote' },
        { status: response.status }
      );
    }

    const quoteData = await response.json();

    // Return quote data as-is from Uniswap API
    // Don't add extra fields as they'll cause validation errors in /swap
    return NextResponse.json(quoteData);
  } catch (error) {
    console.error('Error generating swap quote:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate quote' },
      { status: 500 }
    );
  }
}
