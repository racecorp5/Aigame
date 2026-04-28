# SYSTEM BREACH — Asset Generation Prompts

This directory contains **ready-to-paste prompts** for generating every asset listed
in `../ASSET_INVENTORY.md`. Each prompt is self-contained: paste it into your
generator of choice (Midjourney, Stable Diffusion, DALL·E, Sora image, an LLM
with image-generation tool use, or a human pixel artist) and you get back the
art for one chunk.

## How to use

1. **Read `_style_directive.md` first.** This is the global style block that gets
   prepended to every prompt. If you change the style direction, change it once
   here and every prompt inherits it.
2. **Pick a chunk** from the numbered list. Chunks are ordered for delivery —
   start at `01_pilot_threadling.md` and validate in-engine before moving on.
3. **Copy the *full* prompt file** (style directive + chunk-specific content)
   into your generator. Each file already includes a "PROMPT BEGINS HERE"
   marker showing what to paste.
4. **Save the output** to the path specified in the prompt's `Expected output`
   section. Filenames must match exactly — the engine loads by path.
5. **Mark progress** in `manifest.json` (`status: pending → done`) so you don't
   regenerate things twice.

## Chunk order (matches ASSET_INVENTORY.md §14 roadmap)

| # | File | Chunk | Files produced | Cumulative |
|---|------|-------|---------------:|-----------:|
| 00 | `_style_directive.md` | Shared style block (not a chunk) | 0 | 0 |
| 01 | `01_pilot_threadling.md`              | Pilot — Threadling end-to-end       | 10  | 10 |
| 02 | `02_agents_battle_part1.md`           | Battle sheets: Threadling, Patchwork, Vault | 6 | 16 |
| 03 | `03_agents_battle_part2.md`           | Battle sheets: Netrunner, Sentinel, Glitcher, Bridgelink | 8 | 24 |
| 04 | `04_subclass_variants.md`             | 14 subclass-tint sheets             | 28  | 52 |
| 05 | `05_portraits_agents.md`              | 21 animated portrait sheets         | 42  | 94 |
| 06 | `06_portraits_npc.md`                 | NEXUS + CLOUD portrait sheets       | 4   | 98 |
| 07 | `07_enemies_act1.md`                  | Enemies E01–E05 (TV, Phone, Speaker, Watch, Console) | 10 | 108 |
| 08 | `08_enemies_act2.md`                  | Enemies E06–E10 (Fridge, Microwave, Printer, Hub, SecCam) | 10 | 118 |
| 09 | `09_enemies_act3.md`                  | Enemies E11–E15 (Router, Computer, Car, ATM, Grid) | 10 | 128 |
| 10 | `10_enemies_act4.md`                  | Enemies E16–E19 (Medical, Farm, Satellite, **Cloud**) | 8 | 136 |
| 11 | `11_backgrounds_act1.md`              | Backgrounds BG01–BG05               | 10  | 146 |
| 12 | `12_backgrounds_act2.md`              | Backgrounds BG06–BG10               | 10  | 156 |
| 13 | `13_backgrounds_act3.md`              | Backgrounds BG11–BG15               | 10  | 166 |
| 14 | `14_backgrounds_act4.md`              | Backgrounds BG16–BG19               | 8   | 174 |
| 15 | `15_vfx_combat.md`                    | Combat impact VFX (12 sheets)       | 24  | 198 |
| 16 | `16_vfx_status_abilities.md`          | Status overlays + ability VFX       | 34  | 232 |
| 17 | `17_icons_class_subclass.md`          | Class + subclass icons              | 21  | 253 |
| 18 | `18_icons_items.md`                   | Weapons, armor, consumables (24)    | 24  | 277 |
| 19 | `19_icons_worlds_currency_status.md`  | Map nodes, currency, status chips   | 38  | 315 |
| 20 | `20_icons_upgrades_achievements.md`   | Upgrades (22) + achievements (44)   | 66  | 381 |
| 21 | `21_comic_panels.md`                  | 22 comic panels + chrome            | 26  | 407 |
| 22 | `22_ui_hud_buttons.md`                | HUD, buttons, panels                | 64  | 471 |
| 23 | `23_ui_screens_logo_misc.md`          | Logo, screen backgrounds, map, loading, cues | 30 | 501 |
| 24 | `24_optional_v2_extras.md`            | Mini-boss palette shifts, idle UP/DOWN | ~50 | ~551 |

**Estimated total deliverable files: ~501** (matches the ~544 figure in
ASSET_INVENTORY.md after counting JSON manifests; the difference is double-counted
multi-state buttons in v1 vs v2).

## Where to put generated files

Every prompt specifies the **exact destination path** under `assets/`. The full
on-disk tree is documented in `../ASSET_INVENTORY.md §12`. Don't invent paths.

## Sanity gates between chunks

After each chunk:
- Open the PNG at native size, confirm pixel-perfect (no anti-aliasing artifacts).
- Load the JSON in the engine, confirm frame count and FPS feel right.
- For sheets with multiple animations, scrub through every animation row.
- For tinted variants, spot-check the palette swap didn't blow out the outline.

## If a generator can't do pixel art reliably

Most diffusion models struggle with **strict pixel-art grids**. If that happens:
- Generate at the high-res reference scale (e.g., 4× the target) and downscale
  with nearest-neighbor in a dedicated pixel-art tool.
- Or use a pixel-art-specialist model (e.g., PixelLab, Aseprite + manual cleanup).
- The prompt's `Style fallback` section in each chunk file lists what's
  acceptable to compromise on (silhouette > color count > exact frame count).

## Files in this directory

```
prompts/
├── README.md                        ← you are here
├── _style_directive.md              ← shared style block, prepend to every prompt
├── manifest.json                    ← machine-readable index, track progress here
├── 01_pilot_threadling.md
├── 02_agents_battle_part1.md
├── 03_agents_battle_part2.md
├── 04_subclass_variants.md
├── 05_portraits_agents.md
├── 06_portraits_npc.md
├── 07_enemies_act1.md
├── 08_enemies_act2.md
├── 09_enemies_act3.md
├── 10_enemies_act4.md
├── 11_backgrounds_act1.md
├── 12_backgrounds_act2.md
├── 13_backgrounds_act3.md
├── 14_backgrounds_act4.md
├── 15_vfx_combat.md
├── 16_vfx_status_abilities.md
├── 17_icons_class_subclass.md
├── 18_icons_items.md
├── 19_icons_worlds_currency_status.md
├── 20_icons_upgrades_achievements.md
├── 21_comic_panels.md
├── 22_ui_hud_buttons.md
├── 23_ui_screens_logo_misc.md
└── 24_optional_v2_extras.md
```

— See `../DESIGN.md` for game systems, `../ASSET_INVENTORY.md` for the
deliverable spec these prompts produce. —
