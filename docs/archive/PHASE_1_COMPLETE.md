# Phase 1 Complete - Price Tracking & Leveling System

**Date**: 2026-01-16
**Status**: ✅ COMPLETE
**Build**: ✅ PASSING

---

## Summary

Phase 1 of V2 implementation is complete! The foundation for price-based leveling, health tracking, and dynamic token progression is now in place.

---

## What Was Implemented

### 1. Type Definitions ✅

**`lib/types/token.ts`** - Enhanced token model
- `CaughtToken` interface with all V2 fields
- Price tracking (purchase, current, peak, history)
- Leveling fields (level, maxLevel, experience)
- Health system (health, maxHealth, isKnockedOut)
- Battle stats (attack, defense, speed, hp)
- Moves array
- Token types (defi, layer1, stablecoin, meme, etc.)
- Helper functions for token types and base stats

**`lib/types/battle.ts`** - Battle system types
- `BattleState` interface
- `BattleParticipant` with temporary stats
- `Badge` system
- 8 gym leaders with teams pre-configured
- Status effects and rewards

### 2. Core Systems ✅

**`lib/utils/levelingSystem.ts`** - Leveling mechanics
- `calculateLevel()` - Level = floor(currentPrice / purchasePrice)
- `calculateStats()` - Stats scale with level
- `calculateMaxHealth()` - HP grows 10 per level
- `checkLevelUp()` - Detects when token should level up
- `levelUp()` - Applies level-up changes
- `getLevelProgress()` - Progress to next level %
- `getLevelTier()` - Descriptive tier (Novice to Legendary)
- `applyBadgeBoost()` - +1% stats per badge

**`lib/utils/damageCalculator.ts`** - Damage & healing
- `calculatePriceDamage()` - Damage from price drops
- `applyPriceDamage()` - Apply damage to token
- `calculateBattleDamage()` - Battle damage with formulas
- `calculateHealing()` - Healing from moves/items
- `getHealthColor()` - Color based on HP %
- `getHealthStatus()` - Status description
- `getRevivalCost()` - 10 USDC per level
- `canBattle()` - Check if token can fight
- `healToken()` & `reviveToken()` - Restoration methods

**`game/systems/PriceTracker.ts`** - Automatic price updates
- Polls `/api/tokens/prices` every 5 minutes
- Updates all tokens in inventory
- Detects level-ups and shows notifications
- Calculates damage from price drops
- Can be started/stopped/force updated
- Auto-starts when game store is available

### 3. API Routes ✅

**`app/api/tokens/prices/route.ts`** - Batch price fetching
- POST endpoint for multiple addresses
- GET endpoint with query params
- Simulated prices for demo (ready for real API)
- Returns `{ [address: string]: number }`

**`app/api/tokens/encounter/route.ts`** - Updated
- Added `price` field to all tokens
- Realistic prices for each token type
- Price data included in encounter response

### 4. Game Store Updates ✅

**`lib/store/gameStore.ts`** - Complete V2 overhaul
- Inventory now uses `CaughtToken` type
- Added `items` object (6 potion/revive types)
- Added `usdc` balance tracking
- Added `badges` and `gymsDefeated` arrays
- Backward compatibility with legacy `TokenCreature`

**New Actions**:
- `addItem()` & `useItem()` - Item management
- `updateTokenPrice()` - Price updates with level-up logic
- `updateTokenHealth()` - Health management
- `healToken()` & `reviveToken()` - Restoration
- `earnBadge()` & `defeatGym()` - Progress tracking
- `addUSDC()` & `spendUSDC()` - Currency management

**Smart Features**:
- Auto-detects level-ups on price update
- Calculates and applies damage from price drops
- Handles item effects (healing, revival)
- Prevents duplicate badges
- Sale price = 80% of current price

### 5. Scene Updates ✅

**`game/scenes/EncounterScene.ts`** - Catching with prices
- Added `tokenPrice` to `EncounterData`
- Records purchase price when catching
- Passes all V2 fields to store
- Uses `getTokenType()` helper
- Compatible with new store format

---

## How It Works

### Token Catching Flow

```
1. Player encounters token (e.g., WETH at $3,250)
2. EncounterScene records:
   - purchasePrice: 3250
   - currentPrice: 3250
   - peakPrice: 3250
   - level: 1
   - health: maxHealth
3. Token added to inventory with full V2 data
```

### Price Update Flow

```
1. PriceTracker polls every 5 minutes
2. Fetches prices for all inventory tokens
3. For each token:
   a. Check if level increased
   b. If yes: Level up + stat boost + HP increase
   c. Check if price dropped from peak
   d. If yes: Calculate and apply damage
4. Update store with new values
5. Show level-up notification if applicable
```

### Leveling Example

```
Day 1: Caught WETH at $3,000 → Level 1, HP: 54/54
Day 5: WETH rises to $6,000 → Level 2, HP: 64/64 🎉
Day 10: WETH rises to $15,000 → Level 5, HP: 94/94 🎉
Day 12: WETH drops to $12,000 → Still Level 5, HP: 85/94 💔
```

### Damage Example

```
Token peaked at $10,000
Price drops to $8,000 (-20%)
Damage = 20% / 2 = 10% of maxHealth
If maxHealth = 100, damage = 10
New health = 90/100
```

---

## Files Created

