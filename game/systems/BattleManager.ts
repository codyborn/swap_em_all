// Battle management system for turn-based combat

import { CaughtToken, Move, DEFAULT_MOVES } from '../../lib/types/token';
import {
  BattleState,
  BattleParticipant,
  BattleLogEntry,
  BattleRewards,
  GymLeader,
  GYM_LEADERS,
} from '../../lib/types/battle';
import { DamageCalculator } from '../../lib/utils/damageCalculator';
import { LevelingSystem } from '../../lib/utils/levelingSystem';
import { getTokenType, getBaseStats } from '../../lib/types/token';

export class BattleManager {
  private battle: BattleState | null = null;

  /**
   * Initialize a gym battle
   */
  initGymBattle(playerToken: CaughtToken, gymLeaderId: string): BattleState | null {
    const gymLeader = GYM_LEADERS.find((g) => g.id === gymLeaderId);
    if (!gymLeader) return null;

    // Get first token from gym leader's team
    const opponentTokenData = gymLeader.team[0];
    const opponentToken = this.createGymToken(opponentTokenData.symbol, opponentTokenData.level);

    this.battle = {
      id: `gym_${Date.now()}`,
      type: 'gym',
      player: this.createParticipant('Player', playerToken),
      opponent: this.createParticipant(gymLeader.name, opponentToken),
      turn: 'player',
      turnNumber: 1,
      phase: 'select_move',
      log: [
        {
          timestamp: Date.now(),
          turn: 0,
          message: `${gymLeader.name} wants to battle!`,
          type: 'result',
        },
        {
          timestamp: Date.now(),
          turn: 0,
          message: `${gymLeader.name} sent out ${opponentToken.symbol}!`,
          type: 'result',
        },
        {
          timestamp: Date.now(),
          turn: 0,
          message: `Go! ${playerToken.symbol}!`,
          type: 'result',
        },
      ],
      gymData: {
        gymId: gymLeaderId,
        gymLeader: gymLeader.name,
        badge: gymLeader.badge,
      },
    };

    return this.battle;
  }

  /**
   * Initialize a wild token encounter battle
   */
  initWildBattle(playerToken: CaughtToken, wildToken: CaughtToken): BattleState {
    this.battle = {
      id: `wild_${Date.now()}`,
      type: 'wild',
      player: this.createParticipant('Player', playerToken),
      opponent: this.createParticipant('Wild', wildToken),
      turn: 'player',
      turnNumber: 1,
      phase: 'select_move',
      log: [
        {
          timestamp: Date.now(),
          turn: 0,
          message: `A wild ${wildToken.symbol} appeared!`,
          type: 'result',
        },
        {
          timestamp: Date.now(),
          turn: 0,
          message: `Go! ${playerToken.symbol}!`,
          type: 'result',
        },
      ],
    };

    return this.battle;
  }

  /**
   * Create a battle participant
   */
  private createParticipant(name: string, token: CaughtToken): BattleParticipant {
    return {
      name,
      token,
      currentHP: token.health,
      temporaryStats: { ...token.stats },
      statusEffects: [],
      isDefending: false,
    };
  }

  /**
   * Create a gym token at specific level
   */
  private createGymToken(symbol: string, level: number): CaughtToken {
    const tokenType = getTokenType(symbol);
    const baseStats = getBaseStats(tokenType);
    const stats = LevelingSystem.calculateStats(level, tokenType, baseStats);

    return {
      symbol,
      name: symbol,
      address: `gym_${symbol}_${Date.now()}`,
      caughtAt: Date.now(),
      purchasePrice: 1,
      currentPrice: level,
      peakPrice: level,
      lastPriceUpdate: Date.now(),
      priceHistory: [],
      level,
      maxLevel: level,
      experience: 0,
      health: stats.hp,
      maxHealth: stats.hp,
      isKnockedOut: false,
      lastHealthUpdate: Date.now(),
      stats,
      moves: DEFAULT_MOVES.filter((m) => m.learnedAt <= level),
      rarity: 'common',
      type: tokenType,
      description: `A ${tokenType} token used by gym leader`,
      levelHistory: [],
    };
  }

