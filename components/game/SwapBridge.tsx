'use client';

import { useEffect } from 'react';
import { useCatchToken } from '@/lib/hooks/useSwap';
import { Address } from 'viem';

/**
 * SwapBridge Component
 *
 * Exposes swap functionality to Phaser game scenes via window.swapBridge
 * This allows the game to execute real on-chain swaps when catching tokens
 */
export function SwapBridge() {
  const { catchToken, state, reset } = useCatchToken();

  useEffect(() => {
    // Expose swap functions to window for Phaser to call
    if (typeof window !== 'undefined') {
      (window as any).swapBridge = {
        /**
         * Catch a token by swapping USDC for it
         * @param tokenAddress - The token contract address
         * @param tokenDecimals - The token decimals
         * @param usdcAmount - Amount of USDC to spend (human readable, e.g., "1" for 1 USDC)
         * @returns Promise that resolves to transaction hash or null on failure
         */
        catchToken: async (
          tokenAddress: string,
          tokenDecimals: number,
          usdcAmount: string
        ): Promise<{ success: boolean; txHash?: string; error?: string }> => {
          try {
            console.log('[SwapBridge] catchToken called:', { tokenAddress, tokenDecimals, usdcAmount });
            reset();

            console.log('[SwapBridge] Calling hook catchToken...');
            const txHash = await catchToken({
              tokenAddress: tokenAddress as Address,
              tokenDecimals,
              usdcAmount,
            });

            console.log('[SwapBridge] Hook returned txHash:', txHash);

            if (txHash) {
              return { success: true, txHash };
            } else {
              const errorMsg = state.error || 'Swap failed';
              console.error('[SwapBridge] Swap failed:', errorMsg);
              return { success: false, error: errorMsg };
            }
          } catch (error) {
            console.error('[SwapBridge] catchToken error:', error);
            return {
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            };
          }
        },

        /**
         * Get current swap state
         */
        getState: () => state,

        /**
         * Reset swap state
         */
        reset,
      };
    }

    // Cleanup
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).swapBridge;
      }
    };
  }, [catchToken, state, reset]);

  // This component doesn't render anything
  return null;
}
