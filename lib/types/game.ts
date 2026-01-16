export type GameScene = 'boot' | 'title' | 'overworld' | 'encounter' | 'store' | 'trader' | 'cryptodex';

export interface Position {
  x: number;
  y: number;
}

export interface NPC {
  id: string;
  name: string;
  type: 'professor' | 'store-clerk' | 'trader';
  position: Position;
  dialogue: string[];
  spriteKey: string;
}

export interface GameConfig {
  width: number;
  height: number;
  scale: number;
  tileSize: number;
}

export const GAMEBOY_CONFIG: GameConfig = {
  width: 160,
  height: 144,
  scale: 4,
  tileSize: 16,
};
