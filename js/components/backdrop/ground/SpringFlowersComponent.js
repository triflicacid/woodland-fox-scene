import {DrawComponent} from "@/core/DrawComponent";

/**
 * render springtime flowers with wind sway and eclipse wilting.
 */
export class SpringFlowersComponent extends DrawComponent {
  flowers = [
    {x: 220, c: '#ff88cc'}, {x: 250, c: '#ffdd44'}, {x: 310, c: '#ff99dd'},
    {x: 380, c: '#ffffaa'}, {x: 420, c: '#ff88bb'}, {x: 475, c: '#ddffaa'},
    {x: 160, c: '#ffaaee'}, {x: 540, c: '#ffcc44'},
  ];
  flowersYDeltaM = 0.04;

  static COMPONENT_NAME = 'SpringFlowersComponent';

  getName() {
    return SpringFlowersComponent.COMPONENT_NAME;
  }

  isEnabled() {
    return this.scene.season === 'spring';
  }

  draw() {
    const {ctx, H} = this;
    const {frame, specialEvent, weather, groundY} = this.scene;
    const wilting = specialEvent === 'eclipse';
    const windy = weather === 'wind' || weather === 'storm';
    const windAmt = windy ? Math.sin(frame * 0.06) * 8 : 0;
    const y = groundY + (H * this.flowersYDeltaM);

        ctx.save();
    this.flowers.forEach(f => {
      const stemLen = 8;
      const droop = wilting ? Math.PI * 0.55 : 0;
      const sway = windAmt + Math.sin(frame * 0.04 + f.x * 0.07) * (wilting ? 1 : 2);
      const bob = wilting ? 0 : Math.sin(frame * 0.04 + f.x * 0.1) * 0.8;

      // tip position
      const tipX = f.x + Math.sin(droop) * stemLen + sway;
      const tipY = y - Math.cos(droop) * stemLen;

      // stem
      ctx.strokeStyle = '#4a8a20';
      ctx.lineWidth = 1.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(f.x, y);
      ctx.quadraticCurveTo(
          f.x + Math.sin(droop) * stemLen * 0.5 + sway * 0.5,
          y - stemLen * 0.5,
          tipX, tipY
      );
      ctx.stroke();

      const hx = tipX;
      const hy = tipY + bob;

      // petals
      ctx.globalAlpha = wilting ? 0.4 : 0.85;
      ctx.fillStyle = wilting ? '#888888' : f.c;
      ctx.beginPath();
      ctx.arc(hx, hy, 4, 0, Math.PI * 2);
      ctx.fill();

      // centre
      ctx.globalAlpha = wilting ? 0.5 : 1;
      ctx.fillStyle = wilting ? '#aaaaaa' : '#ffffee';
      ctx.beginPath();
      ctx.arc(hx, hy, 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }
}