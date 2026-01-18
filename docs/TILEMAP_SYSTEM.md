# Tilemap System Design

## Overview

This document outlines the tilemap implementation for Swap 'Em All, enabling rich, tile-based worlds instead of simple colored rectangles.

## Architecture

### Approach: Programmatic Tilemaps

**Decision**: Start with programmatic tilemap generation in Phaser, with future support for Tiled JSON import.

**Rationale**:
- Faster to prototype and iterate
- No external tool dependency initially
- Can export to Tiled format later
- Phaser has excellent tilemap API

### Tile Size

**Standard**: 16x16 pixels per tile

**Rationale**:
- Matches Pokemon FireRed/LeafGreen style
- Good balance of detail vs performance
- Player sprite is 16x24 (1 tile wide, 1.5 tiles tall)

### Map Size Standards

- **Towns/Cities**: 40 tiles wide × 30 tiles tall (640×480 pixels)
- **Routes**: 20 tiles wide × 60 tiles tall (320×960 pixels)
- **Gym Interiors**: 30 tiles wide × 20 tiles tall (480×320 pixels)

## Tilemap Layers

Each scene uses multiple layers for depth and collision:

### 1. Ground Layer (index 0)
- Base terrain (grass, dirt, water, floor)
- Always walkable unless collision layer says otherwise
- Rendered first (bottom)

### 2. Path Layer (index 1)
- Roads, bridges, special ground
- Rendered on top of ground
- Can have custom collision

### 3. Decoration Layer (index 2)
- Objects that sit on ground (flowers, rocks, signs)
- Some decorations block movement
- Rendered above paths

### 4. Building Layer (index 3)
- Houses, walls, roofs
- Usually blocks movement
- Rendered above decorations

### 5. Overlay Layer (index 4)
- Shadows, lighting effects, top of buildings
- Visual only, no collision
- Rendered last (top)

### Collision Layer (separate data)
- Not rendered visually
- Defines which tiles block movement
- Can be per-layer or unified

## Tile Indices

Using the existing `/public/assets/sprites/tiles/tileset.png`:

### Ground Tiles (0-19)
- 0: Dark grass
- 1: Light grass
- 2: Dirt path
- 3: Cobblestone
- 4: Wood floor
- 5: Water (animated)
- 6-9: Grass variants
- 10-19: Reserved for more ground

### Path Tiles (20-39)
- 20-23: Road (top, right, bottom, left)
- 24-27: Road corners
- 28-31: Bridge pieces
- 32-39: Reserved

### Decoration Tiles (40-79)
- 40-43: Flowers (red, yellow, blue, mixed)
- 44-47: Small rocks
- 48-51: Tall grass (encounter zones)
- 52-55: Shrubs
- 56-59: Signs
- 60-79: Reserved

### Building Tiles (80-199)
- 80-119: House pieces (walls, roofs, windows, doors)
- 120-159: Shop/gym building pieces
- 160-199: Special buildings

### Special Tiles (200+)
- 200-209: Animated water
- 210-219: Animated flowers
- 220+: Reserved for future

## Scene Structure

Each area is its own Phaser scene:

```typescript
export class PalletTownScene extends Phaser.Scene {
  private map?: Phaser.Tilemaps.Tilemap;
  private tileset?: Phaser.Tilemaps.Tileset;
  private layers: {
    ground?: Phaser.Tilemaps.TilemapLayer;
    path?: Phaser.Tilemaps.TilemapLayer;
    decoration?: Phaser.Tilemaps.TilemapLayer;
    building?: Phaser.Tilemaps.TilemapLayer;
    overlay?: Phaser.Tilemaps.TilemapLayer;
  } = {};

  create() {
    this.createTilemap();
    this.setupCollisions();
    this.createPlayer();
    this.createNPCs();
    this.setupCamera();
    this.setupTransitions();
  }
}
```

## Collision Detection

### Method 1: Tile Properties
```typescript
// Set tile collision in tileset
this.tileset.setCollision([80, 81, 82]); // Building tiles

// Enable collision between player and layer
this.physics.add.collider(this.player, this.layers.building);
```

### Method 2: Collision Layer
```typescript
// Define walkable/blocked in separate array
const collisionData = [
  [0, 0, 1, 1, 0],  // 0 = walkable, 1 = blocked
  [0, 0, 1, 1, 0],
  ...
];

// Check on player movement
if (collisionData[tileY][tileX] === 1) {
  blockMovement();
}
```

## Encounter Zones

Define areas where wild token encounters happen:

```typescript
// Mark tall grass tiles as encounter zones
const encounterTiles = [48, 49, 50, 51];

update() {
  const tile = this.map.getTileAtWorldXY(
    this.player.x,
    this.player.y,
    true,
    undefined,
    this.layers.decoration
  );

  if (tile && encounterTiles.includes(tile.index)) {
    this.checkEncounter();
  }
}
```

