import {DrawComponent} from "@/core/DrawComponent";
import {rnd} from "@/utils";
import {Subscriptions} from "@/core/Subscriptions";

/**
 * render butterflies in spring and summer
 */
export class ButterfliesComponent extends DrawComponent {
  /** @type{Array<Object>} */
  butterflies;

  static COMPONENT_NAME = "ButterfliesComponent";
  getName() {
    return ButterfliesComponent.COMPONENT_NAME;
  }

  initialise() {
    this._generateButterflies();

    this.eventBus.subscribe(Subscriptions.onWeatherChange(this.getName(), update => {
      if (update.previous === 'wind' || update.updated === 'wind') { // only regenerate if would change
        this._generateButterflies();
      }
    }));
  }

  isEnabled() {
    const {todBlend, season, weather} = this.scene;
    return todBlend > 0.4
        && !(season === 'winter' || season === 'autumn')
        && !(weather === 'rain' || weather === 'storm');
  }

  /**
   * generate butterflies
   */
  _generateButterflies() {
    const {H} = this;
    const length = this.scene.weather === 'wind' ? 2 : 6;
    this.butterflies = Array.from({length}, (_, i) => ({
      x: 100 + i * 120,
      y: H * 0.3 + rnd(H * 0.2),
      vx: 0.5 + rnd(0.4),
      flapT: rnd(Math.PI * 2),
      col: `hsl(${[280, 320, 40, 200, 160][i]},70%,65%)`,
    }));
  }

  tick() {
    const {W} = this;

    this.butterflies.forEach(bf => {
      bf.x += bf.vx + (this.scene.weather === 'wind' ? 0.8 : 0);
      bf.flapT += 0.12;
      bf.y += Math.sin(bf.flapT * 0.3) * 0.5;
      if (bf.x > W + 30) bf.x = -30;
    });
  }

  draw() {
    const {ctx} = this;

    this.butterflies.forEach(bf => {
      const flap = Math.abs(Math.sin(bf.flapT));
      ctx.save();
      ctx.translate(bf.x, bf.y);
      ctx.globalAlpha = 0.75;
      ctx.fillStyle = bf.col;
      ctx.beginPath();
      ctx.ellipse(-7 * flap, -2, 7 * flap, 5, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(7 * flap, -2, 7 * flap, 5, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#2a1a00';
      ctx.beginPath();
      ctx.ellipse(0, 0, 2, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }
}
