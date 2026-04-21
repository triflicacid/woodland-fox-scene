import {DrawComponent} from "../../../core/DrawComponent.js";
import {Events} from "../../../event/Events.js";
import {prob, rnd, rndchoice} from "../../../utils.js";

/**
 * wiggling worms near puddles when raining
 */
export class WormsComponent extends DrawComponent {
  /** @type{Array<Object>} */
  _worms = [];

  initialise(state) {
    this.eventBus.subscribe(Events.seasonChangeSubscription("WormsComponent", this._onSeasonOrWeatherChange.bind(this)));
    this.eventBus.subscribe(Events.weatherChangeSubscription("WormsComponent", this._onSeasonOrWeatherChange.bind(this)));

    this._generateWorms(state);
  }

  /**
   * @param {ValueChange<string>} update
   */
  _onSeasonOrWeatherChange(update) {
    this._generateWorms(update.state);
  }

  /**
   * generate the _worms array
   * @param {SceneState} state
   */
  _generateWorms(state) {
    const {weather, season} = state;

    this._worms.length = 0;

    if (weather !== 'rain' && weather !== 'storm') return;
    if (season !== 'spring' && season !== 'summer') return;

    const k = weather === 'storm' ? 3 : 1;

    this._worms = Array.from({length: k + rnd(4)}, (_, i) => {
      // get a random puddle
      const pd = rndchoice(state.puddles);

      const p = prob(0.5);
      return {
        alpha: st => Math.min(1, (st.puddleLevel - 0.3) / 0.4), // fade-in,
        x: st => pd.x + Math.sin(st.frame * 0.008 + i * 2.1) * (pd.maxRx * 0.6),
        y: _ => pd.y + 6,
        wiggle: st => st.frame * 0.04 + i * 1.3,
        stroke: p ? '#c06080' : '#9060a0',
        fill: p ? '#d07090' : '#a070b0',
      };
    });
  }

  isEnabled(state) {
    // only appear once puddles are established
    return state.puddleLevel > 0.3;
  }

  draw(state) {
    const {ctx} = this;
    this._worms.forEach(w => {
      const alpha = w.alpha(state);
      const wormX = w.x(state);
      const wormY = w.y(state);
      const wiggle = w.wiggle(state);

      ctx.save();
      ctx.globalAlpha = 0.82 * alpha;
      ctx.strokeStyle = w.stroke;
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // draw worm as a short wiggly path of segments
      ctx.beginPath();
      const len = 18; // half-length in pixels
      ctx.moveTo(wormX - len, wormY + Math.sin(wiggle) * 3);
      for (let sx = -len + 4; sx <= len; sx += 4) {
        const sy = wormY + Math.sin(wiggle + sx * 0.22) * 3.5;
        ctx.lineTo(wormX + sx, sy);
      }
      ctx.stroke();

      // rounded head
      const headX = wormX + len + Math.cos(wiggle) * 1.5;
      const headY = wormY + Math.sin(wiggle + len * 0.22) * 3.5;
      ctx.fillStyle = w.fill;
      ctx.beginPath();
      ctx.arc(headX, headY, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }
}
