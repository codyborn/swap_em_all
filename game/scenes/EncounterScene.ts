import * as Phaser from 'phaser';
import { getTokenType } from '@/lib/types/token';

interface EncounterData {
  tokenSymbol?: string;
  tokenName?: string;
  tokenAddress?: string;
  tokenRarity?: string;
  tokenPrice?: number;
  callingScene?: string;
}

export class EncounterScene extends Phaser.Scene {
  private encounterText?: Phaser.GameObjects.Text;
  private actionText?: Phaser.GameObjects.Text;
  private tokenSprite?: Phaser.GameObjects.Sprite;
  private currentToken?: EncounterData;
  private catchInProgress = false;
  private callingScene: string = 'OverworldScene'; // Default for backwards compatibility

  constructor() {
    super('EncounterScene');
  }

  async create(data: EncounterData) {
    // Reset state at the start of each encounter
    this.catchInProgress = false;
    this.currentToken = undefined;

    // Store the calling scene so we can return to it
    if (data.callingScene) {
      this.callingScene = data.callingScene;
    }

    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    // Dark background
    this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x0f380f)
      .setOrigin(0);

    // Fetch a random token from our API if not provided
    if (!data.tokenSymbol) {
      try {
        const response = await fetch('/api/tokens/encounter');
        const result = await response.json();

        data = {
          tokenSymbol: result.token.symbol,
          tokenName: result.token.name,
          tokenAddress: result.token.address,
          tokenRarity: result.token.rarity,
          tokenPrice: result.token.price || 100, // Add price data
        };
      } catch (error) {
        console.error('Failed to fetch encounter:', error);
        data = {
          tokenSymbol: 'USDC',
          tokenName: 'Stablecoin',
          tokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
          tokenRarity: 'common',
          tokenPrice: 1, // USDC is always $1
        };
      }
    }

    this.currentToken = data;

    // Determine token type from symbol and create animated sprite
    const tokenType = getTokenType(data.tokenSymbol || 'UNKNOWN');
    const spriteKey = `token-${tokenType}`;

    this.tokenSprite = this.add.sprite(centerX, centerY - 30, spriteKey);
    this.tokenSprite.setScale(2); // Make it larger for encounter
    this.tokenSprite.play(spriteKey + '-idle');

