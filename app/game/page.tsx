'use client';

import { GameBoyShell } from '@/components/game/GameBoyShell';
import { HUD } from '@/components/ui/HUD';
import { PhaserGame } from '@/components/game/PhaserGame';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function GamePage() {
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    // Redirect to home if not connected
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  if (!isConnected) {
    return null;
  }

  return (
    <GameBoyShell>
      <div className="w-full h-full relative bg-[#0f380f]">
        <HUD />
        <PhaserGame />
      </div>
    </GameBoyShell>
  );
}
