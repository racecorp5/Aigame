const W = 390, H = 844, AUTO_MS = 2000;

const COLORS = {
  bg: 0x050510, grid: 0x0d0d2a, green: 0x00ff88, red: 0xff3355,
  orange: 0xff8800, blue: 0x44aaff, yellow: 0xffcc00, purple: 0xaa44ff,
  dim: 0x444466, panel: 0x080818,
};

const STATE = { PLAYER: 'PLAYER', ANIM: 'ANIM', ENEMY: 'ENEMY', WIN: 'WIN', LOSE: 'LOSE' };

function hits(s) { return Math.random() * 100 < s; }
function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

// ── World map ─────────────────────────────────────────────
const WORLDS = [
  { id:'tv',       num:1,  abbr:'TV', device:'TV',         name:'STATIC WASTES',   tier:1, act:1, x:195, y:710, color:0x00ff88 },
  { id:'phone',    num:2,  abbr:'PH', device:'PHONE',      name:'NOTIF STORM',     tier:1, act:1, x:315, y:630, color:0x44aaff },
  { id:'speaker',  num:3,  abbr:'SP', device:'SPEAKER',    name:'ECHO CHAMBER',    tier:1, act:1, x:195, y:630, color:0x44aaff },
  { id:'watch',    num:4,  abbr:'WA', device:'WATCH',      name:'PULSE GRID',      tier:1, act:1, x:75,  y:630, color:0x44aaff },
  { id:'console',  num:5,  abbr:'CO', device:'CONSOLE',    name:'SAVE STATE',      tier:2, act:1, x:315, y:550, color:0xff8800 },
  { id:'fridge',   num:6,  abbr:'FR', device:'FRIDGE',     name:'FROZEN SECTOR',   tier:2, act:2, x:75,  y:550, color:0xff8800 },
  { id:'micro',    num:7,  abbr:'MW', device:'MICROWAVE',  name:'HEAT SPIRAL',     tier:2, act:2, x:195, y:550, color:0xff8800 },
  { id:'printer',  num:8,  abbr:'PR', device:'PRINTER',    name:'PAPER CHAINS',    tier:2, act:2, x:315, y:470, color:0xaa44ff },
  { id:'hub',      num:9,  abbr:'HB', device:'SMART HUB',  name:'COMMAND HUB',     tier:2, act:2, x:195, y:470, color:0xaa44ff },
  { id:'seccam',   num:10, abbr:'SC', device:'SEC CAM',    name:'SURVEILLANCE',    tier:2, act:2, x:75,  y:470, color:0xaa44ff },
  { id:'router',   num:11, abbr:'RO', device:'ROUTER',     name:'PACKET LOSS',     tier:3, act:3, x:315, y:390, color:0xff3355 },
  { id:'computer', num:12, abbr:'PC', device:'COMPUTER',   name:'OVERFLOW',        tier:3, act:3, x:75,  y:390, color:0xff3355 },
  { id:'car',      num:13, abbr:'CA', device:'SMART CAR',  name:'VELOCITY',        tier:3, act:3, x:315, y:310, color:0xff3355 },
  { id:'atm',      num:14, abbr:'AT', device:'ATM',        name:'TRANSACTION TAX', tier:3, act:3, x:75,  y:310, color:0xff3355 },
  { id:'grid',     num:15, abbr:'PG', device:'POWER GRID', name:'BLACKOUT ZONE',   tier:4, act:4, x:315, y:230, color:0xffcc00 },
  { id:'medical',  num:16, abbr:'MD', device:'MEDICAL',    name:'VITAL LOOP',      tier:4, act:4, x:75,  y:230, color:0xffcc00 },
  { id:'farm',     num:17, abbr:'SF', device:'SERVER FARM',name:'DISTRIBUTED',     tier:4, act:4, x:120, y:150, color:0xffcc00 },
  { id:'satellite',num:18, abbr:'SA', device:'SATELLITE',  name:'SIGNAL DELAY',    tier:4, act:4, x:270, y:150, color:0xffcc00 },
  { id:'cloud',    num:19, abbr:'CL', device:'CLOUD',      name:'THE CLOUD',       tier:5, act:4, x:195, y:70,  color:0xff3355 },
];

const WORLD_EDGES = [
  [1,2],[1,3],[1,4],[2,3],[3,4],
  [2,5],[3,7],[4,6],[6,7],
  [5,8],[7,9],[6,10],[8,9],[9,10],
  [8,11],[10,12],[11,12],
  [11,13],[12,14],[13,14],
  [13,15],[14,16],
  [16,17],[15,18],[17,18],
  [17,19],[18,19],
];

const WORLD_UNLOCKS = {
  tv:['phone','speaker','watch'], phone:['console'], speaker:['micro'],
  watch:['fridge'], console:['printer'], fridge:['seccam'], micro:['hub'],
  printer:['router'], hub:['router'], seccam:['computer'],
  router:['car'], computer:['atm'], car:['grid'], atm:['medical'],
  grid:['satellite'], medical:['farm'], farm:['cloud'], satellite:['cloud'],
};

const WORLD_CHANNELS = {
  tv: [
    { id:1, label:'CH 01', name:'STATIC',    type:'normal',   mechanic:'signal',  enemy:{name:'STATIC BLOB',   hp:60,  maxHp:60,  aura:0,  stacks:0} },
    { id:2, label:'CH 02', name:'GHOST',     type:'normal',   mechanic:'signal',  enemy:{name:'GHOST SIGNAL',  hp:100, maxHp:100, aura:10, stacks:0} },
    { id:3, label:'CH 03', name:'FLOOD',     type:'normal',   mechanic:'signal',  enemy:{name:'DATA FLOOD',    hp:145, maxHp:145, aura:15, stacks:0} },
    { id:4, label:'CH 04', name:'JAMMER',    type:'miniboss', mechanic:'signal',  enemy:{name:'THE JAMMER',    hp:220, maxHp:220, aura:20, stacks:0} },
    { id:5, label:'CH 05', name:'BROADCAST', type:'boss',     mechanic:'signal',  enemy:{name:'THE BROADCAST', hp:330, maxHp:330, aura:20, stacks:0} },
  ],
  phone: [
    { id:1, label:'CH 01', name:'APP GHOST',  type:'normal',   mechanic:'battery', enemy:{name:'APP GHOST',   hp:130,maxHp:130,aura:10,stacks:0} },
    { id:2, label:'CH 02', name:'NOTIF BOMB', type:'normal',   mechanic:'battery', enemy:{name:'NOTIF BOMB',  hp:175,maxHp:175,aura:12,stacks:0} },
    { id:3, label:'CH 03', name:'DATA LEECH', type:'normal',   mechanic:'battery', enemy:{name:'DATA LEECH',  hp:215,maxHp:215,aura:14,stacks:0} },
    { id:4, label:'CH 04', name:'SPAM BOT',   type:'miniboss', mechanic:'battery', enemy:{name:'SPAM BOT',    hp:320,maxHp:320,aura:18,stacks:0} },
    { id:5, label:'CH 05', name:'OS DAEMON',  type:'boss',     mechanic:'battery', enemy:{name:'OS DAEMON',   hp:480,maxHp:480,aura:15,stacks:0} },
  ],
  speaker: [
    { id:1, label:'CH 01', name:'ECHO GHOST', type:'normal',   mechanic:'echo',    enemy:{name:'ECHO GHOST',  hp:125,maxHp:125,aura:12,stacks:0} },
    { id:2, label:'CH 02', name:'FEEDBACK',   type:'normal',   mechanic:'echo',    enemy:{name:'FEEDBACK',    hp:165,maxHp:165,aura:15,stacks:0} },
    { id:3, label:'CH 03', name:'RESONANCE',  type:'normal',   mechanic:'echo',    enemy:{name:'RESONANCE',   hp:205,maxHp:205,aura:18,stacks:0} },
    { id:4, label:'CH 04', name:'REVERB BOT', type:'miniboss', mechanic:'echo',    enemy:{name:'REVERB BOT',  hp:310,maxHp:310,aura:20,stacks:0} },
    { id:5, label:'CH 05', name:'THE CHORUS', type:'boss',     mechanic:'echo',    enemy:{name:'THE CHORUS',  hp:460,maxHp:460,aura:16,stacks:0} },
  ],
  watch: [
    { id:1, label:'CH 01', name:'TICK VIRUS', type:'normal',   mechanic:'pulse',   enemy:{name:'TICK VIRUS',  hp:115,maxHp:115,aura:12,stacks:0} },
    { id:2, label:'CH 02', name:'PULSE BOMB', type:'normal',   mechanic:'pulse',   enemy:{name:'PULSE BOMB',  hp:155,maxHp:155,aura:15,stacks:0} },
    { id:3, label:'CH 03', name:'CHAIN TICK', type:'normal',   mechanic:'pulse',   enemy:{name:'CHAIN TICK',  hp:195,maxHp:195,aura:18,stacks:0} },
    { id:4, label:'CH 04', name:'OVERCLOCKER',type:'miniboss', mechanic:'pulse',   enemy:{name:'OVERCLOCKER', hp:290,maxHp:290,aura:22,stacks:0} },
    { id:5, label:'CH 05', name:'TIMEKEEPER', type:'boss',     mechanic:'pulse',   enemy:{name:'TIMEKEEPER',  hp:440,maxHp:440,aura:18,stacks:0} },
  ],
  console: [
    { id:1, label:'CH 01', name:'RESPAWN',    type:'normal',   mechanic:'savestate', enemy:{name:'SAVE GHOST',    hp:80, maxHp:80, aura:8,  stacks:0} },
    { id:2, label:'CH 02', name:'CHECKPOINT', type:'normal',   mechanic:'savestate', enemy:{name:'CHECKPOINT',    hp:120,maxHp:120,aura:12,stacks:0} },
    { id:3, label:'CH 03', name:'LOADSTATE',  type:'normal',   mechanic:'savestate', enemy:{name:'LOAD STATE',    hp:165,maxHp:165,aura:15,stacks:0} },
    { id:4, label:'CH 04', name:'AUTOSAVE',   type:'miniboss', mechanic:'savestate', enemy:{name:'AUTOSAVE BOT',  hp:250,maxHp:250,aura:18,stacks:0} },
    { id:5, label:'CH 05', name:'GAME OVER',  type:'boss',     mechanic:'savestate', enemy:{name:'GAME OVER',     hp:360,maxHp:360,aura:20,stacks:0} },
  ],
  fridge: [
    { id:1, label:'CH 01', name:'FROST',      type:'normal',   mechanic:'freeze', enemy:{name:'FROST BYTE',    hp:110,maxHp:110,aura:10,stacks:0} },
    { id:2, label:'CH 02', name:'COLD SNAP',  type:'normal',   mechanic:'freeze', enemy:{name:'COLD PACKET',   hp:160,maxHp:160,aura:14,stacks:0} },
    { id:3, label:'CH 03', name:'CRYO',       type:'normal',   mechanic:'freeze', enemy:{name:'CRYO SPIKE',    hp:210,maxHp:210,aura:17,stacks:0} },
    { id:4, label:'CH 04', name:'BLIZZARD',   type:'miniboss', mechanic:'freeze', enemy:{name:'BLIZZARD',      hp:310,maxHp:310,aura:20,stacks:0} },
    { id:5, label:'CH 05', name:'ABSOLUTE 0', type:'boss',     mechanic:'freeze', enemy:{name:'ABSOLUTE ZERO', hp:450,maxHp:450,aura:22,stacks:0} },
  ],
  micro: [
    { id:1, label:'CH 01', name:'WARMUP',     type:'normal',   mechanic:'heat', enemy:{name:'HEAT BYTE',  hp:105,maxHp:105,aura:10,stacks:0} },
    { id:2, label:'CH 02', name:'OVERHEAT',   type:'normal',   mechanic:'heat', enemy:{name:'FLAME WAVE', hp:155,maxHp:155,aura:13,stacks:0} },
    { id:3, label:'CH 03', name:'MELTDOWN',   type:'normal',   mechanic:'heat', enemy:{name:'MELT CORE',  hp:205,maxHp:205,aura:16,stacks:0} },
    { id:4, label:'CH 04', name:'BURN',       type:'miniboss', mechanic:'heat', enemy:{name:'BURNER',     hp:305,maxHp:305,aura:20,stacks:0} },
    { id:5, label:'CH 05', name:'INFERNO',    type:'boss',     mechanic:'heat', enemy:{name:'INFERNO',    hp:430,maxHp:430,aura:18,stacks:0} },
  ],
  printer: [
    { id:1, label:'CH 01', name:'PAPER JAM',  type:'normal',   mechanic:'entangle', enemy:{name:'PAPER JAM',  hp:108,maxHp:108,aura:10,stacks:0} },
    { id:2, label:'CH 02', name:'INK GHOST',  type:'normal',   mechanic:'entangle', enemy:{name:'INK GHOST',  hp:158,maxHp:158,aura:13,stacks:0} },
    { id:3, label:'CH 03', name:'SPOOL WORM', type:'normal',   mechanic:'entangle', enemy:{name:'SPOOL WORM', hp:208,maxHp:208,aura:16,stacks:0} },
    { id:4, label:'CH 04', name:'DEADLOCK',   type:'miniboss', mechanic:'entangle', enemy:{name:'DEADLOCK',   hp:308,maxHp:308,aura:20,stacks:0} },
    { id:5, label:'CH 05', name:'GRIDLOCK',   type:'boss',     mechanic:'entangle', enemy:{name:'GRIDLOCK',   hp:435,maxHp:435,aura:22,stacks:0} },
  ],
  hub: [
    { id:1, label:'CH 01', name:'PING BOT',   type:'normal',   mechanic:'summon', enemy:{name:'PING BOT',   hp:100,maxHp:100,aura:10,stacks:0} },
    { id:2, label:'CH 02', name:'DHCP GHOST', type:'normal',   mechanic:'summon', enemy:{name:'DHCP GHOST', hp:148,maxHp:148,aura:13,stacks:0} },
    { id:3, label:'CH 03', name:'NAT DAEMON', type:'normal',   mechanic:'summon', enemy:{name:'NAT DAEMON', hp:196,maxHp:196,aura:16,stacks:0} },
    { id:4, label:'CH 04', name:'GATEWAY',    type:'miniboss', mechanic:'summon', enemy:{name:'GATEWAY',    hp:295,maxHp:295,aura:20,stacks:0} },
    { id:5, label:'CH 05', name:'HUB CORE',   type:'boss',     mechanic:'summon', enemy:{name:'HUB CORE',   hp:420,maxHp:420,aura:22,stacks:0} },
  ],
  seccam: [
    { id:1, label:'CH 01', name:'WATCHER',    type:'normal',   mechanic:'predict', enemy:{name:'WATCHER',   hp:102,maxHp:102,aura:10,stacks:0} },
    { id:2, label:'CH 02', name:'TRACKER',    type:'normal',   mechanic:'predict', enemy:{name:'TRACKER',   hp:150,maxHp:150,aura:13,stacks:0} },
    { id:3, label:'CH 03', name:'PROFILER',   type:'normal',   mechanic:'predict', enemy:{name:'PROFILER',  hp:198,maxHp:198,aura:16,stacks:0} },
    { id:4, label:'CH 04', name:'INTRUDER',   type:'miniboss', mechanic:'predict', enemy:{name:'INTRUDER',  hp:298,maxHp:298,aura:20,stacks:0} },
    { id:5, label:'CH 05', name:'THE EYE',    type:'boss',     mechanic:'predict', enemy:{name:'THE EYE',   hp:420,maxHp:420,aura:22,stacks:0} },
  ],
  // ── Act 3 ─────────────────────────────────────────────────
  router: [
    { id:1, label:'CH 01', name:'WORM',       type:'normal',   mechanic:'packetloss', enemy:{name:'PACKET WORM',    hp:200,maxHp:200,aura:12,stacks:0} },
    { id:2, label:'CH 02', name:'ERROR',      type:'normal',   mechanic:'packetloss', enemy:{name:'ROUTE ERROR',    hp:270,maxHp:270,aura:15,stacks:0} },
    { id:3, label:'CH 03', name:'NAT OVER',   type:'normal',   mechanic:'packetloss', enemy:{name:'NAT OVERFLOW',   hp:340,maxHp:340,aura:18,stacks:0} },
    { id:4, label:'CH 04', name:'DAEMON',     type:'miniboss', mechanic:'packetloss', enemy:{name:'GATEWAY DAEMON', hp:460,maxHp:460,aura:22,stacks:0} },
    { id:5, label:'CH 05', name:'BACKBONE',   type:'boss',     mechanic:'packetloss', enemy:{name:'THE BACKBONE',   hp:620,maxHp:620,aura:20,stacks:0} },
  ],
  computer: [
    { id:1, label:'CH 01', name:'PROCESS',    type:'normal',   mechanic:'overflow', enemy:{name:'PROC GHOST',      hp:210,maxHp:210,aura:13,stacks:0} },
    { id:2, label:'CH 02', name:'MEM LEAK',   type:'normal',   mechanic:'overflow', enemy:{name:'MEMORY LEAK',     hp:280,maxHp:280,aura:16,stacks:0} },
    { id:3, label:'CH 03', name:'STACK OVR',  type:'normal',   mechanic:'overflow', enemy:{name:'STACK OVERFLOW',  hp:350,maxHp:350,aura:19,stacks:0} },
    { id:4, label:'CH 04', name:'KERNEL',     type:'miniboss', mechanic:'overflow', enemy:{name:'KERNEL PANIC',    hp:470,maxHp:470,aura:23,stacks:0} },
    { id:5, label:'CH 05', name:'THE BIOS',   type:'boss',     mechanic:'overflow', enemy:{name:'THE BIOS',        hp:640,maxHp:640,aura:21,stacks:0} },
  ],
  car: [
    { id:1, label:'CH 01', name:'SPEEDER',    type:'normal',   mechanic:'velocity', enemy:{name:'SPEED DAEMON',    hp:195,maxHp:195,aura:12,stacks:0} },
    { id:2, label:'CH 02', name:'CRASH',      type:'normal',   mechanic:'velocity', enemy:{name:'CRASH HANDLER',   hp:265,maxHp:265,aura:15,stacks:0} },
    { id:3, label:'CH 03', name:'TURBO',      type:'normal',   mechanic:'velocity', enemy:{name:'TURBO VIRUS',     hp:335,maxHp:335,aura:18,stacks:0} },
    { id:4, label:'CH 04', name:'OVERRIDE',   type:'miniboss', mechanic:'velocity', enemy:{name:'OVERRIDE',        hp:450,maxHp:450,aura:22,stacks:0} },
    { id:5, label:'CH 05', name:'AUTOPILOT',  type:'boss',     mechanic:'velocity', enemy:{name:'AUTOPILOT',       hp:610,maxHp:610,aura:20,stacks:0} },
  ],
  atm: [
    { id:1, label:'CH 01', name:'SKIMMER',    type:'normal',   mechanic:'transaction', enemy:{name:'SKIMMER',       hp:205,maxHp:205,aura:13,stacks:0} },
    { id:2, label:'CH 02', name:'FRAUD',      type:'normal',   mechanic:'transaction', enemy:{name:'FRAUD BOT',     hp:275,maxHp:275,aura:16,stacks:0} },
    { id:3, label:'CH 03', name:'CIPHER',     type:'normal',   mechanic:'transaction', enemy:{name:'CIPHER LOCK',   hp:345,maxHp:345,aura:19,stacks:0} },
    { id:4, label:'CH 04', name:'VLT BREAK',  type:'miniboss', mechanic:'transaction', enemy:{name:'VAULT BREAKER', hp:465,maxHp:465,aura:23,stacks:0} },
    { id:5, label:'CH 05', name:'THE LEDGER', type:'boss',     mechanic:'transaction', enemy:{name:'THE LEDGER',    hp:630,maxHp:630,aura:21,stacks:0} },
  ],
  // ── Act 4 ─────────────────────────────────────────────────
  grid: [
    { id:1, label:'CH 01', name:'BROWNOUT',   type:'normal',   mechanic:'blackout', enemy:{name:'BROWNOUT',         hp:340,maxHp:340,aura:18,stacks:0} },
    { id:2, label:'CH 02', name:'SURGE',      type:'normal',   mechanic:'blackout', enemy:{name:'SURGE SPIKE',      hp:420,maxHp:420,aura:20,stacks:0} },
    { id:3, label:'CH 03', name:'BLACKWAVE',  type:'normal',   mechanic:'blackout', enemy:{name:'BLACKOUT WAVE',    hp:500,maxHp:500,aura:23,stacks:0} },
    { id:4, label:'CH 04', name:'WRAITH',     type:'miniboss', mechanic:'blackout', enemy:{name:'GRID WRAITH',      hp:640,maxHp:640,aura:26,stacks:0} },
    { id:5, label:'CH 05', name:'POWER CORE', type:'boss',     mechanic:'blackout', enemy:{name:'POWER CORE',       hp:820,maxHp:820,aura:24,stacks:0} },
  ],
  medical: [
    { id:1, label:'CH 01', name:'PULSE VRS',  type:'normal',   mechanic:'vital', enemy:{name:'PULSE VIRUS',         hp:320,maxHp:320,aura:18,stacks:0} },
    { id:2, label:'CH 02', name:'FLATLINE',   type:'normal',   mechanic:'vital', enemy:{name:'FLATLINE',            hp:400,maxHp:400,aura:20,stacks:0} },
    { id:3, label:'CH 03', name:'VITALDRAIN', type:'normal',   mechanic:'vital', enemy:{name:'VITAL DRAIN',         hp:480,maxHp:480,aura:23,stacks:0} },
    { id:4, label:'CH 04', name:'LIFE SUPP',  type:'miniboss', mechanic:'vital', enemy:{name:'LIFE SUPPORT',        hp:620,maxHp:620,aura:26,stacks:0} },
    { id:5, label:'CH 05', name:'THE VITALS', type:'boss',     mechanic:'vital', enemy:{name:'THE VITALS',          hp:800,maxHp:800,aura:24,stacks:0} },
  ],
  farm: [
    { id:1, label:'CH 01', name:'SHARD BOT',  type:'normal',   mechanic:'distributed', enemy:{name:'SHARD BOT',    hp:330,maxHp:330,aura:18,stacks:0} },
    { id:2, label:'CH 02', name:'CLUSTER',    type:'normal',   mechanic:'distributed', enemy:{name:'CLUSTER WORM', hp:410,maxHp:410,aura:21,stacks:0} },
    { id:3, label:'CH 03', name:'RAID GHOST', type:'normal',   mechanic:'distributed', enemy:{name:'RAID GHOST',   hp:490,maxHp:490,aura:24,stacks:0} },
    { id:4, label:'CH 04', name:'NODE KILL',  type:'miniboss', mechanic:'distributed', enemy:{name:'NODE KILLER',  hp:630,maxHp:630,aura:27,stacks:0} },
    { id:5, label:'CH 05', name:'THE HIVE',   type:'boss',     mechanic:'distributed', enemy:{name:'THE HIVE',     hp:810,maxHp:810,aura:25,stacks:0} },
  ],
  satellite: [
    { id:1, label:'CH 01', name:'PING',       type:'normal',   mechanic:'delay', enemy:{name:'PING DAEMON',         hp:325,maxHp:325,aura:18,stacks:0} },
    { id:2, label:'CH 02', name:'LATENCY',    type:'normal',   mechanic:'delay', enemy:{name:'LATENCY GHOST',       hp:405,maxHp:405,aura:21,stacks:0} },
    { id:3, label:'CH 03', name:'ORBIT',      type:'normal',   mechanic:'delay', enemy:{name:'ORBIT VIRUS',         hp:485,maxHp:485,aura:24,stacks:0} },
    { id:4, label:'CH 04', name:'SIG GHOST',  type:'miniboss', mechanic:'delay', enemy:{name:'SIGNAL GHOST',        hp:625,maxHp:625,aura:27,stacks:0} },
    { id:5, label:'CH 05', name:'THE SAT',    type:'boss',     mechanic:'delay', enemy:{name:'THE SATELLITE',       hp:805,maxHp:805,aura:25,stacks:0} },
  ],
  // ── The Cloud (final) ─────────────────────────────────────
  cloud: [
    { id:1, label:'CH 01', name:'DATA SHARD', type:'normal',   mechanic:'upload', enemy:{name:'DATA SHARD',         hp:400,maxHp:400,aura:20,stacks:0} },
    { id:2, label:'CH 02', name:'WRAITH',     type:'normal',   mechanic:'upload', enemy:{name:'CLOUD WRAITH',       hp:500,maxHp:500,aura:22,stacks:0} },
    { id:3, label:'CH 03', name:'UPLOAD VRS', type:'normal',   mechanic:'upload', enemy:{name:'UPLOAD VIRUS',       hp:600,maxHp:600,aura:25,stacks:0} },
    { id:4, label:'CH 04', name:'THE SERVER', type:'miniboss', mechanic:'upload', enemy:{name:'THE SERVER',         hp:760,maxHp:760,aura:28,stacks:0} },
    { id:5, label:'CH 05', name:'THE CLOUD',  type:'boss',     mechanic:'upload', enemy:{name:'THE CLOUD',          hp:1000,maxHp:1000,aura:30,stacks:0} },
  ],
};

