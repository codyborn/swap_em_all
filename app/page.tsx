'use client';

import { GameBoyShell } from '@/components/game/GameBoyShell';
import { HUD } from '@/components/ui/HUD';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useGameStore } from '@/lib/store/gameStore';

export default function Home() {
  const { isConnected } = useAccount();
  const { pokeballs, addPokeballs } = useGameStore();

  return (
    <GameBoyShell>
      <div className="w-full h-full flex flex-col items-center justify-center relative bg-[#0f380f] text-[#9bbc0f] p-4">
        <HUD />

        <div className="text-center space-y-6">
          <h1 className="text-2xl font-gameboy tracking-wider animate-pulse">
            SWAP 'EM ALL
          </h1>

          <div className="space-y-4">
            {!isConnected ? (
              <div className="space-y-2">
                <p className="text-xs font-gameboy">
                  Connect your wallet to start
                </p>
                <div className="flex justify-center">
                  <ConnectButton />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm font-gameboy">
                  Welcome Trainer!
                </p>
                <p className="text-xs font-gameboy">
                  Your Pokeballs: {pokeballs}
                </p>

                {/* Quick test button */}
                <button
                  onClick={() => addPokeballs(5)}
                  className="px-4 py-2 bg-[#306230] hover:bg-[#0f380f] text-[#9bbc0f] font-gameboy text-xs border-2 border-[#9bbc0f] rounded"
                >
                  + 5 Pokeballs (Test)
                </button>

                <a
                  href="/game"
                  className="block px-4 py-2 bg-[#306230] hover:bg-[#0f380f] text-[#9bbc0f] font-gameboy text-xs border-2 border-[#9bbc0f] rounded text-center"
                >
                  START GAME
                </a>
              </div>
            )}
          </div>

          <div className="absolute bottom-4 left-0 right-0 text-center">
            <p className="text-[8px] font-gameboy opacity-50">
              v0.1.0 - Built on Base
            </p>
          </div>
        </div>
      </div>
    </GameBoyShell>
  );
}
