// Damage calculation system for health and battles

import { CaughtToken, Move } from '../types/token';
import { BattleParticipant } from '../types/battle';

export class DamageCalculator {
  /**
   * Calculate damage from price drops
   * Damage = (Price Drop % / 2) of max health
   */
  static calculatePriceDamage(
    purchasePrice: number,
    peakPrice: number,
    currentPrice: number,
    maxHealth: number
  ): number {
    // No damage if price is at or above peak
    if (currentPrice >= peakPrice) return 0;

    // Calculate price drop percentage
    const priceDropPercent = ((peakPrice - currentPrice) / peakPrice) * 100;

    // Damage is half the price drop percentage
    const damagePercent = priceDropPercent / 2;

    // Calculate health lost
    const healthLost = (damagePercent / 100) * maxHealth;

    return Math.floor(healthLost);
  }

  /**
   * Apply price damage to a token
   */
  static applyPriceDamage(token: CaughtToken, newPrice: number): Partial<CaughtToken> {
    // Calculate damage
    const damage = this.calculatePriceDamage(
      token.purchasePrice,
      token.peakPrice,
      newPrice,
      token.maxHealth
    );

    if (damage === 0) {
      return {};
    }

    const newHealth = Math.max(0, token.health - damage);
    const isKnockedOut = newHealth === 0;

    return {
      health: newHealth,
      isKnockedOut,
      lastHealthUpdate: Date.now(),
      levelHistory: [
        ...token.levelHistory,
        {
          level: token.level,
          price: newPrice,
          timestamp: Date.now(),
          event: 'damage_taken' as const,
        },
      ],
    };
  }

  /**
   * Calculate battle damage from an attack
   */
  static calculateBattleDamage(
    attacker: BattleParticipant,
    defender: BattleParticipant,
    move: Move
  ): number {
    // Non-damaging moves
    if (move.type !== 'attack' && move.type !== 'special') return 0;

    // Check for miss
    if (Math.random() * 100 > move.accuracy) return 0;

    // Base damage calculation
    const baseDamage = move.power;
    const attackMultiplier = attacker.temporaryStats.attack / 10;
    const defenseMultiplier = defender.temporaryStats.defense / 20;

    // Random factor (0.9-1.1x)
    const randomFactor = Math.random() * 0.2 + 0.9;

    // Calculate damage
    let damage = baseDamage * attackMultiplier - defenseMultiplier;
    damage = Math.max(1, damage); // Minimum 1 damage
    damage *= randomFactor;

    // Apply defense modifier if defending
    if (defender.isDefending) {
      damage *= 0.5;
    }

    return Math.floor(damage);
  }

  /**
   * Calculate healing amount from a move
   */
  static calculateHealing(
    participant: BattleParticipant,
    move: Move
  ): number {
    if (move.type !== 'defend' && move.type !== 'status') return 0;
    if (!move.effect || move.effect.type !== 'heal') return 0;

    const healPercent = move.effect.value / 100;
    const healAmount = Math.floor(participant.token.maxHealth * healPercent);

    return healAmount;
  }

  /**
   * Get health status color based on HP percentage
   */
  static getHealthColor(current: number, max: number): string {
    const percent = (current / max) * 100;

    if (percent >= 75) return '#00FF00'; // Green
    if (percent >= 50) return '#FFFF00'; // Yellow
    if (percent >= 25) return '#FFA500'; // Orange
    return '#FF0000'; // Red
  }

  /**
   * Get health status description
   */
  static getHealthStatus(current: number, max: number): string {
    const percent = (current / max) * 100;

    if (percent === 0) return 'Knocked Out';
    if (percent >= 75) return 'Healthy';
    if (percent >= 50) return 'Injured';
    if (percent >= 25) return 'Badly Injured';
    return 'Critical';
  }

  /**
   * Calculate revival cost based on level
   * Cost = level * 10 USDC
   */
  static getRevivalCost(level: number): number {
    return level * 10;
  }

  /**
   * Check if token can battle (not knocked out and has HP)
   */
  static canBattle(token: CaughtToken): boolean {
    return !token.isKnockedOut && token.health > 0;
  }

  /**
   * Apply healing to a token
   */
  static healToken(
    currentHealth: number,
    maxHealth: number,
    healAmount: number
  ): number {
    return Math.min(maxHealth, currentHealth + healAmount);
  }

  /**
   * Revive a knocked out token
   * Restores to 50% HP by default
   */
  static reviveToken(maxHealth: number, revivePercent: number = 50): number {
    return Math.floor(maxHealth * (revivePercent / 100));
  }
}
