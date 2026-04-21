import {DrawComponent} from "@/core/DrawComponent";

/**
 * render the sky backdrop (no moons etc.)
 */
export class SkyBackdropComponent extends DrawComponent {
  draw(state) {
    const {ctx, W, H} = this;
    const p = state.pal();
    const td = state.todBlend;
    const {weather} = state;

    // base night sky
    const skyN = ctx.createLinearGradient(0, 0, 0, H * 0.7);
    skyN.addColorStop(0, p.sky0);
    skyN.addColorStop(0.5, p.sky1);
    skyN.addColorStop(1, p.sky2);
    ctx.fillStyle = skyN;
    ctx.fillRect(0, 0, W, H);

    // day sky overlay
    if (weather !== 'storm' && weather !== 'rain') {
      const skyD = ctx.createLinearGradient(0, 0, 0, H * 0.7);
      skyD.addColorStop(0, p.daySky0);
      skyD.addColorStop(0.5, p.daySky1);
      skyD.addColorStop(1, p.daySky2);
      ctx.globalAlpha = td;
      ctx.fillStyle = skyD;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    } else {
      ctx.fillStyle = '#1a2030';
      ctx.globalAlpha = 0.85;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
  }
}