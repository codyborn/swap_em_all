# Sprite Frame Labeling Guide

**Purpose**: Help identify the correct frame numbers for player and NPC sprites from the Pokemon FireRed/LeafGreen sprite sheets.

---

## How This Works

The sprite sheets are loaded as grids of 16x16 pixel frames. Phaser reads them **left-to-right, top-to-bottom**, starting at frame 0.

### Example Layout:
```
Frame 0  | Frame 1  | Frame 2  | Frame 3  | Frame 4  ...
Frame 5  | Frame 6  | Frame 7  | Frame 8  | Frame 9  ...
Frame 10 | Frame 11 | Frame 12 | Frame 13 | Frame 14 ...
```

---

## 1. Player Sprite Classification

### Current Implementation (INCORRECT)
```typescript
// BootScene.ts - Current animation frames
'player-down':  Frames 0-3   (walking down)
'player-up':    Frames 4-7   (walking up)
'player-left':  Frames 8-11  (walking left)
'player-right': Frames 12-15 (walking right)
'player-idle':  Frame 0      (standing still)
```

### What We Need

**File**: `public/assets/sprites/player/player-sprites.png`
- **Dimensions**: 673x638 pixels
- **Frame Size**: 16x16 pixels
- **Grid Calculation**: 673÷16 = ~42 frames per row

**Looking for**: Red (male protagonist) walking animations

#### Player Animation Requirements

**Walking Down** (4 frames):
- Frame showing character facing camera
- Should have 4 frames showing walk cycle
- Legs alternating, arms swinging

**Current frames**: 0-3
**Correct frames**: ___ to ___

---

**Walking Up** (4 frames):
- Frame showing character facing away (back view)
- Should have 4 frames showing walk cycle
- Back of head visible

**Current frames**: 4-7
**Correct frames**: ___ to ___

---

**Walking Left** (4 frames):
- Frame showing character facing left
- Should have 4 frames showing walk cycle
- Profile view facing left

**Current frames**: 8-11
**Correct frames**: ___ to ___

---

**Walking Right** (4 frames):
- Frame showing character facing right
- Should have 4 frames showing walk cycle
- Profile view facing right

**Current frames**: 12-15
**Correct frames**: ___ to ___

---

**Idle/Standing Still**:
- Single frame of character standing (usually first frame of down animation)

**Current frame**: 0
**Correct frame**: ___

---

## 2. NPC Sprite Classification

### Current Implementation (INCORRECT)
```typescript
// NPC.ts - Current frame assignments
professor:   Frame 3    (Professor Oak style)
clerk:       Frame 25   (Store clerk/merchant)
trader:      Frame 45   (Token trader)
nurse:       Frame 20   (Nurse Joy style)
gym_leader:  Frame 60   (Gym leader/trainer)
```

### What We Need

**File**: `public/assets/sprites/npcs/overworld-npcs.png`
- **Dimensions**: 238x2967 pixels
- **Frame Size**: 16x16 pixels
- **Grid Calculation**: 238÷16 = ~14 frames per row, 2967÷16 = ~185 rows
- **Total frames**: ~2590 frames (huge sheet!)

**Looking for**: Static (front-facing) NPC sprites that match these archetypes:

---

### Professor (Professor Oak archetype)
**Description**:
- Older man with lab coat
- Scholarly appearance
- White or gray hair
- Friendly/mentor look

**Current frame**: 3
**Correct frame**: ___

**Notes**: _______________________________________________

---

### Store Clerk (PokeMart clerk)
**Description**:
- Store employee uniform
- Young adult
- Behind counter appearance
- Welcoming/service look

**Current frame**: 25
**Correct frame**: ___

**Notes**: _______________________________________________

---

### Token Trader (Generic trader/businessman)
**Description**:
- Business attire or trader clothes
- Could be a businessman or merchant
- Not a standard Pokemon Center/Mart employee
- Entrepreneurial look

**Current frame**: 45
**Correct frame**: ___

**Notes**: _______________________________________________

---

### Nurse (Nurse Joy archetype)
**Description**:
- Nurse uniform (pink/white)
- Medical cross or healthcare symbol
- Healing center employee
- Caring/medical professional look

