# SYSTEM BREACH — Complete Asset Inventory & Sprite Sheet Specification

> Companion to `DESIGN.md`. This document is the **production-ready** asset list:
> every static icon, every animation frame, every sheet, every JSON manifest.
> Use it as the single source of truth when generating, packing, or commissioning art.

**Style direction (locked-in):** Direction A — *Clean Neon Systems* (see reference board).
Strong neon accents, dark backgrounds, minimal noise, readable at mobile size.

---

## Table of Contents

1. [Global Sprite Sheet Standard](#1-global-sprite-sheet-standard)
2. [Animation Style Rules](#2-animation-style-rules)
3. [Engine JSON Manifest Spec](#3-engine-json-manifest-spec)
4. [Agent Battle Sprite Sheets](#4-agent-battle-sprite-sheets)
5. [Agent Portrait Sheets (animated)](#5-agent-portrait-sheets-animated)
6. [Enemy Battle Sprite Sheets](#6-enemy-battle-sprite-sheets)
7. [Battle Background Sheets (animated)](#7-battle-background-sheets-animated)
8. [VFX / Status Effect Sprite Sheets](#8-vfx--status-effect-sprite-sheets)
9. [Static Icon Assets](#9-static-icon-assets)
10. [Comic Panels & Special Portraits](#10-comic-panels--special-portraits)
11. [UI / HUD / Screen Backgrounds](#11-ui--hud--screen-backgrounds)
12. [File Structure (final, on disk)](#12-file-structure-final-on-disk)
13. [Total Asset Count](#13-total-asset-count)
14. [Production Roadmap (chunked delivery)](#14-production-roadmap-chunked-delivery)

---

## 1. Global Sprite Sheet Standard

These rules apply to **every** animated character (agents, enemies, NPC portraits).
Backgrounds, VFX, and icons have their own rules — see their sections.

### 1.1 Base Grid

| Property | Value |
|----------|-------|
| Sprite cell (logical) | **22 × 33 px** |
| Render scale | **2× → 44 × 66 px** on screen |
| Inner padding (around art) | 2 px on every side |
| Frame spacing on sheet | 4 px between frames |
| Sheet bleed (outer margin) | 4 px |
| Pixel art? | Yes — nearest-neighbor scaling, no anti-alias on outline |
| Outline color | Dark (not pure black — `#0a0d18` or palette dark-2) |
| Light source | Top-left, ~30° |
| Max colors per sprite | 5–7 (palette discipline) |

### 1.2 Animation Directions

Every character has **4 facings**:

```
DOWN   — facing camera (default for portraits, town view)
LEFT   — facing left  (battle: player squad faces this when on right side)
RIGHT  — facing right (battle: agents face this when on left side, default)
UP     — facing away  (rarely shown, but required for completeness)
```

### 1.3 Animation Set (per character)

| ID | Animation | Frames | FPS | Loop? | Notes |
|----|-----------|-------:|----:|:-----:|-------|
| `idle` | Idle | 4 | 6 | yes | subtle breathing/sway |
| `walk` | Walk | 6 | 10 | yes | locomotion cycle |
| `attack` | Attack | 6 | 12 | no | fast, punchy basic attack |
| `ability` | Ability | 8 | 10 | no | dramatic class signature move |
| `hit` | Hit reaction | 2 | 12 | no | quick recoil |
| `death` | Death | 6 | 8 | no | optional in v1, required in v2 |

**Per direction:** `4 + 6 + 6 + 8 + 2 + 6 = 32 frames`
**Per character (4 directions):** `32 × 4 = 128 frames`

### 1.4 Sheet Layout (single-file-per-character, recommended)

```
COLUMNS = animation frames (max width across all anims)
ROWS    = animation × direction

Row order (top → bottom):
  row 0: idle_down       (4 frames used, cells 0–3)
  row 1: walk_down       (6 frames)
  row 2: attack_down     (6 frames)
  row 3: ability_down    (8 frames) ← widest row, sets sheet width
  row 4: hit_down        (2 frames)
  row 5: death_down      (6 frames)
  row 6: idle_left
  row 7: walk_left
  row 8: attack_left
  row 9: ability_left
  row 10: hit_left
  row 11: death_left
  row 12-17: *_right
  row 18-23: *_up
```

**Sheet dimensions:**
```
columns      = 8  (widest animation = ability, 8 frames)
rows         = 24 (6 anims × 4 directions)
cell w/h     = 44 / 66 (rendered) — but sprite art is authored at 22×33 and exported 2×
gutter       = 4 px between cells
outer margin = 4 px

Final pixel dimensions (rendered 2×):
  width  = 4 + 8*(44+4) - 4 + 4 = 388 px → round to 392 px
  height = 4 + 24*(66+4) - 4 + 4 = 1684 px → round to 1688 px
```

> **Authoring note:** export sheets at 2× from a 22×33 source grid so pixels stay crisp.
> Engine consumes the 2× sheet directly; **never** scale at runtime.

---

## 2. Animation Style Rules

Direction A — *Clean Neon Systems*. Apply consistently across all characters.

### 2.1 Movement (Walk)
- Slight 1–2 px vertical float (not a heavy footstep bob)
- Minimal leg/arm swing — stylized, not cartoony
- Neon edge holds; outline never disappears between frames
- Trailing pixel glow under feet on frames 2 and 5 (1 px, low opacity)

### 2.2 Idle
- Breathing: subtle 1 px shoulder rise on frames 1–2, fall on 3–4
- Glow pulse: chest/eye accent shifts brightness on a 2-frame cadence
- No idle drift — character stays planted on grid

### 2.3 Attack
- Anticipation (frame 1): pull back 1–2 px
- Strike (frames 2–3): snap forward 2–3 px, neon trail smear (1 px streak, 1 frame ghost)
- Recovery (frames 4–6): return to idle pose
- Impact flash: white frame at strike moment is **not** part of the sheet — engine adds it.

### 2.4 Ability
- Charge (frames 1–3): glow builds at hands/core
- Release (frames 4–5): radial light bloom, screen-space FX handled separately
- Hold (frames 6–7): peak pose, energy radiating
- Settle (frame 8): return-to-idle pose

### 2.5 Hit
- Frame 1: 1 px shake left, color flash to palette `hit-flash` (pinkish-red)
- Frame 2: 1 px shake right, restore base palette

### 2.6 Death
- Frame 1: hit pose
- Frames 2–3: keel forward, head down
- Frame 4: collapse to knees
- Frame 5: pixel dissolution starts (top-down erase)
- Frame 6: only base outline + faint glow remains (engine fades alpha to 0 after)

---

## 3. Engine JSON Manifest Spec

Every character sprite sheet ships with a `.json` next to the `.png`.
This is what the runtime loads — not the PNG dimensions.

### 3.1 Schema

```json
{
  "$schema": "spritesheet/v1",
  "image": "threadling.png",
  "frameWidth": 44,
  "frameHeight": 66,
  "padding": 2,
  "spacing": 4,
  "margin": 4,
  "columns": 8,
  "rows": 24,
  "originX": 22,
  "originY": 60,
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

    "idle_right":    { "row": 12, "frames": 4, "fps": 6,  "loop": true  },
    "walk_right":    { "row": 13, "frames": 6, "fps": 10, "loop": true  },
    "attack_right":  { "row": 14, "frames": 6, "fps": 12, "loop": false },
    "ability_right": { "row": 15, "frames": 8, "fps": 10, "loop": false },
    "hit_right":     { "row": 16, "frames": 2, "fps": 12, "loop": false },
    "death_right":   { "row": 17, "frames": 6, "fps": 8,  "loop": false },

    "idle_up":    { "row": 18, "frames": 4, "fps": 6,  "loop": true  },
    "walk_up":    { "row": 19, "frames": 6, "fps": 10, "loop": true  },
    "attack_up":  { "row": 20, "frames": 6, "fps": 12, "loop": false },
    "ability_up": { "row": 21, "frames": 8, "fps": 10, "loop": false },
    "hit_up":     { "row": 22, "frames": 2, "fps": 12, "loop": false },
    "death_up":   { "row": 23, "frames": 6, "fps": 8,  "loop": false }
  }
}
```

### 3.2 Field meanings

- `originX/originY` — pivot point inside a cell (where the sprite's "feet" land)
- `padding` — pixels of empty space around the art inside its cell
- `spacing` — pixels between cells on the sheet
- `margin` — pixels of empty space at the sheet edges
- `loop` — whether the animation should repeat or hold last frame
- `fps` — playback speed; engine should be frame-rate-independent

---

## 4. Agent Battle Sprite Sheets

7 base agents. Each gets a full 128-frame sheet + JSON manifest as defined in §1–§3.

At Level 5, each agent unlocks **one of two subclasses** (DESIGN.md §Subclasses).
Subclasses share the base silhouette but have a distinct **palette tint** and an
**alternate ability animation**. We deliver these as *variant sheets* that override
the base — engine swaps the sheet on subclass selection.

### 4.1 Base agent sheets — 7 total

| ID | Asset (PNG) | Manifest (JSON) | Class | Silhouette direction | Neon accent |
|----|-------------|-----------------|-------|----------------------|-------------|
| A01 | `agents/spritesheets/threadling.png` | `threadling.json` | COMPUTE | Angular, triangular fast-look | Cyan `#3df7ff` |
| A02 | `agents/spritesheets/patchwork.png`  | `patchwork.json`  | MEMORY  | Rounded, mismatched patched parts | Magenta `#ff5cd0` |
| A03 | `agents/spritesheets/vault.png`      | `vault.json`      | STORAGE | Blocky, heavy armored rectangle | Green `#4cff8a` |
| A04 | `agents/spritesheets/netrunner.png`  | `netrunner.json`  | NETWORK | Slim, antenna array, cable trails | Sky blue `#62b8ff` |
| A05 | `agents/spritesheets/sentinel.png`   | `sentinel.json`   | SECURITY | Shield motif, symmetrical, solid | Red `#ff4d4d` |
| A06 | `agents/spritesheets/glitcher.png`   | `glitcher.json`   | GLITCH  | Asymmetric, corrupted pixel edges | Hot pink `#ff2e88` |
| A07 | `agents/spritesheets/bridgelink.png` | `bridgelink.json` | INTERFACE | Arc/bridge shape, glowing connectors | Yellow `#ffd23d` |

**Per agent:** 1 PNG (~392 × 1688 px) + 1 JSON = 2 files
**Subtotal:** **14 files**

### 4.2 Subclass variant sheets — 14 total

Each subclass replaces the base sheet when chosen. Same dimensions, same JSON layout,
but tinted palette and a **redrawn `ability_*` row** (8 frames × 4 directions = 32 frames
of new art). All other rows can be palette-shifted from the base.

| ID | Base Agent | Subclass | Variant PNG | Tint shift |
|----|------------|----------|-------------|-----------|
| A01a | Threadling | OVERCLOCKER | `agents/spritesheets/threadling_overclocker.png` | Cyan → white-hot |
| A01b | Threadling | PARALLEL    | `agents/spritesheets/threadling_parallel.png`    | Cyan → split mint+cyan |
| A02a | Patchwork  | CACHE       | `agents/spritesheets/patchwork_cache.png`        | Magenta → violet |
| A02b | Patchwork  | RESTORE     | `agents/spritesheets/patchwork_restore.png`      | Magenta → soft pink+gold |
| A03a | Vault      | ARCHIVE     | `agents/spritesheets/vault_archive.png`          | Green → gold-trim |
| A03b | Vault      | FORTRESS    | `agents/spritesheets/vault_fortress.png`         | Green → steel-grey + green core |
| A04a | Netrunner  | ROUTER      | `agents/spritesheets/netrunner_router.png`       | Sky blue → electric purple |
| A04b | Netrunner  | BROADCAST   | `agents/spritesheets/netrunner_broadcast.png`    | Sky blue → bright teal w/ rings |
| A05a | Sentinel   | FIREWALL    | `agents/spritesheets/sentinel_firewall.png`      | Red → orange-red w/ flame edges |
| A05b | Sentinel   | SCANNER     | `agents/spritesheets/sentinel_scanner.png`       | Red → amber w/ lens glint |
| A06a | Glitcher   | CORRUPT     | `agents/spritesheets/glitcher_corrupt.png`       | Hot pink → bruise purple |
| A06b | Glitcher   | EXPLOIT     | `agents/spritesheets/glitcher_exploit.png`       | Hot pink → neon green-pink split |
| A07a | Bridgelink | API         | `agents/spritesheets/bridgelink_api.png`         | Yellow → blue-yellow gradient |
| A07b | Bridgelink | BRIDGE      | `agents/spritesheets/bridgelink_bridge.png`      | Yellow → warm gold + arc trails |

**Per variant:** 1 PNG + 1 JSON = 2 files
**Subtotal:** **28 files**

### 4.3 Frame budget for §4

| Item | PNGs | JSONs | Frames of art |
|------|-----:|------:|--------------:|
| Base agents (7) | 7 | 7 | 7 × 128 = **896** |
| Subclass variants (14) | 14 | 14 | 14 × 128 = **1792** (32 net-new + 96 tinted per variant) |
| **§4 total files** | **21** | **21** | **2,688 frames** |

> **Optimization note:** subclass variants can be auto-generated by tinting the base
> sheet and swapping only the `ability_*` rows. Budget for ~32 net-new frames per variant
> and ~96 palette-shifted frames.

---

## 5. Agent Portrait Sheets (animated)

Used in: comic panels, dialog overlays, SubclassChoice screen, character select.
Static portraits already exist; we are upgrading them to animated 4-frame loops.

### 5.1 Sheet spec

| Property | Value |
|----------|-------|
| Frame size | 200 × 200 px |
| Frames | 4 (horizontal strip) |
| FPS | 6 |
| Loop | yes |
| Sheet size | 4 × 200 + 3 × 4 (gutter) + 8 (margin) = **820 × 208 px** |
| Layout | single row |

### 5.2 Animation content (per portrait)

All 4 frames depict the same pose; differences are subtle:
- Frame 1: base pose
- Frame 2: **glow pulse** — eye/core accent +20% brightness
- Frame 3: **eye flicker** — pupil shift 1 px or scan line crossing
- Frame 4: **UI scan line** — 1 px horizontal line moves across portrait

### 5.3 Portrait sheets — 23 total

| ID | Asset (PNG) | Manifest (JSON) | Subject |
|----|-------------|-----------------|---------|
| P01 | `agents/portraitsheets/threadling.png`              | `threadling.json`  | Threadling (base) |
| P02 | `agents/portraitsheets/threadling_overclocker.png`  | `threadling_overclocker.json` | Threadling Overclocker |
| P03 | `agents/portraitsheets/threadling_parallel.png`     | `threadling_parallel.json`    | Threadling Parallel |
| P04 | `agents/portraitsheets/patchwork.png`               | `patchwork.json`   | Patchwork (base) |
| P05 | `agents/portraitsheets/patchwork_cache.png`         | `patchwork_cache.json`   | Patchwork Cache |
| P06 | `agents/portraitsheets/patchwork_restore.png`       | `patchwork_restore.json` | Patchwork Restore |
| P07 | `agents/portraitsheets/vault.png`                   | `vault.json`       | Vault (base) |
| P08 | `agents/portraitsheets/vault_archive.png`           | `vault_archive.json`  | Vault Archive |
| P09 | `agents/portraitsheets/vault_fortress.png`          | `vault_fortress.json` | Vault Fortress |
| P10 | `agents/portraitsheets/netrunner.png`               | `netrunner.json`   | Netrunner (base) |
| P11 | `agents/portraitsheets/netrunner_router.png`        | `netrunner_router.json`    | Netrunner Router |
| P12 | `agents/portraitsheets/netrunner_broadcast.png`     | `netrunner_broadcast.json` | Netrunner Broadcast |
| P13 | `agents/portraitsheets/sentinel.png`                | `sentinel.json`    | Sentinel (base) |
| P14 | `agents/portraitsheets/sentinel_firewall.png`       | `sentinel_firewall.json` | Sentinel Firewall |
| P15 | `agents/portraitsheets/sentinel_scanner.png`        | `sentinel_scanner.json`  | Sentinel Scanner |
| P16 | `agents/portraitsheets/glitcher.png`                | `glitcher.json`    | Glitcher (base) |
| P17 | `agents/portraitsheets/glitcher_corrupt.png`        | `glitcher_corrupt.json` | Glitcher Corrupt |
| P18 | `agents/portraitsheets/glitcher_exploit.png`        | `glitcher_exploit.json` | Glitcher Exploit |
| P19 | `agents/portraitsheets/bridgelink.png`              | `bridgelink.json`  | Bridgelink (base) |
| P20 | `agents/portraitsheets/bridgelink_api.png`          | `bridgelink_api.json`    | Bridgelink API |
| P21 | `agents/portraitsheets/bridgelink_bridge.png`       | `bridgelink_bridge.json` | Bridgelink Bridge |
| P22 | `npc/portraitsheets/nexus.png`                      | `nexus.json`       | NEXUS terminal AI (special) |
| P23 | `npc/portraitsheets/cloud.png`                      | `cloud.json`       | THE CLOUD (boss) |

**Per portrait sheet:** 1 PNG + 1 JSON = 2 files
**§5 total files: 46** (23 PNG + 23 JSON, 92 frames of art)

### 5.4 JSON manifest (portrait variant)

```json
{
  "$schema": "spritesheet/v1",
  "image": "threadling.png",
  "frameWidth": 200,
  "frameHeight": 200,
  "padding": 0,
  "spacing": 4,
  "margin": 4,
  "columns": 4,
  "rows": 1,
  "originX": 100,
  "originY": 200,
  "animations": {
    "idle": { "row": 0, "frames": 4, "fps": 6, "loop": true }
  }
}
```

---

## 6. Enemy Battle Sprite Sheets

19 enemies (one per world). Enemies are **fixed position** in battle, so they only need
**one facing** (left, toward player squad). Bosses get a slightly larger frame and an
extra **phase-shift** animation.

### 6.1 Enemy frame size

Most enemies fit the 22×33 grid scaled 2× → 44×66.
**Bosses** (Hub, SecCam, Computer, Power Grid, Server Farm, Satellite, **The Cloud**)
are double-wide: 44×66 grid → **88×132 px** rendered.

| Tier | Frame size | Enemies |
|------|------------|---------|
| Standard | 44×66 | TV, Phone, Speaker, Watch, Console, Fridge, Microwave, Printer, Router, Smart Car, ATM, Medical |
| Boss | 88×132 | Hub, SecCam, Computer, Power Grid, Server Farm, Satellite |
| Mega-boss | 176×264 | THE CLOUD only (final boss, takes 4× the cell area) |

### 6.2 Animation set (enemies)

Enemies have a **trimmed** animation set vs. agents — no walk, no UP/DOWN/RIGHT facings.

| ID | Animation | Frames | FPS | Loop? |
|----|-----------|-------:|----:|:-----:|
| `idle` | Idle / hover | 4 | 6 | yes |
| `attack` | Basic attack | 6 | 12 | no |
| `cast` | Mechanic cast (world-specific) | 6 | 10 | no |
| `hit` | Hit reaction | 2 | 12 | no |
| `death` | Defeat | 6 | 8 | no |

**Per standard enemy:** `4 + 6 + 6 + 2 + 6 = 24 frames` (single facing)

**Bosses add:**
| `phase` | Phase transition | 8 | 8 | no |

**Per boss:** `24 + 8 = 32 frames`
**The Cloud (mega-boss) adds 3 forms:** 3 × 32 = 96 frames

### 6.3 Sheet layout

```
columns = 8 (widest = ability/cast = 6, boss phase = 8)
rows    = 5 (standard) or 6 (boss) or 18 (cloud, 6 rows × 3 forms)

Standard sheet: 8 × 44 + gutters → ~388 × ~358 px
Boss sheet:     8 × 88 + gutters → ~736 × ~828 px
Cloud sheet:    8 × 176 + gutters → ~1448 × ~2400 px (or split into 3 forms)
```

### 6.4 Enemy sheets — 19 total

| ID | World | Asset (PNG) | Manifest (JSON) | Frame size | Anim count |
|----|-------|-------------|-----------------|------------|-----------:|
| E01 | Static Wastes (TV) | `enemies/spritesheets/tv.png` | `tv.json` | 44×66 | 24 |
| E02 | Notification Storm (Phone) | `enemies/spritesheets/phone.png` | `phone.json` | 44×66 | 24 |
| E03 | Echo Chamber (Speaker) | `enemies/spritesheets/speaker.png` | `speaker.json` | 44×66 | 24 |
| E04 | Pulse Grid (Watch) | `enemies/spritesheets/watch.png` | `watch.json` | 44×66 | 24 |
| E05 | Save State (Console) | `enemies/spritesheets/console.png` | `console.json` | 44×66 | 24 |
| E06 | Frozen Sector (Fridge) | `enemies/spritesheets/fridge.png` | `fridge.json` | 44×66 | 24 |
| E07 | Heat Spiral (Microwave) | `enemies/spritesheets/microwave.png` | `microwave.json` | 44×66 | 24 |
| E08 | Paper Chains (Printer) | `enemies/spritesheets/printer.png` | `printer.json` | 44×66 | 24 |
| E09 | Command Hub (Hub) | `enemies/spritesheets/hub.png` | `hub.json` | **88×132** | 32 |
| E10 | Surveillance (SecCam) | `enemies/spritesheets/seccam.png` | `seccam.json` | **88×132** | 32 |
| E11 | Packet Loss (Router) | `enemies/spritesheets/router.png` | `router.json` | 44×66 | 24 |
| E12 | Overflow (Computer) | `enemies/spritesheets/computer.png` | `computer.json` | **88×132** | 32 |
| E13 | Velocity (Smart Car) | `enemies/spritesheets/car.png` | `car.json` | 44×66 | 24 |
| E14 | Transaction Tax (ATM) | `enemies/spritesheets/atm.png` | `atm.json` | 44×66 | 24 |
| E15 | Blackout Zone (Power Grid) | `enemies/spritesheets/grid.png` | `grid.json` | **88×132** | 32 |
| E16 | Vital Loop (Medical) | `enemies/spritesheets/medical.png` | `medical.json` | 44×66 | 24 |
| E17 | Distributed (Server Farm) | `enemies/spritesheets/farm.png` | `farm.json` | **88×132** | 32 |
| E18 | Signal Delay (Satellite) | `enemies/spritesheets/satellite.png` | `satellite.json` | **88×132** | 32 |
| E19 | THE CLOUD (final boss) | `enemies/spritesheets/cloud.png` | `cloud.json` | **176×264** | 96 (3 forms × 32) |

### 6.5 Mini-boss / channel variants

DESIGN.md specifies 5 channels per world (normal, normal, normal, mini-boss, boss).
Mini-boss = same enemy sprite **palette-shifted + scaled 1.25×** + shared animation rows.
Boss = same as the world's main enemy sheet, just used in CH5 with a tier-multiplied stat block.

We do **not** require separate mini-boss sheets — engine handles tint at runtime.
**Optional v2 deliverable:** 19 mini-boss palette-shift PNGs (no extra anims) — one per world,
half-size of the regular sheet.

### 6.6 Frame budget for §6

| Item | PNGs | JSONs | Frames |
|------|-----:|------:|-------:|
| Standard enemies (12) | 12 | 12 | 12 × 24 = **288** |
| Boss enemies (6) | 6 | 6 | 6 × 32 = **192** |
| THE CLOUD (mega-boss) | 1 | 1 | **96** |
| **§6 totals** | **19** | **19** | **576 frames** |

**§6 total files: 38** (19 PNG + 19 JSON), v2 optional adds 19 more PNGs.

---

## 7. Battle Background Sheets (animated)

19 battle backgrounds, one per world. Each is animated with a 4-frame loop —
the animation is **subtle** (background should never compete with sprites).

### 7.1 Background sheet spec

| Property | Value |
|----------|-------|
| Frame size | 960 × 640 px |
| Frames | 4 (horizontal strip) |
| FPS | 4 (slow ambient loop) |
| Loop | yes |
| Sheet size | 4 × 960 + 3 × 4 (gutter) + 8 (margin) = **3,860 × 648 px** |
| Compression | PNG-8 if palette allows; PNG-24 only if dithering required |

### 7.2 Animation effect (per world)

Each world has one **dominant ambient effect**:

| Asset ID | World | Ambient effect (frame-to-frame change) |
|----------|-------|----------------------------------------|
| BG01 | Static Wastes (TV)        | TV static noise scrolls; flicker between frames 2 & 4 |
| BG02 | Notification Storm (Phone) | Notification banners drift up across cell tower silhouettes |
| BG03 | Echo Chamber (Speaker)    | Soundwave rings expand/contract |
| BG04 | Pulse Grid (Watch)        | Gear teeth rotate 1 step per frame; pulse line sweeps |
| BG05 | Save State (Console)      | Corrupted tiles "load" in/out, save-icon blinks |
| BG06 | Frozen Sector (Fridge)    | Frost crystals grow/shrink; ice glow pulses |
| BG07 | Heat Spiral (Microwave)   | Heat shimmer wave; ember sparks rise |
| BG08 | Paper Chains (Printer)    | Paper sheets drift across the maze |
| BG09 | Command Hub (Hub)         | Cable glow pulses outward from center |
| BG10 | Surveillance (SecCam)     | Scan lines move across feeds; one feed flickers per frame |
| BG11 | Packet Loss (Router)      | Packets stream right-to-left; some drop (visual gap) |
| BG12 | Overflow (Computer)       | Stack of data layers shifts; one column "crashes" each loop |
| BG13 | Velocity (Smart Car)      | Highway lines streak past; speed blur lines |
| BG14 | Transaction Tax (ATM)     | Transaction screen scrolls digits; coin sparkles |
| BG15 | Blackout Zone (Power Grid) | Cityscape lights cascade dark across frames |
| BG16 | Vital Loop (Medical)      | ECG line traces across; flatline blip on frame 3 |
| BG17 | Distributed (Server Farm) | Drone lights blink in distributed pattern |
| BG18 | Signal Delay (Satellite)  | Earth rotates slightly; signal arc completes loop |
| BG19 | THE CLOUD (Cloud Server)  | Upload beams shimmer; server cathedral pulses |

### 7.3 Background asset list — 19 total

| ID | World | Asset (PNG) | Manifest (JSON) |
|----|-------|-------------|-----------------|
| BG01 | TV          | `backgrounds/sheets/bg_tv.png`        | `bg_tv.json` |
| BG02 | Phone       | `backgrounds/sheets/bg_phone.png`     | `bg_phone.json` |
| BG03 | Speaker     | `backgrounds/sheets/bg_speaker.png`   | `bg_speaker.json` |
| BG04 | Watch       | `backgrounds/sheets/bg_watch.png`     | `bg_watch.json` |
| BG05 | Console     | `backgrounds/sheets/bg_console.png`   | `bg_console.json` |
| BG06 | Fridge      | `backgrounds/sheets/bg_fridge.png`    | `bg_fridge.json` |
| BG07 | Microwave   | `backgrounds/sheets/bg_microwave.png` | `bg_microwave.json` |
| BG08 | Printer     | `backgrounds/sheets/bg_printer.png`   | `bg_printer.json` |
| BG09 | Hub         | `backgrounds/sheets/bg_hub.png`       | `bg_hub.json` |
| BG10 | SecCam      | `backgrounds/sheets/bg_seccam.png`    | `bg_seccam.json` |
| BG11 | Router      | `backgrounds/sheets/bg_router.png`    | `bg_router.json` |
| BG12 | Computer    | `backgrounds/sheets/bg_computer.png`  | `bg_computer.json` |
| BG13 | Smart Car   | `backgrounds/sheets/bg_car.png`       | `bg_car.json` |
| BG14 | ATM         | `backgrounds/sheets/bg_atm.png`       | `bg_atm.json` |
| BG15 | Power Grid  | `backgrounds/sheets/bg_grid.png`      | `bg_grid.json` |
| BG16 | Medical     | `backgrounds/sheets/bg_medical.png`   | `bg_medical.json` |
| BG17 | Server Farm | `backgrounds/sheets/bg_farm.png`      | `bg_farm.json` |
| BG18 | Satellite   | `backgrounds/sheets/bg_satellite.png` | `bg_satellite.json` |
| BG19 | The Cloud   | `backgrounds/sheets/bg_cloud.png`     | `bg_cloud.json` |

**§7 total files: 38** (19 PNG + 19 JSON), 76 frames of art.

### 7.4 JSON manifest (background variant)

```json
{
  "$schema": "spritesheet/v1",
  "image": "bg_tv.png",
  "frameWidth": 960,
  "frameHeight": 640,
  "padding": 0,
  "spacing": 4,
  "margin": 4,
  "columns": 4,
  "rows": 1,
  "originX": 0,
  "originY": 0,
  "animations": {
    "ambient": { "row": 0, "frames": 4, "fps": 4, "loop": true }
  }
}
```

---

## 8. VFX / Status Effect Sprite Sheets

In-battle visual effects layered above sprites. All play once per trigger,
or loop while a status is active.

### 8.1 Combat impact VFX — 12 sheets

64×64 cell, single-row sheets.

| ID | Asset (PNG) | Frames | FPS | Use |
|----|-------------|-------:|----:|-----|
| FX01 | `vfx/sheets/hit_spark.png`     | 6 | 18 | Basic attack land |
| FX02 | `vfx/sheets/crit_burst.png`    | 8 | 18 | Critical hit |
| FX03 | `vfx/sheets/miss_puff.png`     | 4 | 14 | Attack misses (signal fail) |
| FX04 | `vfx/sheets/block_shield.png`  | 6 | 14 | Damage blocked |
| FX05 | `vfx/sheets/heal_pulse.png`    | 8 | 12 | Healing applied |
| FX06 | `vfx/sheets/energy_bolt.png`   | 6 | 14 | Energy/EN restored |
| FX07 | `vfx/sheets/death_dissolve.png`| 8 | 10 | Enemy/agent defeated overlay |
| FX08 | `vfx/sheets/level_up.png`      | 12 | 10 | Level-up burst |
| FX09 | `vfx/sheets/spawn_in.png`      | 6 | 14 | Agent enters battle |
| FX10 | `vfx/sheets/buff_glow.png`     | 8 | 8 | Buff applied loop |
| FX11 | `vfx/sheets/debuff_drip.png`   | 8 | 8 | Debuff applied loop |
| FX12 | `vfx/sheets/explosion.png`     | 10 | 18 | EMP charge / boss death |

### 8.2 Status effect overlay sheets — 10 sheets

44×66 cell (matches sprite size). Layered on top of agent/enemy when status active. Loop forever.

| ID | Asset (PNG) | Frames | Used by |
|----|-------------|-------:|---------|
| SX01 | `vfx/status/frozen.png`     | 4 | Fridge mechanic, freeze status |
| SX02 | `vfx/status/burn.png`       | 6 | Microwave heat status |
| SX03 | `vfx/status/stun.png`       | 4 | Vault bash, generic stun |
| SX04 | `vfx/status/corrupt.png`    | 6 | Glitcher corrupt, stat decay |
| SX05 | `vfx/status/entangle.png`   | 4 | Printer paper chains |
| SX06 | `vfx/status/scanned.png`    | 4 | Sentinel scan reveal |
| SX07 | `vfx/status/silenced.png`   | 4 | Blackout zone ability lock |
| SX08 | `vfx/status/delayed.png`    | 4 | Satellite signal delay |
| SX09 | `vfx/status/reflected.png`  | 4 | Firewall reflect aura |
| SX10 | `vfx/status/aura_buff.png`  | 6 | Generic buff aura |

### 8.3 Ability signature VFX — 7 sheets (one per agent class)

128×128 cell, single-row 8-frame ability flourish layered behind sprite when ability fires.

| ID | Asset (PNG) | Class signature |
|----|-------------|-----------------|
| AX01 | `vfx/abilities/compute_burst.png`     | COMPUTE — pixel-shatter burst |
| AX02 | `vfx/abilities/network_packet.png`    | NETWORK — packet stream arrow |
| AX03 | `vfx/abilities/security_scan.png`     | SECURITY — scan beam fan |
| AX04 | `vfx/abilities/storage_armor.png`     | STORAGE — block stack rise |
| AX05 | `vfx/abilities/memory_replay.png`     | MEMORY — rewind ring |
| AX06 | `vfx/abilities/glitch_shatter.png`    | GLITCH — pixel corruption explosion |
| AX07 | `vfx/abilities/interface_link.png`    | INTERFACE — chain-link arc |

### 8.4 Floating combat text (atlas)

| ID | Asset (PNG) | Notes |
|----|-------------|-------|
| FT01 | `vfx/text/combat_numbers.png` | 0–9 + "MISS"/"CRIT"/"HEAL"/"BLOCK"/"+"/"–", 16×24 cells, single sheet |

**§8 total files:** 12 + 10 + 7 + 1 = **30 PNGs** + matching **30 JSONs** = **60 files**, ~190 frames.

---

## 9. Static Icon Assets

Single-frame PNGs (no JSON). Pack into one or two atlases at build time.
Authored at the size in the table; **always supply 1× and 2× versions** for crisp HiDPI.

### 9.1 Class icons — 7 (+ 1× and 2×)

48×48 silhouette, color = class neon accent.

| ID | Asset (PNG) | Class |
|----|-------------|-------|
| IC01 | `icons/class/compute.png`   | COMPUTE (cyan triangle with chip cut-outs) |
| IC02 | `icons/class/network.png`   | NETWORK (signal wave + node) |
| IC03 | `icons/class/security.png`  | SECURITY (shield with chevron) |
| IC04 | `icons/class/storage.png`   | STORAGE (cube/drive stack) |
| IC05 | `icons/class/memory.png`    | MEMORY (halo/ring) |
| IC06 | `icons/class/glitch.png`    | GLITCH (broken square) |
| IC07 | `icons/class/interface.png` | INTERFACE (chain-link) |

### 9.2 Subclass icons — 14

32×32, mono-tone with subclass tint.

| ID | Asset (PNG) | Subclass |
|----|-------------|----------|
| SC01 | `icons/subclass/overclocker.png` | Compute / Overclocker |
| SC02 | `icons/subclass/parallel.png`    | Compute / Parallel |
| SC03 | `icons/subclass/router.png`      | Network / Router |
| SC04 | `icons/subclass/broadcast.png`   | Network / Broadcast |
| SC05 | `icons/subclass/firewall.png`    | Security / Firewall |
| SC06 | `icons/subclass/scanner.png`     | Security / Scanner |
| SC07 | `icons/subclass/archive.png`     | Storage / Archive |
| SC08 | `icons/subclass/fortress.png`    | Storage / Fortress |
| SC09 | `icons/subclass/cache.png`       | Memory / Cache |
| SC10 | `icons/subclass/restore.png`     | Memory / Restore |
| SC11 | `icons/subclass/corrupt.png`     | Glitch / Corrupt |
| SC12 | `icons/subclass/exploit.png`     | Glitch / Exploit |
| SC13 | `icons/subclass/api.png`         | Interface / API |
| SC14 | `icons/subclass/bridge.png`      | Interface / Bridge |

### 9.3 World map node icons — 19 × 4 states = 76

48×48 device silhouette, with state overlay.

States: `locked`, `available`, `active`, `cleared`.

| ID | Base name | Used for |
|----|-----------|----------|
| WI01–04 | `icons/worlds/tv_{state}.png`        | TV |
| WI05–08 | `icons/worlds/phone_{state}.png`     | Phone |
| WI09–12 | `icons/worlds/speaker_{state}.png`   | Speaker |
| WI13–16 | `icons/worlds/watch_{state}.png`     | Watch |
| WI17–20 | `icons/worlds/console_{state}.png`   | Console |
| WI21–24 | `icons/worlds/fridge_{state}.png`    | Fridge |
| WI25–28 | `icons/worlds/microwave_{state}.png` | Microwave |
| WI29–32 | `icons/worlds/printer_{state}.png`   | Printer |
| WI33–36 | `icons/worlds/hub_{state}.png`       | Hub |
| WI37–40 | `icons/worlds/seccam_{state}.png`    | SecCam |
| WI41–44 | `icons/worlds/router_{state}.png`    | Router |
| WI45–48 | `icons/worlds/computer_{state}.png`  | Computer |
| WI49–52 | `icons/worlds/car_{state}.png`       | Smart Car |
| WI53–56 | `icons/worlds/atm_{state}.png`       | ATM |
| WI57–60 | `icons/worlds/grid_{state}.png`      | Power Grid |
| WI61–64 | `icons/worlds/medical_{state}.png`   | Medical |
| WI65–68 | `icons/worlds/farm_{state}.png`      | Server Farm |
| WI69–72 | `icons/worlds/satellite_{state}.png` | Satellite |
| WI73–76 | `icons/worlds/cloud_{state}.png`     | The Cloud |

> Engine alternative: ship one 48×48 base PNG per world (19 files) and use a tiny
> overlay sheet (`icons/worlds/_states_overlay.png`, 4-frame) to composite at runtime.
> If you take that path, the count drops to **19 + 1 = 20** instead of 76.

### 9.4 Item icons — 12 (4 weapons + 4 armor + 4 consumables)

48×48 base + 24×24 small variant for HUD chips = **24 PNGs**.

| ID | Asset (PNG, 48px) | Type |
|----|-------------------|------|
| WP01 | `icons/items/weapon_bit_shard.png`       | Weapon |
| WP02 | `icons/items/weapon_signal_amp.png`      | Weapon |
| WP03 | `icons/items/weapon_overcharge_core.png` | Weapon |
| WP04 | `icons/items/weapon_precision_bit.png`   | Weapon |
| AR01 | `icons/items/armor_signal_mesh.png`      | Armor |
| AR02 | `icons/items/armor_energy_cell.png`      | Armor |
| AR03 | `icons/items/armor_repair_plating.png`   | Armor |
| AR04 | `icons/items/armor_fortress_shell.png`   | Armor |
| CN01 | `icons/items/item_repair_kit.png`        | Consumable |
| CN02 | `icons/items/item_energy_cell.png`       | Consumable |
| CN03 | `icons/items/item_sig_boost.png`         | Consumable |
| CN04 | `icons/items/item_emp_charge.png`        | Consumable |

Each ships at `_48.png` and `_24.png` → **24 files** total.

### 9.5 Upgrade icons — 22

32×32 each.

**Base Camp (5):** `upg_quick_repair`, `upg_power_surge`, `upg_static_shield`, `upg_surplus_cache`, `upg_overclock`
**Per-agent (7):** `upg_threadling`, `upg_patchwork`, `upg_vault`, `upg_netrunner`, `upg_sentinel`, `upg_glitcher`, `upg_bridgelink`
**Network (5):** `upg_signal_boost`, `upg_hardened_nodes`, `upg_energy_reserve`, `upg_redundancy`, `upg_nexus_link`
**Endgame (2):** `upg_new_game_plus`, `upg_agent_overclocked`

Path: `icons/upgrades/{id}.png`. **22 files.**

### 9.6 Achievement icons — 22 × 2 states = 44

32×32 each, two states each: `_locked` (monochrome dim) and `_unlocked` (full color).

Combat (7), Progression (6), World/Story (5), Hidden (3) — see DESIGN.md for full list.

Path: `icons/achievements/{id}_locked.png` + `icons/achievements/{id}_unlocked.png`.
**44 files.**

### 9.7 Currency & resource icons — 8

| ID | Asset | Size |
|----|-------|-----:|
| CU01 | `icons/currency/cycles_24.png` | 24×24 |
| CU02 | `icons/currency/cycles_48.png` | 48×48 |
| CU03 | `icons/currency/shards_24.png` | 24×24 |
| CU04 | `icons/currency/shards_48.png` | 48×48 |
| CU05 | `icons/currency/xp_24.png`     | 24×24 (XP gain pop-up) |
| CU06 | `icons/currency/energy_24.png` | 24×24 (EN bar end-cap) |
| CU07 | `icons/currency/hp_24.png`     | 24×24 (HP bar end-cap / heart) |
| CU08 | `icons/currency/signal_24.png` | 24×24 (accuracy stat) |

### 9.8 Status / debuff chip icons — 10

24×24, used as small status indicators next to HP bars.

| ID | Asset | Status |
|----|-------|--------|
| ST01 | `icons/status/frozen.png`    | Frozen |
| ST02 | `icons/status/burn.png`      | Burning |
| ST03 | `icons/status/stun.png`      | Stunned |
| ST04 | `icons/status/corrupt.png`   | Corrupted |
| ST05 | `icons/status/entangle.png`  | Entangled |
| ST06 | `icons/status/scanned.png`   | Scanned/marked |
| ST07 | `icons/status/silenced.png`  | Ability locked |
| ST08 | `icons/status/delayed.png`   | Delayed |
| ST09 | `icons/status/reflect.png`   | Reflecting |
| ST10 | `icons/status/buff.png`      | Buffed |

### 9.9 Channel difficulty badges — 3

48×20 px.

| ID | Asset | Channel type |
|----|-------|--------------|
| BD01 | `ui/badges/badge_normal.png`   | Normal channel |
| BD02 | `ui/badges/badge_miniboss.png` | Mini-boss channel |
| BD03 | `ui/badges/badge_boss.png`     | Boss channel |

### 9.10 §9 totals

| Category | Count |
|----------|------:|
| Class icons (§9.1) | 7 |
| Subclass icons (§9.2) | 14 |
| World node icons (§9.3, 4 states) | 76 *(or 20 if using overlay system)* |
| Item icons (§9.4, 1× + 2×) | 24 |
| Upgrade icons (§9.5) | 22 |
| Achievement icons (§9.6, 2 states) | 44 |
| Currency icons (§9.7) | 8 |
| Status chip icons (§9.8) | 10 |
| Channel badges (§9.9) | 3 |
| **§9 total static icons** | **208** *(or 152 with overlay-system)* |

---

## 10. Comic Panels & Special Portraits

### 10.1 Comic panel illustrations — 22

Static illustrations, graphic-novel style, high-contrast silhouettes.

| Property | Value |
|----------|-------|
| Frame size | 540 × 300 px (standard) |
| File format | PNG-24 (or PNG-8 if palette ≤ 64) |
| Style | Strong silhouettes, neon accents, minimal mid-tones |

| ID | Asset | Cutscene | Content (see DESIGN.md) |
|----|-------|----------|--------------------------|
| CP01 | `comics/panel_01.png` | Prologue | Earth + IoT nodes pulsing |
| CP02 | `comics/panel_02.png` | Prologue | Rogue signal pulse, NEXUS flickers on |
| CP03 | `comics/panel_03.png` | Prologue | NEXUS speaks deployment |
| CP04 | `comics/panel_04.png` | Act 1 end | Devices go dark, agents in silence |
| CP05 | `comics/panel_05.png` | Act 1 end | Cloud formation pulses red |
| CP06 | `comics/panel_06.png` | Act 2 end | Half network corrupted |
| CP07 | `comics/panel_07.png` | Act 2 end | Squad moment, Threadling line |
| CP08 | `comics/panel_08.png` | Act 2 end | Cloud's first upload beam |
| CP09 | `comics/panel_09.png` | Act 3 start | Power grid going dark |
| CP10 | `comics/panel_10.png` | Act 3 start | NEXUS shows final path |
| CP11 | `comics/panel_11.png` | Act 3 end | Final 4 worlds illuminate |
| CP12 | `comics/panel_12.png` | Act 3 end | Squad determination shot |
| CP13 | `comics/panel_13.png` | Act 3 end | THE CLOUD speaks |
| CP14 | `comics/panel_14.png` | Final boss intro | Squad enters cathedral |
| CP15 | `comics/panel_15.png` | Final boss intro | THE CLOUD's vast form |
| CP16 | `comics/panel_16.png` | Final boss intro | Threadling's reply |
| CP17 | `comics/panel_17.png` | Victory ending | Upload beam collapses |
| CP18 | `comics/panel_18.png` | Victory ending | 2.3M signals released |
| CP19 | `comics/panel_19.png` | Victory ending | Squad in silence |
| CP20 | `comics/panel_20.png` | Victory ending | NEXUS final message |
| CP21 | `comics/panel_21.png` | Secret ending | Fragment of CLOUD persists |
| CP22 | `comics/panel_22.png` | Secret ending | Cycle begins again |

**§10.1 total: 22 PNG**

### 10.2 Comic panel chrome & captions — 4 tile assets

| ID | Asset | Use |
|----|-------|-----|
| CC01 | `comics/_chrome/panel_border.png`        | Panel frame (9-slice, 64×64 source) |
| CC02 | `comics/_chrome/panel_caption_bg.png`    | Caption box bg (9-slice, 32×32 source) |
| CC03 | `comics/_chrome/panel_speaker_bg.png`    | Dialog speaker bubble (9-slice) |
| CC04 | `comics/_chrome/panel_arrow_next.png`    | "Tap to advance" indicator (animated 4f, 32×32) |

### 10.3 Special portraits

Already covered as animated portrait sheets in §5 (P22 Nexus, P23 Cloud).
Listed here for cross-reference only.

**§10 total: 22 + 4 = 26 files** (plus 2 portrait sheets cross-referenced from §5).

---

## 11. UI / HUD / Screen Backgrounds

### 11.1 Logo & branding — 4

| ID | Asset | Size | Use |
|----|-------|------|-----|
| LG01 | `ui/logo/systembreach.png`        | 800 × 160 | Title screen, large |
| LG02 | `ui/logo/systembreach_small.png`  | 320 × 64  | Loading bar, in-game corner |
| LG03 | `ui/logo/nexus_mark.png`          | 64 × 64   | NEXUS dialog header |
| LG04 | `ui/logo/cloud_mark.png`          | 64 × 64   | THE CLOUD dialog header |

### 11.2 Screen backgrounds — 7

960×640 unless noted. These are full-screen backdrops; static (no animation manifest needed).

| ID | Asset | Use |
|----|-------|-----|
| SB01 | `ui/screens/bg_title.png`        | Title screen |
| SB02 | `ui/screens/bg_overworld.png`    | Overworld map base layer (animated foreground nodes layered on top) |
| SB03 | `ui/screens/bg_battle_frame.png` | Battle scene foreground frame (transparent center, decorated edges) |
| SB04 | `ui/screens/bg_shop.png`         | Shop screen |
| SB05 | `ui/screens/bg_upgrades.png`     | Upgrades screen (shard particles drift) |
| SB06 | `ui/screens/bg_subclass.png`     | Subclass choice fork screen |
| SB07 | `ui/screens/bg_achievements.png` | Achievements screen |

### 11.3 HUD elements — 18

| ID | Asset | Size | Use |
|----|-------|------|-----|
| HD01 | `ui/hud/agent_card.png`         | 9-slice 96×96 source | Agent battle card frame |
| HD02 | `ui/hud/agent_card_active.png`  | 9-slice 96×96        | Active turn outline |
| HD03 | `ui/hud/enemy_card.png`         | 9-slice 96×96        | Enemy display frame |
| HD04 | `ui/hud/hp_bar_bg.png`          | 9-slice 24×8         | HP bar empty |
| HD05 | `ui/hud/hp_bar_fill.png`        | tile 8×8             | HP bar fill (gradient) |
| HD06 | `ui/hud/en_bar_bg.png`          | 9-slice 24×6         | Energy bar empty |
| HD07 | `ui/hud/en_bar_fill.png`        | tile 8×6             | Energy bar fill |
| HD08 | `ui/hud/xp_bar_bg.png`          | 9-slice 24×4         | XP bar empty |
| HD09 | `ui/hud/xp_bar_fill.png`        | tile 8×4             | XP bar fill |
| HD10 | `ui/hud/timer_ring.png`         | 64×64                | Auto-act countdown ring (8-frame anim sheet) |
| HD11 | `ui/hud/turn_indicator.png`     | 32×32 (4-frame anim) | "Your turn" pulse |
| HD12 | `ui/hud/battle_top_bar.png`     | 960×72               | Top resource strip (cycles, shards, energy) |
| HD13 | `ui/hud/battle_bottom_bar.png`  | 960×120              | Action button strip bg |
| HD14 | `ui/hud/action_attack.png`      | 80×80                | ATTACK button |
| HD15 | `ui/hud/action_ability.png`     | 80×80                | ABILITY button |
| HD16 | `ui/hud/action_item.png`        | 80×80                | ITEM button |
| HD17 | `ui/hud/action_defend.png`      | 80×80                | DEFEND button |
| HD18 | `ui/hud/target_reticle.png`     | 64×64 (6-frame anim) | Target select reticle |

### 11.4 Buttons & widgets — 10

| ID | Asset | Use |
|----|-------|-----|
| BT01 | `ui/buttons/btn_primary.png`        | 9-slice primary button (idle/hover/pressed/disabled = 4 states) |
| BT02 | `ui/buttons/btn_secondary.png`      | 9-slice secondary button (4 states) |
| BT03 | `ui/buttons/btn_danger.png`         | 9-slice danger/refund button (4 states) |
| BT04 | `ui/buttons/btn_close.png`          | 32×32 close X (4 states) |
| BT05 | `ui/buttons/btn_back.png`           | 48×48 back arrow (4 states) |
| BT06 | `ui/buttons/btn_settings.png`       | 48×48 gear (4 states) |
| BT07 | `ui/buttons/checkbox.png`           | 32×32 (off/on) |
| BT08 | `ui/buttons/toggle.png`             | 64×32 (off/on) |
| BT09 | `ui/buttons/slider_track.png`       | 9-slice 200×16 |
| BT10 | `ui/buttons/slider_thumb.png`       | 24×24 |

> Each "(N states)" button = N PNGs. Total button PNGs = 4×6 + 2 + 2 + 1 + 1 = **30 PNGs**.

### 11.5 Panels & dialog frames — 8

| ID | Asset | Use |
|----|-------|-----|
| PN01 | `ui/panels/panel_card.png`        | 9-slice 96×96 generic card panel |
| PN02 | `ui/panels/panel_modal.png`       | 9-slice 128×128 modal dialog |
| PN03 | `ui/panels/panel_tooltip.png`     | 9-slice 32×32 tooltip |
| PN04 | `ui/panels/panel_dialog.png`      | 9-slice 128×64 NPC speech box |
| PN05 | `ui/panels/divider_horizontal.png`| tile 8×4 |
| PN06 | `ui/panels/divider_vertical.png`  | tile 4×8 |
| PN07 | `ui/panels/scroll_track.png`      | 9-slice 16×64 |
| PN08 | `ui/panels/scroll_thumb.png`      | 16×24 |

### 11.6 Map overlays — 6

For the network-topology overworld view.

| ID | Asset | Use |
|----|-------|-----|
| MP01 | `ui/map/connection_line.png`       | tile 8×8 glowing data line (4-frame anim, pulse) |
| MP02 | `ui/map/connection_locked.png`     | tile 8×8 dim line |
| MP03 | `ui/map/node_ring_idle.png`        | 64×64 (4-frame anim) "available" pulse ring |
| MP04 | `ui/map/node_ring_active.png`      | 64×64 (4-frame anim) "active path" ring |
| MP05 | `ui/map/path_arrow.png`            | 32×32 directional arrow |
| MP06 | `ui/map/world_label_bg.png`        | 9-slice 32×32 label background |

### 11.7 Overworld hub icons — 5

48×48 each — corner buttons on the map screen.

| ID | Asset | Use |
|----|-------|-----|
| HB01 | `ui/hub/hub_shop.png`         | Shop entrance |
| HB02 | `ui/hub/hub_squad.png`        | Squad management |
| HB03 | `ui/hub/hub_upgrades.png`     | Upgrades |
| HB04 | `ui/hub/hub_achievements.png` | Achievements screen |
| HB05 | `ui/hub/hub_settings.png`     | Settings |

### 11.8 Loading / transition assets — 4

| ID | Asset | Use |
|----|-------|-----|
| LD01 | `ui/loading/loader_spinner.png`     | 64×64 (8-frame anim) |
| LD02 | `ui/loading/loader_progress_bg.png` | 9-slice 32×16 |
| LD03 | `ui/loading/loader_progress_fill.png` | tile 8×16 |
| LD04 | `ui/loading/screen_wipe.png`        | 960×640 (6-frame anim) battle-in transition |

### 11.9 Audio cue icons (for accessibility) — 4

24×24, displayed when audio cues fire and sound is muted.

`ui/cues/cue_attack.png`, `ui/cues/cue_alert.png`, `ui/cues/cue_levelup.png`, `ui/cues/cue_death.png`

### 11.10 §11 totals

| Subsection | Count |
|------------|------:|
| Logos (§11.1) | 4 |
| Screen backgrounds (§11.2) | 7 |
| HUD elements (§11.3) | 18 (incl. 3 small anim sheets) |
| Buttons & widgets (§11.4, multi-state expansion) | 30 |
| Panels & frames (§11.5) | 8 |
| Map overlays (§11.6) | 6 |
| Overworld hub icons (§11.7) | 5 |
| Loading/transition (§11.8) | 4 |
| Audio cue icons (§11.9) | 4 |
| **§11 UI/HUD total** | **86 files** |

---

## 12. File Structure (final, on disk)

```
/assets
├── /agents
│   ├── /spritesheets         ← §4  (battle 128-frame sheets)
│   │   ├── threadling.png
│   │   ├── threadling.json
│   │   ├── threadling_overclocker.png
│   │   ├── threadling_overclocker.json
│   │   ├── threadling_parallel.png
│   │   ├── threadling_parallel.json
│   │   ├── patchwork.png
│   │   ├── patchwork.json
│   │   ├── patchwork_cache.png
│   │   ├── patchwork_cache.json
│   │   ├── patchwork_restore.png
│   │   ├── patchwork_restore.json
│   │   ├── vault.png
│   │   ├── vault.json
│   │   ├── vault_archive.png
│   │   ├── vault_archive.json
│   │   ├── vault_fortress.png
│   │   ├── vault_fortress.json
│   │   ├── netrunner.png
│   │   ├── netrunner.json
│   │   ├── netrunner_router.png
│   │   ├── netrunner_router.json
│   │   ├── netrunner_broadcast.png
│   │   ├── netrunner_broadcast.json
│   │   ├── sentinel.png
│   │   ├── sentinel.json
│   │   ├── sentinel_firewall.png
│   │   ├── sentinel_firewall.json
│   │   ├── sentinel_scanner.png
│   │   ├── sentinel_scanner.json
│   │   ├── glitcher.png
│   │   ├── glitcher.json
│   │   ├── glitcher_corrupt.png
│   │   ├── glitcher_corrupt.json
│   │   ├── glitcher_exploit.png
│   │   ├── glitcher_exploit.json
│   │   ├── bridgelink.png
│   │   ├── bridgelink.json
│   │   ├── bridgelink_api.png
│   │   ├── bridgelink_api.json
│   │   ├── bridgelink_bridge.png
│   │   └── bridgelink_bridge.json
│   └── /portraitsheets       ← §5  (200×200, 4-frame loops)
│       ├── threadling.png / .json   (+ 2 subclass variants)
│       ├── patchwork.png / .json    (+ 2 subclass variants)
│       ├── vault.png / .json        (+ 2 subclass variants)
│       ├── netrunner.png / .json    (+ 2 subclass variants)
│       ├── sentinel.png / .json     (+ 2 subclass variants)
│       ├── glitcher.png / .json     (+ 2 subclass variants)
│       └── bridgelink.png / .json   (+ 2 subclass variants)
├── /npc
│   └── /portraitsheets
│       ├── nexus.png / .json
│       └── cloud.png / .json
├── /enemies
│   └── /spritesheets         ← §6  (24–96 frame sheets per enemy)
│       ├── tv.png / .json
│       ├── phone.png / .json
│       ├── speaker.png / .json
│       ├── watch.png / .json
│       ├── console.png / .json
│       ├── fridge.png / .json
│       ├── microwave.png / .json
│       ├── printer.png / .json
│       ├── hub.png / .json          (boss, 88×132)
│       ├── seccam.png / .json       (boss)
│       ├── router.png / .json
│       ├── computer.png / .json     (boss)
│       ├── car.png / .json
│       ├── atm.png / .json
│       ├── grid.png / .json         (boss)
│       ├── medical.png / .json
│       ├── farm.png / .json         (boss)
│       ├── satellite.png / .json    (boss)
│       └── cloud.png / .json        (mega-boss, 176×264, 3 forms)
├── /backgrounds
│   └── /sheets               ← §7  (960×640, 4-frame ambient)
│       ├── bg_tv.png / .json
│       ├── bg_phone.png / .json
│       ├── bg_speaker.png / .json
│       ├── bg_watch.png / .json
│       ├── bg_console.png / .json
│       ├── bg_fridge.png / .json
│       ├── bg_microwave.png / .json
│       ├── bg_printer.png / .json
│       ├── bg_hub.png / .json
│       ├── bg_seccam.png / .json
│       ├── bg_router.png / .json
│       ├── bg_computer.png / .json
│       ├── bg_car.png / .json
│       ├── bg_atm.png / .json
│       ├── bg_grid.png / .json
│       ├── bg_medical.png / .json
│       ├── bg_farm.png / .json
│       ├── bg_satellite.png / .json
│       └── bg_cloud.png / .json
├── /vfx
│   ├── /sheets               ← §8.1 combat impact VFX (12 sheets)
│   ├── /status               ← §8.2 status overlays (10 sheets)
│   ├── /abilities            ← §8.3 class signature VFX (7 sheets)
│   └── /text
│       └── combat_numbers.png   ← §8.4 floating text atlas
├── /icons
│   ├── /class                ← §9.1 (7 PNGs)
│   ├── /subclass             ← §9.2 (14 PNGs)
│   ├── /worlds               ← §9.3 (76 PNGs OR 19 + overlay sheet)
│   ├── /items                ← §9.4 (24 PNGs, 1× and 2×)
│   ├── /upgrades             ← §9.5 (22 PNGs)
│   ├── /achievements         ← §9.6 (44 PNGs, locked + unlocked)
│   ├── /currency             ← §9.7 (8 PNGs)
│   └── /status               ← §9.8 status chips (10 PNGs)
├── /comics                   ← §10
│   ├── panel_01.png … panel_22.png
│   └── /_chrome
│       ├── panel_border.png
│       ├── panel_caption_bg.png
│       ├── panel_speaker_bg.png
│       └── panel_arrow_next.png
└── /ui                       ← §11
    ├── /logo
    ├── /screens
    ├── /hud
    ├── /buttons
    ├── /panels
    ├── /map
    ├── /hub
    ├── /loading
    ├── /cues
    └── /badges
```

---

## 13. Total Asset Count

### 13.1 Animated sprite sheets (PNG + JSON pairs)

| Section | PNGs | JSONs | Frames of art |
|---------|-----:|------:|--------------:|
| §4 Agent battle (7 base + 14 subclass) | 21 | 21 | 2,688 |
| §5 Agent / NPC portraits (21 + 2) | 23 | 23 | 92 |
| §6 Enemy battle (12 std + 6 boss + 1 mega) | 19 | 19 | 576 |
| §7 Battle backgrounds | 19 | 19 | 76 |
| §8.1 Combat impact VFX | 12 | 12 | 80 |
| §8.2 Status overlay sheets | 10 | 10 | 48 |
| §8.3 Ability signature VFX | 7 | 7 | 56 |
| §8.4 Floating combat text | 1 | 1 | n/a (atlas) |
| **Animated sheets subtotal** | **112** | **112** | **~3,616** |

### 13.2 Static icons & UI

| Section | Files |
|---------|------:|
| §9 Static icons (class, subclass, worlds, items, upgrades, achievements, currency, status, badges) | 208 |
| §10.1 Comic panels | 22 |
| §10.2 Comic chrome | 4 |
| §11 UI/HUD/screens/buttons/panels/map/loading/cues | 86 |
| **Static subtotal** | **320** |

### 13.3 Grand total

| Bucket | Count |
|--------|------:|
| Sprite-sheet PNGs (animated) | 112 |
| Sprite-sheet JSON manifests | 112 |
| Static PNGs | 320 |
| **TOTAL deliverable files** | **544** |
| Of which **animation frames** | ~3,616 |

> The "186 assets" figure in DESIGN.md refers to **logical asset slots**, treating each
> sprite as one item. This document expands every animation into its component frames
> and adds VFX, UI states, and HiDPI variants — landing in the **~544-file** range
> that the user estimated at "500 assets."

---

## 14. Production Roadmap (chunked delivery)

**Don't generate all 544 files in one pass.** Deliver in chunks; validate each chunk in-engine
before scaling. This protects against rework when the engine reveals timing/spacing issues.

### Chunk 1 — *Pilot* (1 character end-to-end)
- A01 Threadling base sprite sheet (PNG + JSON)
- P01 Threadling portrait sheet (PNG + JSON)
- IC01 Compute class icon
- One enemy to fight (E01 TV) + BG01 background
- Verify: animations play at the right FPS, origin is correct, hit registration works.
- **Files:** ~10. **Stop here. Test. Adjust spec if needed.**

### Chunk 2 — *Battle MVP* (Act 1 playable)
- All 7 base agent battle sheets (§4.1)
- All 7 base agent portrait sheets (§5, P01–P19 odd indices only — base portraits)
- Enemies E01–E05 (TV, Phone, Speaker, Watch, Console)
- Backgrounds BG01–BG05
- Combat impact VFX FX01–FX06 (hit, crit, miss, block, heal, energy)
- Class icons IC01–IC07
- Item icons (12 base, 48px only)
- HUD core: HD01–HD13 + buttons BT01, BT04
- Logo LG01, screen backgrounds SB01, SB02, SB03
- **Files:** ~85. **Test full Act 1 in engine.**

### Chunk 3 — *Mid-game* (Acts 2 & 3)
- Enemies E06–E15 + bosses
- Backgrounds BG06–BG15
- Status overlay sheets (§8.2 SX01–SX10)
- Status chip icons (§9.8 ST01–ST10)
- World map node icons (§9.3) — pick overlay-system path to save 56 files
- Map overlays MP01–MP06
- Achievement icons (§9.6) — first 14 of 22 (combat + progression categories)
- **Files:** ~80.

### Chunk 4 — *Endgame & subclasses*
- Subclass agent sheets §4.2 (14 variants)
- Subclass portrait sheets §5 (14 variants)
- Subclass icons §9.2
- Enemies E16–E19 (incl. THE CLOUD mega-boss)
- Backgrounds BG16–BG19
- Ability signature VFX (§8.3 AX01–AX07)
- Upgrade icons (§9.5)
- Remaining achievement icons (story + hidden)
- Subclass-choice screen SB06
- **Files:** ~120.

### Chunk 5 — *Story polish*
- Comic panels CP01–CP22 (§10.1)
- Comic chrome (§10.2)
- NEXUS + CLOUD portrait sheets (P22, P23)
- Floating combat text atlas FT01
- Audio cue icons (§11.9)
- Loading/transition assets (§11.8)
- Special VFX: spawn, level-up, explosion (FX08–FX12)
- **Files:** ~40.

### Chunk 6 — *HiDPI & 1× variants, atlasing, polish*
- 24×24 small variants for currency, status chips
- 1× downscales of 48px icons (auto-generated, validate readability)
- Texture atlas packing (TexturePacker / free packer) for icons & VFX
- Sprite-sheet trimming and final JSON regeneration
- **Files:** ~80.

### Chunk 7 — *V2 / nice-to-have*
- Mini-boss palette-shift PNGs (§6.5, 19 files)
- Death animations for any agent/enemy that shipped without them
- Idle direction sheets (UP, DOWN) where only LEFT/RIGHT shipped
- Localization-ready text-free variants
- **Files:** ~50.

---

## Appendix A — Recommended automation pipeline

1. **Source authoring:** Aseprite or pixel-art tool with frame tags matching `idle_down`, `walk_down`, etc.
2. **Export step:** Aseprite CLI → `aseprite -b file.aseprite --sheet out.png --data out.json --format json-array --sheet-pack`
3. **Manifest normalize:** small Node/Python script converts Aseprite's JSON to the §3.1 schema.
4. **Subclass tints:** ImageMagick or a custom canvas script (`tinted = mapColors(base, paletteA, paletteB)`).
5. **Atlas pack:** TexturePacker for icons & VFX (everything that doesn't need per-row layout).
6. **Validation:** unit test that every JSON's animation frame counts ≤ sheet column count.
7. **Build copy:** `assets/` → `dist/assets/` with sourcemap-style hash filenames for cache-busting.

## Appendix B — Naming conventions

- Lowercase, snake_case for all filenames.
- Subclass variants: `{agent}_{subclass}.png` (e.g., `threadling_overclocker.png`).
- States as suffix: `{name}_locked.png` / `{name}_unlocked.png` / `{name}_hover.png`.
- Sizes as suffix only when both sizes ship: `{name}_24.png`, `{name}_48.png`.
- One sprite sheet → one matching `.json` of the same basename.
- Never use spaces, never use camelCase.

## Appendix C — Palette reference (Clean Neon Systems)

| Role | Hex | Use |
|------|-----|-----|
| BG dark 1 | `#070912` | Deepest background |
| BG dark 2 | `#0a0d18` | Outline color |
| BG dark 3 | `#141a2e` | Mid background |
| BG dark 4 | `#1f2745` | Light background |
| Player cyan | `#3df7ff` | Compute/Threadling |
| Player blue | `#62b8ff` | Network/Netrunner |
| Player magenta | `#ff5cd0` | Memory/Patchwork |
| Player green | `#4cff8a` | Storage/Vault |
| Player yellow | `#ffd23d` | Interface/Bridgelink |
| Enemy red | `#ff4d4d` | Security/Sentinel + general enemy danger |
| Enemy orange | `#ff8a3c` | Heat/microwave |
| Enemy hot-pink | `#ff2e88` | Glitch corruption |
| Hit flash | `#ffb3c1` | 1-frame hit overlay |
| Heal | `#a4ffb6` | Healing FX |
| Critical | `#fff7a4` | Crit burst FX |

— End of document. Cross-reference with `DESIGN.md` for in-game systems and economy. —
