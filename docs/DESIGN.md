# Swap 'Em All - Design Document

## Project Overview
A GameBoy-style web game where players collect tokens (crypto assets) by catching them in the wild, similar to Pokémon. Players swap USDC for tokens through gameplay mechanics that make DeFi fun and engaging.

## Core Concept
- **Name**: Swap 'Em All (or "Cryptomon" / "TokenMon")
- **Platform**: Web-based (Vercel deployment)
- **Style**: GameBoy Color aesthetic (160x144 display, pixelated graphics, limited color palette)
- **Chain**: Base (recommended) or Ethereum mainnet

## Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Styling**: TailwindCSS + custom GameBoy CSS theme
- **Language**: TypeScript

### Game Engine Options (in order of preference)
1. **Phaser 3** - Mature, well-documented, great for 2D RPGs
   - Pros: Built-in scene management, tilemap support, sprite animations
   - Cons: Larger bundle size
2. **Kaboom.js** - Lightweight, simple API
   - Pros: Very easy to learn, small bundle
   - Cons: Less features, might need custom implementations
3. **Custom HTML5 Canvas** - Maximum control
   - Pros: Minimal dependencies, full control
   - Cons: More code to write

**Recommendation**: Start with Phaser 3, fallback to Canvas if issues arise

### Web3 Integration
- **Wallet Connection**: wagmi + viem (from uniswap-builder)
- **Wallet UI**: RainbowKit or ConnectKit
- **Swap Integration**: Uniswap Trading API
- **Chain**: Base (lower fees, better UX)

### Image Generation
- **AI Tools**:
  - Token sprites: Replicate API with Stable Diffusion or DALL-E 3 via OpenAI
  - Character/NPC sprites: Same as above
  - Tilesets: Use existing pixel art generators or Aseprite
- **Fallback**: Use placeholder sprites, implement AI generation as enhancement

## Component Architecture

### 1. Game Engine Layer
```
components/game/
├── GameContainer.tsx       # Main game wrapper
├── GameEngine.tsx          # Phaser game instance
├── scenes/
│   ├── BootScene.ts       # Initial loading (GameBoy boot animation)
│   ├── TitleScene.ts      # Title screen with "Press Start"
│   ├── OverworldScene.ts  # Main gameplay scene
│   └── BattleScene.ts     # Token encounter/catch scene
├── entities/
│   ├── Player.ts          # Player character controller
│   ├── NPC.ts             # Store/Trader NPCs
│   └── Token.ts           # Wild token entities
└── systems/
    ├── EncounterSystem.ts # Random encounter logic
    ├── InventorySystem.ts # Pokeball/token management
    └── MapSystem.ts       # Tilemap handling
```

### 2. Web3 Layer
```
lib/web3/
├── hooks/
│   ├── useWallet.ts          # Wallet connection state
│   ├── useTokenData.ts       # Fetch top tokens by volume
│   ├── useSwap.ts            # Execute swaps via Uniswap
│   └── useBalance.ts         # Check USDC/token balances
├── services/
│   ├── uniswapService.ts     # Uniswap Trading API integration
│   ├── tokenService.ts       # Token metadata & volume data
│   └── priceService.ts       # Real-time price feeds
└── contracts/
    └── constants.ts          # Contract addresses, ABIs
```

### 3. Game State Management
```
lib/game/
├── GameStateManager.ts    # Central game state (Zustand or Context)
├── PlayerState.ts         # Player position, inventory, stats
├── TokenState.ts          # Caught tokens, discovery log
└── ShopState.ts           # Pokeball inventory, purchases
```

### 4. AI Image Generation
```
lib/ai/
├── imageGenerator.ts      # Replicate/OpenAI API wrapper
├── spriteCache.ts         # Cache generated sprites
└── tokenSprites.ts        # Token-to-sprite mapping
```

## Gameplay Mechanics

### Core Loop
1. **Exploration**: Walk around overworld map
2. **Encounters**: Random token encounters based on volume-weighted probability
3. **Catching**: Use pokeball ($5 USDC) to swap for token (100% catch rate)
4. **Collection**: View caught tokens in inventory
5. **Trading**: Sell tokens back to USDC at current rate via Trader NPC

### Game Zones
- **Starting Town**: Contains Store NPC and Trader NPC
- **Wild Areas**: 3-4 different terrains (grass, water, cave, urban)
- **Different terrains can have different token pools** (optional: DeFi-themed zones)

### NPCs
1. **Store Clerk**: Sells pokeballs for $5 USDC each
   - UI: GameBoy-style shop menu
   - Action: Approve USDC, transfer to contract

