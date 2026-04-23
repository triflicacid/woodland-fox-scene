import {rnd, rndf} from '@/utils';
import {DrawComponent} from "@/core/DrawComponent";
import {Subscriptions} from "@/core/Subscriptions";

/**
 * render floating ghosts during Halloween
 */
export class GhostsComponent extends DrawComponent {
  /** @type{Array<Object>} */
  ghosts;

  initialise(state) {
    this.eventBus.subscribe(Subscriptions.onWeatherChange(this.getName(), this._onWeatherChange.bind(this)));

    this._generateGhosts(state);
  }

  isEnabled(state) {
    return state.specialEvent === 'halloween';
  }

  /**
   * @param {ValueChange<string>} update
   */
  _onWeatherChange(update) {
    if (update.previous === 'storm' || update.updated === 'storm') { // regenerate only if would change
      this._generateGhosts(update.state);
    }
  }

  /**
   * populate ghost array
   * @param {SceneState} state
   */
  _generateGhosts(state) {
    const {H} = this;
    const length = state.weather === 'storm' ? 9 : 5;
    this.ghosts = Array.from({length}, (_, i) => ({
      x: 80 + i * 130 + rndf(30),
      y: H * 0.15 + rnd(H * 0.25),
      vx: (0.3 + rnd(0.3)) * (i % 2 === 0 ? 1 : -1),
      phase: rnd(Math.PI * 2),
    }));
  }

  draw(state) {
    const {ctx} = this;
    const {frame} = state;
    this.ghosts.forEach(g => {
      const bob = Math.sin(frame * 0.025 + g.phase) * 8;
      const y = g.y + bob;

      ctx.save();
      ctx.globalAlpha = 0.55;
      // body
      ctx.fillStyle = 'rgba(220,230,255,0.9)';
      ctx.beginPath();
      ctx.arc(g.x, y - 12, 14, Math.PI, 0);
      ctx.lineTo(g.x + 14, y + 8);
      // wavy bottom
      for (let wx = 3; wx >= -3; wx--) {
        ctx.quadraticCurveTo(
            g.x + wx * 5 + 2, y + 14,
            g.x + wx * 4.5, y + 8
        );
      }
      ctx.lineTo(g.x - 14, y + 8);
      ctx.closePath();
      ctx.fill();
      // eyes
      ctx.fillStyle = 'rgba(30,10,60,0.8)';
      ctx.beginPath();
      ctx.ellipse(g.x - 5, y - 12, 3, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(g.x + 5, y - 12, 3, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  tick(state, _1, _2) {
    const {W} = this;
    this.ghosts.forEach(g => {
      g.x += g.vx;
      if (g.x > W + 50) g.x = -50;
      if (g.x < -50) g.x = W + 50;
    });
  }
}
