import * as Phaser from 'phaser';
import { NPC } from '../entities/NPC';

export interface MapData {
  width: number;
  height: number;
  tileWidth: number;
  tileHeight: number;
  ground: number[][];
  collision: number[][];
  npcs: NPCData[];
  signs: SignData[];
  transitions: TransitionData[];
  spawnPoints: { [key: string]: { x: number; y: number } };
}

export interface NPCData {
  id: string;
  x: number;
  y: number;
  type: string;
  name: string;
  dialogue: string[];
  onInteract?: string;
  gymId?: string;
}

export interface SignData {
  x: number;
  y: number;
  text: string;
}

export interface TransitionData {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  targetScene: string;
  spawnPoint: string;
  direction?: string;
}

/**
 * Base class for all map-based scenes
 * Provides common tilemap, collision, and NPC functionality
 */
export abstract class BaseMapScene extends Phaser.Scene {
  protected player?: Phaser.GameObjects.Sprite;
  protected cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  protected spaceKey?: Phaser.Input.Keyboard.Key;
  protected moveSpeed = 1;
  protected stepCounter = 0;
  protected encounterChance = 0.1;

  protected npcs: NPC[] = [];
  protected interactText?: Phaser.GameObjects.Text;
  protected lastDirection: string = 'down';

  // Dialogue system
  protected dialogueBox?: Phaser.GameObjects.Rectangle;
  protected dialogueText?: Phaser.GameObjects.Text;
  protected dialogueArrow?: Phaser.GameObjects.Text;
  protected currentDialogue: string[] = [];
  protected currentDialogueIndex: number = 0;
  protected isShowingDialogue: boolean = false;
  protected dialogueCallback?: () => void;

  // Tilemap
  protected map?: Phaser.Tilemaps.Tilemap;
  protected groundLayer?: Phaser.Tilemaps.TilemapLayer | null;
  protected collisionData?: number[][];

  // Map data
  protected abstract getMapData(): MapData;
  protected abstract getSceneName(): string;

  create(data?: { spawnPoint?: string }) {
    const mapData = this.getMapData();

    // Create tilemap
    this.createTilemap(mapData);

    // Create player at spawn point
    this.createPlayer(data);

    // Set up camera
    this.setupCamera(mapData);

    // Create NPCs
    this.createNPCs(mapData);

    // Create signs
    this.createSigns(mapData);

    // Create transitions
    this.createTransitions(mapData);

    // Set up input
    this.setupInput();

    // Create UI
    this.createUI();

    // Handle scene resume
    this.events.on('resume', this.onSceneResume, this);
  }

  protected onSceneResume() {
    // Re-enable input system when scene resumes
    this.input.enabled = true;

    // Reset keyboard input state when scene resumes
    // This prevents keys held during pause from continuing to register
    if (this.input.keyboard) {
      this.input.keyboard.resetKeys();
    }
  }

  protected createTilemap(mapData: MapData) {
    // Create blank tilemap
    this.map = this.make.tilemap({
      data: mapData.ground,
      tileWidth: mapData.tileWidth,
      tileHeight: mapData.tileHeight,
      width: mapData.width,
      height: mapData.height,
    });

    // Add tileset (using simple colored tiles for now since tileset.png format is unknown)
    // We'll use different colors to represent different tile types
    const tiles = this.add.graphics();

    // Create a simple tileset texture with colored squares
    const tileSize = 16;
    const tilesetCanvas = document.createElement('canvas');
    tilesetCanvas.width = tileSize * 10; // 10 tiles wide
    tilesetCanvas.height = tileSize * 10; // 10 tiles tall
    const ctx = tilesetCanvas.getContext('2d');

    if (ctx) {
      // Tile 0: Dark grass
      ctx.fillStyle = '#0f380f';
      ctx.fillRect(0, 0, tileSize, tileSize);

      // Tile 1: Light grass
      ctx.fillStyle = '#306230';
      ctx.fillRect(tileSize, 0, tileSize, tileSize);

      // Tile 2: Dirt path
      ctx.fillStyle = '#8b7355';
      ctx.fillRect(tileSize * 2, 0, tileSize, tileSize);

      // Tile 3: Cobblestone
      ctx.fillStyle = '#9bbc0f';
      ctx.fillRect(tileSize * 3, 0, tileSize, tileSize);

      // Tile 4: Wood floor
      ctx.fillStyle = '#654321';
      ctx.fillRect(tileSize * 4, 0, tileSize, tileSize);

      // Tile 5: Water
      ctx.fillStyle = '#1a5490';
      ctx.fillRect(tileSize * 5, 0, tileSize, tileSize);

      // Tile 6: Fence
      ctx.fillStyle = '#654321';
      ctx.fillRect(tileSize * 6, 0, tileSize, tileSize);

      // Tile 7: Flowers (pink/red)
      ctx.fillStyle = '#d84c6f';
      ctx.fillRect(tileSize * 7, 0, tileSize, tileSize);

      // Tile 8: Tree (dark green)
      ctx.fillStyle = '#0a2910';
      ctx.fillRect(tileSize * 8, 0, tileSize, tileSize);

      // Tile 9: Building roof (red)
      ctx.fillStyle = '#b53120';
      ctx.fillRect(tileSize * 9, 0, tileSize, tileSize);
    }

    // Create texture from canvas
    this.textures.addCanvas(`tileset_${this.getSceneName()}`, tilesetCanvas);
    const tileset = this.map.addTilesetImage(`tileset_${this.getSceneName()}`);

    if (tileset) {
      this.groundLayer = this.map.createLayer(0, tileset, 0, 0);
    }

    // Store collision data
    this.collisionData = mapData.collision;
  }

