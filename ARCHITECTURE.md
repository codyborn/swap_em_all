# Swap 'Em All - Architecture Overview

## Table of Contents
1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Architecture Layers](#architecture-layers)
4. [Core Systems](#core-systems)
5. [Data Flow](#data-flow)
6. [Key Design Decisions](#key-design-decisions)
7. [Integration Points](#integration-points)

---

## Tech Stack

### Frontend Framework
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling

### Game Engine
- **Phaser 3.90.0** - 2D game engine for canvas rendering
- Game Boy aesthetic (160x144 resolution, 4x scale)

### Web3 Integration
- **wagmi** - React hooks for Ethereum
- **viem** - TypeScript Ethereum library
- **WalletConnect, MetaMask, Coinbase Wallet** - Multi-wallet support
- **Base & Base Sepolia** - L2 blockchain networks

### State Management
- **Zustand** - Lightweight state management with persistence
- **localStorage** - Client-side persistence for game state

### External APIs
- **CoinGecko API** - Real-time cryptocurrency prices
- **Uniswap V3 SDK** - DEX integration (planned)

---

## Project Structure

```
swap_em_all/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── swap/                 # Swap/trade endpoints
│   │   └── tokens/               # Token data endpoints
│   ├── game/                     # Game pages
│   ├── layout.tsx                # Root layout with providers
│   └── page.tsx                  # Landing page
│
├── components/                   # React Components
│   ├── game/                     # Game-specific components
│   │   ├── GameBoyShell.tsx      # Visual shell wrapper
│   │   └── PhaserGame.tsx        # Phaser initialization
│   ├── ui/                       # UI components (HUD)
│   └── wallet/                   # Web3 wallet components
│
├── game/                         # Phaser Game Code
│   ├── scenes/                   # All game scenes
│   │   ├── BootScene.ts          # Asset loading
│   │   ├── TitleScene.ts         # Main menu
│   │   ├── OverworldScene.ts     # Main game world
│   │   ├── BattleScene.ts        # Combat system
│   │   ├── EncounterScene.ts     # Wild token encounters
│   │   ├── BagScene.ts           # Inventory management
│   │   ├── CryptodexScene.ts     # Token collection viewer
│   │   ├── BadgesScene.ts        # Badge display
│   │   ├── StoreScene.ts         # Shop
│   │   ├── TraderScene.ts        # Trading interface
│   │   ├── ProfessorScene.ts     # Tutorial/intro
│   │   └── HealingCenterScene.ts # Token healing
│   │
│   ├── systems/                  # Core game systems
│   │   ├── BattleManager.ts      # Battle logic coordination
│   │   └── PriceTracker.ts       # Automatic price updates
│   │
│   ├── entities/                 # Game entities
│   │   └── NPC.ts                # Non-player characters
│   │
│   ├── utils/                    # Game utilities
│   │   └── SpriteGenerator.ts    # Procedural sprite generation
│   │
│   └── config.ts                 # Phaser configuration
│
├── lib/                          # Shared Libraries
│   ├── store/                    # State management
│   │   ├── gameStore.ts          # Zustand store definition
│   │   └── exposeStore.ts        # Window exposure for Phaser
│   │
│   ├── types/                    # TypeScript definitions
│   │   ├── token.ts              # Token/creature types
│   │   ├── battle.ts             # Battle & gym types
│   │   ├── game.ts               # Game state types
│   │   └── tokens.ts             # Token metadata
│   │
│   ├── utils/                    # Utility functions
│   │   ├── levelingSystem.ts     # Level/stat calculations
│   │   └── damageCalculator.ts   # Damage & health logic
│   │
│   ├── services/                 # External services
│   │   └── priceService.ts       # CoinGecko integration
│   │
│   ├── web3/                     # Web3 configuration
│   │   ├── config.ts             # wagmi config, contracts
│   │   └── chains.ts             # Chain definitions
│   │
│   └── hooks/                    # React hooks
│       └── useUSDCBalance.ts     # USDC balance hook
│
├── docs/                         # Documentation
│   └── archive/                  # Archived docs
│
└── tests/                        # Playwright E2E tests
```

---

## Architecture Layers

### Layer 1: Presentation Layer (Next.js/React)
**Purpose:** Web UI, wallet connection, game container

**Components:**
- `app/layout.tsx` - Provides Web3 context (WagmiProvider)
- `app/page.tsx` - Landing page with wallet connect button
- `app/game/page.tsx` - Game container page
- `components/game/GameBoyShell.tsx` - Visual wrapper (Game Boy aesthetic)
- `components/game/PhaserGame.tsx` - Phaser game initialization
- `components/ui/HUD.tsx` - Heads-up display overlay

**Responsibilities:**
- Wallet connection and authentication
- Phaser game mounting/unmounting
- HUD overlay (USDC balance, pokeballs, etc.)
- Responsive layout and scaling

---

### Layer 2: Game Engine Layer (Phaser)
**Purpose:** Game logic, rendering, player interaction

**Scene Architecture:**
Phaser uses a scene-based architecture where each scene is an independent game state:

```
BootScene (Loading)
    ↓
TitleScene (Main Menu)
    ↓
OverworldScene (Main Hub)
    ├─→ EncounterScene → BattleScene
    ├─→ StoreScene
    ├─→ TraderScene
    ├─→ HealingCenterScene
    ├─→ BagScene ←→ CryptodexScene ←→ BadgesScene
    └─→ ProfessorScene
```

**Key Scenes:**

1. **BootScene** - Loads assets, generates sprites
2. **TitleScene** - Main menu, new game/continue
3. **OverworldScene** - Top-down world, player movement, NPCs
4. **BattleScene** - Turn-based combat UI
5. **EncounterScene** - Wild token encounter UI
6. **BagScene** - Inventory with item management
7. **CryptodexScene** - Token collection viewer
8. **BadgesScene** - Badge display
9. **StoreScene** - Shop for buying items
10. **HealingCenterScene** - Heal tokens
11. **TraderScene** - Token trading interface

**Scene Communication:**
- Scenes communicate via `scene.start(sceneName, data)`
- Data passed as objects between scenes
- Global state accessed via `(window as any).gameStore`

---

### Layer 3: State Management Layer (Zustand)
**Purpose:** Global game state with persistence

**Store Structure:**
```typescript
GameState {
  // Resources
  pokeballs: number
  usdc: number
  items: { potions, revives, etc. }

  // Collections
  inventory: CaughtToken[]
  cryptodex: Set<string>
  badges: Badge[]
  gymsDefeated: string[]

  // Progress
  tutorialComplete: boolean
  encountersCount: number

  // Actions (mutations)
  addPokeballs(), usePokeball()
  catchToken(), sellToken()
  updateTokenPrice(), updateTokenHealth()
  addUSDC(), spendUSDC()
  earnBadge(), defeatGym()
  healToken(), reviveToken()
  addItem(), useItem()
}
```

**Persistence:**
- Uses Zustand's `persist` middleware
- Stored in `localStorage` under key `swap-em-all-storage-v2`
- Custom serialization for Set types
- Version: 2 (migration support)

**Access Patterns:**
- **React Components:** `const state = useGameStore()`
- **Phaser Scenes:** `(window as any).gameStore.getState()`

---

### Layer 4: Business Logic Layer
**Purpose:** Game mechanics, calculations, rules

**Core Systems:**

1. **LevelingSystem** (`lib/utils/levelingSystem.ts`)
   - Calculates token level from price gains
   - Formula: `level = 1 + 3 * sqrt(max_gain * 100)`
   - Manages stats scaling (HP, Attack, Defense, Speed)
   - Handles level-up rewards (new moves, stat increases)

2. **DamageCalculator** (`lib/utils/damageCalculator.ts`)
   - Calculates battle damage from moves
   - Applies type effectiveness multipliers
   - Handles critical hits (random chance)
   - Calculates price-based damage (when tokens drop from peak)
   - Health management (healing, revival, knockout)

3. **BattleManager** (`game/systems/BattleManager.ts`)
   - Orchestrates turn-based combat
   - Manages battle state machine:
     - `select_move` → `turn_animation` → `complete`
   - AI move selection for opponents
   - Victory/defeat detection
   - Reward distribution

4. **PriceTracker** (`game/systems/PriceTracker.ts`)
   - Polls CoinGecko API every 60 seconds
   - Updates all inventory token prices
   - Triggers level-up checks
   - Applies price damage
   - Shows level-up notifications

5. **SpriteGenerator** (`game/utils/SpriteGenerator.ts`)
   - Procedurally generates pixel art sprites
   - Creates player sprites (4 directions x 4 frames)
   - Creates NPC sprites (5 types with colors)
   - Creates token sprites (8 types, idle + battle animations)

---

### Layer 5: Data Layer
**Purpose:** External data sources

**Services:**

1. **PriceService** (`lib/services/priceService.ts`)
   - Fetches real-time crypto prices from CoinGecko
   - Maps 24 tokens to CoinGecko IDs
   - Implements 1-minute caching
   - Fallback to mock prices on error

2. **API Routes** (`app/api/`)
   - `GET /api/tokens` - List available tokens
   - `POST /api/tokens/prices` - Batch fetch token prices
   - `GET /api/tokens/encounter` - Generate wild encounter
   - `POST /api/swap/quote` - Get Uniswap swap quote (planned)

---

## Core Systems

### Token System

**Token Lifecycle:**
```
1. Encounter → 2. Catch → 3. Level Up → 4. Battle → 5. Sell/Trade
```

**Token Data Structure:**
```typescript
CaughtToken {
  // Identity
  symbol: string
  name: string
  address: string
  type: TokenType

  // Financials
  purchasePrice: number
  currentPrice: number
  peakPrice: number
  priceHistory: PricePoint[]

  // Stats
  level: number
  maxLevel: number
  experience: number
  health: number
  maxHealth: number
  stats: { attack, defense, speed }

  // Moves
  moves: Move[]

  // Metadata
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary'
  description: string
  caughtAt: number
  levelHistory: LevelHistoryEntry[]
}
```

**Token Types:**
- **DeFi** - Balanced stats (UNI, AAVE, LINK)
- **Layer1** - High HP (ETH, BTC, SOL)
- **Layer2** - High Speed (OP, ARB)
- **Stablecoin** - Low stats, stable (USDC, DAI)
- **Meme** - High Attack, low Defense (DOGE, SHIB)
- **Exchange** - Balanced (BNB, CRO)
- **Governance** - High Defense (MKR, COMP)
- **Wrapped** - Inherits base token stats (WETH, WBTC)

---

### Battle System

**Battle Flow:**
```
1. Initialize Battle (Player vs Opponent)
   ↓
2. Select Moves (Player chooses, AI auto-selects)
   ↓
3. Determine Turn Order (Speed stat)
   ↓
4. Execute First Move
   ↓
5. Check for Victory/Defeat
   ↓
6. Execute Second Move (if battle continues)
   ↓
7. Check for Victory/Defeat
   ↓
8. Complete Turn (return to step 2)
```

**Battle Types:**
- **Wild Battle** - Catch wild tokens in grass
- **Gym Battle** - Boss fights for badges
- **Trainer Battle** - NPC battles (planned)

**Move System:**
```typescript
Move {
  name: string
  type: MoveType
  power: number        // Base damage
  accuracy: number     // Hit chance (0-100)
  category: 'physical' | 'special'
  priority: number     // Turn order modifier
  learnedAt: number    // Required level
}
```

**Damage Calculation:**
```
damage = ((2 * level / 5 + 2) * power * (attack / defense) / 50 + 2)
       * effectiveness * critMultiplier * random(0.85, 1.0)
```

**Type Effectiveness:**
- DeFi → Stablecoin: 2x damage
- Meme → DeFi: 2x damage
- Layer2 → Layer1: 2x damage
- Stablecoin → Meme: 2x damage

---

### Price-Based Mechanics

**Core Innovation:** Token stats are tied to real cryptocurrency prices

**Gain Calculations:**
```typescript
curr_gain = (currentPrice - purchasePrice) / purchasePrice
max_gain = (peakPrice - purchasePrice) / purchasePrice
```

**Stat Relationships:**
- **Level** - Based on `max_gain` (highest price ever reached)
- **Max HP** - Based on `level` and token type
- **Attack** - Based on `curr_gain` (current profit/loss)
- **Defense** - Static per level
- **Speed** - Static per level

**Price Damage:**
When price drops below peak, tokens take damage:
```typescript
priceDrop = (peakPrice - currentPrice) / peakPrice
damage = (priceDrop * maxHealth) * 0.5
```

This creates dynamic gameplay where:
- Buying low and selling high → stronger tokens
- Price drops → tokens get damaged
- Holding through volatility → risk/reward

---

### Progression System

**Gym Leaders:**
```typescript
// 8 gyms total, each with unique theme
{
  id: 'gym1'
  name: 'Stable Master'
  specialty: 'Stablecoins'
  team: [USDC Lv1, DAI Lv1]
  badge: 'Stable Badge'
}
```

**Badge Benefits:**
- Proof of gym completion
- Unlock new areas (planned)
- Stat bonuses (planned)

**Game Loop:**
```
Explore → Encounter → Catch → Train → Battle → Earn Badge → Repeat
```

---

## Data Flow

### Price Update Flow
```
1. PriceTracker (every 60s)
   ↓
2. POST /api/tokens/prices (batch request)
   ↓
3. priceService.fetchTokenPrices()
   ↓
4. CoinGecko API (with 1-min cache)
   ↓
5. gameStore.updateTokenPrice()
   ↓
6. LevelingSystem.checkLevelUp()
   ↓
7. DamageCalculator.applyPriceDamage()
   ↓
8. Show notification if level up
```

### Encounter Flow
```
1. Player walks in grass
   ↓
2. Random chance triggers encounter
   ↓
3. GET /api/tokens/encounter
   ↓
4. Volume-weighted random selection
   ↓
5. Fetch real-time price from CoinGecko
   ↓
6. scene.start('EncounterScene', { token })
   ↓
7. Player chooses: Fight or Catch
   ↓
8. If Catch: gameStore.usePokeball() + catchToken()
```

### Battle Flow
```
1. Trigger battle (gym/wild)
   ↓
2. BattleManager.init(playerToken, opponentToken)
   ↓
3. scene.start('BattleScene', { battleData })
   ↓
4. Player selects move (UP/DOWN to select, ENTER to confirm)
   ↓
5. AI selects move (BattleManager.selectAIMove)
   ↓
6. Determine turn order (speed stat)
   ↓
7. Execute moves with damage calculation
   ↓
8. Update HP via gameStore.updateTokenHealth()
   ↓
9. Check victory/defeat
   ↓
10. Award rewards (USDC, badge)
   ↓
11. Return to overworld
```

---

## Key Design Decisions

### 1. **Phaser + Next.js Split**
**Decision:** Use Next.js for UI chrome, Phaser for game logic

**Rationale:**
- Phaser excels at 2D game rendering and input handling
- Next.js provides modern React ecosystem for wallet/web3
- Clear separation of concerns

**Tradeoff:**
- Requires window-level communication between layers
- Phaser must be client-side only (dynamic import)

---

### 2. **Zustand with Window Exposure**
**Decision:** Use Zustand for state, expose to window for Phaser access

**Rationale:**
- Zustand is lightweight and has built-in persistence
- Phaser can't directly use React hooks
- Window exposure allows Phaser scenes to access game state

**Implementation:**
```typescript
// In React
const state = useGameStore()

// In Phaser
const state = (window as any).gameStore.getState()
```

---

### 3. **curr_gain vs max_gain**
**Decision:** Split gains into current and maximum

**Rationale:**
- **max_gain** determines level (permanent progression)
- **curr_gain** determines attack (dynamic stat)
- Encourages holding during dips (level doesn't decrease)
- Creates risk/reward for volatile tokens

**Example:**
```
Buy at $100
Peak at $200 → max_gain = 100% → Level 4
Drop to $150 → curr_gain = 50%  → Lower attack
Level stays at 4 (doesn't regress)
```

---

### 4. **Procedural Sprite Generation**
**Decision:** Generate sprites programmatically instead of using image assets

**Rationale:**
- No copyright issues
- Instant asset creation
- Easy to modify colors/styles
- Smaller bundle size

**Implementation:**
- Canvas API to draw pixel art
- Convert to Phaser texture
- Define animation frames manually

---

### 5. **Symbol-Based Addressing**
**Decision:** Use token symbols (UNI, ETH) instead of contract addresses

**Rationale:**
- Simpler for price API lookups
- More readable in code
- Addresses vary per chain, symbols are universal

**Format:** `"SYMBOL:address"` or just `"SYMBOL"`

---

### 6. **Scene-Based Architecture**
**Decision:** Each game state is a separate Phaser scene

**Rationale:**
- Clear separation of concerns
- Easy to add new features (new scene)
- Built-in scene lifecycle (create, update, shutdown)
- Independent asset loading per scene

**Pattern:**
```typescript
scene.start('NextScene', data)  // Stop current, start next
scene.launch('ParallelScene')   // Run alongside current
scene.pause('CurrentScene')     // Pause without stopping
```

---

### 7. **1-Minute Price Polling**
**Decision:** Update prices every 60 seconds

**Rationale:**
- CoinGecko free tier rate limits
- Balance between freshness and API costs
- Sufficient granularity for gameplay
- 1-minute cache prevents duplicate requests

---

## Integration Points

### Web3 Integration (Planned)
**Current State:** Mock USDC balance, simulated swaps

**Planned Integration:**
```typescript
// Catch = Swap
async function catchToken(tokenAddress: string, amount: bigint) {
  // 1. Get Uniswap quote
  const quote = await fetch('/api/swap/quote', {
    method: 'POST',
    body: JSON.stringify({
      tokenIn: CONTRACTS.USDC[chainId],
      tokenOut: tokenAddress,
      amountIn: amount
    })
  })

  // 2. Sign transaction
  const tx = await writeContract({
    address: CONTRACTS.UNISWAP_UNIVERSAL_ROUTER[chainId],
    abi: UNIVERSAL_ROUTER_ABI,
    functionName: 'execute',
    args: [quote.calldata]
  })

  // 3. Wait for confirmation
  await waitForTransaction(tx)

  // 4. Add to inventory with actual purchase price
  gameStore.getState().catchToken({
    symbol,
    name,
    address: tokenAddress,
    purchasePrice: quote.executionPrice,
    currentPrice: quote.executionPrice,
    caughtAt: Date.now()
  })
}
```

**Integration Points:**
1. `EncounterScene.tsx` - Catch button triggers real swap
2. `TraderScene.ts` - Sell button triggers reverse swap
3. `StoreScene.ts` - Buy pokeballs with real USDC
4. `HUD.tsx` - Display real wallet balance

---

### CoinGecko API
**Current Usage:**
- `lib/services/priceService.ts` - Price fetching with cache
- `game/systems/PriceTracker.ts` - Automatic polling
- `app/api/tokens/prices/route.ts` - Batch endpoint

**Rate Limits:**
- Free tier: 10-50 calls/minute
- Cache: 1 minute per symbol
- Batch requests to optimize

---

### Future Integrations

1. **The Graph** - Index token ownership and transfers
2. **ENS** - Display ENS names for wallet addresses
3. **IPFS** - Store token metadata off-chain
4. **Chainlink** - Alternative price oracles
5. **Safe** - Multi-sig wallet support

---

## Performance Considerations

### Asset Loading
- Sprites generated procedurally (no large image files)
- Minimal asset bundle
- Lazy scene loading

### State Updates
- Zustand uses immutable updates
- Price tracker batches updates
- LocalStorage writes are throttled

### Rendering
- Phaser WebGL renderer
- 160x144 low resolution (retro aesthetic)
- Pixel art scaling (no anti-aliasing)
- 60 FPS target

### Memory Management
- Scene cleanup on shutdown
- Remove event listeners
- Destroy unused textures
- Limit price history (last 100 points)

---

## Security Considerations

### Current (Simulated Mode)
- No real funds at risk
- Client-side only storage
- No backend state

### Future (Web3 Integration)
- **Slippage Protection** - Max 0.5% slippage on swaps
- **Transaction Signing** - User must approve each transaction
- **Input Validation** - Validate all user inputs
- **Reentrancy** - Use Uniswap's battle-tested contracts
- **Phishing Protection** - Verify contract addresses
- **Gas Estimation** - Show gas costs before transaction

---

## Development Workflow

### Local Development
```bash
npm run dev           # Start Next.js dev server
npm run build         # Production build
npm run test          # Run Playwright tests
```

### Environment Variables
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=xxx
NEXT_PUBLIC_COINGECKO_API_KEY=xxx (optional)
```

### Code Organization
- **React/Next.js** - Follow Next.js conventions
- **Phaser** - ES6 classes extending Phaser.Scene
- **TypeScript** - Strict mode enabled
- **Formatting** - Prettier + ESLint

---

## Testing Strategy

### E2E Tests (Playwright)
Located in `/tests/`:
- `simple-validation.spec.ts` - Basic game loading
- `inventory-navigation.spec.ts` - Menu cycling
- `dialogue-working.spec.ts` - NPC interactions
- `battle-scene-rendering.spec.ts` - Combat UI
- `sprite-loading.spec.ts` - Asset generation

### Manual Testing
- Catch tokens with different price points
- Verify level-up calculations
- Test battle mechanics
- Check persistence across refreshes
- Validate price updates

### Future Testing
- Unit tests for game logic
- Integration tests for Web3 flows
- Snapshot tests for UI
- Performance benchmarks

---

## Deployment

### Current Hosting
- Next.js app (Vercel recommended)
- Static asset CDN
- Client-side only (no backend)

### Future Considerations
- **Backend API** - Save game data server-side
- **Websockets** - Real-time multiplayer
- **Database** - Player profiles, leaderboards
- **CDN** - Sprite assets if moving to images

---

## Known Limitations

1. **No Backend** - All state is client-side, easily modified
2. **Mock USDC** - Not connected to real wallets yet
3. **Limited World** - Single overworld scene, no tilesets
4. **Basic AI** - Random move selection
5. **No Multiplayer** - Single-player only
6. **Price Accuracy** - 1-minute granularity, not real-time
7. **No Audio** - Silent game (music/SFX planned)
8. **Desktop Only** - No mobile touch controls

---

## Glossary

- **Token** - Cryptocurrency that acts as a catchable creature
- **Cryptodex** - Pokedex equivalent, token collection tracker
- **Gym Leader** - Boss battle for badges
- **Pokeball** - Consumable item to catch tokens
- **curr_gain** - Current profit percentage (affects attack)
- **max_gain** - Maximum profit ever reached (affects level)
- **Scene** - Independent game state in Phaser
- **Sprite** - 2D visual representation of entities

---

## Future Architecture Improvements

1. **Scene Manager** - Centralized scene transition logic
2. **Event Bus** - Decouple scene communication
3. **Asset Pipeline** - Proper tileset workflow
4. **Sound Manager** - Audio system with volume controls
5. **Save System** - Cloud saves with conflict resolution
6. **Network Layer** - WebSocket for multiplayer
7. **Mod Support** - Plugin system for custom tokens/scenes
8. **Analytics** - Track player behavior and progression

---

*Last Updated: 2026-01-17*
