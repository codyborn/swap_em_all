import * as Phaser from 'phaser';
import { Badge } from '@/lib/types/battle';

export class BadgesScene extends Phaser.Scene {
  private menuText?: Phaser.GameObjects.Text;
  private prevMenuText?: Phaser.GameObjects.Text;
  private nextMenuText?: Phaser.GameObjects.Text;

  constructor() {
    super('BadgesScene');
  }

  create() {
    const centerX = this.cameras.main.centerX;

    // Background
    this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x0f380f)
      .setOrigin(0);

    // Title
    this.add.text(
      centerX,
      8,
      'BADGES',
      {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#9bbc0f',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 1,
      }
    ).setOrigin(0.5);

    // Divider
    this.add.rectangle(0, 24, this.cameras.main.width, 1, 0x9bbc0f).setOrigin(0);

    // Menu text
    this.menuText = this.add.text(
      8,
      32,
      '',
      {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#9bbc0f',
        lineSpacing: 2,
      }
    );

    // Navigation hints
    this.prevMenuText = this.add.text(
      4,
      20,
      '← Inventory',
      {
        fontFamily: 'monospace',
        fontSize: '7px',
        color: '#306230',
      }
    ).setOrigin(0, 0.5);

    this.nextMenuText = this.add.text(
      this.cameras.main.width - 4,
      20,
      'Cryptodex →',
      {
        fontFamily: 'monospace',
        fontSize: '7px',
        color: '#306230',
      }
    ).setOrigin(1, 0.5);

    // Instructions at bottom
    this.add.text(
      8,
      this.cameras.main.height - 12,
      '←/→: Switch Menu  ESC: Exit',
      {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#306230',
      }
    );

    // Show badges
    this.showBadges();

    // Set up input
    this.input.keyboard?.on('keydown-LEFT', () => this.switchToInventory());
    this.input.keyboard?.on('keydown-RIGHT', () => this.switchToCryptodex());
    this.input.keyboard?.on('keydown-ESC', () => this.exitBadges());
  }

  private showBadges() {
    const store = (window as any).gameStore?.getState();
    if (!store) return;

    const badges: Badge[] = store.badges || [];
    const gymsDefeated: string[] = store.gymsDefeated || [];

    const lines: string[] = [];
    lines.push(`Badges: ${badges.length}/8`);
    lines.push('');

    if (badges.length === 0) {
      lines.push('No badges earned yet!');
      lines.push('');
      lines.push('Challenge gym leaders to');
      lines.push('earn badges!');
    } else {
      // Sort badges by order
      const sortedBadges = [...badges].sort((a, b) => a.order - b.order);

      sortedBadges.forEach((badge) => {
        lines.push(`${badge.icon} ${badge.name}`);
        lines.push(`  ${badge.gymName}`);
        lines.push(`  Leader: ${badge.gymLeader}`);

        if (badge.earnedAt) {
          const date = new Date(badge.earnedAt).toLocaleDateString();
          lines.push(`  Earned: ${date}`);
        }

        lines.push('');
      });

      lines.push(`Gyms Defeated: ${gymsDefeated.length}/8`);
    }

    this.menuText?.setText(lines.join('\n'));
  }

  private switchToInventory() {
    // Clean up input
    this.input.keyboard?.off('keydown-LEFT');
    this.input.keyboard?.off('keydown-RIGHT');
    this.input.keyboard?.off('keydown-ESC');

    // Stop this scene and launch inventory
    this.scene.stop();
    this.scene.launch('BagScene');
  }

  private switchToCryptodex() {
    // Clean up input
    this.input.keyboard?.off('keydown-LEFT');
    this.input.keyboard?.off('keydown-RIGHT');
    this.input.keyboard?.off('keydown-ESC');

    // Stop this scene and launch cryptodex
    this.scene.stop();
    this.scene.launch('CryptodexScene');
  }

  private exitBadges() {
    this.cameras.main.fade(300, 15, 56, 15);

    this.time.delayedCall(300, () => {
      // Clean up input
      this.input.keyboard?.off('keydown-LEFT');
      this.input.keyboard?.off('keydown-RIGHT');
      this.input.keyboard?.off('keydown-ESC');

      this.scene.stop();
      this.scene.resume('OverworldScene');
    });
  }

  shutdown() {
    this.input.keyboard?.off('keydown-LEFT');
    this.input.keyboard?.off('keydown-RIGHT');
    this.input.keyboard?.off('keydown-ESC');
  }
}