  /**
   * Select a move for a participant
   */
  selectMove(side: 'player' | 'opponent', move: Move): void {
    if (!this.battle || this.battle.phase !== 'select_move') return;

    if (side === 'player') {
      this.battle.player.selectedMove = move;
    } else {
      this.battle.opponent.selectedMove = move;
    }
  }

  /**
   * Execute turn (both moves selected)
   */
  executeTurn(): void {
    if (!this.battle || this.battle.phase !== 'select_move') return;

    const { player, opponent } = this.battle;

    if (!player.selectedMove || !opponent.selectedMove) {
      return;
    }

    this.battle.phase = 'animating';

    // Determine turn order based on speed
    const playerSpeed = player.temporaryStats.speed;
    const opponentSpeed = opponent.temporaryStats.speed;

    let firstAttacker: BattleParticipant;
    let firstMove: Move;
    let secondAttacker: BattleParticipant;
    let secondMove: Move;

    if (playerSpeed >= opponentSpeed) {
      firstAttacker = player;
      firstMove = player.selectedMove;
      secondAttacker = opponent;
      secondMove = opponent.selectedMove;
    } else {
      firstAttacker = opponent;
      firstMove = opponent.selectedMove;
      secondAttacker = player;
      secondMove = player.selectedMove;
    }

    // Execute first move
    this.executeMove(
      firstAttacker,
      firstAttacker === player ? opponent : player,
      firstMove,
      firstAttacker === player ? 'player' : 'opponent'
    );

    // Check if battle ended
    if (this.checkBattleEnd()) {
      return;
    }

    // Execute second move
    this.executeMove(
      secondAttacker,
      secondAttacker === player ? opponent : player,
      secondMove,
      secondAttacker === player ? 'player' : 'opponent'
    );

    // Check if battle ended
    if (this.checkBattleEnd()) {
      return;
    }

    // Reset defending status
    player.isDefending = false;
    opponent.isDefending = false;

    // Clear temporary stat changes (buffs last 1 turn)
    player.temporaryStats = { ...player.token.stats };
    opponent.temporaryStats = { ...opponent.token.stats };

    // Clear selected moves
    player.selectedMove = undefined;
    opponent.selectedMove = undefined;

    // Increment turn
    this.battle.turnNumber++;
    this.battle.phase = 'select_move';
  }

  /**
   * Execute a single move
   */
  private executeMove(
    attacker: BattleParticipant,
    defender: BattleParticipant,
    move: Move,
    side: 'player' | 'opponent'
  ): void {
    if (!this.battle) return;

    const attackerName = attacker.token.symbol;
    const defenderName = defender.token.symbol;

    // Log move usage
    this.addLog({
      message: `${attackerName} used ${move.name}!`,
      type: 'move',
    });

    // Handle different move types
    if (move.type === 'attack' || move.type === 'special') {
      // Calculate and apply damage
      const damage = DamageCalculator.calculateBattleDamage(attacker, defender, move);

      if (damage === 0) {
        this.addLog({
          message: `${attackerName}'s attack missed!`,
          type: 'miss',
        });
      } else {
        defender.currentHP = Math.max(0, defender.currentHP - damage);
        this.addLog({
          message: `${defenderName} took ${damage} damage!`,
          type: 'damage',
        });
      }
    } else if (move.type === 'defend') {
      // Set defending status
      attacker.isDefending = true;

      // Apply defense buff
      if (move.effect?.stat === 'defense') {
        attacker.temporaryStats.defense = Math.floor(
          attacker.temporaryStats.defense * 1.5
        );
      }

      // Heal 10%
      const healAmount = Math.floor(attacker.token.maxHealth * 0.1);
      attacker.currentHP = Math.min(
        attacker.token.maxHealth,
        attacker.currentHP + healAmount
      );

      this.addLog({
        message: `${attackerName} is defending and restored ${healAmount} HP!`,
        type: 'heal',
      });
    } else if (move.type === 'status') {
      // Handle status moves (like Rest)
      if (move.effect?.type === 'heal') {
        const healAmount = DamageCalculator.calculateHealing(attacker, move);
        attacker.currentHP = Math.min(
          attacker.token.maxHealth,
          attacker.currentHP + healAmount
        );

        this.addLog({
          message: `${attackerName} restored ${healAmount} HP!`,
          type: 'heal',
        });
      }
    }
  }

