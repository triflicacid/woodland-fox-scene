import {DrawComponent} from "@/core/DrawComponent";

/**
 * render gravestone in the Halloween event
 */
export class GravestoneComponent extends DrawComponent {
  /** @type{Array<object>} */
  gravestones = [
    {x: 160, y: 0, dm: 0, lean: -0.08},
    {x: 230, y: 0, dm: 0, lean:  0.05},
    {x: 290, y: 0, dm: 0, lean: -0.04},
    {x: 460, y: 0, dm: 0, lean:  0.07},
    {x: 530, y: 0, dm: 0, lean: -0.06},
  ];

  static COMPONENT_NAME = "GravestoneComponent";

  getName() {
    return GravestoneComponent.COMPONENT_NAME;
  }

  initialise() {
    this.gravestones.forEach(g => {
      g.y = this.scene.groundY + (this.H * g.dm);
    });
  }

  isEnabled() {
    return this.scene.specialEvent === 'halloween';
  }

  draw() {
    const {ctx, H} = this;

    this.gravestones.forEach(g => {
      ctx.save();
      ctx.translate(g.x, g.y);
      ctx.rotate(g.lean);
      // stone
      ctx.fillStyle = '#4a4a5a';
      ctx.beginPath();
      ctx.roundRect(-10, -36, 20, 36, [8, 8, 2, 2]);
      ctx.fill();
      // moss
      ctx.fillStyle = '#3a5a3a';
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.ellipse(0, -36, 10, 5, 0, Math.PI, 0);
      ctx.fill();
      ctx.globalAlpha = 1;
      // RIP text
      ctx.fillStyle = '#8a8aaa';
      ctx.font = 'bold 7px serif';
      ctx.textAlign = 'center';
      ctx.fillText('RIP', 0, -20);
      ctx.restore();
    });
  }
}
