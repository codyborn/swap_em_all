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

    // Create sprite
    const spriteKeys: Record<NPCType, string> = {
      professor: 'npc-professor',
      clerk: 'npc-clerk',
      trader: 'npc-trader',
      nurse: 'npc-nurse',
      gym_leader: 'npc-gym',
    };

    this.sprite = this.scene.add.sprite(
      config.x,
      config.y,
      spriteKeys[this.type]
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
