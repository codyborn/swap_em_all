# Swap 'Em All V2 - Enhanced Game Mechanics

## What's New in V2? 🎮

Version 2 transforms Swap 'Em All from a simple catching game into a full-fledged RPG with strategic depth and real-world market integration.

---

## 🆙 Price-Based Leveling

Your tokens grow stronger as their real-world price increases!

### How It Works
- **Catch at $2,000** → Your token starts at Level 1
- **Price rises to $4,000** → Token levels up to Level 2
- **Price rises to $10,000** → Token reaches Level 5
- **Max Level**: 100 (though most tokens naturally stay 10-20)

### Stats Grow With Levels
```
Level 1:  HP: 50   ATK: 10  DEF: 10  SPD: 10
Level 5:  HP: 100  ATK: 35  DEF: 35  SPD: 20
Level 10: HP: 150  ATK: 60  DEF: 60  SPD: 30
```

### Why This Matters
- Early investments become powerful over time
- HODL your tokens for max strength
- Creates emotional connection to real crypto prices

---

## 💚 Health & Damage System

Tokens take damage when their price drops from the peak!

### Health States
- **🟢 100-75% HP**: Healthy
- **🟡 74-50% HP**: Injured
- **🟠 49-25% HP**: Badly Injured
- **🔴 24-1% HP**: Critical
- **💀 0% HP**: Knocked Out (needs revival)

### How Damage Works
```
Your WETH peaked at $10,000 (Level 5)
Price drops to $8,000 (-20%)
Damage: 20% / 2 = 10% health lost
Result: 90/100 HP (still Level 5)
```

### Key Rules
- Tokens **keep their highest level** even when price drops
- Only health decreases from price drops
- Must heal or revive knocked out tokens

---

## ⚔️ Battle System

Turn-based strategic combat with moves and stats!

### Battle Types

**1. Gym Battles**
- Challenge 8 gym leaders
- Earn badges for victories
- Strategic PvE combat

**2. Wild Encounters** *(unchanged)*
- Still catch tokens via encounters
- No battle required to catch

**3. Future: PvP Battles** *(V3)*
- Battle other players
- Wager USDC or tokens

### Basic Moves (V2.0)

**Attack**
- Deals damage based on your ATK vs their DEF
- 95% accuracy
- Standard offensive move

**Defend**
- Reduces incoming damage by 50%
- Restores 10% HP
- Tactical defensive option

**Rest**
- Sleep for 1 turn
- Restore 50% HP
- High-risk, high-reward

### Combat Flow
1. Both players select a move
2. Faster token attacks first (based on Speed stat)
3. Moves execute
4. Repeat until one token faints

### Battle Damage Formula
```
Damage = (Move Power × ATK/10) - (DEF/20) × Random(0.9-1.1)
Min damage: 1
Defense multiplier: 0.5x if defending
```

---

## 🏛️ Gym System

8 themed gyms to challenge!

### Gym Leaders

1. **Stablecoin Gym** - "Peg Master"
   - Specialty: USDC, DAI, USDT
   - Difficulty: ⭐
   - Badge: Stable Badge

2. **DeFi Blue Chip Gym** - "Protocol Pete"
   - Specialty: UNI, AAVE, LINK
   - Difficulty: ⭐⭐
   - Badge: DeFi Badge

3. **Layer 2 Gym** - "Scaler Sam"
   - Specialty: OP, ARB, MATIC
   - Difficulty: ⭐⭐⭐
   - Badge: Scale Badge

4. **Meme Gym** - "Viral Vince"
   - Specialty: DOGE, SHIB, PEPE
   - Difficulty: ⭐⭐⭐
   - Badge: Meme Badge

5. **Exchange Token Gym** - "CEX Charlie"
   - Specialty: BNB, CRO
   - Difficulty: ⭐⭐⭐⭐
   - Badge: Exchange Badge

6. **Governance Gym** - "DAO Diana"
   - Specialty: COMP, MKR, ENS
   - Difficulty: ⭐⭐⭐⭐
   - Badge: Governance Badge

7. **Wrapped Asset Gym** - "Wrapper Will"
   - Specialty: WBTC, WETH, stETH
   - Difficulty: ⭐⭐⭐⭐⭐
   - Badge: Wrapped Badge

8. **Elite Gym** - "Satoshi Supreme"
   - Specialty: Mixed elite tokens
   - Difficulty: ⭐⭐⭐⭐⭐⭐
   - Badge: Champion Badge

### Badge Benefits
- Required for map progression
- +1% stats per badge (max 8%)
- Prestige and collection
- Unlock new NPCs

---

## 💊 Healing System

Two ways to restore your tokens!

### Healing Center (Free Healing)
- **Location**: Pink building in overworld
- **Service**: Free full healing for all healthy tokens
- **Revival**: Paid (10 USDC per level)
- **Nurse**: "Your tokens are fully healed!"

### Potions (Portable Healing)
Buy from the store and use anytime:

