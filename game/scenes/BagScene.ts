import * as Phaser from 'phaser';
import { CaughtToken } from '@/lib/types/token';

interface ItemInfo {
  name: string;
  description: string;
  effect: string;
}

interface BagSceneData {
  callingScene?: string;
}

export class BagScene extends Phaser.Scene {
  private menuText?: Phaser.GameObjects.Text;
  private selectedOption = 0;
  private currentState: 'item_menu' | 'token_menu' | 'processing' = 'item_menu';
  private selectedItemType?: string;
  private availableTokens: CaughtToken[] = [];
  private availableItems: Array<{ type: string; name: string; count: number; desc: string }> = [];
  private prevMenuText?: Phaser.GameObjects.Text;
  private nextMenuText?: Phaser.GameObjects.Text;
  private callingScene: string = 'OverworldScene'; // Default for backwards compatibility

  constructor() {
    super('BagScene');
  }

  create(data: BagSceneData = {}) {
    // Track which scene launched us
    if (data.callingScene) {
      this.callingScene = data.callingScene;
    }
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    // Background
    this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x0f380f)
      .setOrigin(0);

    // Title
    this.add.text(
      centerX,
      8,
      'INVENTORY',
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

    // Menu text (starts visible)
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
      '← Cryptodex',
      {
        fontFamily: 'monospace',
        fontSize: '7px',
        color: '#306230',
      }
    ).setOrigin(0, 0.5);

    this.nextMenuText = this.add.text(
      this.cameras.main.width - 4,
      20,
      'Badges →',
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
      '↑/↓: Select  ENTER: Use  ←/→: Switch Menu  ESC: Exit',
      {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#306230',
      }
    );

    // Initialize selection
    this.selectedOption = 0;

    // Show menu immediately
    this.showItemMenu();

