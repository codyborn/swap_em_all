# Technical Implementation Plan V2 - Swap 'Em All

**Version**: 2.0
**Date**: 2026-01-16
**Status**: Planning Phase

---

## Overview

This document details the technical implementation of the enhanced game mechanics including price-based leveling, battle system, gyms, and enhanced Cryptodex.

---

## 1. Architecture Changes

### Updated Data Flow

```
Blockchain (Price Data)
    ↓
API Routes (Price Aggregation)
    ↓
Game Store (State Management)
    ↓
Phaser Scenes (Game Logic)
    ↓
UI Components (Display)
```

### New Components

```
app/
├── api/
│   ├── tokens/
│   │   ├── [address]/
│   │   │   └── price-history/route.ts  (NEW)
│   │   └── prices/route.ts              (NEW)
│   └── battles/
│       └── calculate-damage/route.ts     (NEW)
│
game/
├── scenes/
│   ├── BattleScene.ts                    (NEW)
│   ├── GymScene.ts                       (NEW)
│   ├── HealingCenterScene.ts             (NEW)
│   └── BagScene.ts                       (NEW)
│
├── systems/
│   ├── PriceTracker.ts                   (NEW)
│   ├── LevelingSystem.ts                 (NEW)
│   ├── DamageCalculator.ts               (NEW)
│   ├── BattleManager.ts                  (NEW)
│   └── MoveSystem.ts                     (NEW)
│
lib/
├── store/
│   └── gameStore.ts                      (UPDATE)
├── types/
│   ├── token.ts                          (UPDATE)
│   ├── battle.ts                         (NEW)
│   └── moves.ts                          (NEW)
└── utils/
    ├── priceCalculations.ts              (NEW)
    └── battleFormulas.ts                 (NEW)
```

---

## 2. Data Models

### Token Model (Enhanced)

```typescript
// lib/types/token.ts

export interface CaughtToken {
  // Core identity
  symbol: string;
  name: string;
  address: string;
  caughtAt: number;

  // Price tracking
  purchasePrice: number;
  currentPrice: number;
  peakPrice: number;
  lastPriceUpdate: number;
  priceHistory: PricePoint[];

  // Leveling
  level: number;
  maxLevel: number;
  experience: number;

  // Health
  health: number;
  maxHealth: number;
  isKnockedOut: boolean;
  lastHealthUpdate: number;

  // Battle stats
  stats: TokenStats;

  // Moves
  moves: Move[];

  // Metadata
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  type: TokenType;
  description: string;

  // History
  levelHistory: LevelHistoryEntry[];
}

export interface TokenStats {
  attack: number;
  defense: number;
  speed: number;
  hp: number;
}

export interface PricePoint {
  price: number;
  timestamp: number;
}

export interface LevelHistoryEntry {
  level: number;
  price: number;
  timestamp: number;
  event: 'level_up' | 'damage_taken' | 'healed' | 'caught';
}

export type TokenType =
  | 'defi'
  | 'layer1'
  | 'layer2'
  | 'stablecoin'
  | 'meme'
  | 'exchange'
  | 'governance'
  | 'wrapped';
```

### Move Model

```typescript
// lib/types/moves.ts

export interface Move {
  id: string;
  name: string;
  type: MoveType;
  power: number;
  accuracy: number;
  description: string;
  effect?: MoveEffect;
  animation?: string;
  learnedAt: number;
}

export type MoveType = 'attack' | 'defend' | 'special' | 'status';

export interface MoveEffect {
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'status';
  value: number;
  duration?: number;
  target: 'self' | 'opponent';
  stat?: 'attack' | 'defense' | 'speed';
}

// Default moves available to all tokens
export const DEFAULT_MOVES: Move[] = [
  {
    id: 'attack',
    name: 'Attack',
    type: 'attack',
    power: 40,
    accuracy: 95,
    description: 'A basic attack that deals damage.',
    learnedAt: 1,
  },
  {
    id: 'defend',
    name: 'Defend',
    type: 'defend',
    power: 0,
    accuracy: 100,
    description: 'Reduce damage and restore HP.',
    effect: {
      type: 'buff',
      value: 50,
      duration: 1,
      target: 'self',
      stat: 'defense',
    },
    learnedAt: 1,
  },
  {
    id: 'rest',
    name: 'Rest',
    type: 'status',
    power: 0,
    accuracy: 100,
    description: 'Sleep for one turn to restore 50% HP.',
    effect: {
      type: 'heal',
      value: 50,
      target: 'self',
    },
    learnedAt: 5,
  },
];
```

