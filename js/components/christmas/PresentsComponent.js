import {DrawComponent} from "@/core/DrawComponent";

/**
 * render presents during Christmas
 */
export class PresentsComponent extends DrawComponent {
  isEnabled(state) {
    return state.specialEvent === 'christmas';
  }

  draw(state) {
    const PRESENTS = [
      {x: 155, w: 22, h: 16, col: '#cc2020', ribbon: '#ffdd00'},
      {x: 185, w: 16, h: 12, col: '#2060cc', ribbon: '#ff80ff'},
      {x: 430, w: 20, h: 14, col: '#20aa40', ribbon: '#ff4040'},
      {x: 455, w: 14, h: 18, col: '#aa20cc', ribbon: '#ffffaa'},
      {x: 575, w: 18, h: 13, col: '#cc6020', ribbon: '#aaffaa'},
    ];
    const {ctx, H} = this;
    const {frame} = state;

    PRESENTS.forEach((pr, i) => {
      const y = H * 0.62;
      const bob = Math.sin(frame * 0.03 + i * 0.8) * 0.5;
      ctx.save();
      ctx.translate(pr.x, y + bob);
      // box
      ctx.fillStyle = pr.col;
      ctx.fillRect(-pr.w / 2, -pr.h, pr.w, pr.h);
      // shading on right side
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(pr.w / 2 - 5, -pr.h, 5, pr.h);
      // ribbon vertical
      ctx.fillStyle = pr.ribbon;
      ctx.fillRect(-2, -pr.h, 4, pr.h);
      // ribbon horizontal
      ctx.fillRect(-pr.w / 2, -pr.h / 2 - 2, pr.w, 4);
      // bow loops
      ctx.fillStyle = pr.ribbon;
      ctx.beginPath();
      ctx.ellipse(-6, -pr.h - 4, 7, 4, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(6, -pr.h - 4, 7, 4, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.arc(0, -pr.h - 4, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }
}
