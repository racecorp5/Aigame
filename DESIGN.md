# SYSTEM BREACH — Game Design Document v0.2

## 7 Classes + 2 Subclasses Each

Subclasses unlock at level 5 — player chooses one path permanently.

| Class | Role | Subclass A | Subclass B |
|-------|------|-----------|-----------|
| **COMPUTE** | Burst damage | **OVERCLOCKER** — extreme damage, high self-risk | **PARALLEL** — hits 2-3 times per turn, lower per hit |
| **NETWORK** | Speed / first strike | **ROUTER** — intercepts & redirects enemy attacks | **BROADCAST** — spreads effects to all allies or enemies |
| **SECURITY** | Control / debuff | **FIREWALL** — reflects % of damage back | **SCANNER** — reveals weaknesses, lowers enemy stats |
| **STORAGE** | Tank | **ARCHIVE** — stores damage taken, releases as counter | **FORTRESS** — shares damage reduction with adjacent agents |
| **MEMORY** | Heal / replay | **CACHE** — replays last 3 actions in one turn | **RESTORE** — revives fallen agents at 30% HP |
| **GLITCH** | Chaos / wildcard | **CORRUPT** — spreads stat corruption like a virus | **EXPLOIT** — finds enemy bugs, guaranteed crits |
| **INTERFACE** | Buff / coordination | **API** — chains two agents' actions in one turn | **BRIDGE** — links agents to share HP/energy pools |

---

## 19 Worlds + Unique Mechanic Per World

### ACT 1 — HOME NETWORK *(starter)*
| # | World | Device | Mechanic |
|---|-------|--------|----------|
| 1 | **Static Wastes** | TV | Signal/miss system |
| 2 | **Notification Storm** | Smartphone | Battery drain — energy depletes 2x faster each round |
| 3 | **Echo Chamber** | Smart Speaker | Sound attacks bounce — can hit your own squad |
| 4 | **Pulse Grid** | Smart Watch | Tighter 3s auto-act timer, pulse attacks chain |
| 5 | **Save State** | Game Console | Enemies restore HP once when they'd die (load save) |

### ACT 2 — APPLIANCE LAYER *(intermediate)*
| # | World | Device | Mechanic |
|---|-------|--------|----------|
| 6 | **Frozen Sector** | Refrigerator | Freeze status — agents skip turn when frozen |
| 7 | **Heat Spiral** | Microwave | Enemies gain +5% damage each round (heat buildup) |
| 8 | **Paper Chains** | Printer | Entangle — restricts which abilities agents can use |
| 9 | **Command Hub** | Smart Home Hub | Enemy summons other devices mid-fight |
| 10 | **Surveillance** | Security Camera | Enemy predicts your move 50% of the time |

### ACT 3 — INFRASTRUCTURE *(advanced)*
| # | World | Device | Mechanic |
|---|-------|--------|----------|
| 11 | **Packet Loss** | Router | Abilities have 20% chance to silently fail to route |
| 12 | **Overflow** | Computer | Too many status effects = system crash (all wiped) |
| 13 | **Velocity** | Smart Car | Turn order reshuffles randomly each round |
| 14 | **Transaction Tax** | ATM | XP/rewards reduced by % of damage taken |
| 15 | **Blackout Zone** | Power Grid | Random rounds where all abilities are disabled |

### ACT 4 — THE DEEP SYSTEM *(expert)*
| # | World | Device | Mechanic |
|---|-------|--------|----------|
| 16 | **Vital Loop** | Medical Device | Damage dealt to enemy also heals it (shared vitals) |
| 17 | **Distributed** | Server Farm | Boss splits into 2 weaker instances when below 50% HP |
| 18 | **Signal Delay** | Satellite | Actions execute 1 turn late (queue-based) |
| 19 | **The Cloud** | Cloud Server | Final boss — 3 forms, each with a different mechanic |

---

## Overworld Map — Network Topology

The map looks like a system architecture diagram. Nodes are device icons connected
by glowing data lines. Completed nodes glow fully, locked nodes are dim, available
nodes pulse.

```
                     THE CLOUD (19)
                          |
              SERVER FARM (17) ── SATELLITE (18)
                    |                    |
           MEDICAL (16)           POWER GRID (15)
                    |                    |
              ATM (14) ──────── SMART CAR (13)
                    |                    |
           COMPUTER (12) ───── ROUTER (11)
                    |                    |
       SEC CAM (10) ── HUB (9) ── PRINTER (8)
              |            |            |
       FRIDGE (6) ── MICROWAVE (7)  CONSOLE (5)
              |            |            |
       WATCH (4) ── SPEAKER (3) ── PHONE (2)
                \          |          /
                        TV (1) ← START
```

Each connection = a data pathway. Unlock adjacent nodes after clearing one.
Multiple valid paths to The Cloud — rush the right side or explore everything.

---

## XP & Leveling System

### XP Per Battle
- Normal fight win: 50 XP
- Mini-boss win: 120 XP
- Boss win: 300 XP
- Per-agent bonus: +10 XP per agent still alive at end

### Level Thresholds
| Level | XP Required | Unlock |
|-------|------------|--------|
| 1 | 0 | Starting stats |
| 2 | 100 | +10 HP, +5 Energy |
| 3 | 250 | +5 Signal |
| 4 | 450 | New ability slot |
| 5 | 700 | **Choose subclass** |
| 6 | 1000 | +10 Autonomy |
| 7 | 1400 | Subclass ability upgrade |
| 8 | 1900 | +15 HP, +10 Energy |
| 9 | 2500 | +10 Signal |
| 10 | 3200 | Subclass ultimate ability |

### Stat Growth Per Level
- Integrity (HP): +10 per level
- Energy: +5 per level
- Signal: +3 per level (accuracy)
- Autonomy: +5 per level (auto-act intelligence)

### Subclass Unlock (Level 5)
Player sees a "fork" screen for each agent and chooses one of two subclass paths.
Choice is permanent. Subclass changes the agent's sprite tint and adds a new move.

---

## Progression State (localStorage)
- Agent levels + XP
- Cleared channels per world
- Unlocked worlds
- Chosen subclasses
- Gear equipped
