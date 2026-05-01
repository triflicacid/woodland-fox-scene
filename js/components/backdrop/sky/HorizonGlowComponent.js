import {DrawComponent} from "@/core/DrawComponent";
import {TOD_BLEND} from "@/config";
import {clamp} from "@/utils";

/**
 * renders horizon glow when settled at dawn or twilight
 */
export class HorizonGlowComponent extends DrawComponent {
  static COMPONENT_NAME = "HorizonGlowComponent";

  getName() {
    return HorizonGlowComponent.COMPONENT_NAME;
  }

  isEnabled() {
    const {timeOfDay} = this.scene;
    return timeOfDay === 'dawn' || timeOfDay === 'twilight';
  }

  draw() {
    const {timeOfDay, todBlend: td} = this.scene;
    const proximity = clamp(1 - Math.abs(td - TOD_BLEND[timeOfDay]) / 0.15, 0, 1);
    if (proximity <= 0.01) return;
    if (timeOfDay === 'dawn') this._drawDawn(proximity);
    else this._drawTwilight(proximity);
  }

  _drawDawn(a) {
    const {ctx, W, H} = this;

    const band = ctx.createLinearGradient(0, H * 0.35, 0, H * 0.75);
    band.addColorStop(0, `rgba(255, 80, 20, 0)`);
    band.addColorStop(0.4, `rgba(255,120,30,${0.55 * a})`);
    band.addColorStop(0.7, `rgba(255,180,60,${0.3 * a})`);
    band.addColorStop(1, `rgba(255, 100, 20, 0)`);
    ctx.fillStyle = band;
    ctx.fillRect(0, H * 0.35, W, H * 0.4);
  }

  _drawTwilight(a) {
    const {ctx, W, H} = this;

    const band = ctx.createLinearGradient(0, H * 0.4, 0, H * 0.75);
    band.addColorStop(0, `rgba(160, 56, 32, 0)`);
    band.addColorStop(0.3, `rgba(200,70,30,${0.4 * a})`);
    band.addColorStop(0.65, `rgba(255,120,40,${0.35 * a})`);
    band.addColorStop(1, `rgba(255, 80, 20, 0)`);
    ctx.fillStyle = band;
    ctx.fillRect(0, H * 0.4, W, H * 0.35);
  }
}