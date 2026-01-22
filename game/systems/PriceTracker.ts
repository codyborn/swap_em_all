/**
 * PriceTracker system for automatic token price updates
 * Polls the price API at regular intervals and updates game state
 */

import { CaughtToken } from '@/lib/types/token';
import { LevelingSystem } from '@/lib/utils/levelingSystem';
import { DamageCalculator } from '@/lib/utils/damageCalculator';

export class PriceTracker {
  private updateInterval: number;
  private intervalId?: NodeJS.Timeout;
  private isRunning: boolean = false;

  constructor(updateIntervalMs: number = 60000) {
    // Default: 1 minute (60000ms)
    this.updateInterval = updateIntervalMs;
  }

  /**
   * Start the price tracking system
   */
  start() {
    if (this.isRunning) {
      console.warn('PriceTracker is already running');
      return;
    }

    console.log('PriceTracker started');
    this.isRunning = true;

    // Initial update
    this.updatePrices();

    // Set up interval
    this.intervalId = setInterval(() => {
      this.updatePrices();
    }, this.updateInterval);
  }

  /**
   * Stop the price tracking system
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    this.isRunning = false;
    console.log('PriceTracker stopped');
  }

  /**
   * Check if tracker is running
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Update prices for all tokens in inventory from database
   */
  private async updatePrices() {
    const store = (window as any).gameStore;
    if (!store) {
      console.warn('Game store not available');
      return;
    }

    const state = store.getState();
    const inventory: CaughtToken[] = state.inventory;
    const walletAddress = state.walletAddress;

    if (!walletAddress) {
      console.log('No wallet connected, skipping price update');
      return;
    }

    if (!inventory || inventory.length === 0) {
      console.log('No tokens to update');
      return;
    }

    try {
      // Get API URL from environment or use relative path
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

      // Fetch all stats in one request
      const response = await fetch(`${apiUrl}/api/game/stats?address=${walletAddress}`);

      if (!response.ok) {
        console.warn('Failed to get stats:', response.status);
        return;
      }

      const data = await response.json();

      // Update each token with data from stats
      for (const capture of data.captures) {
        const token = inventory.find((t) => t.address.toLowerCase() === capture.token.address.toLowerCase());

        if (token && capture.currentPrice && parseFloat(capture.currentPrice) > 0) {
          this.updateTokenPrice(
            token,
            parseFloat(capture.currentPrice),
            capture.priceHistory
          );
        }
      }
    } catch (error) {
      console.error('Failed to update prices:', error);
    }
  }

  /**
   * Update a single token's price and handle level-up/damage
   */
  private updateTokenPrice(
    token: CaughtToken,
    newPrice: number,
    priceHistory?: Array<{ price: number; timestamp: number }>
  ) {
    const store = (window as any).gameStore;
    if (!store) return;

    // Check for level up
    const didLevelUp = LevelingSystem.checkLevelUp(token, newPrice);

    if (didLevelUp) {
      const newPeakPrice = Math.max(token.peakPrice, newPrice);
      const newMaxGain = LevelingSystem.calculateMaxGain(token.purchasePrice, newPeakPrice);
      const newLevel = LevelingSystem.calculateLevel(newMaxGain);
      console.log(`🎉 ${token.symbol} leveled up to ${newLevel}!`);

      // Show notification
      this.showLevelUpNotification(token.symbol, newLevel);

      // Update will be handled by store action
    }

    // Check for damage (price drop from peak)
    const peakPrice = Math.max(token.peakPrice, newPrice);
    const damage = DamageCalculator.calculatePriceDamage(
      token.purchasePrice,
      peakPrice,
      newPrice,
      token.maxHealth
    );

    if (damage > 0) {
      console.log(`💔 ${token.symbol} took ${damage} damage from price drop`);
    }

    // Update via store action - use database price history if available
    if (priceHistory && priceHistory.length > 0) {
      // Update priceHistory from database
      const state = store.getState();
      const tokenIndex = state.inventory.findIndex((t: CaughtToken) => t.address === token.address);

      if (tokenIndex !== -1) {
        const updatedToken = state.inventory[tokenIndex];
        const oldLevel = updatedToken.level;
        const newPeakPrice = Math.max(updatedToken.peakPrice, newPrice);
        const newMaxGain = LevelingSystem.calculateMaxGain(updatedToken.purchasePrice, newPeakPrice);
        const newLevel = LevelingSystem.calculateLevel(newMaxGain);

        let updates: Partial<CaughtToken> = {
          currentPrice: newPrice,
          peakPrice: newPeakPrice,
          maxGain: newMaxGain,
          lastPriceUpdate: Date.now(),
          priceHistory: priceHistory, // Use database history
        };

        if (newLevel > oldLevel) {
          const levelUpData = LevelingSystem.levelUp(updatedToken, newLevel, newMaxGain);
          updates = { ...updates, ...levelUpData };
        } else {
          const statsUpdate = LevelingSystem.updateStatsForPrice(updatedToken, newPrice);
          updates = { ...updates, ...statsUpdate };
        }

        // Apply health damage if any
        if (damage > 0) {
          const newHealth = Math.max(0, updatedToken.health - damage);
          updates.health = newHealth;
          updates.isKnockedOut = newHealth === 0;
          updates.lastHealthUpdate = Date.now();
        }

        // Merge updates directly into inventory
        state.inventory[tokenIndex] = { ...updatedToken, ...updates };
        store.setState({ inventory: [...state.inventory] });
      }
    } else {
      // Fallback to old behavior if no price history from database
      store.getState().updateTokenPrice(token.address, newPrice);
    }
  }

  /**
   * Show level-up notification to player
   */
  private showLevelUpNotification(symbol: string, newLevel: number) {
    if (typeof window !== 'undefined') {
      const notification = document.createElement('div');
      notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 20px;">🎉</span>
          <span><strong>${symbol}</strong> reached Level ${newLevel}!</span>
        </div>
      `;
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #9bbc0f;
        color: #0f380f;
        padding: 14px 20px;
        border-radius: 8px;
        font-family: monospace;
        font-size: 14px;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        opacity: 0;
        transform: translateX(400px);
        transition: all 0.3s ease-out;
        pointer-events: none;
      `;

      document.body.appendChild(notification);

      // Slide in
      requestAnimationFrame(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
      });

      // Remove after 3 seconds
      setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(400px)';

        setTimeout(() => {
          if (notification.parentNode) {
            document.body.removeChild(notification);
          }
        }, 300);
      }, 3000);
    }
  }

  /**
   * Force an immediate price update
   * Useful for testing or manual refresh
   */
  async forceUpdate() {
    console.log('Forcing price update...');
    await this.updatePrices();
  }

  /**
   * Change the update interval
   */
  setUpdateInterval(intervalMs: number) {
    this.updateInterval = intervalMs;

    if (this.isRunning) {
      // Restart with new interval
      this.stop();
      this.start();
    }
  }

  /**
   * Get current update interval
   */
  getUpdateInterval(): number {
    return this.updateInterval;
  }
}

// Create a global instance
export const globalPriceTracker = new PriceTracker();

// Auto-start in browser environment
if (typeof window !== 'undefined') {
  // Wait for game store to be available
  const startWhenReady = () => {
    if ((window as any).gameStore) {
      globalPriceTracker.start();
    } else {
      setTimeout(startWhenReady, 1000);
    }
  };

  startWhenReady();
}
