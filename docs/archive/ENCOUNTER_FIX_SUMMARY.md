# Encounter Keyboard Event Fix - Summary

## Problem
After the first encounter, pressing C or R keys in subsequent encounters did nothing. The keyboard events stopped working on the second and all following encounters.

## Root Cause Analysis

The issue had multiple contributing factors:

1. **Shutdown handler never called**: The `shutdown()` method existed but wasn't registered with Phaser's event system, so it never executed when the scene stopped.

2. **Event listener accumulation**: Using `on()` instead of `once()` meant listeners persisted even after being used.

3. **State not reset**: `catchInProgress` and `currentToken` weren't reset between encounters, potentially blocking new interactions.

4. **Missing TypeScript compliance**: Error fallback used `address` instead of `tokenAddress`.

## The Fix

### 1. Properly Register Shutdown Handler (Line 134)
```typescript
// Register shutdown handler
this.events.once('shutdown', this.onShutdown, this);
```

This ensures cleanup happens when the scene stops.

### 2. Use `once()` for Auto-Cleanup (Lines 129-131)
```typescript
// Set up input - use once() to automatically clean up after use
this.input.keyboard?.once('keydown-C', this.attemptCatch, this);
this.input.keyboard?.once('keydown-R', this.runAway, this);
this.input.keyboard?.once('keydown-ESC', this.runAway, this);
```

Listeners automatically remove themselves after firing once.

### 3. Reset State at Start (Lines 22-24)
```typescript
async create(data: EncounterData) {
  // Reset state at the start of each encounter
  this.catchInProgress = false;
  this.currentToken = undefined;
```

Ensures clean state for each encounter.

### 4. Explicit Cleanup When Actions Start
```typescript
// In attemptCatch() - line 139-140
this.input.keyboard?.off('keydown-R');
this.input.keyboard?.off('keydown-ESC');

// In runAway() - line 215-216
this.input.keyboard?.off('keydown-C');
this.input.keyboard?.off('keydown-ESC');
```

Prevents other keys from firing once an action is chosen.

### 5. Shutdown Cleanup (Lines 239-250)
```typescript
private onShutdown() {
  // Clean up any remaining keyboard events
  if (this.input.keyboard) {
    this.input.keyboard.off('keydown-C');
    this.input.keyboard.off('keydown-R');
    this.input.keyboard.off('keydown-ESC');
  }

  // Reset state
  this.catchInProgress = false;
  this.currentToken = undefined;
}
```

Final cleanup when scene ends.

## How It Works Now

```
Encounter 1:
  ├─ create() resets state
  ├─ once() registers C, R, ESC listeners
  ├─ User presses C
  ├─ C listener fires and auto-removes
  ├─ off() explicitly removes R and ESC
  ├─ Scene fades out and stops
  └─ shutdown event fires → onShutdown() cleans up

Encounter 2:
  ├─ create() resets state ← FRESH START
  ├─ once() registers NEW C, R, ESC listeners
  ├─ User presses R
  ├─ R listener fires and auto-removes
  ├─ off() explicitly removes C and ESC
  ├─ Scene fades out and stops
  └─ shutdown event fires → onShutdown() cleans up

Encounter 3+:
  └─ Same clean process repeats indefinitely ✅
```

## Testing Results

✅ TypeScript build passes
✅ Game page loads (200 OK)
✅ No console errors
✅ Proper event lifecycle management
✅ State properly reset between encounters

## Files Changed

- `game/scenes/EncounterScene.ts` - Complete keyboard event handling rewrite
- `BUGFIXES.md` - Updated documentation

## Key Lessons

1. **Phaser lifecycle events must be explicitly registered** - defining a method named after an event doesn't automatically hook it up
2. **Use `once()` for one-time interactions** - prevents listener accumulation
3. **Always reset state** at the start of scene creation
4. **Multiple layers of cleanup** ensure robustness: once() + explicit off() + shutdown handler
