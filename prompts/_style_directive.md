# Shared Style Directive — System Breach

> **Prepend the contents of this file to every prompt below.** It defines the
> global art direction and is the single source of truth for palette, grid,
> outline rules, and overall vibe. If you change anything here, it propagates
> to every chunk — that's the whole point.

---

## STYLE DIRECTION

**Game:** SYSTEM BREACH — a turn-based mobile pixel-art game set inside a
network of corrupted IoT devices in a near-future cyberpunk world.

**Visual direction:** *Clean Neon Systems* (Direction A from the locked style
board). Dark backgrounds, strong neon accents, minimal noise, high silhouette
readability at small mobile size. Think: late-90s console RPG sprites + modern
neon synthwave palette + cyberpunk-but-clean (not glitchy/distorted).

**Reference comparable:** clean retro-future pixel art with strong glow
accents, similar to *Hyper Light Drifter*, *Crosscode*, or *VA-11 HALL-A*'s
character work — but at a smaller cell size, optimized for tight HUD layouts.

## PIXEL ART GRID

- **Logical cell:** 22 × 33 px (one sprite frame).
- **Render scale:** 2× → final 44 × 66 px on screen. Always export at 2×.
- **Pixel discipline:** nearest-neighbor scaling only. No anti-aliasing on the
  outline. Internal anti-alias is allowed but limited — pixels should still
  read as pixels.
- **Outline color:** dark, NOT pure black. Use `#0a0d18` (the BG dark-2 swatch).
- **Light source:** top-left, ~30°. All shading consistent with this.
- **Max colors per single sprite:** 5–7 including outline and highlight.

## CORE PALETTE (locked)

Use these hex values exactly. Never invent new accent colors — if you need a
new tone, shift one of these in HSV.

| Role | Hex | Usage |
|------|-----|-------|
| BG dark 1 | `#070912` | Deepest background, void |
| BG dark 2 | `#0a0d18` | **Outline color** for all sprites |
| BG dark 3 | `#141a2e` | Mid background, panels |
| BG dark 4 | `#1f2745` | Light background, mid-shadows |
| Player cyan | `#3df7ff` | COMPUTE class (Threadling) |
| Player blue | `#62b8ff` | NETWORK class (Netrunner) |
| Player magenta | `#ff5cd0` | MEMORY class (Patchwork) |
| Player green | `#4cff8a` | STORAGE class (Vault) |
| Player yellow | `#ffd23d` | INTERFACE class (Bridgelink) |
| Enemy red | `#ff4d4d` | SECURITY class (Sentinel) + general enemy |
| Enemy orange | `#ff8a3c` | Heat (Microwave world, fire FX) |
| Enemy hot-pink | `#ff2e88` | GLITCH class (Glitcher), corruption FX |
| Hit flash | `#ffb3c1` | 1-frame hit overlay only |
| Heal | `#a4ffb6` | Healing FX |
| Critical | `#fff7a4` | Critical hit burst |

## ANIMATION SET (every animated character uses this exact set)

6 animations × 4 directions = 24 rows of art per character sheet.

| Animation | Frames | FPS | Loop | Behavior |
|-----------|-------:|----:|:----:|----------|
| `idle`    | 4 | 6  | yes | breathing, glow pulse, plant feet |
| `walk`    | 6 | 10 | yes | 1–2 px float, no cartoony bob |
| `attack`  | 6 | 12 | no  | anticipation → strike (snap forward 2–3 px) → recovery |
| `ability` | 8 | 10 | no  | charge → release → hold → settle |
| `hit`     | 2 | 12 | no  | 1 px shake + hit-flash palette swap |
| `death`   | 6 | 8  | no  | keel → collapse → dissolve top-down |

Directions per character: `down`, `left`, `right`, `up` (in that row order).

## SHEET LAYOUT (per character)

```
Rows = 24 total: 6 anims × 4 directions
Cols = 8 (widest animation = ability, 8 frames)
Cell = 44 × 66 (rendered 2× from 22×33 source)
Spacing between cells = 4 px
Outer margin = 4 px
Final sheet ≈ 392 × 1688 px

Row 0  idle_down       Row 12 idle_right
Row 1  walk_down       Row 13 walk_right
Row 2  attack_down     Row 14 attack_right
Row 3  ability_down    Row 15 ability_right
Row 4  hit_down        Row 16 hit_right
Row 5  death_down      Row 17 death_right
Row 6  idle_left       Row 18 idle_up
Row 7  walk_left       Row 19 walk_up
Row 8  attack_left     Row 20 attack_up
Row 9  ability_left    Row 21 ability_up
Row 10 hit_left        Row 22 hit_up
Row 11 death_left      Row 23 death_up
```

