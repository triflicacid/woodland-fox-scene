import {DrawComponent} from "@/core/DrawComponent";

/**
 * render campfire/cabin smoke particles
 */
export class SmokeComponent extends DrawComponent {
  isEnabled(state) {
    return !(state.weather === 'rain' || state.weather === 'storm' || state.season === 'summer');
  }

  tick(state, setStatus, enableButtons) {
    const {weather, smoke} = state;

    smoke.forEach((s, i) => {
      s.x += s.vx + (weather === 'wind' ? 1.5 : 0);
      s.y += s.vy;
      s.life++;
      s.size += 0.08;
      s.alpha -= 0.002;
      if (s.life > 90 || s.alpha <= 0) state.resetSmoke(s, i);
    });
  }

  draw(state) {
    const {ctx} = this;
    const {season, smoke} = state;

    smoke.forEach(s => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, s.alpha);
      ctx.fillStyle = season === 'winter' ? 'rgba(220,230,240,1)' : 'rgba(180,180,170,1)';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }
}
