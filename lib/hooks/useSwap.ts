/**
 * useSwap Hook
 *
 * React hook for executing Uniswap swaps via the Trading API.
 * Handles the full flow: approval check -> quote -> swap execution
 */

import { useState, useCallback } from 'react';
import { useAccount, useChainId, usePublicClient, useWalletClient } from 'wagmi';
import { Address, parseUnits, formatUnits } from 'viem';
import {
  checkApproval,
  getQuote,
  getSwapTransaction,
  QuoteResponse,
  SwapServiceError,
  SwapErrorCodes,
} from '../services/swapService';
import { CONTRACTS } from '../web3/config';

// ============================================================================
// TYPES
// ============================================================================

export interface SwapParams {
  tokenIn: Address;
  tokenOut: Address;
  amountIn: string; // Human readable amount (e.g., "100" for 100 USDC)
  decimalsIn: number;
  decimalsOut: number;
  slippage?: number; // Percentage (e.g., 0.5 for 0.5%)
}

export interface SwapState {
  status: 'idle' | 'checking_approval' | 'approving' | 'quoting' | 'swapping' | 'success' | 'error';
  quote: QuoteResponse | null;
  error: string | null;
  txHash: string | null;
  amountOut: string | null; // Human readable output amount
}

export interface UseSwapReturn {
  state: SwapState;
  getSwapQuote: (params: SwapParams) => Promise<QuoteResponse | null>;
  executeSwap: (params: SwapParams) => Promise<string | null>;
  reset: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

export function useSwap(): UseSwapReturn {
  const { address } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [state, setState] = useState<SwapState>({
    status: 'idle',
    quote: null,
    error: null,
    txHash: null,
    amountOut: null,
  });

  const reset = useCallback(() => {
    setState({
      status: 'idle',
      quote: null,
      error: null,
      txHash: null,
      amountOut: null,
    });
  }, []);

  /**
   * Get a quote for the swap (doesn't execute)
   */
  const getSwapQuote = useCallback(
    async (params: SwapParams): Promise<QuoteResponse | null> => {
      if (!address) {
        setState((s) => ({ ...s, error: 'Wallet not connected', status: 'error' }));
        return null;
      }

      setState((s) => ({ ...s, status: 'quoting', error: null }));

      try {
        const amountInWei = parseUnits(params.amountIn, params.decimalsIn).toString();

        const quote = await getQuote({
          swapper: address,
          tokenIn: params.tokenIn,
          tokenOut: params.tokenOut,
          tokenInChainId: chainId,
          tokenOutChainId: chainId,
          amount: amountInWei,
          type: 'EXACT_INPUT',
          slippageTolerance: params.slippage ?? 0.5,
        });

        const amountOut = formatUnits(BigInt(quote.quote.output.amount), params.decimalsOut);

        setState((s) => ({
          ...s,
          status: 'idle',
          quote,
          amountOut,
        }));

        return quote;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to get quote';
        setState((s) => ({ ...s, status: 'error', error: message }));
        return null;
      }
    },
    [address, chainId]
  );

  /**
   * Execute the full swap flow
   */
  const executeSwap = useCallback(
    async (params: SwapParams): Promise<string | null> => {
      console.log('[useSwap] executeSwap called with:', {
        address,
        hasWalletClient: !!walletClient,
        hasPublicClient: !!publicClient,
        chainId,
        params
      });

      if (!address || !walletClient || !publicClient) {
        const errorMsg = `Wallet not connected: address=${!!address}, walletClient=${!!walletClient}, publicClient=${!!publicClient}`;
        console.error('[useSwap]', errorMsg);
        setState((s) => ({ ...s, error: errorMsg, status: 'error' }));
        return null;
      }

      try {
        const amountInWei = parseUnits(params.amountIn, params.decimalsIn).toString();
        console.log('[useSwap] Amount in wei:', amountInWei);

        // Step 1: Check if approval is needed
        setState((s) => ({ ...s, status: 'checking_approval', error: null }));

        const approvalResult = await checkApproval({
          walletAddress: address,
          token: params.tokenIn,
          amount: amountInWei,
          chainId,
        });

        // Step 2: Execute approval if needed
        if (approvalResult.approval) {
          setState((s) => ({ ...s, status: 'approving' }));

          const approvalHash = await walletClient.sendTransaction({
            to: approvalResult.approval.to,
            data: approvalResult.approval.data,
            value: BigInt(approvalResult.approval.value),
          });

          // Wait for approval to be mined
          await publicClient.waitForTransactionReceipt({ hash: approvalHash });
        }

        // Step 3: Get quote
        setState((s) => ({ ...s, status: 'quoting' }));

        const quote = await getQuote({
          swapper: address,
          tokenIn: params.tokenIn,
          tokenOut: params.tokenOut,
          tokenInChainId: chainId,
          tokenOutChainId: chainId,
          amount: amountInWei,
          type: 'EXACT_INPUT',
          slippageTolerance: params.slippage ?? 0.5,
        });

        const amountOut = formatUnits(BigInt(quote.quote.output.amount), params.decimalsOut);
        setState((s) => ({ ...s, quote, amountOut }));

        // Step 4: Get swap transaction
        setState((s) => ({ ...s, status: 'swapping' }));

        const deadline = Math.floor(Date.now() / 1000) + 1200; // 20 minutes

        const swapResult = await getSwapTransaction({
          quote: {
            ...quote.quote,
            routing: quote.routing,
          },
          deadline,
        });

        // Step 5: Execute swap transaction
        const swapHash = await walletClient.sendTransaction({
          to: swapResult.swap.to,
          data: swapResult.swap.data,
          value: BigInt(swapResult.swap.value),
          gas: swapResult.swap.gasLimit ? BigInt(swapResult.swap.gasLimit) : undefined,
        });

        // Wait for swap to be mined
        await publicClient.waitForTransactionReceipt({ hash: swapHash });

        setState((s) => ({
          ...s,
          status: 'success',
          txHash: swapHash,
        }));

        return swapHash;
      } catch (error) {
        console.error('[useSwap] executeSwap error:', error);
        const message = error instanceof Error ? error.message : 'Swap failed';
        console.error('[useSwap] Error message:', message);
        setState((s) => ({ ...s, status: 'error', error: message }));
        return null;
      }
    },
    [address, chainId, walletClient, publicClient]
  );

  return {
    state,
    getSwapQuote,
    executeSwap,
    reset,
  };
}

// ============================================================================
// GAME-SPECIFIC HOOKS
// ============================================================================

/**
 * Hook for catching tokens (swap USDC -> target token)
 */
export function useCatchToken() {
  const { address } = useAccount();
  const chainId = useChainId();
  const swap = useSwap();

  const catchToken = useCallback(
    async (params: {
      tokenAddress: Address;
      tokenDecimals: number;
      usdcAmount: string;
    }) => {
      console.log('[useCatchToken] Called with:', { params, chainId });
      const usdcAddress = CONTRACTS.USDC[chainId as keyof typeof CONTRACTS.USDC];

      console.log('[useCatchToken] USDC address:', usdcAddress);

      if (!usdcAddress) {
        const error = new SwapServiceError('USDC not available on this chain', SwapErrorCodes.NETWORK_ERROR);
        console.error('[useCatchToken]', error);
        throw error;
      }

      console.log('[useCatchToken] Calling swap.executeSwap...');
      return swap.executeSwap({
        tokenIn: usdcAddress,
        tokenOut: params.tokenAddress,
        amountIn: params.usdcAmount,
        decimalsIn: 6, // USDC has 6 decimals
        decimalsOut: params.tokenDecimals,
        slippage: 0.5,
      });
    },
    [chainId, swap]
  );

  return {
    ...swap,
    catchToken,
  };
}

/**
 * Hook for selling tokens (swap token -> USDC)
 */
export function useSellToken() {
  const { address } = useAccount();
  const chainId = useChainId();
  const swap = useSwap();

  const sellToken = useCallback(
    async (params: {
      tokenAddress: Address;
      tokenDecimals: number;
      tokenAmount: string;
    }) => {
      const usdcAddress = CONTRACTS.USDC[chainId as keyof typeof CONTRACTS.USDC];

      if (!usdcAddress) {
        throw new SwapServiceError('USDC not available on this chain', SwapErrorCodes.NETWORK_ERROR);
      }

      return swap.executeSwap({
        tokenIn: params.tokenAddress,
        tokenOut: usdcAddress,
        amountIn: params.tokenAmount,
        decimalsIn: params.tokenDecimals,
        decimalsOut: 6, // USDC has 6 decimals
        slippage: 0.5,
      });
    },
    [chainId, swap]
  );

  return {
    ...swap,
    sellToken,
  };
}

// ============================================================================
// QUOTE-ONLY HOOK (for displaying prices)
// ============================================================================

/**
 * Hook for getting swap quotes without executing
 */
export function useSwapQuote() {
  const { address } = useAccount();
  const chainId = useChainId();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);

  const fetchQuote = useCallback(
    async (params: {
      tokenIn: Address;
      tokenOut: Address;
      amountIn: string;
      decimalsIn: number;
    }) => {
      if (!address) {
        setError('Wallet not connected');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const amountInWei = parseUnits(params.amountIn, params.decimalsIn).toString();

        const result = await getQuote({
          swapper: address,
          tokenIn: params.tokenIn,
          tokenOut: params.tokenOut,
          tokenInChainId: chainId,
          tokenOutChainId: chainId,
          amount: amountInWei,
          type: 'EXACT_INPUT',
          slippageTolerance: 0.5,
        });

        setQuote(result);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to get quote';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [address, chainId]
  );

  return {
    quote,
    loading,
    error,
    fetchQuote,
    reset: () => {
      setQuote(null);
      setError(null);
    },
  };
}
