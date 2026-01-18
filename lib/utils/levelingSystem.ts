// Leveling system for token progression

import { CaughtToken, TokenStats, getBaseStats, DEFAULT_MOVES, Move } from '../types/token';

export class LevelingSystem {
  /**
   * Calculate current gain: (currentPrice - purchasePrice) / purchasePrice
   */
  static calculateCurrentGain(purchasePrice: number, currentPrice: number): number {
    if (purchasePrice <= 0) return 0;
    return (currentPrice - purchasePrice) / purchasePrice;
  }

  /**
   * Calculate max gain (high-water mark)
   * This is the maximum relative gain the token has had since purchase
   */
  static calculateMaxGain(purchasePrice: number, peakPrice: number): number {
    if (purchasePrice <= 0) return 0;
    return (peakPrice - purchasePrice) / purchasePrice;
  }

  /**
   * Calculate level based on max gain using non-linear scaling
   * Level = floor(1 + 3 * sqrt(max_gain * 100))
   * This provides fast initial progression with diminishing returns:
   * - 0% gain = level 1
   * - 1% gain = level 4
   * - 9% gain = level 10
   * - 25% gain = level 16
   * - 100% gain (2x) = level 31
   * - 400% gain (5x) = level 61
   * - 900% gain (10x) = level 91
   * Min: 1, Max: 100
   */
  static calculateLevel(maxGain: number): number {
    const level = Math.floor(1 + 3 * Math.sqrt(maxGain * 100));
    return Math.max(1, Math.min(100, level));
  }

  /**
   * Calculate stats for a token
   * - Attack is based on curr_gain (current performance)
   * - Defense, Speed, HP are based on level (max_gain high-water mark)
   */
  static calculateStats(
    level: number,
    currGain: number,
    tokenType: string,
    baseStats?: Partial<TokenStats>
  ): TokenStats {
    // Get base stats for token type or use provided
    const base = baseStats || getBaseStats(tokenType as any);

    // Attack scales with current gain (can go down if price drops)
    // Formula: baseAttack * (1 + currGain)
    // Examples: -50% gain = 0.5x attack, 0% gain = 1x attack, 100% gain = 2x attack
    const attackMultiplier = Math.max(0.1, 1 + currGain); // Minimum 10% of base attack
    const attack = Math.floor((base.attack || 10) * attackMultiplier);

    // Other stats scale with level (based on max_gain)
    return {
      attack,
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
    const newPeakPrice = Math.max(token.peakPrice, newPrice);
    const newMaxGain = this.calculateMaxGain(token.purchasePrice, newPeakPrice);
    const newLevel = this.calculateLevel(newMaxGain);
    return newLevel > token.level;
  }

  /**
   * Level up a token and return updated stats
   */
  static levelUp(token: CaughtToken, newLevel: number, newMaxGain: number): Partial<CaughtToken> {
    const currGain = this.calculateCurrentGain(token.purchasePrice, token.currentPrice);
    const newStats = this.calculateStats(newLevel, currGain, token.type);
    const newMaxHealth = this.calculateMaxHealth(newLevel, token.type);

    // Calculate HP increase and add to current health
    const healthIncrease = newMaxHealth - token.maxHealth;
    const newHealth = Math.min(token.health + healthIncrease, newMaxHealth);

    return {
      level: newLevel,
      maxLevel: Math.max(token.maxLevel, newLevel),
      maxGain: newMaxGain,
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
   * Update stats when price changes (even without level up)
   * This is needed because attack is tied to curr_gain
   */
  static updateStatsForPrice(token: CaughtToken, newPrice: number): Partial<CaughtToken> {
    const currGain = this.calculateCurrentGain(token.purchasePrice, newPrice);
    const newStats = this.calculateStats(token.level, currGain, token.type);

    return {
      stats: newStats,
    };
  }

  /**
   * Get level progress as percentage (for UI)
   * Based on max_gain to next level using non-linear formula
   * level = 1 + 3 * sqrt(maxGain * 100)
   * Solving for maxGain: maxGain = ((level - 1) / 3)^2 / 100
   */
  static getLevelProgress(purchasePrice: number, currentPrice: number, maxGain: number): number {
    if (purchasePrice <= 0) return 0;

    const currentLevel = this.calculateLevel(maxGain);

    // Calculate gain required for current and next level
    const currentLevelGain = Math.pow((currentLevel - 1) / 3, 2) / 100;
    const nextLevelGain = Math.pow(currentLevel / 3, 2) / 100;

    if (nextLevelGain <= currentLevelGain) return 0;

    const progress = ((maxGain - currentLevelGain) / (nextLevelGain - currentLevelGain)) * 100;

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
