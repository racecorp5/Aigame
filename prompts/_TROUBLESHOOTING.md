# Troubleshooting — Asset Generation Failure Modes

When your generator returns something that isn't usable, find the symptom
below and apply the fix. **Most failures are spec mismatches, not art
quality issues.** Don't accept "close enough" — same mistake will multiply
across 500 files.

---

## Symptom: Generator returned a "reference board" / "style sheet"

You asked for a sprite sheet, you got back a dark dashboard image with
labeled panels — animation strip, palette swatches, color variants,
size reference, decals, etc. Looks impressive but **the game engine
cannot use it.**

### Why this happens

You attached the AGENT-01 sci-fi style sheet (Image B) as a reference.
General-purpose generators pattern-match heavily on attached images — they
treated Image B as the *target output* instead of as a *layout template*,
and produced a similar dashboard.

### Fix

1. **Stop attaching Image B.** Use only Image A (the System Breach style
   board) plus the text prompt. Image A is your locked aesthetic; the
   text prompt handles layout.
2. **Use the single-file micro-prompts** in `prompts/01_pilot/` instead
   of the batched `01_pilot_threadling_READY.md`. Each micro-prompt asks
   for ONE PNG of one specific size. Generators won't collapse one ask
   into a board.
3. **Front-load anti-instructions:** the micro-prompts open with "OUTPUT
   ONE PNG. NOT A REFERENCE BOARD. NOT A MOCKUP." Generators trained on
   ArtStation default to mockups unless explicitly told otherwise.

---

## Symptom: Wrong character (sci-fi soldier instead of Threadling)

You got a generic sci-fi cybernetic soldier with a rifle. Threadling is
supposed to be an angular, hooded, cyan-visored COMPUTE-class agent with
a data-blade.

### Why

Image B's AGENT-01 character contaminated the prompt. The generator
copied the character from Image B instead of describing one from the
text prompt + Image A.

### Fix

Same as above — drop Image B. The micro-prompts in `01_pilot/` describe
the character explicitly and reference the correct tile in Image A
("the cyan compute agent in the AGENT SAMPLES grid").

---

## Symptom: Wrong grid (32×32 instead of 22×33)

The output sheet is labeled "32×32" or the cells look 32×32 instead of
the 22×33 (rendered 44×66) we specified.

### Why

Image B says "32×32" prominently. The generator picked that up.

### Fix

