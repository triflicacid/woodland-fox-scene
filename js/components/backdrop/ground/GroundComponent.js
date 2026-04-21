import {DrawComponent} from "../../../core/DrawComponent.js";

/**
 * render the ground
 */
export class GroundComponent extends DrawComponent {
  draw(state) {
    const {ctx, W, H} = this;
    const {season, weather, frame} = state;
    const p = state.pal();

    const gnd = ctx.createLinearGradient(0, H * 0.62, 0, H);
    gnd.addColorStop(0, p.gnd0);
    gnd.addColorStop(0.4, p.gnd1);
    gnd.addColorStop(1, p.gnd2);
    ctx.fillStyle = gnd;
    ctx.fillRect(0, H * 0.62, W, H * 0.38);

    if (season === 'winter') {
      ctx.fillStyle = 'rgba(235,245,255,0.93)';
      ctx.fillRect(0, H * 0.62, W, H * 0.38);
      ctx.fillStyle = '#e8f2fa';
      ctx.beginPath();
      ctx.moveTo(0, H * 0.62);
      for (let sx = 0; sx <= W; sx += 20) {
        ctx.lineTo(sx, H * 0.62 + Math.sin(sx * 0.05) * 4 + Math.sin(sx * 0.11 + 1) * 3);
      }
      ctx.lineTo(W, H * 0.62);
      ctx.closePath();
      ctx.fill();
    }

    // ground line
    ctx.strokeStyle = season === 'winter' ? '#c8dcea' : season === 'autumn' ? '#5a3a1a' : '#2a5e1a';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, H * 0.62 + 1);
    ctx.lineTo(W, H * 0.62 + 1);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}
