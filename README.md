# 🎮 Swap 'Em All

A Pokemon-inspired Web3 game where you catch and trade crypto tokens on Base. Built with Next.js, Phaser, and the Uniswap SDK.

![Game Preview](https://img.shields.io/badge/Status-Playable-brightgreen) ![Next.js](https://img.shields.io/badge/Next.js-16-black) ![Phaser](https://img.shields.io/badge/Phaser-3.90-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)

## ✨ Features

### 🎯 Core Gameplay
- **Catch Crypto Tokens**: Encounter wild tokens and catch them with pokeballs
- **Battle System**: Turn-based battles with type advantages and move sets
- **Level Up**: Tokens gain experience and level up from battles
- **Gym Leaders**: Challenge 8 gym leaders and earn badges
- **Token Trading**: Sell tokens for USDC at the Token Trader

### 🎨 Visual Polish
- **Pixel Art Sprites**: Animated player character with 4-directional walking
- **Token Sprites**: 9 token types with unique animated sprites
- **NPC Sprites**: 5 distinct NPCs (Professor, Clerk, Trader, Nurse, Gym Leader)
- **Game Boy Aesthetic**: Retro green monochrome design with nostalgic feel

### 🎪 Game Scenes
- **Overworld**: Explore and interact with NPCs
- **Wild Encounters**: Random token encounters while exploring
- **Battle Arena**: Strategic turn-based combat
- **Cryptodex**: View your caught tokens with detailed stats
- **Pokeball Store**: Buy pokeballs with USDC
- **Token Trader**: Sell tokens for USDC
- **Healing Center**: Restore your tokens to full health

### 🪙 Token Types
- **DeFi** (Blue): UNI, AAVE, CRV - Strong against Exchange
- **Layer 1** (Gold): ETH, BTC, SOL - Strong against DeFi
- **Layer 2** (Purple): MATIC, ARB, OP - Strong against Layer 1
- **Stablecoin** (Green): USDC, USDT, DAI - Defensive type
- **Meme** (Pink): DOGE, SHIB, PEPE - Unpredictable
- **Exchange** (Orange): BNB, FTT, CRO - Strong against Governance
- **Governance** (Royal Blue): MKR, COMP, YFI - Strong against DeFi
- **Wrapped** (Brown): WETH, WBTC - Versatile type
- **Unknown** (Gray): New and unclassified tokens

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- WalletConnect Project ID (optional for Web3 features)

### Installation

```bash
# Clone the repository
git clone https://github.com/codyborn/swap_em_all.git
cd swap_em_all

# Install dependencies
npm install

# Set up environment variables (optional)
cp .env.example .env.local
# Add your WalletConnect Project ID to .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000/game](http://localhost:3000/game) to start playing!

## 🎮 How to Play

### Controls
- **Arrow Keys**: Move player in overworld
- **E**: Force encounter (testing)
- **SPACE**: Interact with NPCs
- **C**: Open Cryptodex
- **B**: Open Bag
- **ESC**: Close menus / Exit battles

### Gameplay Loop
1. **Start**: Talk to Professor Oak to learn the basics
2. **Buy Pokeballs**: Visit the Store Clerk to purchase pokeballs with USDC
3. **Catch Tokens**: Explore to trigger wild encounters and catch tokens
4. **Battle**: Challenge Gym Leaders with your caught tokens
5. **Level Up**: Gain experience from battles to level up your tokens
6. **Trade**: Sell tokens at the Token Trader for USDC
7. **Heal**: Visit the Healing Center to restore token health

### Pro Tips
- Type advantages matter! Use the right token type against gym leaders
- Level up your tokens before challenging tough gyms
- Keep pokeballs stocked - you can't catch without them
- Check the Cryptodex to view token stats and moves

## 🛠️ Tech Stack

### Frontend
- **Next.js 16**: React framework with Turbopack
- **Phaser 3.90**: HTML5 game engine for 2D games
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework

### Web3
- **wagmi**: React hooks for Ethereum
- **viem**: TypeScript Ethereum library
- **Uniswap SDK**: Token swapping and pricing
- **Base**: Layer 2 blockchain (Ethereum)

### State Management
- **Zustand**: Lightweight state management
- **localStorage**: Persistent game saves

### Game Systems
- **Sprite Generation**: Programmatic pixel art creation
- **Battle System**: Turn-based combat with damage calculation
- **Leveling System**: Experience curves and stat scaling
- **Price Tracking**: Real-time token prices from Uniswap

## 📁 Project Structure

```
swap_em_all/
├── app/                    # Next.js app directory
│   ├── api/               # API routes (tokens, prices, swap)
│   ├── game/              # Game page
│   └── page.tsx           # Landing page
├── game/                   # Phaser game code
│   ├── scenes/            # Game scenes (Overworld, Battle, etc.)
│   ├── systems/           # Game systems (BattleManager, etc.)
│   ├── entities/          # Game entities (NPC, etc.)
│   └── utils/             # Utilities (SpriteGenerator, etc.)
├── lib/                    # Shared utilities
│   ├── store/             # Zustand state management
│   ├── types/             # TypeScript types
│   ├── utils/             # Game utilities
│   └── web3/              # Web3 configuration
├── components/             # React components
│   ├── game/              # Game UI components
│   ├── ui/                # Shared UI components
│   └── wallet/            # Web3 wallet components
└── public/                 # Static assets
```

## 🎯 Game Mechanics

### Battle System
- Turn-based combat with move selection
- Type advantages (2x damage multiplier)
- Accuracy checks and miss chances
- Health management with healing items
- Experience gain from victories

### Leveling System
- Tokens gain XP from battles
- Level cap: 100
- Stats increase with levels (ATK, DEF, SPD, HP)
- New moves unlocked at certain levels

### Token Catching
- Random encounters while exploring
- Catch rate based on token rarity
- Common (90%), Uncommon (70%), Rare (50%), Legendary (30%)
- Requires pokeballs from the store

### Economy
- Start with 1000 USDC
- Pokeballs cost 100 USDC each
- Tokens can be sold for current market price
- Prices update in real-time from Uniswap

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)**: Quick setup guide
- **[GAME_GUIDE.md](GAME_GUIDE.md)**: Complete gameplay guide
- **[GAME_MECHANICS_V2.md](GAME_MECHANICS_V2.md)**: Detailed mechanics documentation
- **[TECHNICAL_PLAN_V2.md](TECHNICAL_PLAN_V2.md)**: Technical architecture
- **[SPRITES_IMPLEMENTATION.md](SPRITES_IMPLEMENTATION.md)**: Sprite system details

## 🎨 Sprite System

All game sprites are generated programmatically using HTML5 Canvas:
- **Player**: 16 frames (4 directions × 4 frames)
- **NPCs**: 5 static sprites
- **Tokens**: 18 sprites (9 types × 2 variants)
- **Total**: 32 sprites with 29 animations
- **Size**: <100KB total memory footprint

## 🚧 Development Status

### ✅ Completed (Phases 1-4)
- Core game loop with token types
- Pokeball Store & Token Trader
- Battle System with type advantages
- Enhanced Cryptodex with detailed stats
- Visual sprites for all characters
- Animated tokens in all scenes

### 🔮 Future Enhancements
- Actual blockchain integration (currently simulated)
- Real USDC transactions via Uniswap
- Multiplayer battles
- Token staking mechanics
- Achievement system
- More gym leaders and regions

## 🧪 Testing

```bash
# Run build to check for errors
npm run build

# Type checking
npx tsc --noEmit

# Start development server
npm run dev
```

## 📝 License

MIT License - feel free to use this code for your own projects!

## 🙏 Credits

- **Game Engine**: [Phaser 3](https://phaser.io/)
- **Web3**: [Uniswap SDK](https://docs.uniswap.org/)
- **Blockchain**: [Base](https://base.org/)
- **Inspiration**: Pokemon (Game Freak/Nintendo)

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📧 Contact

Created by [@codyborn](https://github.com/codyborn)

---

**Built with ❤️ and Claude Sonnet 4.5**