### Battle Model

```typescript
// lib/types/battle.ts

export interface BattleState {
  id: string;
  type: 'gym' | 'wild' | 'pvp';

  // Participants
  player: BattleParticipant;
  opponent: BattleParticipant;

  // State
  turn: 'player' | 'opponent';
  turnNumber: number;
  phase: 'select_move' | 'animating' | 'ended';

  // Battle log
  log: BattleLogEntry[];

  // Gym specific
  gymData?: {
    gymId: string;
    gymLeader: string;
    badge?: Badge;
  };

  // Results
  winner?: 'player' | 'opponent';
  rewards?: BattleRewards;
}

export interface BattleParticipant {
  name: string;
  token: CaughtToken;
  currentHP: number;
  temporaryStats: TokenStats;  // For buffs/debuffs
  statusEffects: StatusEffect[];
  selectedMove?: Move;
}

export interface BattleLogEntry {
  timestamp: number;
  turn: number;
  message: string;
  type: 'move' | 'damage' | 'heal' | 'status' | 'result';
}

export interface StatusEffect {
  type: 'burn' | 'poison' | 'defense_up' | 'attack_up' | 'sleep';
  duration: number;
  value?: number;
}

export interface BattleRewards {
  usdc?: number;
  items?: Array<{type: string; quantity: number}>;
  experience?: number;
  badge?: Badge;
}

export interface Badge {
  id: string;
  name: string;
  gymName: string;
  gymLeader: string;
  description: string;
  icon: string;
  earnedAt?: number;
  order: number;  // 1-8
}
```

### Game Store (Enhanced)

```typescript
// lib/store/gameStore.ts

export interface GameStore {
  // Player data
  playerName: string;
  playerId: string;

  // Currency
  pokeballs: number;
  usdc: number;  // Track USDC balance

  // Inventory
  inventory: CaughtToken[];

  // Items
  items: {
    potions: number;
    superPotions: number;
    hyperPotions: number;
    maxPotions: number;
    revives: number;
    maxRevives: number;
  };

  // Progress
  tutorialComplete: boolean;
  badges: Badge[];
  gymsDefeated: string[];

  // Cryptodex (all caught species)
  cryptodex: CaughtToken[];

  // Active battle
  activeBattle?: BattleState;

  // Settings
  settings: {
    priceUpdateInterval: number;  // milliseconds
    autoHeal: boolean;
    battleAnimations: boolean;
  };

  // Actions - Existing
  addPokeballs: (amount: number) => void;
  usePokeball: () => void;
  catchToken: (token: Omit<CaughtToken, 'level' | 'health'>) => void;
  sellToken: (address: string) => void;

  // Actions - New: Items
  addItem: (itemType: keyof GameStore['items'], quantity: number) => void;
  useItem: (itemType: keyof GameStore['items'], tokenAddress: string) => void;

  // Actions - New: Health/Leveling
  updateTokenPrice: (address: string, newPrice: number) => void;
  updateTokenHealth: (address: string, newHealth: number) => void;
  healToken: (address: string, amount: number) => void;
  reviveToken: (address: string) => void;
  levelUpToken: (address: string) => void;

  // Actions - New: Battle
  startBattle: (opponentToken: CaughtToken, isGym: boolean, gymData?: any) => void;
  selectMove: (participant: 'player' | 'opponent', move: Move) => void;
  executeTurn: () => void;
  endBattle: (winner: 'player' | 'opponent', rewards: BattleRewards) => void;

  // Actions - New: Badges
  earnBadge: (badge: Badge) => void;

  // Actions - New: Price tracking
  updateAllPrices: () => Promise<void>;
}
```

---

## 3. Core Systems Implementation

### Price Tracking System

