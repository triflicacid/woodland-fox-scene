import {DrawComponent} from '@/core/DrawComponent';
import {rnd, rndf} from '@/utils';

const NOTES = ['♪', '♫', '♩'];

/**
 * draws floating musical note particles (fox singing)
 */
export class MusicalNotesComponent extends DrawComponent {
  /** @type {Array<Object>} */
  notes = [];

  static COMPONENT_NAME = "MusicalNotesComponent";

  getName() {
    return MusicalNotesComponent.COMPONENT_NAME;
  }

  tick() {
    this.notes = this.notes.filter(n => {
      n.x += n.vx;
      n.y += n.vy;
      n.alpha -= 0.012;
      n.vx += rndf(0.05);
      return n.alpha > 0;
    });
  }

  draw() {
    const {ctx} = this;
    this.notes.forEach(n => {
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

  /**
   * spawn a single note at the given position.
   * @param {number} x
   * @param {number} y
   */
  spawnNote(x, y) {
    this.notes.push({
      x: x + rndf(10),
      y: y + rndf(10),
      vx: rndf(0.6),
      vy: -(0.8 + rnd(0.5)),
      alpha: 1,
      size: 10 + rnd(6),
      note: NOTES[Math.floor(rnd(NOTES.length))],
      col: `hsl(${Math.floor(rnd(360))}, 80%, 65%)`,
    });
  }
}
