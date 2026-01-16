import * as Phaser from 'phaser';
import { CaughtToken } from '../../lib/types/token';
import { Badge } from '../../lib/types/battle';
import { DamageCalculator } from '../../lib/utils/damageCalculator';

type ViewMode = 'list' | 'detail' | 'badges';

export class CryptodexScene extends Phaser.Scene {
  private viewMode: ViewMode = 'list';
  private selectedTokenIndex: number = 0;
  private badgeScrollOffset: number = 0;

  // UI elements
  private container?: Phaser.GameObjects.Container;
  private titleText?: Phaser.GameObjects.Text;
  private contentText?: Phaser.GameObjects.Text;
  private instructionsText?: Phaser.GameObjects.Text;
  private tokenSprite?: Phaser.GameObjects.Sprite;
  private listSprites: Phaser.GameObjects.Sprite[] = [];

  constructor() {
    super('CryptodexScene');
  }

  create() {
    // Background
    this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x0f380f)
      .setOrigin(0);

    // Title
    this.titleText = this.add.text(
      this.cameras.main.centerX,
      8,
      'CRYPTODEX',
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

    // Instructions (will update based on view)
    this.instructionsText = this.add.text(
      8,
      this.cameras.main.height - 12,
      '',
      {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#306230',
      }
    );

    // Show initial view
    this.showListView();

    // Set up input
    this.setupInput();
  }

  private setupInput() {
    this.input.keyboard?.on('keydown-ESC', () => this.handleEscape());
    this.input.keyboard?.on('keydown-UP', () => this.handleUp());
    this.input.keyboard?.on('keydown-DOWN', () => this.handleDown());
    this.input.keyboard?.on('keydown-ENTER', () => this.handleEnter());
    this.input.keyboard?.on('keydown-B', () => this.handleBadgesToggle());
  }

  private handleEscape() {
    if (this.viewMode === 'detail') {
      // Return to list
      this.showListView();
    } else {
      // Exit Cryptodex
      this.exitCryptodex();
    }
  }

  private handleUp() {
    const store = (window as any).gameStore?.getState();
    if (!store) return;

    if (this.viewMode === 'list') {
      const inventory = store.inventory || [];
      if (inventory.length > 0) {
        this.selectedTokenIndex = (this.selectedTokenIndex - 1 + inventory.length) % inventory.length;
        this.showListView();
      }
    } else if (this.viewMode === 'badges') {
      this.badgeScrollOffset = Math.max(0, this.badgeScrollOffset - 1);
      this.showBadgesView();
    }
  }

  private handleDown() {
    const store = (window as any).gameStore?.getState();
    if (!store) return;

    if (this.viewMode === 'list') {
      const inventory = store.inventory || [];
      if (inventory.length > 0) {
        this.selectedTokenIndex = (this.selectedTokenIndex + 1) % inventory.length;
        this.showListView();
      }
    } else if (this.viewMode === 'badges') {
      const badges = store.badges || [];
      this.badgeScrollOffset = Math.min(badges.length - 1, this.badgeScrollOffset + 1);
      this.showBadgesView();
    }
  }

  private handleEnter() {
    if (this.viewMode === 'list') {
      const store = (window as any).gameStore?.getState();
      const inventory = store?.inventory || [];
      if (inventory.length > 0) {
        this.showDetailView();
      }
    } else if (this.viewMode === 'detail') {
      this.showListView();
    }
  }

  private handleBadgesToggle() {
    if (this.viewMode === 'badges') {
      this.showListView();
    } else {
      this.showBadgesView();
    }
  }

