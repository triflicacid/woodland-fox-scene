import {PALETTES} from '@/config';
import {clamp, eo, lerp, rnd} from '@/utils';
import {FOX} from "@/components/animals/FoxComponent";
import {TREE_DEFS} from "@/components/TreeComponent";

/**
 * manages the shared state of the scene.
 * most state is kept to individual components unless it is needed by multiple.
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
    if (this.specialEvent === 'null') this.specialEvent = null;
    /** @type{boolean} */
    this.stargazing = localStorage.getItem('stargazing') === 'true';
    /** @type{number} */
    this.moonPhase = parseInt(localStorage.getItem('moon_phase') ?? '4'); // default full

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
      asleep: true, // used for Zs and default eye state (open/closed)
      eyeTransitionT: -1,
      singingMouthT: 0,
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

    this.puddleLevel = 0;

    // tree definitions
    this.trees = TREE_DEFS;

    // ground decoration
    this.puddles = Array.from({length: 5}, (_, i) => ({
      x: 120 + i * 110,
      y: H * 0.68 + rnd(H * 0.1),
      rx: 0, maxRx: 20 + rnd(25),
      ry: 0, maxRy: 5 + rnd(4),
    }));

    // the bonfire
    this.bonfire = {
      x: 220,
      y_fraction: 0.72,
    };
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
    localStorage.setItem('moon_phase', this.moonPhase.toString());
    localStorage.setItem('stargazing', this.stargazing.toString());
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

  /**
   * clears out specialEvent if now invalid
   */
  clearInvalidSpecialEvent() {
    if (this.specialEvent === 'halloween' && !(this.season === 'autumn' && this.timeOfDay === 'night')) {
      this.specialEvent = null;
    } else if (this.specialEvent === 'christmas' && this.season !== 'winter') {
      this.specialEvent = null;
    } else if (this.specialEvent === 'bonfire' && !(this.season === 'autumn' && this.timeOfDay === 'night')) {
      this.specialEvent = null;
    } else if (this.specialEvent === 'easter' && !(this.season === 'spring' && this.timeOfDay === 'day')) {
      this.specialEvent = null;
    }
  }
}
