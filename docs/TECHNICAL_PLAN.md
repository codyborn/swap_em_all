# Swap 'Em All - Technical Implementation Plan

## Quick Start Decision Matrix

### Game Engine: Phaser 3 ✅
**Why**: Mature, excellent docs, built-in tilemap/sprite/animation support
**Fallback**: Custom Canvas if bundle size is an issue

### Blockchain: Base ✅
**Why**: Low fees ($0.01-0.05), fast, official Uniswap support
**Alternative**: Optimism, Arbitrum

### Wallet UI: RainbowKit ✅
**Why**: Beautiful UI, maintained by Rainbow, great UX

### Image Generation: Hybrid Approach ✅
**MVP**: Pre-generated sprites (20-30 tokens)
**V2**: Dynamic generation with Replicate/OpenAI

## Project Structure

```
swap-em-all/
├── app/
│   ├── layout.tsx                 # Root layout with Web3Provider
│   ├── page.tsx                   # Landing page with Connect Wallet
│   ├── game/
│   │   └── page.tsx              # Main game page
│   └── api/
│       ├── tokens/
│       │   └── route.ts          # Fetch top tokens by volume
│       ├── swap/
│       │   └── quote/route.ts    # Get swap quotes
│       └── sprites/
│           └── generate/route.ts # AI sprite generation
├── components/
│   ├── game/
│   │   ├── GameContainer.tsx     # React wrapper for Phaser
│   │   ├── GameBoyShell.tsx      # GameBoy aesthetic border
│   │   ├── HUD.tsx               # Display wallet info, pokeballs
│   │   └── TransactionModal.tsx  # Transaction status overlay
│   └── web3/
│       ├── WalletConnect.tsx     # Wallet connection button
│       └── NetworkCheck.tsx      # Ensure user on Base
├── game/
│   ├── main.ts                   # Phaser game initialization
│   ├── config.ts                 # Phaser configuration
│   ├── scenes/
│   │   ├── BootScene.ts         # GameBoy boot animation
│   │   ├── PreloadScene.ts      # Load assets
│   │   ├── TitleScene.ts        # Title screen
│   │   ├── OverworldScene.ts    # Main gameplay
│   │   ├── EncounterScene.ts    # Token encounter/battle
│   │   ├── ShopScene.ts         # Store UI
│   │   └── TraderScene.ts       # Trader UI
│   ├── entities/
│   │   ├── Player.ts            # Player character
│   │   ├── NPC.ts               # NPCs
│   │   └── TokenEntity.ts       # Wild tokens
│   ├── systems/
│   │   ├── EncounterSystem.ts   # Random encounter logic
│   │   ├── DialogueSystem.ts    # NPC conversations
│   │   └── InventorySystem.ts   # Item management
│   └── utils/
│       ├── animations.ts        # Animation helpers
│       └── tilemap.ts           # Map helpers
├── lib/
│   ├── web3/
│   │   ├── config.ts            # wagmi/viem config
│   │   ├── hooks/
│   │   │   ├── useSwap.ts       # Swap execution hook
│   │   │   ├── useTokens.ts     # Token data hook
│   │   │   └── usePokeballs.ts  # Pokeball management
│   │   └── services/
│   │       ├── uniswap.ts       # Uniswap Trading API
│   │       ├── tokens.ts        # Token metadata service
│   │       └── pricing.ts       # Price feeds
│   ├── game/
│   │   ├── state.ts             # Global game state (Zustand)
│   │   └── types.ts             # Game type definitions
│   └── ai/
│       ├── sprites.ts           # AI sprite generation
│       └── cache.ts             # Sprite caching
├── public/
│   ├── assets/
│   │   ├── sprites/
│   │   │   ├── player/         # Player animations
│   │   │   ├── npcs/           # NPC sprites
│   │   │   └── tokens/         # Token creature sprites
│   │   ├── tilesets/
│   │   │   └── overworld.png   # Main tileset
│   │   ├── ui/
│   │   │   ├── dialogue-box.png
│   │   │   ├── menu.png
│   │   │   └── gameboy-shell.png
│   │   └── audio/              # Sound effects (optional)
│   └── maps/
│       └── town.json           # Tiled map JSON
├── styles/
│   └── gameboy.css             # GameBoy-themed styles
└── prisma/                     # Optional: For storing user data
    └── schema.prisma
```

## Implementation Steps

### Step 1: Project Setup
```bash
# Initialize Next.js with TypeScript
npx create-next-app@latest swap-em-all --typescript --tailwind --app

# Install dependencies
cd swap-em-all
npm install phaser@3.70.0
npm install wagmi viem @rainbow-me/rainbowkit
npm install zustand
npm install @tanstack/react-query

# Dev dependencies
npm install -D @types/phaser
```

