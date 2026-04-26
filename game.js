const W = 390, H = 844, AUTO_MS = 8000;

const COLORS = {
  bg: 0x050510, grid: 0x0d0d2a, green: 0x00ff88, red: 0xff3355,
  orange: 0xff8800, blue: 0x44aaff, yellow: 0xffcc00, purple: 0xaa44ff,
  dim: 0x444466, panel: 0x080818,
};

const STATE = { PLAYER: 'PLAYER', ANIM: 'ANIM', ENEMY: 'ENEMY', WIN: 'WIN', LOSE: 'LOSE' };

function hits(s) { return Math.random() * 100 < s; }
function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

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
];

class Battle extends Phaser.Scene {
  constructor() { super({ key: 'Battle' }); }

  init() {
    this.agents = DEFS.map(d => ({
      ...d, hp: d.maxHp, en: d.maxEn,
      defending: false, fortified: false,
    }));
    this.enemy = { hp: 220, maxHp: 220, aura: 20, stacks: 0 };
    this.state = STATE.PLAYER;
    this.activeIdx = 0;
    this.acted = new Set();
    this.round = 1;
    this.lastAction = null;
    this.tStart = 0;
    this.logs = [];
  }

  preload() {}

  create() {
    this._grid();
    this._enemyUI();
    this._logUI();
    this._timerUI();
    this._cardUI();
    this._btnUI();
    this.log('⚡ TV-01 accessed. Squad deployed.');
    this.log('⚠️  Static Blob detected. Signal disrupted.');
    this._startTurn();
  }