Empty cells (e.g. idle's last 4 columns) should be **fully transparent** — do
NOT extend the animation; the engine reads `frames` from the JSON manifest.

## WHAT TO ALWAYS DELIVER WITH A SPRITE SHEET

For every animated character/sheet:
1. The **PNG sprite sheet** at the path the prompt specifies.
2. A **matching `.json` manifest** in the same folder with the same basename.
   Schema below.

## JSON MANIFEST SCHEMA

```json
{
  "$schema": "spritesheet/v1",
  "image": "<filename>.png",
  "frameWidth": 44,
  "frameHeight": 66,
  "padding": 2,
  "spacing": 4,
  "margin": 4,
  "columns": 8,
  "rows": 24,
  "originX": 22,
  "originY": 60,
  "animations": {
    "idle_down":    { "row": 0,  "frames": 4, "fps": 6,  "loop": true  },
    "walk_down":    { "row": 1,  "frames": 6, "fps": 10, "loop": true  },
    "attack_down":  { "row": 2,  "frames": 6, "fps": 12, "loop": false },
    "ability_down": { "row": 3,  "frames": 8, "fps": 10, "loop": false },
    "hit_down":     { "row": 4,  "frames": 2, "fps": 12, "loop": false },
    "death_down":   { "row": 5,  "frames": 6, "fps": 8,  "loop": false },
    "idle_left":    { "row": 6,  "frames": 4, "fps": 6,  "loop": true  },
    "walk_left":    { "row": 7,  "frames": 6, "fps": 10, "loop": true  },
    "attack_left":  { "row": 8,  "frames": 6, "fps": 12, "loop": false },
    "ability_left": { "row": 9,  "frames": 8, "fps": 10, "loop": false },
    "hit_left":     { "row": 10, "frames": 2, "fps": 12, "loop": false },
    "death_left":   { "row": 11, "frames": 6, "fps": 8,  "loop": false },
    "idle_right":   { "row": 12, "frames": 4, "fps": 6,  "loop": true  },
    "walk_right":   { "row": 13, "frames": 6, "fps": 10, "loop": true  },
    "attack_right": { "row": 14, "frames": 6, "fps": 12, "loop": false },
    "ability_right":{ "row": 15, "frames": 8, "fps": 10, "loop": false },
    "hit_right":    { "row": 16, "frames": 2, "fps": 12, "loop": false },
    "death_right":  { "row": 17, "frames": 6, "fps": 8,  "loop": false },
    "idle_up":      { "row": 18, "frames": 4, "fps": 6,  "loop": true  },
    "walk_up":      { "row": 19, "frames": 6, "fps": 10, "loop": true  },
    "attack_up":    { "row": 20, "frames": 6, "fps": 12, "loop": false },
    "ability_up":   { "row": 21, "frames": 8, "fps": 10, "loop": false },
    "hit_up":       { "row": 22, "frames": 2, "fps": 12, "loop": false },
    "death_up":     { "row": 23, "frames": 6, "fps": 8,  "loop": false }
  }
}
```

## HARD CONSTRAINTS (don't violate)

- ✅ Pixel art only. No painterly, no rendered 3D, no soft photoreal.
- ✅ Transparent background on every sheet, every icon.
- ✅ All sprites face their direction with consistent silhouette.
- ✅ One outline pass — never double-outlined.
- ✅ Neon glow is via 1–2 px bloom (lighter shade of accent), never via heavy
  blur or post-process feathering.
- ❌ No text, no logos, no watermarks rendered into art.
- ❌ No mid-tones outside the palette (a single shade of "purple-ish blue" not
  in the palette is forbidden — pick the closest swatch).
- ❌ No diagonal anti-aliased lines. Use proper pixel staircase patterns.
- ❌ No characters smiling, no anthropomorphic faces unless explicitly
  requested. Devices are sinister/cold.

## PALETTE-SHIFT RULE (subclasses)

When a prompt asks for a "subclass tint" of an existing agent:
- Keep the **silhouette pixel-identical** to the base.
- Swap **only** accent colors per the prompt's color shift.
- Redraw **only** the `ability_*` animation rows (8 frames × 4 dirs = 32 frames).
- Other rows are auto-tintable from the base sheet.

---

**END OF SHARED STYLE DIRECTIVE.** Every chunk prompt below assumes everything
in this file as background. If a chunk prompt contradicts this file, the chunk
prompt wins for that chunk only.
