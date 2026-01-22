'use client';

import { GameBoyShell } from '@/components/game/GameBoyShell';
import { PhaserGame } from '@/components/game/PhaserGame';
import { SwapBridge } from '@/components/game/SwapBridge';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useGameStore } from '@/lib/store/gameStore';

export default function GamePage() {
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const setWalletAddress = useGameStore((state) => state.setWalletAddress);

  useEffect(() => {
    // Redirect to home if not connected
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  useEffect(() => {
    // Update wallet address in game store
    if (address) {
      setWalletAddress(address);
    } else {
      setWalletAddress(null);
    }
  }, [address, setWalletAddress]);

  if (!isConnected) {
    return null;
  }

  return (
    <>
      <SwapBridge />
      <GameBoyShell>
        <div className="w-full h-full relative bg-[#0f380f]">
          <PhaserGame />
        </div>
      </GameBoyShell>
    </>
  );
}