  private showListView() {
    this.viewMode = 'list';
    this.clearContent();

    const store = (window as any).gameStore?.getState();
    const inventory: CaughtToken[] = store?.inventory || [];
    const cryptodex = store?.cryptodex || new Set();

    if (this.titleText) {
      this.titleText.setText('CRYPTODEX');
    }

    // Stats
    const statsText = `Seen: ${cryptodex.size}  |  Owned: ${inventory.length}`;

    if (inventory.length === 0) {
      this.contentText = this.add.text(
        8,
        32,
        `${statsText}\n\nNo tokens caught yet!\n\nGo explore and catch some tokens!`,
        {
          fontFamily: 'monospace',
          fontSize: '9px',
          color: '#9bbc0f',
          lineSpacing: 2,
        }
      );
    } else {
      // Show list with selection and sprites
      const listItems = inventory.map((token: CaughtToken, i: number) => {
        const prefix = i === this.selectedTokenIndex ? '>' : ' ';
        const healthStatus = DamageCalculator.getHealthStatus(token.health, token.maxHealth);
        const levelInfo = `Lv.${token.level}`;
        return `${prefix}       ${token.symbol.padEnd(8)} ${levelInfo.padEnd(6)} ${healthStatus}`;
      });

      const content = `${statsText}\n\n${listItems.join('\n')}`;

      this.contentText = this.add.text(
        8,
        32,
        content,
        {
          fontFamily: 'monospace',
          fontSize: '9px',
          color: '#9bbc0f',
          lineSpacing: 2,
        }
      );

      // Add sprites next to each token in the list
      const startY = 32 + 20; // After stats text
      inventory.forEach((token: CaughtToken, i: number) => {
        const spriteKey = `token-${token.type}`;
        const sprite = this.add.sprite(18, startY + (i * 11), spriteKey);
        sprite.setScale(0.6);
        sprite.play(spriteKey + '-idle');
        this.listSprites.push(sprite);
      });
    }

    if (this.instructionsText) {
      this.instructionsText.setText('↑/↓: Select  ENTER: Details  B: Badges  ESC: Exit');
    }
  }

  private showDetailView() {
    this.viewMode = 'detail';
    this.clearContent();

    const store = (window as any).gameStore?.getState();
    const inventory: CaughtToken[] = store?.inventory || [];
    const token = inventory[this.selectedTokenIndex];

    if (!token) return;

    if (this.titleText) {
      this.titleText.setText(`${token.symbol} - ${token.name}`);
    }

    // Add animated token sprite
    const spriteKey = `token-${token.type}`;
    this.tokenSprite = this.add.sprite(this.cameras.main.width - 24, 40, spriteKey);
    this.tokenSprite.setScale(1.5);
    this.tokenSprite.play(spriteKey + '-idle');

    // Build detailed view
    const lines: string[] = [];

    // Basic info
    lines.push(`Type: ${token.type.toUpperCase()}`);
    lines.push(`Rarity: ${token.rarity.toUpperCase()}`);
    lines.push('');

    // Level and Health
    lines.push(`Level: ${token.level} (Max: ${token.maxLevel})`);
    const healthPercent = Math.floor((token.health / token.maxHealth) * 100);
    const healthBar = this.getHealthBar(token.health, token.maxHealth);
    lines.push(`HP: ${token.health}/${token.maxHealth} ${healthBar} ${healthPercent}%`);
    lines.push(`Status: ${DamageCalculator.getHealthStatus(token.health, token.maxHealth)}`);
    lines.push('');

    // Stats
    lines.push('Stats:');
    lines.push(`  ATK: ${token.stats.attack.toString().padEnd(4)} DEF: ${token.stats.defense}`);
    lines.push(`  SPD: ${token.stats.speed.toString().padEnd(4)} HP:  ${token.stats.hp}`);
    lines.push('');

    // Moves
    lines.push('Moves:');
    token.moves.forEach((move) => {
      lines.push(`  ${move.name}`);
      lines.push(`    Type: ${move.type} | PWR: ${move.power} | ACC: ${move.accuracy}%`);
    });
    lines.push('');

    // Price data
    const priceChange = ((token.currentPrice - token.purchasePrice) / token.purchasePrice * 100).toFixed(1);
    const priceChangeSign = parseFloat(priceChange) >= 0 ? '+' : '';
    lines.push('Market Data:');
    lines.push(`  Purchase: $${token.purchasePrice.toFixed(2)}`);
    lines.push(`  Current:  $${token.currentPrice.toFixed(2)} (${priceChangeSign}${priceChange}%)`);
    lines.push(`  Peak:     $${token.peakPrice.toFixed(2)}`);
    lines.push('');

    // Recent history (last 3 events)
    if (token.levelHistory && token.levelHistory.length > 0) {
      lines.push('Recent History:');
      const recentHistory = token.levelHistory.slice(-3).reverse();
      recentHistory.forEach((entry) => {
        const date = new Date(entry.timestamp).toLocaleDateString();
        const eventName = entry.event.replace('_', ' ').toUpperCase();
        lines.push(`  ${date} - ${eventName} (Lv.${entry.level})`);
      });
      lines.push('');
    }

    // Description
    if (token.description) {
      lines.push(`"${token.description}"`);
    }

    this.contentText = this.add.text(
      8,
      32,
      lines.join('\n'),
      {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#9bbc0f',
        lineSpacing: 1,
        wordWrap: { width: this.cameras.main.width - 16 },
      }
    );

    if (this.instructionsText) {
      this.instructionsText.setText('ESC/ENTER: Back to List');
    }
  }

