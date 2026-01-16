# V2 Planning Summary - Swap 'Em All

**Date**: 2026-01-16
**Status**: Planning Complete, Ready for Implementation

---

## Executive Summary

Version 2 significantly expands the game mechanics by adding:
1. **Price-based leveling** - Tokens level up as their real-world price increases
2. **Health and damage system** - Price drops cause damage, requiring healing
3. **Turn-based battles** - Strategic combat with moves and stats
4. **Gym system** - 8 gyms with leaders and badges to collect
5. **Enhanced Cryptodex** - Detailed stats, market data, and move information

---

## Key Design Decisions

### 1. Price-Based Leveling
**Rationale**: Creates dynamic connection between crypto markets and gameplay
- Level = Current Price / Purchase Price (rounded down)
- Tokens preserve their max level even when price drops
- Provides long-term investment incentive

### 2. Damage from Price Drops
**Rationale**: Adds risk/reward and creates need for healing economy
- Damage = (Price Drop % / 2) of max health
- Knocked out at 0 HP, requires revival
- Adds resource management layer

### 3. Battle System
**Rationale**: Adds skill-based gameplay beyond catching
- Turn-based combat feels authentic to Pokemon
- Start simple (Attack/Defend), expand to unique moves
- Gym battles provide structured challenges

### 4. Healing Economy
**Rationale**: Creates USDC sink and resource management
- Free healing at centers (convenience)
- Paid potions (portable healing)
- Revival costs scale with level (balance)

---

## Core Formulas

### Leveling
```
Level = floor(Current Price / Purchase Price)
Range: 1-100
```

### Stats per Level
```
HP      = 50 + (level × 10)
Attack  = 10 + (level × 5)
Defense = 10 + (level × 5)
Speed   = 10 + (level × 2)
```

### Price Damage
```
Price Drop % = ((Peak Price - Current Price) / Peak Price) × 100
Damage %     = Price Drop % / 2
Health Lost  = (Damage % / 100) × Max Health
```

### Battle Damage
```
Base         = Move Power × (Attacker ATK / 10)
Reduced      = Base - (Defender DEF / 20)
Final        = Reduced × Random(0.9-1.1)
With Defense = Final × 0.5 (if defending)
```

---

## Data Structure Overview

### CaughtToken (Enhanced)
```typescript
{
  // Identity
  symbol, name, address, caughtAt

  // Price Tracking
  purchasePrice, currentPrice, peakPrice
  priceHistory: PricePoint[]

  // Leveling
  level, maxLevel, experience

  // Health
  health, maxHealth, isKnockedOut

  // Battle
  stats: {attack, defense, speed, hp}
  moves: Move[]

  // History
  levelHistory: LevelHistoryEntry[]
}
```

### Battle State
```typescript
{
  player: {token, currentHP, stats, moves}
  opponent: {token, currentHP, stats, moves}
  turn, turnNumber, phase
  log: BattleLogEntry[]
  gymData?: {gymId, leader, badge}
}
```

---

## New Scenes

1. **BattleScene** - Turn-based combat
   - Health bars
   - Move selection
   - Battle log
   - Animations

2. **HealingCenterScene** - Restore health
   - Free healing
   - Paid revival
   - Batch operations

3. **GymScene** - Challenge gyms
   - Gym selection
   - Leader info
   - Badge display

4. **BagScene** - Use items
   - Item selection
   - Token selection
   - Usage confirmation

---

## New Systems

### PriceTracker
- Polls API every 5 minutes
- Updates all token prices
- Triggers level-up checks
- Calculates damage from drops

### LevelingSystem
- Calculates level from price ratio
- Computes stats based on level
- Determines max health
- Tracks level history

### DamageCalculator
- Price-based damage
- Battle damage with modifiers
- Defense reductions
- Status effects

### BattleManager
- Turn execution
- Move resolution
- Win/loss detection
- Reward calculation

---

## Implementation Timeline

### Week 1: Foundation
- Data models and store updates
- Price tracking system
- Leveling calculations
- Basic health tracking

### Week 2: Healing & Combat Setup
- Healing Center scene
- Item system
- Battle scene structure
- Basic moves

### Week 3: Battle System
- Combat mechanics
- AI opponent
- Battle UI polish
- Testing

### Week 4: Gyms
- 8 gym locations
- Gym leaders
- Badge system
- Progression

### Week 5: Polish
- Cryptodex enhancement
- Token-specific moves
- Animations
- Balance testing

### Week 6: Testing & Launch
- Bug fixes
- Performance optimization
- Documentation
- Deployment

