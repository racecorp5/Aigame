# Threadling — Animated Portrait Sheet

> **Drag this file + Image A (System Breach style board) into your generator.**
> Do NOT attach Image B.

---

## ⚠ READ FIRST — output discipline

You are producing **ONE PNG FILE.** It is a 4-frame animated portrait strip
that the game engine plays as a looping idle animation. It is NOT a
reference board, mockup, style sheet, or labeled portfolio piece.

Output is a transparent-background PNG with 4 identical-size portrait
panels in a horizontal row. Nothing else on the canvas.

## SAVE TO

`assets/agents/portraitsheets/threadling.png`

## EXACT OUTPUT DIMENSIONS

**820 × 208 pixels.** Transparent background outside the 4 portrait frames.

## SHEET LAYOUT

4 frames in a single horizontal row. Each frame is **200 × 200 pixels.**
4 px gutter between frames. 4 px outer margin on every side.

```
[ 4px ][ frame 1 200×200 ][ 4px ][ frame 2 200×200 ][ 4px ][ frame 3 200×200 ][ 4px ][ frame 4 200×200 ][ 4px ]
```

## SUBJECT — Threadling (COMPUTE class) chest-up portrait

- The same character as the battle sprite sheet: hooded compute agent with
  cyan visor, angular silhouette.
- Composition: chest-up, 3/4 view facing toward the viewer (slight angle).
- Hood casts shadow over upper face — only the **cyan visor slit** is
  visible. No eyes, no mouth, no facial features.
- Background inside each frame: BG dark 1 `#070912`, with a faint cyan
  circuit-trace pattern (1-px lines, very low opacity).
- Style: pixel art at portrait resolution. Crisp edges, limited palette,
  consistent with the battle sprite.

## ANIMATION ACROSS THE 4 FRAMES

The character pose is **identical** in all 4 frames. The differences are
small ambient details — the engine cycles through these to create a
"living portrait" effect.

| Frame | Difference |
|---|---|
| **1** | Base pose. Visor at standard glow. |
| **2** | Visor +20% brightness. Chest core glow pulses 1 step brighter. Same silhouette. |
| **3** | Single 1-pixel scan line crosses the visor (left → right). Visor brightness back at base. |
| **4** | Subtle 1-pixel shoulder rise (breathing). Visor returns to standard. |

The loop must be seamless — frame 4 → frame 1 should not "snap."

## STYLE LOCK

- **Pixel art only.** Crisp pixel edges, no painterly soft rendering.
- **Outline color:** `#0a0d18` (dark, not pure black).
- **Light source:** top-left, ~30°.
- **Palette:** same as the battle sprite — outline `#0a0d18`, body darks
  `#141a2e` and `#1f2745`, cyan `#3df7ff`, cyan highlight `#a0fbff`.

## DO NOT

- ❌ Render anything other than the 4 portrait panels.
- ❌ Add labels, frame numbers, captions, or callouts.
- ❌ Vary the pose between frames — only the ambient effects change.
- ❌ Make the background opaque outside the panels (must be transparent).
- ❌ Use colors outside the palette.

## OUTPUT REQUIREMENT (repeat)

A single 820 × 208 px PNG with transparent margins, containing 4 portrait
frames of 200 × 200 in a horizontal row. Nothing else.

## After saving the PNG

```sh
node tools/gen-manifests.js
```

…will write `threadling.json` next to the PNG.
