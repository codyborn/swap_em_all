import * as Phaser from 'phaser';
import { CaughtToken, getTokenType, getBaseStats, DEFAULT_MOVES } from '../../lib/types/token';
import { Badge } from '../../lib/types/battle';
import { DamageCalculator } from '../../lib/utils/damageCalculator';

type ViewMode = 'list' | 'detail';

interface CryptodexSceneData {
  callingScene?: string;
}

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

export class CryptodexScene extends Phaser.Scene {
  private viewMode: ViewMode = 'list';
  private selectedTokenIndex: number = 0;
  private listScrollOffset: number = 0;
  private maxVisibleTokens: number = 8;
  private callingScene: string = 'OverworldScene'; // Default for backwards compatibility
  private apiTokens: CaughtToken[] = [];
  private isLoading: boolean = false;

  // UI elements
  private container?: Phaser.GameObjects.Container;
  private titleText?: Phaser.GameObjects.Text;
  private contentText?: Phaser.GameObjects.Text;
  private instructionsText?: Phaser.GameObjects.Text;
  private tokenSprite?: Phaser.GameObjects.Sprite;
  private listSprites: Phaser.GameObjects.Sprite[] = [];
  private prevMenuText?: Phaser.GameObjects.Text;
  private nextMenuText?: Phaser.GameObjects.Text;

  constructor() {
    super('CryptodexScene');
  }

  async create(data: CryptodexSceneData = {}) {
    // Track which scene launched us
    if (data.callingScene) {
      this.callingScene = data.callingScene;
    }
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

    // Navigation hints
    this.prevMenuText = this.add.text(
      4,
      20,
      '← Badges',
      {
        fontFamily: 'monospace',
        fontSize: '7px',
        color: '#306230',
      }
    ).setOrigin(0, 0.5);

    this.nextMenuText = this.add.text(
      this.cameras.main.width - 4,
      20,
      'Inventory →',
      {
        fontFamily: 'monospace',
        fontSize: '7px',
        color: '#306230',
      }
    ).setOrigin(1, 0.5);

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

    // Fetch tokens from API
    await this.fetchTokensFromAPI();

    // Show initial view
    this.showListView();

    // Set up input
    this.setupInput();
  }

