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

    // effects for time of day
    if (this.scene.timeOfDay === 'dawn') {
      const dawnSky = ctx.createLinearGradient(0, 0, 0, H * 0.7);
      dawnSky.addColorStop(0, '#1a1030');
      dawnSky.addColorStop(0.4, '#5a2040');
      dawnSky.addColorStop(0.7, '#c05030');
      dawnSky.addColorStop(1, '#e08040');
      ctx.globalAlpha = 0.75;
      ctx.fillStyle = dawnSky;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    } else if (this.scene.timeOfDay === 'twilight') {
      const twilightSky = ctx.createLinearGradient(0, 0, 0, H * 0.7);
      twilightSky.addColorStop(0, '#0a0818');
      twilightSky.addColorStop(0.3, '#1a0a30');
      twilightSky.addColorStop(0.6, '#5a1a30');
      twilightSky.addColorStop(1, '#a03820');
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = twilightSky;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }

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