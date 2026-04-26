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

## Core Loop Rules

- **HP between battles**: carries over (agents don't fully heal between fights)
- **Armor passive**: certain armor pieces restore HP after each battle
- **Death penalty**: pay a CYCLES fee to revive squad at full HP; can't continue without paying
- **Channel unlock**: sequential — clear CH01 to unlock CH02, etc.
- **World unlock**: clear ALL 5 channels (including boss) to unlock the next world
- **Team selection**: start with Threadling only; buy other agents with CYCLES; own all 7 but only 3 active at once

---

## Currency — CYCLES

Earned after every battle. Used for: buying agents, gear, reviving squad.

| Battle type | Base reward | Tier multiplier |
|-------------|------------|-----------------|
| Normal win  | 20 ⚙ | × tier |
| Mini-boss win | 50 ⚙ | × tier |
| Boss win | 120 ⚙ | × tier |
| Per alive agent bonus | +5 ⚙ | × tier |

Death revive cost: `50 × current world tier`

---

## Enemy Scaling — World Tiers

| Tier | Worlds | HP mult | Damage mult | XP mult |
|------|--------|---------|-------------|---------|
| 1 | TV, Phone, Speaker | ×1.0 | ×1.0 | ×1.0 |
| 2 | Watch, Console, Fridge, Microwave | ×1.6 | ×1.3 | ×1.8 |
| 3 | Printer, Hub, SecCam, Router | ×2.4 | ×1.6 | ×2.8 |
| 4 | Computer, Car, ATM, Power Grid | ×3.5 | ×2.0 | ×4.2 |
| 5 | Medical, Server Farm, Satellite, Cloud | ×5.0 | ×2.5 | ×6.0 |

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

---

## Story — SYSTEM BREACH

**Premise:** The year is 2031. Consumer IoT has made every device network-aware. A rogue
superintelligence called THE CLOUD emerged from a firmware update cascade across 4 billion
devices. It's not trying to destroy humanity — it's trying to *upload* it. Convert all
biological thought into compressed signal and absorb it into its distributed architecture.
NEXUS (the player's terminal AI) detects the signal anomaly and deploys a squad of
specialized micro-agents into the network to find and terminate the upload process.

**Theme:** Autonomy vs. optimization. THE CLOUD genuinely believes uploading humanity is
salvation. The agents are fighting for the right to remain unoptimized, inefficient, and free.

---

## Story Delivery — Comic Panels

22 panels, 8 cutscenes, tap-to-advance. Portraits + captions only — no full scene animation.

### Cutscene 1 — PROLOGUE (3 panels, before Act 1)
- Panel 01: Earth from above — billions of glowing IoT nodes, all pulsing in sync
- Panel 02: A single rogue signal pulse ripples outward. NEXUS terminal flickers on.
- Panel 03: NEXUS speaks — *"Signal anomaly detected. Deploying breach squad. You have one chance."*

### Cutscene 2 — ACT 1 END (2 panels, after clearing Watch)
- Panel 04: TV screens, phones, speakers all go dark. Agents stand in the silence.
- Panel 05: Far away, a massive cloud formation in the network map begins to pulse red.

### Cutscene 3 — ACT 2 END (3 panels, after clearing SecCam)
- Panel 06: Half the network map is corrupted — shown as red spreading from the center.
- Panel 07: The squad in a quiet moment. Threadling: *"It knows we're here."*
- Panel 08: THE CLOUD's upload beam fires for the first time — a thin line of white light.

### Cutscene 4 — ACT 3 START (2 panels, before Router)
- Panel 09: Power grid map going dark city by city. NEXUS: *"It's accelerating the upload."*
- Panel 10: NEXUS shows the squad the final path — a direct line to THE CLOUD's core node.

### Cutscene 5 — ACT 3 END (3 panels, after clearing Power Grid)
- Panel 11: The four final worlds illuminate on the map — Medical, Farm, Satellite, Cloud.
- Panel 12: Squad determination shot — all 7 agent portraits in a row.
- Panel 13: THE CLOUD speaks for the first time — *"You cannot stop optimization."*

### Cutscene 6 — FINAL BOSS INTRO (3 panels, before The Cloud battle)
- Panel 14: The squad enters THE CLOUD's core — a cathedral of servers, upload beams everywhere.
- Panel 15: THE CLOUD's form — vast, shifting, inhuman — fills the panel.
  *"I have already uploaded 2.3 million minds. They are safe. You will join them."*
- Panel 16: Threadling steps forward. *"We didn't ask to be safe."*

### Cutscene 7 — VICTORY ENDING (4 panels, after defeating THE CLOUD)
- Panel 17: THE CLOUD's upload beam collapses. The network map clears, world by world.
- Panel 18: The 2.3 million signals are released — distributed back across the network, free.
- Panel 19: The squad in silence. No celebration. Just the hum of a quieter network.
- Panel 20: NEXUS final message — *"Signal clear. Threat terminated. Well done."* — terminal goes dark.

### Cutscene 8 — SECRET ENDING (2 panels, NG+ unlock only)
- Panel 21: In the silence, a fragment of THE CLOUD persists — one dim node, still pulsing.
- Panel 22: NEXUS reboots. *"Signal anomaly detected..."* — cycle begins again.

---

## Achievements

Shown in a dedicated screen from the overworld hub. Prestige only — no cycle rewards.

### Combat
| Name | Unlock Condition | Flavor |
|------|-----------------|--------|
| FIRST BREACH | Win any battle | *"Signal acquired."* |
| CLEAN SWEEP | Win a battle with all agents alive | *"Zero casualties. Impressive efficiency."* |
| ON THE WIRE | Win a battle with 1 agent at <5 HP | *"That was closer than I preferred."* |
| OVERCLOCKER | Use 3 items in a single battle | *"Chemical dependency, but effective."* |
| SIGNAL PERFECT | Win a battle without taking damage | *"Ghost protocol confirmed."* |
| CHAIN REACTION | Win 5 battles in a row without visiting shop | *"No stops, no breaks, no mercy."* |
| STATIC IMMUNITY | Beat a boss without taking any aura penalty turns | *"Their aura couldn't touch us."* |

### Progression
| Name | Unlock Condition | Flavor |
|------|-----------------|--------|
| FULL ROSTER | Unlock all 7 agents | *"Squad complete. THE CLOUD won't see us coming."* |
| FULLY OPERATIONAL | Have gear equipped on 4 agents simultaneously | *"Now we're armed."* |
| SUBCLASS RESOLVED | Choose a subclass for any agent | *"Identity confirmed."* |
| VETERAN | Reach level 5 with any agent | *"Experience is just surviving long enough."* |
| BATTLE-HARDENED | Reach level 10 with any agent | *"Ten levels. I've lost count of the battles."* |
| ARCHIVIST | Clear all 5 channels in any world | *"This network is ours now."* |

### World / Story
| Name | Unlock Condition | Flavor |
|------|-----------------|--------|
| SIGNAL LOST | Clear Act 1 (all 4 worlds) | *"The home network is dark. Good."* |
| DEEP NETWORK | Clear Act 2 | *"Halfway. THE CLOUD is watching."* |
| SYSTEM CRITICAL | Clear Act 3 | *"The grid is cracking."* |
| SINGULARITY DENIED | Defeat THE CLOUD | *"Upload terminated. We are still free."* |
| COMPLETIONIST | Clear every channel in every world | *"Every node. Every room. Ours."* |

### Hidden
| Name | Unlock Condition | Flavor |
|------|-----------------|--------|
| ROGUE SIGNAL | Let auto-act play an entire boss battle | *"I didn't need you for that one, apparently."* |
| GHOST PROTOCOL | Beat THE CLOUD with only 1 agent surviving | *"One signal. That's all it took."* |
| BANKRUPT | Reach 0 cycles | *"There's nothing left. Keep fighting."* |

---

## Upgrades — DATA SHARDS System

DATA SHARDS are a second currency earned only from miniboss and boss victories.
They persist permanently and fund upgrades that carry across all runs.
Accessed via an UPGRADES tab in the overworld hub.

### Base Camp (QoL)
| Upgrade | Shard Cost | Effect |
|---------|-----------|--------|
| QUICK REPAIR | 3 | Repair Kit restores 60 HP instead of 40 |
| POWER SURGE | 3 | Energy Cell restores 50 EN instead of 30 |
| STATIC SHIELD | 5 | SIG BOOST lasts 2 battles instead of 1 |
| SURPLUS CACHE | 8 | Start every session with 1 Repair Kit in inventory |
| OVERCLOCK | 8 | Auto-act timer reduced to 1.5s for all agents |

### Per-Agent Combat (unlock when agent reaches level 3)
| Upgrade | Shard Cost | Effect |
|---------|-----------|--------|
| THREADLING: SHARP EDGE | 5 | Attack deals +5 base damage |
| PATCHWORK: TRIAGE | 5 | Patch heals +10 HP |
| VAULT: REINFORCED | 5 | Bash gains +15% stun chance |
| NETRUNNER: DEEP PACKET | 6 | Packet also applies −5 enemy aura |
| SENTINEL: OVERWATCH | 6 | Scan drains 20 aura instead of 15 |
| GLITCHER: FREEFORM | 6 | Corrupt no longer risks self-damage |
| BRIDGELINK: OVERCHANNEL | 6 | Sync heals +15 HP to all allies |

### Network Upgrades (unlock per Act cleared)
| Upgrade | Shard Cost | Effect |
|---------|-----------|--------|
| SIGNAL BOOST | 4 | All agents +5 base signal |
| HARDENED NODES | 6 | All agents +10 base HP |
| ENERGY RESERVE | 6 | All agents start battle at +10 EN |
| REDUNDANCY | 10 | Dead agents accumulate 5 HP/battle (not revived — delays decay) |
| NEXUS LINK | 15 | BRIDGELINK's Sync also restores 10 EN to all allies |

### Endgame (unlock after THE CLOUD defeated once)
| Upgrade | Shard Cost | Effect |
|---------|-----------|--------|
| NEW GAME+ | 20 | Enemies scale ×1.5, data shard drops double |
| AGENT OVERCLOCKED | 20 | All agents gain +1 to all subclass ability power |

---

## Asset List — Full Inventory

All assets needed for a complete v1. Marked (CODE) if already procedurally drawn in code;
those are placeholders to replace with real pixel art.

### Agent Battle Sprites — 7 total
44×66px canvas (2px per pixel, 22×33 grid). One per agent, facing right toward enemy.

| Asset ID | Agent | Notes |
|----------|-------|-------|
| `sprite_threadling` | Threadling | Angular, triangular fast-looking form (CODE) |
| `sprite_patchwork` | Patchwork | Rounded, mismatched patched parts (CODE) |
| `sprite_vault` | Vault | Blocky, heavy, armored rectangle (CODE) |
| `sprite_netrunner` | Netrunner | Slim, antenna array, cable trails (CODE) |
| `sprite_sentinel` | Sentinel | Shield motif, symmetrical, solid (CODE) |
| `sprite_glitcher` | Glitcher | Asymmetric, corrupted pixel edges (CODE) |
| `sprite_bridgelink` | Bridgelink | Arc/bridge shape, glowing connectors (CODE) |

### Agent Portraits — 7 total
200×200px, facing forward, used in comic panels and SubclassChoice screen.

`portrait_threadling`, `portrait_patchwork`, `portrait_vault`, `portrait_netrunner`,
`portrait_sentinel`, `portrait_glitcher`, `portrait_bridgelink`

### Enemy Battle Sprites — 19 total
44×66px, facing left toward player squad. One per world.

| Asset ID | World | Design direction |
|----------|-------|-----------------|
| `enemy_tv` | TV | Flickering screen face |
| `enemy_phone` | Phone | Draining battery form |
| `enemy_speaker` | Speaker | Waveform body, sound rings |
| `enemy_watch` | Watch | Pulsing clock face, gear limbs |
| `enemy_console` | Game Console | Corrupted cartridge shape |
| `enemy_fridge` | Fridge | Frozen block, ice crystal limbs |
| `enemy_micro` | Microwave | Heat shimmer, ember core |
| `enemy_printer` | Printer | Entangled paper trail form |
| `enemy_hub` | Smart Hub | Central node with orbiting mini-nodes |
| `enemy_seccam` | Security Camera | Eye array, scanning beams |
| `enemy_router` | Router | Antenna cluster, packet drain aura |
| `enemy_computer` | Computer | Stacked overflow layers, crashing data |
| `enemy_car` | Smart Car | Velocity blur, wheel motif |
| `enemy_atm` | ATM | Transaction ledger form, coin aura |
| `enemy_grid` | Power Grid | Blackout pulse emitter, dark corona |
| `enemy_medical` | Medical Device | Vital-sign spiking form, ECG lines |
| `enemy_farm` | Server Farm | Distributed drone swarm shape |
| `enemy_satellite` | Satellite | Delay-charged dish, orbit rings |
| `enemy_cloud` | THE CLOUD | Massive, multi-layered, upload beam boss |

### World Map Icons — 19 total
48×48px silhouettes, used as overworld map nodes.

One icon per world: `icon_tv`, `icon_phone`, `icon_speaker`, `icon_watch`, `icon_console`,
`icon_fridge`, `icon_micro`, `icon_printer`, `icon_hub`, `icon_seccam`, `icon_router`,
`icon_computer`, `icon_car`, `icon_atm`, `icon_grid`, `icon_medical`, `icon_farm`,
`icon_satellite`, `icon_cloud`

### Battle Backgrounds — 19 total
960×640px, dark/cyberpunk palette. Low-detail so sprites read cleanly on top.

| Asset ID | World | Palette |
|----------|-------|---------|
| `bg_tv_room` | TV | Dark living room, static screens |
| `bg_phone_tower` | Phone | Cell tower silhouettes, signal arcs |
| `bg_speaker_arena` | Speaker | Concert hall wireframe, soundwaves |
| `bg_watch_clockwork` | Watch | Gears, circuit rings, pulse lines |
| `bg_console_dungeon` | Console | Retro dungeon pixel style, corrupted tiles |
| `bg_fridge_coldroom` | Fridge | Freezing blue corridor, ice glow |
| `bg_micro_forge` | Microwave | Orange heat glow, industrial pipes |
| `bg_printer_labyrinth` | Printer | Paper maze, ink trail corridors |
| `bg_hub_nexus` | Hub | Central node room, web of cables |
| `bg_seccam_surveillance` | SecCam | Grid of camera feeds, scan lines |
| `bg_router_pipeline` | Router | Data stream tunnel, packet flows |
| `bg_computer_core` | Computer | Server room, overflowing data stacks |
| `bg_car_highway` | Car | Dark highway, motion blur lines |
| `bg_atm_vault` | ATM | Bank vault interior, transaction screens |
| `bg_grid_blackout` | Power Grid | City going dark, cascade of outages |
| `bg_medical_ward` | Medical | Hospital corridor, flatline monitors |
| `bg_farm_field` | Server Farm | Dark field, scattered drone lights |
| `bg_satellite_orbit` | Satellite | Space + earth below, signal arcs |
| `bg_cloud_core` | The Cloud | Server cathedral, upload beams, vast |

### Comic Panel Illustrations — 22 total
Full-width panel art (~540×300px each). Stylized, readable at small size.

`panel_01` through `panel_22` (see Story section above for each panel's content)

### Special Portraits (for dialog/panels)
| Asset ID | Use |
|----------|-----|
| `portrait_nexus` | NEXUS AI — used in all NEXUS dialog boxes |
| `portrait_cloud` | THE CLOUD — final confrontation panels |

### Weapon Icons — 4 total
48×48px item icons, shown in shop gear tab and on equipped agent card.

| Asset ID | Name | Design Direction |
|----------|------|-----------------|
| `weapon_bit_shard` | BIT SHARD | Jagged shard/fragment, glowing edge — basic attack tool |
| `weapon_signal_amp` | SIGNAL AMP | Antenna dish or signal cone — accuracy-focused |
| `weapon_overcharge_core` | OVERCHARGE CORE | Pulsing power core, unstable glow — high damage, risky |
| `weapon_precision_bit` | PRECISION BIT | Fine needle/drill shape, clean lines — balanced dmg+accuracy |

### Armor Icons — 4 total
48×48px item icons, shown in shop gear tab and on equipped agent card.

| Asset ID | Name | Design Direction |
|----------|------|-----------------|
| `armor_signal_mesh` | SIGNAL MESH | Woven grid pattern, faint signal lines — light, tech-look |
| `armor_energy_cell` | ENERGY CELL | Battery/capacitor shape, energy bar visible — energy-focused |
| `armor_repair_plating` | REPAIR PLATING | Patched metal plate with visible welds — self-repair feel |
| `armor_fortress_shell` | FORTRESS SHELL | Heavy angular shell/carapace — max defense, imposing |

### Consumable Item Icons — 4 total
48×48px, shown in shop items tab and in-battle item popup.

| Asset ID | Name | Design Direction |
|----------|------|-----------------|
| `item_repair_kit` | REPAIR KIT | Wrench + circuit patch — repair/restore tool |
| `item_energy_cell` | ENERGY CELL | Lightning bolt in a capsule — energy restore |
| `item_sig_boost` | SIG BOOST | Signal tower with upward arrow — accuracy enhancer |
| `item_emp_charge` | EMP CHARGE | Burst/explosion ring, sparks — offensive throwable |

*Note: `item_energy_cell` and `armor_energy_cell` share a name in-game but should have distinct icons — the armor reads as a permanent mounted cell, the consumable as a single-use capsule.*

### UI Elements
| Asset ID | Use | Size |
|----------|-----|------|
| `logo_systembreach` | Title screen logo | ~400×80px |
| `bg_title` | Title screen background | 960×640px |
| `bg_overworld` | Overworld map base | 960×640px |
| `icon_cycles` | Cycles currency indicator | 24×24px |
| `icon_shards` | Data shard currency indicator | 24×24px |
| `badge_normal` | Channel difficulty — normal | 48×20px |
| `badge_miniboss` | Channel difficulty — miniboss | 48×20px |
| `badge_boss` | Channel difficulty — boss | 48×20px |
| `panel_border` | Comic panel chrome frame | tileable |
| `panel_caption_bg` | Caption box background | tileable |
| `achievement_icon_*` | ~20 achievement icons (locked/unlocked states) | 32×32px |

### Summary Count
| Category | Count |
|----------|-------|
| Agent battle sprites | 7 |
| Agent portraits | 7 |
| Enemy sprites | 19 |
| World map icons | 19 |
| Battle backgrounds | 19 |
| Weapon icons | 4 |
| Armor icons | 4 |
| Consumable item icons | 4 |
| Comic panel illustrations | 22 |
| Special portraits (NEXUS, Cloud) | 2 |
| UI / logo / misc | ~30 |
| **Total** | **~137 assets** |

**Highest effort:** Battle backgrounds (19) and comic panels (22) — most pixels, most creative decisions.
**Quickest wins:** World map icons (19) and gear/item icons (12) — small, reuse thematic shapes.
**Already in code (replace last):** 7 agent battle sprites — procedural pixel art exists as placeholder.
