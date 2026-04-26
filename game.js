// ============================================================
//  SYSTEM BREACH — v0.1 PROTOTYPE
//  Phase 1: Threadling vs Static Blob, TV World
// ============================================================

const W = 390;
const H = 844;

const COLORS = {
  bg:       0x050510,
  grid:     0x0d0d2a,
  green:    0x00ff88,
  red:      0xff3355,
  orange:   0xff8800,
  blue:     0x44aaff,
  yellow:   0xffcc00,
  dim:      0x444466,
  panel:    0x080818,
  enemyRed: 0xff3355,
};

const STATE = {
  PLAYER_TURN: 'PLAYER_TURN',
  ANIMATING:   'ANIMATING',
  ENEMY_TURN:  'ENEMY_TURN',
  VICTORY:     'VICTORY',
  DEFEAT:      'DEFEAT',
};

function hits(signalPct) { return Math.random() * 100 < signalPct; }
function rnd(min, max)   { return min + Math.floor(Math.random() * (max - min + 1)); }

// ============================================================
class BattleScene extends Phaser.Scene {
  constructor() { super({ key: 'BattleScene' }); }

  init() {
    this.player = {
      name:         'THREADLING',
      cls:          'COMPUTE',
      integrity:    100,
      maxIntegrity: 100,
      energy:       50,
      maxEnergy:    50,
      signal:       85,
      autonomy:     10,
      isDefending:  false,
    };
    this.enemy = {
      name:         'STATIC BLOB',
      integrity:    80,
      maxIntegrity: 80,
      staticAura:   20,
      staticStacks: 0,
    };
    this.state    = STATE.PLAYER_TURN;
    this.logLines = [];
    this.turn     = 1;
  }

  preload() {}

  create() {
    this.cameras.main.setBackgroundColor('#050510');
    this._drawGrid();

    // ── Layout Y anchors ──────────────────────────────────
    // [0-30]   header
    // [30-220]  enemy section
    // [220-235] divider
    // [235-435] player section
    // [435-450] divider
    // [450-560] log panel
    // [560-578] turn banner
    // [578-740] buttons (2 rows × 76px + gap)

    this._buildHeader();
    this._buildEnemySection();
    this._buildPlayerSection();
    this._buildLogPanel();
    this._buildButtons();
    this._buildTurnBanner();

    this.pushLog('⚡ TV-01 accessed. Interference detected.');
    this.pushLog('⚠️  Static Blob corrupting the signal.');
    this.pushLog(`── Turn 1 · Your move ──`);
  }

  // ── Background ─────────────────────────────────────────
  _drawGrid() {
    const g = this.add.graphics();
    g.lineStyle(1, COLORS.grid, 0.8);
    for (let x = 0; x <= W; x += 30) g.lineBetween(x, 0, x, H);
    for (let y = 0; y <= H; y += 30) g.lineBetween(0, y, W, y);
    const s = this.add.graphics();
    s.fillStyle(0x000000, 0.22);
    for (let y = 0; y < H; y += 4) s.fillRect(0, y, W, 2);
  }

  _buildHeader() {
    this.add.text(W / 2, 8, 'SYSTEM BREACH', {
      fontFamily: 'monospace', fontSize: '16px', color: '#00ff88', letterSpacing: 4,
    }).setOrigin(0.5, 0);
  }

