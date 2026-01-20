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
    // IMPORTANT: Response structure must match exactly what Uniswap Trading API returns
    // Use Unichain (chainId 130) as default since that's what the app is configured for
    if (!apiKey) {
      console.warn('UNISWAP_API_KEY not set - returning mock swap transaction');
      return NextResponse.json({
        swap: {
          to: '0xef740bf23acae26f6492b10de645d6b98dc8eaf3', // Universal Router on Unichain
          from: '0x0000000000000000000000000000000000000000',
          data: '0x',
          value: '0',
          chainId: 130, // Unichain
          gasLimit: '250000',
        },
      });
    }

    // Use provided deadline or default to 20 minutes from now
    const swapDeadline = deadline || Math.floor(Date.now() / 1000) + 1200;

    // Log the request for debugging
    console.log('[swap/swap] Calling Uniswap /swap endpoint with:', {
      quoteRequestId: quote.requestId,
      routing: quote.routing,
      hasSignature: !!signature,
      deadline: swapDeadline,
    });

    // Extract inner quote and permitData from the QuoteResponse
    // Uniswap Trading API expects: { quote: innerQuote, permitData, signature, deadline }
    // But we receive: { routing, quote: innerQuote, permitData, requestId }
    const swapPayload: {
      quote: unknown;
      permitData?: unknown;
      signature?: string;
      deadline: number;
    } = {
      quote: quote.quote, // Extract inner quote object
      signature,
      deadline: swapDeadline,
    };

    // Include permitData at top level if present
    if (quote.permitData) {
      swapPayload.permitData = quote.permitData;
    }

    console.log('[swap/swap] Sending payload to Uniswap:', {
      hasQuote: !!swapPayload.quote,
      hasPermitData: !!swapPayload.permitData,
      hasSignature: !!swapPayload.signature,
      deadline: swapPayload.deadline,
    });

    // Call Uniswap Trading API
    const response = await fetch(`${TRADING_API_BASE}/swap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(swapPayload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('[swap/swap] Uniswap /swap API error:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
        sentPayload: {
          hasQuote: !!swapPayload.quote,
          hasPermitData: !!swapPayload.permitData,
          hasSignature: !!swapPayload.signature,
          deadline: swapPayload.deadline,
        },
      });

      // Return user-friendly error messages
      if (response.status === 400 && errorData.error?.includes('expired')) {
        return NextResponse.json(
          { error: 'Quote has expired, please get a new quote' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          error: errorData.message || errorData.error || errorData.errorCode || 'Failed to generate swap transaction',
          details: errorData,
        },
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
