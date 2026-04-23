import {DrawComponent} from "@/core/DrawComponent";

/**
 * render grass blades in foreground
 */
export class GrassComponent extends DrawComponent {
  static COMPONENT_NAME = "GrassComponent";
  getName() {
    return GrassComponent.COMPONENT_NAME;
  }

  draw() {
    const {ctx, W, H} = this;
    const {season, weather, frame} = this.scene;

    if (season !== 'winter') {
      const p = this.scene.pal();
      const wsh = weather === 'wind' ? Math.sin(frame * 0.04) * 10
          : weather === 'storm' ? Math.sin(frame * 0.06) * 14 : 0;
      for (let gx = 10; gx < W; gx += 18) {
        const sw = Math.sin(frame * 0.018 + gx * 0.07) * 3 + wsh;
        ctx.strokeStyle = `hsl(${p.gH + Math.sin(gx) * 8},${p.gSat}%,${p.gL + Math.sin(gx * 0.3) * 4}%)`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(gx, H - 16);
        ctx.quadraticCurveTo(gx + sw, H - 30, gx + sw * 1.5, H - 42);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(gx + 7, H - 18);
        ctx.quadraticCurveTo(gx + 7 + sw * 0.7, H - 26, gx + 7 + sw, H - 34);
        ctx.stroke();
      }
    } else {
      for (let gx = 10; gx < W; gx += 28) {
        ctx.strokeStyle = 'rgba(180,200,220,0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(gx, H * 0.62);
        ctx.lineTo(gx, H * 0.62 - 12);
        ctx.stroke();
      }
    }
  }
}
