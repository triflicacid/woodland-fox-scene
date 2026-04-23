import {DrawComponent} from '@/core/DrawComponent';
import {getTreeTopPos} from '@/components/TreeComponent';
import {BALLOON_PALETTE} from "@/components/birthday/BalloonsComponent";

const LEFT_TREE_IDX = 2;
const RIGHT_TREE_IDX = 9;
const FLAG_COUNT = 14;
const FLAG_W = 14;
const FLAG_H = 18;

/**
 * draws a string of bunting flags between the two large foreground trees.
 * flags sway in wind.
 */
export class BuntingComponent extends DrawComponent {
  isEnabled() {
    const {specialEvent} = this.scene;
    return specialEvent === 'birthday' || specialEvent === 'easter';
  }

  draw() {
    const {ctx} = this;
    const {weather, season, frame, trees, specialEvent} = this.scene;

    const leftTree = trees[LEFT_TREE_IDX];
    const rightTree = trees[RIGHT_TREE_IDX];
    const leftPos = getTreeTopPos(leftTree, weather, season, specialEvent, frame, this.H);
    const rightPos = getTreeTopPos(rightTree, weather, season, specialEvent, frame, this.H);

    const ax1 = leftPos.x, ay1 = leftPos.y + 10;
    const ax2 = rightPos.x, ay2 = rightPos.y + 10;

    const sagY = 30 + (weather === 'wind' || weather === 'storm' ? 15 : 0);
    const midX = (ax1 + ax2) / 2;
    const midY = (ay1 + ay2) / 2 + sagY;

    // string
    ctx.strokeStyle = 'rgba(80,60,40,0.7)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ax1, ay1);
    ctx.quadraticCurveTo(midX, midY, ax2, ay2);
    ctx.stroke();

    // flags
    for (let i = 0; i < FLAG_COUNT; i++) {
      const t = i / (FLAG_COUNT - 1);
      const fx = (1 - t) * (1 - t) * ax1 + 2 * (1 - t) * t * midX + t * t * ax2;
      const fy = (1 - t) * (1 - t) * ay1 + 2 * (1 - t) * t * midY + t * t * ay2;
      const col = BALLOON_PALETTE[i % BALLOON_PALETTE.length];

      const sway = (weather === 'wind' || weather === 'storm')
          ? Math.sin(frame * 0.06 + i * 0.4) * 0.25 : 0;

      ctx.save();
      ctx.translate(fx, fy);
      ctx.rotate(sway);

      // triangle pointing straight down
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(-FLAG_W / 2, 0);
      ctx.lineTo(FLAG_W / 2, 0);
      ctx.lineTo(0, FLAG_H);
      ctx.closePath();
      ctx.fill();

      // sheen on left face
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.moveTo(-FLAG_W / 2, 0);
      ctx.lineTo(0, 0);
      ctx.lineTo(-FLAG_W * 0.1, FLAG_H * 0.5);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  }
}