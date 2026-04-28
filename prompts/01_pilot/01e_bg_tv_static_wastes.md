# Static Wastes — Animated Battle Background (TV / World 1)

> **Drag this file + Image A (System Breach style board) into your generator.**
> The Static Wastes background is shown in the WORLD BACKGROUND SAMPLES
> panel of Image A, tile labeled "1. Static Wastes (TV)".

---

## ⚠ READ FIRST — output discipline

You are producing **ONE PNG FILE.** It is a 4-frame animated battle
background that the engine plays as a slow ambient loop behind the enemy.
It is NOT a reference board, layout mockup, or art portfolio piece.

Output is a single PNG with 4 sequential 960×640 background frames laid
out horizontally. The frames depict the same scene with subtle ambient
animation between them.

## SAVE TO

`assets/backgrounds/sheets/bg_tv.png`

## EXACT OUTPUT DIMENSIONS

**3,860 × 648 pixels.**

Layout: 4 frames in a horizontal row. Each frame is **960 × 640 pixels.**
4 px gutter between frames. 4 px outer margin.

```
[ 4px ][ frame 1 960×640 ][ 4px ][ frame 2 960×640 ][ 4px ][ frame 3 960×640 ][ 4px ][ frame 4 960×640 ][ 4px ]
```

Background **inside each frame is opaque** (it's a backdrop, not a sprite
overlay). Margin between frames is transparent.

## SCENE — Static Wastes (a darkened, abandoned living room)

Match the visual direction of the "Static Wastes (TV)" tile in Image A's
WORLD BACKGROUND SAMPLES panel.

- **Mood:** dark, abandoned, only TV-glow lighting the room.
- **Foreground silhouettes (low-detail, dark):**
  - Slumped couch on the left, partially visible.
  - Dead potted plant on the right.
- **Center back wall:** a stack of dead TV sets and CRT monitors, 6–8
  units in a rough pyramid. Most are dark; 2–3 flicker low static.
- **Floor:** hinted by 2 horizontal `#1f2745` lines suggesting parquet.
- **Ambient lighting:** TV-glow only. Casts faint cyan-grey light onto
  the couch and floor in front of the central TV stack.
- Heavy shadow elsewhere — palette restricted to the four BG-darks plus
  enemy-red pinpricks where eyes/screens flicker.

## ANIMATION ACROSS THE 4 FRAMES

The scene composition is identical across all 4 frames. Only the TV
flicker pattern changes. The loop plays at ~4 fps (slow, ambient).

| Frame | Difference |
|---|---|
| **1** | Base scene. Two TVs in the stack are lit (one center, one upper-right). Static noise visible on lit screens. |
| **2** | Center TV flickers off. Lower-left TV ignites. Floor glow shifts left subtly. |
| **3** | All currently-lit TVs show a different static-noise pattern (same brightness as f1). Floor glow is back at base. |
| **4** | A 1-pixel horizontal scan-line drifts across one of the lit screens. |

The transition from f4 → f1 must be seamless — the engine loops
indefinitely.

## STYLE LOCK

- **Low-detail, atmospheric pixel art.** This is a backdrop — sprites
  will be rendered on top of it, so the background must NEVER compete
  for attention.
- **Outline color (used sparingly for foreground silhouettes):** `#0a0d18`.
- **Avoid bright accents** anywhere except the lit TV screens. Keep the
  dynamic range narrow and dark.
- **Resolution feel:** roughly 4–6 px chunky pixels (the background can
  be slightly chunkier than character sprites for atmosphere).

## PALETTE (restricted)

| Use | Hex |
|---|---|
| BG dark 1 (deepest shadow) | `#070912` |
| BG dark 2 (outline / silhouettes) | `#0a0d18` |
| BG dark 3 (mid background) | `#141a2e` |
| BG dark 4 (light-touched surfaces) | `#1f2745` |
| TV static noise (sparse) | `#888899` |
| TV screen glow | `#3df7ff` (very faint, low intensity) |
| Red flicker / eye pinprick | `#ff4d4d` |

## DO NOT

- ❌ Add labels, frame numbers, world names, or captions.
- ❌ Place sprites or characters in the scene — this is a clean backdrop.
- ❌ Use a bright/vibrant palette — this is a moody, almost-monochrome
  scene with TV-glow as the only color source.
- ❌ Add film grain, lens flare, or photographic post-processing — pixel
  art only.
- ❌ Drift the camera between frames — the scene is locked, only ambient
  details change.

## OUTPUT REQUIREMENT (repeat)

A single 3860 × 648 px PNG containing 4 frames of 960 × 640 in a
horizontal row, transparent margins between frames, opaque scene inside
each frame.

## After saving

```sh
node tools/gen-manifests.js
```

…writes `bg_tv.json` next to the PNG.
