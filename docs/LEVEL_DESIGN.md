# Swap 'Em All - Level Design Document

## World Overview

Swap 'Em All takes place in the **Crypto Region**, a diverse land where different areas represent different aspects of the cryptocurrency ecosystem. The world is designed to guide players through an educational journey from basic concepts (stablecoins) to advanced mechanics (DeFi, L2s, governance).

### Design Philosophy

- **Progressive Complexity**: Each area introduces more complex crypto concepts
- **Visual Identity**: Each zone has distinct visual themes tied to its crypto focus
- **Interconnected World**: Areas connect logically, creating a cohesive world map
- **Environmental Storytelling**: The environment itself tells the story of crypto's evolution

---

## World Map Structure

```
                    [Governance Gardens]
                            |
                    [Research Institute]
                            |
        [Meme Mountain]----[+]----[Bridge Bay]
              |                        |
        [DeFi District]----------[Wrapped Woods]
              |                        |
        [Stablecoin City]--------[Layer 2 Valley]
              |                        |
        [Pallet Town]------------[Exchange Plaza]
              |
        [Starting Lab]
```

**Total Areas**: 10 distinct locations
**Total Routes**: 8 connecting paths
**Gym Count**: 8 (one in most major areas)

---

## Area Designs

### 1. Pallet Town (Starting Area)

**Theme**: Tutorial zone, safe starting point
**Crypto Concept**: Introduction to crypto basics
**Visual Style**: Peaceful, green town with traditional buildings

**Key Locations**:
- **Professor Oak's Lab**: Where the journey begins
- **Player's House**: Starting point (not accessible, just visual)
- **Town Square**: Center of activity
- **Pokeball Shop**: First vendor
- **Token Center**: Healing station

**NPCs**:
- Professor Oak (Tutorial dialogue)
- Shop Clerk
- Town NPCs (tutorial hints)
- Nurse (healing)

**Encounters**: None (safe zone)

**Purpose**:
- Introduce game mechanics
- Explain token catching, battles, menus
- Provide starter resources (50 USDC, 3 Pokeballs)

**Progression Requirements**:
- None (starting area)
- Must catch at least 1 token before leaving

**Environmental Storytelling**:
- Signs explain basics: "Welcome to the world of crypto!"
- NPCs discuss getting started with tokens
- Visual: Traditional, safe, familiar

---

### 2. Route 1 (Pallet → Stablecoin City)

**Theme**: Grass route with gentle wild encounters
**Visual Style**: Green grass, flowers, safe path

**Encounters**:
- USDC (Level 1-2)
- USDT (Level 1-2)
- DAI (Level 1-2)

**NPCs**:
- 2-3 beginner trainers
- Helpful NPC with tips

**Purpose**: First taste of wild encounters and battles

---

### 3. Stablecoin City

**Theme**: Stability, consistency, safety
**Crypto Concept**: Stablecoins and pegged assets
**Visual Style**: Modern, orderly city with clean lines and blue/green tones

