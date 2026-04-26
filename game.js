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
    id: 'threadling', name: 'THREADLING', cls: 'COMPUTE', color: 0x00ff88,
    maxHp: 100, maxEn: 50, signal: 85, autonomy: 10,
    moves: [
      { id: 'attack',    label: 'ATTACK',    sub: '~15 dmg',           color: 0xff3355, cost: 0  },
      { id: 'overclock', label: 'OVERCLOCK', sub: '~33 dmg -10 self',  color: 0xff8800, cost: 20 },
    ],
  },
  {
    id: 'patchwork', name: 'PATCHWORK', cls: 'MEMORY', color: 0xaa44ff,
    maxHp: 80, maxEn: 60, signal: 75, autonomy: 25,
    moves: [
      { id: 'patch',  label: 'PATCH',  sub: 'Heal ally ~25 HP',   color: 0xaa44ff, cost: 15 },
      { id: 'replay', label: 'REPLAY', sub: 'Repeat last at 50%', color: 0x7722bb, cost: 15 },
    ],
  },
  {
    id: 'vault', name: 'VAULT', cls: 'STORAGE', color: 0xffcc00,
    maxHp: 140, maxEn: 40, signal: 70, autonomy: 8,
    moves: [
      { id: 'bash',    label: 'BASH',    sub: '+15 signal bonus',  color: 0xffcc00, cost: 0 },
      { id: 'fortify', label: 'FORTIFY', sub: '-60% dmg next hit', color: 0x886600, cost: 0 },
    ],
  },
  {
    id: 'netrunner', name: 'NETRUNNER', cls: 'NETWORK', color: 0x00ccff,
    maxHp: 75, maxEn: 70, signal: 92, autonomy: 35,
    moves: [
      { id: 'packet',    label: 'PACKET',    sub: '~12 dmg high accuracy', color: 0x00ccff, cost: 0  },
      { id: 'intercept', label: 'INTERCEPT', sub: 'Block + counter ~10',   color: 0x0088cc, cost: 10 },
    ],
  },
  {
    id: 'sentinel', name: 'SENTINEL', cls: 'SECURITY', color: 0xff4466,
    maxHp: 95, maxEn: 55, signal: 80, autonomy: 15,
    moves: [
      { id: 'scan',     label: 'SCAN',     sub: 'Enemy −15 aura',       color: 0xff4466, cost: 10 },
      { id: 'firewall', label: 'FIREWALL', sub: 'Shield weakest ally',   color: 0xcc2244, cost: 15 },
    ],
  },
  {
    id: 'glitcher', name: 'GLITCHER', cls: 'GLITCH', color: 0xff44ff,
    maxHp: 70, maxEn: 80, signal: 65, autonomy: 40,
    moves: [
      { id: 'corrupt', label: 'CORRUPT', sub: '65% enemy / 35% ally',  color: 0xff44ff, cost: 0  },
      { id: 'exploit', label: 'EXPLOIT', sub: 'Crit if enemy <50% HP', color: 0xcc22cc, cost: 20 },
    ],
  },
  {
    id: 'bridgelink', name: 'BRIDGELINK', cls: 'INTERFACE', color: 0xffaa00,
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

// ── World state helper ─────────────────────────────────────
function worldState(worldId, save) {
  if (!save.unlockedWorlds || !save.unlockedWorlds.includes(worldId)) return 'locked';
  const ws = save.worlds && save.worlds[worldId];
  if (!ws || !ws.cleared) return 'available';
  return ws.cleared.every(c => c) ? 'cleared' : 'available';
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
    this._bg();
    this._header();
    this._edges();
    this._nodes();
    this._footer();
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
    this.add.text(W / 2, 14, 'SYSTEM BREACH', { fontFamily: 'monospace', fontSize: '18px', color: '#00ff88', letterSpacing: 4 }).setOrigin(0.5, 0);
    this.add.text(W / 2, 38, '⚙ ' + this.save.cycles + '  CYCLES', { fontFamily: 'monospace', fontSize: '13px', color: '#ffcc00' }).setOrigin(0.5, 0);
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
    g.fillStyle(0x050510, 0.95); g.fillRect(0, H - 42, W, 42);
    g.lineStyle(1, 0x1a1a3a, 0.5); g.lineBetween(0, H - 42, W, H - 42);
    const acts = [
      { l: 'ACT 1', c: '#00ff88' }, { l: 'ACT 2', c: '#ff8800' },
      { l: 'ACT 3', c: '#ff3355' }, { l: 'ACT 4', c: '#ffcc00' },
    ];
    acts.forEach((a, i) => {
      const x = 12 + i * 96;
      const dot = this.add.graphics();
      dot.fillStyle(parseInt(a.c.replace('#', ''), 16), 0.6);
      dot.fillCircle(x + 5, H - 21, 4);
      this.add.text(x + 14, H - 21, a.l, { fontFamily: 'monospace', fontSize: '10px', color: a.c }).setOrigin(0, 0.5);
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
    const tabs = ['agents', 'weapons', 'armor'];
    const labels = ['AGENTS', 'WEAPONS', 'ARMOR'];
    this.tabBgs = {};
    tabs.forEach((t, i) => {
      const tx = 10 + i * ((W - 20) / 3), tw = (W - 20) / 3 - 4;
      const bg = this.add.graphics();
      this.tabBgs[t] = bg;
      this._drawTab(bg, tx, 76, tw, t);
      this.add.text(tx + tw / 2, 90, labels[i], { fontFamily: 'monospace', fontSize: '13px', color: '#aaaacc' }).setOrigin(0.5);
      this.add.zone(tx, 76, tw, 30).setOrigin(0).setInteractive().on('pointerdown', () => {
        this.tab = t;
        tabs.forEach(tt => this._drawTab(this.tabBgs[tt], 10 + tabs.indexOf(tt) * ((W-20)/3), 76, (W-20)/3-4, tt));
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
    if (this.content) { this.content.destroy(true); this.content = null; }
    this.content = this.add.group();
    if (this.tab === 'agents')  this._renderAgents();
    if (this.tab === 'weapons') this._renderGear(WEAPONS, 'weapon');
    if (this.tab === 'armor')   this._renderGear(ARMORS,  'armor');
  }

  _renderAgents() {
    const startY = 116;
    DEFS.forEach((def, i) => {
      const saved = this.save.agents.find(a => a.id === def.id);
      const owned = saved.owned;
      const cost  = AGENT_COSTS[def.id];
      const hex   = '#' + def.color.toString(16).padStart(6, '0');
      const cy    = startY + i * 188;
      const col   = owned ? def.color : 0x333344;

      const bg = this.add.graphics();
      bg.fillStyle(col, 0.08); bg.fillRoundedRect(16, cy, W - 32, 176, 8);
      bg.lineStyle(1, col, owned ? 0.5 : 0.2); bg.strokeRoundedRect(16, cy, W - 32, 176, 8);
      this.content.add(bg);

      // sprite
      const sp = this.add.graphics();
      this._sprite(sp, def.id, 30, cy + 10);
      this.content.add(sp);

      // name + class + level
      const level = saved.level;
      this.content.add(this.add.text(108, cy + 14, def.name, { fontFamily: 'monospace', fontSize: '18px', color: owned ? hex : '#333355', fontStyle: 'bold' }));
      this.content.add(this.add.text(108, cy + 36, def.cls, { fontFamily: 'monospace', fontSize: '12px', color: '#444466' }));
      this.content.add(this.add.text(108, cy + 54, owned ? `Lv ${level}  ·  ${saved.xp} XP` : `Cost: ${cost} ⚙`, { fontFamily: 'monospace', fontSize: '13px', color: owned ? '#888899' : '#ffcc00' }));

      const eq = this.save.gear.equipped[def.id];
      const wName = eq.weapon ? WEAPONS.find(w => w.id === eq.weapon)?.name : 'none';
      const aName = eq.armor  ? ARMORS.find(a => a.id === eq.armor)?.name  : 'none';
      if (owned) {
        this.content.add(this.add.text(108, cy + 74, `⚔ ${wName}`, { fontFamily: 'monospace', fontSize: '11px', color: '#556655' }));
        this.content.add(this.add.text(108, cy + 90, `🛡 ${aName}`, { fontFamily: 'monospace', fontSize: '11px', color: '#556655' }));
      }

      if (!owned) {
        this._btn(W / 2, cy + 136, 'BUY  ' + cost + ' ⚙', 0xffcc00, () => {
          if (this.save.cycles < cost) return;
          this.save.cycles -= cost;
          saved.owned = true; saved.active = true;
          const stats = statsForLevel(def.id, saved.level);
          saved.hp = stats.maxHp;
          writeSave(this.save);
          this._refreshCycles(); this._renderTab();
        });
      } else {
        const activeCount = this.save.agents.filter(a => a.owned && a.active).length;
        const isActive = saved.active;
        this._btn(W / 2 - 66, cy + 136, isActive ? 'ACTIVE ✓' : 'SET ACTIVE', isActive ? 0x00ff88 : 0x444466, () => {
          if (isActive && activeCount <= 1) return;
          if (!isActive && activeCount >= 3) return;
          saved.active = !saved.active;
          writeSave(this.save); this._renderTab();
        });
        this._btn(W / 2 + 66, cy + 136, 'HEAL  10⚙', 0x44aaff, () => {
          const stats = effectiveStats(def.id, saved.level, this.save);
          if (saved.hp >= stats.maxHp || this.save.cycles < 10) return;
          this.save.cycles -= 10;
          saved.hp = Math.min(stats.maxHp, saved.hp + 30);
          writeSave(this.save); this._refreshCycles(); this._renderTab();
        });
      }
    });
  }

  _renderGear(catalog, type) {
    const owned  = type === 'weapon' ? this.save.gear.ownedWeapons : this.save.gear.ownedArmors;
    const startY = 116;
    catalog.forEach((item, i) => {
      const isOwned = owned.includes(item.id);
      const cy = startY + i * 156;
      const col = isOwned ? 0x00ff88 : 0x333344;

      const bg = this.add.graphics();
      bg.fillStyle(col, 0.07); bg.fillRoundedRect(16, cy, W - 32, 144, 8);
      bg.lineStyle(1, col, isOwned ? 0.4 : 0.2); bg.strokeRoundedRect(16, cy, W - 32, 144, 8);
      this.content.add(bg);

      this.content.add(this.add.text(28, cy + 12, item.name, { fontFamily: 'monospace', fontSize: '17px', color: isOwned ? '#00ff88' : '#888899', fontStyle: 'bold' }));
      this.content.add(this.add.text(28, cy + 34, item.desc, { fontFamily: 'monospace', fontSize: '13px', color: '#555577' }));

      if (!isOwned) {
        this._btn(W / 2, cy + 94, `BUY  ${item.cost} ⚙`, 0xffcc00, () => {
          if (this.save.cycles < item.cost) return;
          this.save.cycles -= item.cost;
          owned.push(item.id);
          writeSave(this.save); this._refreshCycles(); this._renderTab();
        });
      } else {
        // equip buttons — one per owned agent
        const owned_agents = this.save.agents.filter(a => a.owned);
        let bx = 28;
        owned_agents.forEach(ag => {
          const equipped = this.save.gear.equipped[ag.id][type];
          const isEq = equipped === item.id;
          const agDef = DEFS.find(d => d.id === ag.id);
          const bcol = isEq ? agDef.color : 0x333344;
          const gbtn = this.add.graphics();
          gbtn.fillStyle(bcol, isEq ? 0.3 : 0.1);
          gbtn.fillRoundedRect(bx, cy + 78, 80, 38, 6);
          gbtn.lineStyle(1, bcol, isEq ? 0.8 : 0.3);
          gbtn.strokeRoundedRect(bx, cy + 78, 80, 38, 6);
          this.content.add(gbtn);
          const shortMap = { threadling:'THREAD', patchwork:'PATCH', vault:'VAULT', netrunner:'NETRUN', sentinel:'SENTRY', glitcher:'GLITCH', bridgelink:'BRIDGE' };
          const short = shortMap[ag.id] || ag.id.substring(0,6).toUpperCase();
          this.content.add(this.add.text(bx + 40, cy + 97, isEq ? short + ' ✓' : short, { fontFamily: 'monospace', fontSize: '11px', color: isEq ? '#' + agDef.color.toString(16).padStart(6,'0') : '#555566' }).setOrigin(0.5));
          const z = this.add.zone(bx, cy + 78, 80, 38).setOrigin(0).setInteractive();
          z.on('pointerdown', () => {
            this.save.gear.equipped[ag.id][type] = isEq ? null : item.id;
            writeSave(this.save); this._renderTab();
          });
          this.content.add(z);
          bx += 90;
        });
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
    this.autoMs     = ['pulse','velocity'].includes(this.mechanic) ? 1500 : AUTO_MS;
    this.save       = loadSave();

    this.agents = DEFS
      .filter(d => { const s = this.save.agents.find(a => a.id === d.id); return s && s.owned; })
      .map(d => {
        const saved   = this.save.agents.find(a => a.id === d.id);
        const level   = saved.level;
        const stats   = effectiveStats(d.id, level, this.save);
        const subMoves = (saved.subclass && SUBCLASS_MOVES[saved.subclass]) ? [SUBCLASS_MOVES[saved.subclass]] : [];
        return {
          ...d,
          ...stats,
          moves: [...d.moves, ...subMoves],
          hp: Math.min(saved.hp, stats.maxHp),
          en: stats.maxEn,
          level,
          xp: saved.xp,
          subclass: saved.subclass || null,
          stored: 0,
          defending: false, fortified: false, locked: false, frozen: false, shielded: false,
        };
      });

    this.enemy = { ...ch.enemy, saveUsed: false, charged: false };
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

  preload() {}

  create() {
    this._grid();
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

  // ── Enemy UI  y:32–210 ──────────────────────────────────
  _enemyUI() {
    const typeColor = { normal: '#444466', miniboss: '#ff8800', boss: '#ff3355' };
    const ch = this.channel;
    this.add.text(W / 2, 8, `${ch.label}  ·  ${ch.name}`, { fontFamily: 'monospace', fontSize: '13px', color: typeColor[ch.type] }).setOrigin(0.5, 0);
    this.add.text(W / 2, 26, ch.enemy.name, { fontFamily: 'monospace', fontSize: '22px', color: '#ff3355', fontStyle: 'bold' }).setOrigin(0.5, 0);

    this.blob = this.add.graphics();
    this._blob();
    this.tweens.add({ targets: this.blob, scaleX: 1.06, scaleY: 0.95, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

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

      // sprite centered in 118×90 area (sprite is 44×64px)
      const sp = this.add.graphics();
      this._sprite(sp, ag.id, cx + 37, cy + 13);

      // divider under sprite
      const sdiv = this.add.graphics();
      sdiv.lineStyle(1, ag.color, 0.2);
      sdiv.lineBetween(cx + 6, cy + 90, cx + cw - 6, cy + 90);

      const hex = '#' + ag.color.toString(16).padStart(6, '0');
      const nm = this.add.text(cx + cw / 2, cy + 94, ag.name, { fontFamily: 'monospace', fontSize: '11px', color: hex, fontStyle: 'bold' }).setOrigin(0.5, 0);
      const cl = this.add.text(cx + cw / 2, cy + 108, ag.cls, { fontFamily: 'monospace', fontSize: '10px', color: '#444466' }).setOrigin(0.5, 0);
      const bw = cw - 16;
      const hbg = this.add.graphics();
      hbg.fillStyle(0x111122, 1); hbg.fillRect(cx + 8, cy + 122, bw, 12);
      hbg.lineStyle(1, COLORS.dim, 0.3); hbg.strokeRect(cx + 8, cy + 122, bw, 12);
      const hf = this.add.graphics();
      const hl = this.add.text(cx + 8 + bw / 2, cy + 128, '', { fontFamily: 'monospace', fontSize: '9px', color: '#fff' }).setOrigin(0.5, 0.5).setDepth(1);
      const ebg = this.add.graphics();
      ebg.fillStyle(0x111122, 1); ebg.fillRect(cx + 8, cy + 140, bw, 10);
      ebg.lineStyle(1, COLORS.dim, 0.3); ebg.strokeRect(cx + 8, cy + 140, bw, 10);
      const ef = this.add.graphics();
      const el = this.add.text(cx + 8 + bw / 2, cy + 145, '', { fontFamily: 'monospace', fontSize: '9px', color: '#fff' }).setOrigin(0.5, 0.5).setDepth(1);
      const sg = this.add.text(cx + 8, cy + 156, '', { fontFamily: 'monospace', fontSize: '10px', color: '#ffcc00' });
      const st = this.add.text(cx + 8, cy + 168, '', { fontFamily: 'monospace', fontSize: '10px', color: '#aaaacc' });

      // tap zone on sprite area to show stats
      const tap = this.add.zone(cx, cy, cw, 90).setOrigin(0).setInteractive();
      tap.on('pointerdown', () => this._showStats(i));

      return { bg, sp, nm, cl, hf, hl, ef, el, sg, st, cx, cy, cw, ch, bw };
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
    this.eBadge.setText(`📡 STATIC AURA  −${aura}% SIGNAL`);
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
    const bw = obj.bw;
    const hr = Math.max(0, ag.hp / ag.maxHp);
    obj.hf.clear();
    if (!dead) { obj.hf.fillStyle(ag.color, 0.85); obj.hf.fillRect(obj.cx + 9, obj.cy + 123, (bw - 2) * hr, 10); }
    obj.hl.setText(`HP ${ag.hp}/${ag.maxHp}`);
    const er = Math.max(0, ag.en / ag.maxEn);
    obj.ef.clear();
    if (!dead) { obj.ef.fillStyle(COLORS.blue, 0.85); obj.ef.fillRect(obj.cx + 9, obj.cy + 141, (bw - 2) * er, 8); }
    obj.el.setText(`EN ${ag.en}/${ag.maxEn}`);
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
    if (dead)          badges.push('💀');
    obj.st.setText(badges.join(' '));
    obj.st.setColor(dead ? '#ff3355' : '#aaaacc');
    obj.nm.setAlpha(dead ? 0.3 : 1);
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
    let id = 'attack';
    if (ag.autonomy >= 20) {
      if (ag.hp < ag.maxHp * 0.25) id = 'defend';
      else if (ag.id === 'patchwork' && ag.en >= 15) {
        const minRatio = Math.min(...this.agents.filter(a => a.hp > 0).map(a => a.hp / a.maxHp));
        id = minRatio < 0.5 ? 'patch' : 'attack';
      }
    }
    if (ag.id === 'vault' && id === 'attack') id = 'bash';
    this.log(`⚙️ ${ag.name} auto (AUTO ${ag.autonomy}): ${id.toUpperCase()}`);
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

    // Transaction world: each action costs 2 cycles
    if (this.mechanic === 'transaction' && id !== 'item' && id !== 'defend') {
      if (this.save.cycles >= 2) { this.save.cycles -= 2; writeSave(this.save); this.log('> 💸 TRANSACTION: −2 cycles'); }
    }

    if (id === 'item') {
      this.log('> No items in this build.');
      this.state = STATE.PLAYER; this._btns(true); return;
    }

    if (id === 'attack' || id === 'bash') {
      const bonus = id === 'bash' ? 15 : 0;
      const phantom = this.phantomActive && Math.random() < 0.5;
      this.phantomActive = false;
      if (!hits(sig + bonus) || phantom) {
        this.log(`> ${ag.name}: ${id.toUpperCase()} [${phantom ? 'PHANTOM' : 'MISS'}]`);
      } else {
        const dmg = rnd(10, 18) + (ag.dmgBonus || 0);
        this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
        this.log(`> ${ag.name}: ${id.toUpperCase()} → −${dmg}`);
        this._flashE();
        this.lastAction = { id, agentIdx: this.activeIdx };
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
      const heal = rnd(20, 30);
      tgt.hp = Math.min(tgt.maxHp, tgt.hp + heal);
      this.log(`> PATCHWORK: PATCH → ${tgt.name} +${heal} HP`);
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

    } else if (id === 'fortify') {
      ag.fortified = true; this.log(`> ${ag.name}: FORTIFY — 60% dmg reduction`);

    // ── New agent base moves ───────────────────────────────
    } else if (id === 'packet') {
      if (!hits(sig + 10)) {
        this.log(`> ${ag.name}: PACKET [MISS]`);
      } else {
        const dmg = rnd(10, 16) + (ag.dmgBonus || 0);
        this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
        this.log(`> ${ag.name}: PACKET → −${dmg}`);
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
      this.enemy.aura = Math.max(0, this.enemy.aura - 15);
      this.log(`> ${ag.name}: SCAN — enemy aura −15`); this._reEnemy();

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

    } else if (id === 'sync') {
      if (ag.en < 20) { this.log('> Need 20 EN'); this.state = STATE.PLAYER; this._btns(true); return; }
      ag.en -= 20;
      const heals = this.agents.filter(a => a.hp > 0).map(a => {
        const h = rnd(10, 16); a.hp = Math.min(a.maxHp, a.hp + h); return h;
      });
      this.log(`> ${ag.name}: SYNC — all allies +${Math.min(...heals)}–${Math.max(...heals)} HP`);

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
      tgt.hp = Math.max(0, tgt.hp - dmg);
      if (tgt.subclass === 'archive') tgt.stored = (tgt.stored || 0) + Math.ceil(dmg * 0.5);
      if (this.mechanic === 'freeze' && Math.random() < 0.35 && !tgt.frozen) {
        tgt.frozen = true; this.log(`> ❄ ${tgt.name} FROZEN`);
      }
    };

    const doAttack = () => {
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
      this._flashP(); this.time.delayedCall(600, finish);
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
      this._flashP(); this.time.delayedCall(600, finish);
    };
    const doDistributed = () => {
      const parts = alive.map(({ a }) => {
        const d = dmgHit(a, rnd(4, 8) + ovfl);
        applyHit(a, d); return `${a.name} −${d}`;
      });
      this.log(`> DISTRIBUTE → ${parts.join(', ')}`);
      this._flashP(); this.time.delayedCall(600, finish);
    };
    const doCharge = () => {
      this.enemy.charged = true;
      this.log(`> ⚡ ${this.enemy.name} CHARGING — next strike ×2.5`);
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

  _flashE() { this.tweens.add({ targets: this.blob, alpha: 0.2, duration: 80, yoyo: true, repeat: 2 }); }
  _flashP() { this.cameras.main.flash(100, 255, 50, 50, false); }

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

    const save    = this.save;
    const ch      = this.channel;
    const wDef    = WORLDS.find(w => w.id === this.worldId) || WORLDS[0];
    const tier    = wDef.tier;

    if (win) {
      // Mark channel cleared
      if (!save.worlds[this.worldId]) save.worlds[this.worldId] = { cleared: [false,false,false,false,false] };
      save.worlds[this.worldId].cleared[this.channelIdx] = true;
      // Unlock adjacent worlds if this world is now fully cleared
      if (save.worlds[this.worldId].cleared.every(c => c)) {
        const unlocks = WORLD_UNLOCKS[this.worldId] || [];
        unlocks.forEach(uid => {
          if (!save.unlockedWorlds.includes(uid)) save.unlockedWorlds.push(uid);
          if (!save.worlds[uid]) save.worlds[uid] = { cleared: [false,false,false,false,false] };
        });
      }

      // Award cycles
      const aliveCount = this.agents.filter(a => a.hp > 0).length;
      const rewards = calcRewards(ch.type, tier, aliveCount);
      save.cycles += rewards.cycles;

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
        }
      });

      // Level-up flash
      if (levelUps.length > 0) {
        levelUps.forEach(lu => this.log(`⬆ ${lu.name} → Lv ${lu.to}!`));
        this.cameras.main.flash(300, 255, 220, 50, false);
      }

      // Collect agents that just hit level 5 and have no subclass yet
      const pendingSubclasses = this.agents
        .map(ag => save.agents.find(a => a.id === ag.id))
        .filter(sa => sa && sa.owned && sa.level >= 5 && !sa.subclass)
        .map(sa => ({ id: sa.id, name: DEFS.find(d => d.id === sa.id)?.name || sa.id, color: DEFS.find(d => d.id === sa.id)?.color || 0xffffff }));

      writeSave(save);
      this._showWinScreen(rewards, levelUps, pendingSubclasses);
    } else {
      const cost = reviveCost(tier);
      this._showLoseScreen(cost, save);
    }
  }

  _showWinScreen(rewards, levelUps, pendingSubclasses = []) {
    const ch = this.channel;
    const ov = this.add.graphics();
    ov.fillStyle(0x000000, 0.88); ov.fillRect(0, 0, W, H);

    this.add.text(W/2, 80,  '✅',             { fontSize: '52px' }).setOrigin(0.5);
    this.add.text(W/2, 148, 'SYSTEM RESTORED', { fontFamily:'monospace', fontSize:'22px', color:'#00ff88', fontStyle:'bold' }).setOrigin(0.5);
    this.add.text(W/2, 178, `${ch.label} · ${ch.name}`, { fontFamily:'monospace', fontSize:'13px', color:'#444466' }).setOrigin(0.5);

    this.add.text(W/2, 216, `+${rewards.cycles} ⚙  CYCLES`, { fontFamily:'monospace', fontSize:'18px', color:'#ffcc00' }).setOrigin(0.5);
    this.add.text(W/2, 244, `+${rewards.xp} XP  per agent`, { fontFamily:'monospace', fontSize:'16px', color:'#8888bb' }).setOrigin(0.5);

    let y = 288;
    if (levelUps.length > 0) {
      this.add.text(W/2, y, '── LEVEL UP ──', { fontFamily:'monospace', fontSize:'13px', color:'#333355' }).setOrigin(0.5);
      y += 28;
      levelUps.forEach(lu => {
        this.add.text(W/2, y, `${lu.name}  Lv${lu.from} → Lv${lu.to}`, { fontFamily:'monospace', fontSize:'16px', color:'#00ff88' }).setOrigin(0.5);
        y += 28;
      });
    }

    // Buttons
    y = Math.max(y + 20, 520);
    const btn = (label, col, by, cb) => {
      const g = this.add.graphics();
      g.fillStyle(col, 0.12); g.fillRoundedRect(W/2-110, by, 220, 52, 10);
      g.lineStyle(1, col, 0.5); g.strokeRoundedRect(W/2-110, by, 220, 52, 10);
      this.add.text(W/2, by+26, label, { fontFamily:'monospace', fontSize:'16px', color:'#'+col.toString(16).padStart(6,'0') }).setOrigin(0.5);
      this.add.zone(W/2-110, by, 220, 52).setOrigin(0).setInteractive().on('pointerdown', cb);
    };
    const channels = WORLD_CHANNELS[this.worldId] || WORLD_CHANNELS.tv;
    const nextIdx  = Math.min(this.channelIdx + 1, channels.length - 1);
    const goMap    = () => pendingSubclasses.length > 0
      ? this.scene.start('SubclassChoice', { pending: pendingSubclasses, currentIdx: 0 })
      : this.scene.start('OverworldMap');
    if (this.channelIdx < channels.length - 1) {
      btn('NEXT CHANNEL', 0x00ff88, y, () => this.scene.start('Battle', { channel: channels[nextIdx], channelIdx: nextIdx, worldId: this.worldId }));
      btn('← MAP', 0x444466, y + 62, goMap);
    } else {
      btn('← WORLD MAP', 0x00ff88, y, goMap);
    }
  }

  _showLoseScreen(cost, save) {
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
    panel.add(this.add.text(px + pw / 2, py + 114, ag.cls, { fontFamily: 'monospace', fontSize: '13px', color: '#555577' }).setOrigin(0.5, 0));

    const statRows = [
      { label: 'INTEGRITY', val: `${ag.hp} / ${ag.maxHp}`, ratio: ag.hp / ag.maxHp, color: ag.color },
      { label: 'ENERGY',    val: `${ag.en} / ${ag.maxEn}`, ratio: ag.en / ag.maxEn, color: COLORS.blue },
      { label: 'SIGNAL',    val: `${ag.signal}%`,           ratio: ag.signal / 100,   color: COLORS.yellow },
      { label: 'AUTONOMY',  val: `${ag.autonomy}`,          ratio: ag.autonomy / 100, color: COLORS.green },
    ];
    const bx = px + 16, bw = pw - 32;
    statRows.forEach((row, ri) => {
      const ry = py + 140 + ri * 44;
      panel.add(this.add.text(bx, ry, row.label, { fontFamily: 'monospace', fontSize: '12px', color: '#555577' }));
      panel.add(this.add.text(bx + bw, ry, row.val, { fontFamily: 'monospace', fontSize: '12px', color: hex }).setOrigin(1, 0));
      const rbg = this.add.graphics();
      rbg.fillStyle(0x111122, 1); rbg.fillRect(bx, ry + 16, bw, 12);
      rbg.lineStyle(1, COLORS.dim, 0.3); rbg.strokeRect(bx, ry + 16, bw, 12);
      const rfill = this.add.graphics();
      rfill.fillStyle(row.color, 0.8); rfill.fillRect(bx + 1, ry + 17, (bw - 2) * Math.min(1, row.ratio), 10);
      panel.add(rbg); panel.add(rfill);
    });

    // abilities
    panel.add(this.add.text(bx, py + 328, 'ABILITIES', { fontFamily: 'monospace', fontSize: '12px', color: '#555577' }));
    ag.moves.forEach((mv, mi) => {
      const mvhex = '#' + mv.color.toString(16).padStart(6, '0');
      const my = py + 346 + mi * 36;
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

  _closeStats(ov) {
    if (this.statPanel) { this.statPanel.destroy(); this.statPanel = null; }
    ov.destroy();
  }

  // ── Sprite drawing ──────────────────────────────────────
  _sprite(g, id, ox, oy) { _drawSprite(g, id, ox, oy); }
}

new Phaser.Game({
  type: Phaser.AUTO, width: W, height: H,
  backgroundColor: '#050510', scene: [OverworldMap, SubclassChoice, ChannelSelect, Shop, Battle],
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  input: { activePointers: 2 },
});