## Area Transitions

### Method: Trigger Zones

Place invisible trigger zones at map edges:

```typescript
// Create transition trigger
const trigger = this.add.zone(x, y, width, height);
this.physics.add.existing(trigger);

this.physics.add.overlap(this.player, trigger, () => {
  this.scene.start('Route1Scene', {
    spawnPoint: 'from_pallet',
    playerDirection: 'up'
  });
});
```

### Spawn Points

Each scene has named spawn points:

```typescript
const spawnPoints = {
  from_pallet: { x: 160, y: 460 },
  from_route1: { x: 160, y: 20 },
};

create(data: { spawnPoint?: string }) {
  const spawn = spawnPoints[data.spawnPoint || 'default'];
  this.player.setPosition(spawn.x, spawn.y);
}
```

## Interactive Objects

### Signs
```typescript
class Sign {
  constructor(scene, x, y, text) {
    this.sprite = scene.add.sprite(x, y, 'tileset', 56);
    this.text = text;
  }

  interact() {
    scene.showDialogue([this.text]);
  }
}
```

### Doors
```typescript
class Door {
  constructor(scene, x, y, targetScene) {
    this.sprite = scene.add.sprite(x, y, 'tileset', 100);
    this.targetScene = targetScene;
  }

  interact() {
    scene.scene.start(this.targetScene);
  }
}
```

## Performance Optimizations

### Culling
```typescript
// Only render tiles in camera view
this.layers.ground.setCullPadding(2, 2);
```

### Static Layers
```typescript
// Mark layers that don't change
this.layers.ground.setCollisionByProperty({ collides: true });
```

### Tile Pooling
- Reuse tile objects instead of creating new ones
- Phaser handles this automatically

## Implementation Plan

### Phase 1: Core System ✅
1. Define tile indices (this doc)
2. Create base scene class with tilemap support
3. Implement collision system
4. Add transition zones

### Phase 2: First Area
1. Build Pallet Town programmatically
2. Add NPCs (Professor, Clerk, Nurse)
3. Add interactive objects (signs)
4. Test movement and collision

### Phase 3: Expansion
1. Build Route 1
2. Build Stablecoin City
3. Add Gym #1
4. Test full progression flow

### Phase 4: Tooling (Future)
1. Export maps to Tiled JSON format
2. Build Tiled map importer
3. Create map editor tools
4. Add visual debugging

## File Structure

```
game/
  scenes/
    maps/
      PalletTownScene.ts
      Route1Scene.ts
      StablecoinCityScene.ts
      ...
    BaseMapScene.ts (shared tilemap logic)

  data/
    maps/
      pallet-town.ts (map data arrays)
      route-1.ts
      ...
```

## Example Map Data

```typescript
// pallet-town-map.ts
export const PALLET_TOWN = {
  width: 40,
  height: 30,

  ground: [
    [0, 0, 1, 1, 0, ...],  // Row 0
    [0, 1, 1, 0, 0, ...],  // Row 1
    ...
  ],

  buildings: [
    [0, 0, 0, 0, 80, ...],
    [0, 0, 0, 0, 81, ...],
    ...
  ],

  collision: [
    [0, 0, 0, 0, 1, ...],
    [0, 0, 0, 0, 1, ...],
    ...
  ],

  npcs: [
    { id: 'professor', x: 160, y: 200, type: 'professor' },
    { id: 'clerk', x: 300, y: 150, type: 'clerk' },
  ],

  signs: [
    { x: 100, y: 250, text: 'Welcome to Pallet Town!' },
  ],

  transitions: [
    {
      x: 320, y: 0, width: 32, height: 16,
      target: 'Route1Scene',
      spawnPoint: 'from_pallet'
    },
  ],
};
```

## Testing Strategy

### Visual Tests
- Render each layer separately to verify
- Toggle collision visualization
- Show encounter zone highlights

### Movement Tests
- Walk into all collision tiles
- Test all transition zones
- Verify spawn points correct

### Performance Tests
- Monitor FPS with full map rendered
- Test with 20+ NPCs
- Verify memory usage stable

## Future Enhancements

1. **Animated Tiles**: Water, flowers, lights
2. **Weather Effects**: Rain, snow, fog
3. **Day/Night Cycle**: Different tiles for time of day
4. **Dynamic Tiles**: Tiles that change based on game state
5. **Multi-Layer Buildings**: Interiors with depth
6. **Parallax Backgrounds**: Sky, clouds, distant mountains

---

**Status**: Design Complete
**Next Step**: Implement PalletTownScene
