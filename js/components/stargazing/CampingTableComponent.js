import {DrawComponent} from '@/core/DrawComponent';

/**
 * a lightweight folding camping table, part of the stargazing setup.
 */
export class CampingTableComponent extends DrawComponent {
  // offset from fox
  _offsetX = 210;
  _offsetY = 35;
  _scale = 0.97;

  static COMPONENT_NAME = 'CampingTableComponent';

  getName() {
    return CampingTableComponent.COMPONENT_NAME;
  }

  isEnabled() {
    return this.scene.stargazing;
  }

  draw() {
    const {ctx} = this;
    const {fox} = this.scene
    const x = fox.x + this._offsetX;
    const y = fox.y + this._offsetY;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(this._scale, this._scale);
    this._drawTable();
    ctx.restore();
  }

  _drawTable() {
    const {ctx} = this;
    const tw = 48; // table half-width
    const th = 4;  // tabletop thickness
    const tl = 22; // leg length

    // legs - thin aluminium folding legs
    ctx.strokeStyle = '#a0a8b0';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    // left leg pair (crossed)
    ctx.beginPath();
    ctx.moveTo(-tw + 6, -th);
    ctx.lineTo(-tw + 14, tl);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-tw + 14, -th);
    ctx.lineTo(-tw + 6, tl);
    ctx.stroke();
    // right leg pair (crossed)
    ctx.beginPath();
    ctx.moveTo(tw - 6, -th);
    ctx.lineTo(tw - 14, tl);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(tw - 14, -th);
    ctx.lineTo(tw - 6, tl);
    ctx.stroke();

    // leg feet
    ctx.strokeStyle = '#808890';
    ctx.lineWidth = 1.5;
    [[-tw + 6, tl], [-tw + 14, tl], [tw - 6, tl], [tw - 14, tl]].forEach(([fx, fy]) => {
      ctx.beginPath();
      ctx.moveTo(fx - 3, fy);
      ctx.lineTo(fx + 3, fy);
      ctx.stroke();
    });

    // cross brace
    ctx.strokeStyle = '#9098a0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-tw + 10, tl * 0.5);
    ctx.lineTo(tw - 10, tl * 0.5);
    ctx.stroke();

    // tabletop
    const topGrad = ctx.createLinearGradient(0, -th * 2, 0, 0);
    topGrad.addColorStop(0, '#d8dce0');
    topGrad.addColorStop(1, '#b8bcc0');
    ctx.fillStyle = topGrad;
    ctx.beginPath();
    ctx.roundRect(-tw, -th * 2, tw * 2, th * 2, 2);
    ctx.fill();
    ctx.strokeStyle = '#9098a0';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // tabletop highlight
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.roundRect(-tw + 3, -th * 2 + 1, tw * 2 - 6, th * 0.6, 1);
    ctx.fill();
  }
}
