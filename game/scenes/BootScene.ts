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

    // Load Pokemon FireRed/LeafGreen sprite sheets as atlases
    // Using flood-fill detection (threshold 70) to match viewer frame numbers
    this.load.atlas(
      'player',
      '/assets/sprites/player/player-sprites.png',
      '/assets/sprites/player/player-sprites-atlas.json'
    );

    this.load.atlas(
      'npcs',
      '/assets/sprites/npcs/overworld-npcs.png',
      '/assets/sprites/npcs/overworld-npcs-atlas.json'
    );

    // Tileset
    this.load.image('tileset', '/assets/sprites/tiles/tileset.png');
  }

  create() {
    // Generate token sprites (keeping custom sprites for crypto tokens)
    SpriteGenerator.generateTokenSprites(this);

    // Debug: Check if NPC atlas loaded
    const npcTexture = this.textures.get('npcs');
    const frameNames = npcTexture.getFrameNames();
    console.log('NPC atlas loaded with', frameNames.length, 'frames');
    console.log('First 15 frame names:', frameNames.slice(0, 15));

    // Create player animations from NPC sprite sheet
    // Using Red character from NPC sheet (frames identified at threshold 70)
    // Using atlas with numeric string frame keys: "0", "1", "2", etc.
    this.anims.create({
      key: 'player-down',
      frames: ['0', '1', '2'].map(frame => ({ key: 'npcs', frame })),
      frameRate: 8,
      repeat: -1,
    });
    console.log('Created player-down animation');

    this.anims.create({
      key: 'player-up',
      frames: ['3', '4', '5'].map(frame => ({ key: 'npcs', frame })),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: 'player-left',
      frames: ['6', '7', '8'].map(frame => ({ key: 'npcs', frame })),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: 'player-right',
      frames: ['9', '10', '11'].map(frame => ({ key: 'npcs', frame })),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: 'player-idle',
      frames: [{ key: 'npcs', frame: '13' }],
      frameRate: 1,
    });
    console.log('Created player-idle animation');
    console.log('All player animations created successfully');

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