**Key Locations**:
- **Stablecoin Gym** (Gym #1)
- **Token Center**
- **Trading Post** (Buy/Sell tokens)
- **Bank Building** (decorative)

**Gym Leader**: Stable Master
**Badge**: Stable Badge ⚖️
**Team**: USDC (L1), DAI (L1)

**NPCs**:
- Gym Leader: Stable Master
- Traders discussing stable prices
- NPCs explaining pegs and collateral

**Encounters** (nearby grass):
- USDC, USDT, DAI (Level 2-4)

**Progression Requirements**:
- Beat Gym #1 to unlock Route 2

**Environmental Storytelling**:
- Buildings are perfectly symmetrical (stability theme)
- Signs: "Price stability guaranteed!"
- NPCs: "I only invest in stable assets"
- Visual: Calm, ordered, safe

---

### 4. Route 2 (Stablecoin City → DeFi District)

**Theme**: Transition from simple to complex
**Visual Style**: Path with some technical elements appearing

**Encounters**:
- UNI (Level 3-5)
- AAVE (Level 3-5)
- CRV (Level 4-6)

**NPCs**:
- 3-4 intermediate trainers
- NPC: "DeFi protocols are more complex but powerful!"

**Purpose**: Introduce DeFi tokens before reaching DeFi District

---

### 5. DeFi District

**Theme**: Decentralized finance, complexity, innovation
**Crypto Concept**: DeFi protocols, lending, swapping
**Visual Style**: Futuristic, interconnected buildings with flowing data streams

**Key Locations**:
- **DeFi Blue Chip Gym** (Gym #2)
- **Swap Exchange** (Advanced trading)
- **Liquidity Pool** (decorative fountain)
- **Token Center**

**Gym Leader**: Protocol Pete
**Badge**: DeFi Badge 🏦
**Team**: UNI (L8), AAVE (L7)

**NPCs**:
- Gym Leader: Protocol Pete
- DeFi farmers discussing yields
- Liquidity providers
- Smart contract developers

**Encounters** (nearby):
- UNI, AAVE, SUSHI, CRV (Level 6-8)

**Progression Requirements**:
- Beat Gym #2 to unlock western routes (Meme Mountain) and eastern routes (Layer 2 Valley)

**Environmental Storytelling**:
- Visual: Connected pipes and data flows between buildings
- Signs: "Provide liquidity, earn rewards!"
- NPCs discussing APY, TVL, and protocol risks
- Decorative: Giant "DEX" sign, pool monuments

---

### 6. Route 3 (DeFi District → Layer 2 Valley)

**Theme**: Speed and scaling
**Visual Style**: Modern highway with fast-moving elements

**Encounters**:
- OP (Level 7-9)
- ARB (Level 7-9)
- MATIC (Level 7-9)

**NPCs**:
- Speed-focused trainers
- NPC: "Layer 2s make everything faster and cheaper!"

**Purpose**: Introduce L2 tokens and speed concept

---

### 7. Layer 2 Valley

**Theme**: Speed, efficiency, scaling solutions
**Crypto Concept**: Layer 2 rollups and scaling
**Visual Style**: Sleek, fast-moving environment with "zoom lines" and efficiency

**Key Locations**:
- **Layer 2 Gym** (Gym #3)
- **Rollup Center** (Token Center variant)
- **Speed Trial Arena** (optional challenge)
- **Bridge Terminal** (visual connection to mainnet)

**Gym Leader**: Scaler Sam
**Badge**: Scale Badge ⚡
**Team**: OP (L10), ARB (L10)

**NPCs**:
- Gym Leader: Scaler Sam
- Speed enthusiasts
- Bridge operators
- NPCs discussing gas savings

**Encounters**:
- OP, ARB, MATIC (Level 8-10)

**Progression Requirements**:
- Beat Gym #3 to unlock Route 4 (to Exchange Plaza)

**Environmental Storytelling**:
- Visual: Everything looks fast and efficient
- Moving walkways, speed lines
- Signs: "10x faster, 100x cheaper!"
- NPCs discussing transaction speed
- Decorative: Rollup diagrams on walls

---

### 8. Route 4 (Layer 2 Valley → Exchange Plaza)

**Theme**: Commercial route
**Visual Style**: Busy marketplace path

**Encounters**:
- BNB (Level 9-11)
- CRO (Level 9-11)
- FTT (Level 9-11) - rare

**NPCs**:
- Trader NPCs
- NPC: "Exchange tokens power trading platforms!"

**Purpose**: Introduce exchange tokens

---

### 9. Exchange Plaza

**Theme**: Centralized exchanges, trading hubs
**Crypto Concept**: CEX tokens and trading platforms
**Visual Style**: Massive trading floor with screens, graphs, and bustling activity

**Key Locations**:
- **Exchange Token Gym** (Gym #5)
- **Grand Exchange** (massive trading building)
- **Market Square** (prices everywhere)
- **Token Center**

**Gym Leader**: CEX Charlie
**Badge**: Exchange Badge 💱
**Team**: BNB (L15), CRO (L14)

**NPCs**:
- Gym Leader: CEX Charlie
- Day traders
- Chart analysts
- Exchange operators

**Encounters**:
- BNB, CRO, OKB (Level 11-13)

**Progression Requirements**:
- Beat Gym #5 to unlock northern route (Wrapped Woods)

**Environmental Storytelling**:
- Visual: Giant trading screens everywhere
- Price tickers constantly moving
- Signs: "Trade 24/7!", "100x leverage available"
- NPCs discussing trading strategies
- Decorative: Bull and bear statues

---

### 10. Route 5 (Exchange Plaza → Wrapped Woods)

**Theme**: Bridge between traditional and crypto
**Visual Style**: Forest with wrapped/boxed aesthetic

**Encounters**:
- WETH (Level 12-14)
- WBTC (Level 12-14)
- stETH (Level 12-14)

**NPCs**:
- Bridge operators
- NPC: "Wrapped assets bring traditional crypto to new chains!"

**Purpose**: Introduce wrapped asset concept

---

### 11. Wrapped Woods

**Theme**: Wrapped and bridged assets
**Crypto Concept**: WETH, WBTC, cross-chain bridges
**Visual Style**: Mysterious forest with gift-wrapped/boxed elements

**Key Locations**:
- **Wrapped Asset Gym** (Gym #7)
- **Bridge Sanctuary** (Token Center)
- **Wrapper's Workshop** (decorative)
- **Cross-Chain Portal** (visual)

**Gym Leader**: Wrapper Will
**Badge**: Wrapped Badge 🎁
**Team**: WETH (L20), WBTC (L19), stETH (L18)

**NPCs**:
- Gym Leader: Wrapper Will
- Bridge operators
- Yield farmers staking tokens
- NPCs discussing cross-chain

**Encounters**:
- WETH, WBTC, stETH, renBTC (Level 14-16)

**Progression Requirements**:
- Beat Gym #7 to unlock western connection (Bridge Bay)

**Environmental Storytelling**:
- Visual: Trees look wrapped in gift paper
- Bridges everywhere (visual metaphor)
- Signs: "Bringing assets to new chains!"
- NPCs discussing bridging and wrapping
- Decorative: Giant wrapped presents

---

### 12. Route 6 (DeFi District → Meme Mountain Base)

**Theme**: Chaos begins
**Visual Style**: Path becoming more chaotic and colorful

**Encounters**:
- DOGE (Level 8-10)
- SHIB (Level 8-10)
- PEPE (Level 9-11)

**NPCs**:
- Meme enthusiasts
- NPC: "To the moon! 🚀"

**Purpose**: Prepare players for volatility

---

### 13. Meme Mountain

**Theme**: Volatility, memes, chaos, high-risk high-reward
**Crypto Concept**: Meme coins and viral tokens
**Visual Style**: Chaotic, colorful, rocket ships, moons, memes everywhere

**Key Locations**:
- **Meme Gym** (Gym #4)
- **To The Moon Tower** (Token Center with rocket theme)
- **Doge Statue** (landmark)
- **Paper Hands Valley** (low area)
- **Diamond Hands Peak** (high area, gym location)

**Gym Leader**: Viral Vince
**Badge**: Meme Badge 🐕
**Team**: DOGE (L12), SHIB (L11)

**NPCs**:
- Gym Leader: Viral Vince (at peak)
- Meme lords
- Paper hands (quit easily)
- Diamond hands (never sell)
- NPCs with meme dialogue

**Encounters**:
- DOGE, SHIB, PEPE, FLOKI (Level 10-14)
- High encounter rate
- Prices very volatile

**Progression Requirements**:
- Beat Gym #4 to unlock Route 7 (Bridge Bay)

**Environmental Storytelling**:
- Visual: Rockets, moons, dog statues, chaos
- Random color changes
- Signs: "HODL!", "🚀🌕", "Much wow"
- NPCs: All meme references
- Decorative: Rocket launch pads, moon rocks
- Weather: Constantly changing (volatility)

---

### 14. Route 7 (Meme Mountain → Bridge Bay)

**Theme**: Calming down from chaos
**Visual Style**: Transitional path, chaos fading

**Encounters**:
- Mixed tokens from previous areas (Level 12-15)

**NPCs**:
- Recovering meme traders
- NPC: "That mountain is crazy!"

**Purpose**: Breather between areas

---

### 15. Bridge Bay

**Theme**: Connection hub, cross-chain
**Crypto Concept**: Bridges and interoperability
**Visual Style**: Port town with bridges connecting islands

**Key Locations**:
- **Bridge Terminal** (main hub)
- **Token Center**
- **Interoperability Institute** (decorative)
- **Chain Islands** (visual - different chains as islands)

**No Gym** (transit hub)

**NPCs**:
- Bridge operators
- Cross-chain traders
- NPCs discussing different chains

**Encounters**:
- Various bridge tokens (Level 13-15)

**Progression Requirements**:
- Gateway to northern areas

**Environmental Storytelling**:
- Visual: Many bridges connecting small islands
- Each island represents a blockchain
- Signs: "Connecting all chains"
- NPCs discussing interoperability
- Decorative: Chain logos on islands

---

### 16. Route 8 (Bridge Bay → Research Institute)

**Theme**: Academic, advanced
**Visual Style**: Clean, studious path with signs

**Encounters**:
- LINK (Level 14-16)
- GRT (Level 14-16)
- Rare tokens

**NPCs**:
- Researchers
- NPC: "Research is key to understanding crypto!"

**Purpose**: Transition to late-game

---

### 17. Research Institute

**Theme**: Knowledge, oracles, data
**Crypto Concept**: Oracles and data networks
**Visual Style**: University campus, libraries, labs

**Key Locations**:
- **Research Library** (Token Center)
- **Oracle Laboratory** (decorative)
- **Data Center** (decorative)
- **Professor's Office** (optional dialogue)

**No Gym** (educational hub)

**NPCs**:
- Researchers
- Data scientists
- Professor NPCs
- Advanced trainers

**Encounters**:
- LINK, GRT, BAND (Level 15-17)

**Progression Requirements**:
- Gateway to final area

**Environmental Storytelling**:
- Visual: Libraries, labs, data streams
- Clean, academic aesthetic
- Signs: Research papers, data charts
- NPCs discussing oracles and data
- Decorative: Giant oracle monument

---

### 18. Route 9 (Research Institute → Governance Gardens)

**Theme**: Path to endgame
**Visual Style**: Grand pathway with statues

**Encounters**:
- Rare high-level tokens (Level 16-18)

**NPCs**:
- Elite trainers
- NPCs: "Only the best make it here"

**Purpose**: Final gauntlet before governance

---

### 19. Governance Gardens

**Theme**: Democracy, DAOs, decision-making, endgame
**Crypto Concept**: Governance tokens and DAOs
**Visual Style**: Elegant gardens with voting booths, council chambers

**Key Locations**:
- **Governance Gym** (Gym #6)
- **DAO Council Chamber** (Token Center)
- **Voting Plaza** (decorative)
- **Proposal Gardens** (decorative)

**Gym Leader**: DAO Diana
**Badge**: Governance Badge 🗳️
**Team**: COMP (L17), MKR (L16), ENS (L15)

**NPCs**:
- Gym Leader: DAO Diana
- DAO members voting
- Governance enthusiasts
- NPCs discussing proposals

**Encounters**:
- COMP, MKR, ENS, UNI (Level 15-18)

**Progression Requirements**:
- Beat Gym #6 to unlock Elite Road

**Environmental Storytelling**:
- Visual: Voting booths, council buildings
- Democratic aesthetic
- Signs: "Your vote matters!", "Proposal #123"
- NPCs actively voting on proposals
- Decorative: Ballot boxes, governance symbols

---

### 20. Elite Road (Governance Gardens → Elite Gym)

**Theme**: Final challenge approach
**Visual Style**: Grand path with champion statues

**Encounters**:
- Legendary tokens (Level 18-22)
- Very rare encounters

**NPCs**:
- 5-6 elite trainers (must battle all)
- Warning NPCs: "Turn back if not ready!"

**Purpose**: Final test before champion

---

### 21. Elite Gym (Final Challenge)

**Theme**: Ultimate test, all concepts combined
**Crypto Concept**: Mastery of all token types
**Visual Style**: Grand arena, champion's hall

**Key Locations**:
- **Elite Arena** (Gym #8)
- **Hall of Champions** (victory display)
- **Token Center** (final healing)

**Gym Leader**: Satoshi Supreme
**Badge**: Champion Badge 👑
**Team**: WETH (L25), UNI (L24), LINK (L23)

**NPCs**:
- Gym Leader: Satoshi Supreme
- Previous champions
- Hall of fame NPCs

**No wild encounters**

**Progression Requirements**:
- Must have all 7 previous badges
- Beat Gym #8 to complete main story

**Environmental Storytelling**:
- Visual: Grand, impressive, legendary
- Statues of past champions
- Signs: Hall of fame records
- NPCs: "You've made it this far!"
- Decorative: Trophies, badges on display

---

## Post-Game Areas (Future)

### Battle Tower
- Endless battle challenges
- Rewards: Rare tokens, items

### Secret Garden
- Legendary token encounters
- BTC, ETH spawns

### Trading Arena
- PvP battles
- Leaderboards

---

## World Traversal & Progression

### Level Curve
- **Pallet Town**: Level 1 (start)
- **Stablecoin City**: Levels 1-4
- **DeFi District**: Levels 5-8
- **Layer 2 Valley / Meme Mountain**: Levels 8-12
- **Exchange Plaza / Wrapped Woods**: Levels 12-16
- **Bridge Bay / Research**: Levels 13-17
- **Governance Gardens**: Levels 15-18
- **Elite Gym**: Levels 20-25

### Badge Requirements
- **No badges**: Pallet, Stablecoin City
- **1 badge**: DeFi District
- **2 badges**: Layer 2 Valley, Meme Mountain
- **3 badges**: Exchange Plaza
- **4 badges**: Wrapped Woods
- **5 badges**: Bridge Bay, Research Institute
- **6 badges**: Governance Gardens
- **7 badges**: Elite Gym

### Player Guidance
- **NPCs block paths**: Until you have required badges
- **Dialogue hints**: NPCs point to next objective
- **Sign posts**: Show direction and requirements
- **Visual cues**: Blocked paths, locked gates
- **Map markers**: Show gym locations

---

## Environmental Details

### Biome Variety
- **Grassland**: Pallet Town, Route 1
- **Urban**: Stablecoin City, DeFi District, Exchange Plaza
- **Mountain**: Meme Mountain
- **Forest**: Wrapped Woods
- **Coastal**: Bridge Bay
- **Gardens**: Governance Gardens
- **Highway**: Layer 2 routes

### Weather & Time (Future)
- **Day/Night Cycle**: Different token spawns
- **Weather Effects**:
  - Rain in DeFi (liquidity flowing)
  - Sunny in Stablecoin (stable conditions)
  - Stormy in Meme Mountain (volatility)

### Visual Themes by Area
Each area has unique:
- Color palette
- Music theme (future)
- NPC outfits
- Building architecture
- Ground textures

---

## Technical Implementation Notes

### Scene Structure
Each major area = 1 Phaser Scene:
- `PalletTownScene`
- `StablecoinCityScene`
- `DefiDistrictScene`
- `Layer2ValleyScene`
- `MemeMountainScene`
- `ExchangePlazaScene`
- `WrappedWoodsScene`
- `BridgeBayScene`
- `ResearchInstituteScene`
- `GovernanceGardensScene`
- `EliteGymScene`

Routes can be part of connected scenes or separate mini-scenes.

### Tilemap Approach
- Use Tiled editor for map creation
- Multiple tile layers:
  - Ground layer
  - Decoration layer  - Collision layer (invisible)
  - Overlay layer (shadows, etc.)

### NPC Placement
- Fixed positions in each scene
- Movement patterns: stationary, patrol, wander
- Interaction radius: ~25 pixels

### Encounter Zones
- Define grass tiles as encounter zones
- Different encounter tables per area
- Adjustable encounter rates

### Connections
- Scene transitions via:
  - Player walking to edge
  - Doors/portals
  - Warp points
- Save player's last position
- Smooth transitions

---

## Map Size Estimates

### Area Dimensions (in tiles, 16px per tile)
- **Towns/Cities**: 40x30 tiles (~640x480 px)
- **Routes**: 20x60 tiles (~320x960 px) - vertical
- **Gyms**: Interior scenes, 30x20 tiles

### Total World Size
- Approximate: 10 major areas + 9 routes
- Estimated total: ~150,000 tiles to design
- Actual playing time: 10-15 hours for main story

---

## Key Design Decisions Summary

### Question: How many distinct areas?
**Answer**: 10 major areas + 9 routes = 19 total zones

### Question: What makes each area unique?
**Answer**:
- Distinct crypto concept theme
- Unique visual style and color palette
- Specialized NPCs and dialogue
- Different token encounter tables
- Custom landmarks and buildings

### Question: How do we guide progression?
**Answer**:
- Badge-gated paths (NPCs block progress)
- Level curve matches area progression
- Visual cues (locked gates, signs)
- NPC dialogue hints
- Map markers for gyms

### Question: What environmental storytelling?
**Answer**:
- Visual metaphors (wrapped trees, gift boxes)
- NPC dialogue reflects area theme
- Architecture matches crypto concept
- Signs with themed messages
- Decorative elements reinforce theme
- Weather/atmosphere matches token volatility

---

## Next Steps

1. ✅ **Level Design** - This document (DONE)
2. ⬜ **Tileset Creation** - Design or source pixel art
3. ⬜ **Map Building** - Create first area in Tiled
4. ⬜ **Scene Implementation** - Code first scene
5. ⬜ **NPC Placement** - Position all NPCs
6. ⬜ **Encounter System** - Wire up encounter zones
7. ⬜ **Progression Gates** - Implement badge checks
8. ⬜ **Testing** - Playtest progression flow

---

## Design Principles Checklist

- ✅ Progressive complexity (simple → advanced)
- ✅ Clear visual identity per area
- ✅ Logical connections between areas
- ✅ Educational journey through crypto concepts
- ✅ Balanced level curve
- ✅ Multiple paths for exploration
- ✅ Clear progression gates
- ✅ Environmental storytelling throughout
- ✅ Landmark locations as navigation aids
- ✅ Variety in biomes and aesthetics

---

**Document Version**: 1.0
**Last Updated**: 2026-01-17
**Status**: Complete - Ready for Level Creation Phase