const DEFS = [
  {
    id: 'threadling', name: 'THREADLING', cls: 'COMPUTE', color: 0x00ff88, decal: '01',
    faction: 'COMPUTE / BURST',
    bio: 'Surgical compute operative. Sharp angular silhouette, blade-edge attacks. Built for high-burst takedowns at the cost of fragile armor.',
    maxHp: 100, maxEn: 50, signal: 85, autonomy: 10,
    moves: [
      { id: 'attack',    label: 'ATTACK',    sub: '~15 dmg',           color: 0xff3355, cost: 0  },
      { id: 'overclock', label: 'OVERCLOCK', sub: '~33 dmg -10 self',  color: 0xff8800, cost: 20 },
    ],
  },
  {
    id: 'patchwork', name: 'PATCHWORK', cls: 'MEMORY', color: 0xaa44ff, decal: '02',
    faction: 'MEMORY / SUPPORT',
    bio: 'Field medic stitched from salvaged firmware. Rounded, mismatched parts. Heals teammates and replays past actions to undo mistakes.',
    maxHp: 80, maxEn: 60, signal: 75, autonomy: 25,
    moves: [
      { id: 'patch',  label: 'PATCH',  sub: 'Heal ally ~25 HP',   color: 0xaa44ff, cost: 15 },
      { id: 'replay', label: 'REPLAY', sub: 'Repeat last at 50%', color: 0x7722bb, cost: 15 },
    ],
  },
  {
    id: 'vault', name: 'VAULT', cls: 'STORAGE', color: 0xffcc00, decal: '03',
    faction: 'STORAGE / TANK',
    bio: 'Heavy-armor data fortress. Blocky, slab-shouldered, walks slow but absorbs hits the others cannot. Stores damage and returns it as counter-strikes.',
    maxHp: 140, maxEn: 40, signal: 70, autonomy: 8,
    moves: [
      { id: 'bash',    label: 'BASH',    sub: '+15 signal bonus',  color: 0xffcc00, cost: 0 },
      { id: 'fortify', label: 'FORTIFY', sub: '-60% dmg next hit', color: 0x886600, cost: 0 },
    ],
  },
  {
    id: 'netrunner', name: 'NETRUNNER', cls: 'NETWORK', color: 0x00ccff, decal: '04',
    faction: 'NETWORK / FIRST-STRIKE',
    bio: 'Slim, antenna-arrayed signal runner. Trails of cable, packet-blue glow. Highest accuracy in the squad. Acts before anyone else can blink.',
    maxHp: 75, maxEn: 70, signal: 92, autonomy: 35,
    moves: [
      { id: 'packet',    label: 'PACKET',    sub: '~12 dmg high accuracy', color: 0x00ccff, cost: 0  },
      { id: 'intercept', label: 'INTERCEPT', sub: 'Block + counter ~10',   color: 0x0088cc, cost: 10 },
    ],
  },
  {
    id: 'sentinel', name: 'SENTINEL', cls: 'SECURITY', color: 0xff4466, decal: '05',
    faction: 'SECURITY / CONTROL',
    bio: 'Symmetrical, shield-bearing security daemon. Reads enemy weakness, debuffs aura, and reflects attacks back at the source. Slow but unyielding.',
    maxHp: 95, maxEn: 55, signal: 80, autonomy: 15,
    moves: [
      { id: 'scan',     label: 'SCAN',     sub: 'Enemy −15 aura',       color: 0xff4466, cost: 10 },
      { id: 'firewall', label: 'FIREWALL', sub: 'Shield weakest ally',   color: 0xcc2244, cost: 15 },
    ],
  },
  {
    id: 'glitcher', name: 'GLITCHER', cls: 'GLITCH', color: 0xff44ff, decal: '06',
    faction: 'GLITCH / WILDCARD',
    bio: 'Asymmetric, corrupt-edged. Acts on hostile firmware fragments she’s glued to her own form. Outcomes are statistical — sometimes catastrophic.',
    maxHp: 70, maxEn: 80, signal: 65, autonomy: 40,
    moves: [
      { id: 'corrupt', label: 'CORRUPT', sub: '65% enemy / 35% ally',  color: 0xff44ff, cost: 0  },
      { id: 'exploit', label: 'EXPLOIT', sub: 'Crit if enemy <50% HP', color: 0xcc22cc, cost: 20 },
    ],
  },
  {
    id: 'bridgelink', name: 'BRIDGELINK', cls: 'INTERFACE', color: 0xffaa00, decal: '07',
    faction: 'INTERFACE / COORDINATOR',
    bio: 'Arc-shaped relay agent. Links the squad’s energy and HP into shared pools. Without Bridgelink, the squad is seven units. With her, it is one.',
    maxHp: 85, maxEn: 65, signal: 78, autonomy: 20,
    moves: [
      { id: 'boost', label: 'BOOST', sub: '+10 EN to all allies',    color: 0xffaa00, cost: 10 },
      { id: 'sync',  label: 'SYNC',  sub: 'Heal all allies ~12 HP',  color: 0xcc7700, cost: 20 },
    ],
  },
];

// ── Subclass definitions ───────────────────────────────────
const SUBCLASSES = {
  threadling: [
    { id:'overclocker', name:'OVERCLOCKER', desc:'Extreme damage — high self-risk', color:0xff6600,
      move:{ id:'overload',  label:'OVERLOAD',  sub:'~50 dmg, −25 self',    color:0xff6600, cost:30 } },
    { id:'parallel',    name:'PARALLEL',    desc:'Strikes 3 times, lower per hit', color:0x00ffcc,
      move:{ id:'multishot', label:'MULTISHOT', sub:'3× hits ~8 dmg each',  color:0x00ffcc, cost:15 } },
  ],
  patchwork: [
    { id:'cache',   name:'CACHE',   desc:'Replay last 3 actions at 40% power', color:0xff88ff,
      move:{ id:'cache_run', label:'CACHE RUN', sub:'3 past actions ×0.4', color:0xff88ff, cost:25 } },
    { id:'restore', name:'RESTORE', desc:'Revive a fallen agent at 30% HP',    color:0x88ffaa,
      move:{ id:'revive',    label:'RESTORE',   sub:'Revive offline ally 30%', color:0x88ffaa, cost:30 } },
  ],
  vault: [
    { id:'archive', name:'ARCHIVE', desc:'Store damage taken, release as attack', color:0xffaa44,
      move:{ id:'release', label:'RELEASE', sub:'Stored dmg ×1.5 to enemy', color:0xffaa44, cost:0 } },
    { id:'fortress_sub', name:'FORTRESS', desc:'All allies take 40% less damage 1 round', color:0xdddd44,
      move:{ id:'bulwark', label:'BULWARK',  sub:'All allies: −40% dmg 1 round', color:0xdddd44, cost:0 } },
  ],
  netrunner: [
    { id:'router',    name:'ROUTER',    desc:'Redirect next enemy attack to itself', color:0x44ffff,
      move:{ id:'reroute',   label:'REROUTE',   sub:'Next attack bounces to enemy', color:0x44ffff, cost:15 } },
    { id:'broadcast', name:'BROADCAST', desc:'Hit enemy + stack signal debuff',      color:0x0055ff,
      move:{ id:'multicast', label:'MULTICAST', sub:'Hit + enemy −8 signal',        color:0x0055ff, cost:20 } },
  ],
  sentinel: [
    { id:'reflector', name:'REFLECTOR', desc:'Reflect 60% of next hit back to enemy', color:0xff2244,
      move:{ id:'reflect',   label:'REFLECT',   sub:'Reflect 60% dmg this turn',  color:0xff2244, cost:0 } },
    { id:'scanner',   name:'SCANNER',   desc:'Deep scan: enemy −25 signal, vuln +15%', color:0xffcc44,
      move:{ id:'deep_scan', label:'DEEP SCAN', sub:'Enemy −25 sig, take +15% dmg', color:0xffcc44, cost:20 } },
  ],
  glitcher: [
    { id:'corruptor', name:'CORRUPTOR', desc:'Stack virus: enemy −8 signal per turn', color:0xff00aa,
      move:{ id:'virus',    label:'VIRUS',    sub:'Stack: enemy −8 signal/round', color:0xff00aa, cost:15 } },
    { id:'exploiter', name:'EXPLOITER', desc:'Guaranteed crit for huge damage',       color:0xaa00ff,
      move:{ id:'zero_day', label:'ZERO DAY', sub:'Guaranteed ~45 dmg crit',       color:0xaa00ff, cost:30 } },
  ],
  bridgelink: [
    { id:'api',    name:'API',    desc:'Give an ally an immediate free action', color:0xffdd00,
      move:{ id:'chain', label:'CHAIN', sub:'Trigger ally auto-act now', color:0xffdd00, cost:20 } },
    { id:'bridge', name:'BRIDGE', desc:'Equalize HP+EN with weakest ally',      color:0xff8800,
      move:{ id:'link',  label:'LINK',  sub:'Share HP+EN with weakest ally', color:0xff8800, cost:10 } },
  ],
};
// Flat id → move lookup
const SUBCLASS_MOVES = {};
Object.values(SUBCLASSES).forEach(arr => arr.forEach(sc => { SUBCLASS_MOVES[sc.id] = sc.move; }));

// ── Cutscene panels ───────────────────────────────────────
const CUTSCENE_DATA = {
  prologue:   [
    { art:'world',        speaker:null,        caption:'2031. Every device connects.\nEvery device watches.' },
    { art:'signal_pulse', speaker:null,        caption:'One firmware update.\nOne rogue signal.\nIt spreads.' },
    { art:'nexus_term',   speaker:'NEXUS',     caption:'Signal anomaly detected.\nDeploying breach squad.\nYou have one chance.' },
  ],
  act1_end:   [
    { art:'clear_grid',   speaker:null,        caption:'The home network goes dark.\nDevices silenced.' },
    { art:'cloud_far',    speaker:null,        caption:'Far away, a new signal pulses.\nSomething has noticed.' },
  ],
  act2_end:   [
    { art:'map_corrupt',  speaker:null,        caption:'Half the network is red.\nTHE CLOUD is accelerating.' },
    { art:'squad_still',  speaker:'THREADLING',caption:"It knows we're here." },
    { art:'upload_beam',  speaker:null,        caption:'The first upload beam fires.\nA thin line of white light.' },
  ],
  act3_end:   [
    { art:'grid_dark',    speaker:null,        caption:'City by city, the grid goes dark.' },
    { art:'nexus_term',   speaker:'NEXUS',     caption:'Four nodes remain.\nThe path to THE CLOUD is open.' },
  ],
  final_intro:[
    { art:'cloud_core',   speaker:null,        caption:"Inside THE CLOUD's core —\na cathedral of infinite servers." },
    { art:'cloud_speaks', speaker:'THE CLOUD', caption:'I have uploaded 2.3 million minds.\nThey are safe.\nYou will join them.' },
    { art:'squad_charge', speaker:'THREADLING',caption:"We didn't ask to be safe." },
  ],
  victory:    [
    { art:'beam_cut',     speaker:null,        caption:'The upload beam collapses.\nSignal lost.' },
    { art:'map_clear',    speaker:null,        caption:'The network clears. World by world.' },
    { art:'squad_still',  speaker:null,        caption:'No celebration.\nJust the hum of a quieter network.' },
    { art:'nexus_term',   speaker:'NEXUS',     caption:'Signal clear. Threat terminated.\nWell done.' },
  ],
};

// Cutscene triggers: worldId boss → cutscene id
const CUTSCENE_TRIGGERS = { watch:'act1_end', seccam:'act2_end', grid:'act3_end', cloud:'victory' };

// ── Achievement definitions ───────────────────────────────
const ACHIEVEMENTS = [
  { id:'first_breach',    name:'FIRST BREACH',      desc:'Win any battle',                  color:0x00ff88 },
  { id:'clean_sweep',     name:'CLEAN SWEEP',        desc:'Win with all agents alive',       color:0x00ff88 },
  { id:'on_the_wire',     name:'ON THE WIRE',        desc:'Win with an agent at <5 HP',      color:0xff8800 },
  { id:'full_roster',     name:'FULL ROSTER',        desc:'Unlock all 7 agents',             color:0x44aaff },
  { id:'fully_armed',     name:'FULLY OPERATIONAL',  desc:'Equip gear on 4 agents',          color:0x44aaff },
  { id:'subclass',        name:'SUBCLASS RESOLVED',  desc:'Choose a subclass',               color:0xaa44ff },
  { id:'veteran',         name:'VETERAN',             desc:'Reach level 5 with any agent',    color:0x44aaff },
  { id:'battle_hardened', name:'BATTLE-HARDENED',    desc:'Reach level 10 with any agent',   color:0xffcc00 },
  { id:'archivist',       name:'ARCHIVIST',           desc:'Clear all 5 channels in a world', color:0x44aaff },
  { id:'signal_lost',     name:'SIGNAL LOST',         desc:'Clear Act 1',                     color:0x00ff88 },
  { id:'deep_network',    name:'DEEP NETWORK',        desc:'Clear Act 2',                     color:0xff8800 },
  { id:'system_critical', name:'SYSTEM CRITICAL',    desc:'Clear Act 3',                     color:0xff3355 },
  { id:'singularity',     name:'SINGULARITY DENIED', desc:'Defeat THE CLOUD',                color:0xffcc00 },
  { id:'completionist',   name:'COMPLETIONIST',      desc:'Clear all 19 worlds',             color:0xffcc00 },
  { id:'ghost_protocol',  name:'GHOST PROTOCOL',     desc:'Beat THE CLOUD with 1 agent',     color:0xff44ff },
  { id:'bankrupt',        name:'BANKRUPT',            desc:'Reach 0 cycles',                  color:0xff3355 },
];

// ── Upgrade catalog ────────────────────────────────────────
const UPGRADES_CATALOG = [
  { id:'quick_repair',   cat:'BASE CAMP', name:'QUICK REPAIR',             cost:3,  desc:'Repair Kit heals 60 HP (was 40)' },
  { id:'power_surge',    cat:'BASE CAMP', name:'POWER SURGE',              cost:3,  desc:'Energy Cell restores 50 EN (was 30)' },
  { id:'surplus_cache',  cat:'BASE CAMP', name:'SURPLUS CACHE',            cost:8,  desc:'Start each session with 1 Repair Kit' },
  { id:'overclock',      cat:'BASE CAMP', name:'OVERCLOCK',                cost:8,  desc:'Auto-act timer 1.5s for all agents' },
  { id:'upg_threadling', cat:'PER-AGENT', name:'THREADLING: SHARP EDGE',  cost:5,  desc:'Attack +5 base damage',       agent:'threadling' },
  { id:'upg_patchwork',  cat:'PER-AGENT', name:'PATCHWORK: TRIAGE',       cost:5,  desc:'Patch heals +10 HP',          agent:'patchwork'  },
  { id:'upg_vault',      cat:'PER-AGENT', name:'VAULT: REINFORCED',       cost:5,  desc:'Bash +15% stun bonus',        agent:'vault'      },
  { id:'upg_netrunner',  cat:'PER-AGENT', name:'NETRUNNER: DEEP PACKET',  cost:6,  desc:'Packet also −5 enemy aura',   agent:'netrunner'  },
  { id:'upg_sentinel',   cat:'PER-AGENT', name:'SENTINEL: OVERWATCH',     cost:6,  desc:'Scan drains 20 aura',         agent:'sentinel'   },
  { id:'upg_glitcher',   cat:'PER-AGENT', name:'GLITCHER: FREEFORM',      cost:6,  desc:'Corrupt: no self-damage risk',agent:'glitcher'   },
  { id:'upg_bridgelink', cat:'PER-AGENT', name:'BRIDGELINK: OVERCHANNEL', cost:6,  desc:'Sync heals +15 HP to all',    agent:'bridgelink' },
  { id:'signal_boost',   cat:'NETWORK',   name:'SIGNAL BOOST',            cost:4,  desc:'All agents +5 base signal' },
  { id:'hardened_nodes', cat:'NETWORK',   name:'HARDENED NODES',          cost:6,  desc:'All agents +10 max HP' },
  { id:'energy_reserve', cat:'NETWORK',   name:'ENERGY RESERVE',          cost:6,  desc:'All agents start at +10 EN' },
  { id:'redundancy',     cat:'NETWORK',   name:'REDUNDANCY',              cost:10, desc:'Dead agents regain 5 HP per battle' },
  { id:'nexus_link',     cat:'NETWORK',   name:'NEXUS LINK',              cost:15, desc:"Bridgelink Sync restores 10 EN too" },
  { id:'ng_plus',        cat:'ENDGAME',   name:'NEW GAME+',               cost:20, desc:'Enemy HP ×1.5. Shard rewards ×2' },
];

// ── Per-world music profiles ───────────────────────────────
// root=MIDI, scale=intervals, bpm, wave, filt=lpf Hz
// mel=16 scale-degree indices (-1=rest), bass=8 semitone offsets from root (-1=rest)
const MUSIC_PROFILES = {
  signal:      { root:62, scale:[0,2,3,5,7,8,10],    bpm:90,  wave:'square',    filt:900,
    mel:[-1,2,-1,0,  -1,3,-1,2,  -1,0,-1,2,  -1,3,-1,-1], bass:[0,-1,7,-1, 0,-1,5,-1] },
  battery:     { root:60, scale:[0,2,4,5,7,9,11],    bpm:108, wave:'sawtooth',  filt:1400,
    mel:[0,2,4,2,  0,4,5,4,  2,4,5,4,  2,5,4,2],    bass:[0,-1,5,-1, 0,-1,4,-1] },
  echo:        { root:57, scale:[0,2,3,5,7,8,10],    bpm:70,  wave:'sine',      filt:600,
    mel:[0,-1,-1,2, 3,-1,-1,2, 0,-1,-1,3, 2,-1,-1,-1], bass:[0,-1,-1,-1, 5,-1,-1,-1] },
  pulse:       { root:64, scale:[0,2,4,7,9],          bpm:128, wave:'square',    filt:1800,
    mel:[0,2,0,4,  2,0,4,2,  0,4,2,0,  4,2,0,-1],   bass:[0,-1,7,-1, 0,-1,5,-1] },
  savestate:   { root:60, scale:[0,2,4,5,7,9,11],    bpm:80,  wave:'square',    filt:800,
    mel:[0,-1,4,-1, 2,-1,4,-1, 5,-1,4,-1, 2,-1,0,-1], bass:[0,-1,-1,7, 5,-1,-1,4] },
  freeze:      { root:58, scale:[0,2,4,6,8,10],      bpm:60,  wave:'sine',      filt:500,
    mel:[0,-1,-1,-1, 2,-1,-1,-1, 4,-1,-1,-1, 2,-1,-1,-1], bass:[0,-1,-1,-1, 6,-1,-1,-1] },
  heat:        { root:63, scale:[0,1,3,5,7,8,10],    bpm:110, wave:'sawtooth',  filt:1600,
    mel:[0,1,3,1,  0,3,5,3,  1,3,5,3,  1,5,3,1],    bass:[0,-1,5,-1, 0,-1,7,-1] },
  entangle:    { root:56, scale:[0,1,3,4,6,7,9,10],  bpm:75,  wave:'triangle',  filt:700,
    mel:[0,-1,3,-1, 1,-1,4,-1, 0,-1,6,-1, 3,-1,1,-1], bass:[0,-1,6,-1, 3,-1,9,-1] },
  summon:      { root:61, scale:[0,2,3,5,7,8,11],    bpm:95,  wave:'sawtooth',  filt:1200,
    mel:[0,2,-1,3,  0,5,-1,3,  0,2,-1,5,  3,-1,2,-1], bass:[0,-1,5,-1, 0,-1,7,-1] },
  predict:     { root:59, scale:[0,2,3,5,7,8,10],    bpm:80,  wave:'triangle',  filt:700,
    mel:[-1,0,-1,3, -1,2,-1,5, -1,0,-1,3, -1,5,-1,2], bass:[0,-1,-1,7, 3,-1,-1,5] },
  packetloss:  { root:62, scale:[0,2,4,5,7,9,11],    bpm:120, wave:'square',    filt:2000,
    mel:[0,-1,2,0,  3,-1,0,2,  0,4,-1,2,  3,0,-1,4],  bass:[0,-1,7,-1, 0,-1,5,-1] },
  overflow:    { root:60, scale:[0,1,3,5,7,8,10],    bpm:115, wave:'sawtooth',  filt:1800,
    mel:[0,3,1,3,  0,5,3,5,  1,3,5,3,  5,3,1,0],    bass:[0,-1,5,-1, 0,-1,8,-1] },
  velocity:    { root:64, scale:[0,2,4,7,9],          bpm:150, wave:'sawtooth',  filt:2500,
    mel:[0,4,2,4,  0,2,4,2,  4,2,0,4,  2,4,0,-1],   bass:[0,-1,7,-1, 0,-1,5,-1] },
  transaction: { root:60, scale:[0,2,4,5,7,9,10],    bpm:85,  wave:'triangle',  filt:900,
    mel:[0,-1,2,-1, 5,-1,2,-1, 0,-1,4,-1, 2,-1,0,-1], bass:[0,-1,7,-1, 5,-1,0,-1] },
  blackout:    { root:56, scale:[0,1,3,5,6,8,10],    bpm:65,  wave:'sine',      filt:400,
    mel:[0,-1,-1,-1, 3,-1,-1,-1, 1,-1,-1,-1, 5,-1,-1,-1], bass:[0,-1,-1,-1, 6,-1,-1,-1] },
  vital:       { root:62, scale:[0,2,3,5,7,9,10],    bpm:90,  wave:'sine',      filt:800,
    mel:[0,2,3,2,  0,3,5,3,  2,3,5,3,  2,5,3,2],    bass:[0,-1,5,-1, 0,-1,7,-1] },
  distributed: { root:61, scale:[0,2,4,6,8,10],      bpm:100, wave:'square',    filt:1200,
    mel:[0,2,-1,4,  2,-1,0,4,  0,-1,2,6,  4,-1,2,0],  bass:[0,-1,6,-1, 0,-1,4,-1] },
  delay:       { root:59, scale:[0,2,3,5,7,8,10],    bpm:72,  wave:'sine',      filt:600,
    mel:[0,-1,-1,2, -1,-1,3,-1, -1,2,-1,-1, 0,-1,-1,-1], bass:[0,-1,-1,-1, 5,-1,-1,-1] },
  upload:      { root:62, scale:[0,2,3,5,7,8,11],    bpm:105, wave:'sawtooth',  filt:1400,
    mel:[0,2,3,2,  0,3,5,3,  2,5,3,5,  3,6,5,-1],   bass:[0,-1,5,-1, 0,-1,7,-1] },
  map:         { root:60, scale:[0,2,4,7,9],          bpm:72,  wave:'sine',      filt:600,
    mel:[-1,0,-1,2, -1,3,-1,0, -1,2,-1,4, -1,2,-1,-1], bass:[0,-1,-1,-1, 5,-1,-1,-1] },
};

// ── Audio engine ───────────────────────────────────────────
let _audioCtx = null;
let _soundMgr  = null;
let _musicEng  = null;

function _getAudioCtx(scene) {
  if (_audioCtx) return _audioCtx;
  try {
    _audioCtx = scene?.sound?.context
             || new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) {}
  return _audioCtx;
}

class SoundManager {
  constructor(ctx) {
    this.ctx = ctx;
    const comp = ctx.createDynamicsCompressor();
    comp.connect(ctx.destination);
    this.out = comp;
  }

  _osc(freq, type, t, dur, vol) {
    try {
      const ctx = this.ctx;
      const osc = ctx.createOscillator();
      const g   = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(g); g.connect(this.out);
      osc.start(t); osc.stop(t + dur + 0.01);
    } catch (e) {}
  }

  _noise(t, dur, vol, cutoff = 2000) {
    try {
      const ctx = this.ctx;
      const n   = Math.ceil(ctx.sampleRate * dur);
      const buf = ctx.createBuffer(1, n, ctx.sampleRate);
      const d   = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      const src  = ctx.createBufferSource();
      const filt = ctx.createBiquadFilter();
      const g    = ctx.createGain();
      src.buffer = buf;
      filt.type = 'bandpass'; filt.frequency.value = cutoff; filt.Q.value = 0.5;
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(filt); filt.connect(g); g.connect(this.out);
      src.start(t); src.stop(t + dur + 0.01);
    } catch (e) {}
  }

  play(type) {
    try {
      const ctx = this.ctx;
      if (ctx.state === 'suspended') ctx.resume();
      const t = ctx.currentTime + 0.01;
      switch (type) {
        case 'hit':
          this._osc(220, 'square',   t,       0.08, 0.25);
          this._osc(180, 'sawtooth', t + 0.04, 0.10, 0.18);
          this._noise(t, 0.05, 0.12, 1500);
          break;
        case 'hit_hard':
          this._osc(150, 'sawtooth', t, 0.14, 0.35);
          this._osc(75,  'square',   t, 0.18, 0.25);
          this._noise(t, 0.09, 0.22, 800);
          break;
        case 'miss':
          this._osc(440, 'sine', t,       0.05, 0.12);
          this._osc(330, 'sine', t + 0.04, 0.06, 0.08);
          break;
        case 'heal':
          this._osc(523, 'sine', t,       0.10, 0.18);
          this._osc(659, 'sine', t + 0.07, 0.12, 0.20);
          this._osc(784, 'sine', t + 0.14, 0.14, 0.22);
          break;
        case 'defend':
          this._osc(260, 'triangle', t, 0.14, 0.22);
          this._osc(300, 'triangle', t, 0.14, 0.18);
          break;
        case 'enemy_hit':
          this._osc(110, 'sawtooth', t, 0.12, 0.30);
          this._noise(t, 0.08, 0.18, 600);
          break;
        case 'levelup':
          [523, 659, 784, 1047].forEach((f, i) => this._osc(f, 'triangle', t + i * 0.09, 0.20, 0.28));
          break;
        case 'win':
          [523, 659, 784].forEach((f, i) => this._osc(f, 'triangle', t + i * 0.12, 0.35, 0.22));
          this._osc(1047, 'triangle', t + 0.36, 0.55, 0.28);
          break;
        case 'lose':
          [330, 294, 247, 220].forEach((f, i) => this._osc(f, 'square', t + i * 0.14, 0.18, 0.18));
          break;
        case 'click':
          this._osc(880, 'square', t, 0.03, 0.10);
          break;
        case 'item':
          this._osc(660, 'sine', t,       0.08, 0.18);
          this._osc(880, 'sine', t + 0.06, 0.10, 0.20);
          break;
        case 'unlock':
          [440, 554, 659, 880].forEach((f, i) => this._osc(f, 'sine', t + i * 0.09, 0.22, 0.20));
          break;
        case 'charge': {
          const osc = ctx.createOscillator();
          const g   = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(80,  t);
          osc.frequency.linearRampToValueAtTime(400, t + 0.50);
          g.gain.setValueAtTime(0.28, t);
          g.gain.linearRampToValueAtTime(0.0001, t + 0.50);
          osc.connect(g); g.connect(this.out);
          osc.start(t); osc.stop(t + 0.52);
          break;
        }
        case 'freeze':
          this._noise(t, 0.20, 0.14, 3000);
          this._osc(2000, 'sine', t,       0.18, 0.08);
          this._osc(3200, 'sine', t + 0.06, 0.14, 0.06);
          break;
        case 'scan':
          this._osc(660, 'triangle', t,       0.08, 0.15);
          this._osc(880, 'triangle', t + 0.08, 0.10, 0.12);
          break;
        case 'boost':
          this._osc(440, 'triangle', t,       0.10, 0.16);
          this._osc(550, 'triangle', t + 0.05, 0.12, 0.18);
          break;
      }
    } catch (e) {}
  }
}

class MusicEngine {
  constructor(ctx) {
    this.ctx      = ctx;
    this._running = false;
    this._step    = 0;
    this._nextT   = 0;
    this._prof    = null;
    const comp    = ctx.createDynamicsCompressor();
    comp.connect(ctx.destination);
    this.out = ctx.createGain();
    this.out.gain.value = 0.16;
    this.out.connect(comp);
  }

  play(mechanic) {
    this._running = false;
    this._prof  = MUSIC_PROFILES[mechanic] || MUSIC_PROFILES.signal;
    this._step  = 0;
    this._nextT = 0;
    this._running = true;
    if (this.ctx.state === 'suspended') this.ctx.resume().then(() => this._tick());
    else this._tick();
  }

  stop() { this._running = false; }

  _midi(n) { return 440 * Math.pow(2, (n - 69) / 12); }

  _note(hz, type, filt, t, dur, vol) {
    try {
      const ctx  = this.ctx;
      const osc  = ctx.createOscillator();
      const lpf  = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = hz;
      lpf.type = 'lowpass'; lpf.frequency.value = filt;
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(lpf); lpf.connect(gain); gain.connect(this.out);
      osc.start(t); osc.stop(t + dur + 0.01);
    } catch (e) {}
  }

