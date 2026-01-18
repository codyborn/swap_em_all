# Pallet Town Map Visualization

## Map Layout (40x30 tiles)

```
Legend:
■ = Blocked collision (walls/buildings)
░ = Dark grass (tile 0) - walkable
▒ = Light grass (tile 1) - walkable
║ = Dirt path (tile 2) - walkable
□ = Blocked area inside building (collision)
```

## Visual Map:

```
Row 0:  ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
Row 1:  ■░░░■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■░░░■■
Row 2:  ■░□░■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■░□░■■
Row 3:  ■░░░■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■░░░■■
Row 4:  ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
Row 5:  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
Row 6:  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒║║▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
Row 7:  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒║║▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
Row 8:  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒║║▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
Row 9:  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒║║▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
Row 10: ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒║║▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
Row 11: ▒▒▒░░░▒▒▒▒▒▒▒▒▒▒▒▒▒║║▒▒▒▒▒▒▒▒▒▒▒▒▒░□░▒▒▒
Row 12: ▒▒▒░░░▒▒▒▒▒▒▒▒▒▒▒▒▒║║▒▒▒▒▒▒▒▒▒▒▒▒▒░░░▒▒▒
Row 13: ▒▒▒░░░▒▒▒▒▒▒▒▒▒▒▒▒▒║║▒▒▒▒▒▒▒▒▒▒▒▒▒░░░▒▒▒
Row 14: ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒║║▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
Row 15: ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒║║▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  ← Player spawns here (center)
Row 16: ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒║║▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
Row 17: ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒║║▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
Row 18: ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒║║▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
Row 19: ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒║║▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
Row 20: ▒▒▒░□░▒▒▒▒▒▒▒▒▒▒▒▒▒║║▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
Row 21: ▒▒▒░░░▒▒▒▒▒▒▒▒▒▒▒▒▒║║▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
Row 22: ▒▒▒░░░▒▒▒▒▒▒▒▒▒▒▒▒▒║║▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
Row 23: ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒║║▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
Row 24: ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒║║▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
Row 25: ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒║║▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
Row 26: ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒║║▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
Row 27: ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒║║▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
Row 28: ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒║║▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
Row 29: ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒║║▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
```

## Key Buildings:

1. **Professor Oak's Lab** (Top-Left) - Rows 1-3, Cols 1-3
2. **Pokeball Shop** (Top-Right) - Rows 1-3, Cols 34-36
3. **Token Trader's House** (Bottom-Left) - Rows 11-13, Cols 3-5
4. **Token Center** (Right-Center) - Rows 11-13, Cols 34-36

## Current Problem:

**Camera view at zoom 1.0 shows only ~10-15 tiles around player**

Since player spawns at center (row 15, col 20) and camera follows with normal zoom, the user only sees the vertical dirt path (columns 19-20) that runs through the center.

The user needs a zoomed-out view to see the whole town layout.

## NPCs:
- Professor Oak: Inside top-left building
- Store Clerk: Inside top-right building
- Nurse Joy: Inside right-center building
- Token Trader: Inside bottom-left building

## Design Issues:
1. **Player cannot walk off of dirt path** 
2. **Encounters enabled in town** - Should be safe zone (no wild token spawns)
