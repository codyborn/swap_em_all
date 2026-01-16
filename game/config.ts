import * as Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { TitleScene } from './scenes/TitleScene';
import { OverworldScene } from './scenes/OverworldScene';
import { EncounterScene } from './scenes/EncounterScene';
import { StoreScene } from './scenes/StoreScene';
import { TraderScene } from './scenes/TraderScene';
import { CryptodexScene } from './scenes/CryptodexScene';
import { ProfessorScene } from './scenes/ProfessorScene';
import { HealingCenterScene } from './scenes/HealingCenterScene';
import { BagScene } from './scenes/BagScene';
import { BattleScene } from './scenes/BattleScene';

export const GAME_CONFIG = {
  width: 160,
  height: 144,
  scale: 4,
  tileSize: 16,
} as const;

export function createPhaserConfig(parent: string): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    width: GAME_CONFIG.width,
    height: GAME_CONFIG.height,
    parent,
    backgroundColor: '#0f380f',
    pixelArt: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_CONFIG.width,
      height: GAME_CONFIG.height,
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scene: [
      BootScene,
      TitleScene,
      OverworldScene,
      EncounterScene,
      BattleScene,
      StoreScene,
      TraderScene,
      CryptodexScene,
      ProfessorScene,
      HealingCenterScene,
      BagScene,
    ],
  };
}