- Drop Image B (you'll see this is a recurring theme).
- The micro-prompts repeat "22×33 base, scaled 2× to 44×66" in the style
  lock and in the layout section. If a generator still ignores it, add
  this to your prompt: *"Disregard any grid size shown in attached
  images. The grid is exactly 22×33 logical, 44×66 rendered."*

---

## Symptom: Wrong animation set (run/jump/shoot instead of attack/ability/hit)

The sheet has IDLE / WALK / RUN / JUMP / SHOOT / DIE rows.

### Why

Image B's AGENT-01 is a sci-fi action-shooter character. Our game is
turn-based — characters stand on cards and use ABILITIES. Run/Jump/Shoot
animations don't fit our gameplay.

### Fix

- The micro-prompts spec the correct anim set (idle/walk/attack/ability/
  hit/death). If a generator slips back to Image B's set, add: *"Do not
  use 'run', 'jump', or 'shoot' animations. The character is in a
  turn-based RPG and only animates idle/walk/attack/ability/hit/death."*

---

## Symptom: Wrong palette (only blue tones)

The output is all blues — `#05070F` through `#D0E6FF`. Should be a full
palette including class colors (cyan, blue, magenta, green, yellow) and
enemy reds/oranges.

### Why

Image B's palette swatch row is all blue. Generator copied it.

### Fix

- Drop Image B.
- Reinforce: *"The palette in attached image B is wrong. Use only the
  hex codes listed in the prompt's PALETTE table."*

---

## Symptom: Image is glossy / 3D-rendered / painterly, not pixel art

The output looks like a stylized illustration, soft-shaded, with smooth
gradients. Not pixel art.

### Why

Most general-purpose generators (Midjourney, DALL-E) interpret "pixel
art" loosely — they render high-res illustrations with a "pixel-like"
filter, but they're not actually drawing on a grid.

### Fix

- Use a **pixel-art-specialist tool**: PixelLab, Scenario, or Stable
  Diffusion with a pixel-art LoRA. Generic models will keep failing.
- If you must use a generic model, generate at high resolution and run
  the result through a **pixel-art downscaler** (e.g.
  `imagemagick -resize 25% -filter point` after rendering at 4× target).
  Quality will still be inferior to a specialist tool.
- Last resort: hand the spec to a human pixel artist. The spec is
  detailed enough that any pixel artist can produce it.

---

## Symptom: PNG has white background instead of transparent

You can see a white square around your sprite when you load it in-game.

### Why

The generator either ignored "transparent background" or saved as
flattened RGB.

### Fix

- Re-export from the generator with explicit alpha channel.
- Or run `magick input.png -fuzz 5% -transparent white output.png` to
  make near-white pixels transparent.
- Verify in an image viewer that shows the checkerboard for transparent
  pixels (most modern OS file previews do this).

---

## Symptom: Frame counts don't match the JSON

You generated the PNG, ran `gen-manifests.js`, but in-game some
animations cut off mid-frame or play empty cells.

### Why

The generator produced a different number of frames than the spec
(e.g. 5 walk frames instead of 6).

### Fix

- Drop a `<name>.override.json` next to the PNG with the corrected frame
  count. Example for a walk animation that came out as 5 frames:
  ```json
  {
    "animations": {
      "walk_down":  { "frames": 5 },
      "walk_left":  { "frames": 5 },
      "walk_right": { "frames": 5 },
      "walk_up":    { "frames": 5 }
    }
  }
  ```
- Re-run `gen-manifests.js --force` to regenerate JSON with the override.
- Or regenerate the PNG with a stricter prompt: *"Walk animation must be
  EXACTLY 6 frames. Do not produce 5 or 7."*

---

## Symptom: Generator output 6 separate images when you wanted 1

You used the batched `01_pilot_threadling_READY.md` and got back 6
disconnected images of various subjects in one response.

### Why

That batched prompt asks for 6 deliverables. Some generators handle
multi-output requests, but the result varies wildly by tool.

### Fix

- Use the **single-file micro-prompts** in `prompts/01_pilot/` instead.
  One prompt = one PNG = one drag-and-drop session. Predictable.

---

## Symptom: Columns labeled "DOWN LEFT RIGHT UP" — directions as columns

The generator produced 8 columns labeled DOWN / LEFT / RIGHT / UP / DOWN /
LEFT / RIGHT / UP, and rows represent individual animation frames
(IDLE row, WALK 1 row, WALK 2 row, etc.).

### Why

The generator defaulted to a common "all-directions-side-by-side" layout
used by many sprite tools. Our engine expects the opposite orientation:
rows = animation-direction combos, columns = frames of that animation.

### Fix

1. The updated `01a_threadling_spritesheet.md` now includes an explicit
   "Wrong / Correct" example at the top of the SHEET LAYOUT section.
   Re-drag the updated prompt file.
2. The key line to emphasize if it keeps failing:
   *"THE 8 COLUMNS ARE ANIMATION FRAMES — NOT DIRECTIONS. Each row is one
   animation for one facing direction. Do NOT label columns DOWN/LEFT/RIGHT/UP."*
3. If the generator still can't follow this: paste the "Wrong/Correct"
   ascii diagram from the prompt as your first message, then add the rest.

---

## When in doubt

If your generator keeps producing a ~1500×1000 dashboard image no
matter what you do, the model is the problem. Switch to:

- **PixelLab** — purpose-built for game-asset pixel art
- **Scenario** — game asset pipelines, supports custom style training
- **Stable Diffusion with a pixel-art LoRA** — local, controllable
- **A human pixel artist** — the spec is precise enough to commission

Our prompts are correct. The model interpretation is the variable.
