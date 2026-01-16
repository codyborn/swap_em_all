# 🎮 Swap 'Em All

> A GameBoy-style web game where you collect crypto tokens like Pokémon, powered by Uniswap on Base

## 🎯 Concept

**"Gotta swap 'em all!"**

- Walk around a retro GameBoy-style map
- Encounter tokens in the wild (weighted by trading volume)
- Buy pokeballs with USDC ($5 each)
- Catch tokens = swap USDC for that token
- Sell tokens back to an NPC trader for USDC
- Build your collection in the Cryptodex

## 🏗️ Architecture Overview

### Tech Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Game Engine**: Phaser 3
- **Blockchain**: Base (low fees, fast)
- **Web3**: wagmi + viem + RainbowKit
- **Swaps**: Uniswap Trading API
- **State**: Zustand
- **Styling**: TailwindCSS + custom GameBoy theme

### Key Design Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Game Engine | Phaser 3 | Mature, excellent docs, built-in tilemap support |
| Chain | Base | Low fees ($0.01), fast, official Uniswap support |
| Wallet UI | RainbowKit | Beautiful UI, great UX |
| Sprites | Pre-generated + AI | Fast MVP, scale with AI later |
| Pokeballs | Off-chain tracking | Simpler MVP, can tokenize later |

## 📋 Documents

1. **[DESIGN.md](./DESIGN.md)** - Complete game design, mechanics, and features
2. **[TECHNICAL_PLAN.md](./TECHNICAL_PLAN.md)** - Implementation details, code structure, step-by-step guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- A wallet with Base ETH + USDC
- WalletConnect Project ID

### Setup
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your WalletConnect ID and API keys

# Run development server
npm run dev
```

### First Implementation Steps

1. **Week 1: Infrastructure**
   ```bash
   # Create Next.js project
   npx create-next-app@latest swap-em-all --typescript --tailwind --app

   # Install core dependencies
   npm install phaser wagmi viem @rainbow-me/rainbowkit zustand @tanstack/react-query
   ```

2. **Week 2: Core Features**
   - Implement Phaser game loop
   - Add wallet connection
   - Integrate Uniswap Trading API
   - Build encounter system

3. **Week 3: Assets & Polish**
   - Generate token sprites with AI
   - Add animations
   - Polish UI/UX
   - Testing & deployment

## 🎮 Gameplay Loop

```
1. Connect Wallet
   ↓
2. Buy Pokeballs ($5 USDC each)
   ↓
3. Explore Map
   ↓
4. Encounter Random Token
   ↓
5. Catch Token (Swap USDC → Token)
   ↓
6. View in Cryptodex
   ↓
7. Sell to Trader (Swap Token → USDC)
   ↓
Repeat!
```

## 📦 Project Structure

```
swap-em-all/
├── app/                    # Next.js pages
│   ├── game/              # Main game page
│   └── api/               # API routes (tokens, swaps)
├── components/
│   ├── game/              # Game UI components
│   └── web3/              # Wallet components
├── game/                  # Phaser game code
│   ├── scenes/            # Game scenes
│   ├── entities/          # Player, NPCs, Tokens
│   └── systems/           # Encounter, Inventory, etc.
├── lib/
│   ├── web3/              # Web3 hooks & services
│   ├── game/              # Game state management
│   └── ai/                # AI sprite generation
└── public/
    └── assets/            # Sprites, tilesets, audio
```

## 🎨 Asset Generation

### Token Sprites
Use AI (DALL-E, Midjourney, or Stable Diffusion) with this prompt:

```
"A cute pixel art creature representing [TOKEN_NAME] cryptocurrency,
32x32 pixels, Game Boy Color style, limited 4-color palette,
front-facing view, simple design, colorful but retro"
```

**MVP**: Pre-generate 20-30 top tokens
**V2**: Dynamic generation on-demand

### Examples
- **ETH**: Ethereal blue dragon
- **BTC**: Golden coin creature with wings
- **USDC**: Blue circle character
- **PEPE**: Frog-based (obvious choice)

## 🔐 Smart Contract Strategy

**MVP Approach**: No custom contracts needed!
- Use simple USDC transfers for pokeballs
- Track purchases off-chain
- Use Uniswap directly for swaps

**V2**: Optional pokeball ERC-20 token for tradability

## 🌐 Deployment

### Vercel
```bash
# Connect repo to Vercel
vercel

# Add environment variables in Vercel dashboard:
# - NEXT_PUBLIC_WALLETCONNECT_ID
# - NEXT_PUBLIC_BASE_RPC_URL
# - OPENAI_API_KEY (for sprites)
```

### Domain
- Custom domain for professional look
- Consider: `swapemall.xyz` or `cryptomon.game`

## 🎯 MVP Success Criteria

Core features working:
- ✅ Wallet connection
- ✅ Buy pokeballs
- ✅ Walk around map
- ✅ Random encounters
- ✅ Catch tokens (execute swaps)
- ✅ View inventory
- ✅ Sell tokens

## 🚧 Future Features (V2+)

- **Trading**: P2P token trading between players
- **Battles**: Use token stats for PvP battles
- **Evolution**: Combine/stake tokens to evolve them
- **Achievements**: NFT badges
- **Leaderboards**: Most caught, highest value
- **Guilds**: Team-based gameplay
- **Mobile App**: React Native version

## 🎨 GameBoy Aesthetic

- **Resolution**: 160x144 pixels (scaled up 3-4x)
- **Colors**: GameBoy Color palette (limited colors)
- **Fonts**: Retro pixel fonts
- **Border**: GameBoy shell around game screen
- **Sound**: 8-bit music and effects (optional)

## 📊 Token Selection

Tokens are selected randomly based on **volume-weighted probability**:
- High volume tokens (ETH, BTC) appear more frequently
- Lower volume tokens are rarer
- Creates natural rarity tiers

## 💰 Economics

### Revenue Options
1. **Fee on swaps**: 0.5% on each transaction
2. **Premium items**: Master Balls, cosmetics
3. **Sponsored tokens**: Projects pay for featuring
4. **NFT badges**: Collectible achievements

### Free-to-Play Friendly
- Give 1 free pokeball on first visit
- Allow selling caught tokens to buy more pokeballs
- Create sustainable gameplay loop

## 🔧 Development Tips

### Testing Swaps
1. Start on Base testnet
2. Use small amounts
3. Test error cases:
   - Insufficient balance
   - Network errors
   - Transaction rejections

### Performance
- Optimize sprite loading with sprite sheets
- Cache token data (5 min cache)
- Lazy load Phaser only when game starts

### Mobile
- Virtual D-pad for touch controls
- Responsive scaling
- Test on various devices

## 📚 Resources

- [Phaser 3 Docs](https://photonstorm.github.io/phaser3-docs/)
- [wagmi Docs](https://wagmi.sh/)
- [Uniswap Trading API](https://docs.uniswap.org/)
- [Base Documentation](https://docs.base.org/)
- [RainbowKit Docs](https://www.rainbowkit.com/)

## 🤝 Contributing

This is a fun experimental project! Contributions welcome:
- Custom token sprites
- Additional game mechanics
- Bug fixes and improvements
- Documentation

## 📝 License

MIT

---

**Made with ❤️ and powered by Uniswap**

*Gotta swap 'em all!* 🎮💰
