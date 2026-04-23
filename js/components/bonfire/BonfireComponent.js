import {DrawComponent} from '@/core/DrawComponent';
import {BONFIRE} from '@/config';
import {rnd, rndf} from '@/utils';

/**
 * draws an animated bonfire with flickering flames and heavy smoke
 */
export class BonfireComponent extends DrawComponent {
  /** @type {Array<Object>} */
  smoke = [];

  initialise(state) {
    this.smoke = Array.from({length: 20}, (_, i) =>
        this._makeSmoke(state, i * 3)
    );
  }

  tick(state, setStatus, enableButtons) {
    this.smoke.forEach((s, i) => {
      s.x += s.vx + (state.weather === 'wind' ? 2.5 : 0);
      s.y += s.vy;
      s.life++;
      s.size += 0.12;
      s.alpha -= 0.008;
      if (s.life > 80 || s.alpha <= 0) {
        Object.assign(s, this._makeSmoke(state, 0));
      }
    });
  }

  draw(state) {
    const x = BONFIRE.X;
    const y = state.H * BONFIRE.Y_FRACTION;
    const {frame} = state;

    this._drawLogs(x, y);
    this._drawGlow(x, y, frame);
    this._drawFlames(x, y, frame);
    this._drawSmoke();
  }

  /**
   * draw the crossed logs at the base.
   * @param {number} x
   * @param {number} y
   */
  _drawLogs(x, y) {
    const {ctx} = this;
    ctx.strokeStyle = '#3a1a08';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    // crossed logs
    ctx.beginPath();
    ctx.moveTo(x - 22, y);
    ctx.lineTo(x + 18, y - 10);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 22, y);
    ctx.lineTo(x - 18, y - 10);
    ctx.stroke();
    // embers
    ctx.fillStyle = '#ff4400';
    ctx.beginPath();
    ctx.ellipse(x, y - 4, 18, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff8800';
    ctx.beginPath();
    ctx.ellipse(x, y - 4, 10, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * draw the warm ground glow beneath the fire.
   * @param {number} x
   * @param {number} y
   * @param {number} frame
   */
  _drawGlow(x, y, frame) {
    const {ctx} = this;
    const flicker = 0.85 + Math.sin(frame * 0.18) * 0.15;
    const glow = ctx.createRadialGradient(x, y, 0, x, y, 80 * flicker);
    glow.addColorStop(0, 'rgba(255,120,20,0.25)');
    glow.addColorStop(0.5, 'rgba(255,80,10,0.10)');
    glow.addColorStop(1, 'rgba(255,60,0,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.ellipse(x, y, 80 * flicker, 30 * flicker, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * draw layered animated flame arcs.
   * @param {number} x
   * @param {number} y
   * @param {number} frame
   */
  _drawFlames(x, y, frame) {
    const {ctx} = this;
    const layers = [
      {h: 48, w: 18, col: '#ff2200', alpha: 0.9},
      {h: 38, w: 14, col: '#ff6600', alpha: 0.85},
      {h: 28, w: 10, col: '#ffaa00', alpha: 0.8},
      {h: 16, w: 6, col: '#ffee44', alpha: 0.75},
    ];

    layers.forEach((l, i) => {
      const flicker = Math.sin(frame * 0.22 + i * 1.1) * 4;
      const sway = Math.sin(frame * 0.15 + i * 0.7) * 3;
      ctx.save();
      ctx.globalAlpha = l.alpha;
      ctx.fillStyle = l.col;
      ctx.beginPath();
      ctx.moveTo(x - l.w + sway, y - 4);
      ctx.bezierCurveTo(
          x - l.w * 0.5 + sway, y - l.h * 0.5 + flicker,
          x + l.w * 0.5 + sway, y - l.h * 0.5 + flicker,
          x + sway, y - l.h + flicker
      );
      ctx.bezierCurveTo(
          x + l.w * 0.5 + sway, y - l.h * 0.5 + flicker,
          x + l.w + sway, y - l.h * 0.5 + flicker,
          x + l.w + sway, y - 4
      );
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });
  }

  /**
   * draw heavy bonfire smoke particles.
   */
  _drawSmoke() {
    const {ctx} = this;
    this.smoke.forEach(s => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, s.alpha);
      ctx.fillStyle = s.col;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  /**
   * create a new smoke particle.
   * @param {SceneState} state
   * @param {number} [life=0] - initial life offset for staggering
   * @returns {Object}
   */
  _makeSmoke(state, life = 0) {
    const grey = 40 + Math.floor(rnd(40));
    return {
      x: BONFIRE.X + rndf(4),
      y: state.H * BONFIRE.Y_FRACTION - 20,
      vx: rndf(0.6) + 0.3,
      vy: -(0.8 + rnd(0.6)),
      size: 6 + rnd(4),
      alpha: 0.45 + rnd(0.2),
      col: `rgb(${grey},${grey},${grey})`,
      life,
    };
  }
}