| Item | Cost | Effect |
|------|------|--------|
| Potion | 5 USDC | Restore 20 HP |
| Super Potion | 15 USDC | Restore 50 HP |
| Hyper Potion | 40 USDC | Restore 100 HP |
| Max Potion | 100 USDC | Fully restore HP |
| Revive | 50 USDC | Revive to 50% HP |
| Max Revive | 200 USDC | Revive + Full HP |

### Using Items
- Access from **Bag** menu
- Can use in battles (costs your turn)
- Can use from inventory

---

## 📱 Enhanced Cryptodex

Detailed information for every token!

### Four Tabs

**1. Overview**
- Token sprite
- Description
- Type and rarity
- Current level

**2. Stats**
- Battle stats (ATK, DEF, SPD, HP)
- Move list with details
- Health bar

**3. Market Data**
- Current price
- Purchase price
- Price change %
- Market cap
- 24h volume
- All-time high

**4. Level History**
- When token reached each level
- Price at each level
- Timeline visualization

---

## 🎯 Token-Specific Moves (Future)

Later updates will add unique moves per token!

### DeFi Moves
- **Liquidity Pool** (UNI): Absorb 25% damage as healing
- **Yield Farm** (COMP): Generate 10% HP per turn
- **Flash Loan** (AAVE): Massive damage but costs HP

### Meme Moves
- **To The Moon** (DOGE): Damage increases each use
- **Diamond Hands** (SHIB): Cannot be knocked out for 1 turn
- **HODL** (All): Defense boost that grows over time

### Stablecoin Moves
- **Peg Anchor** (USDC): Set defense to maximum
- **Redemption** (DAI): Convert HP to attack power

---

## 📊 Example Gameplay Loop

### Morning
1. Check prices (auto-updates every 5 min)
2. Your WETH leveled up overnight! 🎉
3. But your USDC took damage from depeg 😰
4. Visit Healing Center for free restoration

### Afternoon
5. Challenge Gym #3 with your Level 8 UNI
6. Strategic battle using Attack and Defend
7. Victory! Earn Scale Badge + 300 USDC

### Evening
8. Use earnings to buy Super Potions
9. Catch a legendary token in wild
10. Prepare team for next gym

---

## 🔢 Quick Reference

### Formulas
```
Level = Current Price / Purchase Price (rounded down)
HP = 50 + (level × 10)
Damage = (Price Drop % / 2) of max health
Revival Cost = level × 10 USDC
```

### Keyboard Controls
```
ARROW KEYS  - Move around
SPACE       - Interact / Advance dialogue
C           - Catch in encounters
R           - Run from encounters
ESC         - Back / Cancel
```

---

## 📚 Documentation

- **GAME_MECHANICS_V2.md** - Complete design (11 sections)
- **TECHNICAL_PLAN_V2.md** - Implementation guide (6 sections)
- **V2_PLANNING_SUMMARY.md** - Executive overview
- **V2_README.md** - This file (player-facing)

---

## 🛣️ Implementation Timeline

| Week | Focus | Status |
|------|-------|--------|
| Week 1 | Price tracking & leveling | ⏳ Planned |
| Week 2 | Health & healing systems | ⏳ Planned |
| Week 3 | Battle system | ⏳ Planned |
| Week 4 | Gym system | ⏳ Planned |
| Week 5 | Enhanced Cryptodex | ⏳ Planned |
| Week 6 | Polish & testing | ⏳ Planned |

---

## 💡 Design Philosophy

### Connection to Real Markets
- Leveling based on actual price = genuine investment strategy
- Damage from drops = real-world volatility risk
- Creates authentic crypto experience

### Strategic Depth
- Type matchups (future)
- Move variety
- Stat optimization
- Team building

### Balanced Economy
- USDC sinks (healing, items)
- USDC sources (gym rewards, battles)
- Resource management matters

### Player Retention
- Long-term progression (leveling)
- Collection goals (8 badges)
- Replayability (different teams)

---

## ❓ FAQ

**Q: Do I lose my level when price drops?**
A: No! Tokens keep their highest level achieved. Only health decreases.

**Q: Can I battle without going to gyms?**
A: Wild encounters are still catch-only. Gyms are the main battle content.

**Q: How often do prices update?**
A: Every 5 minutes automatically. You'll see level-up notifications.

**Q: What if my token gets knocked out?**
A: Visit a Healing Center to revive (10 USDC per level) or use a Revive item.

**Q: Are gym battles required?**
A: No, but they unlock new areas and provide stat boosts!

**Q: Can I heal during battles?**
A: Yes, using items from your Bag costs your turn.

---

## 🚀 Get Started

1. **Update the game** when V2 launches
2. **Check your existing tokens** - they'll have levels based on current prices!
3. **Visit Healing Center** if any tokens are damaged
4. **Challenge Gym #1** to earn your first badge
5. **Explore the new mechanics** and have fun!

---

**Version 2 Status**: Planning Complete ✅
**Expected Launch**: ~6 weeks from implementation start
**Current Version**: 1.0 (MVP) - Fully playable

Excited for these new features? Stay tuned for updates! 🎮🚀