---

## API Requirements

### New Endpoints

1. **POST /api/tokens/prices**
   - Input: Array of token addresses
   - Output: Current prices for each
   - Used for: Batch price updates

2. **GET /api/tokens/[address]/price-history**
   - Input: Token address, time range
   - Output: Historical price data
   - Used for: Level history display

3. **POST /api/battles/calculate-damage** (optional)
   - Input: Attacker, defender, move
   - Output: Damage amount
   - Used for: Server-side validation

### External APIs Needed
- CoinGecko or similar for price data
- Possibly historical data provider
- Rate limiting considerations

---

## Balance Considerations

### Level Scaling
- Most tokens won't exceed level 10-20 naturally
- Prevents overpowered tokens
- Makes early-caught tokens valuable

### Damage Rates
- 2:1 ratio (20% price drop = 10% health loss)
- Prevents instant knockout from volatility
- Creates gradual degradation

### Gym Difficulty
- Gym 1: Level 5 tokens
- Gym 4: Level 10-15 tokens
- Gym 8: Level 20+ tokens
- Player must level up to progress

### Economy
- Potions: 5-100 USDC (based on power)
- Revival: 10 USDC per level
- Gym rewards: 100-800 USDC
- Creates balanced sink/source

---

## UI Mockups Summary

### Battle Screen
- Split screen: opponent top, player bottom
- Health bars with levels
- Move selection grid
- Battle log at bottom

### Healing Center
- Nurse NPC at top
- Menu with options
- Token list with HP bars
- Cost indicators

### Enhanced Cryptodex
- Tabbed interface:
  - Overview: Sprite, description
  - Stats: Battle stats, moves
  - Market: Price data, history
  - History: Level progression

### HUD Updates
- Add health indicators
- Level display
- Badge counter
- Item count

---

## Risk Assessment

### Technical Risks

**Price API Rate Limits**
- Risk: High frequency updates exceed limits
- Mitigation: 5-minute intervals, caching, fallbacks

**State Size Growth**
- Risk: Large inventories slow performance
- Mitigation: Pagination, lazy loading, indexing

**Battle Complexity**
- Risk: Turn calculations lag
- Mitigation: Pre-compute, optimize formulas

### Design Risks

**Balance Issues**
- Risk: Some strategies dominate
- Mitigation: Extensive playtesting, adjustable values

**Complexity Overwhelm**
- Risk: Too many systems confuse players
- Mitigation: Gradual tutorial, clear UI, tooltips

**Economy Inflation**
- Risk: Players accumulate too much USDC
- Mitigation: Balanced costs, USDC sinks

---

## Success Metrics

### Engagement
- Session length increase (target: 2x)
- Daily active users retention
- Gym completion rate (target: 60%+)
- Battle participation (target: 5+ battles/session)

### Economy
- USDC spent on healing (balance indicator)
- Item purchase rate
- Average token level (progression indicator)
- Badge earning timeline

### Technical
- Price update reliability (target: 99%+)
- Battle scene load time (target: <500ms)
- No state corruption issues

---

## Documentation Created

1. **GAME_MECHANICS_V2.md** (11 sections, complete design)
   - All formulas and systems
   - Move lists and effects
   - Gym themes and leaders
   - Data models

2. **TECHNICAL_PLAN_V2.md** (6 sections, implementation guide)
   - Architecture changes
   - Code implementations
   - Scene designs
   - Phase-by-phase roadmap

3. **V2_PLANNING_SUMMARY.md** (this document)
   - Executive overview
   - Key decisions
   - Timeline
   - Risk assessment

---

## Approval Checklist

Before starting implementation:

- [x] Core mechanics designed
- [x] Formulas defined and balanced
- [x] Data models specified
- [x] Technical architecture planned
- [x] Implementation phases outlined
- [x] API requirements identified
- [x] UI mockups created
- [x] Risk mitigation strategies defined

**Status**: ✅ All planning complete, ready to implement

---

## Next Steps

1. **User Review** - Get feedback on V2 plans
2. **Phase 1 Start** - Begin price tracking implementation
3. **Set Up Testing** - Create test suite for new systems
4. **Monitor Progress** - Track against timeline

---

## Questions for Discussion

1. Should level cap be 100 or lower (e.g., 50)?
2. Should gym order be enforced or player's choice?
3. Should there be token evolution at high levels?
4. Should PvP be included in V2 or wait for V3?
5. Should moves be learnable or fixed per token?

---

**Planning Complete**: All V2 mechanics fully designed and documented
**Ready for**: User approval and Phase 1 implementation
