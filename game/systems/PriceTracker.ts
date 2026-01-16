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

  constructor(updateIntervalMs: number = 300000) {
    // Default: 5 minutes (300000ms)
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
   * Update prices for all tokens in inventory
   */
  private async updatePrices() {
    const store = (window as any).gameStore;
    if (!store) {
      console.warn('Game store not available');
      return;
    }

    const inventory: CaughtToken[] = store.getState().inventory;

    if (!inventory || inventory.length === 0) {
      console.log('No tokens to update');
      return;
    }

    const addresses = inventory.map((token) => token.address);

    try {
      const response = await fetch('/api/tokens/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addresses }),
      });

      if (!response.ok) {
        throw new Error(`Price API returned ${response.status}`);
      }

      const prices: Record<string, number> = await response.json();

      console.log(`Updated prices for ${Object.keys(prices).length} tokens`);

      // Update each token
      for (const token of inventory) {
        const newPrice = prices[token.address];

        if (newPrice && newPrice > 0) {
          this.updateTokenPrice(token, newPrice);
        }
      }
    } catch (error) {
      console.error('Failed to update prices:', error);
    }
  }

  /**
   * Update a single token's price and handle level-up/damage
   */
  private updateTokenPrice(token: CaughtToken, newPrice: number) {
    const store = (window as any).gameStore;
    if (!store) return;

    // Check for level up
    const didLevelUp = LevelingSystem.checkLevelUp(token, newPrice);

    if (didLevelUp) {
      const newLevel = LevelingSystem.calculateLevel(token.purchasePrice, newPrice);
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

    // Update via store action
    store.getState().updateTokenPrice(token.address, newPrice);
  }

  /**
   * Show level-up notification to player
   */
  private showLevelUpNotification(symbol: string, newLevel: number) {
    // Create a simple notification
    // In production, this would integrate with a notification system
    if (typeof window !== 'undefined') {
      const notification = document.createElement('div');
      notification.textContent = `${symbol} reached Level ${newLevel}!`;
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #9bbc0f;
        color: #0f380f;
        padding: 12px 20px;
        border-radius: 4px;
        font-family: monospace;
        font-weight: bold;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
      `;

      document.body.appendChild(notification);

      // Remove after 3 seconds
      setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
          document.body.removeChild(notification);
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
