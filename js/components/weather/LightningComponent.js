import {prob, rnd, rndf} from '@/utils';
import {PROBABILITY} from '@/config';
import {DrawComponent} from "@/core/DrawComponent";
import {Events} from "@/event/Events";

/**
 * render lightning bolts during a storm
 */
export class LightningComponent extends DrawComponent {
  isEnabled(state) {
    return state.weather === 'storm';
  }

  draw(state) {
    const {ctx, W, H} = this;
    if (!state.bolts.length) return;

    // single canvas flash driven by the brightest active bolt
    const maxFade = Math.max(...state.bolts.map(b => 1 - b.t / 8));
    const hasSuper = state.bolts.some(b => b.superBolt);
    ctx.fillStyle = `rgba(200,220,255,${(hasSuper ? 0.25 : 0.15) * maxFade})`;
    ctx.fillRect(0, 0, W, H);

    state.bolts.forEach(bolt => {
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

  tick(state, setStatus, enableButtons) {
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
      state.bolts.push({path, t: 0, superBolt});
      this.eventBus.receive(Events.lightningStrike(this.getName(), superBolt));
    }

    // advance all bolts, remove expired ones
    state.bolts.forEach(b => b.t++);
    state.bolts = state.bolts.filter(b => b.t < 8);
  }
}