**Current frame**: 20
**Correct frame**: ___

**Notes**: _______________________________________________

---

### Gym Leader (Trainer/Leader archetype)
**Description**:
- Athletic or tough appearance
- Trainer outfit
- Confident stance
- Competitive/strong look

**Current frame**: 60
**Correct frame**: ___

**Notes**: _______________________________________________

---

## 3. How to Identify Frame Numbers

### Method 1: Visual Inspection
1. Open the sprite sheet in an image viewer
2. Count frames left-to-right, top-to-bottom starting at 0
3. Each 16x16 square is one frame
4. Note the frame number when you find the right sprite

### Method 2: Image Editor (Recommended)
1. Open sprite sheet in Photoshop/GIMP/Aseprite
2. Create a 16x16 grid overlay
3. Number the grid cells starting from 0
4. Identify sprites and record frame numbers

### Method 3: Online Tool
1. Upload sprite sheet to https://www.spriters-resource.com/
2. View the sheet with grid overlay
3. Count frames to identify numbers

### Method 4: Quick Calculation
For a sprite at position (column, row):
```
frame_number = (row × frames_per_row) + column
```

Example:
- Sprite at column 5, row 2
- Frames per row = 42
- Frame number = (2 × 42) + 5 = 89

---

## 4. What I Need From You

### Format for Player Sprites
```markdown
## PLAYER SPRITE FRAMES

Walking Down:
- Start frame: ___
- End frame: ___
- Total frames: 4

Walking Up:
- Start frame: ___
- End frame: ___
- Total frames: 4

Walking Left:
- Start frame: ___
- End frame: ___
- Total frames: 4

Walking Right:
- Start frame: ___
- End frame: ___
- Total frames: 4

Idle:
- Frame: ___
```

### Format for NPC Sprites
```markdown
## NPC SPRITE FRAMES

Professor: Frame ___
Store Clerk: Frame ___
Token Trader: Frame ___
Nurse: Frame ___
Gym Leader: Frame ___
```

---

## 5. Additional Information

### Player Sprite Sheet Layout
The player sprite sheet typically contains:
- Red (male) - First character
- Leaf (female) - Second character
- Each has: Down, Up, Left, Right, Cycling, Fishing, etc.

**We only need Red's walking animations (first character).**

### NPC Sprite Sheet Layout
The NPC sheet contains hundreds of characters:
- Trainers of all types
- Gym Leaders
- Elite Four
- NPCs (clerks, nurses, professors)
- Random townspeople

**We need 5 specific archetypes that match our game's NPCs.**

---

## 6. Testing After Update

Once you provide the frame numbers, I'll update:
1. `game/scenes/BootScene.ts` - Player animation frames
2. `game/entities/NPC.ts` - NPC frame mappings
3. Test in game to verify sprites display correctly

---

## 7. Quick Reference Images

### Player Sprite Examples (What to Look For)

**Walking Down** - Character facing camera, 4-frame walk cycle
**Walking Up** - Character back view, 4-frame walk cycle
**Walking Left** - Character side view facing left, 4-frame cycle
**Walking Right** - Character side view facing right, 4-frame cycle

### NPC Sprite Examples (What to Look For)

**Professor** - Lab coat, scholarly
**Clerk** - Store uniform, friendly
**Trader** - Business attire, entrepreneurial
**Nurse** - Medical uniform, caring
**Gym Leader** - Athletic outfit, confident

---

## 8. Optional: Better Sprite Recommendations

If you find better alternatives while browsing, feel free to suggest:
- Different character sprites that fit better
- Additional animations we could use
- Alternative NPC types

---

## Ready to Label!

Just fill in the frame numbers above and I'll update the code immediately. You can either:
1. **Edit this file** and save your changes
2. **Reply with the frame numbers** in a message
3. **Create a new file** with the mappings

**Format example**:
```
Player Down: 0-3
Player Up: 4-7
Player Left: 8-11
Player Right: 12-15
Professor: 150
Clerk: 200
Trader: 250
Nurse: 180
Gym Leader: 300
```

Thanks for helping classify these! 🎮
