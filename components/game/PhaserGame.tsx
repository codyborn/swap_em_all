'use client';

import { useEffect, useRef, useState } from 'react';
import '@/lib/store/exposeStore';

export function PhaserGame() {
  const gameRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Phaser can only run on client side
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !containerRef.current) return;

    // Prevent multiple game instances
    if (gameRef.current) return;

    // Dynamically import Phaser and game config only on client
    const initGame = async () => {
      const Phaser = await import('phaser');
      const { createPhaserConfig } = await import('@/game/config');

      const config = createPhaserConfig('phaser-game');
      gameRef.current = new Phaser.Game(config);
    };

    initGame();

    // Cleanup
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [isClient]);

  if (!isClient) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-xs font-gameboy text-[#9bbc0f]">Loading...</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      id="phaser-game"
      className="w-full h-full flex items-center justify-center"
    />
  );
}
