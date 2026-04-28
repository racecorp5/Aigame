# Chunk 01 (READY-TO-PASTE) — Threadling Pilot

> This is the self-contained version of `01_pilot_threadling.md`. The shared
> style directive is **already inlined**. Copy this entire file's contents into
> your image generator and attach the two reference images (see bottom).

---

## REFERENCE IMAGES (attach both with these labels)

1. **Image A — STYLE TARGET** (the System Breach style board, with 7 classes
   and 19 enemies on a dark grid).
   *Tag in the prompt:* "STYLE TARGET — match this aesthetic exactly. Palette,
   neon glow discipline, line cleanliness, silhouette quality."
2. **Image B — LAYOUT TEMPLATE ONLY** (the AGENT-01 sci-fi style sheet).
   *Tag in the prompt:* "LAYOUT TEMPLATE ONLY — do not copy the sci-fi
   character or the 32×32 grid. Use this only as a reference for organizing
   the output as a single style-sheet board with the same panels: animation
   strip, pose strip, palette swatches, decals, damage states, color
   variants, size reference."

---

## ====== PROMPT (paste everything from here on) ======

# SYSTEM BREACH — STYLE DIRECTIVE (read first, applies to everything below)

**Game:** SYSTEM BREACH — a turn-based mobile pixel-art game set inside a
network of corrupted IoT devices in a near-future cyberpunk world.

**Visual direction:** *Clean Neon Systems*. Dark backgrounds, strong neon
accents, minimal noise, high silhouette readability at small mobile size.
Late-90s console RPG sprites + modern neon synthwave palette + cyberpunk-but-
clean (not glitchy/distorted). Comparable: *Hyper Light Drifter*, *Crosscode*.

### PIXEL ART GRID

- Logical cell: **22 × 33 px** per sprite frame.
- Render scale: **2× → final 44 × 66 px** on screen. Always export at 2×.
- **Pixel discipline:** nearest-neighbor scaling only. No anti-aliasing on
  outlines. Internal anti-alias is allowed but limited.
- **Outline color:** dark, NOT pure black — use `#0a0d18`.
- **Light source:** top-left, ~30°. All shading consistent.
- **Max colors per single sprite:** 5–7 including outline + highlight.

### CORE PALETTE (locked — use these hex values exactly)

| Role | Hex |
|------|-----|
| BG dark 1 | `#070912` |
| BG dark 2 | `#0a0d18` (outline color) |
| BG dark 3 | `#141a2e` |
| BG dark 4 | `#1f2745` |
| Player cyan | `#3df7ff` (COMPUTE / Threadling) |
| Player blue | `#62b8ff` (NETWORK / Netrunner) |
| Player magenta | `#ff5cd0` (MEMORY / Patchwork) |
| Player green | `#4cff8a` (STORAGE / Vault) |
| Player yellow | `#ffd23d` (INTERFACE / Bridgelink) |
| Enemy red | `#ff4d4d` (SECURITY / general enemy) |
| Enemy orange | `#ff8a3c` (Heat / fire FX) |
| Enemy hot-pink | `#ff2e88` (GLITCH / corruption FX) |
| Hit flash | `#ffb3c1` |
| Heal | `#a4ffb6` |
| Critical | `#fff7a4` |

### ANIMATION SET (every animated character uses this exact set)

6 animations × 4 directions = 24 rows of art per character sheet.

| Animation | Frames | FPS | Loop | Behavior |
|-----------|-------:|----:|:----:|----------|
| `idle`    | 4 | 6  | yes | breathing, glow pulse |
| `walk`    | 6 | 10 | yes | 1–2 px float, no cartoony bob |
| `attack`  | 6 | 12 | no  | anticipation → strike (snap forward 2–3 px) → recovery |
| `ability` | 8 | 10 | no  | charge → release → hold → settle |
| `hit`     | 2 | 12 | no  | 1 px shake + hit-flash palette swap |
| `death`   | 6 | 8  | no  | keel → collapse → dissolve |

Directions: `down`, `left`, `right`, `up` (in that row order).

### SHEET LAYOUT

