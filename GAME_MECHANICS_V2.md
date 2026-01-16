# Game Mechanics V2 - Swap 'Em All

**Version**: 2.0
**Date**: 2026-01-16
**Status**: Planning Phase

---

## Overview

This document outlines the enhanced game mechanics that add RPG depth to the token-catching gameplay.

---

## 1. Price-Based Leveling System

### Core Concept
Tokens grow stronger as their real-world price increases, creating a dynamic connection between crypto markets and gameplay.

### Mechanics

#### Purchase Price Recording
- When a token is caught, record its current price from the API
- This becomes the "base price" for that specific token instance
- Each player's token has its own unique price history

#### Leveling Formula
```
Level = floor(Current Price / Purchase Price)
Minimum Level = 1 (at purchase)
Maximum Level = 100
```

**Examples**:
- Caught WETH at $2,000 → Level 1
- WETH rises to $4,000 → Level 2
- WETH rises to $10,000 → Level 5
- WETH rises to $20,000 → Level 10

#### Stat Growth per Level
```typescript
HP = 50 + (level * 10)
Attack = 10 + (level * 5)
Defense = 10 + (level * 5)
Speed = 10 + (level * 2)
```

**Level 1 Stats**: HP: 50, ATK: 10, DEF: 10, SPD: 10
**Level 10 Stats**: HP: 150, ATK: 60, DEF: 60, SPD: 30

#### Max Level Preservation
- Tokens remember their highest level achieved
- If price drops, level stays at max
- But health takes damage based on price drop

### Damage System

#### Price Drop Damage
When token price decreases from its peak:

```typescript
priceDropPercent = ((peakPrice - currentPrice) / peakPrice) * 100
damagePercent = priceDropPercent / 2  // Half the price drop
healthLost = (damagePercent / 100) * maxHealth
```

**Example**:
- Token peaked at $10,000 (Level 5, HP: 100/100)
- Price drops to $8,000 (20% drop)
- Damage: 20% / 2 = 10% health lost
- New HP: 90/100
- Level stays at 5

#### Health States
- **100-75% HP**: Healthy (green)
- **74-50% HP**: Injured (yellow)
- **49-25% HP**: Badly Injured (orange)
- **24-1% HP**: Critical (red, flashing)
- **0% HP**: Knocked Out (cannot battle)

#### Knocked Out State
- Token can't be used in battles
- Still shows in inventory but grayed out
- Needs revival at Healing Center
- Revival costs USDC (scales with level)

---

## 2. Battle System

### Battle Types

#### Wild Encounters (Current)
- Catching tokens via swap
- No battle required
- Keep current encounter system

#### Gym Battles (New)
- PvE battles against gym leaders
- Must defeat to earn badge
- Strategic turn-based combat

#### Future: PvP Battles
- Player vs Player
- Wager USDC or tokens
- Leaderboard rankings

### Battle Mechanics

#### Turn-Based Combat
1. Both trainers select a move
2. Speed stat determines who goes first
3. Moves execute in order
4. Repeat until one token faints

#### Move Types (V1 - Simple)

**Attack**
- Deals damage based on attacker's ATK and defender's DEF
- Formula: `damage = (ATK * 2) - (DEF / 2) + random(0, 10)`
- 95% accuracy

**Defend**
- Reduces incoming damage by 50% for this turn
- Restores 10% HP
- 100% accuracy

**Special Move** (token-specific, future)
- Unique to each token type
- Higher power but lower accuracy
- May have side effects

#### Damage Calculation
```typescript
function calculateDamage(attacker, defender, move) {
  const baseDamage = move.power;
  const attackMultiplier = attacker.stats.attack / 10;
  const defenseMultiplier = defender.stats.defense / 20;
  const randomFactor = Math.random() * 0.2 + 0.9; // 0.9-1.1x

  let damage = baseDamage * attackMultiplier - defenseMultiplier;
  damage = Math.max(1, damage); // Minimum 1 damage
  damage *= randomFactor;

  return Math.floor(damage);
}
```

#### Battle End Conditions
- **Victory**: Opponent's token reaches 0 HP
- **Defeat**: Your token reaches 0 HP
- **Flee**: Run away (only in wild encounters, not gyms)

### Gym System

