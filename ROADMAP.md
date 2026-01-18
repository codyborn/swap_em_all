# Swap 'Em All - Development Roadmap

## Overview

This roadmap outlines the major work streams for taking Swap 'Em All from MVP to a rich, fully-featured crypto-themed Pokemon game.

## Current State

- ✅ Core battle system with real-time price feeds
- ✅ Basic overworld with player movement
- ✅ 3 gym leaders in overworld (8 total defined)
- ✅ Inventory, Cryptodex, and Badge management
- ✅ Wild token encounters
- ✅ Level-up notifications
- ✅ Real-time token price tracking (CoinGecko API)
- ✅ Basic NPC dialogue system
- ✅ Shop for buying Pokeballs

---

## Major Work Streams

### 1. Level Design 🗺️

**Goal:** Transform the overworld into a rich, explorable world inspired by Pokemon's interconnected regions.

**Key Questions:**
- How many distinct areas/towns should we have?
- What makes each area unique and memorable?
- How do we guide player progression through the world?
- What environmental storytelling can we add?

**Planned Features:**
- **Multiple Towns/Cities:** Each themed around different crypto concepts
  - Starting Town (Tutorial area)
  - Stablecoin City (First gym, safe haven)
  - DeFi District (Trading hub, advanced mechanics)
  - Layer 2 Valley (Speed-focused area)
  - Meme Mountain (Volatile, high-risk area)
  - Governance Gardens (Endgame content)

- **Routes Between Towns:** Grass patches for wild encounters, trainers to battle

- **Landmark Locations:**
  - Token Center (healing station)
  - Crypto Exchange (advanced trading)
  - Research Lab (token analysis)
  - Battle Tower (challenge mode)

- **Environmental Variety:** Different biomes, weather effects, day/night cycle

**Dependencies:** None - can start immediately

**Priority:** HIGH - Defines the game's scope and structure

---

### 2. Level Creation 🎨

**Goal:** Actually build the world map using Phaser's tilemap system with proper tile placement, collision detection, and NPC positioning.

**Key Components:**

- **Tileset Creation:**
  - Design or source pixel art tilesets (grass, water, buildings, paths)
  - Create multiple tile layers (ground, decorations, overlays)
  - Define collision tiles vs walkable tiles

- **Map Building:**
  - Use Tiled editor or custom tooling to create maps
  - Export as JSON for Phaser to load
  - Create separate scene for each major area

- **NPC Placement:**
  - Position all 8 gym leaders strategically
  - Add trainer NPCs along routes
  - Place shopkeepers, quest givers, lore NPCs
  - Define NPC movement patterns (stationary, patrol, wander)

- **Interactive Objects:**
  - Signposts with hints
  - Treasure chests with items
  - Doors/portals between areas
  - Healing stations

**Technical Requirements:**
- Phaser tilemap system
- Tiled JSON format support
- Scene management for multiple areas
- Collision detection system
- Camera bounds per area

**Dependencies:** Level Design (need to know what to build)

**Priority:** HIGH - Cannot progress without buildable world

---

### 3. Swap Connection 💱

**Goal:** Wire up real Uniswap trading using the trading-api and uniswap-builder plugin.

**Key Features:**

- **Real Wallet Integration:**
  - Connect MetaMask/WalletConnect
  - Display actual wallet USDC balance
  - Show real token holdings

- **Catch Mechanism = Swap:**
  - When player catches token, execute real Uniswap swap
  - Swap X USDC for token amount
  - Token now in wallet and game inventory
  - Track actual purchase price from blockchain

- **Price Feeds:**
  - ✅ Already using CoinGecko (done)
  - Consider on-chain price oracles for accuracy
  - Track purchase price vs current price

- **Token Release = Sell:**
  - Player can "release" token to sell it back
  - Execute reverse swap (token → USDC)
  - Calculate profit/loss
  - Update game balance

**Technical Requirements:**
- Uniswap V3 SDK integration
- Web3 wallet connection (wagmi/viem)
- Transaction signing UI
- Gas estimation and handling
- Network switching (mainnet, Arbitrum, Optimism)
- Error handling for failed transactions

**Dependencies:** None - can develop in parallel

**Priority:** CRITICAL - Core differentiator of the game

**Risk Considerations:**
- Gas costs (use L2s)
- Transaction delays (show pending states)
- Failed transactions (need robust error handling)
- Slippage (set reasonable limits)

---

### 4. Token Ecosystem Expansion 🪙

**Goal:** Add more tokens and enhance token variety.

