# Sprite Frame Labeling Guide

**Purpose**: Identify the correct frame numbers for player and NPC sprites from the Pokemon FireRed/LeafGreen sprite sheets.

---

## ✅ Tool Setup (COMPLETED)

The sprite viewer tool is now working perfectly!
- **Location**: http://localhost:8080/sprite-viewer-auto.html
- **Optimal Threshold**: 70 (set the slider to 70)
- **Algorithm**: Flood-fill detection (groups connected non-white pixels)

---

## 📋 What I Need From You

Use the sprite viewer to identify frame numbers for:
1. **Player sprites** - Red's walking animations (down, up, left, right, idle)
2. **NPC sprites** - 5 specific character types

Simply click on each sprite in the viewer and note down the frame number shown.

---

## 1. Player Sprite Classification

**File**: Load `public/assets/sprites/player/player-sprites.png` in the viewer

**Looking for**: Red (male protagonist) - the character with brown hair and red cap

### What I Need:

**🔽 Walking Down Animation** (facing camera):
- Need 4 consecutive frames showing the walk cycle
- Legs alternating, arms swinging
- **Frames**: 0 to 2 (e.g., "42 to 45")

**🔼 Walking Up Animation** (back view):
- Need 4 consecutive frames showing the walk cycle
- Back of head visible
- **Frames**: ___ to ___

**◀️ Walking Left Animation** (profile facing left):
- Need 4 consecutive frames showing the walk cycle
- Side view, facing left
- **Frames**: ___ to ___

**▶️ Walking Right Animation** (profile facing right):
- Need 4 consecutive frames showing the walk cycle
- Side view, facing right
- **Frames**: ___ to ___

**🧍 Idle/Standing Still**:
- Single frame of character standing (usually first frame of down animation)
- **Frame**: ___

---

## 2. NPC Sprite Classification

**File**: Load `public/assets/sprites/npcs/overworld-npcs.png` in the viewer

**Looking for**: Front-facing NPC sprites (standing still) that match these character types

### What I Need:

**👨‍🔬 Professor** (Professor Oak archetype):
- Older man with lab coat, scholarly appearance
- White or gray hair, friendly mentor look
- **Frame**: ___

**👔 Store Clerk** (PokeMart clerk):
- Store uniform, young adult
- Welcoming service look, behind-counter appearance
- **Frame**: ___

**💼 Token Trader** (Businessman/merchant):
- Business attire or trader clothes
- Not a Pokemon Center/Mart employee
- Entrepreneurial look
- **Frame**: ___

**👩‍⚕️ Nurse** (Nurse Joy archetype):
- Nurse uniform (pink/white)
- Medical cross or healthcare symbol
- Caring professional look
- **Frame**: ___

**🥋 Gym Leader** (Trainer/leader):
- Athletic or tough appearance
- Trainer outfit, confident stance
- Competitive/strong look
- **Frame**: ___

---

## 3. How to Use the Sprite Viewer

1. Open http://localhost:8080/sprite-viewer-auto.html
2. Click "Load Player Sprites" or "Load NPC Sprites" (or use file input)
3. Set threshold slider to **70**
4. Click on each sprite to see its frame number
5. Fill in the frame numbers above

The viewer shows frame numbers and lets you click to preview each sprite. Just note down the numbers!

---

## 4. Ready to Submit

Once you've identified the frames, reply with the numbers in any format. Examples:

**Simple format**:
```
Player Down: 42-45
Player Up: 46-49
Player Left: 50-53
Player Right: 54-57
Player Idle: 42

Professor: 150
Clerk: 200
Trader: 250
Nurse: 180
Gym Leader: 300
```

**Or edit this file directly** and save your changes.

I'll immediately update the game code and test to verify the sprites display correctly!

---

## Notes

- **Player sprites**: We only need Red (male protagonist with red cap)
- **NPC sprites**: Just need one good representative for each type
- **Feel free to suggest alternatives** if you find better sprites that fit!

Thanks for helping with this! 🎮
