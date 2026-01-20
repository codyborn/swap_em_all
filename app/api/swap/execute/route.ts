import { NextResponse } from 'next/server';

const TRADING_API_BASE = 'https://trade.api.uniswap.org/v1';

const getApiKey = () => {
  return process.env.UNISWAP_API_KEY || process.env.NEXT_PUBLIC_UNISWAP_API_KEY || '';
};

interface SwapExecuteRequest {
  quote: {
    routing: string;
    quote: {
      input: { token: string; amount: string };
      output: { token: string; amount: string };
      slippage: number;
      route: unknown[];
      gasFee: string;
    };
    permitData?: unknown;
    requestId?: string;
  };
  signature?: string;
  deadline?: number;
}

export async function POST(request: Request) {
  try {
    const body: SwapExecuteRequest = await request.json();
    const { quote, signature, deadline } = body;

    // Validate inputs
    if (!quote) {
      return NextResponse.json(
        { error: 'Missing required parameter: quote' },
        { status: 400 }
      );
    }

    const apiKey = getApiKey();

    // If no API key, return mock transaction
    if (!apiKey) {
      console.warn('UNISWAP_API_KEY not set - returning mock swap transaction');
      return NextResponse.json({
        swap: {
          to: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD', // Universal Router
          from: '0x0000000000000000000000000000000000000000',
          data: '0x',
          value: '0',
          chainId: 8453, // Base
          gasLimit: '250000',
        },
        mock: true,
        warning: 'Using mock swap transaction - set UNISWAP_API_KEY for real swaps',
      });
    }

    // Use provided deadline or default to 20 minutes from now
    const swapDeadline = deadline || Math.floor(Date.now() / 1000) + 1200;

    // Log the request for debugging
    console.log('[swap/execute] Calling Uniswap API with:', {
      quote,
      signature: signature ? `${signature.substring(0, 20)}...` : 'none',
      deadline: swapDeadline,
    });

    // Call Uniswap Trading API
    const response = await fetch(`${TRADING_API_BASE}/swap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        quote,
        signature,
        deadline: swapDeadline,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('[swap/execute] Uniswap API error response:', {
        status: response.status,
        errorData,
      });

      // Return user-friendly error messages
      if (response.status === 400 && errorData.error?.includes('expired')) {
        return NextResponse.json(
          { error: 'Quote has expired, please get a new quote' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: errorData.message || errorData.error || 'Failed to generate swap transaction' },
        { status: response.status }
      );
    }

    const swapData = await response.json();

    return NextResponse.json(swapData);
  } catch (error) {
    console.error('Error generating swap transaction:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate swap transaction' },
      { status: 500 }
    );
  }
}