**Planned Additions:**
- Expand from 14 to 50+ tokens
- More diverse token types:
  - NFT platform tokens (BLUR, LOOKS)
  - Bridge tokens (ACROSS, HOP)
  - Privacy tokens (TORN)
  - Derivatives (GMX, DYDX)

- **Shiny/Rare Variants:**
  - Special color variants with boosted stats
  - Ultra-rare legendary tokens (BTC, ETH)

- **Token Evolution:**
  - Some tokens evolve at certain levels
  - Example: WETH → stETH at level 20

**Dependencies:** None

**Priority:** MEDIUM - Enhances gameplay variety

---

### 5. Battle System Enhancements ⚔️

**Goal:** Make battles more strategic and engaging.

**Planned Features:**

- **Status Effects:**
  - Volatility (confusion)
  - Staked (can't switch)
  - Rug Pulled (severe damage over time)
  - Pumped (attack boost)
  - Dumped (defense drop)

- **More Move Types:**
  - Currently: Basic attacks only
  - Add: Status moves, healing, switching
  - Type advantages (DeFi strong vs Stablecoin, weak vs Meme)

- **Team Battles:**
  - Support for multi-token battles
  - Switching between party members

- **Battle Animations:**
  - Attack effects
  - Damage indicators
  - Health bar transitions

- **AI Improvements:**
  - Smarter move selection
  - Type consideration
  - Switch logic

**Dependencies:** None

**Priority:** MEDIUM - Improves core gameplay loop

---

### 6. Economy & Progression Balancing 💰

**Goal:** Create satisfying progression curve and reward structure.

**Areas to Balance:**

- **Shop Prices:**
  - Pokeball cost vs wild token catch rate
  - Item pricing (healing, status cures, TMs)

- **Battle Rewards:**
  - USDC rewards per battle
  - Scale with gym difficulty
  - Trainer battle rewards

- **Token Leveling:**
  - ✅ Already using sqrt formula (good!)
  - Fine-tune level scaling
  - Max level considerations

- **Health/Damage:**
  - Price drop damage formula
  - Healing costs
  - Max HP scaling

- **Badge Benefits:**
  - Bonus stats per badge earned
  - Special abilities unlocked

**Dependencies:** Battle System, Swap Connection (need real costs)

**Priority:** MEDIUM - Critical for retention but can iterate

---

### 7. Save System & Persistence 💾

**Goal:** Ensure player progress is saved reliably across sessions.

**Current State:**
- Using Zustand with localStorage persistence
- Saves: inventory, badges, defeated gyms, USDC balance

**Improvements Needed:**

- **Cloud Saves:**
  - Sync progress across devices
  - Backup to prevent data loss

- **Version Migration:**
  - Handle save format changes gracefully
  - Migrate old saves to new format

- **Import/Export:**
  - Export save as JSON
  - Import for backup restoration

- **Multiple Save Slots:**
  - Allow multiple playthroughs

- **Blockchain Integration:**
  - Store progress on-chain (optional)
  - NFT badges as proof of completion

**Dependencies:** None

**Priority:** LOW-MEDIUM - Works currently, but could be better

---

### 8. Multiplayer & PvP 🤝

**Goal:** Enable player-versus-player battles.

**Planned Features:**

- **Local PvP:**
  - Two players on same device
  - Turn-based battle

- **Online PvP:**
  - Matchmaking system
  - Real-time battles
  - Leaderboard/ranking

- **Trading:**
  - Trade tokens between players
  - Trade interface UI

- **Battle History:**
  - Record of past battles
  - Stats tracking

**Technical Requirements:**
- WebSocket server for real-time communication
- Matchmaking logic
- Cheat prevention
- Network latency handling

**Dependencies:** Battle System, Swap Connection (need stable core)

**Priority:** LOW - Nice-to-have, not MVP

---

### 9. Tutorial & Onboarding 📚

**Goal:** Help new players understand game mechanics smoothly.

**Current State:**
- Basic professor dialogue
- No guided tutorial

**Improvements:**

- **Interactive Tutorial:**
  - Guide first catch
  - Explain battle mechanics
  - Show menu navigation

- **Tooltips:**
  - Explain stats
  - Move type effectiveness
  - Price gain mechanics

- **Help System:**
  - In-game documentation
  - Keyboard shortcuts reference
  - FAQ

- **Onboarding Flow:**
  - Wallet connection tutorial
  - Test mode with fake USDC
  - Gradual feature unlocking

**Dependencies:** None

**Priority:** MEDIUM - Improves accessibility

---

### 10. Audio & Music 🎵

**Goal:** Add sound effects and background music.

**Planned Features:**

- **Background Music:**
  - Town themes
  - Battle theme
  - Victory/defeat jingles
  - Gym leader themes

- **Sound Effects:**
  - Menu navigation
  - Pokeball throw
  - Token caught
  - Attack sounds
  - Damage taken
  - Level up chime

- **Audio Settings:**
  - Volume controls
  - Mute options
  - Music/SFX separate controls

**Technical Requirements:**
- Phaser audio system
- Music loops
- Sound sprite for effects

**Dependencies:** None

**Priority:** LOW - Polish feature, not core gameplay

---

### 11. Mobile Responsiveness 📱

**Goal:** Make game playable on mobile devices.

**Current State:**
- Desktop keyboard controls only
- Fixed canvas size

**Improvements:**

- **Touch Controls:**
  - Virtual D-pad for movement
  - Touch buttons for actions
  - Swipe gestures for menus

- **Responsive Canvas:**
  - Scale to fit screen
  - Maintain aspect ratio
  - Portrait/landscape support

- **Mobile UI:**
  - Larger touch targets
  - Bottom-aligned menus
  - Simplified navigation

- **Performance:**
  - Optimize for mobile GPUs
  - Reduce particle effects
  - Battery consumption

**Dependencies:** None

**Priority:** MEDIUM - Expands player base significantly

---

### 12. Additional Gym Leaders 🏆

**Goal:** Implement all 8 gym leaders with unique challenges.

**Current State:**
- 3 gym leaders placed in overworld
- 8 gym leaders defined in battle.ts

**Remaining Work:**

- **Position 5 More Gyms:**
  - Layer 2 Gym (OP, ARB team)
  - Meme Gym (DOGE, SHIB team)
  - Exchange Gym (BNB, CRO team)
  - Governance Gym (COMP, MKR team)
  - Wrapped Gym (WBTC, stETH team)

- **Unique Challenges:**
  - Each gym has gimmick
  - Example: Volatility Gym has constant price swings
  - Example: Layer 2 Gym has faster turns

- **Post-Game Content:**
  - Elite Four equivalent
  - Champion battle
  - Rematch with powered-up teams

**Dependencies:** Level Design, Level Creation

**Priority:** MEDIUM - Core progression content

---

## Implementation Priority

### Phase 1: World Building (Weeks 1-3)
1. Level Design - Define all areas
2. Level Creation - Build first town + route 1
3. Place first 3 gyms properly

### Phase 2: Core Integration (Weeks 4-6)
1. Swap Connection - Real Uniswap integration
2. Tutorial improvements
3. Economy balancing

### Phase 3: Content Expansion (Weeks 7-10)
1. Build remaining areas
2. Add more tokens (50+ total)
3. Place all 8 gym leaders
4. Battle system enhancements

### Phase 4: Polish & Features (Weeks 11-14)
1. Mobile responsiveness
2. Audio/music
3. Save system improvements
4. PvP basics

### Phase 5: Launch Prep (Weeks 15-16)
1. Testing and bug fixes
2. Performance optimization
3. Marketing materials
4. Deploy to production

---

## Success Metrics

- **Engagement:**
  - Average session length > 15 minutes
  - Return rate > 40% after 7 days

- **Economic:**
  - Average transaction value
  - Total volume traded through game

- **Progression:**
  - % of players who beat first gym
  - % who complete all 8 gyms
  - Average tokens caught per player

- **Technical:**
  - Transaction success rate > 95%
  - Load time < 3 seconds
  - Mobile performance > 30 FPS

---

## Technical Debt to Address

1. **Type Safety:** Add stricter TypeScript types throughout
2. **Error Handling:** More robust error boundaries
3. **Testing:** Add unit tests for critical systems
4. **Documentation:** JSDoc comments for all public APIs
5. **Performance:** Profile and optimize render loops
6. **Accessibility:** Keyboard navigation, screen reader support

---

## Open Questions

1. How do we prevent price manipulation exploits?
2. Should there be a "testnet mode" for practicing?
3. What's the endgame? (Competitive ranking? Collection completion?)
4. How do we handle gas fees on mainnet? (L2s only?)
5. Should badges be actual NFTs on-chain?
6. How do we balance real money risk vs fun gameplay?

---

## Next Immediate Steps

1. ✅ Consolidate documentation
2. 📝 Create detailed Level Design document
3. 🎨 Create or source tileset assets
4. 🗺️ Build first complete area (starting town)
5. 🔌 Begin Uniswap integration spike