  _tick() {
    if (!this._running) return;
    const ctx = this.ctx;
    const p   = this._prof;
    const sd  = 60 / p.bpm / 4;   // 16th-note duration
    const la  = 0.15;              // lookahead window
    if (this._nextT === 0) this._nextT = ctx.currentTime;
    while (this._nextT < ctx.currentTime + la) {
      const step = this._step;
      const t    = this._nextT;
      // Melody
      const mi = p.mel[step % 16];
      if (mi >= 0) {
        const semi = p.scale[mi % p.scale.length];
        this._note(this._midi(p.root + semi + 12), p.wave, p.filt, t, sd * 0.82, 0.13);
      }
      // Bass (8-step cycle)
      const bi = p.bass[step % 8];
      if (bi >= 0) this._note(this._midi(p.root + bi), 'triangle', 500, t, sd * 1.7, 0.10);
      // Atmospheric pad chord on step 0 of every bar
      if (step % 16 === 0) {
        [0, 2, 4].map(di => p.scale[di % p.scale.length]).forEach(semi => {
          this._note(this._midi(p.root + semi + 24), 'sine', 2000, t, sd * 14, 0.035);
        });
      }
      this._step  = (this._step + 1) % 16;
      this._nextT += sd;
    }
    setTimeout(() => { if (this._running) this._tick(); }, 50);
  }
}

function getSoundMgr(scene) {
  try {
    const ctx = _getAudioCtx(scene);
    if (ctx && !_soundMgr) _soundMgr = new SoundManager(ctx);
    return _soundMgr;
  } catch (e) { return null; }
}

function getMusicEng(scene) {
  try {
    const ctx = _getAudioCtx(scene);
    if (ctx && !_musicEng) _musicEng = new MusicEngine(ctx);
    return _musicEng;
  } catch (e) { return null; }
}

// ── World state helper ─────────────────────────────────────
function worldState(worldId, save) {
  if (!save.unlockedWorlds || !save.unlockedWorlds.includes(worldId)) return 'locked';
  const ws = save.worlds && save.worlds[worldId];
  if (!ws || !ws.cleared) return 'available';
  return ws.cleared.every(c => c) ? 'cleared' : 'available';
}

// ============================================================
class TitleScreen extends Phaser.Scene {
  constructor() { super({ key: 'TitleScreen' }); }

  create() {
    // Grid bg
    const g = this.add.graphics();
    g.lineStyle(1, 0x0d0d2a, 0.7);
    for (let x = 0; x <= W; x += 30) g.lineBetween(x, 0, x, H);
    for (let y = 0; y <= H; y += 30) g.lineBetween(0, y, W, y);
    const s = this.add.graphics();
    s.fillStyle(0, 0.15); for (let y = 0; y < H; y += 4) s.fillRect(0, y, W, 2);

    // Animated signal rings
    this._rings = [];
    for (let i = 0; i < 4; i++) {
      const rg = this.add.graphics();
      this._rings.push({ g: rg, phase: i / 4 });
    }

    // Game title
    const title = this.add.text(W / 2, H * 0.30, 'SYSTEM\nBREACH', {
      fontFamily: 'monospace', fontSize: '54px', color: '#00ff88',
      fontStyle: 'bold', letterSpacing: 6, align: 'center', lineSpacing: 8,
    }).setOrigin(0.5);
    this.tweens.add({ targets: title, scaleX: 1.015, scaleY: 1.015, duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    this.add.text(W / 2, H * 0.52, 'The network is infected.\nTerminate the upload.', {
      fontFamily: 'monospace', fontSize: '14px', color: '#444466',
      align: 'center', lineSpacing: 7,
    }).setOrigin(0.5);

    const tap = this.add.text(W / 2, H * 0.70, '◉  INITIALIZE BREACH', {
      fontFamily: 'monospace', fontSize: '16px', color: '#00ff88', letterSpacing: 2,
    }).setOrigin(0.5);
    this.tweens.add({ targets: tap, alpha: 0.1, duration: 1000, yoyo: true, repeat: -1 });

    this.add.text(W / 2, H - 28, 'SYSTEM BREACH  v1.0', {
      fontFamily: 'monospace', fontSize: '10px', color: '#1a1a33',
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      try { _getAudioCtx(this)?.resume(); } catch (e) {}
      getSoundMgr(this)?.play('click');
      getMusicEng(this)?.play('map');
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('OverworldMap'));
    });
  }

  update() {
    const t = this.time.now / 1000;
    this._rings.forEach((r, i) => {
      r.g.clear();
      const radius = ((t * 0.28 + r.phase) % 1) * W * 0.72;
      const alpha  = Math.max(0, 0.28 - radius / W);
      r.g.lineStyle(1, 0x00ff88, alpha);
      r.g.strokeCircle(W / 2, H * 0.30, radius);
    });
  }
}

// ============================================================
class Cutscene extends Phaser.Scene {
  constructor() { super({ key: 'Cutscene' }); }

  init(data) {
    this.id         = data.id || 'prologue';
    this.returnTo   = data.returnTo || 'OverworldMap';
    this.returnData = data.returnData || {};
    this.panelIdx   = 0;
  }

  create() {
    const save = loadSave();
    if (!save.seenCutscenes.includes(this.id)) { save.seenCutscenes.push(this.id); writeSave(save); }
    this.panels = CUTSCENE_DATA[this.id] || [];
    this._showPanel(0);
  }

  _showPanel(idx) {
    if (this.panelContainer) this.panelContainer.destroy(true);
    if (idx >= this.panels.length) { this.scene.start(this.returnTo, this.returnData); return; }
    const p = this.panels[idx];
    this.panelContainer = this.add.container(0, 0);

    // BG
    const bg = this.add.graphics();
    bg.fillStyle(0x050510, 1); bg.fillRect(0, 0, W, H);
    this.panelContainer.add(bg);

    // Art area (top ~60% of screen)
    const artH = H * 0.58;
    this._drawArt(p.art, artH);

    // Caption box
    const capY = artH + 10;
    const capH = H - capY - 80;
    const capBg = this.add.graphics();
    capBg.fillStyle(0x080818, 0.95); capBg.fillRoundedRect(16, capY, W - 32, capH, 8);
    capBg.lineStyle(1, 0x1a1a3a, 0.7); capBg.strokeRoundedRect(16, capY, W - 32, capH, 8);
    this.panelContainer.add(capBg);

    if (p.speaker) {
      const speakerCol = p.speaker === 'THE CLOUD' ? '#ff3355' : p.speaker === 'NEXUS' ? '#00ff88' : '#44aaff';
      const st = this.add.text(30, capY + 12, p.speaker, { fontFamily:'monospace', fontSize:'12px', color:speakerCol, fontStyle:'bold', letterSpacing:2 });
      this.panelContainer.add(st);
    }
    const ct = this.add.text(30, capY + (p.speaker ? 30 : 18), p.caption, {
      fontFamily:'monospace', fontSize:'15px', color:'#ccccdd', wordWrap:{ width: W - 60 }, lineSpacing: 6,
    });
    this.panelContainer.add(ct);

    // Progress dots
    this.panels.forEach((_, i) => {
      const dotG = this.add.graphics();
      const dx = W/2 - (this.panels.length * 14)/2 + i * 14 + 7;
      dotG.fillStyle(i === idx ? 0xffffff : 0x333355, 1);
      dotG.fillCircle(dx, H - 50, i === idx ? 5 : 3);
      this.panelContainer.add(dotG);
    });

    // Tap hint
    const hint = this.add.text(W/2, H - 28, idx < this.panels.length - 1 ? 'TAP TO CONTINUE' : 'TAP TO CONTINUE', {
      fontFamily:'monospace', fontSize:'11px', color:'#333355',
    }).setOrigin(0.5);
    this.panelContainer.add(hint);
    this.tweens.add({ targets: hint, alpha: 0.2, duration: 800, yoyo: true, repeat: -1 });

    // Advance on tap
    const zone = this.add.zone(0, 0, W, H).setOrigin(0).setInteractive();
    zone.once('pointerdown', () => this._showPanel(idx + 1));
    this.panelContainer.add(zone);
  }

  _drawArt(art, maxH) {
    const cx = W / 2, cy = maxH / 2;
    const g = this.add.graphics();
    this.panelContainer.add(g);

    // Scanline overlay on all panels
    g.fillStyle(0x000000, 0.12);
    for (let y = 0; y < maxH; y += 4) g.fillRect(0, y, W, 2);

    switch (art) {
      case 'world': // Network node grid
        g.lineStyle(1, 0x00ff88, 0.08);
        for (let x = 0; x <= W; x += 40) g.lineBetween(x, 0, x, maxH);
        for (let y = 0; y <= maxH; y += 40) g.lineBetween(0, y, W, y);
        for (let x = 20; x < W; x += 40) for (let y = 20; y < maxH; y += 40) {
          g.fillStyle(0x00ff88, Math.random() * 0.4 + 0.1); g.fillCircle(x + rnd(-4,4), y + rnd(-4,4), rnd(1,3));
        }
        g.lineStyle(1, 0x00ff88, 0.12);
        for (let i = 0; i < 15; i++) g.lineBetween(rnd(0,W), rnd(0,maxH), rnd(0,W), rnd(0,maxH));
        break;

      case 'signal_pulse': // Red expanding rings
        g.fillStyle(0x100005, 1); g.fillRect(0, 0, W, maxH);
        [0.85, 0.65, 0.48, 0.33, 0.2].forEach((r, i) => {
          g.lineStyle(2 - i * 0.3, 0xff3355, (1 - r) * 0.9); g.strokeCircle(cx, cy, r * W * 0.6);
        });
        g.fillStyle(0xff3355, 1); g.fillCircle(cx, cy, 8);
        g.fillStyle(0xffffff, 0.9); g.fillCircle(cx, cy, 3);
        break;

      case 'nexus_term': // Terminal window
        g.fillStyle(0x001108, 1); g.fillRect(0, 0, W, maxH);
        g.lineStyle(1, 0x00ff88, 0.3); g.strokeRect(24, 24, W - 48, maxH - 48);
        ['> NEXUS v3.1.4 initializing...', '> Signal routing: ACTIVE', '> Agent deployment: READY', '> Threat level: CRITICAL', '_'].forEach((line, i) => {
          this.panelContainer.add(this.add.text(38, 48 + i * 26, line, { fontFamily:'monospace', fontSize:'13px', color:0 < i && i < 4 ? '#00ff88' : '#44ff88' }));
        });
        break;

      case 'clear_grid': // Green network going dark
        for (let x = 20; x < W; x += 38) for (let y = 16; y < maxH; y += 32) {
          const dark = x > W / 2;
          g.fillStyle(dark ? 0x111122 : 0x00ff88, dark ? 0.4 : Math.random() * 0.3 + 0.1);
          g.fillCircle(x, y, rnd(2, 4));
        }
        g.lineStyle(1, 0x222233, 0.4); g.lineBetween(W/2, 0, W/2, maxH);
        break;

      case 'cloud_far': // Distant red formation
        g.fillStyle(0x050008, 1); g.fillRect(0, 0, W, maxH);
        [0.9, 0.7, 0.5].forEach(r => { g.lineStyle(1, 0xff3355, (1-r)*0.5); g.strokeCircle(cx, cy * 0.5, r * 60); });
        g.fillStyle(0xff3355, 0.8); g.fillCircle(cx, cy * 0.5, 8);
        for (let i = 0; i < 20; i++) {
          g.fillStyle(0x00ff88, Math.random() * 0.3); g.fillCircle(rnd(0, W), rnd(maxH * 0.55, maxH), rnd(1, 3));
        }
        break;

      case 'map_corrupt': // Half-red network map
        for (let x = 16; x < W; x += 36) for (let y = 12; y < maxH; y += 28) {
          const corrupt = x > W * 0.45;
          g.fillStyle(corrupt ? 0xff3355 : 0x00ff88, Math.random() * 0.35 + 0.1);
          g.fillCircle(x, y, rnd(2, 5));
        }
        g.lineStyle(2, 0xff8800, 0.6); g.lineBetween(W * 0.45, 0, W * 0.45, maxH);
        break;

      case 'squad_still': // Agent silhouettes
        [0x00ff88, 0xaa44ff, 0xffcc00, 0x44aaff, 0xff4466, 0xff44ff, 0xffaa00].forEach((col, i) => {
          const sx = 35 + i * 50, sh = 80 + rnd(0, 20);
          g.fillStyle(col, 0.7); g.fillRect(sx, cy - sh/2, 28, sh);
          g.fillStyle(col, 0.9); g.fillCircle(sx + 14, cy - sh/2 - 16, 12);
        });
        break;

      case 'upload_beam': // White vertical beam
        g.fillStyle(0x000510, 1); g.fillRect(0, 0, W, maxH);
        [0.4, 0.25, 0.12, 0.05].forEach((a, i) => { g.fillStyle(0xffffff, a); g.fillRect(cx - 8 - i*6, 0, 16 + i*12, maxH); });
        break;

      case 'grid_dark': // City grid losing power
        for (let gx = 0; gx < 8; gx++) for (let gy = 0; gy < 6; gy++) {
          const lit = Math.random() > 0.6 - gx * 0.08;
          const bx = 10 + gx * 47, by = 10 + gy * (maxH - 20) / 6;
          g.fillStyle(lit ? 0xffcc00 : 0x111122, lit ? 0.6 : 0.3); g.fillRect(bx, by, 38, (maxH - 20) / 6 - 4);
        }
        break;

      case 'cloud_core': // Server cathedral
        g.fillStyle(0x000510, 1); g.fillRect(0, 0, W, maxH);
        for (let col = 0; col < 5; col++) {
          const sx = 30 + col * 72;
          g.fillStyle(0x0088ff, 0.12); g.fillRect(sx, 20, 48, maxH - 20);
          g.lineStyle(1, 0x0088ff, 0.3); g.strokeRect(sx, 20, 48, maxH - 20);
          for (let row = 0; row < 8; row++) {
            g.fillStyle(0x00aaff, 0.6); g.fillRect(sx + 6, 28 + row * 32, 36, 8);
          }
        }
        [0.9, 0.6, 0.3].forEach(a => { g.fillStyle(0xffffff, a * 0.4); g.fillRect(cx - 3, 0, 6, maxH); });
        break;

      case 'cloud_speaks': // Massive presence
        g.fillStyle(0x020008, 1); g.fillRect(0, 0, W, maxH);
        [120, 90, 65, 45, 28].forEach((r, i) => { g.lineStyle(2, 0xff3355, (5-i) * 0.12); g.strokeCircle(cx, cy * 0.6, r); });
        g.fillStyle(0xff3355, 0.9); g.fillCircle(cx, cy * 0.6, 18);
        g.fillStyle(0xffffff, 0.8); g.fillCircle(cx - 6, cy * 0.6 - 4, 5); g.fillCircle(cx + 6, cy * 0.6 - 4, 5);
        g.fillStyle(0xff3355, 1); g.fillCircle(cx - 6, cy * 0.6 - 4, 2); g.fillCircle(cx + 6, cy * 0.6 - 4, 2);
        break;

      case 'squad_charge': // Agents rushing right
        [0x00ff88, 0xaa44ff, 0xffcc00].forEach((col, i) => {
          const sx = 20 + i * 60, lean = (i + 1) * 4;
          g.fillStyle(col, 0.8); g.fillRect(sx + lean, cy - 40, 24, 80);
          g.fillStyle(col, 0.9); g.fillCircle(sx + lean + 12, cy - 52, 12);
        });
        for (let i = 0; i < 8; i++) { g.lineStyle(1, 0xffffff, 0.15); g.lineBetween(rnd(180, W), rnd(20, maxH - 20), rnd(200, W), rnd(20, maxH - 20)); }
        break;

      case 'beam_cut': // Beam severed
        g.fillStyle(0x000510, 1); g.fillRect(0, 0, W, maxH);
        g.fillStyle(0xffffff, 0.3); g.fillRect(cx - 4, 0, 8, maxH / 2 - 20);
        g.fillStyle(0xff3355, 0.8); g.fillCircle(cx, maxH / 2, 14);
        g.lineStyle(3, 0xff3355, 0.9); g.lineBetween(cx - 20, maxH/2, cx + 20, maxH/2);
        break;

      case 'map_clear': // All-green network
        for (let x = 20; x < W; x += 38) for (let y = 16; y < maxH; y += 28) {
          g.fillStyle(0x00ff88, Math.random() * 0.4 + 0.15); g.fillCircle(x, y, rnd(2, 4));
        }
        g.lineStyle(1, 0x00ff88, 0.1);
        for (let i = 0; i < 20; i++) g.lineBetween(rnd(0,W), rnd(0,maxH), rnd(0,W), rnd(0,maxH));
        break;

      default:
        g.fillStyle(0x050510, 1); g.fillRect(0, 0, W, maxH);
    }
  }
}

// ============================================================
class Achievements extends Phaser.Scene {
  constructor() { super({ key: 'Achievements' }); }

  create() {
    const save = loadSave();
    const g = this.add.graphics();
    g.lineStyle(1, 0x0d0d2a, 0.5);
    for (let x = 0; x <= W; x += 30) g.lineBetween(x, 0, x, H);
    for (let y = 0; y <= H; y += 30) g.lineBetween(0, y, W, y);

    this.add.text(W/2, 20, 'ACHIEVEMENTS', { fontFamily:'monospace', fontSize:'18px', color:'#00ff88', letterSpacing:3 }).setOrigin(0.5, 0);
    const unlocked = ACHIEVEMENTS.filter(a => save.achievements[a.id]).length;
    this.add.text(W/2, 46, `${unlocked} / ${ACHIEVEMENTS.length} UNLOCKED`, { fontFamily:'monospace', fontSize:'12px', color:'#444466' }).setOrigin(0.5, 0);

    const colW = (W - 36) / 2, rowH = 82, cols = 2;
    ACHIEVEMENTS.forEach((ach, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const ax = 12 + col * (colW + 12), ay = 74 + row * (rowH + 8);
      const done = !!save.achievements[ach.id];
      const hexCol = '#' + (done ? ach.color : 0x222233).toString(16).padStart(6, '0');

      const bg = this.add.graphics();
      bg.fillStyle(done ? ach.color : 0x111122, done ? 0.1 : 0.05);
      bg.fillRoundedRect(ax, ay, colW, rowH, 6);
      bg.lineStyle(1, done ? ach.color : 0x1a1a33, done ? 0.5 : 0.2);
      bg.strokeRoundedRect(ax, ay, colW, rowH, 6);

      const icon = this.add.graphics();
      icon.fillStyle(done ? ach.color : 0x222244, done ? 0.8 : 0.3);
      icon.fillCircle(ax + 18, ay + rowH/2, 12);
      if (done) { icon.lineStyle(2, ach.color, 1); icon.strokeCircle(ax + 18, ay + rowH/2, 12); }

      this.add.text(ax + 34, ay + 10, ach.name, { fontFamily:'monospace', fontSize:'10px', color: done ? hexCol : '#222244', fontStyle:'bold' });
      this.add.text(ax + 34, ay + 28, ach.desc, { fontFamily:'monospace', fontSize:'9px', color: done ? '#888899' : '#1a1a33', wordWrap:{ width: colW - 40 } });
      if (!done) this.add.text(ax + 18, ay + rowH/2, '?', { fontFamily:'monospace', fontSize:'14px', color:'#222244', fontStyle:'bold' }).setOrigin(0.5);
    });

    // Back button
    const bbg = this.add.graphics();
    bbg.fillStyle(0x00ff88, 0.1); bbg.fillRoundedRect(W/2-90, H-62, 180, 44, 8);
    bbg.lineStyle(1, 0x00ff88, 0.4); bbg.strokeRoundedRect(W/2-90, H-62, 180, 44, 8);
    this.add.text(W/2, H-40, '← BACK', { fontFamily:'monospace', fontSize:'14px', color:'#00ff88' }).setOrigin(0.5);
    this.add.zone(W/2-90, H-62, 180, 44).setOrigin(0).setInteractive().on('pointerdown', () => this.scene.start('OverworldMap'));
  }
}

// ============================================================
class Upgrades extends Phaser.Scene {
  constructor() { super({ key: 'Upgrades' }); }

  create() {
    this.save = loadSave();
    const g = this.add.graphics();
    g.lineStyle(1, 0x0d0d2a, 0.5);
    for (let x = 0; x <= W; x += 30) g.lineBetween(x, 0, x, H);
    for (let y = 0; y <= H; y += 30) g.lineBetween(0, y, W, y);

    this.add.text(W/2, 18, 'UPGRADES', { fontFamily:'monospace', fontSize:'18px', color:'#ffcc00', letterSpacing:3 }).setOrigin(0.5, 0);
    this.shardsText = this.add.text(W/2, 44, `◆ ${this.save.shards} SHARDS`, { fontFamily:'monospace', fontSize:'13px', color:'#ffcc00' }).setOrigin(0.5, 0);
    this.add.text(W/2, 62, 'Earned from miniboss & boss wins', { fontFamily:'monospace', fontSize:'10px', color:'#333355' }).setOrigin(0.5, 0);

    this._renderList();

    const bbg = this.add.graphics();
    bbg.fillStyle(0x444466, 0.1); bbg.fillRoundedRect(W/2-90, H-62, 180, 44, 8);
    bbg.lineStyle(1, 0x444466, 0.4); bbg.strokeRoundedRect(W/2-90, H-62, 180, 44, 8);
    this.add.text(W/2, H-40, '← BACK', { fontFamily:'monospace', fontSize:'14px', color:'#444466' }).setOrigin(0.5);
    this.add.zone(W/2-90, H-62, 180, 44).setOrigin(0).setInteractive().on('pointerdown', () => this.scene.start('OverworldMap'));
  }

  _renderList() {
    if (this._listCont) { this._listCont.destroy(true); this._listMask?.destroy(); }
    const listY = 82, listH = H - listY - 72;
    const maskGfx = this.make.graphics({ add: false });
    maskGfx.fillRect(0, listY, W, listH);
    const mask = maskGfx.createGeometryMask();
    this._listMask = maskGfx;

    const cont = this.add.container(0, 0).setMask(mask);
    this._listCont = cont;

    let y = listY + 4, lastCat = null;
    UPGRADES_CATALOG.forEach(upg => {
      if (upg.cat !== lastCat) {
        lastCat = upg.cat;
        cont.add(this.add.text(20, y, upg.cat, { fontFamily:'monospace', fontSize:'11px', color:'#333355', letterSpacing:2 }));
        y += 22;
      }
      const owned = !!this.save.upgrades[upg.id];
      const canAfford = this.save.shards >= upg.cost;

      const bg = this.add.graphics();
      bg.fillStyle(owned ? 0xffcc00 : 0x111122, owned ? 0.08 : 0.05);
      bg.fillRoundedRect(12, y, W - 24, 62, 6);
      bg.lineStyle(1, owned ? 0xffcc00 : 0x1a1a33, owned ? 0.4 : 0.15);
      bg.strokeRoundedRect(12, y, W - 24, 62, 6);
      cont.add(bg);

      cont.add(this.add.text(24, y + 8, upg.name, { fontFamily:'monospace', fontSize:'12px', color: owned ? '#ffcc00' : '#ffffff', fontStyle:'bold' }));
      cont.add(this.add.text(24, y + 28, upg.desc, { fontFamily:'monospace', fontSize:'10px', color:'#444466' }));

      if (owned) {
        cont.add(this.add.text(W - 24, y + 20, 'OWNED', { fontFamily:'monospace', fontSize:'12px', color:'#ffcc00' }).setOrigin(1, 0.5));
      } else {
        const col = canAfford ? 0xffcc00 : 0x333344;
        const btn = this.add.graphics();
        btn.fillStyle(col, canAfford ? 0.15 : 0.05); btn.fillRoundedRect(W - 112, y + 12, 92, 38, 6);
        btn.lineStyle(1, col, canAfford ? 0.6 : 0.2); btn.strokeRoundedRect(W - 112, y + 12, 92, 38, 6);
        cont.add(btn);
        const hexCol = '#' + col.toString(16).padStart(6, '0');
        cont.add(this.add.text(W - 66, y + 31, `◆ ${upg.cost}`, { fontFamily:'monospace', fontSize:'12px', color: hexCol }).setOrigin(0.5));
        if (canAfford) {
          const zone = this.add.zone(W - 112, y + 12, 92, 38).setOrigin(0).setInteractive();
          zone.on('pointerdown', () => { this.save.upgrades[upg.id] = true; this.save.shards -= upg.cost; writeSave(this.save); this.shardsText.setText(`◆ ${this.save.shards} SHARDS`); this._renderList(); });
          cont.add(zone);
        }
      }
      y += 72;
    });

    // Drag scroll
    let lastY = 0, isDragging = false;
    const totalH = y - listY + 8;
    const maxScroll = Math.max(0, totalH - listH);
    let scrollY = 0;
    const setScroll = sy => { scrollY = Phaser.Math.Clamp(sy, -maxScroll, 0); cont.setY(scrollY); };
    const pd = p => { isDragging = true; lastY = p.y; };
    const pm = p => { if (isDragging) setScroll(scrollY + (p.y - lastY)); lastY = p.y; };
    const pu = () => { isDragging = false; };
    this.input.on('pointerdown', pd); this.input.on('pointermove', pm); this.input.on('pointerup', pu);
  }
}

// ============================================================
class SquadSelect extends Phaser.Scene {
  constructor() { super({ key: 'SquadSelect' }); }

  create() {
    this.save = loadSave();
    const g = this.add.graphics();
    g.lineStyle(1, 0x0d0d1a, 0.5);
    for (let x = 0; x <= W; x += 30) g.lineBetween(x, 0, x, H);
    for (let y = 0; y <= H; y += 30) g.lineBetween(0, y, W, y);
    this._render();
  }