### Step 2: Configure Web3 (wagmi + RainbowKit)

**lib/web3/config.ts**
```typescript
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Swap Em All',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID!,
  chains: [base],
});

export const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // Base USDC
export const POKEBALL_PRICE = 5_000000; // $5 USDC (6 decimals)
```

**app/layout.tsx**
```typescript
import '@rainbow-me/rainbowkit/styles.css';
import { Providers } from './providers';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

**app/providers.tsx**
```typescript
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { config } from '@/lib/web3/config';

const queryClient = new QueryClient();

export function Providers({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

### Step 3: Game State Management (Zustand)

**lib/game/state.ts**
```typescript
import { create } from 'zustand';

export interface CaughtToken {
  address: string;
  symbol: string;
  name: string;
  amount: bigint;
  sprite: string;
  caughtAt: number;
}

interface GameState {
  // Player state
  pokeballCount: number;
  caughtTokens: CaughtToken[];

  // Game progress
  visitedAreas: string[];
  cryptodex: string[]; // Addresses of discovered tokens

  // UI state
  isInEncounter: boolean;
  currentEncounterToken: string | null;

  // Actions
  setPokeballs: (count: number) => void;
  usePokeball: () => void;
  addCaughtToken: (token: CaughtToken) => void;
  removeCaughtToken: (address: string, amount: bigint) => void;
  discoverToken: (address: string) => void;
  setEncounter: (tokenAddress: string | null) => void;
}

export const useGameState = create<GameState>((set) => ({
  pokeballCount: 0,
  caughtTokens: [],
  visitedAreas: [],
  cryptodex: [],
  isInEncounter: false,
  currentEncounterToken: null,

  setPokeballs: (count) => set({ pokeballCount: count }),
  usePokeball: () => set((state) => ({
    pokeballCount: Math.max(0, state.pokeballCount - 1)
  })),
  addCaughtToken: (token) => set((state) => ({
    caughtTokens: [...state.caughtTokens, token],
    cryptodex: [...new Set([...state.cryptodex, token.address])],
  })),
  removeCaughtToken: (address, amount) => set((state) => ({
    caughtTokens: state.caughtTokens.map(t =>
      t.address === address
        ? { ...t, amount: t.amount - amount }
        : t
    ).filter(t => t.amount > 0n),
  })),
  discoverToken: (address) => set((state) => ({
    cryptodex: [...new Set([...state.cryptodex, address])],
  })),
  setEncounter: (tokenAddress) => set({
    isInEncounter: !!tokenAddress,
    currentEncounterToken: tokenAddress,
  }),
}));
```

### Step 4: Token Data Service

**lib/web3/services/tokens.ts**
```typescript
import { base } from 'viem/chains';

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  volume24h: number;
  priceUSD: number;
}

// Cache for token data
let tokenCache: Token[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getTopTokens(limit = 50): Promise<Token[]> {
  // Check cache
  if (tokenCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return tokenCache.slice(0, limit);
  }

  // Fetch from API (CoinGecko, Uniswap Subgraph, or custom)
  const response = await fetch('/api/tokens');
  const tokens = await response.json();

  // Update cache
  tokenCache = tokens;
  cacheTimestamp = Date.now();

  return tokens.slice(0, limit);
}

export function selectRandomToken(tokens: Token[]): Token {
  // Weighted selection based on volume
  const totalVolume = tokens.reduce((sum, t) => sum + t.volume24h, 0);
  let random = Math.random() * totalVolume;

  for (const token of tokens) {
    random -= token.volume24h;
    if (random <= 0) return token;
  }

  return tokens[0]; // Fallback
}

export function getRarityTier(volume: number): string {
  if (volume > 1_000_000_000) return 'legendary';
  if (volume > 100_000_000) return 'epic';
  if (volume > 10_000_000) return 'rare';
  if (volume > 1_000_000) return 'uncommon';
  return 'common';
}
```

**app/api/tokens/route.ts**
```typescript
import { NextResponse } from 'next/server';

// This would call CoinGecko, Uniswap Subgraph, or similar
export async function GET() {
  try {
    // Example: Fetch from CoinGecko API or Uniswap Subgraph
    // For MVP, can use hardcoded list of top tokens
    const topTokens = [
      {
        address: '0x4200000000000000000000000000000000000006', // WETH on Base
        symbol: 'ETH',
        name: 'Ethereum',
        decimals: 18,
        volume24h: 10_000_000_000,
        priceUSD: 3000,
      },
      // Add more tokens...
    ];

    return NextResponse.json(topTokens);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tokens' }, { status: 500 });
  }
}
```

### Step 5: Uniswap Integration

**lib/web3/hooks/useSwap.ts**
```typescript
import { useAccount, useWalletClient } from 'wagmi';
import { useState } from 'react';
import { executeSwap } from '../services/uniswap';

export function useSwap() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const swap = async (
    inputToken: string,
    outputToken: string,
    amountIn: bigint
  ) => {
    if (!address || !walletClient) {
      throw new Error('Wallet not connected');
    }

    setIsPending(true);
    setError(null);

    try {
      const result = await executeSwap({
        walletClient,
        address,
        inputToken,
        outputToken,
        amountIn,
      });

      return result;
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setIsPending(false);
    }
  };

  return { swap, isPending, error };
}
```

**lib/web3/services/uniswap.ts**
```typescript
import { type WalletClient } from 'viem';

export interface SwapParams {
  walletClient: WalletClient;
  address: string;
  inputToken: string;
  outputToken: string;
  amountIn: bigint;
  slippage?: number;
}

export async function executeSwap({
  walletClient,
  address,
  inputToken,
  outputToken,
  amountIn,
  slippage = 0.5,
}: SwapParams) {
  // 1. Get quote from Uniswap Trading API
  const quote = await fetch('/api/swap/quote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      inputToken,
      outputToken,
      amountIn: amountIn.toString(),
      slippage,
    }),
  }).then(r => r.json());

  // 2. Check approval
  if (quote.approval) {
    const approvalHash = await walletClient.sendTransaction({
      to: quote.approval.to,
      data: quote.approval.data,
    });

    // Wait for approval
    await waitForTransaction(approvalHash);
  }

  // 3. Execute swap
  const swapHash = await walletClient.sendTransaction({
    to: quote.swap.to,
    data: quote.swap.data,
    value: quote.swap.value,
  });

  // 4. Wait for confirmation
  const receipt = await waitForTransaction(swapHash);

  return {
    hash: swapHash,
    outputAmount: quote.outputAmount,
  };
}

async function waitForTransaction(hash: string) {
  // Implementation using viem's waitForTransactionReceipt
  // ...
}
```

### Step 6: Phaser Game Setup

**game/config.ts**
```typescript
import Phaser from 'phaser';

export const GAME_CONFIG: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 160,
  height: 144,
  zoom: 3, // Scale up for modern displays
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0, x: 0 },
      debug: false,
    },
  },
  backgroundColor: '#9bbc0f', // GameBoy green
};
```

**game/main.ts**
```typescript
import Phaser from 'phaser';
import { GAME_CONFIG } from './config';
import { BootScene } from './scenes/BootScene';
import { OverworldScene } from './scenes/OverworldScene';
import { EncounterScene } from './scenes/EncounterScene';

export function createGame(container: HTMLElement): Phaser.Game {
  const config = {
    ...GAME_CONFIG,
    parent: container,
    scene: [BootScene, OverworldScene, EncounterScene],
  };

  return new Phaser.Game(config);
}
```

**game/scenes/OverworldScene.ts**
```typescript
import Phaser from 'phaser';

export class OverworldScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private stepsSinceEncounter = 0;

  constructor() {
    super({ key: 'Overworld' });
  }

  create() {
    // Load tilemap
    const map = this.make.tilemap({ key: 'town' });
    const tileset = map.addTilesetImage('overworld', 'tiles');

    // Create layers
    map.createLayer('Ground', tileset);
    const obstacles = map.createLayer('Obstacles', tileset);
    obstacles.setCollisionByProperty({ collides: true });

    // Create player
    this.player = this.physics.add.sprite(80, 80, 'player');
    this.player.setCollideWorldBounds(true);

    // Collisions
    this.physics.add.collider(this.player, obstacles);

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();

    // Create NPCs
    this.createNPCs();
  }

  update() {
    // Player movement
    const speed = 50;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
      this.player.anims.play('walk-left', true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
      this.player.anims.play('walk-right', true);
    } else if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
      this.player.anims.play('walk-up', true);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
      this.player.anims.play('walk-down', true);
    } else {
      this.player.setVelocity(0);
      this.player.anims.stop();
    }

    // Check for random encounters in grass
    if (this.isInGrass() && this.player.body.speed > 0) {
      this.stepsSinceEncounter++;

      // ~10% chance per step
      if (this.stepsSinceEncounter > 10 && Math.random() < 0.1) {
        this.triggerEncounter();
      }
    }
  }

  private isInGrass(): boolean {
    // Check if player is in grass tile
    // Implementation depends on tilemap setup
    return true; // Placeholder
  }

  private triggerEncounter() {
    this.stepsSinceEncounter = 0;

    // Emit event to React layer to select token
    window.dispatchEvent(new CustomEvent('encounter-triggered'));

    // Transition to encounter scene
    this.scene.pause();
    this.scene.launch('Encounter');
  }

  private createNPCs() {
    // Create store NPC
    const storeNPC = this.add.sprite(50, 40, 'npc-store');

    // Add interaction
    this.physics.add.overlap(this.player, storeNPC, () => {
      if (this.cursors.space.isDown) {
        window.dispatchEvent(new CustomEvent('npc-interact', {
          detail: { npc: 'store' }
        }));
      }
    });

    // Similar for trader NPC
  }
}
```

### Step 7: React-Phaser Integration

**components/game/GameContainer.tsx**
```typescript
'use client';
import { useEffect, useRef, useState } from 'react';
import { createGame } from '@/game/main';
import { useGameState } from '@/lib/game/state';
import { useSwap } from '@/lib/web3/hooks/useSwap';
import { TransactionModal } from './TransactionModal';

export function GameContainer() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { setEncounter } = useGameState();
  const { swap } = useSwap();
  const [showTxModal, setShowTxModal] = useState(false);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    // Initialize game
    gameRef.current = createGame(containerRef.current);

    // Listen for game events
    const handleEncounter = async (e: Event) => {
      const token = await selectRandomEncounterToken();
      setEncounter(token.address);
    };

    const handleNPCInteract = (e: CustomEvent) => {
      if (e.detail.npc === 'store') {
        // Show store UI
      }
    };

    window.addEventListener('encounter-triggered', handleEncounter);
    window.addEventListener('npc-interact', handleNPCInteract as EventListener);

    return () => {
      window.removeEventListener('encounter-triggered', handleEncounter);
      window.removeEventListener('npc-interact', handleNPCInteract as EventListener);
      gameRef.current?.destroy(true);
    };
  }, []);

  return (
    <div className="relative">
      <div ref={containerRef} id="game-container" />
      {showTxModal && <TransactionModal />}
    </div>
  );
}
```

### Step 8: Asset Generation Strategy

**For MVP: Pre-generate sprites**

1. Create prompt template:
```
"A cute pixel art creature representing [TOKEN_NAME] cryptocurrency,
32x32 pixels, Game Boy Color style, limited 4-color palette,
front-facing view, simple design, colorful but retro"
```

2. Generate sprites for top 20 tokens:
   - ETH: Ethereal blue dragon
   - BTC: Golden coin creature with wings
   - USDC: Blue circle character
   - USDT: Green dollar creature
   - etc.

3. Save to `public/assets/sprites/tokens/[symbol].png`

4. Create mapping file:
```typescript
// lib/game/tokenSprites.ts
export const TOKEN_SPRITES: Record<string, string> = {
  '0x4200000000000000000000000000000000000006': 'eth',
  '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913': 'usdc',
  // ...
};
```

## Deployment Checklist

### Environment Variables
```env
NEXT_PUBLIC_WALLETCONNECT_ID=your_project_id
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
OPENAI_API_KEY=your_key (for AI generation)
```

### Vercel Configuration
1. Connect GitHub repository
2. Set environment variables
3. Configure build settings:
   - Framework: Next.js
   - Build command: `npm run build`
   - Output directory: `.next`

### Pre-launch Testing
- [ ] Test wallet connection on multiple wallets
- [ ] Test USDC approval flow
- [ ] Test swap execution (small amounts on testnet first)
- [ ] Test error handling (insufficient balance, network errors)
- [ ] Mobile responsiveness
- [ ] Performance on low-end devices

## Success Criteria for MVP

### Core Features Working
- ✅ Connect wallet (RainbowKit)
- ✅ Display USDC balance
- ✅ Buy pokeballs (USDC transfer)
- ✅ Walk around map
- ✅ Random encounters trigger
- ✅ Catch token (execute swap)
- ✅ View inventory
- ✅ Sell tokens (swap back to USDC)

### Polish
- ✅ GameBoy aesthetic looks good
- ✅ Smooth animations
- ✅ Clear transaction feedback
- ✅ Error handling works
- ✅ Mobile-friendly

## Timeline Estimate

**Week 1**: Infrastructure
- Day 1-2: Next.js + Web3 setup
- Day 3-4: Phaser integration
- Day 5-7: Basic game loop + player movement

**Week 2**: Core Features
- Day 8-9: Encounter system
- Day 10-11: Uniswap integration
- Day 12-14: Store & Trader NPCs

**Week 3**: Assets & Polish
- Day 15-17: Generate sprites
- Day 18-19: Polish UI/UX
- Day 20-21: Testing & bug fixes

**Total: ~3 weeks for MVP**

## Next Steps

1. **Set up project**: `create-next-app` with dependencies
2. **Test Web3 connection**: Ensure wagmi + RainbowKit works
3. **Proof of concept**: Simple Phaser scene with player movement
4. **Test swap**: Execute a test swap on Base testnet
5. **Generate initial sprites**: Create 5-10 token sprites with AI
6. **Build core loop**: Connect all pieces together
7. **Deploy & test**: Get feedback from real users
