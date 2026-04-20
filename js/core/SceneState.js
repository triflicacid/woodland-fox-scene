import {PALETTES, FOX} from '../config.js';
import {rnd, rndf, prob, lerp, clamp, eo} from '../utils.js';

/**
 * SceneState manages the mutable state of the scene:
 * environment (season, weather, time), and all entity states.
 */
export class SceneState {
  /**
   * @param {number} W - canvas width
   * @param {number} H - canvas height
   */
  constructor(W, H) {
    this.W = W;
    this.H = H;

    this.season = localStorage.getItem('season') || 'summer';
    this.timeOfDay = localStorage.getItem('tod') || 'night';
    this.weather = localStorage.getItem('weather') || 'clear';
    this.auroraOn = false;

    // prevent invalid combos on first load
    if (this.weather === 'snow' && this.season !== 'winter') this.weather = 'clear';

    this.todBlend = this.timeOfDay === 'day' ? 1 : 0;
    this.todTarget = this.timeOfDay === 'day' ? 1 : 0;

    // global animation frame counter
    this.frame = 0;

    this.seasonLeafActive = false;
    this.seasonLeaves = Array.from({length: 40}, () => ({
      x: rnd(W), y: -rnd(200),
      vx: rndf(1.5), vy: 1.5 + rnd(2),
      rot: rnd(Math.PI * 2), drot: 0.04 + rnd(0.08),
      hue: 20 + rnd(30), life: 0,
    }));

    // fox state
    this.fox = {
      x: FOX.X,
      y: H * FOX.Y_FRACTION,
      phase: 'idle',
      phaseT: 0,
      poseBlend: 0,
      stretchBlend: 0,
      spinAngle: 0,
      tailWag: 0,
      wanderX: FOX.X,
      rainTuck: 0,
      breathT: 0,
      yawnT: -1,
      grumbleT: -1,
      earTwitchT: -1,
      earTwitchSide: 0,
      snowLevel: 0,
      shiverT: 0,
    };

    // bunny state
    this.bunny = {
      x: -80,
      meetX: FOX.X - 80,
      y: H * FOX.Y_FRACTION,
      phase: 'off',
      phaseT: 0,
      hop: {arc: 0, from: -80, to: -80, frame: 1, t: 0},
    };

    // contains heart particles
    this.hearts = [];

    // deer state
    this.deer = {
      x: W + 80,
      phase: 'off',
      phaseT: 0,
      cooldown: 0,
    };

    // hedgehog state
    this.hog = {
      x: -60,
      phase: 'off',
      phaseT: 0,
    };

    // birds/owl state
    this.owlForced = false;
    this.windWasOn = false;
    this.windStartledBirds = [];

    this.owl = {
      headAngle: 0,
      headTarget: 0,
      headTimer: 0,
      blinkT: -1,
      treeIdx: 6,
    };

    // active lightning bolts
    this.bolts = [];

    this.puddleLevel = 0;

    // aurora bands
    this.auroraBands = Array.from({length: 6}, (_, i) => ({
      phase: i * Math.PI * 0.35,
      amp: 25 + rnd(45),
      freq: 0.003 + rnd(0.003),
      hue: i % 2 === 0 ? 45 + rnd(20) : 270 + rnd(40),
      alpha: 0.10 + rnd(0.10),
      width: 70 + rnd(70),
      y: H * 0.07 + i * H * 0.07,
    }));

    // woodsmoke
    this.smoke = Array.from({length: 12}, (_, i) => this._makeSmoke(i));

    // rain/snow/fog/wind particles
    this.raindrops = Array.from({length: 200}, () => this._makeRain());
    this.weatherSnow = Array.from({length: 120}, () => this._makeSnow());
    this.fogParticles = Array.from({length: 14}, (_, i) => ({
      x: (i / 14) * W * 1.3 - W * 0.15,
      y: H * 0.3 + rnd(H * 0.4),
      w: 100 + rnd(200),
      h: 45 + rnd(65),
      speed: 0.15 + rnd(0.2),
      alpha: 0.04 + rnd(0.06),
    }));
    this.windDebris = Array.from({length: 50}, () => this._makeWind());

    // fallen canopy leaves (autumn wind)
    this.canopyLeaves = Array.from({length: 30}, () => this._makeCanopyLeaf());

    // ground decoration
    this.fallenLeaves = Array.from({length: 80}, () => ({
      x: rnd(W),
      y: H * 0.62 + rnd(H * 0.25),
      size: 3 + rnd(4),
      rot: rnd(Math.PI * 2),
      hueOff: rndf(10),
    }));
    this.puddles = Array.from({length: 5}, (_, i) => ({
      x: 120 + i * 110,
      y: H * 0.68 + rnd(H * 0.1),
      rx: 0, maxRx: 20 + rnd(25),
      ry: 0, maxRy: 5 + rnd(4),
    }));

    // birds
    this.perchBirds = Array.from({length: 5}, (_, i) => ({
      treeIdx: [0, 2, 6, 7, 1][i],
      offset: [-0.7, -0.6, -0.55, -0.65, -0.5][i],
      side: [1, -1, 1, -1, 1][i],
    }));
    this.flockBirds = Array.from({length: 12}, () => ({
      x: rnd(W),
      y: 20 + rnd(H * 0.25),
      vx: 0.4 + rnd(0.5),
      vy: 0,
      flapT: rnd(Math.PI * 2),
      flapSpeed: 0.08 + rnd(0.04),
      scale: 0.7 + rnd(0.5),
    }));
    this.bats = Array.from({length: 6}, () => ({
      x: rnd(W),
      y: 40 + rnd(H * 0.3),
      vx: (0.8 + rnd(0.6)) * (prob(0.5) ? 1 : -1),
      flapT: rnd(Math.PI * 2),
      flapSpeed: 0.14 + rnd(0.06),
    }));

    // butterflies
    this.butterflies = Array.from({length: 5}, (_, i) => ({
      x: 100 + i * 120,
      y: H * 0.3 + rnd(H * 0.2),
      vx: 0.5 + rnd(0.4),
      flapT: rnd(Math.PI * 2),
      col: `hsl(${[280, 320, 40, 200, 160][i]},70%,65%)`,
    }));

    // fireflies
    this.fireflies = Array.from({length: 18}, () => ({
      x: 80 + rnd(W - 160),
      y: H * 0.35 + rnd(H * 0.3),
      speed: 0.3 + rnd(0.4),
      angle: rnd(Math.PI * 2),
      phase: rnd(Math.PI * 2),
      size: 1.5 + rnd(1.5),
    }));
  }

