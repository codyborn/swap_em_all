// Utility to generate pixel art sprites programmatically
import * as Phaser from 'phaser';

export class SpriteGenerator {
  /**
   * Generate a player sprite with 4-directional walking animation
   */
  static generatePlayerSprite(scene: Phaser.Scene): void {
    const canvas = document.createElement('canvas');
    canvas.width = 64; // 4 frames x 16px
    canvas.height = 64; // 4 directions x 16px
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Colors
    const skin = '#FFD4A3';
    const hair = '#8B4513';
    const shirt = '#4169E1';
    const pants = '#2C3E50';

    // Draw 4 directions (down, left, right, up) x 4 frames each
    const directions = [
      { row: 0, name: 'down' },
      { row: 1, name: 'left' },
      { row: 2, name: 'right' },
      { row: 3, name: 'up' },
    ];

    directions.forEach(({ row }) => {
      for (let frame = 0; frame < 4; frame++) {
        const x = frame * 16;
        const y = row * 16;

        // Clear frame
        ctx.clearRect(x, y, 16, 16);

        // Draw based on direction and frame
        this.drawPlayerFrame(ctx, x + 4, y + 2, frame, row, { skin, hair, shirt, pants });
      }
    });

    // Create texture from canvas
    const key = 'player';
    if (!scene.textures.exists(key)) {
      const texture = scene.textures.createCanvas(key, canvas.width, canvas.height);
      if (texture && texture.context) {
        const context = texture.context;
        context.drawImage(canvas, 0, 0);
        texture.refresh();

        // Manually add frames (4x4 grid of 16x16 frames)
        const source = texture.getSourceImage() as HTMLCanvasElement;
        for (let row = 0; row < 4; row++) {
          for (let col = 0; col < 4; col++) {
            const frameIndex = row * 4 + col;
            texture.add(frameIndex, 0, col * 16, row * 16, 16, 16);
          }
        }
      }
    }

    // Create animations
    if (!scene.anims.exists('player-down')) {
      scene.anims.create({
        key: 'player-down',
        frames: scene.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
        frameRate: 8,
        repeat: -1,
      });

      scene.anims.create({
        key: 'player-left',
        frames: scene.anims.generateFrameNumbers('player', { start: 4, end: 7 }),
        frameRate: 8,
        repeat: -1,
      });

      scene.anims.create({
        key: 'player-right',
        frames: scene.anims.generateFrameNumbers('player', { start: 8, end: 11 }),
        frameRate: 8,
        repeat: -1,
      });

      scene.anims.create({
        key: 'player-up',
        frames: scene.anims.generateFrameNumbers('player', { start: 12, end: 15 }),
        frameRate: 8,
        repeat: -1,
      });

      scene.anims.create({
        key: 'player-idle',
        frames: [{ key: 'player', frame: 0 }],
        frameRate: 1,
      });
    }
  }

  private static drawPlayerFrame(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    frame: number,
    direction: number,
    colors: { skin: string; hair: string; shirt: string; pants: string }
  ): void {
    const pixelSize = 1;

    // Simple pixel art character (8x12 pixels)
    // Head
    ctx.fillStyle = colors.skin;
    ctx.fillRect(x + 2 * pixelSize, y, 4 * pixelSize, 3 * pixelSize);

    // Hair
    ctx.fillStyle = colors.hair;
    ctx.fillRect(x + 2 * pixelSize, y, 4 * pixelSize, pixelSize);

    // Eyes (vary by direction)
    ctx.fillStyle = '#000000';
    if (direction === 0) { // down
      ctx.fillRect(x + 2 * pixelSize, y + 2 * pixelSize, pixelSize, pixelSize);
      ctx.fillRect(x + 4 * pixelSize, y + 2 * pixelSize, pixelSize, pixelSize);
    } else if (direction === 1) { // left
      ctx.fillRect(x + 2 * pixelSize, y + 2 * pixelSize, pixelSize, pixelSize);
    } else if (direction === 2) { // right
      ctx.fillRect(x + 4 * pixelSize, y + 2 * pixelSize, pixelSize, pixelSize);
    } else { // up
      // No eyes visible from back
    }

    // Body (shirt)
    ctx.fillStyle = colors.shirt;
    ctx.fillRect(x + 2 * pixelSize, y + 3 * pixelSize, 4 * pixelSize, 4 * pixelSize);

    // Arms (vary by walk frame)
    const armOffset = frame % 2 === 0 ? 0 : 1;
    ctx.fillRect(x + pixelSize, y + 4 * pixelSize - armOffset, pixelSize, 2 * pixelSize);
    ctx.fillRect(x + 6 * pixelSize, y + 4 * pixelSize + armOffset, pixelSize, 2 * pixelSize);

    // Legs (pants)
    ctx.fillStyle = colors.pants;
    const legOffset = frame === 1 ? -1 : frame === 3 ? 1 : 0;
    ctx.fillRect(x + 2 * pixelSize + legOffset, y + 7 * pixelSize, 2 * pixelSize, 3 * pixelSize);
    ctx.fillRect(x + 4 * pixelSize - legOffset, y + 7 * pixelSize, 2 * pixelSize, 3 * pixelSize);

    // Feet
    ctx.fillStyle = '#654321';
    ctx.fillRect(x + 2 * pixelSize + legOffset, y + 10 * pixelSize, 2 * pixelSize, pixelSize);
    ctx.fillRect(x + 4 * pixelSize - legOffset, y + 10 * pixelSize, 2 * pixelSize, pixelSize);
  }

