import {DrawComponent} from "@/core/DrawComponent";

/**
 * render some springtime flowers
 */
export class SpringFlowersComponent extends DrawComponent {
  isEnabled(state) {
    return state.season === 'spring';
  }

  draw(state) {
    const {ctx, H} = this;
    const {frame} = state;
    [
      {x: 220, c: '#ff88cc'}, {x: 250, c: '#ffdd44'}, {x: 310, c: '#ff99dd'},
      {x: 380, c: '#ffffaa'}, {x: 420, c: '#ff88bb'}, {x: 475, c: '#ddffaa'},
      {x: 160, c: '#ffaaee'}, {x: 540, c: '#ffcc44'},
    ].forEach(f => {
      const bob = Math.sin(frame * 0.04 + f.x * 0.1) * 0.8;
      ctx.fillStyle = f.c;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.arc(f.x, H * 0.66 + bob, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffee';
      ctx.beginPath();
      ctx.arc(f.x, H * 0.66 + bob, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });
  }
}
