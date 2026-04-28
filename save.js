// ── Persistent save state (localStorage) ──────────────────

const XP_THRESHOLDS = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200];
const STAT_PER_LEVEL = { hp: 10, en: 5, signal: 3, autonomy: 5, shield: 3 };

const AGENT_BASES = {
  threadling: { maxHp: 100, maxEn: 50, signal: 85, autonomy: 10, maxSh: 20 },
  patchwork:  { maxHp: 80,  maxEn: 60, signal: 75, autonomy: 25, maxSh: 25 },
  vault:      { maxHp: 140, maxEn: 40, signal: 70, autonomy: 8,  maxSh: 60 },
  netrunner:  { maxHp: 75,  maxEn: 70, signal: 92, autonomy: 35, maxSh: 30 },
  sentinel:   { maxHp: 95,  maxEn: 55, signal: 80, autonomy: 15, maxSh: 50 },
  glitcher:   { maxHp: 70,  maxEn: 80, signal: 65, autonomy: 40, maxSh: 15 },
  bridgelink: { maxHp: 85,  maxEn: 65, signal: 78, autonomy: 20, maxSh: 30 },
};

const AGENT_COSTS = { threadling: 0, patchwork: 80, vault: 160, netrunner: 200, sentinel: 240, glitcher: 280, bridgelink: 300 };

// ── Gear catalogs ─────────────────────────────────────────

const WEAPONS = [
  { id: 'bit_shard',       name: 'BIT SHARD',       cost: 40,  dmgBonus: 4,  sigBonus: 0,   desc: '+4 attack damage' },
  { id: 'signal_amp',      name: 'SIGNAL AMP',       cost: 70,  dmgBonus: 0,  sigBonus: 10,  desc: '+10% signal accuracy' },
  { id: 'overcharge_core', name: 'OVERCHARGE CORE',  cost: 140, dmgBonus: 12, sigBonus: -8,  desc: '+12 dmg  −8 signal' },
  { id: 'precision_bit',   name: 'PRECISION BIT',    cost: 180, dmgBonus: 6,  sigBonus: 10,  desc: '+6 dmg  +10 signal' },
];

const ARMORS = [
  { id: 'signal_mesh',    name: 'SIGNAL MESH',     cost: 50,  hpBonus: 15,  enBonus: 0,  sigBonus: 3,  recovery: 0,  desc: '+15 HP  +3 signal' },
  { id: 'energy_cell',    name: 'ENERGY CELL',     cost: 80,  hpBonus: 0,   enBonus: 20, sigBonus: 0,  recovery: 0,  desc: '+20 max energy' },
  { id: 'repair_plating', name: 'REPAIR PLATING',  cost: 120, hpBonus: 20,  enBonus: 0,  sigBonus: 0,  recovery: 10, desc: '+20 HP  restore 10 HP after battle' },
  { id: 'fortress_shell', name: 'FORTRESS SHELL',  cost: 220, hpBonus: 50,  enBonus: 0,  sigBonus: -5, recovery: 0,  desc: '+50 HP  −5 signal' },
];

// ── Items catalog ─────────────────────────────────────────

const ITEMS_CATALOG = [
  { id: 'repair_kit',  name: 'REPAIR KIT',  cost: 15, icon: '🔧', desc: 'Restore 40 HP to active agent'  },
  { id: 'energy_cell', name: 'ENERGY CELL', cost: 20, icon: '⚡', desc: 'Restore 30 EN to all allies'    },
  { id: 'sig_boost',   name: 'SIG BOOST',   cost: 25, icon: '📡', desc: 'Enemy aura −20 this battle'     },
  { id: 'emp_charge',  name: 'EMP CHARGE',  cost: 35, icon: '💥', desc: 'Deal 50 damage to enemy'        },
];

// ── Default save ──────────────────────────────────────────

