import {DrawComponent} from "@/core/DrawComponent";
import {clamp} from "@/utils";

/**
 * render fireflies during nighttime
 */
export class FirefliesComponent extends DrawComponent {
  isEnabled(state) {
    return state.todBlend < 0.5 && !(state.weather === 'rain' || state.weather === 'storm');
  }

  tick(state, setStatus, enableButtons) {
    const {W, H} = this;

    state.fireflies.forEach(f => {
      f.angle += (Math.random() - 0.5) * 0.08;
      f.x += Math.cos(f.angle) * f.speed;
      f.y += Math.sin(f.angle) * f.speed * 0.5;
      f.x = clamp(f.x, 60, W - 60);
      f.y = clamp(f.y, H * 0.3, H * 0.65);
    });
  }

  draw(state) {
    const {ctx} = this;
    const {todBlend, frame, fireflies} = state;

    const alpha = clamp(1 - todBlend * 2, 0, 1);
    fireflies.forEach(f => {
      const g = 0.4 + 0.6 * Math.sin(frame * 0.05 + f.phase);
      ctx.save();
      ctx.globalAlpha = g * 0.85 * alpha;
      ctx.shadowBlur = 12 + g * 8;
      ctx.shadowColor = '#aaff88';
      ctx.fillStyle = '#ccff99';
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }
}
