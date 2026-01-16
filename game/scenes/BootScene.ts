import * as Phaser from 'phaser';
import { SpriteGenerator } from '../utils/SpriteGenerator';

export class BootScene extends Phaser.Scene {
  private loadingText?: Phaser.GameObjects.Text;
  private logo?: Phaser.GameObjects.Text;

  constructor() {
    super('BootScene');
  }

  preload() {
    // Set up loading bar
    this.createLoadingScreen();

    // TODO: Load assets here
    // this.load.image('player', '/assets/sprites/player/player.png');
    // this.load.spritesheet('player', '/assets/sprites/player/player.png', {
    //   frameWidth: 16,
    //   frameHeight: 16,
    // });
  }

  create() {
    // Generate all game sprites
    SpriteGenerator.generateAllSprites(this);

    // GameBoy-style boot animation
    this.logo = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 20,
      'SWAP EM ALL',
      {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#9bbc0f',
      }
    ).setOrigin(0.5);

    // Fade in effect
    this.logo.setAlpha(0);
    this.tweens.add({
      targets: this.logo,
      alpha: 1,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        // Wait a moment then transition
        this.time.delayedCall(500, () => {
          this.scene.start('TitleScene');
        });
      },
    });

    // Play boot sound (when we have audio)
    // this.sound.play('boot');
  }

  private createLoadingScreen() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    // Loading text
    this.loadingText = this.add.text(centerX, centerY, 'Loading...', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#9bbc0f',
    }).setOrigin(0.5);

    // Update loading text
    this.load.on('progress', (value: number) => {
      const percent = Math.floor(value * 100);
      this.loadingText?.setText(`Loading... ${percent}%`);
    });

    this.load.on('complete', () => {
      this.loadingText?.destroy();
    });
  }
}
