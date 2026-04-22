import {DrawComponent} from "@/core/DrawComponent";
import {rnd} from "@/utils";

/**
 * render autumn canopy leaves dislodged by wind
 */
export class AutumnBlowingLeavesComponent extends DrawComponent {
  tick(state, setStatus, enableButtons) {
    const {H} = this;
    const {season, weather, canopyLeaves} = state;
    const shouldFall = season === 'autumn' && (weather === 'wind' || weather === 'storm');

    canopyLeaves.forEach(l => {
      if (!l.active) { // TODO debug, this doesn't feel right
        if (shouldFall) {
          l.timer--;
          if (l.timer <= 0) {
            Object.assign(l, state._makeCanopyLeaf());
            l.active = true;
          }
        }
        return;
      }
      l.x += l.vx + (weather === 'wind' ? 1.5 : 0);
      l.y += l.vy;
      l.rot += l.drot;
      if (l.y > H * 0.63) {
        l.active = false;
        l.timer = rnd(120) | 0;
      }
    });
  }

  draw(state) {
    const {ctx} = this;
    const {canopyLeaves} = state;

    canopyLeaves
        .filter(l => l.active)
        .forEach(l => {
          ctx.save();
          ctx.translate(l.x, l.y);
          ctx.rotate(l.rot);
          ctx.globalAlpha = 0.85;
          ctx.fillStyle = `hsl(${l.hue},72%,44%)`;
          ctx.beginPath();
          ctx.ellipse(0, 0, 5, 3, 0.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
  }
}