  /**
   * create a new raindrop particle (or reset an existing one).
   * @returns {Object}
   */
  _makeRain() {
    return {x: rnd(this.W), y: rnd(this.H), len: 8 + rnd(14), speed: 12 + rnd(8)};
  }

  /**
   * reset a raindrop to the top of the canvas.
   * @param {Object} p - existing particle
   * @returns {Object}
   */
  resetRain(p) {
    p.x = rnd(this.W);
    p.y = rnd(this.H);
    p.len = 8 + rnd(14);
    p.speed = 12 + rnd(8);
    return p;
  }

  /**
   * create a new snowflake particle.
   * @returns {Object}
   */
  _makeSnow() {
    return {
      x: rnd(this.W), y: -10 - rnd(this.H),
      size: 1.5 + rnd(3), speed: 0.5 + rnd(0.8),
      phase: rnd(Math.PI * 2),
    };
  }

  /**
   * reset a snowflake to the top of the canvas.
   * @param {Object} p
   * @returns {Object}
   */
  resetSnow(p) {
    p.x = rnd(this.W);
    p.y = -10 - rnd(this.H);
    p.size = 1.5 + rnd(3);
    p.speed = 0.5 + rnd(0.8);
    p.phase = rnd(Math.PI * 2);
    return p;
  }

  /**
   * create a new wind-debris particle.
   * @returns {Object}
   */
  _makeWind() {
    return {
      x: -30 - rnd(100),
      y: this.H * 0.2 + rnd(this.H * 0.7),
      vx: 4 + rnd(3),
      vy: rndf(0.5),
      len: 12 + rnd(22),
      alpha: 0.2 + rnd(0.4),
    };
  }

  /**
   * reset a wind-debris particle off the left edge.
   * @param {Object} p
   * @returns {Object}
   */
  resetWind(p) {
    p.x = -30 - rnd(100);
    p.y = this.H * 0.2 + rnd(this.H * 0.7);
    p.vx = 4 + rnd(3);
    p.vy = rndf(0.5);
    p.len = 12 + rnd(22);
    p.alpha = 0.2 + rnd(0.4);
    return p;
  }

