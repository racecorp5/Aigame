# Chunk 01 — PILOT: Threadling End-to-End

**Goal:** Build one full character + one battle scene before scaling. This is a
**spec validation** chunk — if anything's wrong with the grid, FPS, or origin,
catch it here before generating the other 500 files.

**Files produced:** 10
**Estimated time:** 2–4 hours (artist) / 30–60 min (AI generation)

## Files this chunk produces

| # | Path | Type | What it is |
|---|------|------|------------|
| 1 | `assets/agents/spritesheets/threadling.png`     | Sprite sheet | 392×1688 px, 24 rows × 8 cols, full anim set |
| 2 | `assets/agents/spritesheets/threadling.json`    | Manifest     | Per shared schema |
| 3 | `assets/agents/portraitsheets/threadling.png`   | Portrait sheet | 820×208 px, 4-frame loop |
| 4 | `assets/agents/portraitsheets/threadling.json`  | Manifest     | Portrait variant schema |
| 5 | `assets/icons/class/compute.png`                | Icon         | 48×48 class icon |
| 6 | `assets/enemies/spritesheets/tv.png`            | Sprite sheet | 388×358 px, 5 anims, single facing |
| 7 | `assets/enemies/spritesheets/tv.json`           | Manifest     | Enemy schema |
| 8 | `assets/backgrounds/sheets/bg_tv.png`           | BG sheet     | 3860×648 px, 4-frame ambient |
| 9 | `assets/backgrounds/sheets/bg_tv.json`          | Manifest     | BG schema |
| 10| `assets/icons/items/weapon_bit_shard_48.png`    | Icon         | 48×48 weapon icon |

---

## PROMPT BEGINS HERE — paste everything below into your generator

[STYLE DIRECTIVE — paste full contents of `_style_directive.md` here first]

---

### TASK: Generate the SYSTEM BREACH pilot art set

Generate the following six art deliverables for the System Breach pilot. Output
each as a separate PNG (transparent background where applicable). Pixel art,
2× scale, palette and grid as defined in the style directive.

#### 1. THREADLING — battle sprite sheet

**Character:** Threadling is the COMPUTE class — small, angular, fast-looking,
triangular silhouette. Compute = burst damage. Think: a sharp, geometric
operative built for surgical strikes. Cyan accent (`#3df7ff`).

**Design notes:**
- Body silhouette is roughly 18 px wide × 28 px tall inside the 22×33 cell.
- Head is a hooded triangular point with a single horizontal cyan visor slit.
- Shoulders are slightly forward, arms ending in light-blade emitters.
- Carries a "data-blade" (1 px-wide cyan line extending from the right hand,
  4 px long).
- Legs are slim, slight gap between them.
- Glow accents: visor slit, blade, faint chest core.

**Sheet output:**
- File: `assets/agents/spritesheets/threadling.png`
- Dimensions: 392 × 1688 px (24 rows × 8 cols, 44×66 cells, 4 px gutter, 4 px margin)
- 6 animations × 4 directions = 24 rows. Frame counts per row: idle=4, walk=6,
  attack=6, ability=8, hit=2, death=6. Empty cells transparent.
- **Ability animation specifics:** "Burst Strike" — Threadling gathers cyan
  light at the blade, charges 3 frames, slashes forward 3 frames (creating a
  1-frame neon arc trail), holds 1 frame, settles 1 frame.

**Manifest output:**
- File: `assets/agents/spritesheets/threadling.json`
- Use the exact JSON template from the style directive's "JSON MANIFEST SCHEMA"
  with `"image": "threadling.png"`.

#### 2. THREADLING — animated portrait sheet

**Use:** dialog overlays, comic panels, character select.

**Frame:** 200 × 200 each, 4 frames horizontal. Sheet = 820 × 208 px (4 px
gutter, 4 px margin).

**Composition:** chest-up portrait facing 3/4 toward viewer. Hood cast over
upper face, only the cyan visor visible. Background is dark BG-1 (`#070912`)
with a faint cyan circuit-trace pattern.

**Animation across the 4 frames:**
- Frame 1: Base pose. Visor at standard glow.
- Frame 2: Visor +20% brightness. Chest core pulses 1 step brighter.
- Frame 3: Single 1-px scan line crosses visor (left → right).
- Frame 4: Subtle 1-px shoulder rise (breathing). Visor returns to base.

**Manifest:** `assets/agents/portraitsheets/threadling.json` with portrait
schema (frameWidth 200, frameHeight 200, columns 4, rows 1, single
"idle" animation, 4 frames @ 6 fps, loop true).

#### 3. COMPUTE — class icon

**File:** `assets/icons/class/compute.png` — 48 × 48 px, transparent background.

