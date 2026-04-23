import {DrawComponent} from "@/core/DrawComponent";
import {clamp} from "@/utils";

/**
 * render the stars in the night sky on a clear day
 */
export class StarsComponent extends DrawComponent {
  static COMPONENT_NAME = "StarsComponent";
  getName() {
    return StarsComponent.COMPONENT_NAME;
  }

  isEnabled() {
    const {weather} = this.scene;
    return this.scene.isNight() && (weather === 'clear' || weather === 'wind');
  }

  draw() {
    const {ctx} = this;
    const {todBlend: td, frame} = this.scene;
    const stars = [
      [80, 30], [140, 18], [220, 40], [310, 12], [410, 28], [480, 15],
      [55, 60], [165, 45], [270, 25], [340, 50], [450, 8], [520, 38],
      [620, 20], [670, 45], [700, 10],
    ];

    stars.forEach(([sx, sy], i) => {
      ctx.globalAlpha = clamp(
          (1 - td * 2) * (0.3 + 0.4 * (0.5 + 0.5 * Math.sin(frame * 0.02 + i * 1.3))),
          0, 1
      );
      ctx.fillStyle = 'rgba(255,255,230,0.8)';
      ctx.beginPath();
      ctx.arc(sx, sy, 1, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }
}
