# Threadling — Battle Sprite Sheet

> **Drag this file + Image A (System Breach style board) into your generator.**
> Do NOT attach Image B (the AGENT-01 board). It confuses the generator into
> producing a reference sheet instead of the deliverable PNG.

---

## ⚠ READ FIRST — output discipline

You are producing **ONE PNG FILE.** It is a game-engine sprite sheet that
will be loaded as raw frames. It is **NOT** a reference board, **NOT** a
mockup, **NOT** a style sheet, **NOT** a labeled portfolio piece, **NOT** a
collage of panels.

If you find yourself drawing labels, palette swatches, callout boxes, or
multiple related images in one canvas — **stop. You are doing it wrong.**

The output is a transparent-background PNG with a strict grid of identically-
sized animation frames and nothing else.

## SAVE TO

`assets/agents/spritesheets/threadling.png`

## EXACT OUTPUT DIMENSIONS

**392 × 1688 pixels.** Transparent background (true alpha, not white).

## SHEET LAYOUT — READ THIS CAREFULLY

24 rows × 8 columns of cells. Each cell is **44 × 66 pixels.**
4 px gutter between cells. 4 px outer margin.

**THE 8 COLUMNS ARE ANIMATION FRAMES — NOT DIRECTIONS.**
**EACH ROW IS ONE ANIMATION FOR ONE FACING DIRECTION.**

Wrong (do not do this):
```
Cols: [DOWN | LEFT | RIGHT | UP | DOWN | LEFT | RIGHT | UP]
Row 0: idle frame, one per direction ...
Row 1: walk frame 1, one per direction ...
```

Correct (do this):
```
Row  0, cols 0-3: idle_down frames 0-1-2-3  (cols 4-7 transparent)
Row  1, cols 0-5: walk_down frames 0-1-2-3-4-5  (cols 6-7 transparent)
Row  6, cols 0-3: idle_LEFT frames 0-1-2-3  ← new block for LEFT direction
```

The full row table:

```
Row  0:  idle_down       (frames 0–3 used,  cells 4–7 transparent)
Row  1:  walk_down       (frames 0–5 used,  cells 6–7 transparent)
Row  2:  attack_down     (frames 0–5 used,  cells 6–7 transparent)
Row  3:  ability_down    (frames 0–7 used — full row)
Row  4:  hit_down        (frames 0–1 used,  cells 2–7 transparent)
Row  5:  death_down      (frames 0–5 used,  cells 6–7 transparent)
Row  6:  idle_left       (same pattern)
Row  7:  walk_left
Row  8:  attack_left
Row  9:  ability_left
Row 10:  hit_left
Row 11:  death_left
Row 12:  idle_right
Row 13:  walk_right
Row 14:  attack_right
Row 15:  ability_right
Row 16:  hit_right
Row 17:  death_right
Row 18:  idle_up
Row 19:  walk_up
Row 20:  attack_up
Row 21:  ability_up
Row 22:  hit_up
Row 23:  death_up
```

Cell content is pixel-art animation frames. Empty cells (e.g. idle's last
4 columns) are **fully transparent** — leave them blank, do not extend
the animation, do not put any pixels there.

```
Row  0:  idle_down       (frames 0–3 used,  cells 4–7 transparent)
Row  1:  walk_down       (frames 0–5 used,  cells 6–7 transparent)
Row  2:  attack_down     (frames 0–5 used,  cells 6–7 transparent)
Row  3:  ability_down    (frames 0–7 used — full row)
Row  4:  hit_down        (frames 0–1 used,  cells 2–7 transparent)
Row  5:  death_down      (frames 0–5 used,  cells 6–7 transparent)
Row  6:  idle_left       (same pattern)
Row  7:  walk_left
Row  8:  attack_left
Row  9:  ability_left
Row 10:  hit_left
Row 11:  death_left
Row 12:  idle_right
Row 13:  walk_right
Row 14:  attack_right
Row 15:  ability_right
Row 16:  hit_right
Row 17:  death_right
Row 18:  idle_up
Row 19:  walk_up
Row 20:  attack_up
Row 21:  ability_up
Row 22:  hit_up
Row 23:  death_up
```

## CHARACTER — Threadling (COMPUTE class)