const DEFAULT_SAVE = {
  cycles: 50,
  agents: [
    { id: 'threadling', owned: true,  active: true,  hp: 100, xp: 0, level: 1, kills: 0, skin: 'default' },
    { id: 'patchwork',  owned: false, active: false, hp: 80,  xp: 0, level: 1, kills: 0, skin: 'default' },
    { id: 'vault',      owned: false, active: false, hp: 140, xp: 0, level: 1, kills: 0, skin: 'default' },
    { id: 'netrunner',  owned: false, active: false, hp: 75,  xp: 0, level: 1, kills: 0, skin: 'default' },
    { id: 'sentinel',   owned: false, active: false, hp: 95,  xp: 0, level: 1, kills: 0, skin: 'default' },
    { id: 'glitcher',   owned: false, active: false, hp: 70,  xp: 0, level: 1, kills: 0, skin: 'default' },
    { id: 'bridgelink', owned: false, active: false, hp: 85,  xp: 0, level: 1, kills: 0, skin: 'default' },
  ],
  gear: {
    equipped: {
      threadling: { weapon: null, armor: null, module: null, booster: null },
      patchwork:  { weapon: null, armor: null, module: null, booster: null },
      vault:      { weapon: null, armor: null, module: null, booster: null },
      netrunner:  { weapon: null, armor: null, module: null, booster: null },
      sentinel:   { weapon: null, armor: null, module: null, booster: null },
      glitcher:   { weapon: null, armor: null, module: null, booster: null },
      bridgelink: { weapon: null, armor: null, module: null, booster: null },
    },
  },
  cosmetics: {
    ownedSkins: {
      threadling: ['default'], patchwork: ['default'], vault: ['default'],
      netrunner:  ['default'], sentinel:  ['default'], glitcher: ['default'], bridgelink: ['default'],
    },
  },
  settings: { useRadialMenu: false, showFps: false, soundOn: true, musicOn: true },
  items: { repair_kit: 0, energy_cell: 0, sig_boost: 0, emp_charge: 0 },
  worlds: {
    tv: { cleared: [false, false, false, false, false] },
  },
  unlockedWorlds: ['tv'],
  shards: 0,
  achievements: {},
  upgrades: {},
  seenCutscenes: [],
};

// ── Save helpers ──────────────────────────────────────────

function loadSave() {
  try {
    const raw = localStorage.getItem('sb_save');
    if (!raw) return _clone(DEFAULT_SAVE);
    const s = JSON.parse(raw);
    // migrate: add gear if missing
    if (!s.gear) s.gear = _clone(DEFAULT_SAVE.gear);
    // migrate: drop old shared weapon/armor lists (gear is now per-character)
    delete s.gear.ownedWeapons;
    delete s.gear.ownedArmors;
    // migrate: add new agents if missing
    DEFAULT_SAVE.agents.forEach(da => {
      if (!s.agents.find(a => a.id === da.id)) s.agents.push(_clone(da));
    });
    // migrate: add new gear slots if missing
    DEFAULT_SAVE.agents.forEach(da => {
      if (!s.gear.equipped[da.id]) s.gear.equipped[da.id] = { weapon: null, armor: null, module: null, booster: null };
      else {
        if (!('module'  in s.gear.equipped[da.id])) s.gear.equipped[da.id].module  = null;
        if (!('booster' in s.gear.equipped[da.id])) s.gear.equipped[da.id].booster = null;
      }
    });
    // migrate: ensure active field exists and at least one owned agent is active
    s.agents.forEach(a => { if (typeof a.active !== 'boolean') a.active = a.owned; });
    // migrate: add new per-agent fields
    s.agents.forEach(a => {
      if (typeof a.kills !== 'number') a.kills = 0;
      if (typeof a.skin  !== 'string') a.skin  = 'default';
    });
    if (!s.agents.some(a => a.owned && a.active)) {
      const first = s.agents.find(a => a.owned);
      if (first) first.active = true;
    }
    // migrate: cosmetics + settings
    if (!s.cosmetics) s.cosmetics = _clone(DEFAULT_SAVE.cosmetics);
    if (!s.cosmetics.ownedSkins) s.cosmetics.ownedSkins = _clone(DEFAULT_SAVE.cosmetics.ownedSkins);
    DEFAULT_SAVE.agents.forEach(da => {
      if (!s.cosmetics.ownedSkins[da.id]) s.cosmetics.ownedSkins[da.id] = ['default'];
    });
    if (!s.settings) s.settings = _clone(DEFAULT_SAVE.settings);
    else {
      Object.keys(DEFAULT_SAVE.settings).forEach(k => {
        if (typeof s.settings[k] === 'undefined') s.settings[k] = DEFAULT_SAVE.settings[k];
      });
    }
    // migrate: add items if missing
    if (!s.items) s.items = _clone(DEFAULT_SAVE.items);
    // migrate: new progression fields
    if (typeof s.shards !== 'number') s.shards = 0;
    if (!s.achievements) s.achievements = {};
    if (!s.upgrades) s.upgrades = {};
    if (!s.seenCutscenes) s.seenCutscenes = [];
    if (!s.unlockedWorlds) s.unlockedWorlds = _clone(DEFAULT_SAVE.unlockedWorlds);
    if (!s.worlds) s.worlds = _clone(DEFAULT_SAVE.worlds);
    return s;
  } catch { return _clone(DEFAULT_SAVE); }
}

