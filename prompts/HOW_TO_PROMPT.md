# HOW TO PROMPT — quick start

Three things to do, in order. That's it.

## 1. Pick a chunk

Open `README.md`, look at the chunk table, pick the next file you haven't
done. For your first run, it's **`01_pilot_threadling.md`** (10 files, end-to-
end validation).

## 2. Open the *_READY.md version

Every chunk file has a sibling `*_READY.md` version (e.g.
`01_pilot_threadling_READY.md`) where the shared style directive is already
inlined. **Copy the entire file's contents into your generator's text input.**
No `[paste this here]` placeholders to fix — it's one paste.

If a `*_READY.md` doesn't exist yet for a chunk, build it manually:

```
contents of _style_directive.md
+
contents of NN_chunk.md (skip the "[STYLE DIRECTIVE — paste...]" line)
```

## 3. Attach the two reference images

You have **two images**, and they play different roles. Use both.

| Image | Role | How to label it |
|-------|------|-----------------|
| **`reference/system_breach_board.png`** (the style board with our 7 classes / 19 worlds / palette) | **VISUAL STYLE TARGET** — this *is* our game's locked aesthetic. Match palette, neon discipline, silhouette quality. | Tag as: *"STYLE TARGET — match this exactly. Palette, glow, silhouettes, line discipline."* |
| **`reference/agent01_layout_template.png`** (the AGENT-01 sci-fi sheet) | **LAYOUT TEMPLATE ONLY** — shows what *kinds* of panels to include on a finished style sheet (animations row, poses, palette swatches, decals, damage states, color variants, size reference). It is NOT our game's content. | Tag as: *"LAYOUT TEMPLATE ONLY — do not copy the character or sci-fi vibe. Use this to organize your output panels: animation strip, pose strip, palette swatches, decals, damage states, variants, size reference."* |

**If your generator only accepts one image:** use Image 1 (System Breach board)
and reference Image 2 verbally inside the prompt: *"Organize the output as a
single style-sheet board with these panels: animation strip, pose strip,
palette swatches, decal samples, damage states, color variants, size
reference (16/32/48/64 px)."*

## 4. Generate, save to disk, validate

The chunk file lists every output filename and path. Save to those exact
paths under `assets/` — the engine loads by path.

After Chunk 01 finishes:

- [ ] Threadling sprite sheet renders correctly in the game
- [ ] All animations play (idle, walk, attack, ability, hit)
- [ ] Sprite size on screen is 44×66 px
- [ ] Portrait loop has no seam
- [ ] TV enemy faces left
- [ ] BG_TV ambient loop is smooth

If any check fails, fix the prompt or the spec before moving on. **Do not
run chunks 02–24 until 01 passes** — the same spec mistake will multiply
across 500 files.

## 5. Then loop chunks 02–24

Same recipe: open `NN_*_READY.md`, copy entire file, attach both images
(same labels), save outputs to the paths the file lists, mark the chunk
done in `manifest.json`.

## Common mistakes

- ❌ Pasting the chunk file without the style directive on top → AI invents
  its own grid/palette. Always use the `*_READY.md` version, or paste the
  directive yourself.
- ❌ Using Image 2 as a *content* reference → you'll get sci-fi soldiers
  instead of System Breach IoT agents. It's a layout template only.
- ❌ Skipping the JSON manifest → engine can't load the sheet. Every
  spritesheet ships with a matching `.json` per the schema.
- ❌ Generating chunks 02+ before chunk 01 validates → you'll redo work.
- ❌ Saving outputs to the wrong path → engine 404s the asset. Paths in
  the chunk file are not suggestions.

## TL;DR

1. Open `NN_*_READY.md`, copy all of it
2. Paste into generator
3. Attach Image 1 (style target) + Image 2 (layout template)
4. Save outputs to the exact paths the file lists
5. Validate the pilot before scaling up