    // Set up input
    this.input.keyboard?.on('keydown-UP', () => this.moveSelection(-1));
    this.input.keyboard?.on('keydown-DOWN', () => this.moveSelection(1));
    this.input.keyboard?.on('keydown-ENTER', () => this.confirmSelection());
    this.input.keyboard?.on('keydown-SPACE', () => this.confirmSelection());
    this.input.keyboard?.on('keydown-ESC', () => this.handleBack());
    this.input.keyboard?.on('keydown-LEFT', () => this.switchToCryptodex());
    this.input.keyboard?.on('keydown-RIGHT', () => this.switchToBadges());
  }

  private showItemMenu() {
    this.currentState = 'item_menu';

    const store = (window as any).gameStore?.getState();
    if (!store) return;

    const items = store.items;
    const usdc = store.usdc || 0;
    const pokeballs = store.pokeballs || 0;

    const allItems = [
      { type: 'potions', name: 'Potion', count: items.potions, desc: 'Restore 20 HP' },
      { type: 'superPotions', name: 'Super Potion', count: items.superPotions, desc: 'Restore 50 HP' },
      { type: 'hyperPotions', name: 'Hyper Potion', count: items.hyperPotions, desc: 'Restore 100 HP' },
      { type: 'maxPotions', name: 'Max Potion', count: items.maxPotions, desc: 'Fully restore HP' },
      { type: 'revives', name: 'Revive', count: items.revives, desc: 'Revive to 50% HP' },
      { type: 'maxRevives', name: 'Max Revive', count: items.maxRevives, desc: 'Revive to 100% HP' },
    ];

    // Filter to only show items with count > 0
    this.availableItems = allItems.filter((item) => item.count > 0);

    const header = `USDC: ${usdc}  |  Balls: ${pokeballs}\n\n`;

    if (this.availableItems.length === 0) {
      this.menuText?.setText(header + 'No items!\n\n> Exit');
      this.selectedOption = 0;
      return;
    }

    // Clamp selectedOption to valid range
    const maxIndex = this.availableItems.length; // items + exit
    if (this.selectedOption > maxIndex) {
      this.selectedOption = 0;
    }

    const menuOptions = this.availableItems.map((item, i) => {
      const prefix = i === this.selectedOption ? '>' : ' ';
      return `${prefix} ${item.name} x${item.count}`;
    });
    menuOptions.push(`${this.availableItems.length === this.selectedOption ? '>' : ' '} Exit`);

    this.menuText?.setText(header + menuOptions.join('\n'));
  }

  private showTokenMenu() {
    this.currentState = 'token_menu';
    const store = (window as any).gameStore?.getState();
    if (!store) return;

    const inventory: CaughtToken[] = store.inventory;

    // Filter tokens based on item type
    const isReviveItem = this.selectedItemType?.includes('revive');

    if (isReviveItem) {
      // Show only knocked out tokens
      this.availableTokens = inventory.filter((t: CaughtToken) => t.isKnockedOut);
    } else {
      // Show only injured tokens (not knocked out, but not at full HP)
      this.availableTokens = inventory.filter(
        (t: CaughtToken) => !t.isKnockedOut && t.health < t.maxHealth
      );
    }

    if (this.availableTokens.length === 0) {
      const message = isReviveItem
        ? 'No tokens need revival!'
        : 'No tokens need healing!';

      this.menuText?.setText(message);
      this.time.delayedCall(1500, () => {
        this.selectedOption = 0;
        this.showItemMenu();
      });
      return;
    }

    // Clamp selectedOption to valid range
    const maxIndex = this.availableTokens.length; // tokens + back
    if (this.selectedOption > maxIndex) {
      this.selectedOption = 0;
    }

    const menuOptions = this.availableTokens.map((token, i) => {
      const prefix = i === this.selectedOption ? '>' : ' ';
      const healthBar = this.getHealthBar(token.health, token.maxHealth);
      return `${prefix} ${token.symbol} Lv.${token.level} ${healthBar}`;
    });
    menuOptions.push(`${this.availableTokens.length === this.selectedOption ? '>' : ' '} Back`);

    this.menuText?.setText(menuOptions.join('\n'));
  }

  private getHealthBar(current: number, max: number): string {
    if (current === 0) return '[----]';

    const percent = (current / max) * 100;
    const bars = Math.ceil(percent / 25); // 4 bars max

    const filled = '█'.repeat(Math.max(0, bars));
    const empty = '░'.repeat(Math.max(0, 4 - bars));

    return `[${filled}${empty}]`;
  }

  private moveSelection(direction: number) {
    if (this.currentState === 'processing') return;

    let maxOptions = 0;

    if (this.currentState === 'item_menu') {
      maxOptions = this.availableItems.length + 1; // available items + exit
    } else if (this.currentState === 'token_menu') {
      maxOptions = this.availableTokens.length + 1; // tokens + back
    }

    this.selectedOption = (this.selectedOption + direction + maxOptions) % maxOptions;

    // Re-render menu
    if (this.currentState === 'item_menu') {
      this.showItemMenu();
    } else if (this.currentState === 'token_menu') {
      this.showTokenMenu();
    }
  }

  private confirmSelection() {
    if (this.currentState === 'processing') return;

    if (this.currentState === 'item_menu') {
      this.handleItemSelection();
    } else if (this.currentState === 'token_menu') {
      this.handleTokenSelection();
    }
  }

  private handleItemSelection() {
    // Exit option
    if (this.selectedOption === this.availableItems.length) {
      this.exitBag();
      return;
    }

    const store = (window as any).gameStore?.getState();
    if (!store) return;

    const selectedItem = this.availableItems[this.selectedOption];
    if (!selectedItem) {
      return;
    }

    const selectedType = selectedItem.type;
    const count = store.items[selectedType];

    if (count === 0) {
      this.menuText?.setText('You don\'t have any of this item!');
      this.time.delayedCall(1500, () => {
        this.showItemMenu();
      });
      return;
    }

    this.selectedItemType = selectedType;
    this.showTokenMenu();
  }

  private handleTokenSelection() {
    // Back option
    if (this.selectedOption === this.availableTokens.length) {
      this.showItemMenu();
      return;
    }

    const token = this.availableTokens[this.selectedOption];
    const store = (window as any).gameStore;

    if (!store || !this.selectedItemType) return;

    this.currentState = 'processing';

    // Use the item
    const success = store.getState().useItem(this.selectedItemType, token.address);

    if (success) {
      const itemNames: Record<string, string> = {
        potions: 'Potion',
        superPotions: 'Super Potion',
        hyperPotions: 'Hyper Potion',
        maxPotions: 'Max Potion',
        revives: 'Revive',
        maxRevives: 'Max Revive',
      };

      const isRevive = this.selectedItemType.includes('revive');
      const message = isRevive
        ? `${token.symbol} was revived!`
        : `${token.symbol} was healed!`;

      this.menuText?.setText(message);

      // Flash effect
      this.cameras.main.flash(300, 155, 188, 15);

      this.time.delayedCall(1500, () => {
        this.currentState = 'item_menu';
        this.showItemMenu();
      });
    } else {
      this.menuText?.setText('Failed to use item!');
      this.time.delayedCall(1500, () => {
        this.currentState = 'token_menu';
        this.showTokenMenu();
      });
    }
  }

  private handleBack() {
    if (this.currentState === 'processing') return;

    if (this.currentState === 'token_menu') {
      this.showItemMenu();
    } else if (this.currentState === 'item_menu') {
      this.exitBag();
    }
  }

  private switchToBadges() {
    if (this.currentState === 'processing') return;

    // Clean up input
    this.input.keyboard?.off('keydown-UP');
    this.input.keyboard?.off('keydown-DOWN');
    this.input.keyboard?.off('keydown-ENTER');
    this.input.keyboard?.off('keydown-SPACE');
    this.input.keyboard?.off('keydown-ESC');
    this.input.keyboard?.off('keydown-LEFT');
    this.input.keyboard?.off('keydown-RIGHT');

    // Stop this scene and launch badges
    this.scene.stop();
    this.scene.launch('BadgesScene', { callingScene: this.callingScene });
  }

  private switchToCryptodex() {
    if (this.currentState === 'processing') return;

    // Clean up input
    this.input.keyboard?.off('keydown-UP');
    this.input.keyboard?.off('keydown-DOWN');
    this.input.keyboard?.off('keydown-ENTER');
    this.input.keyboard?.off('keydown-SPACE');
    this.input.keyboard?.off('keydown-ESC');
    this.input.keyboard?.off('keydown-LEFT');
    this.input.keyboard?.off('keydown-RIGHT');

    // Stop this scene and launch cryptodex
    this.scene.stop();
    this.scene.launch('CryptodexScene', { callingScene: this.callingScene });
  }

  private exitBag() {
    this.cameras.main.fade(300, 15, 56, 15);

    this.time.delayedCall(300, () => {
      // Clean up input
      this.input.keyboard?.off('keydown-UP');
      this.input.keyboard?.off('keydown-DOWN');
      this.input.keyboard?.off('keydown-ENTER');
      this.input.keyboard?.off('keydown-SPACE');
      this.input.keyboard?.off('keydown-ESC');
      this.input.keyboard?.off('keydown-LEFT');
      this.input.keyboard?.off('keydown-RIGHT');

      this.scene.stop();
      this.scene.resume(this.callingScene);
    });
  }
}