```
24 rows × 8 cols, cell 44×66 (2× from 22×33), 4px gutter, 4px margin
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

Empty cells are fully transparent. Engine reads `frames` from JSON manifest.

### EVERY SHEET SHIPS WITH A JSON MANIFEST

```json
{
  "$schema": "spritesheet/v1",
  "image": "<filename>.png",
  "frameWidth": 44,
  "frameHeight": 66,
  "padding": 2, "spacing": 4, "margin": 4,
  "columns": 8, "rows": 24,
  "originX": 22, "originY": 60,
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

### HARD CONSTRAINTS

- Pixel art only. No painterly, no 3D render, no photoreal.
- Transparent background on every sheet and icon.
- One outline pass per sprite. Outline color `#0a0d18`, never pure black.
- Neon glow via 1–2 px bloom (lighter shade of accent), never via heavy blur.
- No text/logos rendered into the art.
- No colors outside the palette.
- No diagonal anti-aliased lines. Use pixel staircase.

---

# CHUNK 01 — THREADLING PILOT

Generate **6 art deliverables** below as separate PNG outputs. Save each to
the path noted. Pixel art, 2× scale, palette and grid above.

## 1. `assets/agents/spritesheets/threadling.png`

**Character:** Threadling — COMPUTE class. Small, angular, fast-looking,
triangular silhouette. Cyan accent `#3df7ff`. Compute = burst damage.

**Design notes:**
- Body fits in 22×33 cell, ~18 px wide × 28 px tall.
- Head is a hooded triangular point with a single horizontal cyan visor slit.
- Shoulders slightly forward; arms end in cyan light-blade emitters.
- Carries a "data-blade" — 1 px cyan line, 4 px long, from the right hand.
- Slim legs, slight gap between them.
- Glow accents on visor slit, blade, and faint chest core.

**Sheet:** 392 × 1688 px, 24 rows × 8 cols, 44×66 cells, 4 px gutter, 4 px margin.
6 anims × 4 dirs (per layout table above). Frame counts: idle=4, walk=6, attack=6,
ability=8, hit=2, death=6. Empty cells fully transparent.

**Ability — "Burst Strike":** Threadling charges cyan light at the blade
(frames 1–3), slashes forward (frames 4–6, with a 1-frame neon arc trail),
holds peak (frame 7), settles (frame 8).

**Also produce:** `assets/agents/spritesheets/threadling.json` with the schema
above and `"image": "threadling.png"`.

## 2. `assets/agents/portraitsheets/threadling.png`

Animated 4-frame portrait loop. **Sheet 820 × 208 px** (4 × 200 px frames,
4 px gutter, 4 px margin).

Composition: chest-up, 3/4 facing toward viewer. Hood casts shadow over
upper face — only the cyan visor visible. Background is BG dark 1 `#070912`
with a faint cyan circuit-trace pattern.

Frame variation:
- 1: base pose
- 2: visor +20% brightness, chest core pulses
- 3: 1-px scan line crosses visor (left → right)
- 4: subtle 1-px shoulder rise (breathing); visor returns to base

**Also produce:** `assets/agents/portraitsheets/threadling.json` with portrait
schema (frameWidth 200, frameHeight 200, columns 4, rows 1, single
"idle" animation, 4 frames @ 6 fps, loop true).

## 3. `assets/icons/class/compute.png`

48 × 48 px, transparent background. Sharp downward-pointing triangle with a
chip-die cutout in the center. Cyan `#3df7ff` fill, dark `#0a0d18` outline.
1-px lighter cyan rim along upper-left for top-left light. Must be readable
at 24 px.

## 4. `assets/enemies/spritesheets/tv.png`

**Enemy:** TV from the Static Wastes (World 1). Hostile cathode-ray-tube
television, hovering 2 px above ground. Screen flickers static; two glowing
red pixel slits as eyes. Casing dark grey-blue `#1f2745`.

**Sheet:** 388 × 358 px, 5 rows × 8 cols, 44×66 cells. Single facing: LEFT
(toward player squad). Rows: idle (4), attack (6), cast (6), hit (2),
death (6).

**Cast — "Signal Burst":** TV builds static (frames 1–2), emits a red
signal-cone forward (frames 3–5), settles (frame 6).

**Also produce:** `assets/enemies/spritesheets/tv.json`:

```json
{
  "$schema": "spritesheet/v1",
  "image": "tv.png",
  "frameWidth": 44, "frameHeight": 66,
  "padding": 2, "spacing": 4, "margin": 4,
  "columns": 8, "rows": 5,
  "originX": 22, "originY": 60,
  "animations": {
    "idle":   { "row": 0, "frames": 4, "fps": 6,  "loop": true  },
    "attack": { "row": 1, "frames": 6, "fps": 12, "loop": false },
    "cast":   { "row": 2, "frames": 6, "fps": 10, "loop": false },
    "hit":    { "row": 3, "frames": 2, "fps": 12, "loop": false },
    "death":  { "row": 4, "frames": 6, "fps": 8,  "loop": false }
  }
}
```

## 5. `assets/backgrounds/sheets/bg_tv.png`

Animated battle background, **3860 × 648 px** (4 frames × 960 × 640, 4 px
gutter, 4 px margin).

Scene: darkened living room. Foreground silhouettes — slumped couch left,
dead potted plant right. Center back: a wall of stacked dead TV sets and
CRT monitors flickering low static. Floor hinted by 2 horizontal lines.
Heavy shadow, only TV-glow lights the scene. Palette restricted to BG-1
through BG-4 plus enemy-red pinpricks.

Per-frame variation:
- 1: base, two TVs lit (center, upper-right)
- 2: center TV flickers off, lower-left TV ignites
- 3: all TVs static-pattern shifts (different noise, same brightness as 1)
- 4: 1-px horizontal scan-line drift across one screen

**Also produce:** `assets/backgrounds/sheets/bg_tv.json` (BG schema, single
"ambient" animation, 4 frames @ 4 fps, loop true).

## 6. `assets/icons/items/weapon_bit_shard_48.png`

48 × 48 px. Jagged shard / fragment of glowing cyan crystal — the basic
attack tool. Diagonal silhouette from lower-left to upper-right. Outline
`#0a0d18`. Inner gradient from cyan core to lighter cyan edge. Subtle 1-px
cyan glow halo at one corner.

---

# OUTPUT CHECKLIST (do this before saying "done")

- [ ] All 6 PNGs at exact paths above
- [ ] All required JSONs alongside their PNGs
- [ ] Real transparency (no white halo, no checkerboard baked in)
- [ ] Threadling sprite size on screen exactly 44×66 px
- [ ] Threadling silhouette readable at 24 px (zoom out test)
- [ ] Portrait loop has no seam
- [ ] TV enemy faces left
- [ ] BG_TV loops smoothly at 4 fps (frame 4 → frame 1 transition is clean)
- [ ] Compute icon and bit-shard icon both readable in HUD context

# STYLE FALLBACK (if generator can't hit pixel-perfect)

Acceptable compromises in order:
1. Silhouette and pose (NEVER compromise)
2. Palette adherence (NEVER compromise on outline color)
3. Exact frame count (acceptable to lose 1 frame on idle/walk; update JSON)
4. Sub-pixel placement (clean up in Aseprite/Piskel pass)
5. Glow intensity (acceptable to dial down 10–20%)

## ====== END OF PROMPT ======
