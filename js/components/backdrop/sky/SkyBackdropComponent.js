import {DrawComponent} from "@/core/DrawComponent";
import {clamp} from "@/utils";

/**
 * render the sky backdrop (no moons etc.)
 */
export class SkyBackdropComponent extends DrawComponent {
  static COMPONENT_NAME = "SkyBackdropComponent";

  getName() {
    return SkyBackdropComponent.COMPONENT_NAME;
  }

  draw() {
    const {ctx, W, H} = this;
    const {weather, todBlend: td} = this.scene;
    const p = this.scene.pal();

    // base night sky
    const skyN = ctx.createLinearGradient(0, 0, 0, H * 0.7);
    skyN.addColorStop(0, p.sky0);
    skyN.addColorStop(0.5, p.sky1);
    skyN.addColorStop(1, p.sky2);
    ctx.fillStyle = skyN;
    ctx.fillRect(0, 0, W, H);

    // day sky overlay
    if (weather !== 'storm' && weather !== 'rain') {
      const skyD = ctx.createLinearGradient(0, 0, 0, H * 0.7);
      skyD.addColorStop(0, p.daySky0);
      skyD.addColorStop(0.5, p.daySky1);
      skyD.addColorStop(1, p.daySky2);
      ctx.globalAlpha = td;
      ctx.fillStyle = skyD;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    } else {
      ctx.fillStyle = '#1a2030';
      ctx.globalAlpha = 0.85;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }

    // eclipse sky darkening - deep purple overlay
    if (this.scene.specialEvent === 'eclipse') {
      const sa = clamp((td - 0.2) / 0.6, 0, 1);
      ctx.fillStyle = `rgba(10,4,20,${0.88 * sa})`;
      ctx.fillRect(0, 0, W, H);
    }
  }
}