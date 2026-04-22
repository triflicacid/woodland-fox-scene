import {DrawComponent} from "@/core/DrawComponent";
import {rnd} from "@/utils";

/**
 * render snowflakes during snowfall
 */
export class SnowflakesComponent extends DrawComponent {
  /** @type{Array<Object>} */
  snowflakes;

  /**
   * make a new snowflake object
   * @returns {Object}
   */
  _makeSnowflake() {
    return {
      x: rnd(this.W),
      y: -10 - rnd(this.H),
      size: 1.5 + rnd(3),
      speed: 0.5 + rnd(0.8),
      phase: rnd(Math.PI * 2),
    };
  }

  initialise(state) {
    this.snowflakes = Array.from({length: 120}, () => this._makeSnowflake());
  }

  isEnabled(state) {
    return state.weather === 'snow';
  }

  tick(state, setStatus, enableButtons) {
    const {H} = this;
    const {frame} = state;
    this.snowflakes.forEach(sf => {
      sf.y += sf.speed;
      sf.x += Math.sin(frame * 0.02 + sf.phase) * 0.5;
      if (sf.y > H) Object.assign(sf, this._makeSnowflake());
    });
  }

  draw(state) {
    const {ctx} = this;
    this.snowflakes.forEach(sf => {
      ctx.save();
      ctx.globalAlpha = 0.75;
      ctx.fillStyle = '#e8f0ff';
      ctx.shadowBlur = 3;
      ctx.shadowColor = '#fff';
      ctx.beginPath();
      ctx.arc(sf.x, sf.y, sf.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }}
