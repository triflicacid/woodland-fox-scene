import {DrawComponent} from "@/core/DrawComponent";
import {clamp, rnd} from "@/utils";
import {Subscriptions} from "@/core/Subscriptions";

/**
 * render fireflies during nighttime
 */
export class FirefliesComponent extends DrawComponent {
  /** @type{Array<Object>} */
  fireflies = [];

  initialise() {
    this._generateFireflies();

    this.eventBus.subscribe(Subscriptions.onSceneStateMutation(this.getName(), state => {
      if (this.isEnabled(state)) {
        this._generateFireflies();
      }
    }));
  }

  /**
   * generate fireflies
   */
  _generateFireflies() {
    if (this.scene.specialEvent === 'bonfire') return; // reasoning: too loud

    const {W, H} = this;
    const max = 48, min = 8;
    const t = Math.abs(this.scene.moonPhase - 4) / 4; // 0 at full, 1 at new
    const length = Math.round(min + (max - min) * t * t);

    this.fireflies = Array.from({length}, () => ({
      x: 80 + rnd(W - 160),
      y: H * 0.35 + rnd(H * 0.3),
      speed: 0.3 + rnd(0.4),
      angle: rnd(Math.PI * 2),
      phase: rnd(Math.PI * 2),
      size: 1.5 + rnd(1.5),
    }));
  }

  isEnabled() {
    return this.scene.todBlend < 0.5 && !(this.scene.weather === 'rain' || this.scene.weather === 'storm');
  }

  tick() {
    const {W, H} = this;

    this.fireflies.forEach(f => {
      f.angle += (Math.random() - 0.5) * 0.08;
      f.x += Math.cos(f.angle) * f.speed;
      f.y += Math.sin(f.angle) * f.speed * 0.5;
      f.x = clamp(f.x, 60, W - 60);
      f.y = clamp(f.y, H * 0.3, H * 0.65);
    });
  }

  draw() {
    const {ctx} = this;
    const {todBlend, frame} = this.scene;

    const alpha = clamp(1 - todBlend * 2, 0, 1);
    this.fireflies.forEach(f => {
      const g = 0.4 + 0.6 * Math.sin(frame * 0.05 + f.phase);
      ctx.save();
      ctx.globalAlpha = g * 0.85 * alpha;
      ctx.shadowBlur = 12 + g * 8;
      ctx.shadowColor = '#aaff88';
      ctx.fillStyle = '#ccff99';
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }
}
