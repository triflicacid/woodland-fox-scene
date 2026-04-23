import {DrawComponent} from '@/core/DrawComponent';
import {rnd, rndf} from '@/utils';
import {getTreeTopPos} from '@/components/TreeComponent';

export const BALLOON_PALETTE = ['#ff3333', '#ffcc00', '#3399ff', '#ff66cc', '#33cc66', '#cc66ff'];

/**
 * draws balloons clustered near tree canopy tops for birthday event.
 * balloonCount per tree is defined in TREE_DEFS.
 */
export class BalloonsComponent extends DrawComponent {
  /** @type {Array<Object>} */
  _balloons = [];

  isEnabled() {
    const {specialEvent} = this.scene;
    return specialEvent === 'birthday' || specialEvent === 'easter';
  }

  initialise() {
    this._balloons = this.scene.trees.flatMap((tr, i) => {
      const count = tr.balloonCount ?? 0;
      return Array.from({length: count}, (_, j) => ({
        treeIdx: i,
        offsetX: rndf(tr.r * 0.6),
        offsetY: -(20 + rnd(30)),
        bobPhase: rnd(Math.PI * 2),
        bobSpeed: 0.02 + rnd(0.01),
        col: BALLOON_PALETTE[j % BALLOON_PALETTE.length],
        stringLen: 18 + rnd(10),
      }));
    });
  }

  draw() {
    const {ctx} = this;
    const {weather, frame, trees, season, specialEvent} = this.scene;

    this._balloons.forEach(b => {
      const tr = trees[b.treeIdx];
      const top = getTreeTopPos(tr, weather, season, specialEvent, frame, this.H);
      const bob = Math.sin(frame * b.bobSpeed + b.bobPhase) * 4;
      const wind = (weather === 'wind' || weather === 'storm')
          ? Math.sin(frame * 0.05 + b.bobPhase) * 8 : 0;
      const bx = top.x + b.offsetX + wind;
      const by = top.y + b.offsetY + bob;

      // string
      ctx.strokeStyle = 'rgba(100,100,100,0.6)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(bx, by + 14);
      ctx.quadraticCurveTo(bx + wind * 0.3, by + b.stringLen * 0.6, bx - wind * 0.2, by + b.stringLen);
      ctx.stroke();

      // balloon body
      ctx.fillStyle = b.col;
      ctx.shadowBlur = 6;
      ctx.shadowColor = b.col;
      ctx.beginPath();
      ctx.ellipse(bx, by, 10, 13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // highlight
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath();
      ctx.ellipse(bx - 3, by - 4, 3.5, 5, -0.4, 0, Math.PI * 2);
      ctx.fill();

      // knot
      ctx.fillStyle = b.col;
      ctx.beginPath();
      ctx.arc(bx, by + 13, 2, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}