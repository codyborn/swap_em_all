import * as Phaser from 'phaser';

interface StoreItem {
  name: string;
  price: number;
  itemType?: keyof any; // Will be typed properly with GameState['items']
  pokeballAmount?: number;
}

export class StoreScene extends Phaser.Scene {
  private dialogText?: Phaser.GameObjects.Text;
  private menuText?: Phaser.GameObjects.Text;
  private selectedOption = 0;
  private storeItems: StoreItem[] = [];

  constructor() {
    super('StoreScene');
  }

  create() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    // Background
    this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x306230)
      .setOrigin(0);

    // Store clerk NPC (placeholder)
    this.add.rectangle(centerX, centerY - 40, 16, 16, 0x228B22);

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
      'Welcome to the Pokeball Store!\nHow many would you like?\n(1 USDC each)',
      {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#9bbc0f',
        lineSpacing: 2,
      }
    );

    // Menu options (initially empty)
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
    );

    // Hide menu initially
    this.menuText.setVisible(false);

    this.showMainMenu();

    // Set up input
    this.input.keyboard?.on('keydown-UP', () => this.moveSelection(-1));
    this.input.keyboard?.on('keydown-DOWN', () => this.moveSelection(1));
    this.input.keyboard?.on('keydown-ENTER', () => this.confirmSelection());
    this.input.keyboard?.on('keydown-SPACE', () => this.confirmSelection());
    this.input.keyboard?.on('keydown-ESC', () => this.exitStore());
  }

  private showMainMenu() {
    this.dialogText?.setText(
      'Welcome to the Store!\nWhat would you like to buy?'
    );

    // Define all store items
    this.storeItems = [
      { name: 'Pokeball x1', price: 1, pokeballAmount: 1 },
      { name: 'Pokeball x5', price: 5, pokeballAmount: 5 },
      { name: 'Potion', price: 5, itemType: 'potions' },
      { name: 'Super Potion', price: 15, itemType: 'superPotions' },
      { name: 'Hyper Potion', price: 40, itemType: 'hyperPotions' },
      { name: 'Max Potion', price: 100, itemType: 'maxPotions' },
      { name: 'Revive', price: 50, itemType: 'revives' },
      { name: 'Max Revive', price: 200, itemType: 'maxRevives' },
    ];

    // Wait a moment then show options
    this.time.delayedCall(1500, () => {
      this.dialogText?.setVisible(false);
      this.menuText?.setVisible(true);
      this.updateMenuOptions();
    });
  }

  private updateMenuOptions() {
    const options = this.storeItems.map((item, i) =>
      `${i === this.selectedOption ? '>' : ' '} ${item.name} (${item.price} USDC)`
    );
    options.push(`${this.storeItems.length === this.selectedOption ? '>' : ' '} Exit Store`);

    this.menuText?.setText(options.join('\n'));
  }

  private moveSelection(direction: number) {
    const maxOptions = this.storeItems.length + 1; // +1 for exit
    this.selectedOption = (this.selectedOption + direction + maxOptions) % maxOptions;
    this.updateMenuOptions();
  }

  private confirmSelection() {
    // Exit option
    if (this.selectedOption === this.storeItems.length) {
      this.exitStore();
      return;
    }

    const item = this.storeItems[this.selectedOption];
    const gameStore = (window as any).gameStore;

    if (!gameStore) return;

    // Check if player can afford
    const canAfford = gameStore.getState().spendUSDC(item.price);

    if (!canAfford) {
      this.dialogText?.setVisible(true);
      this.menuText?.setVisible(false);
      this.dialogText?.setText(
        `Not enough USDC!\nYou need ${item.price} USDC.`
      );

      this.time.delayedCall(2000, () => {
        this.dialogText?.setVisible(false);
        this.menuText?.setVisible(true);
      });
      return;
    }

    // Purchase the item
    if (item.pokeballAmount) {
      gameStore.getState().addPokeballs(item.pokeballAmount);
    } else if (item.itemType) {
      gameStore.getState().addItem(item.itemType, 1);
    }

    this.dialogText?.setVisible(true);
    this.menuText?.setVisible(false);
    this.dialogText?.setText(
      `Purchased ${item.name}!\nThank you!`
    );

    this.time.delayedCall(2000, () => {
      this.exitStore();
    });
  }

  private exitStore() {
    this.cameras.main.fade(300, 48, 98, 48);

    this.time.delayedCall(300, () => {
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