```typescript
// game/systems/PriceTracker.ts

export class PriceTracker {
  private updateInterval: number;
  private intervalId?: NodeJS.Timeout;

  constructor(updateInterval: number = 300000) {  // 5 minutes
    this.updateInterval = updateInterval;
  }

  start() {
    this.intervalId = setInterval(() => {
      this.updatePrices();
    }, this.updateInterval);

    // Initial update
    this.updatePrices();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private async updatePrices() {
    const store = (window as any).gameStore;
    if (!store) return;

    const inventory = store.getState().inventory;
    const addresses = inventory.map((t: CaughtToken) => t.address);

    try {
      const response = await fetch('/api/tokens/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addresses }),
      });

      const prices = await response.json();

      // Update each token
      for (const token of inventory) {
        const newPrice = prices[token.address];
        if (newPrice) {
          store.getState().updateTokenPrice(token.address, newPrice);
        }
      }
    } catch (error) {
      console.error('Failed to update prices:', error);
    }
  }
}
```

### Leveling System

```typescript
// game/systems/LevelingSystem.ts

export class LevelingSystem {
  static calculateLevel(purchasePrice: number, currentPrice: number): number {
    if (currentPrice <= 0 || purchasePrice <= 0) return 1;

    const priceRatio = currentPrice / purchasePrice;
    const level = Math.floor(priceRatio);

    return Math.max(1, Math.min(100, level));
  }

  static calculateStats(level: number, baseStats?: Partial<TokenStats>): TokenStats {
    const base = {
      attack: baseStats?.attack || 10,
      defense: baseStats?.defense || 10,
      speed: baseStats?.speed || 10,
      hp: baseStats?.hp || 50,
    };

    return {
      attack: base.attack + (level * 5),
      defense: base.defense + (level * 5),
      speed: base.speed + (level * 2),
      hp: base.hp + (level * 10),
    };
  }

  static calculateMaxHealth(level: number): number {
    return 50 + (level * 10);
  }

  static checkLevelUp(token: CaughtToken, newPrice: number): boolean {
    const newLevel = this.calculateLevel(token.purchasePrice, newPrice);
    return newLevel > token.level;
  }
}
```

### Damage Calculator

```typescript
// game/systems/DamageCalculator.ts

export class DamageCalculator {
  static calculatePriceDamage(
    purchasePrice: number,
    peakPrice: number,
    currentPrice: number,
    maxHealth: number
  ): number {
    if (currentPrice >= peakPrice) return 0;

    const priceDropPercent = ((peakPrice - currentPrice) / peakPrice) * 100;
    const damagePercent = priceDropPercent / 2;  // Half the price drop
    const healthLost = (damagePercent / 100) * maxHealth;

    return Math.floor(healthLost);
  }

  static calculateBattleDamage(
    attacker: BattleParticipant,
    defender: BattleParticipant,
    move: Move
  ): number {
    if (move.type !== 'attack' && move.type !== 'special') return 0;

    // Miss chance
    if (Math.random() * 100 > move.accuracy) return 0;

    const baseDamage = move.power;
    const attackMultiplier = attacker.temporaryStats.attack / 10;
    const defenseMultiplier = defender.temporaryStats.defense / 20;
    const randomFactor = Math.random() * 0.2 + 0.9;  // 0.9-1.1x

    let damage = baseDamage * attackMultiplier - defenseMultiplier;
    damage = Math.max(1, damage);
    damage *= randomFactor;

    return Math.floor(damage);
  }

  static applyDefense(damage: number, isDefending: boolean): number {
    if (isDefending) {
      return Math.floor(damage * 0.5);
    }
    return damage;
  }
}
```

### Battle Manager

