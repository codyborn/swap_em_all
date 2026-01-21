import * as Phaser from 'phaser';
import { NPC, NPCType } from '../entities/NPC';

export class OverworldScene extends Phaser.Scene {
  private player?: Phaser.GameObjects.Sprite;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey?: Phaser.Input.Keyboard.Key;
  private moveSpeed = 1;
  private stepCounter = 0;
  private encounterChance = 0.1; // 10% chance per step group
  private npcs: NPC[] = [];
  private interactText?: Phaser.GameObjects.Text;
  private lastDirection: string = 'down';
  private dialogueBox?: Phaser.GameObjects.Rectangle;
  private dialogueText?: Phaser.GameObjects.Text;
  private dialogueArrow?: Phaser.GameObjects.Text;
  private currentDialogue: string[] = [];
  private currentDialogueIndex: number = 0;
  private isShowingDialogue: boolean = false;
  private dialogueCallback?: () => void;
  private justPressedSpace: boolean = false;

  constructor() {
    super('OverworldScene');
  }

  create() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    // Create a simple background for now
    this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x306230)
      .setOrigin(0);

    // Create grass pattern
    this.createGrassPattern();

    // Create player sprite (using NPC atlas for player character)
    // Start with idle frame facing down (frame 1 = middle of down walk cycle)
    this.player = this.add.sprite(centerX, centerY, 'npcs', '1');
    this.player.setScale(0.75); // Scale down slightly for better fit

    // Enable physics for player
    this.physics.add.existing(this.player);
    (this.player.body as Phaser.Physics.Arcade.Body).setSize(12, 12); // Set collision box

    // Create NPCs
    this.createNPCs();

    // Set up camera to follow player
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(-100, -100, this.cameras.main.width + 200, this.cameras.main.height + 200);

    // Set up input
    this.cursors = this.input.keyboard?.createCursorKeys();
    this.spaceKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Add UI text
    const instructions = this.add.text(4, 4, 'Arrow Keys: Move\nE: Force Encounter\nSPACE: Interact', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#9bbc0f',
      backgroundColor: '#000000',
      padding: { x: 4, y: 3 },
      lineSpacing: 1,
    }).setScrollFactor(0);

    // Interact prompt (hidden by default)
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
        stroke: '#000000',
        strokeThickness: 1,
      }
    ).setOrigin(0.5).setScrollFactor(0).setVisible(false);

    // Dialogue box (hidden by default)
    this.dialogueBox = this.add.rectangle(
      0,
      this.cameras.main.height - 50,
      this.cameras.main.width,
      50,
      0x000000,
      0.85
    ).setOrigin(0).setScrollFactor(0).setVisible(false);

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
    ).setScrollFactor(0).setVisible(false);

    this.dialogueArrow = this.add.text(
      this.cameras.main.width - 12,
      this.cameras.main.height - 10,
      '▼',
      {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#9bbc0f',
      }
    ).setOrigin(0.5).setScrollFactor(0).setVisible(false);

    // Debug: Press E to trigger encounter
    this.input.keyboard?.on('keydown-E', () => {
      this.triggerEncounter();
    });

    // Menu shortcuts
    this.input.keyboard?.on('keydown-C', () => {
      // Open Cryptodex
      this.scene.pause();
      this.scene.launch('CryptodexScene', { callingScene: this.scene.key });
    });

    this.input.keyboard?.on('keydown-B', () => {
      // Open Bag
      this.scene.pause();
      this.scene.launch('BagScene', { callingScene: this.scene.key });
    });

    // Handle scene resume
    this.events.on('resume', () => {
      // Re-enable input system when scene resumes
      this.input.enabled = true;

      // Reset keyboard input state when scene resumes
      // This prevents keys held during pause from continuing to register
      if (this.input.keyboard) {
        this.input.keyboard.resetKeys();
      }
    });
  }

  update() {
    if (!this.player || !this.cursors || !this.spaceKey) return;

    // Handle SPACE key for dialogue/interaction
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      if (this.isShowingDialogue) {
        this.advanceDialogue();
      } else {
        this.checkNPCInteraction();
      }
    }

    // Handle DOWN arrow to advance dialogue
    if (this.isShowingDialogue && Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.advanceDialogue();
    }

    // Don't allow movement during dialogue
    if (this.isShowingDialogue) {
      this.checkNPCProximity(); // Still check proximity for when dialogue ends
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

    // Apply movement
    this.player.x += vx;
    this.player.y += vy;

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

    // Check for random encounters while moving
    if (moving) {
      this.stepCounter++;

      // Check for encounter every 30 steps
      if (this.stepCounter >= 30) {
        this.stepCounter = 0;
        this.checkForEncounter();
      }
    }

    // Check proximity to NPCs
    this.checkNPCProximity();
  }

  private createGrassPattern() {
    // Create a simple grass tile pattern
    const tileSize = 16;
    const cols = Math.ceil(this.cameras.main.width / tileSize) + 10;
    const rows = Math.ceil(this.cameras.main.height / tileSize) + 10;

    for (let y = -5; y < rows; y++) {
      for (let x = -5; x < cols; x++) {
        // Alternate colors for grass effect
        const isDark = (x + y) % 2 === 0;
        const color = isDark ? 0x0f380f : 0x306230;

        this.add.rectangle(
          x * tileSize,
          y * tileSize,
          tileSize,
          tileSize,
          color
        ).setOrigin(0);
      }
    }
  }

  private createNPCs() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    // Professor (top-left area)
    const professor = new NPC({
      scene: this,
      x: centerX - 60,
      y: centerY - 50,
      type: 'professor',
      name: 'Professor Oak',
      dialogue: [
        'Welcome to Swap \'Em All!\nCatch tokens by swapping USDC.',
        'Visit the Store to buy Pokeballs.',
        'Then explore to find wild tokens!',
        'Press C for your Cryptodex.\nGood luck, trainer!',
      ],
    });

    // Store Clerk (top-right area)
    const clerk = new NPC({
      scene: this,
      x: centerX + 60,
      y: centerY - 50,
      type: 'clerk',
      name: 'Store Clerk',
      dialogue: [
        'Welcome to the Pokeball Store!',
        'Buy pokeballs with USDC.',
      ],
      onInteract: () => {
        this.scene.pause();
        this.scene.launch('StoreScene');
      },
    });

    // Trader (bottom-right area)
    const trader = new NPC({
      scene: this,
      x: centerX + 60,
      y: centerY + 50,
      type: 'trader',
      name: 'Token Trader',
      dialogue: [
        'I buy tokens for USDC.',
        'Show me what you\'ve got!',
      ],
      onInteract: () => {
        this.scene.pause();
        this.scene.launch('TraderScene');
      },
    });

    // Healing Center Nurse (bottom-left area)
    const nurse = new NPC({
      scene: this,
      x: centerX - 60,
      y: centerY + 50,
      type: 'nurse',
      name: 'Nurse',
      dialogue: [
        'Let me heal your tokens!',
      ],
      onInteract: () => {
        this.scene.pause();
        this.scene.launch('HealingCenterScene');
      },
    });

    // Gym Leader 1: Peg Master (left side)
    const gym1 = new NPC({
      scene: this,
      x: centerX - 90,
      y: centerY,
      type: 'gym_leader',
      name: 'Stable Master',
      dialogue: [
        'I\'m the Stable Master!',
        'Ready to battle?',
      ],
      gymId: 'gym1',
      onInteract: () => {
        const gameStore = (window as any).gameStore;
        const inventory = gameStore?.getState().inventory || [];

        if (inventory.length === 0) {
          this.showDialogue([
            'You need tokens to battle!',
            'Come back when you\'ve caught some tokens.',
          ]);
          return;
        }

        this.scene.pause();
        this.scene.launch('BattleScene', { type: 'gym', gymId: 'gym1', callingScene: this.scene.key });
      },
    });

    // Gym Leader 2: Protocol Pete (right side)
    const gym2 = new NPC({
      scene: this,
      x: centerX + 90,
      y: centerY,
      type: 'gym_leader',
      name: 'Protocol Pete',
      dialogue: [
        'DeFi Blue Chip Gym Leader!',
        'Let\'s test your skills!',
      ],
      gymId: 'gym2',
      onInteract: () => {
        const gameStore = (window as any).gameStore;
        const inventory = gameStore?.getState().inventory || [];

        if (inventory.length === 0) {
          this.showDialogue([
            'You need tokens to battle!',
            'Come back when you\'ve caught some tokens.',
          ]);
          return;
        }

        this.scene.pause();
        this.scene.launch('BattleScene', { type: 'gym', gymId: 'gym2', callingScene: this.scene.key });
      },
    });

    // Gym Leader 3: Scaler Sam (top)
    const gym3 = new NPC({
      scene: this,
      x: centerX,
      y: centerY - 70,
      type: 'gym_leader',
      name: 'Scaler Sam',
      dialogue: [
        'Layer 2 Gym Leader!',
        'Speed is everything!',
      ],
      gymId: 'gym3',
      onInteract: () => {
        const gameStore = (window as any).gameStore;
        const inventory = gameStore?.getState().inventory || [];

        if (inventory.length === 0) {
          this.showDialogue([
            'You need tokens to battle!',
            'Come back when you\'ve caught some tokens.',
          ]);
          return;
        }

        this.scene.pause();
        this.scene.launch('BattleScene', { type: 'gym', gymId: 'gym3', callingScene: this.scene.key });
      },
    });

    this.npcs = [professor, clerk, trader, nurse, gym1, gym2, gym3];
  }

  private checkNPCProximity() {
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

  private checkNPCInteraction() {
    if (!this.player) return;

    for (const npc of this.npcs) {
      if (npc.isNearPlayer(this.player, 25)) {
        // Show dialogue first, then interact
        this.showDialogue(npc.dialogue, () => {
          if (npc.onInteract) {
            npc.onInteract();
          }
        });
        return;
      }
    }
  }

  private showDialogue(dialogue: string[], onComplete?: () => void) {
    this.isShowingDialogue = true;
    this.currentDialogue = dialogue;
    this.currentDialogueIndex = 0;
    this.dialogueCallback = onComplete;

    // Hide interact prompt
    this.interactText?.setVisible(false);

    // Show dialogue UI
    this.dialogueBox?.setVisible(true);
    this.dialogueText?.setVisible(true);
    this.dialogueArrow?.setVisible(true);

    // Display first line
    this.dialogueText?.setText(this.currentDialogue[0]);
  }

  private advanceDialogue() {
    this.currentDialogueIndex++;

    if (this.currentDialogueIndex < this.currentDialogue.length) {
      // Show next line
      this.dialogueText?.setText(this.currentDialogue[this.currentDialogueIndex]);
    } else {
      // Dialogue complete
      this.hideDialogue();
      if (this.dialogueCallback) {
        this.dialogueCallback();
        this.dialogueCallback = undefined;
      }
    }
  }

  private hideDialogue() {
    this.isShowingDialogue = false;
    this.currentDialogue = [];
    this.currentDialogueIndex = 0;

    // Hide dialogue UI
    this.dialogueBox?.setVisible(false);
    this.dialogueText?.setVisible(false);
    this.dialogueArrow?.setVisible(false);
  }

  private checkForEncounter() {
    const random = Math.random();

    if (random < this.encounterChance) {
      this.triggerEncounter();
    }
  }

  private getIdleFrame(direction: string): string {
    // Return middle frame of each direction's walk cycle (using NPC atlas frames)
    switch (direction) {
      case 'down': return '1';   // middle of frames 0-2
      case 'up': return '4';     // middle of frames 3-5
      case 'left': return '7';   // middle of frames 6-8
      case 'right': return '10'; // middle of frames 9-11
      default: return '1';
    }
  }

  private triggerEncounter() {
    // Flash effect
    this.cameras.main.flash(200, 255, 255, 255);

    // Transition to encounter scene
    this.time.delayedCall(200, () => {
      this.scene.pause();
      this.scene.launch('EncounterScene', { callingScene: this.scene.key });
    });
  }

  shutdown() {
    // Clean up event listeners
    this.events.off('resume');

    // Clean up NPCs
    for (const npc of this.npcs) {
      npc.destroy();
    }
    this.npcs = [];
  }
}
