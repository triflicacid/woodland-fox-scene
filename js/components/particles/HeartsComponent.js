import {DrawComponent} from "@/core/DrawComponent";
import {clamp, rnd} from "@/utils";

/**
 * render heart particles when hare and fox are kissing
 */
export class HeartsComponent extends DrawComponent {
  /** @type{Array<Object>} */
  hearts = [];

  static COMPONENT_NAME = "HeartsComponent";

  getName() {
    return HeartsComponent.COMPONENT_NAME;
  }

  isEnabled() {
    return this.hearts.length > 0;
  }

  tick() {
    this.hearts = this.hearts.filter(h => {
      h.y += h.vy;
      h.life++;
      return h.life < 65;
    });
  }

  draw() {
    this.hearts.forEach(h => {
      const a = clamp(1 - h.life / 60, 0, 1);
      this._drawHeart(h.x, h.y, 6 + h.life * 0.09, a);
    });
  }

  /**
   * draw a heart shape at the given position.
   * @param {number} x
   * @param {number} y
   * @param {number} size
   * @param {number} alpha
   */
  _drawHeart(x, y, size, alpha) {
    const {ctx} = this;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#ff88aa';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x, y - size, x - size * 1.5, y - size, x - size * 1.5, y - size * 0.4);
    ctx.bezierCurveTo(x - size * 1.5, y + size * 0.3, x, y + size, x, y + size * 1.2);
    ctx.bezierCurveTo(x, y + size, x + size * 1.5, y + size * 0.3, x + size * 1.5, y - size * 0.4);
    ctx.bezierCurveTo(x + size * 1.5, y - size, x, y - size, x, y);
    ctx.fill();
    ctx.restore();
  }

  /**
   * Spawn a new heart at the given position
   * @param{number} x
   * @param{number} y
   */
  spawn(x, y) {
    this.hearts.push({
      x,
      y,
      vy: -0.55 - rnd(0.45),
      life: 0,
    });
  }

  /**
   * Remove all heart particles
   */
  clear() {
    this.hearts.length = 0;
  }
}