  private showBadgesView() {
    this.viewMode = 'badges';
    this.clearContent();

    const store = (window as any).gameStore?.getState();
    const badges: Badge[] = store?.badges || [];
    const gymsDefeated: string[] = store?.gymsDefeated || [];

    if (this.titleText) {
      this.titleText.setText(`BADGE COLLECTION (${badges.length}/8)`);
    }

    const lines: string[] = [];

    if (badges.length === 0) {
      lines.push('No badges earned yet!\n');
      lines.push('Challenge gym leaders to earn badges!');
    } else {
      // Sort badges by order
      const sortedBadges = [...badges].sort((a, b) => a.order - b.order);

      sortedBadges.forEach((badge, index) => {
        if (index < this.badgeScrollOffset) return;
        if (index >= this.badgeScrollOffset + 4) return; // Show 4 at a time

        const prefix = index === this.badgeScrollOffset ? '>' : ' ';
        lines.push(`${prefix} ${badge.icon} ${badge.name}`);
        lines.push(`   ${badge.gymName}`);
        lines.push(`   Leader: ${badge.gymLeader}`);

        if (badge.earnedAt) {
          const date = new Date(badge.earnedAt).toLocaleDateString();
          lines.push(`   Earned: ${date}`);
        }

        lines.push('');
      });

      // Show progress
      lines.push('');
      lines.push(`Gyms Defeated: ${gymsDefeated.length}/8`);
    }

    this.contentText = this.add.text(
      8,
      32,
      lines.join('\n'),
      {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#9bbc0f',
        lineSpacing: 2,
      }
    );

    if (this.instructionsText) {
      this.instructionsText.setText('↑/↓: Scroll  B/ESC: Back to List');
    }
  }

  private getHealthBar(current: number, max: number): string {
    if (current === 0) return '[----]';
    const percent = (current / max) * 100;
    const bars = Math.ceil(percent / 25);
    const filled = '█'.repeat(Math.max(0, bars));
    const empty = '░'.repeat(Math.max(0, 4 - bars));
    return `[${filled}${empty}]`;
  }

  private clearContent() {
    if (this.contentText) {
      this.contentText.destroy();
      this.contentText = undefined;
    }
    if (this.tokenSprite) {
      this.tokenSprite.destroy();
      this.tokenSprite = undefined;
    }
    // Clear all list sprites
    this.listSprites.forEach(sprite => sprite.destroy());
    this.listSprites = [];
  }

  private exitCryptodex() {
    this.cameras.main.fade(300, 15, 56, 15);

    this.time.delayedCall(300, () => {
      // Clean up
      this.input.keyboard?.off('keydown-ESC');
      this.input.keyboard?.off('keydown-UP');
      this.input.keyboard?.off('keydown-DOWN');
      this.input.keyboard?.off('keydown-ENTER');
      this.input.keyboard?.off('keydown-B');

      this.scene.stop();
      this.scene.resume('OverworldScene');
    });
  }

  shutdown() {
    this.clearContent();
    this.input.keyboard?.off('keydown-ESC');
    this.input.keyboard?.off('keydown-UP');
    this.input.keyboard?.off('keydown-DOWN');
    this.input.keyboard?.off('keydown-ENTER');
    this.input.keyboard?.off('keydown-B');
  }
}
