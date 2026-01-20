/**
 * Uniswap Trading API Service
 *
 * Integrates with Uniswap's Trading API for swap execution.
 * Base URL: https://trade.api.uniswap.org/v1
 *
 * Flow:
 * 1. checkApproval() - Check if token is approved for spending
 * 2. getQuote() - Get swap quote with routing
 * 3. executeSwap() - Get transaction to sign and submit
 */

import { Address } from 'viem';

// Use our Next.js API routes instead of calling Uniswap directly
// This avoids CORS issues and keeps the API key server-side
const API_BASE = '/api/swap';

// Common headers for API requests
const getHeaders = () => ({
  'Content-Type': 'application/json',
});

// ============================================================================
// TYPES
// ============================================================================

export interface ApprovalRequest {
  walletAddress: Address;
  token: Address;
  amount: string;
  chainId: number;
}

export interface ApprovalResponse {
  approval: {
    to: Address;
    from: Address;
    data: `0x${string}`;
    value: string;
    chainId: number;
  } | null;
}

export interface QuoteRequest {
  swapper: Address;
  tokenIn: Address;
  tokenOut: Address;
  tokenInChainId: number;
  tokenOutChainId: number;
  amount: string;
  type: 'EXACT_INPUT' | 'EXACT_OUTPUT';
  slippageTolerance?: number;
  protocols?: ('V2' | 'V3' | 'V4')[];
  routingPreference?: 'BEST_PRICE' | 'FASTEST' | 'CLASSIC';
}

export interface QuoteResponse {
  routing: 'CLASSIC' | 'DUTCH_V2';
  quote: {
    input: { token: Address; amount: string };
    output: { token: Address; amount: string };
    slippage: number;
    route: unknown[];
    gasFee: string;
  };
  permitData?: {
    domain: {
      name: string;
      chainId: number;
      verifyingContract: Address;
    };
    types: Record<string, unknown>;
    values: Record<string, unknown>;
    primaryType?: string;
  };
  requestId?: string;
}

export interface SwapRequest {
  quote: QuoteResponse['quote'] & { routing?: string };
  signature?: string;
  deadline: number;
}

export interface SwapResponse {
  swap: {
    to: Address;
    from: Address;
    data: `0x${string}`;
    value: string;
    chainId: number;
    gasLimit?: string;
  };
}

export interface SwapError {
  error: string;
  code?: number;
  message?: string;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Check if token approval is needed before swap
 * Returns approval transaction if needed, null if already approved
 */
export async function checkApproval(
  params: ApprovalRequest
): Promise<ApprovalResponse> {
  const response = await fetch(`${API_BASE}/approval`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.message || error.error || `Approval check failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Get swap quote with optimal routing
 */
export async function getQuote(params: QuoteRequest): Promise<QuoteResponse> {
  const response = await fetch(`${API_BASE}/quote`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      tokenIn: params.tokenIn,
      tokenOut: params.tokenOut,
      amount: params.amount,
      chainId: params.tokenInChainId,
      swapper: params.swapper,
      slippage: params.slippageTolerance ?? 0.5,
      type: params.type,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.message || error.error || `Quote failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Get executable swap transaction
 */
export async function getSwapTransaction(
  params: SwapRequest
): Promise<SwapResponse> {
  const response = await fetch(`${API_BASE}/execute`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.message || error.error || `Swap failed: ${response.status}`);
  }

  return response.json();
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format token amount with decimals
 */
export function formatTokenAmount(amount: string | bigint, decimals: number): string {
  const value = typeof amount === 'string' ? BigInt(amount) : amount;
  const divisor = BigInt(10 ** decimals);
  const integerPart = value / divisor;
  const fractionalPart = value % divisor;

  if (fractionalPart === BigInt(0)) {
    return integerPart.toString();
  }

  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  const trimmedFractional = fractionalStr.replace(/0+$/, '');
  return `${integerPart}.${trimmedFractional}`;
}

/**
 * Parse token amount to smallest unit
 */
export function parseTokenAmount(amount: string, decimals: number): bigint {
  const [integerPart, fractionalPart = ''] = amount.split('.');
  const paddedFractional = fractionalPart.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(integerPart + paddedFractional);
}

/**
 * Calculate minimum output amount with slippage
 */
export function calculateMinOutput(
  outputAmount: string,
  slippagePercent: number
): string {
  const output = BigInt(outputAmount);
  const slippageBps = BigInt(Math.floor(slippagePercent * 100)); // Convert to basis points
  const minOutput = output - (output * slippageBps) / BigInt(10000);
  return minOutput.toString();
}

// ============================================================================
// GAME-SPECIFIC FUNCTIONS
// ============================================================================

/**
 * Get a quote for catching a token (swapping USDC for target token)
 */
export async function getCatchQuote(params: {
  walletAddress: Address;
  usdcAddress: Address;
  targetTokenAddress: Address;
  usdcAmount: string;
  chainId: number;
}): Promise<QuoteResponse> {
  return getQuote({
    swapper: params.walletAddress,
    tokenIn: params.usdcAddress,
    tokenOut: params.targetTokenAddress,
    tokenInChainId: params.chainId,
    tokenOutChainId: params.chainId,
    amount: params.usdcAmount,
    type: 'EXACT_INPUT',
    slippageTolerance: 0.5,
    routingPreference: 'BEST_PRICE',
  });
}

/**
 * Get a quote for selling a token (swapping token for USDC)
 */
export async function getSellQuote(params: {
  walletAddress: Address;
  usdcAddress: Address;
  tokenAddress: Address;
  tokenAmount: string;
  chainId: number;
}): Promise<QuoteResponse> {
  return getQuote({
    swapper: params.walletAddress,
    tokenIn: params.tokenAddress,
    tokenOut: params.usdcAddress,
    tokenInChainId: params.chainId,
    tokenOutChainId: params.chainId,
    amount: params.tokenAmount,
    type: 'EXACT_INPUT',
    slippageTolerance: 0.5,
    routingPreference: 'BEST_PRICE',
  });
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

export class SwapServiceError extends Error {
  code: string;

  constructor(message: string, code: string = 'SWAP_ERROR') {
    super(message);
    this.name = 'SwapServiceError';
    this.code = code;
  }
}

export const SwapErrorCodes = {
  NO_API_KEY: 'NO_API_KEY',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  INSUFFICIENT_ALLOWANCE: 'INSUFFICIENT_ALLOWANCE',
  NO_ROUTE: 'NO_ROUTE',
  SLIPPAGE_EXCEEDED: 'SLIPPAGE_EXCEEDED',
  QUOTE_EXPIRED: 'QUOTE_EXPIRED',
  RATE_LIMITED: 'RATE_LIMITED',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const;
