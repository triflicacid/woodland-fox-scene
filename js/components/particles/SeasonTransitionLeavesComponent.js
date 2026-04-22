import {DrawComponent} from "@/core/DrawComponent";
import {rnd, rndf} from "@/utils";
import {Events} from "@/event/Events";

/**
 * render leaf particles during season transitions
 */
export class SeasonTransitionLeavesComponent extends DrawComponent {
  seasonLeafActive = false;
  /** @type{Array<Object>} */
  seasonLeaves;

  initialise(state) {
    this.seasonLeaves = Array.from({length: 40}, () => ({
      x: rnd(this.W),
      y: -rnd(200),
      vx: rndf(1.5),
      vy: 1.5 + rnd(2),
      rot: rnd(Math.PI * 2),
      drot: 0.04 + rnd(0.08),
      hue: 20 + rnd(30),
      life: 0,
    }));

    this.eventBus.subscribe(Events.seasonChangeSubscription("SeasonTransitionLeavesComponent", this._onSeasonChange.bind(this)));
  }

  /**
   * @param {ValueChange<string>} update
   */
  _onSeasonChange(update) {
    const s = update.updated;
    if (s === 'spring' || s === 'autumn') {
      this.seasonLeafActive = true;
      this.seasonLeaves.forEach(l => {
        l.x = rnd(this.W);
        l.y = -rnd(200);
        l.life = 0;
        l.vy = 1.5 + rnd(2);
        l.hue = s === 'spring' ? 300 + rnd(60) : 15 + rnd(30);
      });
    }
  }

  isEnabled(state) {
    return this.seasonLeafActive;
  }

  tick(state, setStatus, enableButtons) {
    let allDone = true;
    this.seasonLeaves.forEach(l => {
      if (l.y < state.H * 0.62) {
        allDone = false;
        l.x += l.vx;
        l.y += l.vy;
        l.rot += l.drot;
        l.life++;
      }
    });
    if (allDone) this.seasonLeafActive = false;
  }

  draw(state) {
    const {ctx} = this;
    const {season} = state;

    this.seasonLeaves.forEach(l => {
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
