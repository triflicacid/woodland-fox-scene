import {FOX, PALETTES} from '@/config';
import {clamp, eo, lerp, rnd, rndf} from '@/utils';

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

    /** @type{string} */
    this.season = localStorage.getItem('season') || 'summer';
    /** @type{string} */
    this.timeOfDay = localStorage.getItem('tod') || 'night';
    /** @type{string} */
    this.weather = localStorage.getItem('weather') || 'clear';
    /** @type{string | null} */
    this.specialEvent = localStorage.getItem('special_event') || null;

    // prevent invalid combos on first load
    if (this.weather === 'snow' && this.season !== 'winter') this.weather = 'clear';

    this.todBlend = this.timeOfDay === 'day' ? 1 : 0;
    this.todTarget = this.timeOfDay === 'day' ? 1 : 0;

    // global animation frame counter
    this.frame = 0;

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

    // birds/owl state
    this.owlForced = false;

    // active lightning bolts
    this.bolts = [];

    this.puddleLevel = 0;

    // woodsmoke
    this.smoke = Array.from({length: 12}, (_, i) => this._makeSmoke(i));

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
   * are we currently in night-time?
   */
  isNight() {
    return this.todBlend < 0.8;
  }

  /**
   * are we currently in day-time?
   * (note the overlap with `isNight`; this is because we also count transitioning)
   */
  isDay() {
    return this.todBlend > 0.2;
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
    localStorage.setItem('special_event', this.specialEvent);
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
    this.season = s;
    if (this.weather === 'snow' && s !== 'winter') this.weather = 'clear';
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
