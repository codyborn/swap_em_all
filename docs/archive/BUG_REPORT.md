# Bug Report - Comprehensive Testing Session
**Date:** 2026-01-17
**Test Environment:** Browser (Playwright automated + manual inspection)
**Game Build:** Current main branch (commit 68048a1)

---

## Summary
Comprehensive testing performed across all game features including:
- Title screen and boot sequence
- Player movement and controls
- NPC interactions (Professor, Clerk, Trader, Nurse, Gym Leader)
- Battle/encounter system
- Menu navigation
- Inventory system

---

## Issues Found

### 🔴 CRITICAL ISSUES

#### 0. Battle Scene Sprite Loading Error (Reported by User)
- **Location:** BattleScene.ts:269 (actual error in sprite loading)
- **Error:** `Cannot read properties of null (reading 'drawImage')`
- **Reproduction:** Interact with Protocol Pete (or potentially other NPCs that trigger battles)
- **Root Cause Analysis:**
  - BattleScene tries to load sprites with keys like `token-${battle.player.token.type}-battle`
  - If token.type doesn't match generated sprite keys (`token-defi-battle`, `token-stablecoin-battle`, etc.), Phaser fails to render
  - Error message is misleading - points to `text.setText()` but actual failure is in sprite rendering pipeline
- **Expected:** Battle scene should render with token sprites
- **Actual:** TypeError crashes the scene
- **Impact:** Prevents battles with certain token types from working
- **Why Automated Test Missed It:**
  - Error only occurs with specific token types in inventory
  - Automated test may not have the right token combination
  - Error is async and happens during render phase
- **Fix Needed:**
  - Add fallback sprite (token-unknown-battle) when specific type not found
  - OR ensure all possible token.type values have corresponding sprites generated

---

### 🟠 MAJOR ISSUES

---

### 🟡 MINOR ISSUES


#### 5. HUD Instructions Always Visible
- **Location:** Overworld - Top left of game screen
- **Description:**
  - "Arrow Keys: Move"
  - "E: Force Encounter"
  - "SPACE: Interact"
- **Issue:** Instructions remain visible during all gameplay
- **Expected:** Should hide during dialogues, battles, or have toggle option
- **Impact:** Minor visual clutter, but helpful for new players
- **Recommendation:** Consider fade-out after 30 seconds or hide in menus

---

### 🟢 COSMETIC ISSUES

#### 6. Canvas Aspect Ratio Non-Integer Scaling
- **Location:** Game canvas rendering
- **Details:**
  - Canvas internal: 160x144
  - Displayed as: 501.319px × 451.188px
  - Container: 504px × 451px
- **Issue:** Non-integer scaling (3.133x) may cause subtle pixel blur
- **Expected:** Integer scaling (3x or 4x) for crisp pixels
- **Impact:** Minimal - only noticeable on close inspection
- **Recommendation:** Use 3x (480x432) or 4x (640x576) for pixel-perfect rendering

---

## Issues NOT Found (Working Correctly)

✅ Player sprite renders correctly
✅ Player movement in all 4 directions
✅ Orange border filter working (0 orange pixels in canvas)
✅ NPCs render at correct positions
✅ Sprites animate correctly
✅ Game loads without critical errors
✅ Title screen displays correctly
✅ Encounter triggering works (E key near NPCs)

---

## Console Warnings (Non-blocking)

The following warnings appear but don't affect gameplay:
- Reown/Web3Modal config errors (expected - wallet not configured)
- Lit dev mode warning (expected in development)
- Canvas2D willReadFrequently optimization suggestion
- WebGL ReadPixels performance warnings

---

## Test Coverage

### Tested Features:
- ✅ Title screen display
- ✅ Game boot sequence
- ✅ Player movement (all directions)
- ❌ NPC dialogue system (broken)
- ❌ Clerk menu system (broken)
- ❌ Battle UI rendering (broken)
- ✅ Encounter triggering
- ⚠️ Inventory menu (needs separate test - E key triggers encounters)
- ✅ HUD display
- ✅ Sprite rendering
- ✅ Controls responsiveness

### Features Needing Additional Testing:
- Inventory menu (different key binding needed)
- Trading functionality
- Item usage
- Battle mechanics (once UI is visible)
- Dialogue progression
- Menu scrolling with many items
- Save/load system

---

## Recommendations

### Priority 0 (Critical - Runtime Error):
0. Fix battle scene sprite loading to handle missing token types (add fallback or generate all needed sprites)

### Priority 1 (Critical - Blocks Gameplay):
1. Fix dialogue box rendering for all NPC interactions
2. Fix battle scene UI rendering
3. Fix clerk menu rendering

### Priority 2 (Important):
4. Add visible "PRESS START" instruction on title screen
5. Verify inventory menu keybinding (currently E triggers encounters)

### Priority 3 (Polish):
6. Implement HUD fade-out or toggle
7. Adjust canvas scaling to integer multiple for pixel-perfect rendering

---

## Testing Notes

- All testing done via `/game/test` route (bypasses wallet requirement)
- Screenshots saved in: `test-results/bug-hunt/`
- Full automated test: `tests/comprehensive-bug-hunt.spec.ts`
- 23 screenshots captured across different game states
