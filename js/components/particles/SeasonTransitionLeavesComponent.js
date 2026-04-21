import {DrawComponent} from "@/core/DrawComponent";

/**
 * render leaf particles during season transitions
 */
export class SeasonTransitionLeavesComponent extends DrawComponent {
  isEnabled(state) {
    return state.seasonLeafActive;
  }

  tick(state, setStatus, enableButtons) {
    let allDone = true;
    state.seasonLeaves.forEach(l => {
      if (l.y < state.H * 0.62) {
        allDone = false;
        l.x += l.vx;
        l.y += l.vy;
        l.rot += l.drot;
        l.life++;
      }
    });
    if (allDone) state.seasonLeafActive = false;
  }

  draw(state) {
    const {ctx} = this;
    const {seasonLeaves, season} = state;

    seasonLeaves.forEach(l => {
      ctx.save();
      ctx.translate(l.x, l.y);
      ctx.rotate(l.rot);
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = `hsl(${l.hue}, ${season === 'spring' ? 60 : 75}%, ${season === 'spring' ? 80 : 45}%)`;
      ctx.beginPath();
      ctx.ellipse(0, 0, 5, 3, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }
}
