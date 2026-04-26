import {DrawComponent} from '@/core/DrawComponent';
import {clamp, prob, rnd, rndf} from '@/utils';
import {PROBABILITY} from "@/config";

/**
 * occasionally fires a comet across the sky with a glowing tail.
 * only visible at night in clear or wind weather.
 */
export class CometComponent extends DrawComponent {
  /** @type {Array<Object>} */
  comets = [];

  static COMPONENT_NAME = "CometComponent";

  getName() {
    return CometComponent.COMPONENT_NAME;
  }

  isEnabled() {
    return this.scene.isNight() && (this.scene.weather === 'clear' || this.scene.weather === 'wind');
  }

  tick() {
    if (prob(PROBABILITY.COMET)) {
      this.comets.push(this._spawn());
    }

    if (!this.comet && prob(PROBABILITY.COMET)) {
      this.comet = this._spawn();
    }
    if (!this.comet) return;

    this.comets = this.comets
        .map(c => {
          c.x += c.vx;
          c.y += c.vy;
          return c;
        })
        .filter(c => !(c.x < -200 || c.x > this.W + 200 || c.y < -200 || c.y > this.H * 0.6));
  }

  draw() {
    if (this.comets.length === 0) return;

    const {ctx} = this;
    const alpha = clamp(1 - this.scene.todBlend * 2, 0, 1) * 0.85;
    const halloween = this.scene.specialEvent === 'halloween';

    this.comets.forEach(c => {
      // tail
      const tailLen = 12;
      for (let i = tailLen; i >= 0; i--) {
        const tx = c.x - c.vx * i * 1.8;
        const ty = c.y - c.vy * i * 1.8;
        const t = i / tailLen;
        ctx.save();
        ctx.globalAlpha = alpha * c.brightness * (1 - t) * 0.6;
        ctx.shadowBlur = 8;
        ctx.shadowColor = halloween ? '#ff6600' : '#cce8ff';
        ctx.fillStyle = halloween
            ? `hsl(25, 90%, ${50 + t * 20}%)`
            : `hsl(200, 80%, ${70 + t * 20}%)`;
        ctx.beginPath();
        ctx.arc(tx, ty, (1 - t) * c.size * 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // head
      ctx.save();
      ctx.globalAlpha = alpha * c.brightness;
      ctx.shadowBlur = 12 + c.size * 4;
      if (halloween) {
        this._drawPumpkinHead(c.x, c.y, c.size);
      } else {
        ctx.shadowColor = '#ffffff';
        ctx.fillStyle = '#eef8ff';
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  }

  /**
   * draw a tiny pumpkin head at the comet's position
   * @param {number} x
   * @param {number} y
   * @param {number} size
   */
  _drawPumpkinHead(x, y, size) {
    const {ctx} = this;
    const r = size * 1.4;
    ctx.shadowColor = '#ff6600';
    // body
    ctx.fillStyle = '#e06010';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    // eyes
    ctx.fillStyle = 'rgba(255,200,0,0.9)';
    const es = Math.max(0.8, r * 0.3);
    [[-r * 0.35, -r * 0.2], [r * 0.35, -r * 0.2]].forEach(([ex, ey]) => {
      ctx.beginPath();
      ctx.moveTo(x + ex, y + ey - es);
      ctx.lineTo(x + ex - es, y + ey + es);
      ctx.lineTo(x + ex + es, y + ey + es);
      ctx.closePath();
      ctx.fill();
    });
    // mouth
    ctx.strokeStyle = 'rgba(255,200,0,0.9)';
    ctx.lineWidth = Math.max(0.5, r * 0.15);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - r * 0.4, y + r * 0.3);
    ctx.lineTo(x - r * 0.15, y + r * 0.5);
    ctx.lineTo(x + r * 0.15, y + r * 0.3);
    ctx.lineTo(x + r * 0.4, y + r * 0.5);
    ctx.stroke();
  }

  /**
   * spawn a comet entering from a random edge of the sky.
   * @returns {Object}
   */
  _spawn() {
    const edge = Math.floor(rnd(3)); // 0=left, 1=right, 2=top
    const speed = 3 + rnd(4);
    const size = 1.5 + rnd(3);
    const brightness = 0.5 + rnd(0.5);

    let x, y, vx, vy;
    if (edge === 0) { // left
      const angle = 0.2 + rnd(0.66);
      x = -20;
      y = rnd(this.H * 0.75);
      vx = Math.cos(angle) * speed;
      vy = Math.sin(angle) * speed;
    } else if (edge === 1) { // right
      const angle = 0.2 + rnd(0.5);
      x = this.W + 20;
      y = rnd(this.H * 0.66);
      vx = -Math.cos(angle) * speed;
      vy = Math.sin(angle) * speed;
    } else { // top
      const angle = 0.3 + rnd(0.8);
      x = rnd(this.W);
      y = -20;
      vx = rndf(speed * 0.6);
      vy = Math.cos(angle) * speed;
    }

    return {x, y, vx, vy, size, brightness};
  }
}