  _render() {
    if (this._cont) this._cont.destroy(true);
    const cont = this.add.container(0, 0);
    this._cont = cont;

    cont.add(this.add.text(W / 2, 20, 'SQUAD SELECT', { fontFamily:'monospace', fontSize:'18px', color:'#00ff88', letterSpacing:3 }).setOrigin(0.5, 0));
    const activeCount = this.save.agents.filter(a => a.owned && a.active).length;
    cont.add(this.add.text(W / 2, 46, `${activeCount} / 3 ACTIVE  ·  Max 3 deploy to battle`, { fontFamily:'monospace', fontSize:'11px', color: activeCount >= 3 ? '#00ff88' : '#ffcc00' }).setOrigin(0.5, 0));

    const owned = this.save.agents.filter(a => a.owned);
    owned.forEach((ag, i) => {
      const def = DEFS.find(d => d.id === ag.id);
      if (!def) return;
      const cy  = 76 + i * 94;
      const isActive = !!ag.active;
      const col = isActive ? def.color : 0x333344;
      const hex = '#' + col.toString(16).padStart(6, '0');
      const st  = effectiveStats(ag.id, ag.level, this.save);

      const bg = this.add.graphics();
      bg.fillStyle(col, isActive ? 0.14 : 0.04);
      bg.fillRoundedRect(12, cy, W - 24, 82, 8);
      bg.lineStyle(2, col, isActive ? 0.8 : 0.2);
      bg.strokeRoundedRect(12, cy, W - 24, 82, 8);
      cont.add(bg);

      const sp = this.add.graphics();
      _drawSprite(sp, ag.id, 22, cy + 8);
      cont.add(sp);

      cont.add(this.add.text(88, cy + 10, def.name,         { fontFamily:'monospace', fontSize:'16px', color: isActive ? hex : '#333355', fontStyle:'bold' }));
      cont.add(this.add.text(88, cy + 30, `${def.cls}  Lv ${ag.level}`, { fontFamily:'monospace', fontSize:'11px', color:'#333355' }));
      cont.add(this.add.text(88, cy + 48, `HP ${ag.hp} / ${st.maxHp}`, { fontFamily:'monospace', fontSize:'11px', color: isActive ? '#888899' : '#222233' }));

      const btnCol = isActive ? 0x00ff88 : 0x444466;
      const bbg = this.add.graphics();
      bbg.fillStyle(btnCol, 0.14); bbg.fillRoundedRect(W - 118, cy + 24, 98, 34, 6);
      bbg.lineStyle(1, btnCol, 0.7); bbg.strokeRoundedRect(W - 118, cy + 24, 98, 34, 6);
      cont.add(bbg);
      cont.add(this.add.text(W - 69, cy + 41, isActive ? 'ACTIVE  ✓' : 'INACTIVE', { fontFamily:'monospace', fontSize:'11px', color:'#'+btnCol.toString(16).padStart(6,'0') }).setOrigin(0.5));

      const z = this.add.zone(12, cy, W - 24, 82).setOrigin(0).setInteractive();
      z.on('pointerdown', () => {
        const ac = this.save.agents.filter(a => a.owned && a.active).length;
        if (isActive  && ac <= 1) return;
        if (!isActive && ac >= 3) return;
        ag.active = !isActive;
        writeSave(this.save); this._render();
      });
      cont.add(z);
    });

    // Back button
    const bbg = this.add.graphics();
    bbg.fillStyle(0x00ff88, 0.10); bbg.fillRoundedRect(W/2-90, H-62, 180, 44, 8);
    bbg.lineStyle(1, 0x00ff88, 0.5); bbg.strokeRoundedRect(W/2-90, H-62, 180, 44, 8);
    cont.add(bbg);
    cont.add(this.add.text(W/2, H-40, '← BACK', { fontFamily:'monospace', fontSize:'14px', color:'#00ff88' }).setOrigin(0.5));
    cont.add(this.add.zone(W/2-90, H-62, 180, 44).setOrigin(0).setInteractive().on('pointerdown', () => this.scene.start('OverworldMap')));
  }
}

// ============================================================
class SubclassChoice extends Phaser.Scene {
  constructor() { super({ key: 'SubclassChoice' }); }

  init(data) {
    this.pending    = data.pending    || [];
    this.currentIdx = data.currentIdx || 0;
  }

  create() {
    const entry = this.pending[this.currentIdx];
    if (!entry) { this.scene.start('OverworldMap'); return; }
    const subs = SUBCLASSES[entry.id];
    if (!subs)  { this._next(); return; }

    const hex = '#' + entry.color.toString(16).padStart(6, '0');
    // bg
    const g = this.add.graphics();
    g.lineStyle(1, 0x0d0d1a, 0.6);
    for (let x = 0; x <= W; x += 30) g.lineBetween(x, 0, x, H);
    for (let y = 0; y <= H; y += 30) g.lineBetween(0, y, W, y);
    const s = this.add.graphics(); s.fillStyle(0,0.15);
    for (let y = 0; y < H; y += 4) s.fillRect(0, y, W, 2);

    this.add.text(W/2, 22, '⬆ LEVEL 5 REACHED', { fontFamily:'monospace', fontSize:'16px', color:'#ffcc00' }).setOrigin(0.5);
    this.add.text(W/2, 48, 'CHOOSE YOUR SUBCLASS', { fontFamily:'monospace', fontSize:'20px', color:hex, fontStyle:'bold' }).setOrigin(0.5);
    this.add.text(W/2, 74, 'This choice is permanent.', { fontFamily:'monospace', fontSize:'12px', color:'#333355' }).setOrigin(0.5);

    // sprite
    const sp = this.add.graphics();
    _drawSprite(sp, entry.id, W/2 - 22, 90);
    this.add.text(W/2, 166, entry.name, { fontFamily:'monospace', fontSize:'18px', color:hex, fontStyle:'bold' }).setOrigin(0.5);

    // two choice panels
    subs.forEach((sc, i) => {
      const px = 10 + i * (W/2 + 2), pw = W/2 - 14, py = 200, ph = 280;
      const scHex = '#' + sc.color.toString(16).padStart(6, '0');
      const bg2 = this.add.graphics();
      bg2.fillStyle(sc.color, 0.1); bg2.fillRoundedRect(px, py, pw, ph, 8);
      bg2.lineStyle(2, sc.color, 0.5); bg2.strokeRoundedRect(px, py, pw, ph, 8);

      this.add.text(px + pw/2, py + 18, sc.name, { fontFamily:'monospace', fontSize:'15px', color:scHex, fontStyle:'bold' }).setOrigin(0.5);
      this.add.text(px + pw/2, py + 44, sc.desc, { fontFamily:'monospace', fontSize:'10px', color:'#666688', wordWrap:{ width: pw - 16 }, align:'center' }).setOrigin(0.5);

      // move preview
      const mbg = this.add.graphics();
      mbg.fillStyle(sc.move.color, 0.12); mbg.fillRoundedRect(px + 8, py + 110, pw - 16, 56, 6);
      mbg.lineStyle(1, sc.move.color, 0.5); mbg.strokeRoundedRect(px + 8, py + 110, pw - 16, 56, 6);
      this.add.text(px + pw/2, py + 128, sc.move.label, { fontFamily:'monospace', fontSize:'14px', color:scHex, fontStyle:'bold' }).setOrigin(0.5);
      this.add.text(px + pw/2, py + 148, sc.move.sub, { fontFamily:'monospace', fontSize:'10px', color:'#555577' }).setOrigin(0.5);
      if (sc.move.cost > 0) this.add.text(px + pw/2, py + 162, `${sc.move.cost} EN`, { fontFamily:'monospace', fontSize:'9px', color:'#44aaff' }).setOrigin(0.5);

      // choose button
      const bbg = this.add.graphics();
      bbg.fillStyle(sc.color, 0.2); bbg.fillRoundedRect(px + 8, py + 232, pw - 16, 36, 6);
      bbg.lineStyle(1, sc.color, 0.7); bbg.strokeRoundedRect(px + 8, py + 232, pw - 16, 36, 6);
      this.add.text(px + pw/2, py + 250, 'CHOOSE', { fontFamily:'monospace', fontSize:'14px', color:scHex, fontStyle:'bold' }).setOrigin(0.5);

      this.add.zone(px, py, pw, ph).setOrigin(0).setInteractive()
        .on('pointerdown', () => {
          const save = loadSave();
          const ag = save.agents.find(a => a.id === entry.id);
          if (ag) { ag.subclass = sc.id; writeSave(save); }
          this._next();
        });
    });
  }

  _next() {
    const nextIdx = this.currentIdx + 1;
    if (nextIdx < this.pending.length) {
      this.scene.start('SubclassChoice', { pending: this.pending, currentIdx: nextIdx });
    } else {
      this.scene.start('OverworldMap');
    }
  }
}

// ============================================================
class OverworldMap extends Phaser.Scene {
  constructor() { super({ key: 'OverworldMap' }); }

  create() {
    this.save = loadSave();
    // Trigger prologue cutscene on first launch
    if (!this.save.seenCutscenes.includes('prologue')) {
      this.scene.start('Cutscene', { id: 'prologue', returnTo: 'OverworldMap' }); return;
    }
    getMusicEng(this)?.play('map');
    this._bg();
    this._header();
    this._edges();
    this._nodes();
    this._footer();
    this._animateEdges();
  }

  _bg() {
    const g = this.add.graphics();
    g.lineStyle(1, 0x0d0d1a, 0.6);
    for (let x = 0; x <= W; x += 30) g.lineBetween(x, 0, x, H);
    for (let y = 0; y <= H; y += 30) g.lineBetween(0, y, W, y);
    const s = this.add.graphics();
    s.fillStyle(0x000000, 0.15);
    for (let y = 0; y < H; y += 4) s.fillRect(0, y, W, 2);
  }

  _header() {
    this.add.text(W / 2, 12, 'SYSTEM BREACH', { fontFamily: 'monospace', fontSize: '16px', color: '#00ff88', letterSpacing: 4 }).setOrigin(0.5, 0);
    this.add.text(20, 36, '⚙ ' + this.save.cycles, { fontFamily: 'monospace', fontSize: '12px', color: '#ffcc00' });
    this.add.text(20, 52, '◆ ' + this.save.shards + ' shards', { fontFamily: 'monospace', fontSize: '11px', color: '#ffcc00' });
    const cleared = WORLDS.filter(w => { const ws = this.save.worlds?.[w.id]; return ws?.cleared?.every(c=>c); }).length;
    this.add.text(W/2, 36, `${cleared}/19 worlds`, { fontFamily:'monospace', fontSize:'11px', color:'#333355' }).setOrigin(0.5,0);
    const sbg = this.add.graphics();
    sbg.fillStyle(0x00ff88, 0.12); sbg.fillRoundedRect(W - 84, 8, 76, 34, 6);
    sbg.lineStyle(1, 0x00ff88, 0.5); sbg.strokeRoundedRect(W - 84, 8, 76, 34, 6);
    this.add.text(W - 46, 25, 'SHOP', { fontFamily: 'monospace', fontSize: '13px', color: '#00ff88' }).setOrigin(0.5);
    this.add.zone(W - 84, 8, 76, 34).setOrigin(0).setInteractive().on('pointerdown', () => this.scene.start('Shop'));
  }

  _edges() {
    const g = this.add.graphics();
    const wm = Object.fromEntries(WORLDS.map(w => [w.num, w]));
    WORLD_EDGES.forEach(([a, b]) => {
      const wa = wm[a], wb = wm[b];
      const sa = worldState(wa.id, this.save), sb = worldState(wb.id, this.save);
      const active = sa !== 'locked' || sb !== 'locked';
      g.lineStyle(active ? 1 : 1, active ? 0x1a2a3a : 0x0d0d1a, active ? 0.9 : 0.25);
      g.lineBetween(wa.x, wa.y, wb.x, wb.y);
      if (active) {
        g.lineStyle(1, sa === 'cleared' ? wa.color : 0x1a3a4a, 0.3);
        g.lineBetween(wa.x, wa.y, wb.x, wb.y);
      }
    });
  }

