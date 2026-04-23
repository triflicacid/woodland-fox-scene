import {DrawComponent} from "@/core/DrawComponent";
import {rnd, rndf} from "@/utils";

/**
 * render fallen/littered leaves during autumn
 */
export class FallenLeavesComponent extends DrawComponent {
  /** @type{Array<Object>} */
  leaves;

  initialise() {
    const {W, H} = this;
    this.leaves = Array.from({length: 80}, () => ({
      x: rnd(W),
      y: H * 0.62 + rnd(H * 0.25),
      size: 3 + rnd(4),
      rot: rnd(Math.PI * 2),
      hueOff: rndf(10),
    }));
  }

  isEnabled() {
    return this.scene.season === 'autumn';
  }

  draw() {
    const {ctx, W, H} = this;
    const {frame, weather} = this.scene;

    this.leaves.forEach(l => {
      ctx.save();
      ctx.translate(l.x, l.y);
      ctx.rotate(l.rot + Math.sin(frame * 0.01 + l.x * 0.05) * (weather === 'wind' ? 0.35 : 0.1));
      const hue = [18, 28, 38, 12, 45][Math.floor(l.x * 5 / W) % 5] + l.hueOff;
      ctx.fillStyle = `hsl(${hue},75%,45%)`;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.ellipse(0, 0, l.size, l.size * 0.55, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `hsl(${hue - 5},60%,35%)`;
      ctx.lineWidth = 0.6;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.moveTo(-l.size, 0);
      ctx.lineTo(l.size, 0);
      ctx.stroke();
      ctx.restore();
    });

    // wind-carried leaves
    if (weather === 'wind' || weather === 'storm') {
      this.leaves.slice(0, 25).forEach((l, i) => {
        const fl = (l.x + frame * 2 * (1 + i * 0.05)) % W;
        const fy = H * 0.55 + Math.sin(frame * 0.05 + i) * 30;
        ctx.save();
        ctx.translate(fl, fy);
        ctx.rotate(frame * 0.12 + i);
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = `hsl(${20 + i * 4},70%,45%)`;
        ctx.beginPath();
        ctx.ellipse(0, 0, 5, 3, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }
  }
}
