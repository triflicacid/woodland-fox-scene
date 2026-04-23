import {DrawComponent} from "@/core/DrawComponent";
import {prob, rnd} from "@/utils";

/**
 * render bats flying in autumn nights
 */
export class BatsComponent extends DrawComponent {
  /** @type{Array<Object>} */
  bats;

  initialise() {
    this.bats = Array.from({length: 6}, () => ({
      x: rnd(this.W),
      y: 40 + rnd(this.H * 0.3),
      vx: (0.8 + rnd(0.6)) * (prob(0.5) ? 1 : -1),
      flapT: rnd(Math.PI * 2),
      flapSpeed: 0.14 + rnd(0.06),
      scale: 0.8 + rnd(0.5)
    }));
  }

  isEnabled() {
    // nigh-time and no special event (only events in autumn are loud)
    return this.scene.owlForced|| (this.scene.season === 'autumn' && this.scene.todBlend < 0.4 && this.scene.specialEvent === null)
  }

  tick() {
    this.bats.forEach(b => {
      b.x += b.vx;
      b.flapT += b.flapSpeed;
      b.y += Math.sin(b.flapT * 0.15) * 1.2;
      if (b.x > this.W + 40) b.x = -40;
      if (b.x < -40) b.x = this.W + 40;
    });
  }

  draw() {
    this.bats.forEach(b => this._drawBat(b));
  }

  /**
   * draw a bat at the given position.
   * @param {Object} bat
   */
  _drawBat(bat) {
    const {ctx} = this;
    const {x, y, flapT, scale} = bat;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    const wing = Math.sin(flapT) * 10;
    ctx.fillStyle = 'rgba(30,10,40,0.8)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-8, wing - 4, -16, wing, -18, wing + 2);
    ctx.bezierCurveTo(-14, wing - 2, -8, wing - 6, 0, 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(8, wing - 4, 16, wing, 18, wing + 2);
    ctx.bezierCurveTo(14, wing - 2, 8, wing - 6, 0, 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(40,15,50,0.9)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 4, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, -5, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-3, -7);
    ctx.lineTo(-5, -12);
    ctx.lineTo(-1, -8);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(3, -7);
    ctx.lineTo(5, -12);
    ctx.lineTo(1, -8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}