2. **Token Trader**: Buys tokens back for current market value in USDC
   - UI: Shows inventory, current prices, allows batch selling
   - Action: Swap tokens back to USDC

3. **Professor (Tutorial)**: Explains game mechanics
   - Optional: Give 1 free pokeball to start

### Encounter System
- **Trigger**: Random encounters while walking in grass/wild areas (similar to Pokémon)
- **Frequency**: ~10-15% chance per step in encounter zones
- **Token Selection**:
  ```typescript
  // Weighted random selection based on 24h volume
  const tokenPool = topTokens.map(token => ({
    address: token.address,
    symbol: token.symbol,
    weight: token.volume24h
  }))
  ```
- **Common tokens**: BTC, ETH, SOL, PEPE, DOGE (high volume)
- **Rare tokens**: Lower volume altcoins
- **Legendary tokens**: New/trending tokens (special spawn conditions)

### Battle/Catch Scene
1. Transition to battle screen (screen flash animation)
2. Show token sprite and name/symbol
3. Display options:
   - **CATCH** (if player has pokeballs): Execute swap
   - **RUN**: Return to overworld
4. If catch succeeds:
   - Play catch animation
   - Show "You swapped for [TOKEN]!"
   - Update inventory
5. Return to overworld

### Inventory System
- **Pokeballs**: Quantity in wallet
- **Caught Tokens**: List with sprites, amounts, current value
- **Cryptodex**: Discovery log (like Pokédex) showing all encountered tokens

## Token Economics

### Pokeball Pricing
- **Fixed price**: $5 USDC per pokeball
- Simplifies UX, predictable costs
- Consider dynamic pricing later (e.g., volume-based)

### Swap Execution
```typescript
// When catching a token:
1. Check: Player has >= 1 pokeball
2. Check: Player has >= $5 USDC approved
3. Execute: Swap $5 USDC for token
4. Update: Decrement pokeball count
5. Update: Add token to inventory

// When selling to Trader:
1. Show: Current market value for each token
2. Execute: Swap token(s) for USDC
3. Update: Remove token(s) from inventory
```

### Revenue Model (Optional)
- Take 0.5-1% fee on swaps
- Store fees in treasury contract
- Or: Make it completely fee-less for better UX

## Image Generation Strategy

### Option 1: Pre-generated Assets (Recommended for MVP)
1. Generate ~20-30 token sprites using AI before launch
2. Use consistent prompt template:
   ```
   "Pixel art creature in Game Boy Color style, 32x32 pixels,
    inspired by [TOKEN_NAME], limited color palette, front-facing view"
   ```
3. Cache sprites in public assets folder
4. Map token address → sprite file

### Option 2: Dynamic AI Generation
1. Generate sprites on-demand when token is first encountered
2. Cache in database/IPFS
3. Use Replicate API or OpenAI DALL-E 3
4. Fallback to placeholder if generation fails

### Option 3: Hybrid Approach (Best Long-term)
1. Pre-generate top 50 tokens by volume
2. Generate on-demand for long-tail tokens
3. Community contributions for custom sprites

### Art Style Guidelines
- **Color Palette**: GameBoy Color (56 colors max, typically 4-color palettes)
- **Resolution**: 16x16 or 32x32 pixels for tokens
- **Style**: Cute/friendly creatures representing token characteristics
  - ETH: Ethereal dragon/phoenix
  - BTC: Golden coin creature
  - PEPE: Frog-based (obvious)
  - USDC: Blue coin character

### Other Assets Needed
- **Player Sprite**: 16x16, 4-direction walk animation
- **NPC Sprites**: Store clerk, trader, professor (static or simple animation)
- **Tilesets**: Grass, water, trees, buildings, paths (16x16 tiles)
- **UI Elements**: Dialogue boxes, menus, buttons (GameBoy-styled)

## Wallet Integration

### Connection Flow
1. Landing page: "Press Start" + "Connect Wallet" button
2. Use RainbowKit modal for wallet selection
3. After connection, load game state:
   - Fetch USDC balance
   - Fetch owned tokens (caught tokens)
   - Initialize pokeball count (could be ERC-20 or off-chain)

### Pokeball Storage Options
**Option A: ERC-20 Token** (More complex, on-chain)
- Mint pokeball tokens when purchased
- Burn when used to catch
- Tradeable/transferable

**Option B: Off-chain State** (Simpler, recommended for MVP)
- Track purchases in database
- Link to wallet address
- Verify USDC transfers before granting pokeballs

**Recommendation**: Option B for MVP, Option A for v2

