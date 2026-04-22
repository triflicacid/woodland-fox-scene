import {clamp, lerp, prob, rndf} from "@/utils";
import {DrawComponent} from "@/core/DrawComponent";

/**
 * render assorted puddles when raining
 */
export class PuddlesComponent extends DrawComponent {
  draw(state) {
    const {ctx} = this;
    const {weather, todBlend, puddles} = state;
    const growing = weather === 'rain' || weather === 'storm';

    state.puddleLevel = clamp(state.puddleLevel + (growing ? 0.004 : -0.002), 0, 1);

    puddles.forEach(pd => {
      pd.rx = lerp(0, pd.maxRx, state.puddleLevel);
      pd.ry = lerp(0, pd.maxRy, state.puddleLevel);
      if (pd.rx < 1) return;
      const pg = ctx.createRadialGradient(pd.x, pd.y, 0, pd.x, pd.y, pd.rx);
      const c = todBlend > 0.5 ? 'rgba(120,160,200,' : 'rgba(20,40,80,';
      pg.addColorStop(0, `${c}0.4)`);
      pg.addColorStop(1, `${c}0.1)`);
      ctx.fillStyle = pg;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.ellipse(pd.x, pd.y, pd.rx, pd.ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      // rain ripple
      if (growing && prob(0.06)) {
        ctx.strokeStyle = 'rgba(140,180,220,0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(pd.x + rndf(pd.rx * 0.5), pd.y, pd.rx * 0.3, pd.ry * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
  }
}
