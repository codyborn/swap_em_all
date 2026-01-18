'use client';

import { GameBoyShell } from '@/components/game/GameBoyShell';
import { PhaserGame } from '@/components/game/PhaserGame';

/**
 * Test-only game page that bypasses wallet connection requirement.
 * Use this route for automated testing and development.
 *
 * Access: http://localhost:3000/game/test
 */
export default function GameTestPage() {
  return (
    <GameBoyShell>
      <div className="w-full h-full relative bg-[#0f380f]">
        <PhaserGame />
      </div>
    </GameBoyShell>
  );
}