### Transaction Flow
```typescript
// Buying pokeballs:
1. User clicks "Buy 5 Pokeballs" ($25 USDC)
2. Check USDC balance >= $25
3. Approve USDC spending (if needed)
4. Transfer USDC to treasury/contract
5. Update off-chain: increment pokeball count
6. Show success animation

// Catching token:
1. User encounters TOKEN_X
2. User clicks "CATCH"
3. Check pokeball count >= 1
4. Build swap transaction via Uniswap Trading API:
   - Input: $5 USDC
   - Output: TOKEN_X (minimum amount based on slippage)
5. Execute swap transaction
6. Wait for confirmation
7. Decrement pokeball count
8. Update inventory with caught token
9. Play success animation

// Selling token:
1. User talks to Trader NPC
2. Shows inventory with current values
3. User selects token(s) to sell
4. Build swap transaction(s):
   - Input: TOKEN_X amount
   - Output: USDC (with slippage)
5. Execute swap(s)
6. Update inventory
7. Show USDC received
```

### Smart Contract Architecture
```solidity
// Option 1: Simple Treasury (Recommended)
contract SwapEmAllTreasury {
  // Receive USDC for pokeball purchases
  // Owner can withdraw fees
  // No complex logic
}

// Option 2: Full Integration
contract SwapEmAllGame {
  // ERC-20 Pokeball tokens
  // Purchase logic
  // Integration with Uniswap Router
  // Catch/swap logic
}
```

**Recommendation**: Start with simple USDC transfers, no custom contract needed for MVP

## User Flows

### First-Time User
1. Land on website → See GameBoy boot screen
2. "Press Start" → Connect Wallet prompt
3. Connect wallet → Title screen with "New Game"
4. Start game → Tutorial with Professor NPC
5. Professor explains mechanics, gives 1 free pokeball
6. Player walks to Store, sees pokeball prices
7. Player explores grass, triggers first encounter
8. Catches first token (uses free pokeball)
9. Returns to town, talks to Trader to understand selling
10. Prompted to buy more pokeballs to continue

### Core Gameplay Loop
1. Buy pokeballs at Store (batch purchase: 1, 5, 10)
2. Explore different terrain types
3. Encounter tokens (weighted by volume)
4. Catch tokens (instant 100% success)
5. View collection in Cryptodex
6. Sell tokens at Trader when ready to cash out
7. Use USDC to buy more pokeballs
8. Repeat

### Edge Cases
- **No USDC**: Show message, prompt to add funds
- **No pokeballs in encounter**: Show "No pokeballs left!", option to run
- **Failed transaction**: Retry option, clear error message
- **Disconnected wallet**: Pause game, prompt to reconnect
- **Network congestion**: Show pending transaction, allow gameplay to continue

## Map Design (MVP)

### Town (Starting Area)
```
[Store] [Trader]    [Professor's Lab]
   🏠      🏠            🏛️

        [Player Start]
            👤

    ========ROUTE 1========
```

### Route 1 (Grass/Normal)
- Grass patches (random encounters)
- Path between town and other areas
- Tokens: Common (ETH, BTC, USDC, USDT)

### Forest Area
- Dense trees, grass
- Tokens: Mid-tier volume tokens

### Water Route
- Requires "surfing" (or just walkable for MVP)
- Tokens: Blue-themed or specific token categories

### Cave/Mountain
- Dark aesthetic
- Tokens: Rare/lower volume tokens

**Map Size**: Start with ~50x50 tiles (800x800 pixels), expandable

## GameBoy Aesthetic

### Visual Design
- **Screen Resolution**: 160x144 pixels (scale up 3-4x for modern displays)
- **Border**: GameBoy Color shell border around game screen
- **Color Palette**: Limited to GameBoy Color palette
- **Fonts**: Retro pixel fonts (Press Start 2P or similar)
- **UI**: All menus and dialogues GameBoy-styled

### Sound Design (Future Enhancement)
- 8-bit background music
- Sound effects for:
  - Walking
  - Menu navigation
  - Encounters
  - Successful catch
  - Transactions

### Animations
- Character walk cycle (4 frames per direction)
- Token appearance (fade in or shake)
- Pokeball throw animation
- Catch success (stars/sparkles)
- Screen transitions (fade, flash)

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1)
- [ ] Next.js project setup with TypeScript
- [ ] Phaser 3 integration
- [ ] Basic game loop with player movement
- [ ] Simple tilemap (town + one route)
- [ ] GameBoy styling and container

