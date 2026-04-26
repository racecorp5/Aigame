// ── Persistent save state (localStorage) ──────────────────

const XP_THRESHOLDS = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200];

const STAT_PER_LEVEL = { hp: 10, en: 5, signal: 3, autonomy: 5 };

const AGENT_BASES = {
  threadling: { maxHp: 100, maxEn: 50, signal: 85, autonomy: 10 },
  patchwork:  { maxHp: 80,  maxEn: 60, signal: 75, autonomy: 25 },
  vault:      { maxHp: 140, maxEn: 40, signal: 70, autonomy: 8  },
};

const AGENT_COSTS = { threadling: 0, patchwork: 150, vault: 200 };

const DEFAULT_SAVE = {
  cycles: 0,
  agents: [
    { id: 'threadling', owned: true,  active: true,  hp: 100, xp: 0, level: 1 },
    { id: 'patchwork',  owned: false, active: false, hp: 80,  xp: 0, level: 1 },
    { id: 'vault',      owned: false, active: false, hp: 140, xp: 0, level: 1 },
  ],
  worlds: {
    tv: { cleared: [false, false, false, false, false] },
  },
  unlockedWorlds: ['tv'],
};

function loadSave() {
  try {
    const raw = localStorage.getItem('sb_save');
    return raw ? JSON.parse(raw) : _clone(DEFAULT_SAVE);
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
  if (level >= XP_THRESHOLDS.length) return null; // max level
  return XP_THRESHOLDS[level]; // XP needed for level+1
}

// Returns { maxHp, maxEn, signal, autonomy } for an agent at a given level
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

// Award XP to an agent, return { newXp, oldLevel, newLevel, leveledUp }
function awardXp(agentSave, amount) {
  const oldLevel = agentSave.level;
  agentSave.xp += amount;
  agentSave.level = levelFromXp(agentSave.xp);
  const newLevel = agentSave.level;
  return { newXp: agentSave.xp, oldLevel, newLevel, leveledUp: newLevel > oldLevel };
}

// ── Battle rewards ─────────────────────────────────────────

const BASE_XP     = { normal: 50,  miniboss: 120, boss: 300 };
const BASE_CYCLES = { normal: 20,  miniboss: 50,  boss: 120 };
const ALIVE_XP    = 10;
const ALIVE_COINS = 5;

function calcRewards(channelType, tier, aliveCount) {
  const mult = tier;
  const xp     = Math.round(BASE_XP[channelType]     * mult + ALIVE_XP    * tier * aliveCount);
  const cycles  = Math.round(BASE_CYCLES[channelType] * mult + ALIVE_COINS * tier * aliveCount);
  return { xp, cycles };
}

function reviveCost(tier) {
  return 50 * tier;
}