    // Add a simple bounce animation
    this.tweens.add({
      targets: this.tokenSprite,
      y: centerY - 35,
      duration: 800,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    // Encounter text
    this.encounterText = this.add.text(
      centerX,
      centerY + 20,
      `A wild ${data.tokenName} appeared!`,
      {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#9bbc0f',
        align: 'center',
      }
    ).setOrigin(0.5);

    // Token info
    this.add.text(
      centerX,
      centerY + 35,
      `${data.tokenSymbol} - ${data.tokenRarity?.toUpperCase()}`,
      {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#9bbc0f',
        align: 'center',
      }
    ).setOrigin(0.5);

    // Action menu
    const menuY = this.cameras.main.height - 30;

    this.add.rectangle(
      0,
      menuY - 5,
      this.cameras.main.width,
      40,
      0x000000,
      0.7
    ).setOrigin(0);

    this.actionText = this.add.text(
      8,
      menuY,
      'CATCH    RUN\n[C]      [R]',
      {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#9bbc0f',
      }
    );

    // Set up input - use once() to automatically clean up after use
    this.input.keyboard?.once('keydown-C', this.attemptCatch, this);
    this.input.keyboard?.once('keydown-R', this.runAway, this);
    this.input.keyboard?.once('keydown-ESC', this.runAway, this);

    // Register shutdown handler
    this.events.once('shutdown', this.onShutdown, this);
  }

  private async attemptCatch() {
    if (this.catchInProgress || !this.currentToken) return;
    this.catchInProgress = true;

    // Remove other key listeners since we started an action
    this.input.keyboard?.off('keydown-R');
    this.input.keyboard?.off('keydown-ESC');

    const { tokenSymbol, tokenName, tokenAddress } = this.currentToken;

    this.encounterText?.setText(`Catching ${tokenSymbol}...`);
    this.actionText?.setText('');

    // Check if player has pokeballs
    const gameStore = (window as any).gameStore;

    if (gameStore && gameStore.getState().pokeballs === 0) {
      this.encounterText?.setText('No pokeballs left!');

      this.time.delayedCall(1500, () => {
        this.returnToOverworld();
      });
      return;
    }

    // Use a pokeball
    if (gameStore) {
      gameStore.getState().usePokeball();
    }

    // Execute real swap via SwapBridge
    this.cameras.main.shake(200, 0.005);

    // Execute the swap
    this.executeSwap(tokenSymbol, tokenName, tokenAddress);
  }

  private async executeSwap(
    tokenSymbol: string | undefined,
    tokenName: string | undefined,
    tokenAddress: string | undefined
  ) {
    // Check if SwapBridge is available
    const swapBridge = (window as any).swapBridge;
    if (!swapBridge) {
      console.error('SwapBridge not available');
      this.encounterText?.setText('Swap unavailable!');
      this.time.delayedCall(1500, () => {
        this.returnToOverworld();
      });
      return;
    }

    try {
      console.log('[EncounterScene] Starting swap execution for', tokenSymbol);

      // Get token info from GAME_CONFIG
      const gameConfig = await import('@/lib/web3/config').then((m) => m.GAME_CONFIG);
      const usdcAmount = gameConfig.POKEBALL_COST_USDC; // 1 USDC per pokeball

      // Get token info
      const tokenInfo = await import('@/lib/web3/config').then((m) => {
        return m.getTokenInfo(tokenAddress || '');
      });

      console.log('[EncounterScene] Token info:', tokenInfo);

      if (!tokenInfo || !tokenAddress) {
        console.error('[EncounterScene] Token not found:', tokenAddress);
        this.encounterText?.setText('Token not found!');
        this.time.delayedCall(1500, () => {
          this.returnToOverworld();
        });
        return;
      }

      // Update UI for swap steps
      this.encounterText?.setText('Swapping USDC...');

      console.log('[EncounterScene] Calling swapBridge.catchToken...');

      // Execute the swap with timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Swap timeout - took too long')), 120000); // 2 min timeout
      });

      const result = await Promise.race([
        swapBridge.catchToken(tokenAddress, tokenInfo.decimals, usdcAmount),
        timeoutPromise,
      ]);

      console.log('[EncounterScene] Swap result:', result);

      if (result.success) {
        this.encounterText?.setText(`${tokenSymbol} caught!`);

        // Add to inventory
        const gameStore = (window as any).gameStore;
        if (gameStore) {
          const currentPrice = this.currentToken?.tokenPrice || 100;

          gameStore.getState().catchToken({
            symbol: tokenSymbol || 'UNKNOWN',
            name: tokenName || 'Unknown Token',
            address: tokenAddress,
            caughtAt: Date.now(),
            purchasePrice: currentPrice,
            currentPrice: currentPrice,
            peakPrice: currentPrice,
            lastPriceUpdate: Date.now(),
            priceHistory: [{ price: currentPrice, timestamp: Date.now() }],
            rarity: (this.currentToken?.tokenRarity as any) || 'common',
            type: getTokenType(tokenSymbol || 'UNKNOWN'),
            description: `A ${tokenName || 'Unknown Token'} from the blockchain.`,
            levelHistory: [],
            experience: 0,
            moves: [],
          });
        }

        // Flash effect
        this.cameras.main.flash(500, 155, 188, 15);

        this.time.delayedCall(2000, () => {
          this.returnToOverworld();
        });
      } else {
        // Swap failed - return the pokeball
        const gameStore = (window as any).gameStore;
        if (gameStore) {
          gameStore.getState().addPokeballs(1);
        }

        const errorMsg = result.error || 'Swap failed';
        console.error('Swap failed:', errorMsg);
        this.encounterText?.setText(`Failed: ${errorMsg.substring(0, 20)}...`);

        this.time.delayedCall(2500, () => {
          this.returnToOverworld();
        });
      }
    } catch (error) {
      console.error('Swap error:', error);

      // Return the pokeball on error
      const gameStore = (window as any).gameStore;
      if (gameStore) {
        gameStore.getState().addPokeballs(1);
      }

      this.encounterText?.setText('Swap error!');
      this.time.delayedCall(1500, () => {
        this.returnToOverworld();
      });
    }
  }

  private runAway() {
    if (this.catchInProgress) return;
    this.catchInProgress = true;

    // Remove other key listeners since we started an action
    this.input.keyboard?.off('keydown-C');
    this.input.keyboard?.off('keydown-ESC');

    this.encounterText?.setText('Got away safely!');
    this.actionText?.setText('');

    this.time.delayedCall(800, () => {
      this.returnToOverworld();
    });
  }

  private returnToOverworld() {
    // Fade out
    this.cameras.main.fade(300, 15, 56, 15);

    this.time.delayedCall(300, () => {
      this.scene.stop();
      this.scene.resume(this.callingScene);
    });
  }

  private onShutdown() {
    // Clean up any remaining keyboard events
    if (this.input.keyboard) {
      this.input.keyboard.off('keydown-C');
      this.input.keyboard.off('keydown-R');
      this.input.keyboard.off('keydown-ESC');
    }

    // Reset state
    this.catchInProgress = false;
    this.currentToken = undefined;
  }
}
