import {DrawComponent} from "@/core/DrawComponent";
import {prob, rnd, rndchoice} from "@/utils";
import {Subscriptions} from "@/core/Subscriptions";

/**
 * wiggling worms near puddles when raining
 */
export class WormsComponent extends DrawComponent {
  /** @type{Array<Object>} */
  _worms = [];

  static COMPONENT_NAME = "WormsComponent";

  getName() {
    return WormsComponent.COMPONENT_NAME;
  }

  initialise() {
    this.eventBus.subscribe(Subscriptions.onSeasonChange(this.getName(), this._generateWorms.bind(this)));
    this.eventBus.subscribe(Subscriptions.onWeatherChange(this.getName(), this._generateWorms.bind(this)));

    this._generateWorms();
  }

  /**
   * generate the _worms array
   */
  _generateWorms() {
    const {weather, season, puddles} = this.scene;

    this._worms.length = 0;

    if (weather !== 'rain' && weather !== 'storm') return;
    if (season !== 'spring' && season !== 'summer') return;

    const k = weather === 'storm' ? 3 : 1;

    this._worms = Array.from({length: k + rnd(4)}, (_, i) => {
      // get a random puddle
      const pd = rndchoice(puddles);

      const p = prob(0.5);
      return {
        alpha: pl => Math.min(1, (pl - 0.3) / 0.4), // fade-in,
        x: f => pd.x + Math.sin(f * 0.008 + i * 2.1) * (pd.maxRx * 0.6),
        y: _ => pd.y + 6,
        wiggle: f => f * 0.04 + i * 1.3,
        stroke: p ? '#c06080' : '#9060a0',
        fill: p ? '#d07090' : '#a070b0',
      };
    });
  }

  isEnabled() {
    // only appear once puddles are established
    return this.scene.puddleLevel > 0.3;
  }

  draw() {
    const {ctx} = this;
    const {frame} = this.scene;

    this._worms.forEach(w => {
      const alpha = w.alpha(this.scene.puddleLevel);
      const wormX = w.x(frame);
      const wormY = w.y(frame);
      const wiggle = w.wiggle(frame);

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
