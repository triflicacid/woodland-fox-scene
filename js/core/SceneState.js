import {PALETTES, TOD_BLEND} from '@/config';
import {rnd} from '@/utils';
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
    this.timeOfDay = this.prevTimeOfDay = localStorage.getItem('tod') || 'night';
    this.todBlend = this.todTarget = TOD_BLEND[this.timeOfDay];
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

    // global animation frame counter
    this.frame = 0;

    // y-position of ground
    this.groundY = this.H * 0.62;

    // fox position (default, not updated)
    this.fox = {
      x: 350,
      y: 0.64 * this.H,
    };

    // tree definitions
    this.trees = TREE_DEFS;

    this.clearInvalidStates();
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
    this.prevTimeOfDay = this.timeOfDay;
    this.timeOfDay = v;
    this.todTarget = TOD_BLEND[v];
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
   * correct any invalid states
   */
  clearInvalidStates() {
    // special events
    if (this.specialEvent === 'halloween' && !(this.season === 'autumn' && this.timeOfDay === 'night')) {
      this.specialEvent = null;
    } else if (this.specialEvent === 'christmas' && this.season !== 'winter') {
      this.specialEvent = null;
    } else if (this.specialEvent === 'bonfire' && !(this.season === 'autumn' && this.timeOfDay === 'night')) {
      this.specialEvent = null;
    } else if (this.specialEvent === 'easter' && !(this.season === 'spring' && this.timeOfDay === 'night')) {
      this.specialEvent = null;
    } else if (this.specialEvent === 'eclipse' && this.timeOfDay !== 'day') {
      this.specialEvent = null;
    }

    // stargazing
    if (this.stargazing && (this.timeOfDay !== 'night' || this.specialEvent !== null)) {
      this.stargazing = false;
    }
  }
}
