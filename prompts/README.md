# SYSTEM BREACH — Asset Generation Prompts

This directory contains **ready-to-paste prompts** for generating every asset listed
in `../ASSET_INVENTORY.md`. Each prompt is self-contained: drag the file (plus
the System Breach style board image) into your generator and you get back the
art for one asset.

## ⚠ Start here

Before doing anything else, read **`_TROUBLESHOOTING.md`** — especially the
"reference board" failure mode. It's the most common way prompts get wrecked.

Then open **`01_pilot/README.md`** and run the 6 micro-prompts there in order.
Each is a single-file, single-PNG prompt. Drag the `.md` + Image A into your
generator, save the output to the path the file specifies, repeat 6 times.

## Two prompt formats

| Format | Use when |
|---|---|
| **Single-file micro-prompt** (e.g. `01_pilot/01a_threadling_spritesheet.md`) | **Recommended.** One prompt = one PNG. Predictable, drag-and-drop, anti-board instructions baked in. |
| **Batched chunk prompt** (e.g. `01_pilot_threadling.md`, `01_pilot_threadling_READY.md`) | Legacy / advanced. Asks for multiple deliverables in one go. Works only with generators that reliably handle multi-output requests. Most don't. |

If a generator returns a "reference board" instead of a usable PNG, you used
the batched format with both reference images attached. Switch to the
micro-prompts in `01_pilot/`.

## How to prompt (quick)

1. **Open** the micro-prompt file (e.g. `01_pilot/01a_threadling_spritesheet.md`).
2. **Drag it** + **Image A** (the System Breach style board) into your generator.
3. **Do NOT attach Image B** (the AGENT-01 sheet). It causes the generator to
   produce a reference board instead of the deliverable PNG.
4. **Save the output** to the path the prompt file specifies. Filenames must
   match exactly — the engine loads by path.
5. After all PNGs in a chunk are saved, run from the repo root:
   ```sh
   node tools/gen-manifests.js
   ```
   to auto-generate the matching `.json` manifests.

Full step-by-step in `HOW_TO_PROMPT.md`.

## Chunk order

| # | Status | Folder/file | Output PNGs |
|---|--------|-------------|------------:|
| **01** | ✅ ready (split into 6 micro-prompts) | `01_pilot/` (Threadling end-to-end pilot) | 6 |
| 02 | scaffolded | `02_agents_battle_part1.md` | 6 |
| 03 | scaffolded | `03_agents_battle_part2.md` | 8 |
| 04 | scaffolded | `04_subclass_variants.md`   | 28 |
| 05 | scaffolded | `05_portraits_agents.md`    | 42 |
| 06 | scaffolded | `06_portraits_npc.md`       | 4 |
| 07 | scaffolded | `07_enemies_act1.md`        | 10 |
| 08 | scaffolded | `08_enemies_act2.md`        | 10 |
| 09 | scaffolded | `09_enemies_act3.md`        | 10 |
| 10 | scaffolded | `10_enemies_act4.md`        | 8 |
| 11 | scaffolded | `11_backgrounds_act1.md`    | 10 |
| 12 | scaffolded | `12_backgrounds_act2.md`    | 10 |
| 13 | scaffolded | `13_backgrounds_act3.md`    | 10 |
| 14 | scaffolded | `14_backgrounds_act4.md`    | 8 |
| 15 | scaffolded | `15_vfx_combat.md`          | 24 |
| 16 | scaffolded | `16_vfx_status_abilities.md` | 34 |
| 17 | scaffolded | `17_icons_class_subclass.md` | 21 |
| 18 | scaffolded | `18_icons_items.md`         | 24 |
| 19 | scaffolded | `19_icons_worlds_currency_status.md` | 38 |
| 20 | scaffolded | `20_icons_upgrades_achievements.md` | 66 |
| 21 | scaffolded | `21_comic_panels.md`        | 26 |
| 22 | scaffolded | `22_ui_hud_buttons.md`      | 64 |
| 23 | scaffolded | `23_ui_screens_logo_misc.md` | 30 |
| 24 | scaffolded | `24_optional_v2_extras.md`  | ~50 |

When chunk 01 validates in-engine, ping me to split chunks 02–24 into
their own micro-prompts using the same pattern.

## Where do generated files go?

Every prompt specifies the **exact destination path** under `assets/`. The
full on-disk tree is documented in `../ASSET_INVENTORY.md §12`. Don't
invent paths.

## Files in this directory

```
prompts/
├── README.md                              ← you are here
├── HOW_TO_PROMPT.md                       ← step-by-step prompting guide
├── _TROUBLESHOOTING.md                    ← read this when output is wrong
├── _style_directive.md                    ← shared style block (legacy, used by batched prompts)
├── 01_pilot/                              ← ✅ split into 6 micro-prompts
│   ├── README.md
│   ├── 01a_threadling_spritesheet.md
│   ├── 01b_threadling_portrait.md
│   ├── 01c_compute_class_icon.md
│   ├── 01d_tv_enemy_spritesheet.md
│   ├── 01e_bg_tv_static_wastes.md
│   └── 01f_bit_shard_weapon_icon.md
├── 01_pilot_threadling.md                 ← legacy batched prompt
├── 01_pilot_threadling_READY.md           ← legacy self-contained version
└── (chunks 02–24 to be split into folders when 01 validates)
```

## After 01 passes

Tell me. I'll split 02–24 into their own micro-prompt folders matching this
pattern (one PNG per file, drag-and-drop, anti-board instructions). Don't
let me split them before 01 passes — fix the spec first.


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
