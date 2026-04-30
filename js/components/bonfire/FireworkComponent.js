import {DrawComponent} from '@/core/DrawComponent';
import {PROBABILITY} from '@/config';
import {prob, rnd, rndf} from '@/utils';
import {Events} from '@/core/Events';

/**
 * fireworks with coloured burst explosions.
 * fires an event on loud bangs so the fox can react.
 */
export class FireworksComponent extends DrawComponent {
  /** @type {Array<Object>} rockets in flight */
  rockets = [];
  /** @type {Array<Object>} active burst particles */
  bursts = [];

  static COMPONENT_NAME = "FireworksComponent";

  getName() {
    return FireworksComponent.COMPONENT_NAME;
  }

  isEnabled() {
    return this.scene.weather !== 'storm'
        && this.scene.isNight()
        && (this.scene.specialEvent === 'bonfire' || this.scene.specialEvent === 'birthday');
  }

  tick() {
    const {W, H} = this;
    const {weather} = this.scene;

    // randomly launch a new rocket
    if (prob(PROBABILITY.FIREWORK_LAUNCH)) {
      const loud = prob(PROBABILITY.LOUD_FIREWORK);
      this.rockets.push({
        x: 100 + rnd(W - 200),
        y: H * 0.62,
        vy: -(5 + rnd(4)),
        vx: rndf(1.2),
        targetY: H * (0.05 + rnd(0.25)),
        trail: [],
        loud,
        hue: Math.floor(rnd(360)),
      });
    }

    // tick rockets
    this.rockets = this.rockets.filter(r => {
      r.trail.push({x: r.x, y: r.y});
      if (r.trail.length > 12) r.trail.shift();
      r.x += r.vx;
      r.y += r.vy;
      r.vy *= 0.98; // slight deceleration
      if (weather === 'wind' || weather === 'storm') {
        r.vx += 0.04; // wind movement
      }

      if (r.y <= r.targetY) {
        this._explode(r);
        return false;
      }
      return true;
    });

    // tick burst particles
    this.bursts = this.bursts.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.09; // gravity
      if (weather === 'wind' || weather === 'storm') {
        p.vx += 0.12; // wind blows particles rightward
      }
      p.life++;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);
      return p.alpha > 0;
    });
  }

  draw() {
    const {ctx} = this;

    // draw rocket trails
    this.rockets.forEach(r => {
      r.trail.forEach((pt, i) => {
        const t = i / r.trail.length;
        ctx.save();
        ctx.globalAlpha = t * 0.8;
        ctx.fillStyle = `hsl(${r.hue}, 80%, 70%)`;
        ctx.shadowBlur = 4;
        ctx.shadowColor = `hsl(${r.hue}, 80%, 70%)`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, t * 2.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    });

    // draw burst particles
    this.bursts.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha * 0.9;
      ctx.fillStyle = p.col;
      ctx.shadowBlur = p.glow;
      ctx.shadowColor = p.col;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  /**
   * explode a rocket into a burst of particles.
   * @param {Object} rocket
   */
  _explode(rocket) {
    const {weather} = this.scene;
    const count = rocket.loud ? 80 + Math.floor(rnd(40)) : 30 + Math.floor(rnd(20));
    const speed = rocket.loud ? 4 + rnd(2) : 2 + rnd(1.5);
    const maxLife = rocket.loud ? 70 + Math.floor(rnd(20)) : 40 + Math.floor(rnd(15));
    const glow = rocket.loud ? 12 : 6;
    const size = rocket.loud ? 2.5 + rnd(1.5) : 1.5 + rnd(1);
    const windBias = (weather === 'wind' || weather === 'storm') ? 1.9 : 0;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + rndf(0.2);
      const s = speed * (0.5 + rnd(0.5));
      // vary hue slightly per particle for a richer burst
      const hue = (rocket.hue + rndf(20)) % 360;
      this.bursts.push({
        x: rocket.x,
        y: rocket.y,
        vx: Math.cos(angle) * s + windBias,
        vy: Math.sin(angle) * s,
        col: `hsl(${hue}, 90%, 65%)`,
        alpha: 1,
        size,
        glow,
        life: 0,
        maxLife,
      });
    }

    // fire event so fox can react
    if (rocket.loud) {
      this.eventBus.dispatch(Events.fireworkBang('FireworksComponent', true));
    }
  }
}
