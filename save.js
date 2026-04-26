// ── Persistent save state (localStorage) ──────────────────

const XP_THRESHOLDS = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200];
const STAT_PER_LEVEL = { hp: 10, en: 5, signal: 3, autonomy: 5 };

const AGENT_BASES = {
  threadling: { maxHp: 100, maxEn: 50, signal: 85, autonomy: 10 },
  patchwork:  { maxHp: 80,  maxEn: 60, signal: 75, autonomy: 25 },
  vault:      { maxHp: 140, maxEn: 40, signal: 70, autonomy: 8  },
};

const AGENT_COSTS = { threadling: 0, patchwork: 80, vault: 160 };

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

// ── Default save ──────────────────────────────────────────

const DEFAULT_SAVE = {
  cycles: 50,
  agents: [
    { id: 'threadling', owned: true,  active: true,  hp: 100, xp: 0, level: 1 },
    { id: 'patchwork',  owned: false, active: false, hp: 80,  xp: 0, level: 1 },
    { id: 'vault',      owned: false, active: false, hp: 140, xp: 0, level: 1 },
  ],
  gear: {
    ownedWeapons: [],
    ownedArmors:  [],
    equipped: {
      threadling: { weapon: null, armor: null },
      patchwork:  { weapon: null, armor: null },
      vault:      { weapon: null, armor: null },
    },
  },
  worlds: {
    tv: { cleared: [false, false, false, false, false] },
  },
  unlockedWorlds: ['tv'],
};

// ── Save helpers ──────────────────────────────────────────

function loadSave() {
  try {
    const raw = localStorage.getItem('sb_save');
    if (!raw) return _clone(DEFAULT_SAVE);
    const s = JSON.parse(raw);
    // migrate: add gear if missing (saves from before this version)
    if (!s.gear) s.gear = _clone(DEFAULT_SAVE.gear);
    return s;
  } catch { return _clone(DEFAULT_SAVE); }
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
  };
}

// Effective stats including gear bonuses
function effectiveStats(agentId, level, save) {
  const base     = statsForLevel(agentId, level);
  const equipped = save.gear?.equipped?.[agentId] || {};
  const weapon   = equipped.weapon ? WEAPONS.find(w => w.id === equipped.weapon) : null;
  const armor    = equipped.armor  ? ARMORS.find(a  => a.id === equipped.armor)  : null;
  return {
    maxHp:    base.maxHp    + (armor?.hpBonus  || 0),
    maxEn:    base.maxEn    + (armor?.enBonus  || 0),
    signal:   base.signal   + (weapon?.sigBonus || 0) + (armor?.sigBonus || 0),
    autonomy: base.autonomy,
    dmgBonus: weapon?.dmgBonus || 0,
    recovery: armor?.recovery  || 0,
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