  /**
   * create or reset a canopy-leaf particle.
   * @param {Array} trees - tree definitions array (needed for source position)
   * @returns {Object}
   */
  makeCanopyLeaf(trees) {
    const candidates = [trees[0], trees[2], trees[6], trees[7]];
    const tr = candidates[Math.floor(rnd(4))];
    return {
      x: tr.x + rndf(tr.r),
      y: this.H * 0.62 - tr.h * 0.5,
      vx: rndf(1.5),
      vy: 0.3 + rnd(0.8),
      rot: rnd(Math.PI * 2),
      drot: rndf(0.08),
      hue: 15 + rnd(30),
      active: false,
      timer: rnd(300) | 0,
    };
  }

  /**
   * create a canopy leaf without tree data (used at init before trees are set up).
   * @returns {Object}
   */
  _makeCanopyLeaf() {
    return {
      x: rnd(this.W), y: this.H * 0.62,
      vx: rndf(1.5), vy: 0.3 + rnd(0.8),
      rot: rnd(Math.PI * 2), drot: rndf(0.08),
      hue: 15 + rnd(30), active: false, timer: rnd(300) | 0,
    };
  }

  /**
   * create or reset a smoke particle.
   * @param {number} [i=0] - index used to stagger particles vertically
   * @returns {Object}
   */
  _makeSmoke(i = 0) {
    return {
      x: 640 + rndf(3),
      y: this.H * 0.62 - 50 - i * 8,
      vx: rndf(0.3) + 0.2,
      vy: -0.4 - rnd(0.3),
      size: 4 + i * 1.5,
      alpha: 0.18 - i * 0.013,
      life: 0,
    };
  }

  /**
   * reset an existing smoke particle.
   * @param {Object} p
   * @param {number} [i=0]
   * @returns {Object}
   */
  resetSmoke(p, i = 0) {
    p.x = 640 + rndf(3);
    p.y = this.H * 0.62 - 50 - i * 8;
    p.vx = rndf(0.3) + 0.2;
    p.vy = -0.4 - rnd(0.3);
    p.size = 4 + i * 1.5;
    p.alpha = 0.18 - i * 0.013;
    p.life = 0;
    return p;
  }

  /**
   * return the palette for the current season.
   * @returns {Object}
   */
  pal() {
    return PALETTES[this.season];
  }

  /**
   * persist environment prefs to localStorage.
   */
  savePref() {
    localStorage.setItem('season', this.season);
    localStorage.setItem('tod', this.timeOfDay);
    localStorage.setItem('weather', this.weather);
  }

  /**
   * change the time of day and start blend animation.
   * @param {string} v - 'day' or 'night'
   */
  setTOD(v) {
    this.timeOfDay = v;
    this.todTarget = v === 'day' ? 1 : 0;
    this.savePref();
  }

  /**
   * change the current season, triggering leaf transition if relevant.
   * @param {string} s - season name
   */
  changeSeason(s) {
    if (s === this.season) return;
    this.prevSeason = this.season;
    this.season = s;
    if (this.weather === 'snow' && s !== 'winter') this.weather = 'clear';
    if (this.auroraOn && (s !== 'winter' || this.timeOfDay !== 'night')) this.auroraOn = false;
    if (s === 'spring' || s === 'autumn') {
      this.seasonLeafActive = true;
      this.seasonLeaves.forEach(l => {
        l.x = rnd(this.W);
        l.y = -rnd(200);
        l.life = 0;
        l.vy = 1.5 + rnd(2);
        l.hue = s === 'spring' ? 300 + rnd(60) : 15 + rnd(30);
      });
    }
    this.savePref();
  }

  /**
   * start a bunny hop from one x position to another.
   * @param {number} f - from x
   * @param {number} t - to x
   * @param {number} fr - frame duration of hop
   */
  startHop(f, t, fr) {
    this.bunny.hop.from = f;
    this.bunny.hop.to = t;
    this.bunny.hop.frame = fr;
    this.bunny.hop.t = 0;
  }

  /**
   * advance the bunny hop by one frame.
   * @returns {boolean} true when the hop is complete
   */
  tickHop() {
    const hop = this.bunny.hop;
    hop.t++;
    const p = clamp(hop.t / hop.frame, 0, 1);
    hop.arc = (p * Math.max(1, Math.round(Math.abs(hop.to - hop.from) / 55))) % 1;
    this.bunny.x = lerp(hop.from, hop.to, eo(p));
    return p >= 1;
  }
}