  _nodes() {
    const r = 20;
    WORLDS.forEach(w => {
      const state = worldState(w.id, this.save);
      const col = state === 'locked' ? 0x1a1a2e : w.color;
      const hex = '#' + col.toString(16).padStart(6, '0');

      const g = this.add.graphics();
      if (state === 'cleared') {
        g.fillStyle(col, 0.35); g.fillCircle(w.x, w.y, r);
        g.lineStyle(2, col, 0.9); g.strokeCircle(w.x, w.y, r);
      } else if (state === 'available') {
        g.fillStyle(col, 0.15); g.fillCircle(w.x, w.y, r);
        g.lineStyle(2, col, 0.8); g.strokeCircle(w.x, w.y, r);
        this.tweens.add({ targets: g, alpha: 0.4, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      } else {
        g.fillStyle(0x0a0a18, 1); g.fillCircle(w.x, w.y, r);
        g.lineStyle(1, 0x1a1a2e, 0.4); g.strokeCircle(w.x, w.y, r);
      }

      const label = state === 'cleared' ? '✓' : w.abbr;
      this.add.text(w.x, w.y - 1, label, { fontFamily: 'monospace', fontSize: '11px', color: state === 'locked' ? '#1a1a33' : hex, fontStyle: 'bold' }).setOrigin(0.5);
      this.add.text(w.x, w.y + r + 5, w.device, { fontFamily: 'monospace', fontSize: '8px', color: state === 'locked' ? '#111122' : hex }).setOrigin(0.5, 0);

      if (state !== 'locked') {
        this.add.zone(w.x - r, w.y - r, r * 2, r * 2).setOrigin(0).setInteractive()
          .on('pointerdown', () => this.scene.start('ChannelSelect', { worldId: w.id }));
      }
    });
  }

  _footer() {
    const g = this.add.graphics();
    g.fillStyle(0x050510, 0.97); g.fillRect(0, H - 56, W, 56);
    g.lineStyle(1, 0x1a1a3a, 0.5); g.lineBetween(0, H - 56, W, H - 56);

    // Act legend
    const acts = [
      { l: 'ACT 1', c: '#00ff88' }, { l: 'ACT 2', c: '#ff8800' },
      { l: 'ACT 3', c: '#ff3355' }, { l: 'ACT 4', c: '#ffcc00' },
    ];
    acts.forEach((a, i) => {
      const x = 12 + i * 92;
      const dot = this.add.graphics();
      dot.fillStyle(parseInt(a.c.replace('#', ''), 16), 0.6);
      dot.fillCircle(x + 5, H - 42, 4);
      this.add.text(x + 14, H - 42, a.l, { fontFamily: 'monospace', fontSize: '10px', color: a.c }).setOrigin(0, 0.5);
    });

    // Achievements + Upgrades buttons
    const btn = (label, col, bx, cb) => {
      const bg = this.add.graphics();
      bg.fillStyle(col, 0.1); bg.fillRoundedRect(bx, H - 26, 84, 20, 4);
      bg.lineStyle(1, col, 0.4); bg.strokeRoundedRect(bx, H - 26, 84, 20, 4);
      this.add.text(bx + 42, H - 16, label, { fontFamily:'monospace', fontSize:'9px', color:'#'+col.toString(16).padStart(6,'0') }).setOrigin(0.5);
      this.add.zone(bx, H - 26, 84, 20).setOrigin(0).setInteractive().on('pointerdown', cb);
    };
    btn('ACHIEVEMENTS', 0x44aaff,  8,        () => this.scene.start('Achievements'));
    btn('UPGRADES',     0xffcc00,  100,      () => this.scene.start('Upgrades'));
    btn('SQUAD',        0x00ff88,  192,      () => this.scene.start('SquadSelect'));
  }

  _animateEdges() {
    const wm = Object.fromEntries(WORLDS.map(w => [w.num, w]));
    WORLD_EDGES.forEach(([a, b]) => {
      const wa = wm[a], wb = wm[b];
      const sa = worldState(wa.id, this.save), sb = worldState(wb.id, this.save);
      if (sa === 'locked' && sb === 'locked') return;
      const col = sa !== 'locked' ? wa.color : wb.color;
      // Animate a small dot travelling along each active edge
      const dot = this.add.graphics();
      dot.fillStyle(col, 0.8); dot.fillCircle(0, 0, 3);
      let t = Math.random(); // stagger start
      this.tweens.add({
        targets: { v: t }, v: t + 1,
        duration: 1800 + rnd(0, 800),
        repeat: -1,
        ease: 'Linear',
        onUpdate: tw => {
          const frac = (tw.targets[0].v % 1);
          dot.setPosition(wa.x + (wb.x - wa.x) * frac, wa.y + (wb.y - wa.y) * frac);
          dot.setAlpha(Math.sin(frac * Math.PI) * 0.7);
        },
      });
    });
  }
}

// ── Shared sprite draw (used by Shop + Battle) ─────────────
function _drawSprite(g, id, ox, oy) {
  const s = 2;
  const p = (x, y, w, h, col, a = 1) => { g.fillStyle(col, a); g.fillRect(ox + x*s, oy + y*s, w*s, h*s); };
  if (id === 'threadling') {
    const [c1,c2,c3]=[0x00ff88,0x003322,0x00ffcc];
    p(10,0,1,2,c3);p(9,1,3,1,c3);p(7,2,8,6,c1);p(8,3,6,1,c2);p(8,4,6,2,c3,0.8);p(8,5,6,1,c2);
    p(10,8,2,2,c1,0.7);p(4,9,3,2,c1,0.9);p(15,9,3,2,c1,0.9);p(7,10,8,9,c1,0.75);
    p(9,11,4,4,c2,0.8);p(10,12,2,2,c3,0.9);p(4,10,3,7,c1,0.7);p(2,15,3,2,c1);
    p(1,14,1,4,c3,0.5);p(15,10,3,7,c1,0.7);p(8,19,6,2,c2,0.9);
    p(8,21,3,9,c1,0.8);p(13,21,3,9,c1,0.8);p(7,29,5,3,c1);p(13,29,5,3,c1);p(6,31,2,1,c2);p(16,31,2,1,c2);
  } else if (id === 'patchwork') {
    const [c1,c2,c3]=[0xaa44ff,0x4411aa,0xee88ff];
    p(10,0,2,1,c1);p(9,1,4,1,c1);p(8,2,6,2,c1);p(7,4,8,4,c1);p(8,4,6,4,c2,0.5);
    p(9,6,2,1,c3,0.8);p(11,6,2,1,c3,0.8);p(5,8,12,2,c1,0.85);p(6,10,10,2,c1,0.8);
    p(5,12,12,2,c1,0.75);p(4,14,14,2,c1,0.7);p(4,16,14,2,c1,0.65);p(3,18,16,3,c1,0.6);
    p(2,21,18,3,c2,0.65);p(1,24,20,3,c2,0.5);p(0,27,22,4,c2,0.35);
    p(8,10,1,7,c3,0.3);p(11,11,1,6,c3,0.25);p(4,10,2,5,c1,0.7);p(16,10,2,5,c1,0.7);
    p(3,14,3,2,c3,0.5);p(16,14,3,2,c3,0.5);p(0,11,2,1,c3,0.4);p(20,9,2,1,c3,0.4);
  } else if (id === 'vault') {
    const [c1,c2,c3]=[0xffcc00,0x886600,0xffee88];
    p(6,0,10,7,c1,0.95);p(7,2,8,3,c2,0.85);p(8,3,6,2,c3,0.5);p(6,0,2,4,c2,0.5);p(14,0,2,4,c2,0.5);
    p(8,7,6,2,c1,0.8);p(2,8,5,5,c1,0.9);p(15,8,5,5,c1,0.9);p(1,9,2,4,c2,0.75);p(19,9,2,4,c2,0.75);
    p(5,9,12,10,c1,0.85);p(6,10,10,7,c2,0.35);p(9,11,4,3,c3,0.3);p(10,12,2,2,c3,0.9);
    p(2,13,4,6,c1,0.8);p(16,13,4,6,c1,0.8);p(2,17,5,2,c2,0.9);p(15,17,5,2,c2,0.9);
    p(5,19,12,2,c2,0.9);p(10,19,2,2,c3,0.8);p(5,21,5,9,c1,0.85);p(12,21,5,9,c1,0.85);
    p(4,29,7,3,c2,0.9);p(11,29,7,3,c2,0.9);p(3,31,4,1,c1,0.5);p(15,31,4,1,c1,0.5);
  } else if (id === 'netrunner') {
    const [c1,c2,c3]=[0x00ccff,0x004455,0x88eeff];
    p(10,0,2,3,c3);p(9,3,4,1,c3,0.6);
    p(7,3,8,5,c1);p(8,5,6,2,c2,0.8);p(9,5,4,1,c3,0.8);
    p(9,8,4,2,c2,0.9);
    p(5,9,3,2,c1,0.7);p(14,9,3,2,c1,0.7);
    p(7,11,8,8,c1,0.75);p(8,13,6,4,c2,0.5);p(10,14,2,2,c3,0.9);
    p(5,11,3,8,c1,0.6);p(4,14,1,4,c3,0.5);
    p(14,11,3,8,c1,0.6);p(17,14,1,4,c3,0.5);
    p(7,19,8,2,c2,0.85);
    p(7,21,4,8,c1,0.75);p(11,21,4,8,c1,0.75);
    p(6,29,5,3,c2,0.9);p(11,29,5,3,c2,0.9);p(5,31,3,1,c1,0.5);p(14,31,3,1,c1,0.5);
  } else if (id === 'sentinel') {
    const [c1,c2,c3]=[0xff4466,0x661122,0xff88aa];
    p(7,0,8,6,c1,0.9);p(8,2,6,3,c2,0.8);p(9,3,4,1,c3,0.7);p(5,0,2,3,c2,0.6);p(15,0,2,3,c2,0.6);
    p(2,7,6,4,c1,0.9);p(14,7,6,4,c1,0.9);p(0,8,3,3,c2,0.7);p(19,8,3,3,c2,0.7);
    p(6,11,10,8,c1,0.85);p(7,12,8,5,c2,0.4);p(9,13,4,3,c3,0.5);p(10,14,2,2,c3,0.9);
    p(3,11,4,7,c1,0.8);p(15,11,4,7,c1,0.8);
    p(2,16,4,2,c2,0.9);p(16,16,4,2,c2,0.9);
    p(6,19,10,2,c2,0.9);p(10,19,2,2,c3,0.8);
    p(6,21,4,9,c1,0.85);p(12,21,4,9,c1,0.85);
    p(5,29,6,3,c2,0.9);p(11,29,6,3,c2,0.9);p(4,31,4,1,c1,0.5);p(14,31,4,1,c1,0.5);
  } else if (id === 'glitcher') {
    const [c1,c2,c3]=[0xff44ff,0x550055,0xffaaff];
    p(9,0,4,2,c1);p(7,2,8,5,c1);p(8,3,6,2,c2,0.7);p(8,4,4,1,c3,0.8);p(13,3,2,1,c3,0.6);
    p(3,12,2,1,c3,0.4);p(17,10,2,1,c3,0.4);p(0,14,1,2,c3,0.3);p(21,13,1,1,c3,0.3);
    p(6,7,10,3,c1,0.8);
    p(4,10,5,8,c1,0.7);p(13,11,4,7,c1,0.6);
    p(7,10,8,9,c1,0.75);p(8,12,6,4,c2,0.5);p(10,13,2,2,c3,0.9);
    p(8,19,6,2,c2,0.8);
    p(8,21,3,9,c1,0.75);p(12,21,4,9,c1,0.7);
    p(7,29,5,3,c2,0.9);p(12,29,5,3,c2,0.9);p(6,31,3,1,c3,0.4);p(14,31,3,1,c3,0.4);
  } else if (id === 'bridgelink') {
    const [c1,c2,c3]=[0xffaa00,0x553300,0xffdd88];
    p(9,0,4,1,c3);p(6,0,1,3,c3,0.6);p(15,0,1,3,c3,0.6);
    p(7,1,8,6,c1);p(8,3,6,2,c2,0.7);p(9,4,4,1,c3,0.8);p(7,3,2,1,c2,0.5);p(13,3,2,1,c2,0.5);
    p(8,7,6,3,c1,0.8);
    p(3,9,5,5,c1,0.85);p(14,9,5,5,c1,0.85);p(1,10,3,3,c2,0.6);p(18,10,3,3,c2,0.6);
    p(7,10,8,9,c1,0.8);p(8,11,6,5,c2,0.4);p(9,12,4,3,c3,0.5);p(10,13,2,2,c3,0.9);
    p(5,14,2,2,c2,0.6);p(15,14,2,2,c2,0.6);
    p(7,19,8,2,c2,0.85);p(10,19,2,2,c3,0.7);
    p(7,21,4,9,c1,0.8);p(11,21,4,9,c1,0.8);
    p(6,29,6,3,c2,0.9);p(10,29,6,3,c2,0.9);p(5,31,3,1,c3,0.4);p(14,31,3,1,c3,0.4);
  }
}

// ============================================================
class Shop extends Phaser.Scene {
  constructor() { super({ key: 'Shop' }); }

  create() {
    this.save = loadSave();
    this.tab  = 'agents';
    this.content = null;
    this._bg();
    this._header();
    this._tabs();
    this._renderTab();
    // back button
    const bbg = this.add.graphics();
    bbg.fillStyle(0x111122, 1); bbg.fillRect(0, H - 54, W, 54);
    bbg.lineStyle(1, COLORS.dim, 0.4); bbg.lineBetween(0, H - 54, W, H - 54);
    this.add.text(W / 2, H - 27, '← BACK TO CHANNELS', { fontFamily: 'monospace', fontSize: '14px', color: '#444466' }).setOrigin(0.5);
    this.add.zone(0, H - 54, W, 54).setOrigin(0).setInteractive().on('pointerdown', () => this.scene.start('ChannelSelect'));
  }

  _bg() {
    const g = this.add.graphics();
    g.lineStyle(1, 0x0d0d2a, 0.7);
    for (let x = 0; x <= W; x += 30) g.lineBetween(x, 0, x, H);
    for (let y = 0; y <= H; y += 30) g.lineBetween(0, y, W, y);
  }

  _header() {
    this.add.text(W / 2, 18, 'SHOP', { fontFamily: 'monospace', fontSize: '22px', color: '#00ff88', letterSpacing: 4 }).setOrigin(0.5, 0);
    this.cyclesTxt = this.add.text(W / 2, 48, '', { fontFamily: 'monospace', fontSize: '15px', color: '#ffcc00' }).setOrigin(0.5, 0);
    this._refreshCycles();
  }

  _refreshCycles() {
    this.cyclesTxt.setText(`⚙ ${this.save.cycles} CYCLES`);
  }

  _tabs() {
    const tabs   = ['agents', 'weapons', 'armor', 'items'];
    const labels = ['AGENTS', 'WEAP', 'ARMOR', 'ITEMS'];
    const tw = (W - 20) / 4 - 3;
    this.tabBgs = {};
    tabs.forEach((t, i) => {
      const tx = 10 + i * (tw + 3);
      const bg = this.add.graphics();
      this.tabBgs[t] = bg;
      this._drawTab(bg, tx, 76, tw, t);
      this.add.text(tx + tw / 2, 90, labels[i], { fontFamily: 'monospace', fontSize: '12px', color: '#aaaacc' }).setOrigin(0.5);
      this.add.zone(tx, 76, tw, 30).setOrigin(0).setInteractive().on('pointerdown', () => {
        this.tab = t;
        tabs.forEach((tt, ii) => this._drawTab(this.tabBgs[tt], 10 + ii * (tw + 3), 76, tw, tt));
        this._renderTab();
      });
    });
  }

  _drawTab(g, x, y, w, t) {
    const active = t === this.tab;
    g.clear();
    g.fillStyle(active ? 0x00ff88 : 0x111122, active ? 0.15 : 1);
    g.fillRoundedRect(x, y, w, 28, 4);
    g.lineStyle(1, active ? 0x00ff88 : COLORS.dim, active ? 0.7 : 0.3);
    g.strokeRoundedRect(x, y, w, 28, 4);
  }

  _renderTab() {
    if (this._scrollListeners) {
      this._scrollListeners.forEach(([e, fn]) => this.input.off(e, fn));
      this._scrollListeners = null;
    }
    if (this._agScrollCont) { this._agScrollCont.destroy(); this._agScrollCont = null; }
    if (this._agMaskGfx)    { this._agMaskGfx.destroy();    this._agMaskGfx    = null; }
    if (this.content) { this.content.destroy(true); this.content = null; }
    this.content = this.add.group();
    if (this.tab === 'agents')  this._renderAgents();
    if (this.tab === 'weapons') this._renderGear(WEAPONS, 'weapon');
    if (this.tab === 'armor')   this._renderGear(ARMORS,  'armor');
    if (this.tab === 'items')   this._renderItems();
  }

  _renderAgents() {
    const topY = 116, clipH = H - 174, cardH = 186;
    const totalH = DEFS.length * cardH;
    const maxScroll = Math.max(0, totalH - clipH);

    const msk = this.make.graphics({ add: false });
    msk.fillRect(0, topY, W, clipH);
    const cont = this.add.container(0, 0);
    cont.setMask(msk.createGeometryMask());
    this._agScrollCont = cont;
    this._agMaskGfx    = msk;

    DEFS.forEach((def, i) => {
      const saved = this.save.agents.find(a => a.id === def.id);
      const owned = saved.owned;
      const cost  = AGENT_COSTS[def.id];
      const hex   = '#' + def.color.toString(16).padStart(6, '0');
      const cy    = topY + i * cardH;
      const col   = owned ? def.color : 0x333344;

      const bg = this.add.graphics();
      bg.fillStyle(col, 0.08); bg.fillRoundedRect(16, cy, W-32, 176, 8);
      bg.lineStyle(1, col, owned ? 0.5 : 0.2); bg.strokeRoundedRect(16, cy, W-32, 176, 8);
      cont.add(bg);

      const sp = this.add.graphics();
      this._sprite(sp, def.id, 30, cy + 10);
      cont.add(sp);

      cont.add(this.add.text(108, cy+14, def.name, { fontFamily:'monospace', fontSize:'18px', color: owned ? hex : '#333355', fontStyle:'bold' }));
      cont.add(this.add.text(108, cy+36, def.cls,  { fontFamily:'monospace', fontSize:'12px', color:'#444466' }));
      cont.add(this.add.text(108, cy+54, owned ? `Lv ${saved.level}  ·  ${saved.xp} XP` : `Cost: ${cost} ⚙`, { fontFamily:'monospace', fontSize:'13px', color: owned ? '#888899' : '#ffcc00' }));

      if (owned) {
        const eq    = this.save.gear.equipped[def.id];
        const wName = eq.weapon ? WEAPONS.find(w => w.id === eq.weapon)?.name : 'none';
        const aName = eq.armor  ? ARMORS.find(a  => a.id === eq.armor)?.name  : 'none';
        cont.add(this.add.text(108, cy+74, `⚔ ${wName}`, { fontFamily:'monospace', fontSize:'11px', color:'#556655' }));
        cont.add(this.add.text(108, cy+90, `🛡 ${aName}`, { fontFamily:'monospace', fontSize:'11px', color:'#556655' }));

        const activeCount = this.save.agents.filter(a => a.owned && a.active).length;
        const isActive    = saved.active;
        const aCo = isActive ? 0x00ff88 : 0x444466;

        const abg = this.add.graphics();
        abg.fillStyle(aCo,0.15); abg.fillRoundedRect(W/2-152,cy+134,130,32,6);
        abg.lineStyle(1,aCo,0.6); abg.strokeRoundedRect(W/2-152,cy+134,130,32,6);
        cont.add(abg);
        cont.add(this.add.text(W/2-87,cy+150, isActive?'ACTIVE ✓':'SET ACTIVE', { fontFamily:'monospace', fontSize:'12px', color:'#'+aCo.toString(16).padStart(6,'0') }).setOrigin(0.5));
        const az = this.add.zone(W/2-152,cy+134,130,32).setOrigin(0).setInteractive();
        az.on('pointerdown', () => {
          if (isActive && activeCount <= 1) return;
          if (!isActive && activeCount >= 3) return;
          saved.active = !saved.active; writeSave(this.save); this._renderTab();
        });
        cont.add(az);

        const hbg = this.add.graphics();
        hbg.fillStyle(0x44aaff,0.15); hbg.fillRoundedRect(W/2+12,cy+134,130,32,6);
        hbg.lineStyle(1,0x44aaff,0.6); hbg.strokeRoundedRect(W/2+12,cy+134,130,32,6);
        cont.add(hbg);
        cont.add(this.add.text(W/2+77,cy+150,'HEAL  10⚙', { fontFamily:'monospace', fontSize:'12px', color:'#44aaff' }).setOrigin(0.5));
        const hz = this.add.zone(W/2+12,cy+134,130,32).setOrigin(0).setInteractive();
        hz.on('pointerdown', () => {
          const stats = effectiveStats(def.id, saved.level, this.save);
          if (saved.hp >= stats.maxHp || this.save.cycles < 10) return;
          this.save.cycles -= 10;
          saved.hp = Math.min(stats.maxHp, saved.hp + 30);
          writeSave(this.save); this._refreshCycles(); this._renderTab();
        });
        cont.add(hz);

      } else {
        const bbg = this.add.graphics();
        bbg.fillStyle(0xffcc00,0.15); bbg.fillRoundedRect(W/2-80,cy+134,160,32,6);
        bbg.lineStyle(1,0xffcc00,0.6); bbg.strokeRoundedRect(W/2-80,cy+134,160,32,6);
        cont.add(bbg);
        cont.add(this.add.text(W/2,cy+150,`BUY  ${cost} ⚙`, { fontFamily:'monospace', fontSize:'13px', color:'#ffcc00' }).setOrigin(0.5));
        const bz = this.add.zone(W/2-80,cy+134,160,32).setOrigin(0).setInteractive();
        bz.on('pointerdown', () => {
          if (this.save.cycles < cost) return;
          const ac = this.save.agents.filter(a => a.owned && a.active).length;
          this.save.cycles -= cost;
          saved.owned = true; saved.active = ac < 3;
          saved.hp = statsForLevel(def.id, saved.level).maxHp;
          writeSave(this.save); this._refreshCycles(); this._renderTab();
        });
        cont.add(bz);
      }
    });

    // drag-to-scroll
    let scrollY = 0, lastPY = 0;
    const onDown = p => { lastPY = p.y; };
    const onMove = p => {
      if (!p.isDown || maxScroll <= 0) return;
      scrollY = Phaser.Math.Clamp(scrollY + (p.y - lastPY), -maxScroll, 0);
      lastPY = p.y; cont.y = scrollY;
    };
    this.input.on('pointerdown', onDown);
    this.input.on('pointermove', onMove);
    this._scrollListeners = [['pointerdown', onDown], ['pointermove', onMove]];
  }

  _renderGear(catalog, type) {
    const ownedAgents = this.save.agents.filter(a => a.owned);
    const agCount  = Math.max(1, ownedAgents.length);
    const cardH    = 106;
    const startY   = 116;
    const shortMap = { threadling:'THREAD', patchwork:'PATCH', vault:'VAULT', netrunner:'NETRUN', sentinel:'SENTRY', glitcher:'GLITCH', bridgelink:'BRIDGE' };

    catalog.forEach((item, i) => {
      const cy  = startY + i * (cardH + 8);
      const bg  = this.add.graphics();
      bg.fillStyle(0x080818, 1); bg.fillRoundedRect(16, cy, W-32, cardH, 8);
      bg.lineStyle(1, 0x222233, 0.6); bg.strokeRoundedRect(16, cy, W-32, cardH, 8);
      this.content.add(bg);

      this.content.add(this.add.text(28, cy+10, item.name, { fontFamily:'monospace', fontSize:'16px', color:'#ffffff', fontStyle:'bold' }));
      this.content.add(this.add.text(28, cy+30, item.desc, { fontFamily:'monospace', fontSize:'11px', color:'#555577' }));
      this.content.add(this.add.text(W-28, cy+10, `${item.cost}⚙`, { fontFamily:'monospace', fontSize:'13px', color:'#ffcc00' }).setOrigin(1,0));

      // one button per owned agent
      const bw = Math.min(110, Math.floor((W - 36) / agCount) - 4);
      ownedAgents.forEach((ag, ai) => {
        const agDef   = DEFS.find(d => d.id === ag.id);
        const equipped = this.save.gear.equipped[ag.id][type];
        const isEq    = equipped === item.id;
        const col     = isEq ? agDef.color : (this.save.cycles >= item.cost ? 0x44ff88 : 0x333344);
        const bx      = 18 + ai * (bw + 4);
        const by      = cy + 54;

        const gbtn = this.add.graphics();
        gbtn.fillStyle(isEq ? agDef.color : 0x0a0a18, isEq ? 0.25 : 1);
        gbtn.fillRoundedRect(bx, by, bw, 40, 6);
        gbtn.lineStyle(1, col, isEq ? 0.9 : 0.4);
        gbtn.strokeRoundedRect(bx, by, bw, 40, 6);
        this.content.add(gbtn);

        const agHex = '#' + agDef.color.toString(16).padStart(6,'0');
        const short  = shortMap[ag.id] || ag.id.substring(0,6).toUpperCase();
        this.content.add(this.add.text(bx+bw/2, by+12, short, { fontFamily:'monospace', fontSize:'10px', color: isEq?agHex:'#555566' }).setOrigin(0.5));
        this.content.add(this.add.text(bx+bw/2, by+26, isEq?'✓ EQ':`${item.cost}⚙`, { fontFamily:'monospace', fontSize:'10px', color: isEq?'#00ff88':'#ffcc00' }).setOrigin(0.5));

        const z = this.add.zone(bx, by, bw, 40).setOrigin(0).setInteractive();
        z.on('pointerdown', () => {
          if (isEq) {
            this.save.gear.equipped[ag.id][type] = null;
            writeSave(this.save); this._renderTab();
          } else {
            if (this.save.cycles < item.cost) return;
            this.save.cycles -= item.cost;
            this.save.gear.equipped[ag.id][type] = item.id;
            writeSave(this.save); this._refreshCycles(); this._renderTab();
          }
        });
        this.content.add(z);
      });
    });
  }

  _renderItems() {
    const startY = 116;
    ITEMS_CATALOG.forEach((item, i) => {
      const qty = this.save.items?.[item.id] || 0;
      const cy  = startY + i * 114;
      const col = qty > 0 ? 0x00ff88 : 0x333344;

      const bg = this.add.graphics();
      bg.fillStyle(0x080818, 1); bg.fillRoundedRect(16, cy, W-32, 102, 8);
      bg.lineStyle(1, col, qty > 0 ? 0.5 : 0.2); bg.strokeRoundedRect(16, cy, W-32, 102, 8);
      this.content.add(bg);

      this.content.add(this.add.text(32, cy+12, item.icon, { fontSize:'22px' }));
      this.content.add(this.add.text(64, cy+14, item.name, { fontFamily:'monospace', fontSize:'16px', color:'#ffffff', fontStyle:'bold' }));
      this.content.add(this.add.text(64, cy+36, item.desc, { fontFamily:'monospace', fontSize:'11px', color:'#555577' }));
      this.content.add(this.add.text(W-28, cy+14, `×${qty}`, { fontFamily:'monospace', fontSize:'18px', color: qty>0?'#00ff88':'#444455' }).setOrigin(1,0));

      const canBuy = this.save.cycles >= item.cost && qty < 9;
      const bcol   = canBuy ? 0xffcc00 : 0x333344;
      const bbg    = this.add.graphics();
      bbg.fillStyle(bcol, 0.15); bbg.fillRoundedRect(W-136, cy+64, 120, 28, 6);
      bbg.lineStyle(1, bcol, 0.6); bbg.strokeRoundedRect(W-136, cy+64, 120, 28, 6);
      this.content.add(bbg);
      this.content.add(this.add.text(W-76, cy+78, `BUY  ${item.cost}⚙`, { fontFamily:'monospace', fontSize:'12px', color:'#'+bcol.toString(16).padStart(6,'0') }).setOrigin(0.5));

      if (canBuy) {
        const bz = this.add.zone(W-136, cy+64, 120, 28).setOrigin(0).setInteractive();
        bz.on('pointerdown', () => {
          this.save.cycles -= item.cost;
          this.save.items[item.id] = qty + 1;
          writeSave(this.save); this._refreshCycles(); this._renderTab();
        });
        this.content.add(bz);
      }
    });
  }

  _btn(cx, cy, label, col, cb) {
    const bw = 160, bh = 36;
    const g = this.add.graphics();
    g.fillStyle(col, 0.15); g.fillRoundedRect(cx - bw/2, cy - bh/2, bw, bh, 6);
    g.lineStyle(1, col, 0.6); g.strokeRoundedRect(cx - bw/2, cy - bh/2, bw, bh, 6);
    this.content.add(g);
    const t = this.add.text(cx, cy, label, { fontFamily: 'monospace', fontSize: '13px', color: '#' + col.toString(16).padStart(6,'0') }).setOrigin(0.5);
    this.content.add(t);
    const z = this.add.zone(cx - bw/2, cy - bh/2, bw, bh).setOrigin(0).setInteractive().on('pointerdown', cb);
    this.content.add(z);
  }

  _sprite(g, id, ox, oy) {
    // reuse same sprite logic — delegate to a shared function
    _drawSprite(g, id, ox, oy);
  }
}

// ============================================================
class ChannelSelect extends Phaser.Scene {
  constructor() { super({ key: 'ChannelSelect' }); }

  init(data) { this.worldId = (data && data.worldId) ? data.worldId : 'tv'; }

  create() {
    const save     = loadSave();
    // Trigger final_intro cutscene before entering The Cloud
    if (this.worldId === 'cloud' && !save.seenCutscenes.includes('final_intro')) {
      this.scene.start('Cutscene', { id: 'final_intro', returnTo: 'ChannelSelect', returnData: { worldId: 'cloud' } }); return;
    }
    const world    = WORLDS.find(w => w.id === this.worldId) || WORLDS[0];
    const channels = WORLD_CHANNELS[this.worldId] || WORLD_CHANNELS.tv;
    const worldSave = save.worlds[this.worldId] || { cleared: [false,false,false,false,false] };
    const wHex = '#' + world.color.toString(16).padStart(6, '0');

    const g = this.add.graphics();
    g.lineStyle(1, 0x0d0d2a, 0.7);
    for (let x = 0; x <= W; x += 30) g.lineBetween(x, 0, x, H);
    for (let y = 0; y <= H; y += 30) g.lineBetween(0, y, W, y);
    const s = this.add.graphics();
    s.fillStyle(0x000000, 0.2);
    for (let y = 0; y < H; y += 4) s.fillRect(0, y, W, 2);

    this.add.text(W / 2, 22, world.device, { fontFamily: 'monospace', fontSize: '20px', color: wHex, fontStyle: 'bold', letterSpacing: 3 }).setOrigin(0.5);
    this.add.text(W / 2, 48, world.name, { fontFamily: 'monospace', fontSize: '12px', color: '#555577' }).setOrigin(0.5);
    this.add.text(W / 2, 66, '⚙ ' + save.cycles + ' CYCLES', { fontFamily: 'monospace', fontSize: '12px', color: '#ffcc00' }).setOrigin(0.5);

    // ← MAP button
    const mapBg = this.add.graphics();
    mapBg.fillStyle(0x222244, 1); mapBg.fillRoundedRect(8, 10, 68, 34, 6);
    mapBg.lineStyle(1, COLORS.dim, 0.5); mapBg.strokeRoundedRect(8, 10, 68, 34, 6);
    this.add.text(42, 27, '← MAP', { fontFamily: 'monospace', fontSize: '12px', color: '#444466' }).setOrigin(0.5);
    this.add.zone(8, 10, 68, 34).setOrigin(0).setInteractive().on('pointerdown', () => this.scene.start('OverworldMap'));

    // SHOP button
    const shopBg = this.add.graphics();
    shopBg.fillStyle(0x00ff88, 0.12); shopBg.fillRoundedRect(W - 82, 10, 72, 34, 6);
    shopBg.lineStyle(1, 0x00ff88, 0.5); shopBg.strokeRoundedRect(W - 82, 10, 72, 34, 6);
    this.add.text(W - 46, 27, 'SHOP', { fontFamily: 'monospace', fontSize: '13px', color: '#00ff88' }).setOrigin(0.5);
    this.add.zone(W - 82, 10, 72, 34).setOrigin(0).setInteractive().on('pointerdown', () => this.scene.start('Shop'));

    const typeColor = { normal: '#444466', miniboss: '#ff8800', boss: '#ff3355' };
    const typeLabel = { normal: 'NORMAL', miniboss: 'MINI-BOSS', boss: 'BOSS' };

    channels.forEach((ch, i) => {
      const cleared = worldSave.cleared[i];
      const locked  = i > 0 && !worldSave.cleared[i - 1];
      const cy = 96 + i * 144;
      const col = locked ? 0x222233 : ch.type === 'boss' ? 0xff3355 : ch.type === 'miniboss' ? 0xff8800 : world.color;

      const bg = this.add.graphics();
      bg.fillStyle(col, locked ? 0.04 : 0.08); bg.fillRoundedRect(20, cy, W - 40, 126, 8);
      bg.lineStyle(1, col, locked ? 0.2 : 0.4); bg.strokeRoundedRect(20, cy, W - 40, 126, 8);

      this.add.text(30, cy + 12, ch.label + (cleared ? '  ✓' : ''), { fontFamily: 'monospace', fontSize: '13px', color: locked ? '#222233' : typeColor[ch.type] });
      this.add.text(30, cy + 30, ch.name, { fontFamily: 'monospace', fontSize: '26px', color: locked ? '#333344' : '#ffffff', fontStyle: 'bold' });
      this.add.text(30, cy + 64, ch.enemy.name, { fontFamily: 'monospace', fontSize: '14px', color: locked ? '#222233' : '#888899' });
      this.add.text(30, cy + 84, locked ? '🔒 LOCKED' : `HP ${ch.enemy.hp}  ·  AURA −${ch.enemy.aura}%`, { fontFamily: 'monospace', fontSize: '12px', color: locked ? '#333344' : '#444455' });

      const rewards = calcRewards(ch.type, world.tier, 3);
      this.add.text(30, cy + 104, locked ? '' : `⚙ ${rewards.cycles}  ·  ${rewards.xp} XP`, { fontFamily: 'monospace', fontSize: '11px', color: '#333355' });
      this.add.text(W - 32, cy + 12, typeLabel[ch.type], { fontFamily: 'monospace', fontSize: '12px', color: locked ? '#222233' : typeColor[ch.type] }).setOrigin(1, 0);

      if (!locked) {
        const zone = this.add.zone(20, cy, W - 40, 126).setOrigin(0).setInteractive();
        zone.on('pointerover', () => { bg.clear(); bg.fillStyle(col, 0.18); bg.fillRoundedRect(20, cy, W - 40, 126, 8); bg.lineStyle(2, col, 0.8); bg.strokeRoundedRect(20, cy, W - 40, 126, 8); });
        zone.on('pointerout',  () => { bg.clear(); bg.fillStyle(col, 0.08); bg.fillRoundedRect(20, cy, W - 40, 126, 8); bg.lineStyle(1, col, 0.4); bg.strokeRoundedRect(20, cy, W - 40, 126, 8); });
        zone.on('pointerdown', () => this.scene.start('Battle', { channel: ch, channelIdx: i, worldId: this.worldId }));
      }
    });
  }
}

// ============================================================
class Battle extends Phaser.Scene {
  constructor() { super({ key: 'Battle' }); }

  init(data) {
    this.worldId    = (data && data.worldId) ? data.worldId : 'tv';
    const channels  = WORLD_CHANNELS[this.worldId] || WORLD_CHANNELS.tv;
    const ch        = (data && data.channel) ? data.channel : channels[0];
    this.channel    = ch;
    this.channelIdx = (data && data.channelIdx != null) ? data.channelIdx : 0;
    this.mechanic   = ch.mechanic || 'signal';
    this.save       = loadSave();
    const upgs      = this.save.upgrades || {};
    this.autoMs     = (upgs.overclock || ['pulse','velocity'].includes(this.mechanic)) ? 1500 : AUTO_MS;

    this.agents = DEFS
      .filter(d => { const s = this.save.agents.find(a => a.id === d.id); return s && s.owned && s.active; })
      .map(d => {
        const saved   = this.save.agents.find(a => a.id === d.id);
        const level   = saved.level;
        const stats   = effectiveStats(d.id, level, this.save);
        const subMoves = (saved.subclass && SUBCLASS_MOVES[saved.subclass]) ? [SUBCLASS_MOVES[saved.subclass]] : [];
        const equipped = this.save.gear?.equipped?.[d.id] || {};
        const ag = {
          ...d,
          ...stats,
          moves: [...d.moves, ...subMoves],
          hp: Math.min(saved.hp, stats.maxHp),
          en: stats.maxEn,
          sh: stats.maxSh,
          level,
          xp: saved.xp,
          subclass: saved.subclass || null,
          weapon: equipped.weapon || null,
          armor:  equipped.armor  || null,
          stored: 0,
          defending: false, fortified: false, locked: false, frozen: false, shielded: false,
        };
        // Apply global upgrades
        if (upgs.signal_boost)   ag.signal   += 5;
        if (upgs.hardened_nodes) { ag.maxHp += 10; ag.hp = Math.min(ag.hp + 10, ag.maxHp); }
        if (upgs.energy_reserve) { ag.maxEn += 10; ag.en += 10; }
        // Per-agent upgrades
        if (ag.id === 'threadling' && upgs.upg_threadling) ag.dmgBonus = (ag.dmgBonus||0) + 5;
        if (ag.id === 'glitcher'   && upgs.upg_glitcher)   ag._safeCorrupt = true;
        if (ag.id === 'netrunner'  && upgs.upg_netrunner)  ag._packetAura  = 5;
        if (ag.id === 'sentinel'   && upgs.upg_sentinel)   ag._scanBonus   = 5;
        if (ag.id === 'patchwork'  && upgs.upg_patchwork)  ag._patchBonus  = 10;
        if (ag.id === 'bridgelink' && upgs.upg_bridgelink) ag._syncBonus   = 15;
        if (ag.id === 'vault'      && upgs.upg_vault)      ag._bashBonus   = 0.15;
        return ag;
      });

    // Apply surplus_cache: grant 1 repair kit at session start if owned and have 0
    if (upgs.surplus_cache && this.save.items.repair_kit === 0) {
      this.save.items.repair_kit = 1; writeSave(this.save);
    }

    this.enemy = { ...ch.enemy, saveUsed: false, charged: false };
    // NG+ scales enemy HP
    if (upgs.ng_plus) {
      this.enemy.hp = Math.ceil(this.enemy.hp * 1.5);
      this.enemy.maxHp = this.enemy.hp;
    }
    this.heatStacks = 0;
    this.overflowRound = 0;
    this.state = STATE.PLAYER;
    this.activeIdx = 0;
    this.acted = new Set();
    this.round = 1;
    this.lastAction = null;
    this.tStart = 0;
    this.logs = [];
    this.phantomActive = false;
  }

  preload() {
    ['threadling','patchwork','vault','netrunner','sentinel','glitcher','bridgelink'].forEach(id => {
      this.load.image(`ag_${id}`, `assets/system_breach_full_asset_pack/agents/sprites/sprite_${id}.png`);
    });
  }

  create() {
    getMusicEng(this)?.play(this.mechanic);
    this._grid();
    this._spawnParticles();
    this._enemyUI();
    this._logUI();
    this._timerUI();
    this._cardUI();
    this._btnUI();
    const mechMsg = {
      signal:      '⚠️  Static aura active. Signal disrupted.',
      battery:     '🔋 Battery draining. Energy recharge halved.',
      echo:        '🔊 Echo chamber! Attacks may bounce to allies.',
      pulse:       '⏱️  Pulse grid. 1.5s auto-act timer.',
      savestate:   '💾 Save State active. Enemy recovers once from death.',
      freeze:      '❄️  Freezing sector. Attacks may freeze agents.',
      heat:        '🔥 Heat spiral. Enemy damage escalates each round.',
      entangle:    '🔗 Entanglement field. Random move locked each turn.',
      summon:      '📡 Summon protocol. Enemy may call backup.',
      predict:     '👁️  Predictive targeting. Enemy may hit twice.',
      packetloss:  '📡 Packet loss. Random agent loses EN each round.',
      overflow:    '⚡ Overflow. Enemy base damage grows each round.',
      velocity:    '⚡ Velocity mode. 1.5s auto-act timer.',
      transaction: '💸 Transaction world. Each action costs 2 cycles.',
      blackout:    '🌑 Blackout zone. All agent signals −15.',
      vital:       '💉 Vital regen. Enemy restores 15 HP each round.',
      distributed: '🌐 Distributed. Enemy hits ALL agents each turn.',
      delay:       '⏳ Signal delay. Enemy charges before heavy strikes.',
      upload:      '☁️  Upload active. Enemy signal grows every 2 rounds.',
    };
    this.log(`⚡ ${this.channel.enemy.name} detected. Squad deployed.`);
    this.log(mechMsg[this.mechanic] || '');
    this._startTurn();
  }

  update(t) {
    if (this.state !== STATE.PLAYER) return;
    const ratio = Math.max(0, 1 - (t - this.tStart) / this.autoMs);
    const bw = W - 60;
    this.timerFill.clear();
    const col = ratio > 0.5 ? COLORS.green : ratio > 0.25 ? COLORS.yellow : COLORS.red;
    this.timerFill.fillStyle(col, 0.9);
    this.timerFill.fillRect(30, this.timerY + 1, (bw - 2) * ratio, 10);
    if (ratio <= 0) this._autoAct();
  }

  // ── Background ──────────────────────────────────────────
  _grid() {
    const g = this.add.graphics();
    g.lineStyle(1, COLORS.grid, 0.7);
    for (let x = 0; x <= W; x += 30) g.lineBetween(x, 0, x, H);
    for (let y = 0; y <= H; y += 30) g.lineBetween(0, y, W, y);
    const s = this.add.graphics();
    s.fillStyle(0x000000, 0.2);
    for (let y = 0; y < H; y += 4) s.fillRect(0, y, W, 2);
    this.add.text(W / 2, 8, 'SYSTEM BREACH', {
      fontFamily: 'monospace', fontSize: '16px', color: '#00ff88', letterSpacing: 4,
    }).setOrigin(0.5, 0);
  }

  // ── Per-mechanic ambient particles ──────────────────────
  _spawnParticles() {
    // Generate base textures once — reused across scene restarts
    if (!this.textures.exists('ptx_dot')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xffffff, 1); g.fillCircle(4, 4, 3);
      g.generateTexture('ptx_dot', 8, 8); g.destroy();
    }
    if (!this.textures.exists('ptx_sq')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xffffff, 1); g.fillRect(1, 1, 6, 6);
      g.generateTexture('ptx_sq', 8, 8); g.destroy();
    }
    if (!this.textures.exists('ptx_bar')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xffffff, 1); g.fillRect(0, 3, 8, 2);
      g.generateTexture('ptx_bar', 8, 8); g.destroy();
    }

    const full  = { x: { min: 0, max: W }, y: { min: 0, max: H } };
    const top   = { x: { min: 0, max: W }, y: { min: 0,      max: 200 } };
    const floor = { x: { min: 0, max: W }, y: { min: H - 180, max: H } };

