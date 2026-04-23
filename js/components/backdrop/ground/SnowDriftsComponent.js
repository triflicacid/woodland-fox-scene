import {DrawComponent} from "@/core/DrawComponent";

/**
 * render snow drifts during winter
 */
export class SnowDriftsComponent extends DrawComponent {
  static COMPONENT_NAME = "SnowDriftsComponent";
  getName() {
    return SnowDriftsComponent.COMPONENT_NAME;
  }

  isEnabled() {
    return this.scene.season === 'winter';
  }

  draw() {
    const {ctx, H} = this;
    [[130, H * 0.62], [175, H * 0.62], [510, H * 0.62], [545, H * 0.62]].forEach(([sx, sy]) => {
      ctx.fillStyle = 'rgba(230,242,252,0.95)';
      ctx.beginPath();
      ctx.ellipse(sx, sy, 32, 10, 0, Math.PI, 0);
      ctx.fill();
    });
  }
}
