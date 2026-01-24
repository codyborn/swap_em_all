import * as Phaser from "phaser";

export class TraderScene extends Phaser.Scene {
  private dialogText?: Phaser.GameObjects.Text;
  private menuText?: Phaser.GameObjects.Text;
  private selectedOption = 0;
  private inventory: any[] = [];
  private currentState: "menu" | "confirm" = "menu";
  private tokenToSell?: any;
  private callingScene: string = "OverworldScene"; // Default for backwards compatibility

  constructor() {
    super("TraderScene");
  }

  create(data?: { callingScene?: string }) {
    // Store the calling scene so we can resume it later
    if (data?.callingScene) {
      this.callingScene = data.callingScene;
    }
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    // Background
    this.add
      .rectangle(
        0,
        0,
        this.cameras.main.width,
        this.cameras.main.height,
        0x306230,
      )
      .setOrigin(0);

    // Trader NPC (placeholder)
    this.add.rectangle(centerX, centerY - 40, 16, 16, 0xff8c00);

    // Dialog box
    this.add
      .rectangle(
        0,
        this.cameras.main.height - 50,
        this.cameras.main.width,
        50,
        0x000000,
        0.8,
      )
      .setOrigin(0);

    // Load inventory
    const gameStore = (window as any).gameStore;
    if (gameStore) {
      this.inventory = gameStore.getState().inventory;
    }

    // Welcome message
    if (this.inventory.length === 0) {
      this.dialogText = this.add.text(
        8,
        this.cameras.main.height - 45,
        "You don't have any tokens\nto trade! Come back when\nyou've caught some!",
        {
          fontFamily: "monospace",
          fontSize: "8px",
          color: "#9bbc0f",
        },
      );

      this.time.delayedCall(2500, () => {
        this.exitTrader();
      });
    } else {
      this.dialogText = this.add.text(
        8,
        this.cameras.main.height - 45,
        "Welcome to the Token Trader!\nI buy tokens for USDC.\nWhich one to sell?",
        {
          fontFamily: "monospace",
          fontSize: "8px",
          color: "#9bbc0f",
        },
      );

      // Menu options (initially hidden)
      this.menuText = this.add.text(8, this.cameras.main.height - 45, "", {
        fontFamily: "monospace",
        fontSize: "8px",
        color: "#9bbc0f",
      });

      // Hide menu initially
      this.menuText.setVisible(false);

      this.time.delayedCall(1500, () => {
        this.showInventoryMenu();
      });

      // Set up input
      this.input.keyboard?.on("keydown-UP", () => this.moveSelection(-1));
      this.input.keyboard?.on("keydown-DOWN", () => this.moveSelection(1));
      this.input.keyboard?.on("keydown-ENTER", () => this.confirmSelection());
      this.input.keyboard?.on("keydown-SPACE", () => this.confirmSelection());
      this.input.keyboard?.on("keydown-ESC", () => this.handleEscape());
    }
  }

  private showInventoryMenu() {
    // Hide welcome message, show menu
    this.dialogText?.setVisible(false);
    this.menuText?.setVisible(true);
    this.updateMenuOptions();
  }

  private updateMenuOptions() {
    if (this.currentState === "menu") {
      // Show inventory with prices
      const options = this.inventory.map((token, i) => {
        const salePrice = Math.floor(token.currentPrice * 0.8);
        return `${i === this.selectedOption ? ">" : " "} ${token.symbol} (${token.name}) - ${salePrice} USDC`;
      });
      options.push(
        `${this.inventory.length === this.selectedOption ? ">" : " "} Exit Trader`,
      );
      this.menuText?.setText(options.join("\n"));
    } else if (this.currentState === "confirm") {
      // Show confirmation dialog
      const salePrice = Math.floor(this.tokenToSell.currentPrice * 0.8);
      const confirmOptions = [
        `Sell ${this.tokenToSell.symbol} for ${salePrice} USDC?`,
        "",
        `${this.selectedOption === 0 ? ">" : " "} Yes`,
        `${this.selectedOption === 1 ? ">" : " "} No`,
      ];
      this.menuText?.setText(confirmOptions.join("\n"));
    }
  }

  private moveSelection(direction: number) {
    if (this.currentState === "menu") {
      const maxOptions = this.inventory.length + 1; // +1 for exit option
      this.selectedOption =
        (this.selectedOption + direction + maxOptions) % maxOptions;
    } else if (this.currentState === "confirm") {
      const maxOptions = 2; // Yes/No
      this.selectedOption =
        (this.selectedOption + direction + maxOptions) % maxOptions;
    }
    this.updateMenuOptions();
  }

