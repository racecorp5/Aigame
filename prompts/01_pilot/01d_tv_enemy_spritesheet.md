# TV Enemy — Battle Sprite Sheet (Static Wastes / World 1)

> **Drag this file + Image A (System Breach style board) into your generator.**
> The TV enemy is shown in the ENEMY SAMPLES (WORLDS) panel of Image A,
> top-left tile labeled "(1) Static Wastes".

---

## ⚠ READ FIRST — output discipline

You are producing **ONE PNG FILE.** It is a game-engine enemy sprite sheet
that the engine loads and animates. It is NOT a reference board, mockup,
or character study.

Output is a transparent-background PNG with a strict grid of identically-
sized animation frames and nothing else.

## SAVE TO

`assets/enemies/spritesheets/tv.png`

## EXACT OUTPUT DIMENSIONS

**388 × 358 pixels.** Transparent background.

## SHEET LAYOUT

5 rows × 8 columns. Each cell is **44 × 66 pixels.**
4 px gutter between cells. 4 px outer margin.

Single facing only — the TV faces **LEFT** (toward the player squad on the
right of the battle scene). All frames show the enemy from this angle.

```
Row 0:  idle    (frames 0–3 used,  cells 4–7 transparent)
Row 1:  attack  (frames 0–5 used,  cells 6–7 transparent)
Row 2:  cast    (frames 0–5 used,  cells 6–7 transparent)
Row 3:  hit     (frames 0–1 used,  cells 2–7 transparent)
Row 4:  death   (frames 0–5 used,  cells 6–7 transparent)
```

Empty cells are fully transparent.

## CHARACTER — The TV (Static Wastes boss)

A hostile cathode-ray-tube television, hovering 2 px above the ground.

- Boxy CRT silhouette filling most of the 22×33 logical cell, ~20 px wide
  × 22 px tall (small antenna up top brings it to 28 px tall).
- **Casing:** dark grey-blue `#1f2745` with `#0a0d18` outline.
- **Screen:** centered rectangle, ~14 × 10 px, showing flickering static
  noise. Two glowing **red pixel slits** (`#ff4d4d`) as menacing eyes.
- **Antenna:** thin V-shape antenna on top, 2 prongs, dark with red tips.
- **Two stubby legs** (or feet) below the casing, 2 px tall each.
- The TV faces LEFT — viewers see the front of the screen and a sliver of
  the casing on the right side.

## ANIMATION BEHAVIORS

- **idle (4 frames):** TV bobs 1 px up/down. Static noise pattern shifts
  between frames. Red eye slits pulse brighter on f2.
- **attack (6 frames):** f1 builds up (eyes brighten, antenna tense).
  f2–f3 a quick electrical lash extends from the screen toward the left.
  f4–f6 retract to idle pose.
- **cast "SIGNAL BURST" (6 frames):** f1–f2 screen builds heavy static
  (white noise overlay). f3–f5 emits a red signal-cone forward (left)
  with concentric expanding rings. f6 settle.
- **hit (2 frames):** f1 antenna jolts, screen flashes hit-flash pink
  `#ffb3c1`, casing shaken 1 px right. f2 returns to base.
- **death (6 frames):** f1 hit pose. f2 screen cracks (1–2 dark cracks
  appear). f3 casing tilts. f4 casing falls 1 px. f5 screen goes black.
  f6 only outline + faint static remains, then engine fades alpha to 0.

## STYLE LOCK

- **Pixel art only.** Authored at 22×33 logical, rendered 2× to fill cell.
- **Outline color:** `#0a0d18`.
- **Light source:** top-left (a tiny lighter highlight on the casing's
  upper-left edge).
- **Max 5–7 colors** per sprite.

## PALETTE

| Use | Hex |
|---|---|
| Outline | `#0a0d18` |
| Casing dark | `#141a2e` |
| Casing mid | `#1f2745` |
| Casing highlight | `#2a3458` |
| Screen background | `#0a0d18` |
| Static noise | `#888899` (sparse white-grey pixels) |
| Red eye slits | `#ff4d4d` |
| Red glow / signal cone | `#ff8a3c` (orange) edge fades into red |
| Hit flash | `#ffb3c1` |

## DO NOT

- ❌ Output a reference board, character study, or labeled grid.
- ❌ Add labels, frame numbers, world names, or captions.
- ❌ Show the TV from any angle other than LEFT-facing.
- ❌ Render the TV as cute or friendly — it is sinister, cold, hostile.
- ❌ Use colors outside the palette.

## OUTPUT REQUIREMENT (repeat)

A single 388 × 358 px PNG with transparent background, containing the
5-row × 8-col grid described above. Nothing else.

## After saving

```sh
node tools/gen-manifests.js
```

…writes `tv.json` next to the PNG with the 5-row enemy schema.