```
lib/
├── types/
│   ├── token.ts (NEW)
│   └── battle.ts (NEW)
├── utils/
│   ├── levelingSystem.ts (NEW)
│   └── damageCalculator.ts (NEW)
└── store/
    └── gameStore.ts (UPDATED)

game/
└── systems/
    └── PriceTracker.ts (NEW)

app/api/
└── tokens/
    ├── prices/route.ts (NEW)
    └── encounter/route.ts (UPDATED)

game/scenes/
└── EncounterScene.ts (UPDATED)
```

---

## Test Results

### Build Test
```bash
npm run build
✓ Compiled successfully in 4.4s
✓ TypeScript checks passed
✓ All 9 routes generated
```

### Type Safety
- ✅ All interfaces properly defined
- ✅ No implicit any types
- ✅ Backward compatibility maintained
- ✅ Legacy TokenCreature auto-converts

### API Endpoints
- ✅ POST /api/tokens/prices works
- ✅ GET /api/tokens/prices works
- ✅ GET /api/tokens/encounter includes prices

---

## Data Migration

The system handles legacy data gracefully:

**If player has old-format tokens**:
- Automatically converted to V2 format
- Default purchasePrice: 100
- Level starts at 1
- Full health assigned
- Default stats calculated

**If player has new tokens**:
- All V2 fields populated correctly
- Level calculated from current price
- Stats match level
- Ready for price tracking

---

## What's Next (Phase 2)

### Week 2 Goals
1. Create HealingCenterScene
2. Add Healing Center NPC to overworld
3. Update StoreScene to sell potions/revives
4. Add BagScene for using items
5. Test healing and revival mechanics
6. Add health bars to UI

### Dependency
Phase 2 builds on Phase 1:
- Uses `healToken()` and `reviveToken()` from store
- Uses `DamageCalculator` for item effects
- Uses `items` tracking from store
- Uses health status indicators

---

## Configuration

### Price Update Interval
Default: 5 minutes (300000ms)

To change:
```typescript
// In PriceTracker constructor
const tracker = new PriceTracker(600000); // 10 minutes
```

### Token Type Classification
Defined in `lib/types/token.ts`:
- Stablecoins: USDC, DAI, USDT
- Layer 1: ETH, BTC, SOL
- Layer 2: OP, ARB, MATIC
- DeFi: UNI, AAVE, LINK
- Meme: DOGE, SHIB, PEPE
- Etc.

### Base Stats by Type
```typescript
layer1:      ATK: 12, DEF: 12, SPD: 8,  HP: 55
defi:        ATK: 11, DEF: 10, SPD: 12, HP: 50
stablecoin:  ATK: 8,  DEF: 15, SPD: 10, HP: 60
meme:        ATK: 15, DEF: 8,  SPD: 15, HP: 45
```

---

## Known Limitations

### Current Version
1. **Prices are simulated** - Not real market data yet
2. **No real-time updates** - 5-minute polling only
3. **No historical charts** - Price history tracked but not visualized
4. **No UI for levels** - Level data exists but not displayed yet

### Future Enhancements
1. Integrate real price API (CoinGecko/CoinMarketCap)
2. WebSocket for real-time prices
3. Level-up animation in encounters
4. Visual health bars on inventory
5. Price charts in Cryptodex

---

## Usage Examples

### Check if Token Can Battle
```typescript
const token = inventory[0];
const canFight = DamageCalculator.canBattle(token);
```

### Calculate Level from Price
```typescript
const level = LevelingSystem.calculateLevel(
  purchasePrice: 1000,
  currentPrice: 3500
); // Returns 3
```

### Get Revival Cost
```typescript
const cost = DamageCalculator.getRevivalCost(token.level);
// Level 5 = 50 USDC
```

### Force Price Update
```typescript
import { globalPriceTracker } from '@/game/systems/PriceTracker';
await globalPriceTracker.forceUpdate();
```

---

## Performance

### Memory Usage
- Price history limited to last 100 points per token
- Level history grows unbounded (consider limiting later)
- Minimal overhead from price tracking

### CPU Usage
- Price updates run every 5 minutes
- Level calculations are O(1)
- Damage calculations are O(1)
- No performance issues expected

### Network
- Batch price fetches (1 request for all tokens)
- 5-minute intervals prevent rate limiting
- Fallback prices if API unavailable

---

## Developer Notes

### Adding New Token Types
1. Add to `TokenType` union in `token.ts`
2. Add base stats in `getBaseStats()`
3. Add classification in `getTokenType()`
4. Add to encounter list with price

### Adjusting Formulas
**Level formula** (line 17 in levelingSystem.ts):
```typescript
const level = Math.floor(currentPrice / purchasePrice);
```

**Damage formula** (line 14 in damageCalculator.ts):
```typescript
const damagePercent = priceDropPercent / 2;
```

**Stat scaling** (line 29 in levelingSystem.ts):
```typescript
attack: base.attack + (level - 1) * 5;
hp: base.hp + (level - 1) * 10;
```

---

## Troubleshooting

### Price tracker not starting?
Check console for "PriceTracker started" message.
Ensure game store is available.

### Tokens not leveling up?
Verify purchase price is recorded correctly.
Check price data in API response.

### Build errors?
Run `npm run build` to see TypeScript errors.
Check import paths are correct.

---

**Phase 1 Status**: ✅ COMPLETE AND TESTED
**Ready for**: Phase 2 - Health System & Healing
**Estimated Phase 2 Time**: 3-4 days
