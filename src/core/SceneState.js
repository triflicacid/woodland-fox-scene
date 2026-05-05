import {PALETTES, TOD_BLEND} from '@/config';
import {rnd} from '@/utils';
import {TREE_DEFS} from "@/components/TreeComponent";

/**
 * manages the shared state of the scene.
 * most state is kept to individual components unless it is needed by multiple.
 */
export class SceneState {
  /** @type{string} */
  season;
  /** @type{string} */
  timeOfDay;
  /** @type{string} */
  prevTimeOfDay;
  /** @type{number} */
  todBlend;
  /** @type{number} */
  todTarget;
  /** @type{string} */
  weather;
  /** @type{string | null} */
  specialEvent;
  /** @type{boolean} */
  stargazing;
  /** @type{number} */
  moonPhase;

  /**
   * @param {number} W - canvas width
   * @param {number} H - canvas height
   */
  constructor(W, H) {
    this.W = W;
    this.H = H;

    // global animation frame counter
    this.frame = 0;

    // y-position of ground
    this.groundY = this.H * 0.62;

    // fox position (default, not updated)
    this.fox = {
      x: 350,
      y: this.groundY + (0.02 * this.H),
    };

    // tree definitions
    this.trees = TREE_DEFS;
    this.trees.forEach(t => {
      t.y = this.groundY;
    });

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
   * change the time of day and start blend animation.
   * @param {string} v - 'day' or 'night'
   */
  setTOD(v) {
    if (!this.timeOfDay) { // if no previous value, set them up
      this.prevTimeOfDay = this.timeOfDay = v;
      this.todBlend = this.todTarget = TOD_BLEND[v];
    } else {
      this.prevTimeOfDay = this.timeOfDay;
      this.timeOfDay = v;
      this.todTarget = TOD_BLEND[v];
    }
  }

  /**
   * change the current season, triggering leaf transition if relevant.
   * @param {string} s - season name
   */
  changeSeason(s) {
    if (s === this.season) return;
    this.season = s;
    if (this.weather === 'snow' && s !== 'winter') this.weather = 'clear';
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

    // weather
    if (this.weather === 'snow' && this.season !== 'winter') {
      this.weather = 'clear';
    }
  }
}
