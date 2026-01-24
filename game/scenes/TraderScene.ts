import * as Phaser from "phaser";
import {
  CaughtToken,
  getTokenType,
  getBaseStats,
  DEFAULT_MOVES,
} from "../../lib/types/token";

interface StatsAPICapture {
  captureId: string;
  token: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
  };
  amountCaptured: string;
  purchasePrice: string;
  currentPrice: string;
  profitLoss: string;
  profitLossPercent: string;
  capturedAt: string;
  priceHistory: Array<{ price: number; timestamp: number }>;
}

interface StatsAPIResponse {
  totalCaptures: number;
  totalValue: string;
  totalProfitLoss: string;
  totalProfitLossPercent: string;
  captures: StatsAPICapture[];
}

export class TraderScene extends Phaser.Scene {
  private dialogText?: Phaser.GameObjects.Text;
  private menuText?: Phaser.GameObjects.Text;
  private selectedOption = 0;
  private inventory: CaughtToken[] = [];
  private currentState: "menu" | "confirm" | "loading" = "loading";
  private tokenToSell?: CaughtToken;
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

    // Load inventory from stats cache (same as Cryptodex)
    this.loadInventoryFromCache();

    // Show loading message
    this.dialogText = this.add.text(
      8,
      this.cameras.main.height - 45,
      "Loading tokens...",
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
    this.menuText.setVisible(false);

    // Set up input
    this.input.keyboard?.on("keydown-UP", () => this.moveSelection(-1));
    this.input.keyboard?.on("keydown-DOWN", () => this.moveSelection(1));
    this.input.keyboard?.on("keydown-ENTER", () => this.confirmSelection());
    this.input.keyboard?.on("keydown-SPACE", () => this.confirmSelection());
    this.input.keyboard?.on("keydown-ESC", () => this.handleEscape());
  }

  private async loadInventoryFromCache() {
    try {
      // Get game store
      const gameStore = (window as any).gameStore;
      if (!gameStore) {
        console.warn("[TraderScene] Game store not available");
        this.showNoTokensMessage();
        return;
      }

      const state = gameStore.getState();
      const walletAddress = state.walletAddress;

      if (!walletAddress) {
        console.warn("[TraderScene] No wallet address found");
        this.showNoTokensMessage();
        return;
      }

      // Check if we have cached stats
      const cachedData = state.statsCache?.data;
      const lastFetched = state.statsCache?.lastFetched;
      const cacheAge = lastFetched ? Date.now() - lastFetched : Infinity;
      const cacheMaxAge = 5 * 60 * 1000; // 5 minutes

      let data: StatsAPIResponse;

      if (cachedData && cacheAge < cacheMaxAge) {
        // Use cached data
        console.log(
          `[TraderScene] Using cached stats (${Math.floor(cacheAge / 1000)}s old)`,
        );
        data = cachedData;
      } else {
        // Cache miss or stale, fetch fresh data
        console.log("[TraderScene] Cache miss or stale, fetching fresh stats");
        await state.fetchAndCacheStats();

        // Get the newly cached data
        const updatedState = gameStore.getState();
        data = updatedState.statsCache?.data;

        if (!data) {
          console.error("[TraderScene] Failed to fetch stats");
          this.showNoTokensMessage();
          return;
        }
      }

      // Transform API captures into CaughtToken format
      this.inventory = data.captures.map((capture) =>
        this.transformAPIToken(capture),
      );

      console.log(
        `[TraderScene] Loaded ${this.inventory.length} tokens from cache`,
      );

      // Show appropriate UI
      if (this.inventory.length === 0) {
        this.showNoTokensMessage();
      } else {
        this.showWelcomeMessage();
      }
    } catch (error) {
      console.error("[TraderScene] Error loading tokens:", error);
      this.showNoTokensMessage();
    }
  }

  private transformAPIToken(capture: StatsAPICapture): CaughtToken {
    const tokenType = getTokenType(capture.token.symbol);
    const baseStats = getBaseStats(tokenType);
    const purchasePrice = parseFloat(capture.purchasePrice);
    const currentPrice = parseFloat(capture.currentPrice);
    const capturedAt = new Date(capture.capturedAt).getTime();

    // Create token with defaults
    const level = 5;
    const maxHealth = (baseStats.hp || 50) + level * 2;

    return {
      // Core identity
      symbol: capture.token.symbol,
      name: capture.token.name,
      address: capture.token.address,
      caughtAt: capturedAt,

      // Price tracking
      purchasePrice,
      currentPrice,
      peakPrice: Math.max(purchasePrice, currentPrice),
      maxGain:
        currentPrice > purchasePrice
          ? (currentPrice - purchasePrice) / purchasePrice
          : 0,
      lastPriceUpdate: Date.now(),
      priceHistory: capture.priceHistory,

      // Leveling
      level,
      maxLevel: 100,
      experience: 0,

      // Health
      health: maxHealth,
      maxHealth,
      isKnockedOut: false,
      lastHealthUpdate: Date.now(),

      // Battle stats
      stats: {
        attack: (baseStats.attack || 10) + level,
        defense: (baseStats.defense || 10) + level,
        speed: (baseStats.speed || 10) + level,
        hp: maxHealth,
      },

      // Moves
      moves: DEFAULT_MOVES.filter((m) => m.learnedAt <= level),

      // Metadata
      rarity: "common",
      type: tokenType,
      description: `A ${tokenType} token captured on-chain.`,

      // History
      levelHistory: [
        {
          level,
          price: purchasePrice,
          timestamp: capturedAt,
          event: "caught",
        },
      ],
    };
  }

  private showNoTokensMessage() {
    this.currentState = "menu";
    this.dialogText?.setText(
      "You don't have any tokens\nto trade! Come back when\nyou've caught some!",
    );

    this.time.delayedCall(2500, () => {
      this.exitTrader();
    });
  }

  private showWelcomeMessage() {
    this.currentState = "menu";
    this.dialogText?.setText(
      "Welcome to the Token Trader!\nI buy tokens for USDC.\nWhich one to sell?",
    );

    this.time.delayedCall(1500, () => {
      this.showInventoryMenu();
    });
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

        // Reload inventory from cache (in case it changed)
        await this.loadInventoryFromCache();

        // Show menu again if we have tokens
        if (this.inventory.length > 0) {
          this.dialogText?.setVisible(false);
          this.menuText?.setVisible(true);
          this.updateMenuOptions();
        }
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

        // Clear stats cache so next load will fetch fresh data
        gameStore.getState().clearStatsCache();

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

    this.time.delayedCall(3000, async () => {
      // Go back to menu
      this.currentState = "menu";
      this.selectedOption = 0;
      this.tokenToSell = undefined;

      // Reload inventory from cache
      await this.loadInventoryFromCache();

      // Show menu again if we have tokens
      if (this.inventory.length > 0) {
        this.dialogText?.setVisible(false);
        this.menuText?.setVisible(true);
        this.updateMenuOptions();
      }
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
