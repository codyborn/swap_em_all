# Quick Start Guide

## Running the Game

1. **Start the development server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Open your browser** to http://localhost:3000

3. **Connect your wallet**:
   - Click "Connect Wallet" button
   - Choose MetaMask, Coinbase Wallet, or WalletConnect
   - Make sure you're on Base or Base Sepolia network

4. **Start the game**:
   - Click "START GAME" button on the home page
   - You'll see the GameBoy boot animation

## Game Controls

### Title Screen
- Press **ENTER**, **SPACE**, or **CLICK** to start

### Overworld
- **Arrow Keys**: Move your character
- **E**: Force trigger an encounter (debug)
- Walk around to trigger random encounters (10% chance every 30 steps)

### Encounter Screen
- **C**: Attempt to catch the token
- **R** or **ESC**: Run away from encounter

## Current Features

✅ **Implemented**:
- Wallet connection with RainbowKit
- GameBoy-style UI with authentic colors
- Phaser game engine integration
- Four game scenes (Boot, Title, Overworld, Encounter)
- Player movement in overworld
- Random encounter system
- Basic catch/run mechanics
- HUD showing USDC balance and pokeballs
- Game state persistence with Zustand

⏳ **Coming Soon**:
- Real token sprites (currently placeholders)
- Web3 integration for actual token swaps
- NPC interactions (Store, Trader, Professor)
- Cryptodex (collection tracker)
- Sound effects and music
- More maps and areas

## Testing the Game

### Test Wallet Connection
1. Connect your wallet
2. Check that your USDC balance appears in the HUD
3. Use the "+5 Pokeballs (Test)" button to add pokeballs

### Test Game Flow
1. Start the game
2. Press ENTER on the title screen
3. Use arrow keys to move around
4. Wait for a random encounter or press E
5. Try catching or running from tokens

### Test State Persistence
1. Add some pokeballs
2. Refresh the page
3. Pokeball count should persist

## Development Notes

### Environment Variables
Create a `.env.local` file (see `.env.local.example`):
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

Get your WalletConnect Project ID from: https://cloud.walletconnect.com/

### Debugging
- Open browser console to see Phaser debug messages
- Press **E** in the overworld to trigger encounters on demand
- Check the HUD to monitor USDC balance and pokeballs

### Code Structure
```
app/
  ├── page.tsx          # Home page with wallet connection
  └── game/
      └── page.tsx      # Game page with Phaser

game/
  ├── config.ts         # Phaser configuration
  └── scenes/
      ├── BootScene.ts      # Boot animation
      ├── TitleScene.ts     # Start screen
      ├── OverworldScene.ts # Main gameplay
      └── EncounterScene.ts # Token encounters

components/
  ├── game/
  │   ├── GameBoyShell.tsx  # GameBoy UI wrapper
  │   └── PhaserGame.tsx    # Phaser React component
  ├── ui/
  │   └── HUD.tsx           # Heads-up display
  └── wallet/
      └── Providers.tsx     # Web3 providers

lib/
  ├── web3/           # Web3 config and chains
  ├── hooks/          # Custom React hooks
  ├── store/          # Zustand state management
  └── types/          # TypeScript types
```

## Next Steps for Development

1. **Token Assets**: Generate sprite images for 20-30 tokens
2. **API Integration**: Create endpoints for fetching token data
3. **Swap Execution**: Integrate Uniswap Trading API
4. **Additional Scenes**: Build Store, Trader, and Cryptodex scenes
5. **Testing**: Write E2E tests with Playwright
