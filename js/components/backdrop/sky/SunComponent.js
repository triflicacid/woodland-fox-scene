import {DrawComponent} from "@/core/DrawComponent";
import {clamp} from "@/utils";

/**
 * render the sun on clear days
 */
export class SunComponent extends DrawComponent {
  isEnabled(state) {
    const {weather} = state;
    return state.isDay() && weather !== 'fog' && weather !== 'rain' && weather !== 'storm';
  }

  draw(state) {
    const {ctx} = this;
    const {season, weather, frame, todBlend: td} = state;
    const sa = clamp((td - 0.2) / 0.6, 0, 1);
    const sunX = season === 'autumn' ? 120 : season === 'winter' ? 160 : 550;
    const sunY = season === 'winter' ? 90 : 65;

    ctx.save();
    ctx.globalAlpha = sa;
    ctx.shadowBlur = 60;
    ctx.shadowColor = '#ffe87888';
    ctx.fillStyle = season === 'autumn' ? '#f0a030' : season === 'winter' ? '#dde8f0' : '#fffad0';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = sa * 0.15;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 44, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // sun beams if super sunny
    if (season === 'summer' && weather === 'clear') {
      ctx.strokeStyle = 'rgba(255,250,180,0.08)';
      ctx.lineWidth = 18;
      ctx.globalAlpha = sa;
      for (let r = 0; r < 6; r++) {
        const a = r * Math.PI / 3 + frame * 0.003;
        ctx.beginPath();
        ctx.moveTo(sunX, sunY);
        ctx.lineTo(sunX + Math.cos(a) * 180, sunY + Math.sin(a) * 180);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }
}
