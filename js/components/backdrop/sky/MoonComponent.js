import {DrawComponent} from "../../../core/DrawComponent.js";
import {clamp} from "../../../utils.js";

/**
 * render the moon in the sky.
 * depending on season etc, it may move, or be a pumpkin moon.
 */
export class MoonComponent extends DrawComponent {
  isEnabled(state) {
    return state.isNight();
  }

  draw(state) {
    const td = state.todBlend;
    const {frame, weather, specialEvent} = state;

    if (specialEvent === 'halloween') {
      this._drawPumpkinMoon(frame);
    } else if (weather !== 'storm' && weather !== 'rain') {
      this._drawMoon(td, frame);
    }
  }

  /**
   * draw the ordinary moon and its shadow disc.
   * @param {number} td - time-of-day blend
   * @param {number} frame
   */
  _drawMoon(td, frame) {
    const {ctx} = this;
    const ma = clamp(1 - td * 1.5, 0, 1);
    if (ma <= 0.02) return;
    ctx.save();
    ctx.globalAlpha = ma;
    ctx.shadowBlur = 40;
    ctx.shadowColor = '#fffbe0';
    ctx.fillStyle = '#fffde8';
    ctx.beginPath();
    ctx.arc(580, 55, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(10,17,32,0.35)';
    ctx.beginPath();
    ctx.ellipse(577 + Math.sin(frame * 0.003) * 8, 52, 18, 10, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /**
   * draw a special jack-o-lantern moon for halloween
   * @param {number} frame
   */
  _drawPumpkinMoon(frame) {
    const {ctx} = this;
    ctx.save();
    ctx.shadowBlur = 40;
    ctx.shadowColor = '#ff6600';
    // pumpkin body
    ctx.fillStyle = '#e06010';
    ctx.beginPath();
    ctx.arc(580, 55, 22, 0, Math.PI * 2);
    ctx.fill();
    // ribs
    ctx.strokeStyle = '#c04800';
    ctx.lineWidth = 1.5;
    [-8, 0, 8].forEach(ox => {
      ctx.beginPath();
      ctx.ellipse(580 + ox, 55, 6, 20, ox * 0.04, 0, Math.PI * 2);
      ctx.stroke();
    });
    // face
    ctx.fillStyle = 'rgba(255,200,0,0.9)';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ffcc00';
    // eyes
    [[-8, -6], [6, -6]].forEach(([ex, ey]) => {
      ctx.beginPath();
      ctx.moveTo(580 + ex, 55 + ey - 4);
      ctx.lineTo(580 + ex - 4, 55 + ey + 3);
      ctx.lineTo(580 + ex + 4, 55 + ey + 3);
      ctx.closePath();
      ctx.fill();
    });
    // mouth
    ctx.beginPath();
    ctx.moveTo(580 - 9, 55 + 5);
    ctx.lineTo(580 - 5, 55 + 9);
    ctx.lineTo(580 - 1, 55 + 6);
    ctx.lineTo(580 + 3, 55 + 9);
    ctx.lineTo(580 + 7, 55 + 5);
    ctx.stroke();
    ctx.restore();
  }
}