  /**
   * Generate NPC sprites for different types
   */
  static generateNPCSprites(scene: Phaser.Scene): void {
    const types = [
      { key: 'npc-professor', color: '#FFFFFF', accessory: '#0000FF' }, // White coat, blue tie
      { key: 'npc-clerk', color: '#228B22', accessory: '#FFD700' }, // Green apron, gold badge
      { key: 'npc-trader', color: '#FF8C00', accessory: '#C0C0C0' }, // Orange vest, silver coin
      { key: 'npc-nurse', color: '#FFB6C1', accessory: '#FF0000' }, // Pink uniform, red cross
      { key: 'npc-gym', color: '#FF0000', accessory: '#FFD700' }, // Red uniform, gold badge
    ];

    types.forEach(({ key, color, accessory }) => {
      this.generateNPCSprite(scene, key, color, accessory);
    });
  }

  private static generateNPCSprite(
    scene: Phaser.Scene,
    key: string,
    primaryColor: string,
    accentColor: string
  ): void {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pixelSize = 1;
    const x = 4;
    const y = 2;

    // Head
    ctx.fillStyle = '#FFD4A3';
    ctx.fillRect(x + 2 * pixelSize, y, 4 * pixelSize, 3 * pixelSize);

    // Hair
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x + 2 * pixelSize, y, 4 * pixelSize, pixelSize);

