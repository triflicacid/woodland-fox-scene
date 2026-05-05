import {clamp, lerp, prob, rnd, rndchoice, rndf} from "@/utils";
import {DrawComponent} from "@/core/DrawComponent";

/**
 * render assorted puddles when raining
 */
export class PuddlesComponent extends DrawComponent {
  puddleLevel = 0;
  /** @type{Array<object>} */
  puddles;

  static COMPONENT_NAME = "PuddlesComponent";

  getName() {
    return PuddlesComponent.COMPONENT_NAME;
  }

  initialise() {
    const baseY = this.scene.groundY + (this.H * 0.06);
    this.puddles = Array.from({length: 5}, (_, i) => ({
      x: 120 + i * 110,
      y: baseY + rnd(this.H * 0.1),
      rx: 0, maxRx: 20 + rnd(25),
      ry: 0, maxRy: 5 + rnd(4),
    }));
  }

  draw() {
    const {ctx} = this;
    const {weather, todBlend} = this.scene;
    const growing = weather === 'rain' || weather === 'storm';

    this.puddleLevel = clamp(this.puddleLevel + (growing ? 0.004 : -0.002), 0, 1);

    this.puddles.forEach(pd => {
      pd.rx = lerp(0, pd.maxRx, this.puddleLevel);
      pd.ry = lerp(0, pd.maxRy, this.puddleLevel);
      if (pd.rx < 1) return;
      const pg = ctx.createRadialGradient(pd.x, pd.y, 0, pd.x, pd.y, pd.rx);
      const c = todBlend > 0.5 ? 'rgba(120,160,200,' : 'rgba(20,40,80,';
      pg.addColorStop(0, `${c}0.4)`);
      pg.addColorStop(1, `${c}0.1)`);
      ctx.fillStyle = pg;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.ellipse(pd.x, pd.y, pd.rx, pd.ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      // rain ripple
      if (growing && prob(0.06)) {
        ctx.strokeStyle = 'rgba(140,180,220,0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(pd.x + rndf(pd.rx * 0.5), pd.y, pd.rx * 0.3, pd.ry * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
  }

  /**
   * return a random puddle
   * @returns object puddle object
   */
  getRandomPuddle() {
    return rndchoice(this.puddles);
  }

  /**
   * get the current puddle level
   */
  getPuddleLevel() {
    return this.puddleLevel;
  }
}