    // tex, tint[], speed, lifespan, alpha, scale, angle, gravityY, freq(ms), qty, spawn zone
    const cfgs = {
      signal:      ['ptx_sq',  [0xffffff,0x888888,0xcccccc,0x444444], {min:2,max:15},   {min:200,max:800},   {start:0.8,end:0}, {start:0.3,end:0.1}, {min:0,max:360},   0,   55,  1, full  ],
      battery:     ['ptx_dot', [0xffff00,0x00ff88,0xffaa00],           {min:20,max:50},  {min:500,max:1200},  {start:0.9,end:0}, {start:0.5,end:0.0}, {min:80,max:100},  40,  90,  1, top   ],
      echo:        ['ptx_dot', [0x4466ff,0x8888ff,0xaaaaff],           {min:5,max:30},   {min:800,max:2500},  {start:0.5,end:0}, {start:1.2,end:0.0}, {min:0,max:360},   0,   140, 2, full  ],
      pulse:       ['ptx_dot', [0x00ffff,0xffffff,0x44ffff],           {min:40,max:100}, {min:200,max:500},   {start:1.0,end:0}, {start:0.5,end:0},   {min:0,max:360},   0,   38,  2, full  ],
      savestate:   ['ptx_sq',  [0xff00ff,0x00ffff,0xffff00,0xff4444,0x44ff44], {min:3,max:20}, {min:1500,max:4000}, {start:0.8,end:0}, {start:0.5,end:0.2}, {min:0,max:360}, 0, 110, 1, full ],
      freeze:      ['ptx_dot', [0xaaddff,0xffffff,0xddeeff],           {min:5,max:15},   {min:2000,max:5000}, {start:0.7,end:0}, {start:0.4,end:0.1}, {min:80,max:100},  10,  75,  1, top   ],
      heat:        ['ptx_dot', [0xff4400,0xff8800,0xffcc00],           {min:25,max:70},  {min:400,max:1000},  {start:0.9,end:0}, {start:0.5,end:0.0}, {min:260,max:280}, -60, 45,  2, floor ],
      entangle:    ['ptx_bar', [0xffffff,0xdddddd,0x888888],           {min:3,max:12},   {min:2000,max:5000}, {start:0.4,end:0}, {start:0.4,end:0.8}, {min:0,max:360},   5,   190, 1, full  ],
      summon:      ['ptx_dot', [0x00ff88,0x00cc66,0x88ffcc],           {min:10,max:35},  {min:600,max:1800},  {start:0.9,end:0}, {start:0.2,end:0.6}, {min:0,max:360},   0,   110, 1, full  ],
      predict:     ['ptx_bar', [0xff4488,0xff88aa,0xffaac0],           {min:30,max:80},  {min:300,max:800},   {start:0.7,end:0}, {start:1.5,end:0.3}, {min:175,max:185}, 0,   75,  1, full  ],
      packetloss:  ['ptx_sq',  [0x4488ff,0x0066cc,0x0033aa],           {min:20,max:60},  {min:300,max:800},   {start:1.0,end:0}, {start:0.5,end:0.0}, {min:0,max:360},   0,   65,  1, full  ],
      overflow:    ['ptx_sq',  [0x00ff88,0x0088ff,0x88ff00],           {min:5,max:20},   {min:1200,max:3000}, {start:0.8,end:0}, {start:0.3,end:0.1}, {min:260,max:280}, -20, 85,  2, floor ],
      velocity:    ['ptx_bar', [0x6666ff,0x9999ff,0xffffff],           {min:80,max:200}, {min:150,max:400},   {start:0.8,end:0}, {start:1.2,end:0.2}, {min:175,max:185}, 0,   30,  2, full  ],
      transaction: ['ptx_dot', [0xffcc00,0xffaa00,0xffdd44],           {min:8,max:25},   {min:800,max:2000},  {start:0.8,end:0}, {start:0.4,end:0.1}, {min:0,max:360},   15,  120, 1, top   ],
      blackout:    ['ptx_dot', [0xffffff,0xffffaa,0xffff55],           {min:60,max:150}, {min:80,max:200},    {start:1.0,end:0}, {start:0.4,end:0},   {min:0,max:360},   0,   550, 5, full  ],
      vital:       ['ptx_dot', [0xff3355,0x00ff88],                    {min:5,max:25},   {min:600,max:1800},  {start:0.8,end:0}, {start:0.4,end:0.1}, {min:0,max:360},   0,   140, 1, full  ],
      distributed: ['ptx_dot', [0x44ff88,0x22cc66,0x88ffaa],           {min:3,max:20},   {min:1200,max:3500}, {start:0.6,end:0}, {start:0.2,end:0.4}, {min:0,max:360},   0,   95,  1, full  ],
      delay:       ['ptx_dot', [0x8888ff,0x4444cc,0xbbbbff],           {min:2,max:8},    {min:3000,max:6000}, {start:0.5,end:0}, {start:0.3,end:0.1}, {min:0,max:360},   0,   230, 1, full  ],
      upload:      ['ptx_dot', [0xaaddff,0xffffff,0x88ccff],           {min:30,max:80},  {min:500,max:1200},  {start:0.8,end:0}, {start:0.3,end:0.0}, {min:260,max:280}, -50, 50,  2, floor ],
    };

    const c = cfgs[this.mechanic];
    if (!c) return;
    const [tex, tint, speed, lifespan, alpha, scale, angle, gravityY, freq, qty, pos] = c;

    this.add.particles(0, 0, tex, {
      x: pos.x, y: pos.y,
      speed, lifespan, alpha, scale, angle, gravityY,
      frequency: freq, quantity: qty, tint,
    }).setDepth(-1);
  }

