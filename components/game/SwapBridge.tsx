"use client";

import { useEffect } from "react";
import { useCatchToken, useSellToken } from "@/lib/hooks/useSwap";
import { Address } from "viem";

/**
 * SwapBridge Component
 *
 * Exposes swap functionality to Phaser game scenes via window.swapBridge
 * This allows the game to execute real on-chain swaps when catching/selling tokens
 */
export function SwapBridge() {
  const { catchToken, state: catchState, reset: resetCatch } = useCatchToken();
  const { sellToken, state: sellState, reset: resetSell } = useSellToken();

  useEffect(() => {
    // Expose swap functions to window for Phaser to call
    if (typeof window !== "undefined") {
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
          usdcAmount: string,
        ): Promise<{ success: boolean; txHash?: string; error?: string }> => {
          try {
            console.log("[SwapBridge] catchToken called:", {
              tokenAddress,
              tokenDecimals,
              usdcAmount,
            });
            resetCatch();

            console.log("[SwapBridge] Calling hook catchToken...");
            const txHash = await catchToken({
              tokenAddress: tokenAddress as Address,
              tokenDecimals,
              usdcAmount,
            });

            console.log("[SwapBridge] Hook returned txHash:", txHash);

            if (txHash) {
              return { success: true, txHash };
            } else {
              const errorMsg = catchState.error || "Swap failed";
              console.error("[SwapBridge] Swap failed:", errorMsg);
              return { success: false, error: errorMsg };
            }
          } catch (error) {
            console.error("[SwapBridge] catchToken error:", error);
            return {
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }
        },

        /**
         * Sell a token by swapping it for USDC
         * @param tokenAddress - The token contract address
         * @param tokenDecimals - The token decimals
         * @param tokenAmount - Amount of tokens to sell (human readable)
         * @returns Promise that resolves with transaction hash and USDC amount received
         */
        sellToken: async (
          tokenAddress: string,
          tokenDecimals: number,
          tokenAmount: string,
        ): Promise<{
          success: boolean;
          txHash?: string;
          error?: string;
          amountOut?: string;
        }> => {
          try {
            console.log("[SwapBridge] sellToken called:", {
              tokenAddress,
              tokenDecimals,
              tokenAmount,
            });
            resetSell();

            console.log("[SwapBridge] Calling hook sellToken...");
            const txHash = await sellToken({
              tokenAddress: tokenAddress as Address,
              tokenDecimals,
              tokenAmount,
            });

            console.log("[SwapBridge] Hook returned txHash:", txHash);

            if (txHash) {
              // Get the amount of USDC received from the swap state
              const amountOut = sellState.amountOut || "0";
              return { success: true, txHash, amountOut };
            } else {
              const errorMsg = sellState.error || "Swap failed";
              console.error("[SwapBridge] Swap failed:", errorMsg);
              return { success: false, error: errorMsg };
            }
          } catch (error) {
            console.error("[SwapBridge] sellToken error:", error);
            return {
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }
        },

        /**
         * Get current swap states
         */
        getState: () => ({ catch: catchState, sell: sellState }),

        /**
         * Reset swap states
         */
        reset: () => {
          resetCatch();
          resetSell();
        },
      };
    }

    // Cleanup
    return () => {
      if (typeof window !== "undefined") {
        delete (window as any).swapBridge;
      }
    };
  }, [catchToken, sellToken, catchState, sellState, resetCatch, resetSell]);

  // This component doesn't render anything
  return null;
}
