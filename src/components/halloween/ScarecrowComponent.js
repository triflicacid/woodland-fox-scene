import {DrawComponent} from "@/core/DrawComponent";

/**
 * render scarecrows during Halloween
 */
export class ScarecrowComponent extends DrawComponent {
  /** @type{Array<Object>} */
  scarecrows = [
    {x: 210, y: 0, dm: 0},
    {x: 490, y: 0, dm: 0},
  ];

  static COMPONENT_NAME = "ScarecrowComponent";

  getName() {
    return ScarecrowComponent.COMPONENT_NAME;
  }

  initialise() {
    this.scarecrows.forEach(s => {
      s.y = this.scene.groundY + (this.H * s.dm);
    });
  }

  isEnabled() {
    return this.scene.specialEvent === 'halloween';
  }

  draw() {
    const {ctx, H} = this;
    const {frame} = this.scene;

    this.scarecrows.forEach(({x, y}, i) => {
      const sway = Math.sin(frame * 0.02 + i) * 0.06;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(sway);
      // post
      ctx.strokeStyle = '#5a3a10';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -55);
      ctx.stroke();
      // crossbar
      ctx.beginPath();
      ctx.moveTo(-22, -38);
      ctx.lineTo(22, -38);
      ctx.stroke();
      // body - ragged coat
      ctx.fillStyle = '#5a3a18';
      ctx.beginPath();
      ctx.moveTo(-10, -48);
      ctx.lineTo(10, -48);
      ctx.lineTo(13, -22);
      ctx.lineTo(-13, -22);
      ctx.closePath();
      ctx.fill();
      // sleeves
      ctx.strokeStyle = '#5a3a18';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(-10, -40);
      ctx.lineTo(-22, -36);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(10, -40);
      ctx.lineTo(22, -36);
      ctx.stroke();
      // head
      ctx.fillStyle = '#e8a020';
      ctx.beginPath();
      ctx.arc(0, -56, 10, 0, Math.PI * 2);
      ctx.fill();
      // pumpkin face
      ctx.fillStyle = '#1a0800';
      ctx.beginPath();
      ctx.ellipse(-4, -57, 2, 3, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(4, -57, 2, 3, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-5, -52);
      ctx.lineTo(-2, -50);
      ctx.lineTo(1, -52);
      ctx.lineTo(4, -50);
      ctx.lineTo(5, -52);
      ctx.stroke();
      // hat
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(-10, -72, 20, 6);
      ctx.fillRect(-7, -84, 14, 14);
      ctx.restore();
    });
  }
}