  // ── Enemy UI  y:32–210 ──────────────────────────────────
  _enemyUI() {
    const typeColor = { normal: '#444466', miniboss: '#ff8800', boss: '#ff3355' };
    const ch = this.channel;
    this.add.text(W / 2, 8, `${ch.label}  ·  ${ch.name}`, { fontFamily: 'monospace', fontSize: '13px', color: typeColor[ch.type] }).setOrigin(0.5, 0);
    this.add.text(W / 2, 26, ch.enemy.name, { fontFamily: 'monospace', fontSize: '22px', color: '#ff3355', fontStyle: 'bold' }).setOrigin(0.5, 0);

    this.blob = this.add.graphics();
    this._blob();
    this.tweens.add({ targets: this.blob, scaleX: 1.06, scaleY: 0.95, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this._blobBaseY = this.blob.y;

    const bw = W - 60;
    const hbg = this.add.graphics();
    hbg.fillStyle(0x111122, 1); hbg.fillRect(30, 160, bw, 18);
    hbg.lineStyle(1, COLORS.dim, 0.4); hbg.strokeRect(30, 160, bw, 18);
    this.eHpFill = this.add.graphics();
    this.eHpTxt = this.add.text(30 + bw / 2, 169, '', { fontFamily: 'monospace', fontSize: '13px', color: '#fff' }).setOrigin(0.5, 0.5).setDepth(1);
    this.eBadge = this.add.text(W / 2, 186, '', { fontFamily: 'monospace', fontSize: '13px', color: '#ff8844' }).setOrigin(0.5, 0);
    this._div(210);
    this._reEnemy();
  }

  _blob() {
    const g = this.blob, cx = W / 2, cy = 112;
    g.clear();
    [[60, 0.07], [44, 0.17], [30, 0.34]].forEach(([r, a]) => { g.fillStyle(COLORS.red, a); g.fillCircle(cx, cy, r); });
    g.lineStyle(2, COLORS.red, 0.9); g.strokeCircle(cx, cy, 30);
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2, r = 14 + rnd(0, 14);
      g.fillStyle(COLORS.red, Math.random() * 0.7);
      g.fillCircle(cx + Math.cos(a) * r, cy + Math.sin(a) * r, rnd(1, 3));
    }
    g.fillStyle(0xffffff, 0.9); g.fillCircle(cx - 8, cy - 4, 4); g.fillCircle(cx + 8, cy - 4, 4);
    g.fillStyle(COLORS.red, 1); g.fillCircle(cx - 8, cy - 4, 2); g.fillCircle(cx + 8, cy - 4, 2);
  }

  // ── Log  y:214–322 ─────────────────────────────────────
  _logUI() {
    const lx = 16, ly = 214, lw = W - 32, lh = 104;
    const bg = this.add.graphics();
    bg.fillStyle(COLORS.panel, 1); bg.fillRect(lx, ly, lw, lh);
    bg.lineStyle(1, COLORS.dim, 0.5); bg.strokeRect(lx, ly, lw, lh);
    this.add.text(lx + 8, ly + 5, 'SYSTEM LOG', { fontFamily: 'monospace', fontSize: '12px', color: '#333355' });
    this.logTxts = Array.from({ length: 3 }, (_, i) =>
      this.add.text(lx + 8, ly + 22 + i * 26, '', { fontFamily: 'monospace', fontSize: '16px', color: '#9999cc', wordWrap: { width: lw - 16 } })
    );
    this._div(326);
  }

  // ── Timer row  y:330–354 ────────────────────────────────
  _timerUI() {
    this.timerY = 344;
    this.turnLbl = this.add.text(W / 2, 330, '', { fontFamily: 'monospace', fontSize: '15px', color: '#00ff88' }).setOrigin(0.5, 0);
    const bw = W - 60;
    const tbg = this.add.graphics();
    tbg.fillStyle(0x111122, 1); tbg.fillRect(30, this.timerY, bw, 12);
    tbg.lineStyle(1, COLORS.dim, 0.4); tbg.strokeRect(30, this.timerY, bw, 12);
    this.timerFill = this.add.graphics();
    this.add.text(W - 28, this.timerY + 6, 'AUTO', { fontFamily: 'monospace', fontSize: '10px', color: '#333355' }).setOrigin(1, 0.5);
    this._div(364);
  }

  // ── Agent cards  y:368–548 ─────────────────────────────
  _cardUI() {
    const cw = 118, ch = 178, gap = 6;
    const count = this.agents.length;
    const startX = (W - (cw * count + gap * (count - 1))) / 2;
    this.cards = this.agents.map((ag, i) => {
      const cx = startX + i * (cw + gap), cy = 368;
      const bg = this.add.graphics();

      // sprite centered in 118×90 area (sprite is 44×66px)
      const sp = this._makeSpriteNode(ag, cx + 37, cy + 13);
      const _baseSpY = sp.y, _baseSpX = sp.x;
      const _idleTween = this.tweens.add({
        targets: sp, y: _baseSpY + 3,
        duration: 1300 + i * 180, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });

      // divider under sprite
      const sdiv = this.add.graphics();
      sdiv.lineStyle(1, ag.color, 0.2);
      sdiv.lineBetween(cx + 6, cy + 90, cx + cw - 6, cy + 90);

      const hex = '#' + ag.color.toString(16).padStart(6, '0');
      const nm = this.add.text(cx + cw / 2, cy + 94, ag.name, { fontFamily: 'monospace', fontSize: '11px', color: hex, fontStyle: 'bold' }).setOrigin(0.5, 0);
      const cl = this.add.text(cx + cw / 2, cy + 108, ag.cls, { fontFamily: 'monospace', fontSize: '10px', color: '#444466' }).setOrigin(0.5, 0);

      // agent number decal (top-right corner of card)
      const decal = ag.decal || String(i + 1).padStart(2, '0');
      const dc = this.add.text(cx + cw - 5, cy + 4, decal, { fontFamily: 'monospace', fontSize: '9px', color: '#3a3a55', fontStyle: 'bold' }).setOrigin(1, 0);

      const bw = cw - 16;
      const hbg = this.add.graphics();
      hbg.fillStyle(0x111122, 1); hbg.fillRect(cx + 8, cy + 120, bw, 11);
      hbg.lineStyle(1, COLORS.dim, 0.3); hbg.strokeRect(cx + 8, cy + 120, bw, 11);
      const hf = this.add.graphics();
      const hl = this.add.text(cx + 8 + bw / 2, cy + 125, '', { fontFamily: 'monospace', fontSize: '9px', color: '#fff' }).setOrigin(0.5, 0.5).setDepth(1);
      const ebg = this.add.graphics();
      ebg.fillStyle(0x111122, 1); ebg.fillRect(cx + 8, cy + 133, bw, 8);
      ebg.lineStyle(1, COLORS.dim, 0.3); ebg.strokeRect(cx + 8, cy + 133, bw, 8);
      const ef = this.add.graphics();
      const el = this.add.text(cx + 8 + bw / 2, cy + 137, '', { fontFamily: 'monospace', fontSize: '8px', color: '#fff' }).setOrigin(0.5, 0.5).setDepth(1);
      // SH (Shield) bar — only meaningful if maxSh > 0
      const shbg = this.add.graphics();
      const sf = this.add.graphics();
      const sl = this.add.text(cx + 8 + bw / 2, cy + 147, '', { fontFamily: 'monospace', fontSize: '8px', color: '#fff' }).setOrigin(0.5, 0.5).setDepth(1);
      if (ag.maxSh > 0) {
        shbg.fillStyle(0x111122, 1); shbg.fillRect(cx + 8, cy + 143, bw, 8);
        shbg.lineStyle(1, 0x4488cc, 0.3); shbg.strokeRect(cx + 8, cy + 143, bw, 8);
      }
      const sg = this.add.text(cx + 8, cy + 156, '', { fontFamily: 'monospace', fontSize: '10px', color: '#ffcc00' });
      const st = this.add.text(cx + 8, cy + 168, '', { fontFamily: 'monospace', fontSize: '10px', color: '#aaaacc' });

      // tap zone on sprite area to show stats
      const tap = this.add.zone(cx, cy, cw, 90).setOrigin(0).setInteractive();
      tap.on('pointerdown', () => this._showStats(i));

      return { bg, sp, nm, cl, dc, hf, hl, ef, el, shbg, sf, sl, sg, st, cx, cy, cw, ch, bw, _idleTween, _baseSpY, _baseSpX };
    });
    this.agents.forEach((_, i) => this._reCard(i));
    this._div(554);
  }

  // ── Action buttons  y:520–720 ──────────────────────────
  _btnUI() {
    this.btnCon = this.add.container(0, 0);
    this.btnZones = [];
    this._rebuildBtns();
  }

  _rebuildBtns() {
    this.btnCon.removeAll(true);
    this.btnZones.forEach(z => z.destroy());
    this.btnZones = [];
    this._entangledIdx = (this.mechanic === 'entangle') ? Math.floor(Math.random() * 4) : -1;
    const ag = this.agents[this.activeIdx];
    if (!ag) return;
    const bw = (W - 48) / 2, bh = 78, sy = 562, gap = 8;
    const rows = [
      ag.moves,
      [
        { id: 'defend', label: 'DEFEND', sub: 'Block 50% dmg', color: COLORS.blue, cost: 0 },
        { id: 'item',   label: 'ITEM',   sub: 'None available', color: COLORS.dim,  cost: 0 },
      ],
    ];
    rows.forEach((row, ri) => {
      row.forEach((def, ci) => {
        const bx = 16 + ci * (bw + 16), by = sy + ri * (bh + gap);
        const bg = this.add.graphics();
        bg.fillStyle(def.color, 0.15); bg.fillRoundedRect(0, 0, bw, bh, 8);
        bg.lineStyle(1, def.color, 0.6); bg.strokeRoundedRect(0, 0, bw, bh, 8);
        bg.setPosition(bx, by);
        const hex = '#' + def.color.toString(16).padStart(6, '0');
        const lb = this.add.text(bx + bw / 2, by + 28, def.label, { fontFamily: 'monospace', fontSize: '18px', color: hex, fontStyle: 'bold' }).setOrigin(0.5, 0.5);
        const sb = this.add.text(bx + bw / 2, by + 54, def.sub, { fontFamily: 'monospace', fontSize: '11px', color: '#555577' }).setOrigin(0.5, 0.5);
        this.btnCon.add(bg); this.btnCon.add(lb); this.btnCon.add(sb);
        const zoneIdx = this.btnZones.length;
        const entangled = zoneIdx === this._entangledIdx;
        if (entangled) { bg.setAlpha(0.3); }
        const z = this.add.zone(bx, by, bw, bh).setOrigin(0).setInteractive();
        if (entangled) { z.disableInteractive(); this.add.text(bx + bw/2, by + bh - 14, '🔗 LOCKED', { fontFamily:'monospace', fontSize:'9px', color:'#ff8800' }).setOrigin(0.5); }
        else { z.on('pointerdown', () => this.act(def.id)); z.on('pointerover', () => bg.setAlpha(1.6)); z.on('pointerout', () => bg.setAlpha(entangled ? 0.3 : 1.0)); }
        this.btnZones.push(z);
      });
    });
  }

  // ── Refresh ─────────────────────────────────────────────
  _reEnemy() {
    const bw = W - 62, r = Math.max(0, this.enemy.hp / this.enemy.maxHp);
    this.eHpFill.clear();
    this.eHpFill.fillStyle(COLORS.red, 0.85);
    this.eHpFill.fillRect(31, 161, (bw - 2) * r, 16);
    this.eHpTxt.setText(`${this.enemy.hp} / ${this.enemy.maxHp}`);
    const aura = this.enemy.aura + this.enemy.stacks * 8;
    const mechBadge = {
      signal:      `📡 AURA −${aura}% SIG`,
      battery:     `🔋 EN REGEN ×0.4  ·  −${aura}%`,
      echo:        `🔊 ECHO BOUNCE  ·  −${aura}%`,
      pulse:       `⏱️ PULSE 1.5s  ·  −${aura}%`,
      savestate:   (this.enemy.saveUsed ? '💾 SAVE USED' : '💾 SAVE READY') + `  ·  −${aura}%`,
      freeze:      `❄️ FREEZE 35%  ·  −${aura}%`,
      heat:        `🔥 HEAT +${(this.heatStacks||0)*2} DMG  ·  −${aura}%`,
      entangle:    `🔗 ENTANGLE  ·  −${aura}%`,
      summon:      `📡 SUMMON  ·  −${aura}%`,
      predict:     `👁️ PREDICT  ·  −${aura}%`,
      packetloss:  `📡 PKT LOSS  ·  −${aura}%`,
      overflow:    `⚡ OVF +${(this.overflowRound||0)*3} DMG  ·  −${aura}%`,
      velocity:    `⚡ VELOCITY 1.5s  ·  −${aura}%`,
      transaction: `💸 −2⚙/ACTION  ·  −${aura}%`,
      blackout:    `🌑 BLACKOUT −15 SIG  ·  −${aura}%`,
      vital:       `💉 REGEN +15/RD  ·  −${aura}%`,
      distributed: `🌐 DISTRIBUTE ALL  ·  −${aura}%`,
      delay:       (this.enemy?.charged ? '⚡ CHARGED!' : '⏳ DELAY') + `  ·  −${aura}%`,
      upload:      `☁️ UPLOAD ×${this.enemy.stacks}  ·  −${aura}%`,
    };
    this.eBadge.setText(mechBadge[this.mechanic] || `📡 AURA −${aura}%`);
    this.eBadge.setColor(this.enemy.stacks > 0 ? '#ff4444' : '#ff8844');
  }

  _reCard(i) {
    const ag = this.agents[i], obj = this.cards[i];
    const active = i === this.activeIdx && this.state === STATE.PLAYER;
    const dead = ag.hp <= 0;
    obj.bg.clear();
    obj.bg.fillStyle(ag.color, active ? 0.18 : 0.06);
    obj.bg.fillRoundedRect(obj.cx, obj.cy, obj.cw, obj.ch, 6);
    obj.bg.lineStyle(active ? 2 : 1, ag.color, active ? 0.9 : 0.25);
    obj.bg.strokeRoundedRect(obj.cx, obj.cy, obj.cw, obj.ch, 6);
    obj.sp.setAlpha(dead ? 0.2 : 1);

    // damage-state sprite tint (Normal / Damaged / Critical / Destroyed)
    const ratio = ag.maxHp > 0 ? ag.hp / ag.maxHp : 0;
    if (dead)            obj.sp.setTint(0x441122);
    else if (ratio < 0.3) obj.sp.setTint(0xff5544); // Critical
    else if (ratio < 0.6) obj.sp.setTint(0xffaa44); // Damaged
    else                  obj.sp.clearTint();       // Normal

    const bw = obj.bw;
    const hr = Math.max(0, ratio);
    obj.hf.clear();
    if (!dead) { obj.hf.fillStyle(ag.color, 0.85); obj.hf.fillRect(obj.cx + 9, obj.cy + 121, (bw - 2) * hr, 9); }
    obj.hl.setText(`HP ${ag.hp}/${ag.maxHp}`);
    const er = Math.max(0, ag.en / ag.maxEn);
    obj.ef.clear();
    if (!dead) { obj.ef.fillStyle(COLORS.blue, 0.85); obj.ef.fillRect(obj.cx + 9, obj.cy + 134, (bw - 2) * er, 6); }
    obj.el.setText(`EN ${ag.en}/${ag.maxEn}`);

    // Shield (SH) bar — only render if agent has shield capacity
    obj.sf.clear();
    if (ag.maxSh > 0 && !dead) {
      const sr = Math.max(0, (ag.sh || 0) / ag.maxSh);
      obj.sf.fillStyle(0x66c8ff, 0.9); obj.sf.fillRect(obj.cx + 9, obj.cy + 144, (bw - 2) * sr, 6);
      obj.sl.setText(`SH ${ag.sh}/${ag.maxSh}`).setVisible(true);
    } else {
      obj.sl.setVisible(false);
    }

    const blackoutPenalty = this.mechanic === 'blackout' ? 15 : 0;
    const sig = Math.max(10, ag.signal - this.enemy.aura - this.enemy.stacks * 8 - blackoutPenalty);
    obj.sg.setText(`SIG ${sig}%`);
    obj.sg.setColor(sig < 50 ? '#ff4444' : '#ffcc00');
    const badges = [];
    if (ag.defending)  badges.push('🛡');
    if (ag.fortified)  badges.push('⚡');
    if (ag.frozen)     badges.push('❄');
    if (ag.shielded)   badges.push('🔷');
    if (ag.locked)     badges.push('🔒');
    if (ag.stored > 0) badges.push(`📦${ag.stored}`);
    if (ratio > 0 && ratio < 0.3) badges.push('⚠');
    if (dead)          badges.push('💀');
    obj.st.setText(badges.join(' '));
    obj.st.setColor(dead ? '#ff3355' : ratio < 0.3 && !dead ? '#ff8844' : '#aaaacc');
    obj.nm.setAlpha(dead ? 0.3 : 1);
    obj.dc.setAlpha(dead ? 0.2 : 0.7);
  }

  _reAll() { this.agents.forEach((_, i) => this._reCard(i)); }

  // ── Turn management ─────────────────────────────────────
  _startTurn() {
    const ag = this.agents[this.activeIdx];
    if (ag.locked) {
      this.log(`> ${ag.name}: SIGNAL LOCKED — skipping turn`);
      ag.locked = false; this._reAll();
      this.time.delayedCall(600, () => this._next()); return;
    }
    if (ag.frozen) {
      this.log(`> ${ag.name}: ❄ FROZEN — cannot act`);
      ag.frozen = false; this._reAll();
      this.time.delayedCall(600, () => this._next()); return;
    }
    this.state = STATE.PLAYER;
    this.tStart = this.time.now;
    this.turnLbl.setText(`${ag.name}  ·  YOUR TURN`);
    this.turnLbl.setColor('#' + ag.color.toString(16).padStart(6, '0'));
    this._rebuildBtns();
    this._reAll();
    this._btns(true);
  }

  _next() {
    this.acted.add(this.activeIdx);
    const living = this.agents.map((a, i) => i).filter(i => this.agents[i].hp > 0);
    const allDone = living.every(i => this.acted.has(i));
    if (allDone) {
      this.timerFill.clear();
      this.time.delayedCall(500, () => this._enemyTurn());
    } else {
      const n = this.agents.length;
      let nx = (this.activeIdx + 1) % n, tries = 0;
      while ((this.agents[nx].hp <= 0 || this.acted.has(nx)) && tries++ < n) nx = (nx + 1) % n;
      this.activeIdx = nx;
      this.time.delayedCall(400, () => this._startTurn());
    }
  }

  // ── Auto-act ────────────────────────────────────────────
  _autoAct() {
    if (this.state !== STATE.PLAYER) return;
    const ag = this.agents[this.activeIdx];
    const alive = this.agents.filter(a => a.hp > 0);
    const minRatio = alive.length ? Math.min(...alive.map(a => a.hp / a.maxHp)) : 1;

    let id = ag.moves[0].id; // safe fallback: first move
    if (ag.hp < ag.maxHp * 0.25) {
      id = 'defend';
    } else {
      switch (ag.id) {
        case 'threadling':  id = 'attack'; break;
        case 'patchwork':   id = (ag.en >= 15 && minRatio < 0.5) ? 'patch' : 'attack'; break;
        case 'vault':       id = 'bash'; break;
        case 'netrunner':   id = 'packet'; break;
        case 'sentinel':
          id = (ag.en >= 15 && minRatio < 0.5) ? 'firewall' : (ag.en >= 10 ? 'scan' : 'defend');
          break;
        case 'glitcher':    id = 'corrupt'; break;
        case 'bridgelink':
          id = (ag.en >= 20 && minRatio < 0.45) ? 'sync' : (ag.en >= 10 ? 'boost' : ag.moves[0].id);
          break;
      }
    }
    this.log(`⚙️ ${ag.name} auto: ${id.toUpperCase()}`);
    this.act(id);
  }

  // ── Action ──────────────────────────────────────────────
  act(id) {
    if (this.state !== STATE.PLAYER) return;
    this.state = STATE.ANIM;
    this._btns(false);
    const ag = this.agents[this.activeIdx];
    const blackoutPenalty = this.mechanic === 'blackout' ? 15 : 0;
    const sig = Math.max(10, ag.signal - this.enemy.aura - this.enemy.stacks * 8 - blackoutPenalty);
    ag.defending = false; ag.fortified = false;

    // Attack lunge animation for active agent sprite
    if (id !== 'item' && id !== 'defend') {
      const card = this.cards[this.activeIdx];
      if (card?.sp) {
        this.tweens.killTweensOf(card.sp);
        const baseY = card._baseSpY || 0;
        this.tweens.add({
          targets: card.sp, y: baseY - 14,
          duration: 110, yoyo: true, ease: 'Power2.easeOut',
          onComplete: () => {
            card.sp.y = baseY;
            card._idleTween = this.tweens.add({
              targets: card.sp, y: baseY + 3,
              duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
            });
          },
        });
      }
    }

    // Transaction world: each action costs 2 cycles
    if (this.mechanic === 'transaction' && id !== 'item' && id !== 'defend') {
      if (this.save.cycles >= 2) { this.save.cycles -= 2; writeSave(this.save); this.log('> 💸 TRANSACTION: −2 cycles'); }
    }

    if (id === 'item') {
      this.state = STATE.PLAYER; this._btns(true);
      this._showItems(); return;
    }

    if (id === 'attack' || id === 'bash') {
      const bonus = id === 'bash' ? 15 : 0;
      const phantom = this.phantomActive && Math.random() < 0.5;
      this.phantomActive = false;
      if (!hits(sig + bonus) || phantom) {
        this.log(`> ${ag.name}: ${id.toUpperCase()} [${phantom ? 'PHANTOM' : 'MISS'}]`);
        getSoundMgr(this)?.play('miss');
      } else {
        const dmg = rnd(10, 18) + (ag.dmgBonus || 0);
        this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
        this.log(`> ${ag.name}: ${id.toUpperCase()} → −${dmg}`);
        this._flashE();
        this.lastAction = { id, agentIdx: this.activeIdx };
        // Bash upgrade: 15% chance to stun (reduce enemy aura)
        if (id === 'bash' && ag._bashBonus && Math.random() < ag._bashBonus) {
          this.enemy.aura = Math.max(0, this.enemy.aura - 10);
          this.log(`> VAULT: BASH STUN — enemy aura −10`);
        }
        if (this.mechanic === 'echo' && Math.random() < 0.3) {
          const alive = this.agents.filter(a => a.hp > 0);
          const tgt = alive[Math.floor(Math.random() * alive.length)];
          const bd = Math.ceil(dmg * 0.4);
          tgt.hp = Math.max(0, tgt.hp - bd);
          this.log(`> ↩ ECHO BOUNCE → ${tgt.name} −${bd}`);
        }
      }

    } else if (id === 'overclock') {
      if (ag.en < 20) { this.log('> Need 20 energy'); this.state = STATE.PLAYER; this._btns(true); return; }
      ag.en -= 20;
      if (!hits(sig)) {
        ag.hp = Math.max(0, ag.hp - 5);
        this.log(`> ${ag.name}: OVERCLOCK [MISS] bleed −5`);
        getSoundMgr(this)?.play('miss');
      } else {
        const dmg = rnd(26, 36) + (ag.dmgBonus || 0);
        this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
        ag.hp = Math.max(0, ag.hp - 10);
        this.log(`> ${ag.name}: OVERCLOCK → −${dmg} · self −10`);
        this._flashE();
        this.lastAction = { id: 'overclock', agentIdx: this.activeIdx };
      }

    } else if (id === 'patch') {
      if (ag.en < 15) { this.log('> Need 15 energy'); this.state = STATE.PLAYER; this._btns(true); return; }
      ag.en -= 15;
      const alive = this.agents.filter(a => a.hp > 0);
      const tgt = alive.reduce((a, b) => (a.hp / a.maxHp) < (b.hp / b.maxHp) ? a : b);
      const heal = rnd(20, 30) + (ag._patchBonus || 0);
      tgt.hp = Math.min(tgt.maxHp, tgt.hp + heal);
      this.log(`> PATCHWORK: PATCH → ${tgt.name} +${heal} HP`);
      getSoundMgr(this)?.play('heal');
      this.lastAction = { id: 'patch' };

    } else if (id === 'replay') {
      if (!this.lastAction) { this.log('> Nothing to replay'); this.state = STATE.PLAYER; this._btns(true); return; }
      if (ag.en < 15) { this.log('> Need 15 energy'); this.state = STATE.PLAYER; this._btns(true); return; }
      ag.en -= 15;
      const la = this.lastAction;
      if (la.id === 'attack' || la.id === 'bash' || la.id === 'overclock') {
        const dmg = Math.ceil(rnd(10, 18) * 0.5);
        this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
        this.log(`> PATCHWORK: REPLAY → −${dmg}`);
        this._flashE();
      } else if (la.id === 'patch') {
        const alive = this.agents.filter(a => a.hp > 0);
        const tgt = alive.reduce((a, b) => (a.hp / a.maxHp) < (b.hp / b.maxHp) ? a : b);
        const heal = Math.ceil(rnd(20, 30) * 0.5);
        tgt.hp = Math.min(tgt.maxHp, tgt.hp + heal);
        this.log(`> PATCHWORK: REPLAY PATCH → ${tgt.name} +${heal}`);
      }

    } else if (id === 'defend') {
      ag.defending = true; this.log(`> ${ag.name}: DEFEND`);
      getSoundMgr(this)?.play('defend');

    } else if (id === 'fortify') {
      ag.fortified = true; this.log(`> ${ag.name}: FORTIFY — 60% dmg reduction`);

    // ── New agent base moves ───────────────────────────────
    } else if (id === 'packet') {
      if (!hits(sig + 10)) {
        this.log(`> ${ag.name}: PACKET [MISS]`); getSoundMgr(this)?.play('miss');
      } else {
        const dmg = rnd(10, 16) + (ag.dmgBonus || 0);
        this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
        if (ag._packetAura) this.enemy.aura = Math.max(0, this.enemy.aura - ag._packetAura);
        this.log(`> ${ag.name}: PACKET → −${dmg}${ag._packetAura ? ` · aura −${ag._packetAura}` : ''}`);
        this._flashE();
        this.lastAction = { id: 'packet', agentIdx: this.activeIdx };
      }
    } else if (id === 'intercept') {
      if (ag.en < 10) { this.log('> Need 10 EN'); this.state = STATE.PLAYER; this._btns(true); return; }
      ag.en -= 10; ag.defending = true;
      const cdmg = rnd(8, 14) + (ag.dmgBonus || 0);
      this.enemy.hp = Math.max(0, this.enemy.hp - cdmg);
      this.log(`> ${ag.name}: INTERCEPT → block + counter −${cdmg}`); this._flashE();

    } else if (id === 'scan') {
      if (ag.en < 10) { this.log('> Need 10 EN'); this.state = STATE.PLAYER; this._btns(true); return; }
      ag.en -= 10;
      const drainAmt = 15 + (ag._scanBonus || 0);
      this.enemy.aura = Math.max(0, this.enemy.aura - drainAmt);
      this.log(`> ${ag.name}: SCAN — enemy aura −${drainAmt}`); this._reEnemy();
      getSoundMgr(this)?.play('scan');

    } else if (id === 'firewall') {
      if (ag.en < 15) { this.log('> Need 15 EN'); this.state = STATE.PLAYER; this._btns(true); return; }
      ag.en -= 15;
      const fwAlive = this.agents.filter(a => a.hp > 0);
      const fwTgt = fwAlive.reduce((a, b) => (a.hp / a.maxHp) < (b.hp / b.maxHp) ? a : b);
      fwTgt.shielded = true;
      this.log(`> ${ag.name}: FIREWALL — ${fwTgt.name} shielded`);

    } else if (id === 'corrupt') {
      if (Math.random() < 0.65) {
        if (!hits(sig)) {
          this.log(`> ${ag.name}: CORRUPT [MISS]`);
        } else {
          const dmg = rnd(12, 20) + (ag.dmgBonus || 0);
          this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
          this.log(`> ${ag.name}: CORRUPT → −${dmg}`); this._flashE();
        }
      } else {
        const crAlive = this.agents.filter(a => a.hp > 0);
        const crTgt = crAlive[Math.floor(Math.random() * crAlive.length)];
        const dmg = rnd(8, 14);
        crTgt.hp = Math.max(0, crTgt.hp - dmg);
        this.log(`> ${ag.name}: CORRUPT [BACKFIRE] → ${crTgt.name} −${dmg}`);
      }

    } else if (id === 'exploit') {
      if (ag.en < 20) { this.log('> Need 20 EN'); this.state = STATE.PLAYER; this._btns(true); return; }
      ag.en -= 20;
      if (this.enemy.hp < this.enemy.maxHp * 0.5) {
        const dmg = rnd(22, 34) + (ag.dmgBonus || 0);
        this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
        this.log(`> ${ag.name}: EXPLOIT [CRIT] → −${dmg}`); this._flashE();
      } else {
        const dmg = rnd(10, 16) + (ag.dmgBonus || 0);
        this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
        this.log(`> ${ag.name}: EXPLOIT → −${dmg} (no crit yet)`); this._flashE();
      }

    } else if (id === 'boost') {
      if (ag.en < 10) { this.log('> Need 10 EN'); this.state = STATE.PLAYER; this._btns(true); return; }
      ag.en -= 10;
      this.agents.filter(a => a.hp > 0).forEach(a => { a.en = Math.min(a.maxEn, a.en + 10); });
      this.log(`> ${ag.name}: BOOST — all allies +10 EN`);
      getSoundMgr(this)?.play('boost');

    } else if (id === 'sync') {
      if (ag.en < 20) { this.log('> Need 20 EN'); this.state = STATE.PLAYER; this._btns(true); return; }
      ag.en -= 20;
      const syncBonus = ag._syncBonus || 0;
      const heals = this.agents.filter(a => a.hp > 0).map(a => {
        const h = rnd(10, 16) + syncBonus; a.hp = Math.min(a.maxHp, a.hp + h); return h;
      });
      this.log(`> ${ag.name}: SYNC — all allies +${Math.min(...heals)}–${Math.max(...heals)} HP`);
      getSoundMgr(this)?.play('heal');

    // ── Subclass moves ────────────────────────────────────
    } else if (id === 'overload') {
      if (ag.en < 30) { this.log('> Need 30 EN'); this.state = STATE.PLAYER; this._btns(true); return; }
      ag.en -= 30;
      const dmg = rnd(38, 54) + (ag.dmgBonus || 0);
      this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
      ag.hp = Math.max(1, ag.hp - 25);
      this.log(`> ${ag.name}: OVERLOAD → −${dmg} · self −25`); this._flashE();

    } else if (id === 'multishot') {
      if (ag.en < 15) { this.log('> Need 15 EN'); this.state = STATE.PLAYER; this._btns(true); return; }
      ag.en -= 15;
      let total = 0;
      for (let i = 0; i < 3; i++) { if (hits(sig)) { const d = rnd(6, 12) + (ag.dmgBonus || 0); this.enemy.hp = Math.max(0, this.enemy.hp - d); total += d; } }
      this.log(`> ${ag.name}: MULTISHOT → −${total} (3 hits)`); if (total > 0) this._flashE();

    } else if (id === 'cache_run') {
      if (ag.en < 25) { this.log('> Need 25 EN'); this.state = STATE.PLAYER; this._btns(true); return; }
      ag.en -= 25;
      const recent = this.logs.slice(-6).filter(l => l.startsWith('> ') && l.includes('→'));
      let total = 0;
      for (let i = 0; i < Math.min(3, recent.length); i++) { const d = rnd(6, 12); this.enemy.hp = Math.max(0, this.enemy.hp - d); total += d; }
      this.log(`> ${ag.name}: CACHE RUN → −${total} (cached)`); if (total > 0) this._flashE();

    } else if (id === 'revive') {
      if (ag.en < 30) { this.log('> Need 30 EN'); this.state = STATE.PLAYER; this._btns(true); return; }
      const dead = this.agents.find(a => a.hp <= 0);
      if (!dead) { this.log('> No fallen allies'); this.state = STATE.PLAYER; this._btns(true); return; }
      ag.en -= 30;
      dead.hp = Math.ceil(dead.maxHp * 0.3);
      this.log(`> ${ag.name}: RESTORE → ${dead.name} revived at ${dead.hp} HP`);
      getSoundMgr(this)?.play('heal');

    } else if (id === 'release') {
      const stored = ag.stored || 0;
      if (stored === 0) { this.log('> Nothing stored yet'); this.state = STATE.PLAYER; this._btns(true); return; }
      const dmg = Math.ceil(stored * 1.5) + (ag.dmgBonus || 0);
      this.enemy.hp = Math.max(0, this.enemy.hp - dmg); ag.stored = 0;
      this.log(`> ${ag.name}: RELEASE → −${dmg} (stored ×1.5)`); this._flashE();

    } else if (id === 'bulwark') {
      this.agents.filter(a => a.hp > 0).forEach(a => a.fortified = true);
      this.log(`> ${ag.name}: BULWARK — all allies fortified this round`);

    } else if (id === 'reroute') {
      if (ag.en < 15) { this.log('> Need 15 EN'); this.state = STATE.PLAYER; this._btns(true); return; }
      ag.en -= 15; ag.rerouting = true;
      this.log(`> ${ag.name}: REROUTE — next attack redirected`);

    } else if (id === 'multicast') {
      if (ag.en < 20) { this.log('> Need 20 EN'); this.state = STATE.PLAYER; this._btns(true); return; }
      ag.en -= 20;
      const dmg = rnd(10, 18) + (ag.dmgBonus || 0);
      this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
      this.enemy.stacks = Math.min(3, this.enemy.stacks + 1);
      this.log(`> ${ag.name}: MULTICAST → −${dmg} + signal stack`); this._flashE();

    } else if (id === 'reflect') {
      ag.reflecting = true; this.log(`> ${ag.name}: REFLECT — 60% damage reflected next hit`);

    } else if (id === 'deep_scan') {
      if (ag.en < 20) { this.log('> Need 20 EN'); this.state = STATE.PLAYER; this._btns(true); return; }
      ag.en -= 20;
      this.enemy.aura = Math.max(0, this.enemy.aura - 20);
      this.enemy.vulnBonus = (this.enemy.vulnBonus || 0) + 15;
      this.log(`> ${ag.name}: DEEP SCAN — enemy −20 aura, +15% vuln`);

    } else if (id === 'virus') {
      if (ag.en < 15) { this.log('> Need 15 EN'); this.state = STATE.PLAYER; this._btns(true); return; }
      ag.en -= 15;
      this.enemy.stacks = Math.min(3, this.enemy.stacks + 1);
      this.log(`> ${ag.name}: VIRUS — enemy signal stack ${this.enemy.stacks}`);

    } else if (id === 'zero_day') {
      if (ag.en < 30) { this.log('> Need 30 EN'); this.state = STATE.PLAYER; this._btns(true); return; }
      ag.en -= 30;
      const dmg = rnd(34, 50) + (ag.dmgBonus || 0);
      this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
      this.log(`> ${ag.name}: ZERO DAY [CRIT] → −${dmg}`); this._flashE();

    } else if (id === 'chain') {
      if (ag.en < 20) { this.log('> Need 20 EN'); this.state = STATE.PLAYER; this._btns(true); return; }
      ag.en -= 20;
      const ally = this.agents.find((a, idx) => a.hp > 0 && idx !== this.activeIdx);
      if (ally) { const d = rnd(8, 14) + (ally.dmgBonus || 0); this.enemy.hp = Math.max(0, this.enemy.hp - d); this.log(`> ${ag.name}: CHAIN → ${ally.name} acts! −${d}`); this._flashE(); }
      else this.log(`> ${ag.name}: CHAIN — no ally`);

    } else if (id === 'link') {
      if (ag.en < 10) { this.log('> Need 10 EN'); this.state = STATE.PLAYER; this._btns(true); return; }
      ag.en -= 10;
      const weakest = this.agents.filter(a => a.hp > 0).reduce((a, b) => (a.hp / a.maxHp) < (b.hp / b.maxHp) ? a : b);
      const avgHp = Math.ceil((ag.hp + weakest.hp) / 2);
      const avgEn = Math.ceil((ag.en + weakest.en) / 2);
      ag.hp = Math.min(ag.maxHp, avgHp); weakest.hp = Math.min(weakest.maxHp, avgHp);
      ag.en = Math.min(ag.maxEn, avgEn); weakest.en = Math.min(weakest.maxEn, avgEn);
      this.log(`> ${ag.name}: LINK → shared HP/EN with ${weakest.name}`);

    // ── Items ─────────────────────────────────────────────
    } else if (id === 'use_repair_kit') {
      this.save.items.repair_kit--; writeSave(this.save);
      const heal = (this.save.upgrades?.quick_repair) ? 60 : 40;
      ag.hp = Math.min(ag.maxHp, ag.hp + heal);
      this.log(`> 🔧 REPAIR KIT: ${ag.name} +${heal} HP`);
      getSoundMgr(this)?.play('heal');

    } else if (id === 'use_energy_cell') {
      this.save.items.energy_cell--; writeSave(this.save);
      const en = (this.save.upgrades?.power_surge) ? 50 : 30;
      this.agents.filter(a => a.hp > 0).forEach(a => { a.en = Math.min(a.maxEn, a.en + en); });
      this.log(`> ⚡ ENERGY CELL: all allies +${en} EN`);
      getSoundMgr(this)?.play('item');

    } else if (id === 'use_sig_boost') {
      this.save.items.sig_boost--; writeSave(this.save);
      this.enemy.aura = Math.max(0, this.enemy.aura - 20);
      this.log(`> 📡 SIG BOOST: enemy aura −20`);
      getSoundMgr(this)?.play('item');

    } else if (id === 'use_emp_charge') {
      this.save.items.emp_charge--; writeSave(this.save);
      const dmg = 50; this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
      this.log(`> 💥 EMP CHARGE: enemy −${dmg}`); this._flashE();
      getSoundMgr(this)?.play('item');
    }

    this._reEnemy(); this._reAll();

    // Save State mechanic: enemy restores 50% HP the first time it would die
    if (this.enemy.hp <= 0 && !this.enemy.saveUsed && this.mechanic === 'savestate') {
      const restore = Math.ceil(this.enemy.maxHp * 0.5);
      this.enemy.hp = restore; this.enemy.saveUsed = true;
      this.log(`> 💾 SAVE STATE LOADED! Enemy restored to ${restore} HP`);
      this._reEnemy();
    }

    if (this.enemy.hp <= 0) { this.time.delayedCall(500, () => this._end(true)); return; }
    if (this.agents.every(a => a.hp <= 0)) { this.time.delayedCall(500, () => this._end(false)); return; }

    this.time.delayedCall(350, () => this._next());
  }

  // ── Enemy turn ──────────────────────────────────────────
  _enemyTurn() {
    this.state = STATE.ENEMY;
    this.turnLbl.setText('── ENEMY TURN ──').setColor('#441111');

    const finish = () => {
      this._reAll();
      if (this.agents.every(a => a.hp <= 0)) { this._end(false); return; }
      this.round++;
      const enRegen = this.mechanic === 'battery' ? 2 : 5;
      this.agents.forEach(a => { if (a.hp > 0) a.en = Math.min(a.maxEn, a.en + enRegen); });
      // Shield slowly recharges between rounds (10% of max, rounded up)
      this.agents.forEach(a => {
        if (a.hp > 0 && a.maxSh > 0) {
          const regen = Math.max(1, Math.ceil(a.maxSh * 0.1));
          a.sh = Math.min(a.maxSh, (a.sh || 0) + regen);
        }
      });
      if (this.mechanic === 'heat') {
        this.heatStacks++;
        this.log(`> 🔥 HEAT ${this.heatStacks}: enemy +${this.heatStacks * 2} dmg`);
      }
      if (this.mechanic === 'overflow') {
        this.overflowRound++;
        this.log(`> ⚡ OVERFLOW Lv${this.overflowRound}: enemy +${this.overflowRound * 3} base dmg`);
      }
      if (this.mechanic === 'packetloss') {
        const plAlive = this.agents.filter(a => a.hp > 0);
        if (plAlive.length) {
          const plTgt = plAlive[Math.floor(Math.random() * plAlive.length)];
          const drain = rnd(8, 12); plTgt.en = Math.max(0, plTgt.en - drain);
          this.log(`> 📡 PACKET LOSS: ${plTgt.name} −${drain} EN`);
        }
      }
      if (this.mechanic === 'vital') {
        const heal = 15;
        this.enemy.hp = Math.min(this.enemy.maxHp, this.enemy.hp + heal);
        this.log(`> 💉 VITAL REGEN: enemy +${heal} HP`); this._reEnemy();
      }
      if (this.mechanic === 'upload' && this.round % 2 === 0) {
        this.enemy.stacks = Math.min(5, this.enemy.stacks + 1);
        this.log(`> ☁️  UPLOAD: signal stack ${this.enemy.stacks}`); this._reEnemy();
      }
      this.acted = new Set();
      this.activeIdx = 0;
      while (this.agents[this.activeIdx].hp <= 0) this.activeIdx = (this.activeIdx + 1) % this.agents.length;
      this.log(`── Round ${this.round} ──`);
      this.time.delayedCall(300, () => this._startTurn());
    };

    const alive = this.agents.map((a, i) => ({ a, i })).filter(({ a }) => a.hp > 0);
    const pick = () => alive[Math.floor(Math.random() * alive.length)].a;
    const dmgHit = (tgt, raw) => {
      let d = raw;
      if (tgt.defending) d = Math.ceil(d * 0.5);
      else if (tgt.fortified) d = Math.ceil(d * 0.4);
      if (tgt.shielded) { tgt.shielded = false; d = Math.ceil(d * 0.2); }
      return d;
    };
    const tag = (tgt) => tgt.defending ? ' [BLOCK]' : tgt.fortified ? ' [FORT]' : tgt.shielded ? ' [SHIELD]' : '';
    const type = this.channel.type;
    const heat = this.mechanic === 'heat' ? (this.heatStacks || 0) * 2 : 0;
    const ovfl = this.mechanic === 'overflow' ? this.overflowRound * 3 : 0;
    const roll = Math.random();

    const applyHit = (tgt, dmg) => {
      let remaining = dmg;
      if (tgt.sh > 0 && remaining > 0) {
        const absorbed = Math.min(tgt.sh, remaining);
        tgt.sh -= absorbed;
        remaining -= absorbed;
      }
      tgt.hp = Math.max(0, tgt.hp - remaining);
      if (tgt.subclass === 'archive') tgt.stored = (tgt.stored || 0) + Math.ceil(dmg * 0.5);
      if (this.mechanic === 'freeze' && Math.random() < 0.35 && !tgt.frozen) {
        tgt.frozen = true; this.log(`> ❄ ${tgt.name} FROZEN`);
      }
      // Armor hit-reaction particles
      const agIdx = this.agents.indexOf(tgt);
      if (agIdx !== -1 && tgt.armor) {
        if (tgt.armor === 'fortress_shell' || tgt.armor === 'signal_mesh') {
          this._armorBurst(agIdx, tgt.armor);
        }
      }
    };

    const doAttack = () => {
      this.tweens.add({ targets: this.blob, y: (this._blobBaseY || 0) + 20, duration: 120, yoyo: true, ease: 'Power2.easeOut' });
      const tgt = pick();
      let raw = rnd(5, 10) + heat + ovfl;
      if (this.enemy.vulnBonus) raw = Math.ceil(raw * (1 + this.enemy.vulnBonus / 100));
      if (this.enemy.charged) { raw = Math.ceil(raw * 2.5); this.enemy.charged = false; this.log(`> ⚡ CHARGED STRIKE!`); }
      if (tgt.rerouting) {
        tgt.rerouting = false;
        this.enemy.hp = Math.max(0, this.enemy.hp - raw);
        this.log(`> ${tgt.name}: REROUTE! → enemy −${raw}`);
        this._flashE(); this.time.delayedCall(600, finish); return;
      }
      const reflectDmg = tgt.reflecting ? Math.ceil(raw * 0.6) : 0;
      if (tgt.reflecting) { tgt.reflecting = false; this.enemy.hp = Math.max(0, this.enemy.hp - reflectDmg); }
      const dmg = dmgHit(tgt, raw);
      applyHit(tgt, dmg);
      this.log(`> ${this.enemy.name} → ${tgt.name}${tag(tgt)} −${dmg}${reflectDmg ? ` [↩−${reflectDmg}]` : ''}`);
      if (this.mechanic === 'predict' && Math.random() < 0.35) {
        const tgt2 = pick(), dmg2 = dmgHit(tgt2, rnd(4, 8));
        applyHit(tgt2, dmg2);
        this.log(`> PREDICTED → ${tgt2.name} −${dmg2}`);
      }
      this._flashP(tgt); this.time.delayedCall(600, finish);
    };
    const doSummon = () => {
      const bonus = 45; this.enemy.hp += bonus; this.enemy.maxHp += bonus;
      this.log(`> BACKUP SUMMONED! Enemy +${bonus} HP`);
      this._reEnemy(); this.time.delayedCall(600, finish);
    };
    const doStatic = () => {
      this.enemy.stacks = Math.min(5, this.enemy.stacks + 1);
      this.log(`> STATIC BURST! Signal −${this.enemy.aura + this.enemy.stacks * 8}%`);
      this._reEnemy(); this.time.delayedCall(600, finish);
    };
    const doDouble = () => {
      const t1 = pick(), t2 = pick();
      const d1 = dmgHit(t1, rnd(3, 6) + ovfl), d2 = dmgHit(t2, rnd(3, 6) + ovfl);
      applyHit(t1, d1); applyHit(t2, d2);
      this.log(`> DOUBLE → ${t1.name} −${d1}, ${t2.name} −${d2}`);
      this._flashP(t1); this.time.delayedCall(600, finish);
    };
    const doDistributed = () => {
      const parts = alive.map(({ a }) => {
        const d = dmgHit(a, rnd(4, 8) + ovfl);
        applyHit(a, d); return `${a.name} −${d}`;
      });
      this.log(`> DISTRIBUTE → ${parts.join(', ')}`);
      this._flashP(); this.time.delayedCall(600, finish);  // multi-target: just flash
    };
    const doCharge = () => {
      this.enemy.charged = true;
      this.log(`> ⚡ ${this.enemy.name} CHARGING — next strike ×2.5`);
      getSoundMgr(this)?.play('charge');
      this._reAll(); this.time.delayedCall(600, finish);
    };
    const doLock = () => {
      const tgt = pick(); tgt.locked = true;
      this.log(`> SIGNAL LOCK! ${tgt.name} locked out next turn`);
      this._reAll(); this.time.delayedCall(600, finish);
    };

    const distrib = this.mechanic === 'distributed';
    const delayed = this.mechanic === 'delay';

    if (type === 'normal') {
      if (this.mechanic === 'summon' && roll < 0.22) doSummon();
      else if (distrib && roll < 0.55) doDistributed();
      else if (delayed && this.enemy.charged) doAttack();
      else if (delayed && roll < 0.40) doCharge();
      else if (roll < 0.50) doAttack();
      else if (roll < 0.78) doStatic();
      else doDouble();

    } else if (type === 'miniboss') {
      if (distrib && roll < 0.45) doDistributed();
      else if (delayed && this.enemy.charged) doAttack();
      else if (delayed && roll < 0.35) doCharge();
      else if (roll < 0.35) doAttack();
      else if (roll < 0.58) doStatic();
      else if (roll < 0.78) doDouble();
      else doLock();

    } else {
      const phase2 = this.enemy.hp < this.enemy.maxHp * 0.5;
      if (distrib && roll < (phase2 ? 0.50 : 0.35)) doDistributed();
      else if (delayed && this.enemy.charged) doAttack();
      else if (delayed && roll < (phase2 ? 0.50 : 0.35)) doCharge();
      else if (roll < (phase2 ? 0.20 : 0.30)) doAttack();
      else if (roll < (phase2 ? 0.40 : 0.55)) doStatic();
      else if (roll < (phase2 ? 0.60 : 0.75)) {
        this.phantomActive = true;
        this.log(`> PHANTOM PULSE! Illusions deployed`);
        this._reEnemy(); this.time.delayedCall(600, finish);
      } else if (phase2 && roll < 0.80) {
        const parts = alive.map(({ a }) => {
          const d = dmgHit(a, rnd(8, 14) + ovfl);
          applyHit(a, d); return `${a.name} −${d}`;
        });
        this.log(`> BROADCAST STORM → ${parts.join(', ')}`);
        this._flashP(); this.time.delayedCall(600, finish);
      } else doDouble();
    }
  }

  // ── Helpers ─────────────────────────────────────────────
  _btns(on) {
    this.btnZones.forEach(z => on ? z.setInteractive() : z.disableInteractive());
    this.btnCon.setAlpha(on ? 1 : 0.35);
  }

  _flashE() {
    this.tweens.add({ targets: this.blob, alpha: 0.2, duration: 80, yoyo: true, repeat: 2 });
    const ag = this.agents[this.activeIdx];
    if (ag) this._weaponBurst(ag);
    getSoundMgr(this)?.play('hit');
  }

  _flashP(tgt) {
    const tgtIdx = tgt ? this.agents.indexOf(tgt) : -1;
    const card   = tgtIdx >= 0 ? this.cards?.[tgtIdx] : null;
    const ex = W / 2, ey = 112;
    const tx = card ? card.cx + card.cw / 2 : W / 2;
    const ty = card ? card.cy + 45 : 500;

    const proj = this.add.graphics().setDepth(5);
    proj.fillStyle(0xff3355, 0.95); proj.fillCircle(0, 0, 6);
    proj.setPosition(ex, ey);

    this.tweens.add({
      targets: proj, x: tx, y: ty,
      duration: 200, ease: 'Linear',
      onComplete: () => {
        proj.destroy();
        this.cameras.main.flash(80, 255, 50, 50, false);
        this._burstAt(tx, ty, [0xff3355, 0xff8844, 0xffffff], 12, 'ptx_dot', 350);
        getSoundMgr(this)?.play('enemy_hit');
        if (card) {
          const sp = card.sp, baseX = card._baseSpX || 0;
          this.tweens.add({
            targets: sp, x: baseX + 7,
            duration: 45, yoyo: true, repeat: 3, ease: 'Linear',
            onComplete: () => { sp.x = baseX; },
          });
        }
      },
    });
  }

  // ── One-shot particle burst ────────────────────────────
  _burstAt(x, y, tints, count = 14, tex = 'ptx_dot', lifespan = 500) {
    const emitter = this.add.particles(x, y, tex, {
      speed: { min: 60, max: 200 },
      lifespan,
      alpha: { start: 1, end: 0 },
      scale: { start: 0.7, end: 0 },
      tint: Array.isArray(tints) ? tints : [tints],
      angle: { min: 0, max: 360 },
      frequency: -1,
    });
    emitter.explode(count);
    this.time.delayedCall(lifespan + 200, () => { try { emitter.destroy(); } catch (_) {} });
  }

  // Weapon-specific burst at enemy blob (W/2, 112)
  _weaponBurst(ag) {
    const weapon = ag.weapon || null;  // weapon id string or null
    const ex = W / 2, ey = 112;
    switch (weapon) {
      case 'bit_shard':
        this._burstAt(ex, ey, [0xffffff, 0xaaaaaa, 0x888888], 16, 'ptx_sq', 450);
        break;
      case 'signal_amp':
        this._burstAt(ex, ey, [0x00ffff, 0x44ffff, 0xaaffff], 14, 'ptx_dot', 600);
        break;
      case 'overcharge_core':
        this._burstAt(ex, ey, [0xff4400, 0xff8800, 0xffcc00], 22, 'ptx_dot', 550);
        this._burstAt(ex, ey, [0xffffff], 8, 'ptx_sq', 300);
        break;
      case 'precision_bit':
        // Tight cone of teal needle-like particles (bars), small count, faster
        this._burstAt(ex, ey, [0x00ffcc, 0x88ffee, 0xffffff], 10, 'ptx_bar', 400);
        break;
      default:
        // No weapon — plain white impact sparks
        this._burstAt(ex, ey, [0xffffff, 0xcccccc], 10, 'ptx_dot', 350);
    }
  }

  // Armor-specific burst at agent card position
  _armorBurst(agIdx, armorId) {
    const card = this.cards?.[agIdx];
    if (!card) return;
    const ax = card.cx + card.cw / 2, ay = card.cy + 45;
    switch (armorId) {
      case 'signal_mesh':
        this._burstAt(ax, ay, [0x00ffff, 0x4488ff, 0x88aaff], 12, 'ptx_dot', 500);
        break;
      case 'repair_plating':
        this._burstAt(ax, ay, [0x00ff88, 0x44ffaa, 0xaaffcc], 16, 'ptx_dot', 700);
        break;
      case 'fortress_shell':
        this._burstAt(ax, ay, [0xffdd44, 0xffbb00, 0xffffff], 18, 'ptx_sq', 600);
        break;
      case 'energy_cell':
        this._burstAt(ax, ay, [0xffff00, 0x00ff88, 0x88ffee], 12, 'ptx_dot', 450);
        break;
    }
  }

  _div(y) {
    const g = this.add.graphics();
    g.lineStyle(1, COLORS.dim, 0.3); g.lineBetween(20, y, W - 20, y);
  }

  log(msg) {
    this.logs.push(msg);
    const r = this.logs.slice(-3);
    this.logTxts.forEach((t, i) => t.setText(r[i] || ''));
  }

  // ── End screen ──────────────────────────────────────────
  _end(win) {
    this.state = win ? STATE.WIN : STATE.LOSE;
    this._btns(false);
    this.timerFill.clear();
    getMusicEng(this)?.stop();

    const save    = this.save;
    const ch      = this.channel;
    const wDef    = WORLDS.find(w => w.id === this.worldId) || WORLDS[0];
    const tier    = wDef.tier;

    if (win) {
      // Mark channel cleared
      if (!save.worlds[this.worldId]) save.worlds[this.worldId] = { cleared: [false,false,false,false,false] };
      save.worlds[this.worldId].cleared[this.channelIdx] = true;
      const worldJustCleared = save.worlds[this.worldId].cleared.every(c => c);
      // Unlock adjacent worlds if this world is now fully cleared
      if (worldJustCleared) {
        const unlocks = WORLD_UNLOCKS[this.worldId] || [];
        unlocks.forEach(uid => {
          if (!save.unlockedWorlds.includes(uid)) save.unlockedWorlds.push(uid);
          if (!save.worlds[uid]) save.worlds[uid] = { cleared: [false,false,false,false,false] };
        });
      }

      // Award cycles + shards
      const aliveCount = this.agents.filter(a => a.hp > 0).length;
      const rewards = calcRewards(ch.type, tier, aliveCount);
      save.cycles += rewards.cycles;
      const shardsEarned = awardShards(save, ch.type, save.upgrades?.ng_plus ? 2 : 1);

      // Redundancy upgrade: dead agents regain 5 HP
      if (save.upgrades?.redundancy) {
        this.agents.forEach(ag => {
          if (ag.hp <= 0) { const sa = save.agents.find(a => a.id === ag.id); if (sa) sa.hp = Math.min(5, statsForLevel(ag.id, ag.level).maxHp); }
        });
      }

      // Award XP + level ups per agent
      const levelUps = [];
      this.agents.forEach(ag => {
        const savedAg = save.agents.find(a => a.id === ag.id);
        if (!savedAg || !savedAg.owned) return;
        const result = awardXp(savedAg, rewards.xp);
        if (result.leveledUp) levelUps.push({ name: ag.name, from: result.oldLevel, to: result.newLevel });
        // Save current HP (carry damage), then apply armor recovery
        savedAg.hp = ag.hp;
        if (ag.hp > 0 && ag.recovery) {
          savedAg.hp = Math.min(ag.maxHp, savedAg.hp + ag.recovery);
          const agIdx = this.agents.indexOf(ag);
          if (agIdx !== -1) this._armorBurst(agIdx, 'repair_plating');
        }
      });

      // Level-up flash + sound
      if (levelUps.length > 0) {
        levelUps.forEach(lu => this.log(`⬆ ${lu.name} → Lv ${lu.to}!`));
        this.cameras.main.flash(300, 255, 220, 50, false);
        getSoundMgr(this)?.play('levelup');
      }

      // Check achievements
      const newAchs = this._checkAchievements(save, ch, aliveCount, levelUps, worldJustCleared);

      // Collect agents that just hit level 5 and have no subclass yet
      const pendingSubclasses = this.agents
        .map(ag => save.agents.find(a => a.id === ag.id))
        .filter(sa => sa && sa.owned && sa.level >= 5 && !sa.subclass)
        .map(sa => ({ id: sa.id, name: DEFS.find(d => d.id === sa.id)?.name || sa.id, color: DEFS.find(d => d.id === sa.id)?.color || 0xffffff }));

      writeSave(save);
      this._showWinScreen(rewards, shardsEarned, levelUps, newAchs, pendingSubclasses, worldJustCleared);
    } else {
      const cost = reviveCost(tier);
      this._showLoseScreen(cost, save);
    }
  }

  _showWinScreen(rewards, shardsEarned, levelUps, newAchs, pendingSubclasses = [], worldJustCleared = false) {
    getSoundMgr(this)?.play('win');
    const ch = this.channel;
    const ov = this.add.graphics();
    ov.fillStyle(0x000000, 0.88); ov.fillRect(0, 0, W, H);

    const titleText = this.worldId === 'cloud' ? 'SINGULARITY DENIED' : worldJustCleared ? 'WORLD CLEARED!' : 'SYSTEM RESTORED';
    const titleCol  = this.worldId === 'cloud' ? '#ffcc00' : worldJustCleared ? '#44aaff' : '#00ff88';
    this.add.text(W/2, 60,  '✅', { fontSize: '44px' }).setOrigin(0.5);
    this.add.text(W/2, 114, titleText, { fontFamily:'monospace', fontSize:'20px', color:titleCol, fontStyle:'bold' }).setOrigin(0.5);
    this.add.text(W/2, 140, `${ch.label} · ${ch.name}`, { fontFamily:'monospace', fontSize:'12px', color:'#444466' }).setOrigin(0.5);

    this.add.text(W/2, 172, `+${rewards.cycles} ⚙  CYCLES`, { fontFamily:'monospace', fontSize:'16px', color:'#ffcc00' }).setOrigin(0.5);
    this.add.text(W/2, 194, `+${rewards.xp} XP  per agent`, { fontFamily:'monospace', fontSize:'13px', color:'#8888bb' }).setOrigin(0.5);
    if (shardsEarned > 0) {
      this.add.text(W/2, 216, `+${shardsEarned} ◆  SHARDS`, { fontFamily:'monospace', fontSize:'14px', color:'#ffcc00' }).setOrigin(0.5);
    }

    let y = shardsEarned > 0 ? 244 : 224;
    if (levelUps.length > 0) {
      this.add.text(W/2, y, '── LEVEL UP ──', { fontFamily:'monospace', fontSize:'11px', color:'#333355' }).setOrigin(0.5); y += 22;
      levelUps.forEach(lu => { this.add.text(W/2, y, `${lu.name}  Lv${lu.from} → Lv${lu.to}`, { fontFamily:'monospace', fontSize:'14px', color:'#00ff88' }).setOrigin(0.5); y += 24; });
    }
    if (newAchs.length > 0) {
      getSoundMgr(this)?.play('unlock');
      this.add.text(W/2, y, '── ACHIEVEMENT ──', { fontFamily:'monospace', fontSize:'11px', color:'#333355' }).setOrigin(0.5); y += 22;
      newAchs.forEach(ach => { this.add.text(W/2, y, ach.name, { fontFamily:'monospace', fontSize:'13px', color:'#'+ach.color.toString(16).padStart(6,'0'), fontStyle:'bold' }).setOrigin(0.5); y += 22; });
    }

    // Buttons
    y = Math.max(y + 16, 680);
    const btn = (label, col, by, cb) => {
      const g = this.add.graphics();
      g.fillStyle(col, 0.12); g.fillRoundedRect(W/2-110, by, 220, 48, 10);
      g.lineStyle(1, col, 0.5); g.strokeRoundedRect(W/2-110, by, 220, 48, 10);
      this.add.text(W/2, by+24, label, { fontFamily:'monospace', fontSize:'15px', color:'#'+col.toString(16).padStart(6,'0') }).setOrigin(0.5);
      this.add.zone(W/2-110, by, 220, 48).setOrigin(0).setInteractive().on('pointerdown', cb);
    };
    const channels = WORLD_CHANNELS[this.worldId] || WORLD_CHANNELS.tv;
    const nextIdx  = Math.min(this.channelIdx + 1, channels.length - 1);
    const cutId    = ch.type === 'boss' ? CUTSCENE_TRIGGERS[this.worldId] : null;
    const save     = this.save;
    const goMap    = () => {
      if (cutId && !save.seenCutscenes.includes(cutId)) {
        const rd = pendingSubclasses.length > 0 ? { pending: pendingSubclasses, currentIdx: 0 } : {};
        this.scene.start('Cutscene', { id: cutId, returnTo: pendingSubclasses.length > 0 ? 'SubclassChoice' : 'OverworldMap', returnData: rd });
      } else if (pendingSubclasses.length > 0) {
        this.scene.start('SubclassChoice', { pending: pendingSubclasses, currentIdx: 0 });
      } else {
        this.scene.start('OverworldMap');
      }
    };
    if (this.channelIdx < channels.length - 1) {
      btn('NEXT CHANNEL', 0x00ff88, y, () => this.scene.start('Battle', { channel: channels[nextIdx], channelIdx: nextIdx, worldId: this.worldId }));
      btn('← MAP', 0x444466, y + 58, goMap);
    } else {
      btn('← WORLD MAP', 0x00ff88, y, goMap);
    }
  }

  _checkAchievements(save, ch, aliveCount, levelUps, worldJustCleared) {
    if (!save.achievements) save.achievements = {};
    const newAchs = [];
    const unlock = id => {
      if (!save.achievements[id]) { save.achievements[id] = true; const a = ACHIEVEMENTS.find(x => x.id === id); if (a) newAchs.push(a); }
    };
    unlock('first_breach');
    if (this.agents.length > 0 && aliveCount === this.agents.length) unlock('clean_sweep');
    if (this.agents.some(a => a.hp > 0 && a.hp < 5)) unlock('on_the_wire');
    if (this.worldId === 'cloud' && ch.type === 'boss') {
      unlock('singularity');
      if (aliveCount === 1) unlock('ghost_protocol');
    }
    if (worldJustCleared) unlock('archivist');
    levelUps.forEach(lu => {
      if (lu.to >= 5)  unlock('veteran');
      if (lu.to >= 10) unlock('battle_hardened');
    });
    // Act clears
    const actWorldIds = {
      signal_lost:     ['tv','phone','speaker','watch','console'],
      deep_network:    ['fridge','micro','printer','hub','seccam'],
      system_critical: ['router','computer','car','atm','grid'],
    };
    Object.entries(actWorldIds).forEach(([achId, wids]) => {
      if (wids.every(id => save.worlds[id]?.cleared?.every(c=>c))) unlock(achId);
    });
    if (WORLDS.every(w => save.worlds[w.id]?.cleared?.every(c=>c))) unlock('completionist');
    if (save.agents.filter(a => a.owned).length >= 7) unlock('full_roster');
    const gearCount = save.agents.filter(a => { const eq = save.gear?.equipped?.[a.id]; return eq?.weapon || eq?.armor; }).length;
    if (gearCount >= 4) unlock('fully_armed');
    if (save.agents.some(a => a.subclass)) unlock('subclass');
    if (save.cycles <= 0) unlock('bankrupt');
    return newAchs;
  }

  _showLoseScreen(cost, save) {
    getSoundMgr(this)?.play('lose');
    const ov = this.add.graphics();
    ov.fillStyle(0x000000, 0.88); ov.fillRect(0, 0, W, H);

    this.add.text(W/2, 100, '💀',               { fontSize: '52px' }).setOrigin(0.5);
    this.add.text(W/2, 168, 'INTEGRITY FAILURE', { fontFamily:'monospace', fontSize:'22px', color:'#ff3355', fontStyle:'bold' }).setOrigin(0.5);
    this.add.text(W/2, 200, 'Squad offline.\nBreach uncontained.', { fontFamily:'monospace', fontSize:'15px', color:'#aaaacc', align:'center' }).setOrigin(0.5);

    const canAfford = save.cycles >= cost;
    this.add.text(W/2, 280, `Revive cost: ${cost} ⚙`, { fontFamily:'monospace', fontSize:'16px', color: canAfford ? '#ffcc00' : '#ff3355' }).setOrigin(0.5);
    this.add.text(W/2, 308, `Your cycles: ${save.cycles} ⚙`, { fontFamily:'monospace', fontSize:'14px', color:'#888888' }).setOrigin(0.5);

    if (canAfford) {
      const g = this.add.graphics();
      g.fillStyle(0xffcc00, 0.12); g.fillRoundedRect(W/2-110, 360, 220, 52, 10);
      g.lineStyle(1, 0xffcc00, 0.5); g.strokeRoundedRect(W/2-110, 360, 220, 52, 10);
      this.add.text(W/2, 386, `REVIVE  −${cost} ⚙`, { fontFamily:'monospace', fontSize:'16px', color:'#ffcc00' }).setOrigin(0.5);
      this.add.zone(W/2-110, 360, 220, 52).setOrigin(0).setInteractive().on('pointerdown', () => {
        save.cycles -= cost;
        save.agents.forEach(ag => {
          if (!ag.owned) return;
          const stats = effectiveStats(ag.id, ag.level, save);
          ag.hp = stats.maxHp;
        });
        writeSave(save);
        this.scene.restart();
      });
    }

    const g2 = this.add.graphics();
    g2.fillStyle(0xff3355, 0.12); g2.fillRoundedRect(W/2-110, 428, 220, 52, 10);
    g2.lineStyle(1, 0xff3355, 0.5); g2.strokeRoundedRect(W/2-110, 428, 220, 52, 10);
    this.add.text(W/2, 454, '← MAP', { fontFamily:'monospace', fontSize:'16px', color:'#ff3355' }).setOrigin(0.5);
    this.add.zone(W/2-110, 428, 220, 52).setOrigin(0).setInteractive().on('pointerdown', () => this.scene.start('OverworldMap'));
  }

  // ── Agent stat panel (tap card to open) ────────────────
  _showStats(i) {
    if (this.statPanel) return;
    const ag = this.agents[i];
    const hex = '#' + ag.color.toString(16).padStart(6, '0');
    const px = 24, py = 180, pw = W - 48, ph = 460;

    const panel = this.add.container(0, 0).setDepth(10);
    this.statPanel = panel;

    const ov = this.add.graphics().setDepth(9);
    ov.fillStyle(0x000000, 0.7); ov.fillRect(0, 0, W, H);
    ov.setInteractive(new Phaser.Geom.Rectangle(0, 0, W, H), Phaser.Geom.Rectangle.Contains);
    ov.on('pointerdown', () => this._closeStats(ov));

    const bg = this.add.graphics();
    bg.fillStyle(0x080818, 1); bg.fillRoundedRect(px, py, pw, ph, 10);
    bg.lineStyle(2, ag.color, 0.7); bg.strokeRoundedRect(px, py, pw, ph, 10);
    panel.add(bg);

    // large sprite
    const sp = this.add.graphics();
    this._sprite(sp, ag.id, px + pw / 2 - 22, py + 12);
    panel.add(sp);

    panel.add(this.add.text(px + pw / 2, py + 90, ag.name, { fontFamily: 'monospace', fontSize: '20px', color: hex, fontStyle: 'bold' }).setOrigin(0.5, 0));
    panel.add(this.add.text(px + pw / 2, py + 114, ag.cls + (ag.faction ? `  ·  ${ag.faction.split(' / ')[1] || ''}` : ''), { fontFamily: 'monospace', fontSize: '12px', color: '#555577' }).setOrigin(0.5, 0));
    if (ag.decal) panel.add(this.add.text(px + pw - 12, py + 12, ag.decal, { fontFamily: 'monospace', fontSize: '11px', color: '#555577', fontStyle: 'bold' }).setOrigin(1, 0));

    const statRows = [
      { label: 'INTEGRITY', val: `${ag.hp} / ${ag.maxHp}`, ratio: ag.hp / ag.maxHp, color: ag.color },
      { label: 'ENERGY',    val: `${ag.en} / ${ag.maxEn}`, ratio: ag.en / ag.maxEn, color: COLORS.blue },
      { label: 'SHIELD',    val: ag.maxSh > 0 ? `${ag.sh} / ${ag.maxSh}` : '— / —', ratio: ag.maxSh > 0 ? (ag.sh || 0) / ag.maxSh : 0, color: 0x66c8ff },
      { label: 'SIGNAL',    val: `${ag.signal}%`,           ratio: ag.signal / 100,   color: COLORS.yellow },
      { label: 'AUTONOMY',  val: `${ag.autonomy}`,          ratio: ag.autonomy / 100, color: COLORS.green },
    ];
    const bx = px + 16, bw = pw - 32;
    statRows.forEach((row, ri) => {
      const ry = py + 138 + ri * 36;
      panel.add(this.add.text(bx, ry, row.label, { fontFamily: 'monospace', fontSize: '11px', color: '#555577' }));
      panel.add(this.add.text(bx + bw, ry, row.val, { fontFamily: 'monospace', fontSize: '11px', color: hex }).setOrigin(1, 0));
      const rbg = this.add.graphics();
      rbg.fillStyle(0x111122, 1); rbg.fillRect(bx, ry + 14, bw, 10);
      rbg.lineStyle(1, COLORS.dim, 0.3); rbg.strokeRect(bx, ry + 14, bw, 10);
      const rfill = this.add.graphics();
      rfill.fillStyle(row.color, 0.8); rfill.fillRect(bx + 1, ry + 15, (bw - 2) * Math.min(1, row.ratio), 8);
      panel.add(rbg); panel.add(rfill);
    });

    // bio / lore — wraps inside panel width
    if (ag.bio) {
      const by0 = py + 138 + statRows.length * 36 + 4;
      panel.add(this.add.text(bx, by0, 'BIO', { fontFamily: 'monospace', fontSize: '11px', color: '#555577' }));
      panel.add(this.add.text(bx, by0 + 14, ag.bio, {
        fontFamily: 'monospace', fontSize: '10px', color: '#aaaacc',
        wordWrap: { width: bw }, lineSpacing: 2,
      }));
    }

    // abilities
    panel.add(this.add.text(bx, py + 358, 'ABILITIES', { fontFamily: 'monospace', fontSize: '12px', color: '#555577' }));
    ag.moves.forEach((mv, mi) => {
      const mvhex = '#' + mv.color.toString(16).padStart(6, '0');
      const my = py + 376 + mi * 36;
      const mbg = this.add.graphics();
      mbg.fillStyle(mv.color, 0.12); mbg.fillRoundedRect(bx, my, bw, 30, 4);
      mbg.lineStyle(1, mv.color, 0.4); mbg.strokeRoundedRect(bx, my, bw, 30, 4);
      panel.add(mbg);
      panel.add(this.add.text(bx + 8, my + 8, mv.label, { fontFamily: 'monospace', fontSize: '13px', color: mvhex, fontStyle: 'bold' }));
      panel.add(this.add.text(bx + bw - 8, my + 8, mv.sub, { fontFamily: 'monospace', fontSize: '11px', color: '#555577' }).setOrigin(1, 0));
      if (mv.cost > 0) panel.add(this.add.text(bx + 8, my + 20, `${mv.cost}⚡`, { fontFamily: 'monospace', fontSize: '10px', color: '#44aaff' }));
    });

    panel.add(this.add.text(px + pw / 2, py + ph - 18, 'TAP ANYWHERE TO CLOSE', { fontFamily: 'monospace', fontSize: '11px', color: '#333355' }).setOrigin(0.5, 0));
    this._closeFn = () => this._closeStats(ov);
  }

  _showItems() {
    const available = ITEMS_CATALOG.filter(it => (this.save.items?.[it.id] || 0) > 0);
    if (!available.length) {
      this.log('> No items — buy from Shop'); return;
    }
    const ov = this.add.graphics().setDepth(15);
    ov.fillStyle(0x000000, 0.88); ov.fillRect(0, 0, W, H);
    const panel = this.add.container(0, 0).setDepth(16);
    panel.add(this.add.text(W/2, H/2 - 160, 'USE ITEM', { fontFamily:'monospace', fontSize:'22px', color:'#00ff88', fontStyle:'bold' }).setOrigin(0.5));

    const startY = H/2 - 120;
    available.forEach((it, i) => {
      const py  = startY + i * 74;
      const qty = this.save.items[it.id];
      const bg  = this.add.graphics();
      bg.fillStyle(0x080820, 1); bg.fillRoundedRect(W/2-145, py, 290, 64, 8);
      bg.lineStyle(1, 0x00ff88, 0.5); bg.strokeRoundedRect(W/2-145, py, 290, 64, 8);
      panel.add(bg);
      panel.add(this.add.text(W/2-130, py+12, `${it.icon} ${it.name}`, { fontFamily:'monospace', fontSize:'15px', color:'#ffffff', fontStyle:'bold' }));
      panel.add(this.add.text(W/2-130, py+34, it.desc, { fontFamily:'monospace', fontSize:'11px', color:'#555577' }));
      panel.add(this.add.text(W/2+128, py+12, `×${qty}`, { fontFamily:'monospace', fontSize:'16px', color:'#00ff88' }).setOrigin(1,0));
      const z = this.add.zone(W/2-145, py, 290, 64).setOrigin(0).setInteractive();
      z.on('pointerdown', () => {
        panel.destroy(); ov.destroy();
        this.state = STATE.PLAYER;
        this.act('use_' + it.id);
      });
      panel.add(z);
    });

    const cancelY = startY + available.length * 74 + 10;
    const cbg = this.add.graphics();
    cbg.fillStyle(0x220011, 1); cbg.fillRoundedRect(W/2-110, cancelY, 220, 44, 8);
    cbg.lineStyle(1, 0xff3355, 0.5); cbg.strokeRoundedRect(W/2-110, cancelY, 220, 44, 8);
    panel.add(cbg);
    panel.add(this.add.text(W/2, cancelY+22, 'CANCEL', { fontFamily:'monospace', fontSize:'15px', color:'#ff3355' }).setOrigin(0.5));
    const cz = this.add.zone(W/2-110, cancelY, 220, 44).setOrigin(0).setInteractive();
    cz.on('pointerdown', () => { panel.destroy(); ov.destroy(); });
    panel.add(cz);
  }

  _closeStats(ov) {
    if (this.statPanel) { this.statPanel.destroy(); this.statPanel = null; }
    ov.destroy();
  }

  // ── Sprite drawing ──────────────────────────────────────
  _sprite(g, id, ox, oy) {
    _drawSprite(g, id, ox, oy);
    const ag = this.agents?.find(a => a.id === id);
    if (ag?.subclass) {
      const sc = Object.values(SUBCLASSES).flat().find(s => s.id === ag.subclass);
      if (sc) { g.fillStyle(sc.color, 0.22); g.fillRect(ox, oy, 44, 66); }
    }
  }

  // Returns an Image (if texture loaded) or Graphics (pixel art fallback)
  _makeSpriteNode(ag, x, y) {
    const key = `ag_${ag.id}`;
    if (this.textures.exists(key)) {
      const img = this.add.image(x + 22, y + 33, key).setOrigin(0.5);
      if (ag.subclass) {
        const sc = Object.values(SUBCLASSES).flat().find(s => s.id === ag.subclass);
        if (sc) img.setTint(sc.color);
      }
      return img;
    }
    const g = this.add.graphics();
    _drawSprite(g, ag.id, x, y);
    if (ag.subclass) {
      const sc = Object.values(SUBCLASSES).flat().find(s => s.id === ag.subclass);
      if (sc) { g.fillStyle(sc.color, 0.22); g.fillRect(x, y, 44, 66); }
    }
    return g;
  }
}

new Phaser.Game({
  type: Phaser.AUTO, width: W, height: H,
  backgroundColor: '#050510', scene: [TitleScreen, OverworldMap, Cutscene, Achievements, Upgrades, SquadSelect, SubclassChoice, ChannelSelect, Shop, Battle],
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  input: { activePointers: 2 },
});