**Design:** sharp downward-pointing triangle with a chip-die cutout in the
center. Cyan `#3df7ff` fill, dark `#0a0d18` outline. Subtle 1-px lighter
cyan rim along the upper-left edge for the top-left light source. Readable
silhouette at 24 px (test it).

#### 4. TV ENEMY — battle sprite sheet (Static Wastes, World 1)

**Enemy:** the TV is a hostile cathode-ray-tube television, hovering 2 px
above the ground. Screen is the "face" — flickering static with two glowing
red pixel slits as eyes. Casing is dark grey-blue (`#1f2745`).

**Sheet output:**
- File: `assets/enemies/spritesheets/tv.png`
- Dimensions: 388 × 358 px (5 rows × 8 cols, 44×66 cells)
- Single facing: LEFT (toward player squad).
- Rows: idle (4), attack (6), cast (6), hit (2), death (6).
- **Cast animation specifics:** "Signal Burst" — TV screen builds static (2
  frames), emits a red signal-cone burst forward (3 frames), settles (1 frame).

**Manifest:** `assets/enemies/spritesheets/tv.json` with enemy schema:
```json
{
  "$schema": "spritesheet/v1",
  "image": "tv.png",
  "frameWidth": 44,
  "frameHeight": 66,
  "padding": 2,
  "spacing": 4,
  "margin": 4,
  "columns": 8,
  "rows": 5,
  "originX": 22,
  "originY": 60,
  "animations": {
    "idle":   { "row": 0, "frames": 4, "fps": 6,  "loop": true  },
    "attack": { "row": 1, "frames": 6, "fps": 12, "loop": false },
    "cast":   { "row": 2, "frames": 6, "fps": 10, "loop": false },
    "hit":    { "row": 3, "frames": 2, "fps": 12, "loop": false },
    "death":  { "row": 4, "frames": 6, "fps": 8,  "loop": false }
  }
}
```

#### 5. STATIC WASTES — animated battle background

**Use:** battle scene background for World 1 fights.

**File:** `assets/backgrounds/sheets/bg_tv.png` — 3860 × 648 px (4 frames × 960
× 640, 4 px gutter, 4 px margin).

**Scene:** a darkened living room. Foreground silhouettes of a slumped couch
on the left, a dead potted plant on the right. Center-back: a wall of stacked
dead TV sets and CRT monitors, all flickering with low static. Floor is
parquet hinted by 2 horizontal lines. Heavy shadow, only TV-glow lights the
scene. Palette restricted to BG-1 through BG-4 plus enemy-red pinpricks.

**Per-frame variation:**
- Frame 1: Base. Two TV screens lit, one center, one upper-right.
- Frame 2: Center TV flickers off; lower-left TV ignites.
- Frame 3: All TVs static-pattern shifts (different noise pattern, same
  brightness as frame 1).
- Frame 4: A 1-px horizontal scan-line drift across one screen.

**Manifest:** `assets/backgrounds/sheets/bg_tv.json` with BG schema (single
"ambient" animation, 4 frames @ 4 fps, loop true).

#### 6. BIT SHARD — weapon icon

**File:** `assets/icons/items/weapon_bit_shard_48.png` — 48 × 48 px.

**Design:** a jagged shard/fragment of glowing cyan crystal (the "basic
attack tool"). Diagonal silhouette from lower-left to upper-right. Outline
dark `#0a0d18`. Inner gradient from cyan core to lighter cyan edge. Subtle
1-px cyan glow halo at one corner.

---

## VALIDATION CHECKLIST (do this before moving to chunk 02)

- [ ] Threadling battle sheet loads in engine; idle, walk, attack, ability play.
- [ ] Threadling sprite size on screen is exactly 44×66 px (no scaling drift).
- [ ] Threadling silhouette readable at 24 px (zoom out to test mobile distance).
- [ ] Portrait loop plays cleanly without seam.
- [ ] TV enemy faces left in battle, hit-reacts when attacked.
- [ ] BG_TV loops at 4 fps without obvious "jump" between frame 4 → frame 1.
- [ ] Compute icon and bit-shard icon both readable in HUD context.
- [ ] All transparency is real transparency (no checkerboard, no white halo).

If any of the above fails: **stop**, fix the spec or the prompt, regenerate
just the broken file, and re-test. Do not proceed to chunk 02 until all 8
boxes are checked.

## Style fallback (if AI generator can't hit pixel-perfect)

In order of acceptable compromise:
1. Silhouette and pose accuracy (NEVER compromise).
2. Palette adherence (NEVER compromise on outline color).
3. Exact frame count per animation (acceptable to lose 1 frame on `walk` or
   `idle`; update the JSON to match what was actually produced).
4. Sub-pixel placement on the grid (acceptable; clean up in Aseprite/Piskel
   pass).
5. Glow intensity (acceptable to dial down 10–20%).
