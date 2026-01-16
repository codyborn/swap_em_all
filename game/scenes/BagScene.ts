import * as Phaser from 'phaser';
import { CaughtToken } from '@/lib/types/token';

interface ItemInfo {
  name: string;
  description: string;
  effect: string;
}

export class BagScene extends Phaser.Scene {
  private dialogText?: Phaser.GameObjects.Text;
  private menuText?: Phaser.GameObjects.Text;
  private selectedOption = 0;
  private currentState: 'item_menu' | 'token_menu' | 'processing' = 'item_menu';
  private selectedItemType?: string;
  private availableTokens: CaughtToken[] = [];

  constructor() {
    super('BagScene');
  }

  create() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    // Background
    this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x4A5568)
      .setOrigin(0);

    // Bag icon (simple rectangle for now)
    this.add.rectangle(centerX, centerY - 40, 24, 24, 0x8B4513);
    this.add.text(centerX, centerY - 40, 'BAG', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 1,
    }).setOrigin(0.5);

    // Dialog box
    this.add.rectangle(
      0,
      this.cameras.main.height - 50,
      this.cameras.main.width,
      50,
      0x000000,
      0.8
    ).setOrigin(0);

    // Welcome message
    this.dialogText = this.add.text(
      8,
      this.cameras.main.height - 45,
      'Your Bag\nSelect an item to use.',
      {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#9bbc0f',
        lineSpacing: 2,
      }
    );

    // Menu (initially hidden)
    this.menuText = this.add.text(
      8,
      this.cameras.main.height - 45,
      '',
      {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#9bbc0f',
        lineSpacing: 2,
      }
    ).setVisible(false);

    // Show menu after delay
    this.time.delayedCall(1000, () => {
      this.showItemMenu();
    });

    // Set up input
    this.input.keyboard?.on('keydown-UP', () => this.moveSelection(-1));
    this.input.keyboard?.on('keydown-DOWN', () => this.moveSelection(1));
    this.input.keyboard?.on('keydown-ENTER', () => this.confirmSelection());
    this.input.keyboard?.on('keydown-SPACE', () => this.confirmSelection());
    this.input.keyboard?.on('keydown-ESC', () => this.handleBack());
  }

  private showItemMenu() {
    this.currentState = 'item_menu';
    this.dialogText?.setVisible(false);
    this.menuText?.setVisible(true);

    const store = (window as any).gameStore?.getState();
    if (!store) return;

    const items = store.items;

    const itemList = [
      { type: 'potions', name: 'Potion', count: items.potions, desc: 'Restore 20 HP' },
      { type: 'superPotions', name: 'Super Potion', count: items.superPotions, desc: 'Restore 50 HP' },
      { type: 'hyperPotions', name: 'Hyper Potion', count: items.hyperPotions, desc: 'Restore 100 HP' },
      { type: 'maxPotions', name: 'Max Potion', count: items.maxPotions, desc: 'Fully restore HP' },
      { type: 'revives', name: 'Revive', count: items.revives, desc: 'Revive to 50% HP' },
      { type: 'maxRevives', name: 'Max Revive', count: items.maxRevives, desc: 'Revive to 100% HP' },
    ];

    const menuOptions = itemList.map((item, i) => {
      const prefix = i === this.selectedOption ? '>' : ' ';
      return `${prefix} ${item.name} x${item.count}`;
    });
    menuOptions.push(`${itemList.length === this.selectedOption ? '>' : ' '} Close Bag`);

    this.menuText?.setText(menuOptions.join('\n'));

    this.selectedOption = 0;
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

      this.showMessage(message);
      this.time.delayedCall(1500, () => this.showItemMenu());
      return;
    }

    const menuOptions = this.availableTokens.map((token, i) => {
      const prefix = i === this.selectedOption ? '>' : ' ';
      const healthBar = this.getHealthBar(token.health, token.maxHealth);
      return `${prefix} ${token.symbol} Lv.${token.level} ${healthBar}`;
    });
    menuOptions.push(`${this.availableTokens.length === this.selectedOption ? '>' : ' '} Back`);

    this.menuText?.setText(menuOptions.join('\n'));
    this.selectedOption = 0;
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

    const store = (window as any).gameStore?.getState();
    if (!store) return;

    let maxOptions = 0;

    if (this.currentState === 'item_menu') {
      maxOptions = 7; // 6 items + exit
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
    const itemTypes = ['potions', 'superPotions', 'hyperPotions', 'maxPotions', 'revives', 'maxRevives'];

    // Exit option
    if (this.selectedOption === itemTypes.length) {
      this.exitBag();
      return;
    }

    const store = (window as any).gameStore?.getState();
    if (!store) return;

    const selectedType = itemTypes[this.selectedOption];
    const count = store.items[selectedType];

    if (count === 0) {
      this.showMessage('You don\'t have any of this item!');
      this.time.delayedCall(1500, () => {
        this.dialogText?.setVisible(false);
        this.menuText?.setVisible(true);
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

      this.showMessage(message);

      // Flash effect
      this.cameras.main.flash(300, 155, 188, 15);

      this.time.delayedCall(1500, () => {
        this.currentState = 'item_menu';
        this.showItemMenu();
      });
    } else {
      this.showMessage('Failed to use item!');
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

  private showMessage(message: string) {
    this.menuText?.setVisible(false);
    this.dialogText?.setVisible(true).setText(message);
  }

  private exitBag() {
    this.cameras.main.fade(300, 74, 85, 104);

    this.time.delayedCall(300, () => {
      // Clean up input
      this.input.keyboard?.off('keydown-UP');
      this.input.keyboard?.off('keydown-DOWN');
      this.input.keyboard?.off('keydown-ENTER');
      this.input.keyboard?.off('keydown-SPACE');
      this.input.keyboard?.off('keydown-ESC');

      this.scene.stop();
      this.scene.resume('OverworldScene');
    });
  }
}
