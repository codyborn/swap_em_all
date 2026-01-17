import * as Phaser from 'phaser';

export type NPCType = 'professor' | 'clerk' | 'trader' | 'nurse' | 'gym_leader';

export interface NPCConfig {
  scene: Phaser.Scene;
  x: number;
  y: number;
  type: NPCType;
  name: string;
  dialogue: string[];
  onInteract?: () => void;
  gymId?: string;  // For gym leaders
}

export class NPC {
  private sprite: Phaser.GameObjects.Sprite;
  private scene: Phaser.Scene;
  public type: NPCType;
  public name: string;
  public dialogue: string[];
  public onInteract?: () => void;
  public gymId?: string;

  constructor(config: NPCConfig) {
    this.scene = config.scene;
    this.type = config.type;
    this.name = config.name;
    this.dialogue = config.dialogue;
    this.onInteract = config.onInteract;
    this.gymId = config.gymId;

    // Create sprite from Pokemon FireRed/LeafGreen NPC spritesheet
    // Map NPC types to frame numbers (identified from sprite sheet at threshold 70)
    const npcFrames: Record<NPCType, number> = {
      professor: 40,     // Professor Oak style character (lab coat, scholarly)
      clerk: 567,        // Store clerk style (PokeMart uniform)
      trader: 381,       // Trader style character (businessman/merchant)
      nurse: 163,        // Nurse Joy style (pink/white uniform)
      gym_leader: 398,   // Gym leader style (trainer/athletic)
    };

    this.sprite = this.scene.add.sprite(
      config.x,
      config.y,
      'npcs',
      npcFrames[this.type]
    );

    // Add physics if needed
    this.scene.physics.add.existing(this.sprite, true); // true = static body
  }

  public getSprite(): Phaser.GameObjects.Sprite {
    return this.sprite;
  }

  public interact(): void {
    if (this.onInteract) {
      this.onInteract();
    }
  }

  public isNearPlayer(player: Phaser.GameObjects.GameObject, distance: number = 20): boolean {
    const playerPos = player as any;
    const dx = this.sprite.x - playerPos.x;
    const dy = this.sprite.y - playerPos.y;
    return Math.sqrt(dx * dx + dy * dy) < distance;
  }

  public destroy(): void {
    this.sprite.destroy();
  }
}