    // Eyes
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 2 * pixelSize, y + 2 * pixelSize, pixelSize, pixelSize);
    ctx.fillRect(x + 4 * pixelSize, y + 2 * pixelSize, pixelSize, pixelSize);

    // Body (uniform)
    ctx.fillStyle = primaryColor;
    ctx.fillRect(x + 2 * pixelSize, y + 3 * pixelSize, 4 * pixelSize, 4 * pixelSize);

    // Accessory (badge, cross, etc.)
    ctx.fillStyle = accentColor;
    ctx.fillRect(x + 3 * pixelSize, y + 4 * pixelSize, 2 * pixelSize, 2 * pixelSize);

    // Arms
    ctx.fillStyle = primaryColor;
    ctx.fillRect(x + pixelSize, y + 4 * pixelSize, pixelSize, 2 * pixelSize);
    ctx.fillRect(x + 6 * pixelSize, y + 4 * pixelSize, pixelSize, 2 * pixelSize);

    // Legs
    ctx.fillStyle = '#2C3E50';
    ctx.fillRect(x + 2 * pixelSize, y + 7 * pixelSize, 2 * pixelSize, 3 * pixelSize);
    ctx.fillRect(x + 4 * pixelSize, y + 7 * pixelSize, 2 * pixelSize, 3 * pixelSize);

    // Feet
    ctx.fillStyle = '#654321';
    ctx.fillRect(x + 2 * pixelSize, y + 10 * pixelSize, 2 * pixelSize, pixelSize);
    ctx.fillRect(x + 4 * pixelSize, y + 10 * pixelSize, 2 * pixelSize, pixelSize);

    // Create texture
    const texture = scene.textures.createCanvas(key, canvas.width, canvas.height);
    if (texture && texture.context) {
      const context = texture.context;
      context.drawImage(canvas, 0, 0);
      texture.refresh();
    }
  }

  /**
   * Generate token sprites for different types
   */
  static generateTokenSprites(scene: Phaser.Scene): void {
    const tokenTypes = [
      { key: 'token-defi', color: '#1E90FF', symbol: 'D' },
      { key: 'token-layer1', color: '#FFD700', symbol: 'L' },
      { key: 'token-layer2', color: '#9370DB', symbol: '2' },
      { key: 'token-meme', color: '#FF1493', symbol: 'M' },
      { key: 'token-exchange', color: '#FF8C00', symbol: 'E' },
      { key: 'token-governance', color: '#4169E1', symbol: 'G' },
      { key: 'token-wrapped', color: '#8B4513', symbol: 'W' },
      { key: 'token-unknown', color: '#808080', symbol: '?' },
    ];

    tokenTypes.forEach(({ key, color, symbol }) => {
      this.generateTokenSprite(scene, key, color, symbol);
      this.generateTokenBattleSprite(scene, key + '-battle', color, symbol);
    });
  }

  private static generateTokenSprite(
    scene: Phaser.Scene,
    key: string,
    color: string,
    symbol: string
  ): void {
    const canvas = document.createElement('canvas');
    canvas.width = 48; // 3 frames x 16px
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create 3 frames for idle animation
    for (let frame = 0; frame < 3; frame++) {
      const x = frame * 16;
      const y = 0;
      const bounce = frame === 1 ? -1 : 0;

      // Draw token as a circular coin
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x + 8, y + 8 + bounce, 6, 0, Math.PI * 2);
      ctx.fill();

      // Inner circle (shine effect)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(x + 7, y + 7 + bounce, 3, 0, Math.PI * 2);
      ctx.fill();

      // Symbol
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(symbol, x + 8, y + 8 + bounce);
    }

    // Create texture from canvas
    if (!scene.textures.exists(key)) {
      try {
        const texture = scene.textures.createCanvas(key, canvas.width, canvas.height);
        if (!texture) {
          console.error(`Failed to create texture for ${key}`);
          return;
        }

        const context = texture.getContext();
        if (!context) {
          console.error(`Failed to get context for texture ${key}`);
          return;
        }

        context.drawImage(canvas, 0, 0);
        texture.refresh();

        // Manually add frames (3 frames of 16x16)
        for (let i = 0; i < 3; i++) {
          texture.add(i, 0, i * 16, 0, 16, 16);
        }
      } catch (error) {
        console.error(`Error creating token sprite ${key}:`, error);
      }
    }

    // Create idle animation
    if (scene.textures.exists(key) && !scene.anims.exists(key + '-idle')) {
      try {
        scene.anims.create({
          key: key + '-idle',
          frames: scene.anims.generateFrameNumbers(key, { start: 0, end: 2 }),
          frameRate: 4,
          repeat: -1,
        });
      } catch (error) {
        console.error(`Error creating idle animation ${key}-idle:`, error);
      }
    }
  }

  private static generateTokenBattleSprite(
    scene: Phaser.Scene,
    key: string,
    color: string,
    symbol: string
  ): void {
    const canvas = document.createElement('canvas');
    canvas.width = 96; // 4 frames x 24px
    canvas.height = 24;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create 4 frames for battle animation (larger sprite)
    for (let frame = 0; frame < 4; frame++) {
      const x = frame * 24;
      const y = 0;
      const scale = frame % 2 === 0 ? 1 : 1.1; // Pulsing effect

      // Draw larger token for battle
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x + 12, y + 12, 9 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Border
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Inner shine
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(x + 10, y + 10, 4 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Symbol
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(symbol, x + 12, y + 12);
    }

    // Create texture from canvas
    if (!scene.textures.exists(key)) {
      try {
        const texture = scene.textures.createCanvas(key, canvas.width, canvas.height);
        if (!texture) {
          console.error(`Failed to create texture for ${key}`);
          return;
        }

        const context = texture.getContext();
        if (!context) {
          console.error(`Failed to get context for texture ${key}`);
          return;
        }

        context.drawImage(canvas, 0, 0);
        texture.refresh();

        // Manually add frames (4 frames of 24x24)
        for (let i = 0; i < 4; i++) {
          texture.add(i, 0, i * 24, 0, 24, 24);
        }
      } catch (error) {
        console.error(`Error creating battle sprite ${key}:`, error);
      }
    }

    // Create battle animation
    if (scene.textures.exists(key) && !scene.anims.exists(key + '-anim')) {
      try {
        scene.anims.create({
          key: key + '-anim',
          frames: scene.anims.generateFrameNumbers(key, { start: 0, end: 3 }),
          frameRate: 6,
          repeat: -1,
        });
      } catch (error) {
        console.error(`Error creating battle animation ${key}-anim:`, error);
      }
    }
  }

  /**
   * Generate all game sprites
   */
  static generateAllSprites(scene: Phaser.Scene): void {
    this.generatePlayerSprite(scene);
    this.generateNPCSprites(scene);
    this.generateTokenSprites(scene);
  }
}