```typescript
// game/systems/BattleManager.ts

export class BattleManager {
  private battleState: BattleState;

  constructor(
    playerToken: CaughtToken,
    opponentToken: CaughtToken,
    isGym: boolean = false,
    gymData?: any
  ) {
    this.battleState = {
      id: Date.now().toString(),
      type: isGym ? 'gym' : 'wild',
      player: {
        name: 'Player',
        token: playerToken,
        currentHP: playerToken.health,
        temporaryStats: { ...playerToken.stats },
        statusEffects: [],
      },
      opponent: {
        name: gymData?.leader || 'Wild Token',
        token: opponentToken,
        currentHP: opponentToken.health,
        temporaryStats: { ...opponentToken.stats },
        statusEffects: [],
      },
      turn: 'player',
      turnNumber: 1,
      phase: 'select_move',
      log: [],
      gymData: isGym ? gymData : undefined,
    };
  }

  selectMove(participant: 'player' | 'opponent', move: Move) {
    this.battleState[participant].selectedMove = move;

    // If both have selected, execute turn
    if (this.battleState.player.selectedMove && this.battleState.opponent.selectedMove) {
      this.executeTurn();
    }
  }

  private executeTurn() {
    this.battleState.phase = 'animating';

    // Determine order based on speed
    const playerSpeed = this.battleState.player.temporaryStats.speed;
    const opponentSpeed = this.battleState.opponent.temporaryStats.speed;

    const firstAttacker = playerSpeed >= opponentSpeed ? 'player' : 'opponent';
    const secondAttacker = firstAttacker === 'player' ? 'opponent' : 'player';

    // Execute moves in order
    this.executeMove(firstAttacker);

    if (!this.checkBattleEnd()) {
      this.executeMove(secondAttacker);
      this.checkBattleEnd();
    }

    // Clear selections and increment turn
    this.battleState.player.selectedMove = undefined;
    this.battleState.opponent.selectedMove = undefined;
    this.battleState.turnNumber++;
    this.battleState.phase = 'select_move';
  }

  private executeMove(participant: 'player' | 'opponent') {
    const attacker = this.battleState[participant];
    const defender = this.battleState[participant === 'player' ? 'opponent' : 'player'];
    const move = attacker.selectedMove!;

    this.addLog(`${attacker.name} used ${move.name}!`, 'move');

    switch (move.type) {
      case 'attack':
      case 'special':
        const damage = DamageCalculator.calculateBattleDamage(attacker, defender, move);
        if (damage === 0) {
          this.addLog('The attack missed!', 'status');
        } else {
          defender.currentHP = Math.max(0, defender.currentHP - damage);
          this.addLog(`Dealt ${damage} damage!`, 'damage');
        }
        break;

      case 'defend':
        const healAmount = Math.floor(attacker.token.maxHealth * 0.1);
        attacker.currentHP = Math.min(
          attacker.token.maxHealth,
          attacker.currentHP + healAmount
        );
        this.addLog(`Restored ${healAmount} HP!`, 'heal');

        // Apply defense buff
        if (move.effect?.type === 'buff') {
          attacker.temporaryStats.defense *= 1.5;
          this.addLog('Defense increased!', 'status');
        }
        break;

      case 'status':
        if (move.effect?.type === 'heal') {
          const healPercent = move.effect.value / 100;
          const healAmount = Math.floor(attacker.token.maxHealth * healPercent);
          attacker.currentHP = Math.min(
            attacker.token.maxHealth,
            attacker.currentHP + healAmount
          );
          this.addLog(`Restored ${healAmount} HP!`, 'heal');
        }
        break;
    }
  }

  private checkBattleEnd(): boolean {
    if (this.battleState.player.currentHP <= 0) {
      this.endBattle('opponent');
      return true;
    }

    if (this.battleState.opponent.currentHP <= 0) {
      this.endBattle('player');
      return true;
    }

    return false;
  }

  private endBattle(winner: 'player' | 'opponent') {
    this.battleState.phase = 'ended';
    this.battleState.winner = winner;

    this.addLog(
      winner === 'player' ? 'You won the battle!' : 'You were defeated!',
      'result'
    );

    // Calculate rewards
    if (winner === 'player') {
      this.battleState.rewards = this.calculateRewards();
    }
  }

  private calculateRewards(): BattleRewards {
    const rewards: BattleRewards = {};

    if (this.battleState.type === 'gym') {
      // Award badge
      rewards.badge = this.battleState.gymData!.badge;
      rewards.usdc = 100 * this.battleState.gymData!.badge.order;
    } else {
      // Wild battle rewards
      rewards.experience = 10 * this.battleState.opponent.token.level;
    }

    return rewards;
  }

  private addLog(message: string, type: BattleLogEntry['type']) {
    this.battleState.log.push({
      timestamp: Date.now(),
      turn: this.battleState.turnNumber,
      message,
      type,
    });
  }

  getState(): BattleState {
    return this.battleState;
  }
}
```

---

## 4. New Scenes

### Battle Scene

