import {DrawComponent} from "@/core/DrawComponent";
import {rnd, rndf} from "@/utils";

/**
 * render autumn canopy leaves dislodged by wind
 */
export class AutumnBlowingLeavesComponent extends DrawComponent {
  /** @type{Array<Object>} */
  leaves;

  static COMPONENT_NAME = "AutumnBlowingLeavesComponent";

  getName() {
    return AutumnBlowingLeavesComponent.COMPONENT_NAME;
  }

  initialise() {
    this.leaves = Array.from({length: 30}, () => this._makeCanopyLeaf());
  }

  /**
   * create a canopy leaf without tree data (used at init before trees are set up).
   * @returns {Object}
   */
  _makeCanopyLeaf() {
    return {
      x: rnd(this.W),
      y: this.H * 0.62,
      vx: rndf(1.5),
      vy: 0.3 + rnd(0.8),
      rot: rnd(Math.PI * 2),
      drot: rndf(0.08),
      hue: 15 + rnd(30),
      active: false,
      timer: rnd(300) | 0,
    };
  }

  tick() {
    const {H} = this;
    const {season, weather} = this.scene;
    const shouldFall = season === 'autumn' && (weather === 'wind' || weather === 'storm');

    this.leaves.forEach(l => {
      if (!l.active) { // TODO debug, this doesn't feel right
        if (shouldFall) {
          l.timer--;
          if (l.timer <= 0) {
            Object.assign(l, this._makeCanopyLeaf());
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

  draw() {
    const {ctx} = this;

    this.leaves
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
