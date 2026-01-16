// Leveling system for token progression

import { CaughtToken, TokenStats, getBaseStats, DEFAULT_MOVES, Move } from '../types/token';

export class LevelingSystem {
  /**
   * Calculate level based on purchase price and current price
   * Level = floor(currentPrice / purchasePrice)
   * Min: 1, Max: 100
   */
  static calculateLevel(purchasePrice: number, currentPrice: number): number {
    if (currentPrice <= 0 || purchasePrice <= 0) return 1;

    const priceRatio = currentPrice / purchasePrice;
    const level = Math.floor(priceRatio);

    return Math.max(1, Math.min(100, level));
  }

  /**
   * Calculate stats for a token at a given level
   * Uses token type base stats + level scaling
   */
  static calculateStats(
    level: number,
    tokenType: string,
    baseStats?: Partial<TokenStats>
  ): TokenStats {
    // Get base stats for token type or use provided
    const base = baseStats || getBaseStats(tokenType as any);

    return {
      attack: (base.attack || 10) + (level - 1) * 5,
      defense: (base.defense || 10) + (level - 1) * 5,
      speed: (base.speed || 10) + (level - 1) * 2,
      hp: (base.hp || 50) + (level - 1) * 10,
    };
  }

  /**
   * Calculate maximum health for a token at a given level
   */
  static calculateMaxHealth(level: number, tokenType: string): number {
    const base = getBaseStats(tokenType as any);
    return (base.hp || 50) + (level - 1) * 10;
  }

  /**
   * Check if a token should level up based on new price
   */
  static checkLevelUp(token: CaughtToken, newPrice: number): boolean {
    const newLevel = this.calculateLevel(token.purchasePrice, newPrice);
    return newLevel > token.level;
  }

  /**
   * Level up a token and return updated stats
   */
  static levelUp(token: CaughtToken, newLevel: number): Partial<CaughtToken> {
    const newStats = this.calculateStats(newLevel, token.type);
    const newMaxHealth = this.calculateMaxHealth(newLevel, token.type);

    // Calculate HP increase and add to current health
    const healthIncrease = newMaxHealth - token.maxHealth;
    const newHealth = Math.min(token.health + healthIncrease, newMaxHealth);

    return {
      level: newLevel,
      maxLevel: Math.max(token.maxLevel, newLevel),
      stats: newStats,
      maxHealth: newMaxHealth,
      health: newHealth,
      levelHistory: [
        ...token.levelHistory,
        {
          level: newLevel,
          price: token.currentPrice,
          timestamp: Date.now(),
          event: 'level_up' as const,
        },
      ],
    };
  }

  /**
   * Get moves available at a given level
   * For now, returns default moves
   * Later can be expanded to include level-specific moves
   */
  static getAvailableMoves(level: number): Move[] {
    return DEFAULT_MOVES.filter((move) => move.learnedAt <= level);
  }

  /**
   * Calculate experience for future use
   * Currently unused but ready for exp-based progression
   */
  static calculateExperience(level: number): number {
    // Simple exponential formula: level^2 * 100
    return level * level * 100;
  }

  /**
   * Get level progress as percentage (for UI)
   * Based on price ratio to next level
   */
  static getLevelProgress(purchasePrice: number, currentPrice: number): number {
    if (currentPrice <= 0 || purchasePrice <= 0) return 0;

    const currentLevel = this.calculateLevel(purchasePrice, currentPrice);
    const nextLevelPrice = purchasePrice * (currentLevel + 1);
    const currentLevelPrice = purchasePrice * currentLevel;

    const progress =
      ((currentPrice - currentLevelPrice) / (nextLevelPrice - currentLevelPrice)) * 100;

    return Math.max(0, Math.min(100, progress));
  }

  /**
   * Get a descriptive level tier (for UI badges)
   */
  static getLevelTier(level: number): string {
    if (level >= 50) return 'Legendary';
    if (level >= 30) return 'Elite';
    if (level >= 20) return 'Master';
    if (level >= 10) return 'Expert';
    if (level >= 5) return 'Skilled';
    return 'Novice';
  }

  /**
   * Calculate stat boost from badges
   * +1% per badge, max 8%
   */
  static applyBadgeBoost(stats: TokenStats, badgeCount: number): TokenStats {
    const boost = 1 + badgeCount * 0.01;

    return {
      attack: Math.floor(stats.attack * boost),
      defense: Math.floor(stats.defense * boost),
      speed: Math.floor(stats.speed * boost),
      hp: Math.floor(stats.hp * boost),
    };
  }
}