```typescript
// game/scenes/BattleScene.ts

export class BattleScene extends Phaser.Scene {
  private battleManager?: BattleManager;
  private playerSprite?: Phaser.GameObjects.Rectangle;
  private opponentSprite?: Phaser.GameObjects.Rectangle;
  private playerHealthBar?: Phaser.GameObjects.Graphics;
  private opponentHealthBar?: Phaser.GameObjects.Graphics;
  private battleLog?: Phaser.GameObjects.Text;
  private moveButtons?: Phaser.GameObjects.Text[];

  constructor() {
    super('BattleScene');
  }

  create(data: { playerToken: CaughtToken; opponentToken: CaughtToken; isGym: boolean }) {
    // Initialize battle manager
    this.battleManager = new BattleManager(
      data.playerToken,
      data.opponentToken,
      data.isGym
    );

    // Set up battle UI
    this.setupBattlefield();
    this.setupHealthBars();
    this.setupMoveSelection();
    this.setupBattleLog();

    // Start battle
    this.updateDisplay();
  }

  private setupBattlefield() {
    // Background
    this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x87CEEB)
      .setOrigin(0);

    // Token sprites (placeholders for now)
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    this.opponentSprite = this.add.rectangle(
      centerX + 60,
      centerY - 40,
      32,
      32,
      0xFF0000
    );

    this.playerSprite = this.add.rectangle(
      centerX - 60,
      centerY + 20,
      32,
      32,
      0x00FF00
    );
  }

  private setupHealthBars() {
    // Health bars will be graphics that update each frame
    this.playerHealthBar = this.add.graphics();
    this.opponentHealthBar = this.add.graphics();
  }

  private setupMoveSelection() {
    const moves = this.battleManager!.getState().player.token.moves;
    this.moveButtons = [];

    const startY = this.cameras.main.height - 40;

    moves.forEach((move, i) => {
      const x = 10 + (i % 2) * 80;
      const y = startY + Math.floor(i / 2) * 15;

      const button = this.add.text(x, y, `> ${move.name}`, {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#9bbc0f',
      }).setInteractive();

      button.on('pointerdown', () => this.selectMove(move));

      this.moveButtons.push(button);
    });
  }

  private selectMove(move: Move) {
    this.battleManager!.selectMove('player', move);

    // AI selects move
    const opponentMoves = this.battleManager!.getState().opponent.token.moves;
    const randomMove = opponentMoves[Math.floor(Math.random() * opponentMoves.length)];
    this.battleManager!.selectMove('opponent', randomMove);

    // Update display
    this.time.delayedCall(500, () => {
      this.updateDisplay();
      this.checkBattleEnd();
    });
  }

  private updateDisplay() {
    const state = this.battleManager!.getState();

    // Update health bars
    this.drawHealthBar(
      this.playerHealthBar!,
      20,
      this.cameras.main.height - 60,
      state.player.currentHP,
      state.player.token.maxHealth
    );

    this.drawHealthBar(
      this.opponentHealthBar!,
      this.cameras.main.width - 100,
      20,
      state.opponent.currentHP,
      state.opponent.token.maxHealth
    );

    // Update battle log
    const lastLog = state.log[state.log.length - 1];
    if (lastLog && this.battleLog) {
      this.battleLog.setText(lastLog.message);
    }
  }

  private drawHealthBar(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    current: number,
    max: number
  ) {
    graphics.clear();

    const width = 80;
    const height = 6;
    const percent = current / max;

    // Background
    graphics.fillStyle(0x000000);
    graphics.fillRect(x, y, width, height);

    // Health
    const healthColor = percent > 0.5 ? 0x00FF00 : percent > 0.25 ? 0xFFFF00 : 0xFF0000;
    graphics.fillStyle(healthColor);
    graphics.fillRect(x, y, width * percent, height);
  }

  private checkBattleEnd() {
    const state = this.battleManager!.getState();

    if (state.phase === 'ended') {
      this.time.delayedCall(2000, () => {
        // Return to overworld or gym
        this.scene.stop();
        this.scene.resume('OverworldScene');

        // Apply rewards
        if (state.winner === 'player' && state.rewards) {
          const store = (window as any).gameStore;
          if (state.rewards.badge) {
            store.getState().earnBadge(state.rewards.badge);
          }
        }
      });
    }
  }

  private setupBattleLog() {
    this.battleLog = this.add.text(
      10,
      this.cameras.main.height - 70,
      '',
      {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#9bbc0f',
      }
    );
  }
}
```

### Healing Center Scene

