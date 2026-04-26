import {DrawComponent} from "@/core/DrawComponent";
import {rnd} from "@/utils";
import {Subscriptions} from "@/core/Subscriptions";

/**
 * draw the Aurora Borealis if enabled
 */
export class AuroraComponent extends DrawComponent {
  /** @type{Array<Object>} */
  auroraBands;
  on = false;

  static COMPONENT_NAME = "AuroraComponent";

  getName() {
    return AuroraComponent.COMPONENT_NAME;
  }

  initialise() {
    const {H} = this;
    this.auroraBands = Array.from({length: 6}, (_, i) => ({
      phase: i * Math.PI * 0.35,
      amp: 25 + rnd(45),
      freq: 0.003 + rnd(0.003),
      hue: i % 2 === 0 ? 45 + rnd(20) : 270 + rnd(40),
      alpha: 0.10 + rnd(0.10),
      width: 70 + rnd(70),
      y: H * 0.07 + i * H * 0.07,
    }));

    this.eventBus.subscribe(Subscriptions.onSeasonChange(this.getName(), this._onSeasonChange.bind(this)));
  }

  _onSeasonChange() {
    if (this.on && (this.scene.season !== 'winter' || this.scene.timeOfDay !== 'night')) this.on = false;
  }

  isEnabled() {
    // winter night only
    return this.on && this.scene.season === 'winter' && this.scene.todBlend < 0.35;
  }

  draw() {
    const {ctx, W, H} = this;
    const {frame} = this.scene;

    ctx.save();
    this.auroraBands.forEach(b => {
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

  /**
   * toggle the status of the aurora
   */
  toggle() {
    this.on = !this.on;
  }
}
