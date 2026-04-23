import {DrawComponent} from '@/core/DrawComponent';
import {prob, rnd, rndf} from '@/utils';
import {PROBABILITY} from "@/config";

const NOTES = ['♪', '♫', '♩'];

/**
 * draws floating musical note particles (fox singing)
 */
export class MusicalNotesComponent extends DrawComponent {
  /** @type {Array<Object>} */
  _notes = [];

  tick() {
    const {fox, specialEvent, weather} = this.scene;
    const singing = specialEvent === 'birthday' && fox.poseBlend > 0.95;
    const multiplier = weather === 'rain' || weather === 'wind' ? 1.5 : weather === 'storm' ? 2.1 : 1;

    if (singing && prob(PROBABILITY.SPAWN_SINGING_NOTE * multiplier)) {
      this._notes.push({
        x: fox.x - 30 + rndf(20),
        y: fox.y - 70,
        vx: rndf(0.6),
        vy: -(0.8 + rnd(0.5)),
        alpha: 1,
        size: 10 + rnd(6),
        note: NOTES[Math.floor(rnd(NOTES.length))],
        col: `hsl(${Math.floor(rnd(360))}, 80%, 65%)`,
      });
    }

    this._notes = this._notes.filter(n => {
      n.x += n.vx;
      n.y += n.vy;
      n.alpha -= 0.012;
      n.vx += rndf(0.05);
      return n.alpha > 0;
    });
  }

  draw() {
    const {ctx} = this;
    this._notes.forEach(n => {
      ctx.save();
      ctx.globalAlpha = n.alpha;
      ctx.fillStyle = n.col;
      ctx.shadowBlur = 6;
      ctx.shadowColor = n.col;
      ctx.font = `${n.size}px serif`;
      ctx.textAlign = 'center';
      ctx.fillText(n.note, n.x, n.y);
      ctx.restore();
    });
  }
}