```typescript
// game/scenes/HealingCenterScene.ts

export class HealingCenterScene extends Phaser.Scene {
  private dialogText?: Phaser.GameObjects.Text;
  private menuText?: Phaser.GameObjects.Text;
  private selectedOption = 0;
  private menuOptions: string[] = [];

  constructor() {
    super('HealingCenterScene');
  }

  create() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    // Background
    this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0xFFB6C1)
      .setOrigin(0);

    // Nurse NPC
    this.add.rectangle(centerX, centerY - 40, 16, 16, 0xFFFFFF);

    // Dialog box
    this.add.rectangle(
      0,
      this.cameras.main.height - 50,
      this.cameras.main.width,
      50,
      0x000000,
      0.8
    ).setOrigin(0);

    // Welcome message
    this.dialogText = this.add.text(
      8,
      this.cameras.main.height - 45,
      'Welcome to the Healing Center!\\nHow can I help you?',
      {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#9bbc0f',
      }
    );

    // Menu
    this.menuText = this.add.text(
      8,
      this.cameras.main.height - 45,
      '',
      {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#9bbc0f',
      }
    ).setVisible(false);

    // Show menu after delay
    this.time.delayedCall(1500, () => {
      this.showMainMenu();
    });

    // Input
    this.input.keyboard?.on('keydown-UP', () => this.moveSelection(-1));
    this.input.keyboard?.on('keydown-DOWN', () => this.moveSelection(1));
    this.input.keyboard?.on('keydown-ENTER', () => this.confirmSelection());
    this.input.keyboard?.on('keydown-SPACE', () => this.confirmSelection());
    this.input.keyboard?.on('keydown-ESC', () => this.exitCenter());
  }

  private showMainMenu() {
    this.dialogText?.setVisible(false);
    this.menuText?.setVisible(true);

    const store = (window as any).gameStore?.getState();
    const knockedOutTokens = store?.inventory.filter((t: CaughtToken) => t.isKnockedOut) || [];

    this.menuOptions = [
      'Heal All (FREE)',
      `Revive Token (${knockedOutTokens.length} knocked out)`,
      'Full Restore',
      'Exit',
    ];

    this.updateMenuOptions();
  }

  private updateMenuOptions() {
    const options = this.menuOptions.map((option, i) =>
      `${i === this.selectedOption ? '>' : ' '} ${option}`
    );

    this.menuText?.setText(options.join('\\n'));
  }

  private moveSelection(direction: number) {
    this.selectedOption = (this.selectedOption + direction + this.menuOptions.length) % this.menuOptions.length;
    this.updateMenuOptions();
  }

  private confirmSelection() {
    const store = (window as any).gameStore;
    if (!store) return;

    switch (this.selectedOption) {
      case 0:  // Heal All
        this.healAll();
        break;
      case 1:  // Revive Token
        this.showReviveMenu();
        break;
      case 2:  // Full Restore
        this.fullRestore();
        break;
      case 3:  // Exit
        this.exitCenter();
        break;
    }
  }

  private healAll() {
    const store = (window as any).gameStore;
    const inventory = store.getState().inventory;

    inventory.forEach((token: CaughtToken) => {
      if (!token.isKnockedOut) {
        store.getState().healToken(token.address, token.maxHealth);
      }
    });

    this.dialogText?.setVisible(true).setText('Your tokens are fully healed!');
    this.menuText?.setVisible(false);

    this.time.delayedCall(2000, () => this.exitCenter());
  }

  private showReviveMenu() {
    // TODO: Show list of knocked out tokens to revive
    this.dialogText?.setVisible(true).setText('Select a token to revive.');
  }

  private fullRestore() {
    // TODO: Calculate cost and restore all
    this.dialogText?.setVisible(true).setText('Full restore not yet implemented.');
  }

  private exitCenter() {
    this.cameras.main.fade(300, 255, 182, 193);

    this.time.delayedCall(300, () => {
      this.input.keyboard?.off('keydown-UP');
      this.input.keyboard?.off('keydown-DOWN');
      this.input.keyboard?.off('keydown-ENTER');
      this.input.keyboard?.off('keydown-SPACE');
      this.input.keyboard?.off('keydown-ESC');

      this.scene.stop();
      this.scene.resume('OverworldScene');
    });
  }
}
```

---

