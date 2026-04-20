import {rnd, rndf, prob} from '../utils.js';
import {PROBABILITY} from '../config.js';
import {Component} from '../core/component.js';

/**
 * DrawWeather handles rendering lightning bolts.
 * This is separated from DrawWeather so bolts are more in the background.
 */
export class DrawLightning extends Component {
  /**
   * @param {EventBus} eventBus
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} W
   * @param {number} H
   */
  constructor(eventBus, ctx, W, H) {
    super(eventBus);
    this.ctx = ctx;
    this.W = W;
    this.H = H;
  }

  draw(state) {
    const {weather} = state;
    if (weather === 'storm') this._drawLightning(state);
  }

  tick(state, _1, _2) {
    const {weather} = state;
    if (weather === 'storm') this._tickLightning(state);
  }

  /**
   * draw all active bolts and a combined canvas flash.
   * @param {SceneState} state
   */
  _drawLightning(state) {
    const {ctx, W, H} = this;
    if (!state.bolts.length) return;

    // single canvas flash driven by the brightest active bolt
    const maxFade = Math.max(...state.bolts.map(b => 1 - b.t / 8));
    const hasSuper = state.bolts.some(b => b.superBolt);
    ctx.fillStyle = `rgba(200,220,255,${(hasSuper ? 0.25 : 0.15) * maxFade})`;
    ctx.fillRect(0, 0, W, H);

    state.bolts.forEach(bolt => {
      const fade = 1 - bolt.t / 8;

      // core bolt
      ctx.strokeStyle = bolt.superBolt
          ? `rgba(240,245,255,${fade})`
          : `rgba(220,230,255,${fade})`;
      ctx.lineWidth = bolt.superBolt ? 3 : 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      bolt.path.forEach(([lx, ly], i) => i === 0 ? ctx.moveTo(lx, ly) : ctx.lineTo(lx, ly));
      ctx.stroke();

      // wide glow
      ctx.strokeStyle = bolt.superBolt
          ? `rgba(235,210,255,${0.6 * fade})`
          : `rgba(180,200,255,${0.4 * fade})`;
      ctx.lineWidth = bolt.superBolt ? 16 : 8;
      ctx.beginPath();
      bolt.path.forEach(([lx, ly], i) => i === 0 ? ctx.moveTo(lx, ly) : ctx.lineTo(lx, ly));
      ctx.stroke();
    });
  }

  /**
   * randomly spawn new bolts and advance existing ones.
   * @param {SceneState} state
   */
  _tickLightning(state) {
    const {H} = this;

    // chance to spawn a new bolt each frame
    if (prob(PROBABILITY.LIGHTNING)) {
      const superBolt = prob(PROBABILITY.SUPER_BOLT);
      const spread = superBolt ? 70 : 40;
      const path = [];
      let lx = 200 + rnd(300), ly = 0;
      while (ly < H * 0.65) {
        path.push([lx, ly]);
        lx += rndf(spread);
        ly += 20 + rnd(20);
      }
      state.bolts.push({path, t: 0, superBolt});
    }

    // advance all bolts, remove expired ones
    state.bolts.forEach(b => b.t++);
    state.bolts = state.bolts.filter(b => b.t < 8);
  }
}