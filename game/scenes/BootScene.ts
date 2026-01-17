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

    // Load sprite sheets and process them to remove orange borders
    // We need to intercept the load to modify the image before it's uploaded to WebGL
    this.load.on('filecomplete-image-player', () => {
      this.removeOrangeBorders('player');
    });

    this.load.on('filecomplete-image-npcs', () => {
      this.removeOrangeBorders('npcs');
    });

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

  private removeOrangeBorders(textureKey: string) {
    const texture = this.textures.get(textureKey);
    if (!texture) {
      console.warn(`Texture ${textureKey} not found`);
      return;
    }

    const source = texture.source[0];
    if (!source) {
      console.warn(`No source for texture ${textureKey}`);
      return;
    }

    const image = source.image as HTMLImageElement | HTMLCanvasElement;
    if (!image) {
      console.warn(`No image for texture ${textureKey}`);
      return;
    }

    // Create a canvas to process the image
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw the image
    ctx.drawImage(image, 0, 0);

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let pixelsChanged = 0;

    // Replace orange (#ff7f27, RGB 255, 127, 39) with transparent
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Check if pixel matches orange border color (#ff7f27)
      // Exact match for RGB(255, 127, 39)
      if (r === 255 && g === 127 && b === 39) {
        data[i + 3] = 0; // Set alpha to 0 (transparent)
        pixelsChanged++;
      }
    }

    console.log(`${textureKey}: Replaced ${pixelsChanged} orange pixels with transparent`);

    // Put the modified data back
    ctx.putImageData(imageData, 0, 0);

    // Get the frame data before destroying texture
    const frameData: Record<string, any> = {};
    const frameNames = texture.getFrameNames();
    frameNames.forEach(name => {
      const frame = texture.get(name);
      frameData[name] = {
        x: frame.cutX,
        y: frame.cutY,
        w: frame.cutWidth,
        h: frame.cutHeight
      };
    });

    // Destroy old texture
    this.textures.remove(textureKey);

    // Create new texture from modified canvas
    this.textures.addCanvas(textureKey, canvas);

    // Re-add all frames
    const newTexture = this.textures.get(textureKey);
    Object.keys(frameData).forEach(name => {
      const fd = frameData[name];
      newTexture.add(name, 0, fd.x, fd.y, fd.w, fd.h);
    });
  }
}
