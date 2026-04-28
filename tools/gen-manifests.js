#!/usr/bin/env node
/**
 * gen-manifests.js — emit JSON sprite-sheet manifests for every PNG in
 *                    the assets tree, based on the file's directory.
 *
 * Image generators produce PNGs but not JSON. This script generates the
 * matching .json file next to each .png using the schema from
 * ASSET_INVENTORY.md / prompts/_style_directive.md.
 *
 * Usage:
 *   node tools/gen-manifests.js                # walk ./assets, emit all
 *   node tools/gen-manifests.js path/to/dir    # walk a specific subtree
 *   node tools/gen-manifests.js --dry          # show what would be written
 *   node tools/gen-manifests.js --force        # overwrite existing JSONs
 *
 * The schema for each sheet is determined by its parent directory:
 *
 *   assets/agents/spritesheets/*.png     → AGENT_SCHEMA  (24 rows × 8 cols)
 *   assets/agents/portraitsheets/*.png   → PORTRAIT_SCHEMA (1 row × 4 cols)
 *   assets/npc/portraitsheets/*.png      → PORTRAIT_SCHEMA
 *   assets/enemies/spritesheets/*.png    → ENEMY_SCHEMA  (5 rows × 8 cols)
 *                                          or BOSS_SCHEMA (6 rows) for bosses
 *                                          or CLOUD_SCHEMA (18 rows × 3 forms)
 *   assets/backgrounds/sheets/bg_*.png   → BG_SCHEMA    (1 row × 4 cols, 960×640)
 *   assets/vfx/sheets/*.png              → VFX_SCHEMA   (1 row, frame count varies)
 *   assets/vfx/status/*.png              → STATUS_SCHEMA (1 row, 44×66 cell)
 *   assets/vfx/abilities/*.png           → ABILITY_SCHEMA (1 row × 8 cols, 128×128 cell)
 *
 * To override frame counts (e.g. for an enemy with extra anims), drop a sibling
 * `name.override.json` next to the PNG and the script will deep-merge it onto
 * the generated schema.
 */

'use strict';
const fs   = require('fs');
const path = require('path');

const ROOT = process.cwd();
const ARGS = process.argv.slice(2);
const DRY     = ARGS.includes('--dry');
const FORCE   = ARGS.includes('--force');
const targets = ARGS.filter(a => !a.startsWith('--'));
const START   = targets[0] ? path.resolve(targets[0]) : path.join(ROOT, 'assets');

// ── Bosses get an extra `phase` row. Cloud has 3 forms.
const BOSS_IDS  = new Set(['hub','seccam','computer','grid','farm','satellite']);
const CLOUD_IDS = new Set(['cloud']);

// ── Schema generators ──────────────────────────────────────

function agentSchema(image) {
  return {
    "$schema": "spritesheet/v1",
    image,
    frameWidth: 44, frameHeight: 66,
    padding: 2, spacing: 4, margin: 4,
    columns: 8, rows: 24,
    originX: 22, originY: 60,
    animations: {
      idle_down:    { row: 0,  frames: 4, fps: 6,  loop: true  },
      walk_down:    { row: 1,  frames: 6, fps: 10, loop: true  },
      attack_down:  { row: 2,  frames: 6, fps: 12, loop: false },
      ability_down: { row: 3,  frames: 8, fps: 10, loop: false },
      hit_down:     { row: 4,  frames: 2, fps: 12, loop: false },
      death_down:   { row: 5,  frames: 6, fps: 8,  loop: false },
      idle_left:    { row: 6,  frames: 4, fps: 6,  loop: true  },
      walk_left:    { row: 7,  frames: 6, fps: 10, loop: true  },
      attack_left:  { row: 8,  frames: 6, fps: 12, loop: false },
      ability_left: { row: 9,  frames: 8, fps: 10, loop: false },
      hit_left:     { row: 10, frames: 2, fps: 12, loop: false },
      death_left:   { row: 11, frames: 6, fps: 8,  loop: false },
      idle_right:   { row: 12, frames: 4, fps: 6,  loop: true  },
      walk_right:   { row: 13, frames: 6, fps: 10, loop: true  },
      attack_right: { row: 14, frames: 6, fps: 12, loop: false },
      ability_right:{ row: 15, frames: 8, fps: 10, loop: false },
      hit_right:    { row: 16, frames: 2, fps: 12, loop: false },
      death_right:  { row: 17, frames: 6, fps: 8,  loop: false },
      idle_up:      { row: 18, frames: 4, fps: 6,  loop: true  },
      walk_up:      { row: 19, frames: 6, fps: 10, loop: true  },
      attack_up:    { row: 20, frames: 6, fps: 12, loop: false },
      ability_up:   { row: 21, frames: 8, fps: 10, loop: false },
      hit_up:       { row: 22, frames: 2, fps: 12, loop: false },
      death_up:     { row: 23, frames: 6, fps: 8,  loop: false },
    },
  };
}