Match the THREADLING character from the System Breach style board (Image A,
the green/cyan compute-class agent in the AGENT SAMPLES grid).

- Class: COMPUTE — burst damage, surgical strike fantasy.
- Silhouette: small, angular, fast-looking. Triangular head/hood.
- Inside the 22×33 logical cell: roughly 18 px wide × 28 px tall body.
- Hood with a single horizontal **cyan visor slit** (no eyes, no mouth).
- Slim shoulders pushed slightly forward.
- Arms end in cyan light-blade emitters. Right hand carries a 1-px-wide
  cyan "data-blade" extending 4 px from the fist.
- Slim legs with a slight gap between them.
- Glow accents on visor, blade, and faint chest core.

## STYLE LOCK

- **Pixel art only.** Nearest-neighbor scaling. NO anti-aliasing on the
  outline. NO painterly rendering. NO 3D shading.
- Sprite is authored at 22×33 logical and rendered at 2× = 44×66 in the
  cell. The 44×66 cell is what appears on the sheet.
- **Outline color:** `#0a0d18` (dark indigo, NOT pure black). One outline
  pass. Never double-outlined.
- **Light source:** top-left, ~30°.
- **Max 5–7 colors** per sprite including outline + highlights.

## PALETTE (use these exact hex values)

| Use | Hex |
|---|---|
| Outline | `#0a0d18` |
| Body fill (dark) | `#141a2e` |
| Body fill (mid) | `#1f2745` |
| Cyan accent (visor, blade, chest core) | `#3df7ff` |
| Cyan highlight (1-px bloom on glow) | `#a0fbff` |
| Hit-flash (1-frame overlay only) | `#ffb3c1` |

No colors outside this list.

## ANIMATION BEHAVIORS

- **idle (4 frames):** subtle 1-px shoulder rise on f1–f2, settle on f3–f4.
  Visor glow pulses brighter on f2.
- **walk (6 frames):** 1–2 px vertical float cycle. Minimal leg swing — not
  cartoony. Faint cyan bloom under feet on f2 and f5.
- **attack (6 frames):** f1 anticipation (pull back 1–2 px). f2–f3 strike
  (snap forward 2–3 px) with a 1-px neon arc trail behind the blade.
  f4–f6 recovery to idle pose.
- **ability "BURST STRIKE" (8 frames):** f1–f3 charge cyan light at the
  blade (light grows). f4–f6 slash forward with 2-frame neon arc smear.
  f7 hold peak. f8 settle.
- **hit (2 frames):** f1 shake left 1 px, palette swap to hit-flash pink.
  f2 shake right 1 px, restore palette.
- **death (6 frames):** f1 hit pose. f2–f3 keel forward. f4 collapse to
  knees. f5 top-down pixel dissolution starts. f6 only outline + faint
  glow remains.

The 4 directions (down/left/right/up) flip the silhouette accordingly:
left and right are the same art mirrored. Up shows the back of the hood.
Down shows the visor head-on.

## DO NOT

- ❌ Output a reference board, label panel, mockup, palette swatch row,
  or any image other than the sprite sheet itself.
- ❌ Add labels, text, watermarks, frame numbers, or annotations.
- ❌ Use diagonal anti-aliased lines. Use proper pixel staircases.
- ❌ Use colors outside the palette.
- ❌ Render the character in a "scene" — they are isolated on transparent
  background, frame after frame.
- ❌ Vary frame size — every cell on the sheet is exactly 44×66 px.
- ❌ Put multiple directions in the same row. Each row = one animation for
  one direction. Columns = frames. Never use columns as direction slots.
- ❌ Label columns "DOWN LEFT RIGHT UP". That means you got the layout
  backwards — restart with the row table above.
- ❌ Use an opaque or white background. The PNG must have true alpha
  transparency. Verify the output in a viewer that shows a checkerboard
  for transparent pixels.

## OUTPUT REQUIREMENT (repeat)

A single 392 × 1688 px PNG with transparent background, containing the
24-row × 8-col grid described above. Nothing else.

## After saving the PNG

Save the file to `assets/agents/spritesheets/threadling.png`, then run:

```sh
node tools/gen-manifests.js
```

…to auto-generate `threadling.json` next to it. Do not write the JSON
yourself — the script handles it deterministically.