  /**
   * Check if battle has ended
   */
  private checkBattleEnd(): boolean {
    if (!this.battle) return false;

    const { player, opponent } = this.battle;

    if (player.currentHP <= 0) {
      this.battle.phase = 'ended';
      this.battle.winner = 'opponent';
      this.addLog({
        message: `${player.token.symbol} fainted!`,
        type: 'result',
      });
      this.addLog({
        message: 'You lost the battle!',
        type: 'result',
      });
      return true;
    }

    if (opponent.currentHP <= 0) {
      this.battle.phase = 'ended';
      this.battle.winner = 'player';
      this.addLog({
        message: `${opponent.token.symbol} fainted!`,
        type: 'result',
      });
      this.addLog({
        message: 'You won the battle!',
        type: 'result',
      });

      // Calculate rewards
      this.battle.rewards = this.calculateRewards();

      return true;
    }

    return false;
  }

  /**
   * Calculate battle rewards
   */
  private calculateRewards(): BattleRewards {
    if (!this.battle) return {};

    const rewards: BattleRewards = {};

    if (this.battle.type === 'gym') {
      // Gym rewards
      const opponentLevel = this.battle.opponent.token.level;
      rewards.usdc = opponentLevel * 100; // 100 USDC per level
      rewards.experience = opponentLevel * 50;

      // Award badge
      if (this.battle.gymData?.badge) {
        rewards.badge = {
          ...this.battle.gymData.badge,
          earnedAt: Date.now(),
        };
      }

      const badgeName = this.battle.gymData?.badge?.name || 'Badge';
      this.addLog({
        message: `Earned ${rewards.usdc} USDC and ${badgeName}!`,
        type: 'result',
      });
    } else if (this.battle.type === 'wild') {
      // Wild battle rewards
      const opponentLevel = this.battle.opponent.token.level;
      rewards.usdc = opponentLevel * 10; // 10 USDC per level
      rewards.experience = opponentLevel * 10;

      this.addLog({
        message: `Earned ${rewards.usdc} USDC!`,
        type: 'result',
      });
    }

    return rewards;
  }

  /**
   * Add entry to battle log
   */
  private addLog(entry: Omit<BattleLogEntry, 'timestamp' | 'turn'>): void {
    if (!this.battle) return;

    this.battle.log.push({
      timestamp: Date.now(),
      turn: this.battle.turnNumber,
      ...entry,
    });
  }

  /**
   * Get current battle state
   */
  getBattle(): BattleState | null {
    return this.battle;
  }

  /**
   * Get available moves for a participant
   */
  getAvailableMoves(side: 'player' | 'opponent'): Move[] {
    if (!this.battle) return [];

    const participant = side === 'player' ? this.battle.player : this.battle.opponent;
    return participant.token.moves;
  }

  /**
   * Select AI move for opponent
   */
  selectAIMove(): void {
    if (!this.battle || this.battle.phase !== 'select_move') return;

    const moves = this.getAvailableMoves('opponent');
    if (moves.length === 0) return;

    // Simple AI: random move with slight preference for attack
    const attackMoves = moves.filter((m) => m.type === 'attack' || m.type === 'special');
    const defensiveMoves = moves.filter((m) => m.type === 'defend' || m.type === 'status');

    let selectedMove: Move;

    // If low HP, prefer healing
    const hpPercent = (this.battle.opponent.currentHP / this.battle.opponent.token.maxHealth) * 100;
    if (hpPercent < 30 && defensiveMoves.length > 0) {
      selectedMove = defensiveMoves[Math.floor(Math.random() * defensiveMoves.length)];
    } else if (attackMoves.length > 0 && Math.random() < 0.8) {
      // 80% chance to attack
      selectedMove = attackMoves[Math.floor(Math.random() * attackMoves.length)];
    } else {
      // Random move
      selectedMove = moves[Math.floor(Math.random() * moves.length)];
    }

    this.selectMove('opponent', selectedMove);
  }

  /**
   * Reset battle state
   */
  reset(): void {
    this.battle = null;
  }
}
