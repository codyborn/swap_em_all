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

    // Load Pokemon FireRed/LeafGreen sprite sheets
    // Player sprites (Red - male protagonist)
    this.load.spritesheet('player', '/assets/sprites/player/player-sprites.png', {
      frameWidth: 16,
      frameHeight: 16,
    });

    // NPC sprites
    this.load.spritesheet('npcs', '/assets/sprites/npcs/overworld-npcs.png', {
      frameWidth: 16,
      frameHeight: 16,
    });

    // Tileset
    this.load.image('tileset', '/assets/sprites/tiles/tileset.png');
  }

  create() {
    // Generate token sprites (keeping custom sprites for crypto tokens)
    SpriteGenerator.generateTokenSprites(this);

    // Create player animations from Pokemon FireRed/LeafGreen sprites
    // Red protagonist walking animations (frames identified from sprite sheet at threshold 70)
    this.anims.create({
      key: 'player-down',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 2 }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: 'player-up',
      frames: this.anims.generateFrameNumbers('player', { start: 32, end: 34 }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: 'player-left',
      frames: this.anims.generateFrameNumbers('player', { start: 50, end: 52 }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: 'player-right',
      frames: this.anims.generateFrameNumbers('player', { start: 69, end: 71 }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: 'player-idle',
      frames: [{ key: 'player', frame: 1 }],
      frameRate: 1,
    });

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