## 5. API Routes

### Price Update Route

```typescript
// app/api/tokens/prices/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { addresses } = await req.json();

  if (!addresses || !Array.isArray(addresses)) {
    return NextResponse.json(
      { error: 'Invalid addresses array' },
      { status: 400 }
    );
  }

  // Fetch prices from CoinGecko or similar
  // This is a simplified version
  const prices: Record<string, number> = {};

  for (const address of addresses) {
    try {
      // In production, batch these requests or use a price aggregator
      const response = await fetch(
        `https://api.example.com/price/${address}`
      );
      const data = await response.json();
      prices[address] = data.price;
    } catch (error) {
      console.error(`Failed to fetch price for ${address}:`, error);
      // Keep existing price
    }
  }

  return NextResponse.json(prices);
}
```

### Price History Route

```typescript
// app/api/tokens/[address]/price-history/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { address: string } }
) {
  const address = params.address;
  const searchParams = req.nextUrl.searchParams;
  const days = searchParams.get('days') || '7';

  // Fetch historical price data
  // This would come from your price data provider

  return NextResponse.json({
    address,
    prices: [
      // Array of {timestamp, price} objects
    ],
  });
}
```

---

## 6. Implementation Phases

### Phase 1: Foundation (Week 1)
**Goal**: Set up price tracking and leveling

- [ ] Create new data models (token, battle, moves)
- [ ] Update game store with new fields
- [ ] Implement PriceTracker system
- [ ] Implement LevelingSystem
- [ ] Create price update API route
- [ ] Modify EncounterScene to record purchase price
- [ ] Add level display to inventory
- [ ] Test price updates and level calculations

### Phase 2: Health System (Week 1-2)
**Goal**: Implement damage from price drops

- [ ] Implement DamageCalculator
- [ ] Add health tracking to all tokens
- [ ] Create health bar UI component
- [ ] Update inventory to show health
- [ ] Add knocked out state
- [ ] Test damage calculations

### Phase 3: Healing (Week 2)
**Goal**: Add healing mechanics

- [ ] Create HealingCenterScene
- [ ] Add Healing Center to overworld
- [ ] Implement free healing
- [ ] Implement paid revival
- [ ] Add potions to store
- [ ] Create item usage system
- [ ] Test all healing mechanics

### Phase 4: Basic Battle (Week 2-3)
**Goal**: Working turn-based combat

- [ ] Create BattleScene
- [ ] Implement BattleManager
- [ ] Add default moves to all tokens
- [ ] Implement turn execution
- [ ] Create battle UI
- [ ] Add battle animations
- [ ] Test combat flow

### Phase 5: Gyms (Week 3-4)
**Goal**: Gym system with badges

- [ ] Design 8 gym locations
- [ ] Create gym leader data
- [ ] Implement gym battles
- [ ] Create badge system
- [ ] Add badges to UI
- [ ] Test progression

### Phase 6: Enhanced Cryptodex (Week 4)
**Goal**: Detailed token information

- [ ] Redesign Cryptodex UI
- [ ] Add tabs (Overview, Stats, Market, Moves)
- [ ] Integrate market data
- [ ] Show level history
- [ ] Add token descriptions
- [ ] Test all views

### Phase 7: Polish (Week 5)
**Goal**: Refinement and balance

- [ ] Add battle animations
- [ ] Improve AI
- [ ] Balance testing
- [ ] Add sound effects
- [ ] Performance optimization
- [ ] Bug fixes

---

## 7. Testing Strategy

### Unit Tests
- Price calculations
- Level calculations
- Damage formulas
- Battle logic
- Move effects

### Integration Tests
- Price tracking system
- Battle flow
- Gym progression
- Item usage
- State persistence

### Balance Testing
- Token level progression
- Damage rates
- Gym difficulty
- Economy (USDC costs)
- Move power levels

---

## 8. Performance Considerations

### Optimization Targets
- Price updates: Batch requests, cache results
- Battle calculations: Pre-compute where possible
- UI updates: Debounce health bar updates
- State management: Optimize large inventories
- Memory: Clean up battle state after battles

### Monitoring
- Track price update frequency
- Monitor API rate limits
- Measure battle scene performance
- Track state size growth

---

**Status**: Ready for Phase 1 Implementation
**Next Step**: Create data models and update game store
