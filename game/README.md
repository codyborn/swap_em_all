# Game Documentation

## Game Scenes

### 1. BootScene
The initial loading screen with a GameBoy-style boot animation.
- Shows "SWAP EM ALL" logo with fade-in effect
- Automatically transitions to TitleScene after loading

### 2. TitleScene
The main menu/start screen.
- Displays game title and subtitle
- Press **ENTER**, **SPACE**, or **CLICK** to start
- Animated "PRESS START" text

### 3. OverworldScene
The main gameplay area where players explore and encounter tokens.

**Controls:**
- **Arrow Keys**: Move your character
- **E**: Trigger encounter (debug mode)

**Mechanics:**
- Walk around the overworld to trigger random encounters
- Every 30 steps, there's a 10% chance of an encounter
- Camera follows the player

### 4. EncounterScene
Battle/catch screen when encountering a wild token.

**Controls:**
- **C**: Attempt to catch the token
- **R** or **ESC**: Run away from encounter

**Mechanics:**
- Currently uses demo tokens (ETH by default)
- 70% catch success rate (placeholder)
- Will integrate with Web3 for real swaps

## Game Configuration

Located in `/game/config.ts`:
- Resolution: 160x144 (GameBoy Color native resolution)
- Scale: 4x for modern displays
- Pixel art rendering enabled
- Arcade physics system

## Future Enhancements

1. **Assets**
   - Add token creature sprites
   - Player character sprites with animations
   - NPC sprites
   - Tile-based maps

2. **Web3 Integration**
   - Connect EncounterScene to Uniswap swaps
   - Real token data from API
   - Transaction signing and confirmation

3. **Additional Scenes**
   - Store (buy pokeballs)
   - Trader (sell tokens)
   - Cryptodex (view collection)
   - Menu system

4. **Audio**
   - Background music
   - Sound effects for actions
   - GameBoy-style chiptune