  protected createPlayer(data?: { spawnPoint?: string }) {
    const mapData = this.getMapData();
    const spawnPoint = data?.spawnPoint || 'default';
    const spawn = mapData.spawnPoints[spawnPoint] || mapData.spawnPoints.default;

    this.player = this.add.sprite(spawn.x, spawn.y, 'npcs', '1');
    this.player.setScale(0.75);
    this.player.setDepth(10); // Above tiles

    // Enable physics
    this.physics.add.existing(this.player);
    (this.player.body as Phaser.Physics.Arcade.Body).setSize(12, 12);
  }

  protected setupCamera(mapData: MapData) {
    if (!this.player) return;

    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(
      0,
      0,
      mapData.width * mapData.tileWidth,
      mapData.height * mapData.tileHeight
    );
  }

  protected createNPCs(mapData: MapData) {
    for (const npcData of mapData.npcs) {
      const npc = new NPC({
        scene: this,
        x: npcData.x,
        y: npcData.y,
        type: npcData.type as any,
        name: npcData.name,
        dialogue: npcData.dialogue,
        gymId: npcData.gymId,
        onInteract: npcData.onInteract ? this.getInteractCallback(npcData.onInteract) : undefined,
      });
      this.npcs.push(npc);
    }
  }

  protected getInteractCallback(type: string): () => void {
    return () => {
      switch (type) {
        case 'store':
          this.scene.pause();
          this.scene.launch('StoreScene');
          break;
        case 'healing':
          this.scene.pause();
          this.scene.launch('HealingCenterScene');
          break;
        case 'trader':
          this.scene.pause();
          this.scene.launch('TraderScene');
          break;
      }
    };
  }

  protected createSigns(mapData: MapData) {
    // Signs are handled via dialogue when player interacts
    // Store sign data for later use
    (this as any).signData = mapData.signs;
  }

  protected createTransitions(mapData: MapData) {
    for (const transition of mapData.transitions) {
      const zone = this.add.zone(
        transition.x + transition.width / 2,
        transition.y + transition.height / 2,
        transition.width,
        transition.height
      );
      this.physics.add.existing(zone);

      if (this.player) {
        this.physics.add.overlap(this.player, zone, () => {
          this.scene.start(transition.targetScene, {
            spawnPoint: transition.spawnPoint,
          });
        });
      }
    }
  }

  protected setupInput() {
    this.cursors = this.input.keyboard?.createCursorKeys();
    this.spaceKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Menu shortcuts
    this.input.keyboard?.on('keydown-C', () => {
      this.scene.pause();
      this.scene.launch('CryptodexScene', { callingScene: this.scene.key });
    });

    this.input.keyboard?.on('keydown-B', () => {
      this.scene.pause();
      this.scene.launch('BagScene', { callingScene: this.scene.key });
    });

    // Debug: Force encounter
    this.input.keyboard?.on('keydown-E', () => {
      this.triggerEncounter();
    });
  }

  protected createUI() {
    // Instructions
    this.add.text(4, 4, 'Arrows: Move | E: Encounter | SPACE: Interact', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#9bbc0f',
      backgroundColor: '#000000',
      padding: { x: 4, y: 3 },
    }).setScrollFactor(0).setDepth(100);

