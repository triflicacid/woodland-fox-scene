import {DrawComponent} from "@/core/DrawComponent";
import {rnd, rndf} from "@/utils";

/**
 * render campfire/cabin smoke particles
 */
export class SmokeComponent extends DrawComponent {
  /** @type{Array<Object>} */
  particles;

  initialise() {
    this.particles = Array.from({length: 12}, (_, i) => this._makeSmoke(i))
  }

  /**
   * create or reset a smoke particle.
   * @param {number} [i=0] - index used to stagger particles vertically
   * @returns {Object}
   */
  _makeSmoke(i = 0) {
    return {
      x: 640 + rndf(3),
      y: this.H * 0.62 - 50 - i * 8,
      vx: rndf(0.3) + 0.2,
      vy: -0.4 - rnd(0.3),
      size: 4 + i * 1.5,
      alpha: 0.18 - i * 0.013,
      life: 0,
    };
  }

  isEnabled() {
    const {weather, season} = this.scene;
    return !(weather === 'rain' || weather === 'storm' || season === 'summer');
  }

  tick() {
    const {weather} = this.scene;

    this.particles.forEach((p, i) => {
      p.x += p.vx + (weather === 'wind' ? 1.5 : 0);
      p.y += p.vy;
      p.life++;
      p.size += 0.08;
      p.alpha -= 0.002;
      if (p.life > 90 || p.alpha <= 0) Object.assign(p, this._makeSmoke(i));
    });
  }

  draw() {
    const {ctx} = this;
    const {season} = this.scene;

    this.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = season === 'winter' ? 'rgba(220,230,240,1)' : 'rgba(180,180,170,1)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }
}
