import * as Phaser from 'phaser';
import { CaughtToken } from '@/lib/types/token';
import { DamageCalculator } from '@/lib/utils/damageCalculator';

export class HealingCenterScene extends Phaser.Scene {
  private dialogText?: Phaser.GameObjects.Text;
  private menuText?: Phaser.GameObjects.Text;
  private selectedOption = 0;
  private menuOptions: string[] = [];
  private currentState: 'main_menu' | 'revive_menu' | 'processing' = 'main_menu';
  private tokensToRevive: CaughtToken[] = [];

  constructor() {
    super('HealingCenterScene');
  }

  create() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    // Pink/purple background for healing center
    this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0xFFB6C1)
      .setOrigin(0);

    // Nurse NPC (placeholder - white rectangle for now)
    this.add.rectangle(centerX, centerY - 40, 16, 16, 0xFFFFFF);

    // Add a cross symbol above nurse
    this.add.text(centerX, centerY - 52, '+', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#FF0000',
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
      'Welcome to the Healing Center!\nHow can I help you?',
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
    this.time.delayedCall(1500, () => {
      this.showMainMenu();
    });

    // Set up input
    this.input.keyboard?.on('keydown-UP', () => this.moveSelection(-1));
    this.input.keyboard?.on('keydown-DOWN', () => this.moveSelection(1));
    this.input.keyboard?.on('keydown-ENTER', () => this.confirmSelection());
    this.input.keyboard?.on('keydown-SPACE', () => this.confirmSelection());
    this.input.keyboard?.on('keydown-ESC', () => this.exitCenter());
  }

  private showMainMenu() {
    this.currentState = 'main_menu';
    this.dialogText?.setVisible(false);
    this.menuText?.setVisible(true);

    const store = (window as any).gameStore?.getState();
    const knockedOutTokens = store?.inventory.filter((t: CaughtToken) => t.isKnockedOut) || [];
    const injuredTokens = store?.inventory.filter((t: CaughtToken) =>
      !t.isKnockedOut && t.health < t.maxHealth
    ) || [];

    this.menuOptions = [
      `Heal All (FREE) - ${injuredTokens.length} injured`,
      `Revive Token - ${knockedOutTokens.length} knocked out`,
      'Full Restore',
      'Exit',
    ];

    this.selectedOption = 0;
    this.updateMenuOptions();
  }

  private showReviveMenu() {
    this.currentState = 'revive_menu';
    const store = (window as any).gameStore?.getState();
    this.tokensToRevive = store?.inventory.filter((t: CaughtToken) => t.isKnockedOut) || [];

    if (this.tokensToRevive.length === 0) {
      this.showMessage('No tokens need revival!');
      this.time.delayedCall(1500, () => this.showMainMenu());
      return;
    }

    this.menuOptions = this.tokensToRevive.map((token) => {
      const cost = DamageCalculator.getRevivalCost(token.level);
      return `${token.symbol} Lv.${token.level} (${cost} USDC)`;
    });
    this.menuOptions.push('Back');

    this.selectedOption = 0;
    this.updateMenuOptions();
  }

  private updateMenuOptions() {
    const options = this.menuOptions.map((option, i) =>
      `${i === this.selectedOption ? '>' : ' '} ${option}`
    );

    this.menuText?.setText(options.join('\n'));
  }

  private moveSelection(direction: number) {
    if (this.currentState === 'processing') return;

    this.selectedOption = (this.selectedOption + direction + this.menuOptions.length) % this.menuOptions.length;
    this.updateMenuOptions();
  }

  private confirmSelection() {
    if (this.currentState === 'processing') return;

    if (this.currentState === 'main_menu') {
      this.handleMainMenuSelection();
    } else if (this.currentState === 'revive_menu') {
      this.handleReviveMenuSelection();
    }
  }

  private handleMainMenuSelection() {
    switch (this.selectedOption) {
      case 0: // Heal All
        this.healAll();
        break;
      case 1: // Revive Token
        this.showReviveMenu();
        break;
      case 2: // Full Restore
        this.fullRestore();
        break;
      case 3: // Exit
        this.exitCenter();
        break;
    }
  }

  private handleReviveMenuSelection() {
    if (this.selectedOption === this.menuOptions.length - 1) {
      // Back button
      this.showMainMenu();
      return;
    }

    const token = this.tokensToRevive[this.selectedOption];
    this.reviveToken(token);
  }

  private healAll() {
    const store = (window as any).gameStore;
    if (!store) return;

    this.currentState = 'processing';
    const inventory: CaughtToken[] = store.getState().inventory;
    let healedCount = 0;

    inventory.forEach((token: CaughtToken) => {
      if (!token.isKnockedOut && token.health < token.maxHealth) {
        store.getState().healToken(token.address, token.maxHealth);
        healedCount++;
      }
    });

    if (healedCount === 0) {
      this.showMessage('Your tokens are already\nat full health!');
    } else {
      this.showMessage(`Healed ${healedCount} token${healedCount > 1 ? 's' : ''}!\nYour tokens are feeling great!`);
    }

    this.time.delayedCall(2000, () => {
      this.exitCenter();
    });
  }

  private reviveToken(token: CaughtToken) {
    const store = (window as any).gameStore;
    if (!store) return;

    const cost = DamageCalculator.getRevivalCost(token.level);
    const canAfford = store.getState().spendUSDC(cost);

    this.currentState = 'processing';

    if (!canAfford) {
      this.showMessage(`Not enough USDC!\nNeed ${cost} USDC to revive.`);
      this.time.delayedCall(2000, () => {
        this.currentState = 'revive_menu';
        this.showReviveMenu();
      });
      return;
    }

    // Revive the token to 50% HP
    store.getState().reviveToken(token.address, 50);

    this.showMessage(`${token.symbol} has been revived!\nRestored to 50% HP.`);

    // Camera flash effect
    this.cameras.main.flash(300, 155, 188, 15);

    this.time.delayedCall(2000, () => {
      this.currentState = 'revive_menu';
      this.showReviveMenu();
    });
  }

  private fullRestore() {
    const store = (window as any).gameStore;
    if (!store) return;

    this.currentState = 'processing';
    const inventory: CaughtToken[] = store.getState().inventory;

    // Calculate total cost
    const knockedOutTokens = inventory.filter((t: CaughtToken) => t.isKnockedOut);
    const totalCost = knockedOutTokens.reduce((sum, token) =>
      sum + DamageCalculator.getRevivalCost(token.level), 0
    );

    // Apply 10% discount for batch
    const discountedCost = Math.floor(totalCost * 0.9);

    if (knockedOutTokens.length === 0) {
      // Just heal all
      this.healAll();
      return;
    }

    const canAfford = store.getState().spendUSDC(discountedCost);

    if (!canAfford) {
      this.showMessage(`Not enough USDC!\nNeed ${discountedCost} USDC\nfor Full Restore.`);
      this.time.delayedCall(2000, () => {
        this.currentState = 'main_menu';
        this.showMainMenu();
      });
      return;
    }

    // Revive all knocked out tokens
    knockedOutTokens.forEach((token: CaughtToken) => {
      store.getState().reviveToken(token.address, 50);
    });

    // Heal all remaining tokens
    inventory.forEach((token: CaughtToken) => {
      if (!token.isKnockedOut) {
        store.getState().healToken(token.address, token.maxHealth);
      }
    });

    this.showMessage(`Full Restore complete!\nAll tokens revived & healed!\n(Saved ${totalCost - discountedCost} USDC)`);

    // Camera flash effect
    this.cameras.main.flash(500, 155, 188, 15);

    this.time.delayedCall(3000, () => {
      this.exitCenter();
    });
  }

  private showMessage(message: string) {
    this.menuText?.setVisible(false);
    this.dialogText?.setVisible(true).setText(message);
  }

  private exitCenter() {
    this.cameras.main.fade(300, 255, 182, 193);

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