function portraitSchema(image) {
  return {
    "$schema": "spritesheet/v1",
    image,
    frameWidth: 200, frameHeight: 200,
    padding: 0, spacing: 4, margin: 4,
    columns: 4, rows: 1,
    originX: 100, originY: 200,
    animations: { idle: { row: 0, frames: 4, fps: 6, loop: true } },
  };
}

function enemySchema(image, baseName) {
  const isBoss  = BOSS_IDS.has(baseName);
  const isCloud = CLOUD_IDS.has(baseName);
  const cellW = isCloud ? 176 : isBoss ? 88 : 44;
  const cellH = isCloud ? 264 : isBoss ? 132 : 66;
  const rows  = isCloud ? 18 : isBoss ? 6 : 5;
  const animations = {
    idle:   { row: 0, frames: 4, fps: 6,  loop: true  },
    attack: { row: 1, frames: 6, fps: 12, loop: false },
    cast:   { row: 2, frames: 6, fps: 10, loop: false },
    hit:    { row: 3, frames: 2, fps: 12, loop: false },
    death:  { row: 4, frames: 6, fps: 8,  loop: false },
  };
  if (isBoss || isCloud) {
    animations.phase = { row: 5, frames: 8, fps: 8, loop: false };
  }
  if (isCloud) {
    // Cloud has 3 forms × 6 anims = 18 rows. Form 1 is rows 0-5 (the standard
    // animations above + phase). Forms 2 and 3 occupy rows 6-11 and 12-17.
    for (let f = 1; f <= 2; f++) {
      const offset = 6 * f;
      animations[`f${f+1}_idle`]   = { row: offset+0, frames: 4, fps: 6,  loop: true  };
      animations[`f${f+1}_attack`] = { row: offset+1, frames: 6, fps: 12, loop: false };
      animations[`f${f+1}_cast`]   = { row: offset+2, frames: 6, fps: 10, loop: false };
      animations[`f${f+1}_hit`]    = { row: offset+3, frames: 2, fps: 12, loop: false };
      animations[`f${f+1}_death`]  = { row: offset+4, frames: 6, fps: 8,  loop: false };
      animations[`f${f+1}_phase`]  = { row: offset+5, frames: 8, fps: 8,  loop: false };
    }
  }
  return {
    "$schema": "spritesheet/v1",
    image,
    frameWidth: cellW, frameHeight: cellH,
    padding: 2, spacing: 4, margin: 4,
    columns: 8, rows,
    originX: Math.floor(cellW / 2), originY: cellH - 6,
    animations,
  };
}

function bgSchema(image) {
  return {
    "$schema": "spritesheet/v1",
    image,
    frameWidth: 960, frameHeight: 640,
    padding: 0, spacing: 4, margin: 4,
    columns: 4, rows: 1,
    originX: 0, originY: 0,
    animations: { ambient: { row: 0, frames: 4, fps: 4, loop: true } },
  };
}

// VFX impact sheets vary in frame count — defaults below cover the §8.1 list
// from ASSET_INVENTORY.md. Drop a *.override.json sibling to customize.
const VFX_DEFAULTS = {
  hit_spark:      { frames: 6,  fps: 18 },
  crit_burst:     { frames: 8,  fps: 18 },
  miss_puff:      { frames: 4,  fps: 14 },
  block_shield:   { frames: 6,  fps: 14 },
  heal_pulse:     { frames: 8,  fps: 12 },
  energy_bolt:    { frames: 6,  fps: 14 },
  death_dissolve: { frames: 8,  fps: 10 },
  level_up:       { frames: 12, fps: 10 },
  spawn_in:       { frames: 6,  fps: 14 },
  buff_glow:      { frames: 8,  fps: 8  },
  debuff_drip:    { frames: 8,  fps: 8  },
  explosion:      { frames: 10, fps: 18 },
};

