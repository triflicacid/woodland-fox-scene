import {DrawComponent} from "@/core/DrawComponent";
import {TOD_BLEND} from "@/config";
import {clamp} from "@/utils";

/**
 * renders horizon glow during tod transitions and named dawn/twilight states.
 */
export class DuskGlowComponent extends DrawComponent {
  static COMPONENT_NAME = "DuskGlowComponent";

  getName() {
    return DuskGlowComponent.COMPONENT_NAME;
  }

  isEnabled() {
    const {timeOfDay, todBlend: t} = this.scene;
    if (timeOfDay === 'dawn' || timeOfDay === 'twilight') return true;
    return t > 0.1 && t < 0.9;
  }

  draw() {
    const {timeOfDay, todBlend: td} = this.scene;
    const atTarget = Math.abs(td - TOD_BLEND[timeOfDay]) < 0.05;
    if (timeOfDay === 'dawn' && atTarget) {
      this._drawDawn();
    } else if (timeOfDay === 'twilight' && atTarget) {
      this._drawTwilight();
    } else {
      this._drawTransitionGlow();
    }
  }

  _drawDawn() {
    const {ctx, W, H} = this;

    const band = ctx.createLinearGradient(0, H * 0.35, 0, H * 0.75);
    band.addColorStop(0, 'rgba(255,80,20,0)');
    band.addColorStop(0.4, 'rgba(255,120,30,0.55)');
    band.addColorStop(0.7, 'rgba(255,180,60,0.3)');
    band.addColorStop(1, 'rgba(255,100,20,0)');
    ctx.fillStyle = band;
    ctx.fillRect(0, H * 0.35, W, H * 0.4);

    const upper = ctx.createLinearGradient(0, 0, 0, H * 0.45);
    upper.addColorStop(0, 'rgba(120,80,160,0.18)');
    upper.addColorStop(1, 'rgba(200,120,80,0)');
    ctx.fillStyle = upper;
    ctx.fillRect(0, 0, W, H * 0.45);
  }

  _drawTwilight() {
    const {ctx, W, H} = this;

    const band = ctx.createLinearGradient(0, H * 0.4, 0, H * 0.75);
    band.addColorStop(0, 'rgba(160,56,32,0)');
    band.addColorStop(0.3, 'rgba(200,70,30,0.4)');
    band.addColorStop(0.65, 'rgba(255,120,40,0.35)');
    band.addColorStop(1, 'rgba(255,80,20,0)');
    ctx.fillStyle = band;
    ctx.fillRect(0, H * 0.4, W, H * 0.35);
  }

  _drawTransitionGlow() {
    const {ctx, W, H} = this;
    const td = this.scene.todBlend;

    const dg = clamp(1 - Math.abs(td - 0.5) * 8, 0, 1) * 0.38;
    const hor = ctx.createLinearGradient(0, H * 0.5, 0, H * 0.72);
    hor.addColorStop(0, `rgba(255,155,55,${dg})`);
    hor.addColorStop(1, 'rgba(255,90,10,0)');
    ctx.fillStyle = hor;
    ctx.fillRect(0, H * 0.5, W, H * 0.22);
  }
}