  update(t) {
    if (this.state !== STATE.PLAYER) return;
    const ratio = Math.max(0, 1 - (t - this.tStart) / AUTO_MS);
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
    this.add.text(W / 2, 32, 'ENEMY', { fontFamily: 'monospace', fontSize: '13px', color: '#333355' }).setOrigin(0.5, 0);
    this.add.text(W / 2, 48, 'STATIC BLOB', { fontFamily: 'monospace', fontSize: '22px', color: '#ff3355', fontStyle: 'bold' }).setOrigin(0.5, 0);

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

  // ── Agent cards  y:368–510 ─────────────────────────────
  _cardUI() {
    const cw = 118, ch = 138, gap = 6, startX = (W - (cw * 3 + gap * 2)) / 2;
    this.cards = this.agents.map((ag, i) => {
      const cx = startX + i * (cw + gap), cy = 368;
      const bg = this.add.graphics();
      const hex = '#' + ag.color.toString(16).padStart(6, '0');
      const nm = this.add.text(cx + cw / 2, cy + 9, ag.name, { fontFamily: 'monospace', fontSize: '11px', color: hex, fontStyle: 'bold' }).setOrigin(0.5, 0);
      const cl = this.add.text(cx + cw / 2, cy + 24, ag.cls, { fontFamily: 'monospace', fontSize: '10px', color: '#444466' }).setOrigin(0.5, 0);
      const bw = cw - 16;
      const hbg = this.add.graphics();
      hbg.fillStyle(0x111122, 1); hbg.fillRect(cx + 8, cy + 39, bw, 12);
      hbg.lineStyle(1, COLORS.dim, 0.3); hbg.strokeRect(cx + 8, cy + 39, bw, 12);
      const hf = this.add.graphics();
      const hl = this.add.text(cx + 8 + bw / 2, cy + 45, '', { fontFamily: 'monospace', fontSize: '9px', color: '#fff' }).setOrigin(0.5, 0.5).setDepth(1);
      const ebg = this.add.graphics();
      ebg.fillStyle(0x111122, 1); ebg.fillRect(cx + 8, cy + 57, bw, 10);
      ebg.lineStyle(1, COLORS.dim, 0.3); ebg.strokeRect(cx + 8, cy + 57, bw, 10);
      const ef = this.add.graphics();
      const el = this.add.text(cx + 8 + bw / 2, cy + 62, '', { fontFamily: 'monospace', fontSize: '9px', color: '#fff' }).setOrigin(0.5, 0.5).setDepth(1);
      const sg = this.add.text(cx + 8, cy + 73, '', { fontFamily: 'monospace', fontSize: '10px', color: '#ffcc00' });
      const st = this.add.text(cx + 8, cy + 89, '', { fontFamily: 'monospace', fontSize: '10px', color: '#aaaacc' });
      const at = this.add.text(cx + 8, cy + 107, '', { fontFamily: 'monospace', fontSize: '10px', color: '#446644' });
      return { bg, nm, cl, hf, hl, ef, el, sg, st, at, cx, cy, cw, ch, bw };
    });
    this.agents.forEach((_, i) => this._reCard(i));
    this._div(514);
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
    const ag = this.agents[this.activeIdx];
    if (!ag) return;
    const bw = (W - 48) / 2, bh = 78, sy = 522, gap = 8;
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
        const z = this.add.zone(bx, by, bw, bh).setOrigin(0).setInteractive();
        z.on('pointerdown', () => this.act(def.id));
        z.on('pointerover', () => bg.setAlpha(1.6));
        z.on('pointerout',  () => bg.setAlpha(1.0));
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
    const hex = '#' + ag.color.toString(16).padStart(6, '0');
    obj.bg.clear();
    obj.bg.fillStyle(ag.color, active ? 0.18 : 0.06);
    obj.bg.fillRoundedRect(obj.cx, obj.cy, obj.cw, obj.ch, 6);
    obj.bg.lineStyle(active ? 2 : 1, ag.color, active ? 0.9 : 0.25);
    obj.bg.strokeRoundedRect(obj.cx, obj.cy, obj.cw, obj.ch, 6);
    const bw = obj.bw;
    const hr = Math.max(0, ag.hp / ag.maxHp);
    obj.hf.clear();
    if (!dead) { obj.hf.fillStyle(ag.color, 0.85); obj.hf.fillRect(obj.cx + 9, obj.cy + 40, (bw - 2) * hr, 10); }
    obj.hl.setText(`HP ${ag.hp}/${ag.maxHp}`);
    const er = Math.max(0, ag.en / ag.maxEn);
    obj.ef.clear();
    if (!dead) { obj.ef.fillStyle(COLORS.blue, 0.85); obj.ef.fillRect(obj.cx + 9, obj.cy + 58, (bw - 2) * er, 8); }
    obj.el.setText(`EN ${ag.en}/${ag.maxEn}`);
    const sig = Math.max(10, ag.signal - this.enemy.aura - this.enemy.stacks * 8);
    obj.sg.setText(`SIG ${sig}%`);
    obj.sg.setColor(sig < 50 ? '#ff4444' : '#ffcc00');
    const badges = [];
    if (ag.defending) badges.push('🛡');
    if (ag.fortified) badges.push('⚡');
    if (dead) badges.push('💀 OFFLINE');
    obj.st.setText(badges.join(' '));
    obj.st.setColor(dead ? '#ff3355' : '#aaaacc');
    obj.at.setText(`AUTO ${ag.autonomy}`);
    obj.nm.setAlpha(dead ? 0.3 : 1);
  }

  _reAll() { this.agents.forEach((_, i) => this._reCard(i)); }

  // ── Turn management ─────────────────────────────────────
  _startTurn() {
    const ag = this.agents[this.activeIdx];
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
      let nx = (this.activeIdx + 1) % 3, tries = 0;
      while ((this.agents[nx].hp <= 0 || this.acted.has(nx)) && tries++ < 3) nx = (nx + 1) % 3;
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
    const sig = Math.max(10, ag.signal - this.enemy.aura - this.enemy.stacks * 8);
    ag.defending = false; ag.fortified = false;

    if (id === 'item') {
      this.log('> No items in this build.');
      this.state = STATE.PLAYER; this._btns(true); return;
    }

    if (id === 'attack' || id === 'bash') {
      const bonus = id === 'bash' ? 15 : 0;
      if (!hits(sig + bonus)) {
        this.log(`> ${ag.name}: ${id.toUpperCase()} [MISS]`);
      } else {
        const dmg = rnd(10, 18);
        this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
        this.log(`> ${ag.name}: ${id.toUpperCase()} → −${dmg}`);
        this._flashE();
        this.lastAction = { id, agentIdx: this.activeIdx };
      }

    } else if (id === 'overclock') {
      if (ag.en < 20) { this.log('> Need 20 energy'); this.state = STATE.PLAYER; this._btns(true); return; }
      ag.en -= 20;
      if (!hits(sig)) {
        ag.hp = Math.max(0, ag.hp - 5);
        this.log(`> ${ag.name}: OVERCLOCK [MISS] bleed −5`);
      } else {
        const dmg = rnd(26, 36);
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
      ag.defending = true;
      this.log(`> ${ag.name}: DEFEND`);

    } else if (id === 'fortify') {
      ag.fortified = true;
      this.log(`> ${ag.name}: FORTIFY — 60% dmg reduction`);
    }

    this._reEnemy(); this._reAll();

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
      this.agents.forEach(a => { if (a.hp > 0) a.en = Math.min(a.maxEn, a.en + 5); });
      this.acted = new Set();
      this.activeIdx = 0;
      while (this.agents[this.activeIdx].hp <= 0) this.activeIdx = (this.activeIdx + 1) % 3;
      this.log(`── Round ${this.round} ──`);
      this.time.delayedCall(300, () => this._startTurn());
    };

    const alive = this.agents.map((a, i) => ({ a, i })).filter(({ a }) => a.hp > 0);
    const pick = () => alive[Math.floor(Math.random() * alive.length)].a;
    const roll = Math.random();

    if (roll < 0.50) {
      const tgt = pick();
      const raw = rnd(10, 18);
      const dmg = tgt.defending ? Math.ceil(raw * 0.5) : tgt.fortified ? Math.ceil(raw * 0.4) : raw;
      tgt.hp = Math.max(0, tgt.hp - dmg);
      const tag = tgt.defending ? ' [BLOCKED]' : tgt.fortified ? ' [FORT]' : '';
      this.log(`> Blob → ${tgt.name}${tag} −${dmg}`);
      this._flashP();
      this.time.delayedCall(600, finish);

    } else if (roll < 0.78) {
      this.enemy.stacks = Math.min(3, this.enemy.stacks + 1);
      const total = this.enemy.aura + this.enemy.stacks * 8;
      this.log(`> STATIC BURST! Signal −${total}%`);
      this._reEnemy();
      this.time.delayedCall(600, finish);

    } else {
      const t1 = pick(), t2 = pick();
      const d1 = rnd(6, 11), d2 = rnd(6, 11);
      t1.hp = Math.max(0, t1.hp - d1);
      t2.hp = Math.max(0, t2.hp - d2);
      this.log(`> DOUBLE PULSE → ${t1.name} −${d1}, ${t2.name} −${d2}`);
      this._flashP();
      this.time.delayedCall(600, finish);
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
    const ov = this.add.graphics();
    ov.fillStyle(0x000000, 0.82); ov.fillRect(0, 0, W, H);
    const icon  = win ? '✅' : '💀';
    const title = win ? 'SYSTEM RESTORED'   : 'INTEGRITY FAILURE';
    const body  = win ? 'Channel 1 cleared.\n+50 XP · +10 Autonomy' : 'Squad offline.\nBreach uncontained.';
    const col   = win ? '#00ff88' : '#ff3355';
    this.add.text(W / 2, H / 2 - 110, icon,  { fontSize: '52px' }).setOrigin(0.5);
    this.add.text(W / 2, H / 2 - 50,  title, { fontFamily: 'monospace', fontSize: '24px', color: col, fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(W / 2, H / 2 + 6,   body,  { fontFamily: 'monospace', fontSize: '17px', color: '#aaaacc', align: 'center' }).setOrigin(0.5);
    const rb = this.add.graphics();
    rb.fillStyle(COLORS.green, 0.15); rb.fillRoundedRect(W / 2 - 100, H / 2 + 88, 200, 54, 10);
    rb.lineStyle(2, COLORS.green, 0.8); rb.strokeRoundedRect(W / 2 - 100, H / 2 + 88, 200, 54, 10);
    this.add.text(W / 2, H / 2 + 115, 'RETRY', { fontFamily: 'monospace', fontSize: '18px', color: '#00ff88', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.zone(W / 2 - 100, H / 2 + 88, 200, 54).setOrigin(0).setInteractive().on('pointerdown', () => this.scene.restart());
  }
}

new Phaser.Game({
  type: Phaser.AUTO, width: W, height: H,
  backgroundColor: '#050510', scene: Battle,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  input: { activePointers: 2 },
});