// ── Shard rewards ─────────────────────────────────────────

const SHARD_AWARDS = { normal: 0, miniboss: 3, boss: 8 };
function awardShards(save, channelType, mult = 1) {
  const n = Math.round((SHARD_AWARDS[channelType] || 0) * mult);
  save.shards = (save.shards || 0) + n;
  return n;
}

function writeSave(data) {
  localStorage.setItem('sb_save', JSON.stringify(data));
}

function resetSave() {
  localStorage.removeItem('sb_save');
  return _clone(DEFAULT_SAVE);
}

function _clone(obj) { return JSON.parse(JSON.stringify(obj)); }

// ── XP helpers ────────────────────────────────────────────

function levelFromXp(xp) {
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= XP_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

function xpToNextLevel(level) {
  if (level >= XP_THRESHOLDS.length) return null;
  return XP_THRESHOLDS[level];
}

function statsForLevel(agentId, level) {
  const base = AGENT_BASES[agentId];
  const extra = level - 1;
  return {
    maxHp:    base.maxHp    + extra * STAT_PER_LEVEL.hp,
    maxEn:    base.maxEn    + extra * STAT_PER_LEVEL.en,
    signal:   base.signal   + extra * STAT_PER_LEVEL.signal,
    autonomy: base.autonomy + extra * STAT_PER_LEVEL.autonomy,
    maxSh:    base.maxSh    + extra * STAT_PER_LEVEL.shield,
  };
}

// Effective stats including gear bonuses (weapon + armor + module + booster)
function effectiveStats(agentId, level, save) {
  const base     = statsForLevel(agentId, level);
  const equipped = save.gear?.equipped?.[agentId] || {};
  const weapon   = equipped.weapon ? WEAPONS.find(w => w.id === equipped.weapon) : null;
  const armor    = equipped.armor  ? ARMORS.find(a  => a.id === equipped.armor)  : null;
  // MODULES / BOOSTERS may not be defined in environments that load save.js without game.js;
  // fall back to safe lookups via globals.
  const mods   = (typeof MODULE_BY_ID  !== 'undefined') ? MODULE_BY_ID  : {};
  const boosts = (typeof BOOSTER_BY_ID !== 'undefined') ? BOOSTER_BY_ID : {};
  const module  = equipped.module  ? mods[equipped.module]   : null;
  const booster = equipped.booster ? boosts[equipped.booster] : null;
  return {
    maxHp:    base.maxHp    + (armor?.hpBonus  || 0),
    maxEn:    base.maxEn    + (armor?.enBonus  || 0),
    signal:   base.signal   + (weapon?.sigBonus || 0) + (armor?.sigBonus || 0),
    autonomy: base.autonomy,
    maxSh:    base.maxSh    + (armor?.shBonus  || 0) + (module?.shBonus || 0),
    dmgBonus: weapon?.dmgBonus || 0,
    recovery: armor?.recovery  || 0,
    reflect:  module?.reflect    || 0,
    reveal:   !!module?.reveal,
    dodge:    booster?.dodge     || 0,
    enRegen:  booster?.enRegen   || 0,
    dmgReduce: booster?.dmgReduce || 0,
  };
}

function awardXp(agentSave, amount) {
  const oldLevel = agentSave.level;
  agentSave.xp  += amount;
  agentSave.level = levelFromXp(agentSave.xp);
  return { newXp: agentSave.xp, oldLevel, newLevel: agentSave.level, leveledUp: agentSave.level > oldLevel };
}

// ── Battle rewards ────────────────────────────────────────

const BASE_XP     = { normal: 50,  miniboss: 120, boss: 300 };
const BASE_CYCLES = { normal: 20,  miniboss: 50,  boss: 120 };
const ALIVE_XP    = 10;
const ALIVE_COINS = 5;

function calcRewards(channelType, tier, aliveCount) {
  const xp     = Math.round(BASE_XP[channelType]     * tier + ALIVE_XP    * tier * aliveCount);
  const cycles = Math.round(BASE_CYCLES[channelType] * tier + ALIVE_COINS * tier * aliveCount);
  return { xp, cycles };
}

function reviveCost(tier) { return 50 * tier; }
