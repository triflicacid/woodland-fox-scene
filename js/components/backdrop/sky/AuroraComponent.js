import {DrawComponent} from "@/core/DrawComponent";

/**
 * draw the Aurora Borealis if enabled
 */
export class AuroraComponent extends DrawComponent {
  isEnabled(state) {
    // winter night only
    return state.auroraOn && state.season === 'winter' && state.todBlend < 0.35;
  }

  draw(state) {
    const {ctx, W, H} = this;
    const {frame, auroraBands} = state;

    ctx.save();
    auroraBands.forEach(b => {
      const g = ctx.createLinearGradient(0, b.y - b.width, 0, b.y + b.width);
      const shimmer = b.alpha + Math.sin(frame * 0.008 + b.phase) * 0.05;
      const hShift = Math.sin(frame * 0.003 + b.phase) * 18;
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(0.5, `hsla(${b.hue + hShift}, 85%, 60%, ${shimmer})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, b.y);
      for (let x = 0; x <= W; x += 18) {
        const wy = b.y + Math.sin(x * b.freq + frame * 0.012 + b.phase) * b.amp;
        ctx.lineTo(x, wy);
      }
      ctx.lineTo(W, H * 0.5);
      ctx.lineTo(0, H * 0.5);
      ctx.closePath();
      ctx.fill();
    });
    ctx.restore();
  }
}
