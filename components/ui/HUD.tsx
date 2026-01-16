'use client';

import { useGameStore } from '@/lib/store/gameStore';
import { useUSDCBalance } from '@/lib/hooks/useUSDCBalance';
import { useAccount } from 'wagmi';

export function HUD() {
  const { pokeballs } = useGameStore();
  const { balance, isLoading } = useUSDCBalance();
  const { isConnected } = useAccount();

  if (!isConnected) return null;

  return (
    <div className="absolute top-2 left-2 right-2 bg-black/50 text-white p-2 rounded text-xs font-gameboy">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-yellow-400">USDC:</span> {isLoading ? '...' : balance}
          </div>
          <div>
            <span className="text-red-400">BALLS:</span> {pokeballs}
          </div>
        </div>
      </div>
    </div>
  );
}