  private async confirmSelection() {
    if (this.currentState === "menu") {
      if (this.selectedOption === this.inventory.length) {
        // Exit option selected
        this.exitTrader();
        return;
      }

      // Token selected - show confirmation
      this.tokenToSell = this.inventory[this.selectedOption];
      this.currentState = "confirm";
      this.selectedOption = 0; // Default to "Yes"
      this.dialogText?.setVisible(false);
      this.updateMenuOptions();
    } else if (this.currentState === "confirm") {
      if (this.selectedOption === 0) {
        // Yes - sell the token via swap API
        await this.executeSell();
      } else {
        // No - go back to menu
        this.currentState = "menu";
        this.selectedOption = 0;
        this.tokenToSell = undefined;

        // Reload inventory (in case it changed)
        const gameStore = (window as any).gameStore;
        if (gameStore) {
          this.inventory = gameStore.getState().inventory;
        }

        // Show menu again
        this.dialogText?.setVisible(false);
        this.menuText?.setVisible(true);
        this.updateMenuOptions();
      }
    }
  }

  private async executeSell() {
    const swapBridge = (window as any).swapBridge;
    const gameStore = (window as any).gameStore;

    if (!swapBridge || !gameStore) {
      console.error("[TraderScene] SwapBridge or GameStore not available");
      this.showError("Swap system not available!");
      return;
    }

    // Hide menu, show swap progress
    this.menuText?.setVisible(false);
    this.dialogText?.setVisible(true);
    this.dialogText?.setText(
      `Selling ${this.tokenToSell.symbol}...\nPlease confirm in your wallet.`,
    );

    try {
      // Get token info - we need to calculate how much of the token to sell
      // For now, let's sell a small amount (0.01 tokens) as a proof of concept
      const tokenAmount = "0.01";
      const tokenDecimals = 18; // Most tokens use 18 decimals

      console.log("[TraderScene] Executing swap:", {
        tokenAddress: this.tokenToSell.address,
        tokenAmount,
        tokenDecimals,
      });

      // Execute the swap
      const result = await swapBridge.sellToken(
        this.tokenToSell.address,
        tokenDecimals,
        tokenAmount,
      );

      if (result.success) {
        const usdcReceived = result.amountOut || "0";
        const usdcAmount = parseFloat(usdcReceived);

        // Remove token from local inventory
        gameStore.getState().sellToken(this.tokenToSell.address);

        // Add USDC to balance
        if (usdcAmount > 0) {
          gameStore.getState().addUSDC(usdcAmount);
        }

        // Show success message
        this.dialogText?.setText(
          `Sold ${this.tokenToSell.symbol}!\nReceived ${usdcAmount.toFixed(2)} USDC.\nThank you!`,
        );

        this.time.delayedCall(2000, () => {
          this.exitTrader();
        });
      } else {
        // Show error
        const errorMsg = result.error || "Unknown error";
        this.showError(`Swap failed: ${errorMsg}`);
      }
    } catch (error) {
      console.error("[TraderScene] Sell error:", error);
      this.showError(
        error instanceof Error ? error.message : "Failed to sell token",
      );
    }
  }

  private showError(message: string) {
    this.menuText?.setVisible(false);
    this.dialogText?.setVisible(true);
    this.dialogText?.setText(message);

    this.time.delayedCall(3000, () => {
      // Go back to menu
      this.currentState = "menu";
      this.selectedOption = 0;
      this.tokenToSell = undefined;

      // Reload inventory
      const gameStore = (window as any).gameStore;
      if (gameStore) {
        this.inventory = gameStore.getState().inventory;
      }

      // Show menu again
      this.dialogText?.setVisible(false);
      this.menuText?.setVisible(true);
      this.updateMenuOptions();
    });
  }

  private handleEscape() {
    if (this.currentState === "confirm") {
      // Cancel confirmation, go back to menu
      this.currentState = "menu";
      this.selectedOption = 0;
      this.tokenToSell = undefined;
      this.dialogText?.setVisible(false);
      this.menuText?.setVisible(true);
      this.updateMenuOptions();
    } else {
      // Exit trader
      this.exitTrader();
    }
  }

  private exitTrader() {
    this.cameras.main.fade(300, 48, 98, 48);

    this.time.delayedCall(300, () => {
      this.input.keyboard?.off("keydown-UP");
      this.input.keyboard?.off("keydown-DOWN");
      this.input.keyboard?.off("keydown-ENTER");
      this.input.keyboard?.off("keydown-SPACE");
      this.input.keyboard?.off("keydown-ESC");

      this.scene.stop();
      this.scene.resume(this.callingScene);
    });
  }
}