function vfxSchema(image, baseName) {
  const def = VFX_DEFAULTS[baseName] || { frames: 6, fps: 14 };
  return {
    "$schema": "spritesheet/v1",
    image,
    frameWidth: 64, frameHeight: 64,
    padding: 0, spacing: 4, margin: 4,
    columns: def.frames, rows: 1,
    originX: 32, originY: 32,
    animations: { play: { row: 0, frames: def.frames, fps: def.fps, loop: false } },
  };
}

function statusSchema(image) {
  return {
    "$schema": "spritesheet/v1",
    image,
    frameWidth: 44, frameHeight: 66,
    padding: 0, spacing: 4, margin: 4,
    columns: 6, rows: 1,
    originX: 22, originY: 33,
    animations: { active: { row: 0, frames: 6, fps: 8, loop: true } },
  };
}

function abilitySchema(image) {
  return {
    "$schema": "spritesheet/v1",
    image,
    frameWidth: 128, frameHeight: 128,
    padding: 0, spacing: 4, margin: 4,
    columns: 8, rows: 1,
    originX: 64, originY: 64,
    animations: { play: { row: 0, frames: 8, fps: 12, loop: false } },
  };
}

// ── Path → schema dispatch ─────────────────────────────────

function schemaForPath(absPng) {
  const rel = path.relative(ROOT, absPng).replace(/\\/g, '/');
  const base = path.basename(absPng, '.png');
  if (rel.includes('agents/spritesheets/'))   return agentSchema(`${base}.png`);
  if (rel.includes('agents/portraitsheets/')) return portraitSchema(`${base}.png`);
  if (rel.includes('npc/portraitsheets/'))    return portraitSchema(`${base}.png`);
  if (rel.includes('enemies/spritesheets/'))  return enemySchema(`${base}.png`, base);
  if (rel.includes('backgrounds/sheets/'))    return bgSchema(`${base}.png`);
  if (rel.includes('vfx/sheets/'))            return vfxSchema(`${base}.png`, base);
  if (rel.includes('vfx/status/'))            return statusSchema(`${base}.png`);
  if (rel.includes('vfx/abilities/'))         return abilitySchema(`${base}.png`);
  return null;
}

// Optional override merge: deep-merge a sibling `<name>.override.json` onto
// the generated schema (lets you tweak frame counts without forking the script).
function mergeOverride(absPng, schema) {
  const overridePath = absPng.replace(/\.png$/i, '.override.json');
  if (!fs.existsSync(overridePath)) return schema;
  try {
    const o = JSON.parse(fs.readFileSync(overridePath, 'utf8'));
    return deepMerge(schema, o);
  } catch (e) {
    console.warn(`[warn] could not parse override ${overridePath}: ${e.message}`);
    return schema;
  }
}

function deepMerge(a, b) {
  if (Array.isArray(a) || Array.isArray(b)) return b ?? a;
  if (typeof a !== 'object' || a === null) return b ?? a;
  if (typeof b !== 'object' || b === null) return a;
  const out = { ...a };
  for (const k of Object.keys(b)) out[k] = deepMerge(a[k], b[k]);
  return out;
}

// ── Walk + emit ────────────────────────────────────────────

function* walk(dir) {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

let written = 0, skipped = 0, untyped = 0;
for (const file of walk(START)) {
  if (!file.toLowerCase().endsWith('.png')) continue;
  const schema = schemaForPath(file);
  if (!schema) { untyped++; continue; }
  const merged = mergeOverride(file, schema);
  const jsonPath = file.replace(/\.png$/i, '.json');
  if (fs.existsSync(jsonPath) && !FORCE) {
    skipped++;
    continue;
  }
  const json = JSON.stringify(merged, null, 2) + '\n';
  if (DRY) {
    console.log(`[dry] would write ${path.relative(ROOT, jsonPath)}`);
  } else {
    fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
    fs.writeFileSync(jsonPath, json, 'utf8');
    console.log(`[ok]  ${path.relative(ROOT, jsonPath)}`);
  }
  written++;
}

console.log('');
console.log(`Wrote ${written}, skipped ${skipped} (already existed), untyped ${untyped} (no schema for path).`);
if (skipped > 0 && !FORCE) console.log('Pass --force to overwrite existing JSONs.');