  // ── Enemy section (y: 32–222) ──────────────────────────
  _buildEnemySection() {
    this._sectionLabel(W / 2, 32, 'ENEMY', '#333355');

    // name
    this.add.text(W / 2, 48, this.enemy.name, {
      fontFamily: 'monospace', fontSize: '22px', color: '#ff3355', fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    // sprite
    this.enemySprite = this._drawEnemyBlob(W / 2, 128);

    // HP bar (y=182)
    const bw = W - 60;
    this._barBg(30, 182, bw, 18);
    this.enemyHpFill = this.add.graphics();
    this.enemyHpLabel = this.add.text(30 + bw / 2, 182 + 9, '', {
      fontFamily: 'monospace', fontSize: '13px', color: '#ffffff',
    }).setOrigin(0.5, 0.5).setDepth(1);

    // static badge
    this.staticBadge = this.add.text(W / 2, 208, '📡 STATIC AURA ACTIVE', {
      fontFamily: 'monospace', fontSize: '14px', color: '#ff8844',
    }).setOrigin(0.5, 0);

    this._divider(230);
    this._refreshEnemy();
  }

  _drawEnemyBlob(cx, cy) {
    const g = this.add.graphics();
    this._renderBlob(g, cx, cy);
    this.tweens.add({ targets: g, scaleX: 1.06, scaleY: 0.96, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    return g;
  }

  _renderBlob(g, cx, cy) {
    g.clear();
    g.fillStyle(COLORS.enemyRed, 0.08); g.fillCircle(cx, cy, 60);
    g.fillStyle(COLORS.enemyRed, 0.18); g.fillCircle(cx, cy, 46);
    g.fillStyle(COLORS.enemyRed, 0.35); g.fillCircle(cx, cy, 32);
    g.lineStyle(2, COLORS.enemyRed, 0.9); g.strokeCircle(cx, cy, 32);
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const r = 16 + rnd(0, 16);
      g.fillStyle(COLORS.enemyRed, Math.random() * 0.7);
      g.fillCircle(cx + Math.cos(a) * r, cy + Math.sin(a) * r, rnd(1, 3));
    }
    g.fillStyle(0xffffff, 0.9); g.fillCircle(cx - 9, cy - 5, 4); g.fillCircle(cx + 9, cy - 5, 4);
    g.fillStyle(COLORS.enemyRed, 1);  g.fillCircle(cx - 9, cy - 5, 2); g.fillCircle(cx + 9, cy - 5, 2);
  }

  // ── Player section (y: 234–438) ────────────────────────
  _buildPlayerSection() {
    this._sectionLabel(W / 2, 236, 'SQUAD', '#333355');

    this.add.text(W / 2, 252, this.player.name, {
      fontFamily: 'monospace', fontSize: '22px', color: '#00ff88', fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    this.add.text(W / 2, 278, this.player.cls, {
      fontFamily: 'monospace', fontSize: '14px', color: '#446644',
    }).setOrigin(0.5, 0);

    this._drawPlayerSprite(W / 2, 336);

    const bw = W - 60;

    // Integrity bar (y=370)
    this._barBg(30, 370, bw, 18);
    this.playerHpFill  = this.add.graphics();
    this.playerHpLabel = this.add.text(30 + bw / 2, 379, '', {
      fontFamily: 'monospace', fontSize: '13px', color: '#ffffff',
    }).setOrigin(0.5, 0.5).setDepth(1);

    // Energy bar (y=398)
    this._barBg(30, 398, bw, 14);
    this.playerEnFill  = this.add.graphics();
    this.playerEnLabel = this.add.text(30 + bw / 2, 405, '', {
      fontFamily: 'monospace', fontSize: '12px', color: '#ffffff',
    }).setOrigin(0.5, 0.5).setDepth(1);

    // Signal status
    this.statusText = this.add.text(30, 422, '', {
      fontFamily: 'monospace', fontSize: '14px', color: '#ffcc00',
    });

    this._divider(448);
    this._refreshPlayer();
  }

  _drawPlayerSprite(cx, cy) {
    const g = this.add.graphics();
    const s = 30;
    g.fillStyle(COLORS.green, 0.12); g.fillRect(cx - s, cy - s, s*2, s*2);
    g.lineStyle(2, COLORS.green, 0.85); g.strokeRect(cx - s, cy - s, s*2, s*2);
    g.lineStyle(1, COLORS.green, 0.35); g.strokeRect(cx - 22, cy - 22, 44, 44);
    g.lineStyle(1, COLORS.green, 0.3);
    g.lineBetween(cx - s, cy, cx - 22, cy); g.lineBetween(cx + 22, cy, cx + s, cy);
    g.lineBetween(cx, cy - s, cx, cy - 22); g.lineBetween(cx, cy + 22, cx, cy + s);
    g.fillStyle(COLORS.green, 0.9); g.fillRect(cx - 6, cy - 6, 12, 12);
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([dx,dy]) => {
      g.fillStyle(COLORS.green, 0.6); g.fillRect(cx + dx*26-2, cy + dy*26-2, 4, 4);
    });
    this.tweens.add({ targets: g, alpha: 0.75, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    return g;
  }

  // ── Log panel (y: 452–562) ─────────────────────────────
  _buildLogPanel() {
    const lx = 16, ly = 452, lw = W - 32, lh = 110;
    const bg = this.add.graphics();
    bg.fillStyle(COLORS.panel, 1); bg.fillRect(lx, ly, lw, lh);
    bg.lineStyle(1, COLORS.dim, 0.5); bg.strokeRect(lx, ly, lw, lh);
    this._sectionLabel(lx + 10, ly + 6, 'SYSTEM LOG', '#333355');

    this.logTextObjs = [];
    for (let i = 0; i < 3; i++) {
      this.logTextObjs.push(this.add.text(lx + 10, ly + 24 + i * 26, '', {
        fontFamily: 'monospace', fontSize: '16px', color: '#9999cc',
        wordWrap: { width: lw - 20 },
      }));
    }
  }

  // ── Buttons (y: 572–730) ──────────────────────────────
  _buildButtons() {
    const bw = (W - 48) / 2;
    const bh = 72;
    const startY = 572;
    const gap    = 10;

    const defs = [
      [
        { id: 'attack',    label: 'ATTACK',    sub: 'Basic · ~15 dmg',        color: COLORS.red    },
        { id: 'overclock', label: 'OVERCLOCK', sub: '~35 dmg · costs 20⚡',   color: COLORS.orange },
      ],
      [
        { id: 'defend',    label: 'DEFEND',    sub: 'Block 50% next hit',     color: COLORS.blue   },
        { id: 'item',      label: 'ITEM',      sub: 'None available',         color: COLORS.dim    },
      ],
    ];

    this.btnObjects = [];
    defs.forEach((row, ri) => {
      row.forEach((def, ci) => {
        const bx = 16 + ci * (bw + 16);
        const by = startY + ri * (bh + gap);

        const bg = this.add.graphics();
        bg.fillStyle(def.color, 0.15); bg.fillRoundedRect(0, 0, bw, bh, 8);
        bg.lineStyle(1, def.color, 0.6); bg.strokeRoundedRect(0, 0, bw, bh, 8);
        bg.setPosition(bx, by);

        const zone = this.add.zone(bx, by, bw, bh).setOrigin(0).setInteractive();
        zone.on('pointerdown', () => this.handleAction(def.id));
        zone.on('pointerover', () => bg.setAlpha(1.5));
        zone.on('pointerout',  () => bg.setAlpha(1.0));

        const hex = '#' + def.color.toString(16).padStart(6, '0');
        this.add.text(bx + bw / 2, by + 26, def.label, {
          fontFamily: 'monospace', fontSize: '18px', color: hex, fontStyle: 'bold',
        }).setOrigin(0.5, 0.5);
        this.add.text(bx + bw / 2, by + 50, def.sub, {
          fontFamily: 'monospace', fontSize: '12px', color: '#666688',
        }).setOrigin(0.5, 0.5);

        this.btnObjects.push({ bg, zone });
      });
    });
  }

  _buildTurnBanner() {
    this.turnBanner = this.add.text(W / 2, 558, '── YOUR TURN ──', {
      fontFamily: 'monospace', fontSize: '14px', color: '#446644',
    }).setOrigin(0.5, 0);
  }

  // ── UI helpers ─────────────────────────────────────────
  _sectionLabel(x, y, text, color) {
    return this.add.text(x, y, text, {
      fontFamily: 'monospace', fontSize: '13px', color,
    }).setOrigin(0.5, 0);
  }

  _barBg(x, y, w, h) {
    const g = this.add.graphics();
    g.fillStyle(0x111122, 1); g.fillRect(x, y, w, h);
    g.lineStyle(1, COLORS.dim, 0.4); g.strokeRect(x, y, w, h);
  }

  _divider(y) {
    const g = this.add.graphics();
    g.lineStyle(1, COLORS.dim, 0.35);
    g.lineBetween(20, y, W - 20, y);
  }

  // ── Refresh bar displays ────────────────────────────────
  _refreshEnemy() {
    const bw = W - 62;
    const ratio = Math.max(0, this.enemy.integrity / this.enemy.maxIntegrity);
    this.enemyHpFill.clear();
    this.enemyHpFill.fillStyle(COLORS.enemyRed, 0.85);
    this.enemyHpFill.fillRect(31, 183, (bw - 2) * ratio, 16);
    this.enemyHpLabel.setText(`INTEGRITY  ${this.enemy.integrity} / ${this.enemy.maxIntegrity}`);

    const aura = this.enemy.staticAura + this.enemy.staticStacks * 8;
    this.staticBadge.setText(`📡 STATIC AURA  −${aura}% SIGNAL`);
    this.staticBadge.setColor(this.enemy.staticStacks > 0 ? '#ff4444' : '#ff8844');
  }

  _refreshPlayer() {
    const bw = W - 62;

    const hpRatio = Math.max(0, this.player.integrity / this.player.maxIntegrity);
    this.playerHpFill.clear();
    this.playerHpFill.fillStyle(COLORS.green, 0.85);
    this.playerHpFill.fillRect(31, 371, (bw - 2) * hpRatio, 16);
    this.playerHpLabel.setText(`INTEGRITY  ${this.player.integrity} / ${this.player.maxIntegrity}`);

    const enRatio = Math.max(0, this.player.energy / this.player.maxEnergy);
    this.playerEnFill.clear();
    this.playerEnFill.fillStyle(COLORS.blue, 0.85);
    this.playerEnFill.fillRect(31, 399, (bw - 2) * enRatio, 12);
    this.playerEnLabel.setText(`ENERGY  ${this.player.energy} / ${this.player.maxEnergy}`);

    const effSig = Math.max(10, this.player.signal - this.enemy.staticAura - this.enemy.staticStacks * 8);
    const defending = this.player.isDefending ? '   🛡 DEFENDING' : '';
    this.statusText.setText(`SIGNAL ${effSig}%${defending}`);
    this.statusText.setColor(effSig < 50 ? '#ff4444' : '#ffcc00');
  }

  // ── Log ────────────────────────────────────────────────
  pushLog(msg) {
    this.logLines.push(msg);
    const recent = this.logLines.slice(-3);
    this.logTextObjs.forEach((t, i) => t.setText(recent[i] || ''));
  }

  // ── Button enable/disable ──────────────────────────────
  _setButtons(enabled) {
    this.btnObjects.forEach(({ bg, zone }) => {
      bg.setAlpha(enabled ? 1 : 0.35);
      enabled ? zone.setInteractive() : zone.disableInteractive();
    });
    this.turnBanner.setColor(enabled ? '#446644' : '#222233');
    this.turnBanner.setText(enabled ? '── YOUR TURN ──' : '── PROCESSING ──');
  }

  // ── Player action ──────────────────────────────────────
  handleAction(id) {
    if (this.state !== STATE.PLAYER_TURN) return;

    const effSignal = Math.max(10, this.player.signal - this.enemy.staticAura - this.enemy.staticStacks * 8);

    if (id === 'item') {
      this.pushLog('> No items in this build.');
      return;
    }

    this.state = STATE.ANIMATING;
    this._setButtons(false);
    this.player.isDefending = false;

    if (id === 'attack') {
      if (!hits(effSignal)) {
        this.pushLog(`> ATTACK ··· [MISS]  Lost in static.`);
      } else {
        const dmg = rnd(12, 18);
        this.enemy.integrity = Math.max(0, this.enemy.integrity - dmg);
        this.pushLog(`> ATTACK → −${dmg} integrity`);
        this._flashEnemy();
      }

    } else if (id === 'overclock') {
      if (this.player.energy < 20) {
        this.pushLog(`> OVERCLOCK failed — need 20 energy`);
        this.state = STATE.PLAYER_TURN;
        this._setButtons(true);
        return;
      }
      this.player.energy -= 20;
      if (!hits(effSignal)) {
        const bleed = 5;
        this.player.integrity = Math.max(0, this.player.integrity - bleed);
        this.pushLog(`> OVERCLOCK [MISS]  Thermal bleed −${bleed}`);
      } else {
        const dmg     = rnd(28, 38);
        const selfDmg = 10;
        this.enemy.integrity  = Math.max(0, this.enemy.integrity  - dmg);
        this.player.integrity = Math.max(0, this.player.integrity - selfDmg);
        this.pushLog(`> OVERCLOCK → −${dmg} · self −${selfDmg}`);
        this._flashEnemy();
      }

    } else if (id === 'defend') {
      this.player.isDefending = true;
      this.pushLog(`> DEFEND — bracing for impact`);
    }

    this._refreshEnemy();
    this._refreshPlayer();

    if (this.enemy.integrity  <= 0) { this.time.delayedCall(500, () => this._endBattle(true));  return; }
    if (this.player.integrity <= 0) { this.time.delayedCall(500, () => this._endBattle(false)); return; }

    this.time.delayedCall(700, () => this._enemyTurn());
  }

  // ── Enemy turn ─────────────────────────────────────────
  _enemyTurn() {
    this.state = STATE.ENEMY_TURN;
    this.turnBanner.setText('── ENEMY TURN ──').setColor('#441111');

    const done = () => {
      this._refreshPlayer();
      this._refreshEnemy();
      if (this.player.integrity <= 0) { this.time.delayedCall(400, () => this._endBattle(false)); return; }
      this.turn++;
      this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + 5);
      this.player.isDefending = false;
      this._refreshPlayer();
      this.state = STATE.PLAYER_TURN;
      this._setButtons(true);
      this.pushLog(`── Turn ${this.turn} · Your move ──`);
    };

    const roll = Math.random();

    if (roll < 0.50) {
      const raw = rnd(8, 14);
      const dmg = this.player.isDefending ? Math.ceil(raw * 0.5) : raw;
      this.player.integrity = Math.max(0, this.player.integrity - dmg);
      const tag = this.player.isDefending ? ' [BLOCKED]' : '';
      this.pushLog(`> Blob attacks${tag} → −${dmg} integrity`);
      this._flashPlayer();
      this.time.delayedCall(600, done);

    } else if (roll < 0.80) {
      this.enemy.staticStacks = Math.min(3, this.enemy.staticStacks + 1);
      const total = this.enemy.staticAura + this.enemy.staticStacks * 8;
      this.pushLog(`> STATIC BURST! Your signal now −${total}%`);
      this.time.delayedCall(600, done);

    } else {
      const d1 = rnd(5, 10), d2 = rnd(5, 10);
      const dmg = this.player.isDefending ? Math.ceil((d1+d2)*0.5) : d1+d2;
      this.player.integrity = Math.max(0, this.player.integrity - dmg);
      this.pushLog(`> DOUBLE PULSE → −${dmg} integrity`);
      this._flashPlayer();
      this.time.delayedCall(600, done);
    }
  }

  // ── Flash effects ──────────────────────────────────────
  _flashEnemy()  { this.tweens.add({ targets: this.enemySprite, alpha: 0.2, duration: 80, yoyo: true, repeat: 2 }); }
  _flashPlayer() { this.cameras.main.flash(120, 255, 50, 50, false); }

  // ── End screen ─────────────────────────────────────────
  _endBattle(victory) {
    this.state = victory ? STATE.VICTORY : STATE.DEFEAT;
    this._setButtons(false);

    const ov = this.add.graphics();
    ov.fillStyle(0x000000, 0.82); ov.fillRect(0, 0, W, H);

    const icon  = victory ? '✅' : '💀';
    const title = victory ? 'SYSTEM RESTORED' : 'INTEGRITY FAILURE';
    const body  = victory
      ? 'Channel 1 cleared.\n+50 XP  ·  +10 Autonomy'
      : 'Threadling disconnected.\nBreach uncontained.';
    const titleColor = victory ? '#00ff88' : '#ff3355';

    this.add.text(W/2, H/2 - 110, icon,  { fontSize: '52px' }).setOrigin(0.5);
    this.add.text(W/2, H/2 -  48, title, { fontFamily: 'monospace', fontSize: '24px', color: titleColor, fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(W/2, H/2 +   8, body,  { fontFamily: 'monospace', fontSize: '17px', color: '#aaaacc', align: 'center' }).setOrigin(0.5);

    // Retry button
    const rbg = this.add.graphics();
    rbg.fillStyle(COLORS.green, 0.15); rbg.fillRoundedRect(W/2 - 100, H/2 + 90, 200, 56, 10);
    rbg.lineStyle(2, COLORS.green, 0.8); rbg.strokeRoundedRect(W/2 - 100, H/2 + 90, 200, 56, 10);
    this.add.text(W/2, H/2 + 118, 'RETRY MISSION', { fontFamily: 'monospace', fontSize: '17px', color: '#00ff88', fontStyle: 'bold' }).setOrigin(0.5);
    const zone = this.add.zone(W/2 - 100, H/2 + 90, 200, 56).setOrigin(0).setInteractive();
    zone.on('pointerdown', () => this.scene.restart());
  }
}

// ── Phaser config ──────────────────────────────────────────
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
  input: { activePointers: 2 },
});
