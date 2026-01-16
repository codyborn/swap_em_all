# Swap 'Em All - Complete Game Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Game Controls](#game-controls)
3. [Gameplay Overview](#gameplay-overview)
4. [NPCs and Locations](#npcs-and-locations)
5. [Token Mechanics](#token-mechanics)
6. [Web3 Integration](#web3-integration)
7. [Tips and Strategies](#tips-and-strategies)

---

## Getting Started

### Prerequisites
- MetaMask, Coinbase Wallet, or WalletConnect-compatible wallet
- Base or Base Sepolia network added to your wallet
- Some USDC on Base (for buying pokeballs and catching tokens)

### First Steps
1. Visit http://localhost:3000
2. Click "Connect Wallet" and choose your wallet
3. Make sure you're on Base or Base Sepolia network
4. Click "START GAME" to begin

---

## Game Controls

### Title Screen
- **ENTER** or **SPACE** or **CLICK** - Start game

### Overworld (Main Map)
- **Arrow Keys** - Move player
- **SPACE** - Interact with NPCs
- **E** - Force encounter (debug)
- **C** - Open Cryptodex
- **ESC** - (Future: Open menu)

### Encounter Screen
- **C** - Attempt to catch token
- **R** or **ESC** - Run away from encounter

### Store/Trader/Cryptodex
- **Arrow Keys (UP/DOWN)** - Navigate menu options
- **ENTER** or **SPACE** - Confirm selection
- **ESC** - Exit/Go back

---

## Gameplay Overview

### Objective
Catch and collect as many different tokens as you can! Trade them strategically to build your collection.

### Core Gameplay Loop
1. **Buy Pokeballs** - Visit the Store Clerk (top-right)
2. **Explore** - Walk around the overworld
3. **Encounter Tokens** - Random encounters occur every ~30 steps
4. **Catch Tokens** - Use pokeballs to catch encountered tokens
5. **Build Collection** - Track your progress in the Cryptodex
6. **Trade Tokens** - Sell tokens to the Trader for USDC

---

## NPCs and Locations

### Professor Oak (Top-Left)
- **Location**: Northwest area of starting map
- **Purpose**: Tutorial and game information
- **Dialogue**: Explains game mechanics
- **Future**: Will give starter pokeballs

### Store Clerk (Top-Right)
- **Location**: Northeast area of starting map
- **Purpose**: Sell pokeballs for USDC
- **Prices**:
  - 1 Pokeball: 1 USDC
  - 5 Pokeballs: 5 USDC
  - 10 Pokeballs: 10 USDC
- **How to Use**: Walk near, press SPACE, select quantity

### Token Trader (Bottom-Center)
- **Location**: South area of starting map
- **Purpose**: Buy tokens from you for USDC
- **How to Use**: Walk near, press SPACE, select token to sell
- **Note**: Prices based on token rarity (coming soon)

---

## Token Mechanics

### Token Rarity System

**Common** (90% catch rate):
- USDC, DAI, USDbC
- High 24h trading volume
- Most frequently encountered
- Green color

**Uncommon** (70% catch rate):
- WETH, cbETH
- Medium 24h trading volume
- Blue color

**Rare** (50% catch rate):
- PEPE, DEGEN, TOSHI
- Lower 24h trading volume
- Purple color

**Legendary** (30% catch rate):
- BRETT, MFER
- Lowest 24h trading volume
- Gold color

### Encounter System
- **Volume-Weighted**: Tokens with higher trading volume appear more often
- **Frequency**: ~10% chance every 30 steps
- **Random Selection**: Uses real volume data to determine which token appears
- **Force Encounter**: Press **E** to trigger encounter immediately (debug feature)

### Catching Mechanics
1. Encounter a wild token
2. Press **C** to attempt catch
3. Uses 1 pokeball
4. Success rate based on rarity
5. On success: Token added to inventory
6. On failure: Token escapes, pokeball lost

### Cryptodex
- **Access**: Press **C** from overworld
- **Stats**: Shows total seen and owned
- **Collection**: Lists all caught tokens with dates
- **Goal**: Catch 'em all!

---

## Web3 Integration

### Current Implementation (MVP)
- Wallet connection via RainbowKit
- USDC balance display in HUD
- Simulated transactions (no actual swaps yet)
- Local state management (Zustand with persistence)

### Coming Soon (Full Web3)
- **Buying Pokeballs**: Real USDC transfers
- **Catching Tokens**: Execute Uniswap swaps (USDC → Token)
- **Selling Tokens**: Execute Uniswap swaps (Token → USDC)
- **On-Chain Verification**: Verify token ownership
- **Transaction History**: Track all swaps

### Gas & Fees
- Network: Base (very low fees ~$0.01)
- Slippage: 0.5% default
- No hidden fees beyond gas

---

## Tips and Strategies

### For Beginners
1. **Start Small**: Buy 5-10 pokeballs to start
2. **Catch Commons First**: Build up your collection with high catch-rate tokens
3. **Save Pokeballs**: Don't waste them all on legendary tokens
4. **Check Cryptodex**: Press C to track your progress

### Advanced Strategies
1. **Volume Trading**: Common tokens are easier to sell later
2. **Rarity Collection**: Legendary tokens may be more valuable
3. **Strategic Selling**: Keep at least one of each for your collection
4. **Pokeball Management**: Always keep some in reserve

### Maximizing Catch Rate
- Common (90%): ~1.1 pokeballs per catch on average
- Uncommon (70%): ~1.4 pokeballs per catch
- Rare (50%): ~2 pokeballs per catch
- Legendary (30%): ~3.3 pokeballs per catch

### USDC Management
- Each pokeball costs 1 USDC
- Budget accordingly based on desired tokens
- Sell unwanted duplicates to recoup USDC

---

## Game Progression

### Early Game (0-5 tokens)
- Focus: Learning mechanics
- Buy 5-10 pokeballs
- Catch common tokens
- Talk to all NPCs

### Mid Game (5-15 tokens)
- Focus: Collection building
- Mix of common and uncommon catches
- Start attempting rare tokens
- Manage pokeball inventory

### Late Game (15+ tokens)
- Focus: Completing Cryptodex
- Hunt for legendaries
- Strategic selling and re-buying
- Maximize collection

---

## Keyboard Shortcuts Reference

| Key | Context | Action |
|-----|---------|--------|
| Arrow Keys | Overworld | Move player |
| SPACE | Overworld | Interact with NPC |
| C | Overworld | Open Cryptodex |
| E | Overworld | Force encounter (debug) |
| C | Encounter | Catch token |
| R | Encounter | Run away |
| ESC | Any menu | Exit/Cancel |
| ENTER/SPACE | Menus | Confirm |
| UP/DOWN | Menus | Navigate options |

---

## Troubleshooting

### Wallet Won't Connect
- Make sure you're on Base or Base Sepolia
- Try refreshing the page
- Check that your wallet extension is unlocked

### No Pokeballs Left
- Visit the Store Clerk (top-right NPC)
- Buy more with USDC

### Can't Find NPCs
- Professor Oak: Top-left area
- Store Clerk: Top-right area
- Token Trader: Bottom-center area
- Look for colored squares on the map

### Encounters Not Triggering
- Keep walking (need ~30 steps)
- Press E to force an encounter (debug)
- Make sure you're moving continuously

---

## Future Features

### Coming Soon
- Real Uniswap swap integration
- More token types (50+ tokens)
- Actual pixel art sprites
- Sound effects and music
- Multiple maps/regions
- Trading between players
- Leaderboards
- Achievements

### Under Consideration
- PvP battles
- Token staking
- Breeding/fusion mechanics
- NFT integration
- Mobile version

---

## Support & Community

- **Issues**: Report bugs on GitHub
- **Feedback**: Share your ideas!
- **Development**: Follow progress in PROGRESS.md

---

**Have fun catching tokens! 🎮**