#### Gym Structure
- 8 gyms across the map
- Each gym has a theme/specialty
- Must defeat gym leader to earn badge
- Gym leaders have 1-3 tokens (scales with gym #)

#### Gym Themes (Proposed)
1. **Stablecoin Gym** (Rookie) - Leader: "Peg Master"
   - Specialty: USDC, DAI, USDT
   - Badge: Stable Badge

2. **DeFi Blue Chip Gym** - Leader: "Protocol Pete"
   - Specialty: UNI, AAVE, LINK
   - Badge: DeFi Badge

3. **Layer 2 Gym** - Leader: "Scaler Sam"
   - Specialty: OP, ARB, MATIC
   - Badge: Scale Badge

4. **Meme Gym** - Leader: "Viral Vince"
   - Specialty: DOGE, SHIB, PEPE
   - Badge: Meme Badge

5. **Exchange Token Gym** - Leader: "CEX Charlie"
   - Specialty: BNB, CRO, FTT
   - Badge: Exchange Badge

6. **Governance Gym** - Leader: "DAO Diana"
   - Specialty: COMP, MKR, ENS
   - Badge: Governance Badge

7. **Wrapped Asset Gym** - Leader: "Wrapper Will"
   - Specialty: WBTC, WETH, stETH
   - Badge: Wrapped Badge

8. **Elite Gym** (Champion) - Leader: "Satoshi Supreme"
   - Specialty: Mixed high-level tokens
   - Badge: Champion Badge

#### Gym Leader AI
- Uses simple strategy for V1:
  - Attack when HP > 50%
  - Defend when HP < 50%
  - Random 10% of the time
- Future: More sophisticated AI with move prediction

#### Badge Benefits
- Required to progress to certain areas
- Unlock new NPCs or shops
- Slight stat boost to all your tokens (1% per badge)
- Prestige/collection aspect

---

## 3. Enhanced Cryptodex

### New Information Displayed

#### Token Overview
```
┌─────────────────────────────────────┐
│ #042 ETHEREUM (ETH)          Lv. 15 │
│ ═══════════════════════════════════ │
│ HP: ██████████████████░░ 180/200    │
│                                     │
│ [Token Sprite]                      │
│                                     │
│ DESCRIPTION:                        │
│ The leading smart contract platform │
│ Known for its security and vast     │
│ ecosystem of dApps.                 │
│                                     │
│ TYPE: Layer 1        RARITY: Rare   │
└─────────────────────────────────────┘
```

#### Stats Tab
```
┌─────────────────────────────────────┐
│ BATTLE STATS                        │
│ ═══════════════════════════════════ │
│ Attack:  █████████░░ 85             │
│ Defense: ███████░░░░ 70             │
│ Speed:   ████████░░░ 80             │
│ HP:      ██████████░ 200            │
│                                     │
│ MOVES:                              │
│ • Smart Contract (ATK: 80)          │
│ • Gas Shield (DEF: +50%)            │
│ • Network Effect (ATK: 100, -ACC)   │
│ • Stake (Heal 25%)                  │
└─────────────────────────────────────┘
```

#### Market Data Tab
```
┌─────────────────────────────────────┐
│ MARKET DATA                         │
│ ═══════════════════════════════════ │
│ Current Price:  $3,450.23           │
│ Purchase Price: $2,000.00           │
│ Price Change:   +72.5% ▲            │
│                                     │
│ Market Cap:     $415.2B             │
│ 24h Volume:     $15.3B              │
│ All-Time High:  $4,878.26           │
│                                     │
│ LEVEL HISTORY:                      │
│ Lv 15 - $30,000 (12/20/2025)       │
│ Lv 10 - $20,000 (10/15/2025)       │
│ Lv 5  - $10,000 (08/05/2025)       │
│ Lv 1  - $2,000  (06/01/2025)       │
└─────────────────────────────────────┘
```

#### Moves Tab (Detailed)
```
┌─────────────────────────────────────┐
│ SMART CONTRACT                      │
│ ═══════════════════════════════════ │
│ Type:     Attack                    │
│ Power:    80                        │
│ Accuracy: 95%                       │
│                                     │
│ Deploy a devastating smart contract │
│ that executes complex logic against │
│ the opponent.                       │
│                                     │
│ [Learned at Level 5]                │
└─────────────────────────────────────┘
```

---

## 4. Healing System

### Healing Center NPC

#### Location
- New building in overworld (purple/pink color)
- Nurse-type NPC character
- Free healing for non-knocked out tokens
- Paid revival for knocked out tokens

#### Services

**Heal All Tokens** (Free)
- Restores all tokens to max HP
- Instant process
- Available anytime
- Dialogue: "Your tokens are fully healed!"

**Revive Token** (Paid)
- Cost scales with level: `reviveCost = level * 10 USDC`
- Restores to 50% HP
- Dialogue: "That will be {cost} USDC to revive {token}"

**Full Restore** (Paid)
- Heal + Revive all tokens at once
- Cost: `totalCost = sum(knocked out tokens * level * 10) USDC`
- Batch operation discount (10% off)

### Potions (Store Items)

#### Potion Types

**Regular Potion** - 5 USDC
- Restores 20 HP
- Can be used in battle or overworld
- Most common healing item

**Super Potion** - 15 USDC
- Restores 50 HP
- Better value for high-level tokens

**Hyper Potion** - 40 USDC
- Restores 100 HP
- For elite tokens

**Max Potion** - 100 USDC
- Fully restores HP
- Most expensive but most efficient

**Revive** - 50 USDC
- Revives knocked out token to 50% HP
- Can be used in overworld only (not in battle)

**Max Revive** - 200 USDC
- Revives and fully restores HP
- Rare and expensive

#### Using Items
- New "Bag" menu accessible from overworld
- Select item → Select token → Confirm
- Can use during battle (costs your turn)
- Can use from inventory screen

---

## 5. Token-Specific Moves (Future)

### Move Categories

#### Standard Moves (All Tokens)
- **Attack**: Basic damage
- **Defend**: Reduce damage + heal
- **Rest**: Sleep 1 turn, restore 50% HP

#### DeFi-Themed Moves

**Liquidity Pool** (UNI, AAVE, SUSHI)
- Type: Special
- Effect: Absorb 25% of damage dealt as healing

**Yield Farm** (COMP, CRV, BAL)
- Type: Defend
- Effect: Generate 10% HP per turn for 3 turns

**Flash Loan** (AAVE, DYDX)
- Type: Attack
- Effect: Massive damage but costs HP

#### Meme Coin Moves

**To The Moon** (DOGE, SHIB)
- Type: Attack
- Effect: Damage increases with each use

**Diamond Hands** (DOGE, PEPE)
- Type: Defend
- Effect: Cannot be knocked out for 1 turn

**HODL** (All meme coins)
- Type: Defend
- Effect: Defense boost that grows over time

#### Stablecoin Moves

**Peg Anchor** (USDC, DAI)
- Type: Defend
- Effect: Set defense to maximum

**Redemption** (USDT, USDC)
- Type: Special
- Effect: Convert HP to attack power

---

## 6. Data Models

### Updated Token Schema

```typescript
interface CaughtToken {
  // Existing fields
  symbol: string;
  name: string;
  address: string;
  caughtAt: number;

  // New: Price tracking
  purchasePrice: number;        // Price when caught
  currentPrice: number;         // Latest price from API
  peakPrice: number;           // Highest price seen
  priceHistory: PricePoint[];  // Historical data

  // New: Leveling
  level: number;               // Current level (1-100)
  maxLevel: number;            // Highest level achieved
  experience: number;          // For future exp system

  // New: Health
  health: number;              // Current HP (0-maxHealth)
  maxHealth: number;           // Based on level
  isKnockedOut: boolean;       // true when health = 0

  // New: Battle stats
  stats: {
    attack: number;
    defense: number;
    speed: number;
    hp: number;
  };

  // New: Moves
  moves: Move[];

  // New: History
  levelHistory: LevelHistoryEntry[];
}

interface Move {
  id: string;
  name: string;
  type: 'attack' | 'defend' | 'special';
  power: number;
  accuracy: number;
  description: string;
  effect?: MoveEffect;
  learnedAt: number;  // Level when learned
}

interface MoveEffect {
  type: 'heal' | 'buff' | 'debuff' | 'status';
  value: number;
  duration?: number;
}

interface LevelHistoryEntry {
  level: number;
  price: number;
  timestamp: number;
  event: 'level_up' | 'level_down' | 'damage_taken';
}

interface PricePoint {
  price: number;
  timestamp: number;
}

interface Badge {
  id: string;
  name: string;
  gymName: string;
  gymLeader: string;
  earnedAt?: number;
  icon: string;
}

interface BattleState {
  playerToken: CaughtToken;
  opponentToken: CaughtToken;
  playerHP: number;
  opponentHP: number;
  turn: 'player' | 'opponent';
  turnNumber: number;
  battleLog: string[];
  isGymBattle: boolean;
  gymLeader?: string;
}
```

### Updated Store Schema

```typescript
interface GameStore {
  // Existing
  pokeballs: number;
  inventory: CaughtToken[];
  cryptodex: CaughtToken[];
  tutorialComplete: boolean;

  // New: Items
  items: {
    potions: number;
    superPotions: number;
    hyperPotions: number;
    maxPotions: number;
    revives: number;
    maxRevives: number;
  };

  // New: Badges
  badges: Badge[];

  // New: Battle
  activeBattle?: BattleState;

  // Actions
  addItem: (itemType: string, quantity: number) => void;
  useItem: (itemType: string, tokenAddress: string) => void;
  earnBadge: (badge: Badge) => void;
  updateTokenPrice: (address: string, newPrice: number) => void;
  updateTokenHealth: (address: string, newHealth: number) => void;
  reviveToken: (address: string) => void;
}
```

---

## 7. Implementation Roadmap

### Phase 1: Price Tracking & Leveling (Week 1)
- [ ] Update API to include historical price data
- [ ] Modify catch mechanism to record purchase price
- [ ] Implement level calculation based on price
- [ ] Add price polling system (every 5 minutes)
- [ ] Update inventory display with levels
- [ ] Add level-up notifications

### Phase 2: Health & Damage System (Week 1-2)
- [ ] Implement damage calculation from price drops
- [ ] Add health tracking to all tokens
- [ ] Create knocked out state
- [ ] Update UI to show health bars
- [ ] Add health status indicators

### Phase 3: Healing System (Week 2)
- [ ] Create HealingCenterScene
- [ ] Add Healing Center NPC to overworld
- [ ] Implement free healing service
- [ ] Implement paid revival service
- [ ] Add potions to store
- [ ] Create item usage system

### Phase 4: Basic Battle System (Week 2-3)
- [ ] Create BattleScene
- [ ] Implement turn-based combat
- [ ] Add basic moves (Attack, Defend)
- [ ] Create damage calculation system
- [ ] Add battle UI with health bars
- [ ] Test battle flow

### Phase 5: Gym System (Week 3-4)
- [ ] Design gym locations on map
- [ ] Create GymScene
- [ ] Implement gym leader AI
- [ ] Add 8 gym leaders with teams
- [ ] Create badge system
- [ ] Add badge display to UI
- [ ] Implement progression gating

### Phase 6: Enhanced Cryptodex (Week 4)
- [ ] Redesign Cryptodex UI with tabs
- [ ] Add market data integration
- [ ] Display battle stats
- [ ] Show move details
- [ ] Add level history
- [ ] Create detailed token descriptions

### Phase 7: Token-Specific Moves (Week 5)
- [ ] Design unique moves for top 20 tokens
- [ ] Implement move effects system
- [ ] Add move animations
- [ ] Create move learning system
- [ ] Balance testing

---

## 8. UI/UX Mockups

### Battle Screen
```
┌─────────────────────────────────────┐
│ GYM LEADER PETE        YOU          │
│                                     │
│ [SPRITE]               [SPRITE]     │
│ UNI Lv.15              WETH Lv.12   │
│ HP: ████████░░ 120/150 HP: ████▓▓░░ 85/120 │
│                                     │
│ ───────────────────────────────────│
│                                     │
│ What will WETH do?                  │
│                                     │
│ > ATTACK         DEFEND             │
│   SMART CONTRACT REST               │
│                                     │
│   [BAG]          [RUN]              │
└─────────────────────────────────────┘
```

### Healing Center
```
┌─────────────────────────────────────┐
│        HEALING CENTER               │
│                                     │
│     [NURSE SPRITE]                  │
│                                     │
│  "Welcome! Would you like me        │
│   to heal your tokens?"             │
│                                     │
│  > Heal All (FREE)                  │
│    Revive Token (Varies)            │
│    Full Restore (Varies)            │
│    Exit                             │
│                                     │
│ YOUR TEAM:                          │
│ • WETH Lv.12 [HP: 85/120]          │
│ • UNI Lv.8   [HP: 90/90]           │
│ • USDC Lv.5  [KNOCKED OUT]         │
└─────────────────────────────────────┘
```

---

## 9. Technical Considerations

### API Requirements
- Need real-time or frequent price updates
- Historical price data for level calculation
- Efficient caching to avoid rate limits
- Fallback for when API is unavailable

### Performance
- Price updates should be throttled (every 5 min)
- Battle calculations must be instant
- Smooth animations during battles
- Efficient state management for large inventories

### Balance
- Level scaling needs tuning
- Damage formulas need playtesting
- Gym difficulty curve
- Item pricing economy

### Future Enhancements
- Multiplayer battles
- Tournament system
- Seasonal events
- Trading system
- Token breeding/evolution
- Achievement system

---

## 10. Success Metrics

### Engagement
- Average session length
- Battles per session
- Gym completion rate
- Token collection rate

### Economy
- USDC spent on healing/items
- Potion purchase rate
- Token level distribution
- Badge earning rate

### Balance
- Battle win/loss ratios
- Gym difficulty ratings
- Token usage diversity
- Health/damage rates

---

**Status**: Ready for Implementation
**Next Step**: Begin Phase 1 - Price Tracking & Leveling