  private async fetchTokensFromAPI() {
    this.isLoading = true;

    try {
      // Get wallet address from game store
      const gameStore = (window as any).gameStore;
      const walletAddress = gameStore?.getState().walletAddress;

      if (!walletAddress) {
        console.warn('[Cryptodex] No wallet address found');
        this.apiTokens = [];
        return;
      }

      // Fetch from stats API
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${apiUrl}/api/game/stats?address=${walletAddress}`);

      if (!response.ok) {
        console.error('[Cryptodex] Failed to fetch stats:', response.statusText);
        this.apiTokens = [];
        return;
      }

      const data: StatsAPIResponse = await response.json();

      // Transform API captures into CaughtToken format
      this.apiTokens = data.captures.map(capture => this.transformAPIToken(capture));

      console.log(`[Cryptodex] Loaded ${this.apiTokens.length} tokens from API`);
    } catch (error) {
      console.error('[Cryptodex] Error fetching tokens:', error);
      this.apiTokens = [];
    } finally {
      this.isLoading = false;
    }
  }

  private transformAPIToken(capture: StatsAPICapture): CaughtToken {
    const tokenType = getTokenType(capture.token.symbol);
    const baseStats = getBaseStats(tokenType);
    const purchasePrice = parseFloat(capture.purchasePrice);
    const currentPrice = parseFloat(capture.currentPrice);
    const capturedAt = new Date(capture.capturedAt).getTime();

    // Check if this token exists in local store to preserve game data
    const gameStore = (window as any).gameStore;
    const localInventory: CaughtToken[] = gameStore?.getState().inventory || [];
    const existingToken = localInventory.find(t => t.address.toLowerCase() === capture.token.address.toLowerCase());

    // If token exists locally, merge API data with local game data
    if (existingToken) {
      return {
        ...existingToken,
        // Update price data from API
        purchasePrice,
        currentPrice,
        peakPrice: Math.max(existingToken.peakPrice, currentPrice),
        priceHistory: capture.priceHistory,
        lastPriceUpdate: Date.now(),
      };
    }

    // Create new token with defaults
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
      maxGain: currentPrice > purchasePrice ? (currentPrice - purchasePrice) / purchasePrice : 0,
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
      moves: DEFAULT_MOVES.filter(m => m.learnedAt <= level),

      // Metadata
      rarity: this.determineRarity(tokenType),
      type: tokenType,
      description: `A ${tokenType} token captured on-chain.`,

      // History
      levelHistory: [{
        level,
        price: purchasePrice,
        timestamp: capturedAt,
        event: 'caught',
      }],
    };
  }

  private determineRarity(tokenType: string): 'common' | 'uncommon' | 'rare' | 'legendary' {
    const rarityMap: Record<string, 'common' | 'uncommon' | 'rare' | 'legendary'> = {
      layer1: 'rare',
      defi: 'uncommon',
      layer2: 'uncommon',
      meme: 'common',
      exchange: 'uncommon',
      governance: 'rare',
      wrapped: 'uncommon',
      unknown: 'common',
    };

    return rarityMap[tokenType] || 'common';
  }

  private setupInput() {
    this.input.keyboard?.on('keydown-ESC', () => this.handleEscape());
    this.input.keyboard?.on('keydown-UP', () => this.handleUp());
    this.input.keyboard?.on('keydown-DOWN', () => this.handleDown());
    this.input.keyboard?.on('keydown-ENTER', () => this.handleEnter());
    this.input.keyboard?.on('keydown-LEFT', () => this.switchToBadges());
    this.input.keyboard?.on('keydown-RIGHT', () => this.switchToBag());
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
    if (this.viewMode === 'list') {
      const inventory = this.apiTokens;
      if (inventory.length > 0) {
        this.selectedTokenIndex = (this.selectedTokenIndex - 1 + inventory.length) % inventory.length;
        this.showListView();
      }
    }
  }

  private handleDown() {
    if (this.viewMode === 'list') {
      const inventory = this.apiTokens;
      if (inventory.length > 0) {
        this.selectedTokenIndex = (this.selectedTokenIndex + 1) % inventory.length;
        this.showListView();
      }
    }
  }

  private handleEnter() {
    if (this.viewMode === 'list') {
      const inventory = this.apiTokens;
      if (inventory.length > 0) {
        this.showDetailView();
      }
    } else if (this.viewMode === 'detail') {
      this.showListView();
    }
  }


  private showListView() {
    this.viewMode = 'list';
    this.clearContent();

    const inventory: CaughtToken[] = this.apiTokens;

    if (this.titleText) {
      this.titleText.setText('CRYPTODEX');
    }

    // Stats
    const statsText = `Captured: ${inventory.length}`;

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
      // Ensure scroll offset keeps selected token visible
      if (this.selectedTokenIndex < this.listScrollOffset) {
        this.listScrollOffset = this.selectedTokenIndex;
      } else if (this.selectedTokenIndex >= this.listScrollOffset + this.maxVisibleTokens) {
        this.listScrollOffset = this.selectedTokenIndex - this.maxVisibleTokens + 1;
      }

      // Calculate visible range
      const visibleStart = this.listScrollOffset;
      const visibleEnd = Math.min(this.listScrollOffset + this.maxVisibleTokens, inventory.length);
      const visibleTokens = inventory.slice(visibleStart, visibleEnd);

      // Show list with selection and sprites (only visible tokens)
      const listItems = visibleTokens.map((token: CaughtToken, i: number) => {
        const actualIndex = visibleStart + i;
        const prefix = actualIndex === this.selectedTokenIndex ? '>' : ' ';
        const healthInfo = `HP:${token.health}/${token.maxHealth}`;
        const levelInfo = `Lv.${token.level}`;
        return `${prefix}  ${token.symbol.padEnd(8)} ${levelInfo.padEnd(6)} ${healthInfo}`;
      });

      const scrollIndicator = inventory.length > this.maxVisibleTokens
        ? `\n(${visibleStart + 1}-${visibleEnd} of ${inventory.length})`
        : '';

      const content = `${statsText}${scrollIndicator}\n\n${listItems.join('\n')}`;

      this.contentText = this.add.text(
        8,
        32,
        content,
        {
          fontFamily: 'monospace',
          fontSize: '9px',
          color: '#9bbc0f',
          lineSpacing: 4,
        }
      );

      // Add sprites next to each visible token in the list
      // Text starts at y=32, with lineSpacing=4 and fontSize=9
      // Layout: Stats (line 0), ScrollIndicator (line 1, optional), Empty (line 2), Tokens (line 3+)
      const baseY = 32; // Starting Y position of text
      const lineHeight = 9 + 4; // fontSize + lineSpacing = 13 pixels per line
      const headerLines = 2 + (scrollIndicator ? 1 : 0); // Stats + Empty line + optional scroll indicator

      // Calculate Y position for first token line's center
      // Tokens start at headerLines, need to center sprite in the line
      const firstTokenLineY = baseY + (headerLines * lineHeight);
      const spriteStartY = firstTokenLineY + (lineHeight / 2) + 6; // Center in line + 6px adjustment

      visibleTokens.forEach((token: CaughtToken, i: number) => {
        const spriteKey = `token-${token.type}`;
        const sprite = this.add.sprite(18, spriteStartY + (i * lineHeight), spriteKey);
        sprite.setScale(0.6);
        sprite.play(spriteKey + '-idle');
        this.listSprites.push(sprite);
      });
    }

    if (this.instructionsText) {
      this.instructionsText.setText('↑/↓: Select  ENTER: Details  ←/→: Switch Menu  ESC: Exit');
    }
  }

  private showDetailView() {
    this.viewMode = 'detail';
    this.clearContent();

    const inventory: CaughtToken[] = this.apiTokens;
    const token = inventory[this.selectedTokenIndex];

    if (!token) return;

    if (this.titleText) {
      this.titleText.setText(`${token.symbol} - ${token.name}`);
    }

    // Add price chart at the top left
    this.renderPriceChart(token);

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
      76,
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


  private renderPriceChart(token: CaughtToken) {
    // Get price history since token was caught
    const historySinceCaught = token.priceHistory.filter(
      point => point.timestamp >= token.caughtAt
    );

    if (historySinceCaught.length === 0) {
      return; // No history to display
    }

    // Chart dimensions
    const chartWidth = 28;
    const chartHeight = 7;

    // Sample data points to fit chart width
    const sampleInterval = Math.max(1, Math.floor(historySinceCaught.length / chartWidth));
    const sampledData = historySinceCaught.filter((_, i) => i % sampleInterval === 0);

    // Take only what fits
    const dataToShow = sampledData.slice(-chartWidth);

    // Find min/max for normalization
    const prices = dataToShow.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1; // Avoid division by zero

    // Normalize prices to chart height (0 to chartHeight-1)
    const normalizedHeights = dataToShow.map(point => {
      const normalized = (point.price - minPrice) / priceRange;
      return Math.floor(normalized * (chartHeight - 1));
    });

    // Build chart from top to bottom
    const lines: string[] = [];
    for (let row = chartHeight - 1; row >= 0; row--) {
      let line = '';
      for (let col = 0; col < dataToShow.length; col++) {
        const height = normalizedHeights[col];
        const price = dataToShow[col].price;
        const isAbovePurchase = price >= token.purchasePrice;

        if (height >= row) {
          // Use colored block character
          line += isAbovePurchase ? '█' : '█';
        } else {
          line += ' ';
        }
      }
      lines.push(line);
    }

    // Create text objects for each line with appropriate colors
    const startY = 28;
    lines.forEach((line, i) => {
      // Split line into segments by color
      let currentX = 4;
      for (let j = 0; j < line.length; j++) {
        if (line[j] === '█') {
          const price = dataToShow[j].price;
          const isAbovePurchase = price >= token.purchasePrice;
          const color = isAbovePurchase ? '#9bbc0f' : '#f44';

          const char = this.add.text(currentX, startY + (i * 5), '█', {
            fontFamily: 'monospace',
            fontSize: '6px',
            color: color,
          });
          this.listSprites.push(char as any);
        }
        currentX += 3.5; // Character width spacing
      }
    });

    // Add price change indicator below chart
    const priceChange = ((token.currentPrice - token.purchasePrice) / token.purchasePrice * 100).toFixed(1);
    const priceChangeSign = parseFloat(priceChange) >= 0 ? '+' : '';
    const changeColor = parseFloat(priceChange) >= 0 ? '#9bbc0f' : '#f44';

    const chartLabel = this.add.text(
      4,
      startY + (chartHeight * 5) + 2,
      `${priceChangeSign}${priceChange}%`,
      {
        fontFamily: 'monospace',
        fontSize: '7px',
        color: changeColor,
      }
    );
    this.listSprites.push(chartLabel as any);
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

  private switchToBadges() {
    // Clean up
    this.input.keyboard?.off('keydown-ESC');
    this.input.keyboard?.off('keydown-UP');
    this.input.keyboard?.off('keydown-DOWN');
    this.input.keyboard?.off('keydown-ENTER');
    this.input.keyboard?.off('keydown-LEFT');
    this.input.keyboard?.off('keydown-RIGHT');

    // Stop this scene and launch badges
    this.scene.stop();
    this.scene.launch('BadgesScene');
  }

  private switchToBag() {
    // Clean up
    this.input.keyboard?.off('keydown-ESC');
    this.input.keyboard?.off('keydown-UP');
    this.input.keyboard?.off('keydown-DOWN');
    this.input.keyboard?.off('keydown-ENTER');
    this.input.keyboard?.off('keydown-LEFT');
    this.input.keyboard?.off('keydown-RIGHT');

    // Stop this scene and launch bag
    this.scene.stop();
    this.scene.launch('BagScene', { callingScene: this.callingScene });
  }

  private exitCryptodex() {
    this.cameras.main.fade(300, 15, 56, 15);

    this.time.delayedCall(300, () => {
      // Clean up
      this.input.keyboard?.off('keydown-ESC');
      this.input.keyboard?.off('keydown-UP');
      this.input.keyboard?.off('keydown-DOWN');
      this.input.keyboard?.off('keydown-ENTER');
      this.input.keyboard?.off('keydown-LEFT');
      this.input.keyboard?.off('keydown-RIGHT');

      this.scene.stop();
      this.scene.resume(this.callingScene);
    });
  }

  shutdown() {
    this.clearContent();
    this.input.keyboard?.off('keydown-ESC');
    this.input.keyboard?.off('keydown-UP');
    this.input.keyboard?.off('keydown-DOWN');
    this.input.keyboard?.off('keydown-ENTER');
    this.input.keyboard?.off('keydown-LEFT');
    this.input.keyboard?.off('keydown-RIGHT');
  }
}