### Phase 2: Web3 Integration (Week 1-2)
- [ ] Wallet connection (wagmi + RainbowKit)
- [ ] USDC balance checking
- [ ] Uniswap Trading API integration
- [ ] Basic swap execution (mock at first)
- [ ] Transaction state management

### Phase 3: Game Mechanics (Week 2)
- [ ] NPC dialogue system
- [ ] Store: Buy pokeballs (USDC transfer)
- [ ] Random encounter system
- [ ] Battle scene UI
- [ ] Catch mechanic (execute swap)
- [ ] Inventory system

### Phase 4: Token Integration (Week 2-3)
- [ ] Fetch top tokens by volume from Uniswap/CoinGecko
- [ ] Weighted random selection algorithm
- [ ] Token metadata (name, symbol, logo)
- [ ] Real swap execution
- [ ] Trader NPC: Sell tokens back

### Phase 5: Assets & Polish (Week 3)
- [ ] Generate token sprites with AI
- [ ] Create player and NPC sprites
- [ ] Design and implement tilesets
- [ ] Add animations
- [ ] Polish UI/UX
- [ ] Add sound effects (optional)

### Phase 6: Testing & Deployment (Week 4)
- [ ] Test all swap flows
- [ ] Test on testnet
- [ ] Security review
- [ ] Deploy to Vercel
- [ ] Monitor initial users

## Technical Considerations

### Performance
- Optimize sprite loading (sprite sheets)
- Lazy load Phaser only on game start
- Cache token data to reduce API calls
- Debounce encounter checks

### Security
- Validate all transactions client-side before signing
- Set reasonable slippage (0.5-2%)
- Prevent double-spending on pokeball usage
- Rate limit AI generation to prevent abuse

### Scalability
- Use Next.js API routes for:
  - Token data aggregation
  - AI image generation
  - Analytics
- Cache token metadata (Redis or Vercel KV)
- Consider database for user state (optional)

### Mobile Responsiveness
- Game scales to fit screen
- Touch controls for mobile:
  - Virtual D-pad
  - Touch to walk (pathfinding)
- Maintain aspect ratio

## Future Enhancements

### V2 Features
- **Trading**: P2P token trading between players
- **Battles**: PvP battles using token stats
- **Evolution**: Combine tokens or stake to "evolve" them
- **Breeding**: Combine two tokens to get a new one (advanced swaps)
- **Achievements**: NFT badges for milestones
- **Leaderboards**: Most tokens caught, highest portfolio value
- **Guilds**: Team-based gameplay
- **Quests**: Daily/weekly challenges with rewards

### Advanced Mechanics
- **Token Stats**: Each token has stats based on market metrics
  - HP: Market cap
  - ATK: 24h volume
  - DEF: Liquidity depth
  - SPD: Price volatility
- **Rarity Tiers**: Common, Uncommon, Rare, Epic, Legendary
- **Shiny Tokens**: 1/8192 chance for special sprite variant
- **Master Ball**: Guaranteed catch for any token (premium item)

### Monetization Options
- Take small fee on swaps (0.5%)
- Premium "Master Balls" for instant swaps
- Cosmetic NFTs (custom player sprites)
- Sponsored tokens (projects pay to feature their token)

## Success Metrics
- Daily Active Users (DAU)
- Total Volume Swapped
- Average session duration
- Tokens caught per user
- Return user rate
- Social shares

## Risks & Mitigations

### Technical Risks
- **Phaser bundle size**: Fallback to lightweight canvas engine
- **AI generation latency**: Pre-generate popular tokens
- **Transaction failures**: Clear error messages, retry logic
- **Slippage**: Set conservative defaults, let users adjust

### User Experience Risks
- **Complexity**: Comprehensive tutorial, simple UI
- **Gas fees**: Deploy on Base (low fees)
- **Learning curve**: Make it fun first, educational second

### Market Risks
- **Low liquidity tokens**: Filter out tokens below threshold
- **Rug pulls**: Only show established tokens from trusted sources
- **Regulatory**: Clearly communicate this is educational/entertainment

## Conclusion
Swap 'Em All combines the nostalgia of GameBoy-era gaming with modern DeFi in a fun, approachable way. By gamifying token swaps, we make DeFi accessible to users who might be intimidated by traditional DEX interfaces.

The key is keeping it simple for MVP: solid game mechanics, smooth wallet integration, and reliable swaps. AI-generated sprites and additional features can be layered on once the core loop is proven.

**Next Steps**:
1. Validate technical feasibility with proof-of-concept
2. Generate initial token sprites
3. Build core game loop
4. Integrate Uniswap Trading API
5. Deploy MVP and gather feedback
