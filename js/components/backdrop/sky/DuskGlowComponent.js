import {DrawComponent} from "@/core/DrawComponent";
import {clamp} from "@/utils";

/**
 * render the dawn/duck glow in tod transition
 */
export class DuskGlowComponent extends DrawComponent {
  isEnabled(state) {
    return state.todBlend > 0.1 && state.todBlend < 0.9;
  }

  draw(state) {
    const {ctx, W, H} = this;
    const td = state.todBlend;

    const dg = clamp(1 - Math.abs(td - 0.5) * 8, 0, 1) * 0.38;
    const hor = ctx.createLinearGradient(0, H * 0.5, 0, H * 0.72);
    hor.addColorStop(0, `rgba(255,155,55,${dg})`);
    hor.addColorStop(1, 'rgba(255,90,10,0)');
    ctx.fillStyle = hor;
    ctx.fillRect(0, H * 0.5, W, H * 0.22);
  }
}
