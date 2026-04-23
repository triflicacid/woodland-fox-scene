import {prob, rnd, rndf} from '@/utils';
import {PROBABILITY} from '@/config';
import {DrawComponent} from "@/core/DrawComponent";
import {Events} from "@/core/Events";

/**
 * render lightning bolts during a storm
 */
export class LightningComponent extends DrawComponent {
  /** @type{Array<Object>} */
  _bolts = [];
  
  isEnabled() {
    return this.scene.weather === 'storm';
  }

  draw() {
    const {ctx, W, H} = this;
    if (!this._bolts.length) return;

    // single canvas flash driven by the brightest active bolt
    const maxFade = Math.max(...this._bolts.map(b => 1 - b.t / 8));
    const hasSuper = this._bolts.some(b => b.superBolt);
    ctx.fillStyle = `rgba(200,220,255,${(hasSuper ? 0.25 : 0.15) * maxFade})`;
    ctx.fillRect(0, 0, W, H);

    this._bolts.forEach(bolt => {
      const fade = 1 - bolt.t / 8;

      // core bolt
      ctx.strokeStyle = bolt.superBolt
          ? `rgba(240,245,255,${fade})`
          : `rgba(220,230,255,${fade})`;
      ctx.lineWidth = bolt.superBolt ? 3 : 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      bolt.path.forEach(([lx, ly], i) => i === 0 ? ctx.moveTo(lx, ly) : ctx.lineTo(lx, ly));
      ctx.stroke();

      // wide glow
      ctx.strokeStyle = bolt.superBolt
          ? `rgba(235,210,255,${0.6 * fade})`
          : `rgba(180,200,255,${0.4 * fade})`;
      ctx.lineWidth = bolt.superBolt ? 16 : 8;
      ctx.beginPath();
      bolt.path.forEach(([lx, ly], i) => i === 0 ? ctx.moveTo(lx, ly) : ctx.lineTo(lx, ly));
      ctx.stroke();
    });
  }

  tick() {
    const {H} = this;

    // chance to spawn a new bolt each frame
    if (prob(PROBABILITY.LIGHTNING)) {
      const superBolt = prob(PROBABILITY.SUPER_BOLT);
      const spread = superBolt ? 70 : 40;
      const path = [];
      let lx = 200 + rnd(300), ly = 0;
      while (ly < H * 0.65) {
        path.push([lx, ly]);
        lx += rndf(spread);
        ly += 20 + rnd(20);
      }
      this._bolts.push({path, t: 0, superBolt});
      this.eventBus.receive(Events.lightningStrike(this.getName(), superBolt));
    }

    // advance all bolts, remove expired ones
    this._bolts.forEach(b => b.t++);
    this._bolts = this._bolts.filter(b => b.t < 8);
  }
}