    // Interact prompt
    this.interactText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.height - 20,
      '',
      {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#9bbc0f',
        backgroundColor: '#000000',
        padding: { x: 6, y: 3 },
      }
    ).setOrigin(0.5).setScrollFactor(0).setVisible(false).setDepth(100);

    // Dialogue box
    this.dialogueBox = this.add.rectangle(
      0,
      this.cameras.main.height - 50,
      this.cameras.main.width,
      50,
      0x000000,
      0.85
    ).setOrigin(0).setScrollFactor(0).setVisible(false).setDepth(100);

    this.dialogueText = this.add.text(
      8,
      this.cameras.main.height - 45,
      '',
      {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#9bbc0f',
        lineSpacing: 2,
        wordWrap: { width: this.cameras.main.width - 20 }
      }
    ).setScrollFactor(0).setVisible(false).setDepth(101);

    this.dialogueArrow = this.add.text(
      this.cameras.main.width - 12,
      this.cameras.main.height - 10,
      '▼',
      {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#9bbc0f',
      }
    ).setOrigin(0.5).setScrollFactor(0).setVisible(false).setDepth(101);
  }

  update() {
    if (!this.player || !this.cursors || !this.spaceKey) return;

    // Handle SPACE key
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      if (this.isShowingDialogue) {
        this.advanceDialogue();
      } else {
        this.checkNPCInteraction();
      }
    }

    // Handle DOWN for dialogue
    if (this.isShowingDialogue && Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.advanceDialogue();
    }

    // Don't allow movement during dialogue
    if (this.isShowingDialogue) {
      this.checkNPCProximity();
      return;
    }

    let moving = false;
    let vx = 0;
    let vy = 0;
    let direction = this.lastDirection;

    // Handle movement
    if (this.cursors.left.isDown) {
      vx = -this.moveSpeed;
      moving = true;
      direction = 'left';
    } else if (this.cursors.right.isDown) {
      vx = this.moveSpeed;
      moving = true;
      direction = 'right';
    }

    if (this.cursors.up.isDown) {
      vy = -this.moveSpeed;
      moving = true;
      direction = 'up';
    } else if (this.cursors.down.isDown) {
      vy = this.moveSpeed;
      moving = true;
      direction = 'down';
    }

    // Check collision before moving
    if (moving && this.collisionData) {
      const nextX = this.player.x + vx;
      const nextY = this.player.y + vy;

      // Convert to tile coordinates
      const tileX = Math.floor(nextX / 16);
      const tileY = Math.floor(nextY / 16);

      // Check if tile is blocked
      if (
        this.collisionData[tileY] &&
        this.collisionData[tileY][tileX] === 1
      ) {
        moving = false;
        vx = 0;
        vy = 0;
      }
    }

    // Apply movement
    if (moving) {
      this.player.x += vx;
      this.player.y += vy;
    }

    // Update animation
    if (moving) {
      this.lastDirection = direction;
      const animKey = `player-${direction}`;
      if (this.player.anims.currentAnim?.key !== animKey) {
        this.player.play(animKey);
      }
    } else {
      if (this.player.anims.isPlaying) {
        this.player.stop();
        this.player.setFrame(this.getIdleFrame(this.lastDirection));
      }
    }

    // Check for encounters
    if (moving) {
      this.stepCounter++;
      if (this.stepCounter >= 30) {
        this.stepCounter = 0;
        this.checkForEncounter();
      }
    }

    // Check NPC proximity
    this.checkNPCProximity();
  }

  protected checkNPCProximity() {
    if (!this.player || !this.interactText) return;

    let nearNPC: NPC | null = null;

    for (const npc of this.npcs) {
      if (npc.isNearPlayer(this.player, 25)) {
        nearNPC = npc;
        break;
      }
    }

    if (nearNPC) {
      this.interactText.setText(`[SPACE] Talk to ${nearNPC.name}`);
      this.interactText.setVisible(true);
    } else {
      this.interactText.setVisible(false);
    }
  }

  protected checkNPCInteraction() {
    if (!this.player) return;

    for (const npc of this.npcs) {
      if (npc.isNearPlayer(this.player, 25)) {
        this.showDialogue(npc.dialogue, () => {
          if (npc.onInteract) {
            npc.onInteract();
          }
        });
        return;
      }
    }
  }

  protected showDialogue(dialogue: string[], onComplete?: () => void) {
    this.isShowingDialogue = true;
    this.currentDialogue = dialogue;
    this.currentDialogueIndex = 0;
    this.dialogueCallback = onComplete;

    this.interactText?.setVisible(false);
    this.dialogueBox?.setVisible(true);
    this.dialogueText?.setVisible(true);
    this.dialogueArrow?.setVisible(true);

    this.dialogueText?.setText(this.currentDialogue[0]);
  }

  protected advanceDialogue() {
    this.currentDialogueIndex++;

    if (this.currentDialogueIndex < this.currentDialogue.length) {
      this.dialogueText?.setText(this.currentDialogue[this.currentDialogueIndex]);
    } else {
      this.hideDialogue();
      if (this.dialogueCallback) {
        this.dialogueCallback();
        this.dialogueCallback = undefined;
      }
    }
  }

  protected hideDialogue() {
    this.isShowingDialogue = false;
    this.currentDialogue = [];
    this.currentDialogueIndex = 0;

    this.dialogueBox?.setVisible(false);
    this.dialogueText?.setVisible(false);
    this.dialogueArrow?.setVisible(false);
  }

  protected checkForEncounter() {
    const random = Math.random();
    if (random < this.encounterChance) {
      this.triggerEncounter();
    }
  }

  protected getIdleFrame(direction: string): string {
    switch (direction) {
      case 'down': return '1';
      case 'up': return '4';
      case 'left': return '7';
      case 'right': return '10';
      default: return '1';
    }
  }

  protected triggerEncounter() {
    this.cameras.main.flash(200, 255, 255, 255);
    this.time.delayedCall(200, () => {
      this.scene.pause();
      this.scene.launch('EncounterScene', { callingScene: this.scene.key });
    });
  }

  shutdown() {
    // Clean up event listeners
    this.events.off('resume', this.onSceneResume, this);

    // Clean up NPCs
    for (const npc of this.npcs) {
      npc.destroy();
    }
    this.npcs = [];
  }
}
