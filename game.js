// ============================================================
//  SYSTEM BREACH — v0.1 PROTOTYPE
//  Phase 1: Threadling vs Static Blob, TV World
// ============================================================

const W = 390;
const H = 844;

const COLORS = {
  bg:        0x050510,
  grid:      0x0d0d2a,
  green:     0x00ff88,
  red:       0xff3355,
  orange:    0xff8800,
  blue:      0x44aaff,
  yellow:    0xffcc00,
  purple:    0xaa44ff,
  dim:       0x444466,
  panel:     0x080818,
  enemyRed:  0xff3355,
};

// ─── Combat state machine ────────────────────────────────────
const STATE = {
  PLAYER_TURN: 'PLAYER_TURN',
  ANIMATING:   'ANIMATING',
  ENEMY_TURN:  'ENEMY_TURN',
  VICTORY:     'VICTORY',
  DEFEAT:      'DEFEAT',
};

// ─── Helper: roll hit/miss against signal ───────────────────
function hits(signalPct) {
  return Math.random() * 100 < signalPct;
}

// ─── Helper: integer range random ───────────────────────────
function rnd(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

// ============================================================
//  BATTLE SCENE
// ============================================================
class BattleScene extends Phaser.Scene {
  constructor() { super({ key: 'BattleScene' }); }

  // ── State init ──────────────────────────────────────────
  init() {
    this.player = {
      name:          'THREADLING',
      cls:           'COMPUTE',
      integrity:     100,
      maxIntegrity:  100,
      energy:        50,
      maxEnergy:     50,
      signal:        85,
      autonomy:      10,
      isDefending:   false,
    };

    this.enemy = {
      name:        'STATIC BLOB',
      integrity:   80,
      maxIntegrity: 80,
      signal:       80,
      staticAura:   20,   // subtracts from player signal
      staticStacks: 0,    // builds up with Static Burst
    };

    this.state   = STATE.PLAYER_TURN;
    this.logLines = [];
    this.turn    = 1;
  }

  // ── Assets (procedural only, no external files) ─────────
  preload() {}

  create() {
    this.cameras.main.setBackgroundColor('#050510');
    this._drawGrid();
    this._buildEnemySection();
    this._buildPlayerSection();
    this._buildLogPanel();
    this._buildButtons();
    this._buildTurnBanner();

    this.pushLog('⚡ TV-01 accessed. Interference detected.');
    this.pushLog('⚠️  Static Blob corrupting the signal.');
    this.pushLog('── Turn 1 · Your move ──');
  }

  // ── Background grid ─────────────────────────────────────
  _drawGrid() {
    const g = this.add.graphics();
    g.lineStyle(1, COLORS.grid, 0.8);
    for (let x = 0; x <= W; x += 30) g.lineBetween(x, 0, x, H);
    for (let y = 0; y <= H; y += 30) g.lineBetween(0, y, W, y);
    // scanline overlay
    const s = this.add.graphics();
    s.fillStyle(0x000000, 0.25);
    for (let y = 0; y < H; y += 4) s.fillRect(0, y, W, 2);
  }

  // ─── Enemy UI (y: 44–230) ───────────────────────────────
  _buildEnemySection() {
    // section header
    this._label(W / 2, 44, 'ENEMY', '#444466', 10);

    // name
    this._label(W / 2, 58, this.enemy.name, '#ff3355', 16);

    // enemy sprite — pulsing blob
    this.enemySprite = this._drawEnemyBlob(W / 2, 140);

    // static aura badge
    this.staticBadge = this.add.text(W / 2, 204, '📡 STATIC AURA ACTIVE', {
      fontFamily: 'monospace', fontSize: '10px', color: '#ff8844',
    }).setOrigin(0.5);

    // HP bar
    const { bg: hpBg, fill: hpFill, label: hpLabel } = this._bar(30, 222, W - 60, 14, COLORS.enemyRed, '');
    this.enemyHpBg    = hpBg;
    this.enemyHpFill  = hpFill;
    this.enemyHpLabel = hpLabel;
    this._refreshEnemy();

    // divider
    const d = this.add.graphics();
    d.lineStyle(1, COLORS.dim, 0.4);
    d.lineBetween(20, 248, W - 20, 248);
  }

  _drawEnemyBlob(cx, cy) {
    const g = this.add.graphics();
    this._renderBlob(g, cx, cy, 1.0);
    // pulsing tween
    this.tweens.add({
      targets: g,
      scaleX: 1.06, scaleY: 0.96,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    return g;
  }

  _renderBlob(g, cx, cy, alpha) {
    g.clear();
    // outer glow
    g.fillStyle(COLORS.enemyRed, 0.08 * alpha);
    g.fillCircle(cx, cy, 64);
    // mid
    g.fillStyle(COLORS.enemyRed, 0.18 * alpha);
    g.fillCircle(cx, cy, 50);
    // core
    g.fillStyle(COLORS.enemyRed, 0.35 * alpha);
    g.fillCircle(cx, cy, 36);
    // border
    g.lineStyle(2, COLORS.enemyRed, 0.9 * alpha);
    g.strokeCircle(cx, cy, 36);
    // static noise dots
    g.lineStyle(0);
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2;
      const r = 20 + rnd(0, 18);
      g.fillStyle(COLORS.enemyRed, Math.random() * 0.7 * alpha);
      g.fillCircle(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r, rnd(1, 3));
    }
    // "eyes"
    g.fillStyle(0xffffff, 0.9 * alpha);
    g.fillCircle(cx - 10, cy - 6, 4);
    g.fillCircle(cx + 10, cy - 6, 4);
    g.fillStyle(COLORS.enemyRed, alpha);
    g.fillCircle(cx - 10, cy - 6, 2);
    g.fillCircle(cx + 10, cy - 6, 2);
  }

  // ─── Player UI (y: 255–430) ─────────────────────────────
  _buildPlayerSection() {
    this._label(W / 2, 255, 'SQUAD', '#444466', 10);
    this._label(W / 2, 269, this.player.name, '#00ff88', 16);
    this._label(W / 2, 289, this.player.cls, '#446644', 11);

    // player sprite — angular compute unit
    this._drawPlayerSprite(W / 2, 345);

    // Integrity bar
    const { fill: hpFill, label: hpLabel } = this._bar(30, 398, W - 60, 14, COLORS.green, '');
    this.playerHpFill  = hpFill;
    this.playerHpLabel = hpLabel;

    // Energy bar
    const { fill: enFill, label: enLabel } = this._bar(30, 422, W - 60, 10, COLORS.blue, '');
    this.playerEnFill  = enFill;
    this.playerEnLabel = enLabel;

    // Signal / defending status
    this.statusText = this.add.text(30, 440, '', {
      fontFamily: 'monospace', fontSize: '10px', color: '#ffcc00',
    });

    this._refreshPlayer();

    // divider
    const d = this.add.graphics();
    d.lineStyle(1, COLORS.dim, 0.4);
    d.lineBetween(20, 462, W - 20, 462);
  }

  _drawPlayerSprite(cx, cy) {
    const g = this.add.graphics();
    // outer shell
    g.fillStyle(COLORS.green, 0.12);
    g.fillRect(cx - 36, cy - 36, 72, 72);
    g.lineStyle(2, COLORS.green, 0.85);
    g.strokeRect(cx - 36, cy - 36, 72, 72);
    // inner core
    g.lineStyle(1, COLORS.green, 0.4);
    g.strokeRect(cx - 26, cy - 26, 52, 52);
    // circuit lines
    g.lineStyle(1, COLORS.green, 0.3);
    g.lineBetween(cx - 36, cy, cx - 26, cy);
    g.lineBetween(cx + 26, cy, cx + 36, cy);
    g.lineBetween(cx, cy - 36, cx, cy - 26);
    g.lineBetween(cx, cy + 26, cx, cy + 36);
    // core LED
    g.fillStyle(COLORS.green, 0.9);
    g.fillRect(cx - 7, cy - 7, 14, 14);
    // corner bolts
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([dx,dy]) => {
      g.fillStyle(COLORS.green, 0.6);
      g.fillRect(cx + dx * 30 - 2, cy + dy * 30 - 2, 4, 4);
    });
    // idle pulse
    this.tweens.add({
      targets: g,
      alpha: 0.75, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
    return g;
  }

  // ─── Combat log (y: 470–565) ────────────────────────────
  _buildLogPanel() {
    const lx = 20, ly = 470, lw = W - 40, lh = 96;
    const bg = this.add.graphics();
    bg.fillStyle(COLORS.panel, 1);
    bg.fillRect(lx, ly, lw, lh);
    bg.lineStyle(1, COLORS.dim, 0.5);
    bg.strokeRect(lx, ly, lw, lh);

    this._label(lx + 8, ly + 4, 'SYSTEM LOG', '#333355', 9);

    this.logTextObjs = [];
    for (let i = 0; i < 4; i++) {
      this.logTextObjs.push(this.add.text(lx + 8, ly + 18 + i * 19, '', {
        fontFamily: 'monospace', fontSize: '11px', color: '#8888bb',
        wordWrap: { width: lw - 16 },
      }));
    }
  }

  // ─── Action buttons (y: 578–740) ────────────────────────
  _buildButtons() {
    const rows = [
      [
        { id: 'attack',    label: 'ATTACK',    sub: 'Basic · ~15 dmg',       color: COLORS.red,    cost: 0  },
        { id: 'overclock', label: 'OVERCLOCK', sub: '~35 dmg · -10 self · 20⚡', color: COLORS.orange, cost: 20 },
      ],
      [
        { id: 'defend',    label: 'DEFEND',    sub: '-50% dmg next hit',     color: COLORS.blue,   cost: 0  },
        { id: 'item',      label: 'ITEM',      sub: 'None available',        color: COLORS.dim,    cost: 0  },
      ],
    ];

    const bw = (W - 50) / 2;   // button width
    const bh = 66;
    const startY = 580;
    const gap = 10;

    this.btnObjects = [];

    rows.forEach((row, ri) => {
      row.forEach((def, ci) => {
        const bx = 20 + ci * (bw + 10);
        const by = startY + ri * (bh + gap);

        const bg = this.add.graphics();
        bg.fillStyle(def.color, 0.14);
        bg.fillRoundedRect(0, 0, bw, bh, 6);
        bg.lineStyle(1, def.color, 0.55);
        bg.strokeRoundedRect(0, 0, bw, bh, 6);
        bg.setPosition(bx, by);

        const zone = this.add.zone(bx, by, bw, bh).setOrigin(0).setInteractive();
        zone.on('pointerdown', () => this.handleAction(def.id));
        zone.on('pointerover', () => { bg.alpha = 1.4; });
        zone.on('pointerout',  () => { bg.alpha = 1.0; });

        this.add.text(bx + bw / 2, by + 22, def.label, {
          fontFamily: 'monospace', fontSize: '13px', color: '#' + def.color.toString(16).padStart(6,'0'), fontStyle: 'bold',
        }).setOrigin(0.5, 0.5);

        this.add.text(bx + bw / 2, by + 42, def.sub, {
          fontFamily: 'monospace', fontSize: '9px', color: '#666688',
        }).setOrigin(0.5, 0.5);

        this.btnObjects.push({ bg, zone, def });
      });
    });
  }

  _buildTurnBanner() {
    this.turnBanner = this.add.text(W / 2, 564, '── YOUR TURN ──', {
      fontFamily: 'monospace', fontSize: '11px', color: '#333355',
    }).setOrigin(0.5);
  }

  // ─── Bar helper ─────────────────────────────────────────
  _bar(x, y, w, h, fillColor, labelText) {
    const bg = this.add.graphics();
    bg.fillStyle(0x111122, 1);
    bg.fillRect(x, y, w, h);
    bg.lineStyle(1, COLORS.dim, 0.4);
    bg.strokeRect(x, y, w, h);

    const fill = this.add.graphics();
    fill.fillStyle(fillColor, 0.85);
    fill.fillRect(x + 1, y + 1, w - 2, h - 2);

    const label = this.add.text(x + w / 2, y + h / 2, labelText, {
      fontFamily: 'monospace', fontSize: '9px', color: '#ffffff',
    }).setOrigin(0.5, 0.5);

    return { bg, fill, label };
  }

  _label(x, y, text, color, size) {
    return this.add.text(x, y, text, {
      fontFamily: 'monospace', fontSize: `${size}px`, color,
    }).setOrigin(0.5, 0);
  }

  // ─── Refresh bar display ────────────────────────────────
  _refreshEnemy() {
    const ratio = Math.max(0, this.enemy.integrity / this.enemy.maxIntegrity);
    const bw = W - 60 - 2;
    this.enemyHpFill.clear();
    this.enemyHpFill.fillStyle(COLORS.enemyRed, 0.85);
    this.enemyHpFill.fillRect(31, 223, bw * ratio, 12);
    this.enemyHpLabel.setText(`INTEGRITY ${this.enemy.integrity}/${this.enemy.maxIntegrity}`);

    const aura = this.enemy.staticAura + this.enemy.staticStacks * 8;
    this.staticBadge.setText(`📡 STATIC AURA  −${aura}% SIGNAL`);
    this.staticBadge.setColor(this.enemy.staticStacks > 0 ? '#ff4444' : '#ff8844');
  }

  _refreshPlayer() {
    const bw = W - 60 - 2;

    // HP
    const hpRatio = Math.max(0, this.player.integrity / this.player.maxIntegrity);
    this.playerHpFill.clear();
    this.playerHpFill.fillStyle(COLORS.green, 0.85);
    this.playerHpFill.fillRect(31, 399, bw * hpRatio, 12);
    this.playerHpLabel.setText(`INTEGRITY  ${this.player.integrity}/${this.player.maxIntegrity}`);

    // Energy
    const enRatio = Math.max(0, this.player.energy / this.player.maxEnergy);
    this.playerEnFill.clear();
    this.playerEnFill.fillStyle(COLORS.blue, 0.85);
    this.playerEnFill.fillRect(31, 423, bw * enRatio, 8);
    this.playerEnLabel.setText(`ENERGY  ${this.player.energy}/${this.player.maxEnergy}`);

    // Signal
    const effectiveSignal = this.player.signal - this.enemy.staticAura - this.enemy.staticStacks * 8;
    const sigPct = Math.max(10, effectiveSignal);
    const defending = this.player.isDefending ? '  🛡 DEFENDING' : '';
    this.statusText.setText(`SIGNAL ${sigPct}%${defending}`);
    this.statusText.setColor(sigPct < 50 ? '#ff4444' : '#ffcc00');
  }

  // ─── Log ────────────────────────────────────────────────
  pushLog(msg) {
    this.logLines.push(msg);
    const recent = this.logLines.slice(-4);
    this.logTextObjs.forEach((t, i) => t.setText(recent[i] || ''));
  }

  // ─── Button lock/unlock ─────────────────────────────────
  _setButtons(enabled) {
    this.btnObjects.forEach(({ bg, zone }) => {
      bg.setAlpha(enabled ? 1 : 0.35);
      enabled ? zone.setInteractive() : zone.disableInteractive();
    });
    this.turnBanner.setColor(enabled ? '#446644' : '#222233');
    this.turnBanner.setText(enabled ? '── YOUR TURN ──' : '── PROCESSING ──');
  }

  // ─── Player action handler ──────────────────────────────
  handleAction(id) {
    if (this.state !== STATE.PLAYER_TURN) return;

    const effSignal = Math.max(10, this.player.signal - this.enemy.staticAura - this.enemy.staticStacks * 8);

    if (id === 'item') {
      this.pushLog('> No items loaded in this build.');
      return;
    }

    this.state = STATE.ANIMATING;
    this._setButtons(false);
    this.player.isDefending = false;

    if (id === 'attack') {
      if (!hits(effSignal)) {
        this.pushLog(`> ATTACK ··· [MISS]  Signal lost in static noise.`);
      } else {
        const dmg = rnd(12, 18);
        this.enemy.integrity = Math.max(0, this.enemy.integrity - dmg);
        this.pushLog(`> ATTACK → ${this.enemy.name}   −${dmg} integrity`);
        this._flashEnemy();
      }

    } else if (id === 'overclock') {
      if (this.player.energy < 20) {
        this.pushLog(`> OVERCLOCK failed — insufficient energy (need 20⚡)`);
        this.state = STATE.PLAYER_TURN;
        this._setButtons(true);
        return;
      }
      this.player.energy -= 20;
      const selfDmg = 10;
      if (!hits(effSignal)) {
        const bleed = 5;
        this.player.integrity = Math.max(0, this.player.integrity - bleed);
        this.pushLog(`> OVERCLOCK ··· [MISS]  Thermal bleed: −${bleed} self`);
      } else {
        const dmg = rnd(28, 38);
        this.enemy.integrity = Math.max(0, this.enemy.integrity - dmg);
        this.player.integrity = Math.max(0, this.player.integrity - selfDmg);
        this.pushLog(`> OVERCLOCK → ${this.enemy.name}   −${dmg} integrity`);
        this.pushLog(`  Thermal bleed: −${selfDmg} self integrity`);
        this._flashEnemy();
      }

    } else if (id === 'defend') {
      this.player.isDefending = true;
      this.pushLog(`> DEFEND — bracing against interference`);
    }

    this._refreshEnemy();
    this._refreshPlayer();

    if (this.enemy.integrity <= 0) {
      this.time.delayedCall(500, () => this._endBattle(true));
      return;
    }
    if (this.player.integrity <= 0) {
      this.time.delayedCall(500, () => this._endBattle(false));
      return;
    }

    this.time.delayedCall(700, () => this._enemyTurn());
  }

  // ─── Enemy turn ─────────────────────────────────────────
  _enemyTurn() {
    this.state = STATE.ENEMY_TURN;
    this.turnBanner.setText('── ENEMY TURN ──').setColor('#441111');

    const roll = Math.random();

    // Static Blob move set: 50% attack, 30% static burst, 20% double static
    const afterEnemy = () => {
      this._refreshPlayer();
      this._refreshEnemy();

      if (this.player.integrity <= 0) {
        this.time.delayedCall(400, () => this._endBattle(false));
        return;
      }

      // End of round housekeeping
      this.turn++;
      this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + 5); // passive regen
      this.player.isDefending = false;
      this._refreshPlayer();

      this.state = STATE.PLAYER_TURN;
      this._setButtons(true);
      this.pushLog(`── Turn ${this.turn} · Your move ──`);
    };

    if (roll < 0.50) {
      // Basic attack
      const rawDmg = rnd(8, 14);
      const dmg = this.player.isDefending ? Math.ceil(rawDmg * 0.5) : rawDmg;
      this.player.integrity = Math.max(0, this.player.integrity - dmg);
      const note = this.player.isDefending ? ' [BLOCKED -50%]' : '';
      this.pushLog(`> ${this.enemy.name} attacks${note}   −${dmg} integrity`);
      this._flashPlayer();
      this.time.delayedCall(600, afterEnemy);

    } else if (roll < 0.80) {
      // Static Burst — disrupt signal
      this.enemy.staticStacks = Math.min(3, this.enemy.staticStacks + 1);
      const penalty = this.enemy.staticStacks * 8;
      this.pushLog(`> ${this.enemy.name}: STATIC BURST!`);
      this.time.delayedCall(400, () => {
        this.pushLog(`  Signal further disrupted (−${penalty}% total stack)`);
        afterEnemy();
      });

    } else {
      // Double attack
      const d1 = rnd(5, 10);
      const d2 = rnd(5, 10);
      const total = this.player.isDefending ? Math.ceil((d1+d2)*0.5) : d1+d2;
      this.player.integrity = Math.max(0, this.player.integrity - total);
      this.pushLog(`> ${this.enemy.name}: DOUBLE PULSE!   −${total} integrity`);
      this._flashPlayer();
      this.time.delayedCall(600, afterEnemy);
    }
  }

  // ─── Flash effects ───────────────────────────────────────
  _flashEnemy() {
    this.tweens.add({
      targets: this.enemySprite, alpha: 0.2,
      duration: 80, yoyo: true, repeat: 2,
    });
  }

  _flashPlayer() {
    this.cameras.main.flash(120, 255, 50, 50, false);
  }

  // ─── End battle ─────────────────────────────────────────
  _endBattle(victory) {
    this.state = victory ? STATE.VICTORY : STATE.DEFEAT;
    this._setButtons(false);

    // Overlay
    const ov = this.add.graphics();
    ov.fillStyle(0x000000, 0.78);
    ov.fillRect(0, 0, W, H);

    if (victory) {
      this.add.text(W/2, H/2 - 100, '✅', { fontSize: '48px' }).setOrigin(0.5);
      this.add.text(W/2, H/2 - 40,  'SYSTEM RESTORED', {
        fontFamily: 'monospace', fontSize: '22px', color: '#00ff88', fontStyle: 'bold',
      }).setOrigin(0.5);
      this.add.text(W/2, H/2 + 10, `Channel 1 cleared.\n+50 XP  ·  +10 Autonomy`, {
        fontFamily: 'monospace', fontSize: '14px', color: '#aaaacc', align: 'center',
      }).setOrigin(0.5);
    } else {
      this.add.text(W/2, H/2 - 100, '💀', { fontSize: '48px' }).setOrigin(0.5);
      this.add.text(W/2, H/2 - 40, 'INTEGRITY FAILURE', {
        fontFamily: 'monospace', fontSize: '22px', color: '#ff3355', fontStyle: 'bold',
      }).setOrigin(0.5);
      this.add.text(W/2, H/2 + 10, 'Threadling disconnected.\nSystem breach uncontained.', {
        fontFamily: 'monospace', fontSize: '14px', color: '#aaaacc', align: 'center',
      }).setOrigin(0.5);
    }

    // Retry button
    const rbg = this.add.graphics();
    rbg.fillStyle(COLORS.green, 0.15);
    rbg.fillRoundedRect(W/2 - 90, H/2 + 90, 180, 50, 8);
    rbg.lineStyle(2, COLORS.green, 0.8);
    rbg.strokeRoundedRect(W/2 - 90, H/2 + 90, 180, 50, 8);

    this.add.text(W/2, H/2 + 115, 'RETRY MISSION', {
      fontFamily: 'monospace', fontSize: '14px', color: '#00ff88', fontStyle: 'bold',
    }).setOrigin(0.5);

    const zone = this.add.zone(W/2 - 90, H/2 + 90, 180, 50).setOrigin(0).setInteractive();
    zone.on('pointerdown', () => this.scene.restart());
  }
}

// ============================================================
//  GAME CONFIG
// ============================================================
new Phaser.Game({
  type:   Phaser.AUTO,
  width:  W,
  height: H,
  backgroundColor: '#050510',
  scene:  BattleScene,
  scale: {
    mode:       Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  input: {
    activePointers: 2,
  },
});
