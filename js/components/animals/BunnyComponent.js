import {rnd} from '@/utils';
import {DrawComponent} from "@/core/DrawComponent";
import {Events} from "@/core/Events";

/**
 * render bunny which hops to greet the fox
 */
export class BunnyComponent extends DrawComponent {
  isEnabled() {
    const phase = this.scene.bunny.phase;
    return !(phase === 'off' || phase === 'done');
  }

  tick() {
    const {bunny, fox} = this.scene;
    bunny.phaseT++;

    if (bunny.phase === 'hopping_in') {
      if (this.scene.tickHop()) {
        bunny.hop.arc = 0;
        bunny.phase = 'fox_waking';
        bunny.phaseT = 0;
        fox.phase = 'bunny_standup';
        fox.phaseT = 0;
        fox.poseBlend = 0;
        this.eventBus.dispatch(Events.statusText(this.getName(), 'The fox stirs...'));
        this.eventBus.dispatch(Events.characterAction(this.getName(), 'bunny', 'nuzzle.prepare'));
      }

    } else if (bunny.phase === 'fox_waking') {
      if (bunny.phaseT >= 90) {
        bunny.phase = 'nuzzle';
        bunny.phaseT = 0;
        this.scene.hearts = [];
        this.eventBus.dispatch(Events.statusText(this.getName(), 'They touch noses...'));
        this.eventBus.dispatch(Events.characterAction(this.getName(), 'bunny', 'nuzzle.start'));
      }

    } else if (bunny.phase === 'nuzzle') {
      bunny.hop.arc = 0;
      // spawn heart particles periodically
      if (bunny.phaseT % 20 === 0 && bunny.phaseT < 140) {
        const noseX = (bunny.x + 35 + fox.x - 34) / 2;
        this.scene.hearts.push({
          x: noseX + (Math.random() - 0.5) * 20,
          y: bunny.y - 72,
          vy: -0.55 - rnd(0.45),
          life: 0,
        });
      }
      this.scene.hearts = this.scene.hearts.filter(h => {
        h.y += h.vy;
        h.life++;
        return h.life < 65;
      });

      if (bunny.phaseT >= 160) {
        bunny.phase = 'fox_sleep';
        bunny.phaseT = 0;
        fox.phase = 'bunny_curling';
        fox.phaseT = 0;
        this.scene.hearts = [];
        this.eventBus.dispatch(Events.statusText(this.getName(), 'The fox drifts off...'));
        this.eventBus.dispatch(Events.characterAction(this.getName(), 'bunny', 'nuzzle.end'));
      }

    } else if (bunny.phase === 'fox_sleep') {
      if (bunny.phaseT >= 95) {
        bunny.phase = 'hopping_out';
        bunny.phaseT = 0;
        this.scene.startHop(bunny.x, this.W + 90, 130);
        this.eventBus.dispatch(Events.statusText(this.getName(), 'The bunny hops off...'));
      }

    } else if (bunny.phase === 'hopping_out') {
      if (this.scene.tickHop()) {
        bunny.phase = 'done';
        this.eventBus.dispatch(Events.statusText(this.getName(), 'Curled up, fast asleep...'));
        this.eventBus.dispatch(Events.setMainButtons(this.getName(), true));
        this.eventBus.dispatch(Events.characterAction(this.getName(), 'bunny', 'exit'));
      }
    }
  }

  draw() {
    const {ctx} = this;
    const {bunny, fox} = this.scene;

    this._drawBunny(bunny.x, bunny.y, bunny.hop.arc);

    // nuzzle glow between bunny and fox noses
    if (bunny.phase === 'nuzzle') {
      const pulse = 0.22 + 0.22 * Math.sin(bunny.phaseT * 0.15);
      const nx = (bunny.x + 35 + fox.x - 34) / 2;
      const ny = bunny.y - 60;
      ctx.save();
      ctx.globalAlpha = pulse;
      const grd = ctx.createRadialGradient(nx, ny, 2, nx, ny, 34);
      grd.addColorStop(0, '#ffe8bb');
      grd.addColorStop(1, 'rgba(255,200,100,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(nx, ny, 34, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  /**
   * draw the bunny sprite at the given position.
   * arcT controls the hop arc (0 = grounded, peaks at 0.5).
   * @param {number} bx
   * @param {number} by
   * @param {number} arcT
   */
  _drawBunny(bx, by, arcT) {
    const {ctx} = this;
    const lift = Math.sin(arcT * Math.PI) * 24;

    ctx.save();
    ctx.translate(bx, by);

    // shrinking shadow as bunny lifts
    ctx.save();
    const ss = 1 - (lift / 24) * 0.55;
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath();
    ctx.ellipse(0, 2, 22 * ss, 5 * ss, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.translate(0, -lift);

    const body = '#8B3A10', dark = '#5c2208', lite = '#c0622a', belly = '#c8905a';

    // back legs and haunches
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.ellipse(-10, 4, 14, 6, -0.3, 0, Math.PI * 2);
    ctx.fill();
    const kick = Math.sin(arcT * Math.PI) * 10;
    ctx.beginPath();
    ctx.ellipse(-18 - kick * 0.6, 6, 11, 4, -0.15, 0, Math.PI * 2);
    ctx.fill();

    // main body
    const bg2 = ctx.createRadialGradient(2, -10, 3, -2, -8, 22);
    bg2.addColorStop(0, lite);
    bg2.addColorStop(0.5, body);
    bg2.addColorStop(1, dark);
    ctx.fillStyle = bg2;
    ctx.beginPath();
    ctx.ellipse(-2, -8, 18, 13, 0.15, 0, Math.PI * 2);
    ctx.fill();

    // belly
    ctx.fillStyle = belly;
    ctx.beginPath();
    ctx.ellipse(-4, -5, 8, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // front paws
    const ftuck = Math.sin(arcT * Math.PI) * 6;
    ctx.strokeStyle = dark;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(8, -4);
    ctx.lineTo(13, -4 + ftuck);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(4, -4);
    ctx.lineTo(8, -4 + ftuck * 0.6);
    ctx.stroke();

    // tail
    ctx.fillStyle = '#ede8e0';
    ctx.beginPath();
    ctx.arc(-16, -5, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-15, -6, 3, 0, Math.PI * 2);
    ctx.fill();

    // neck
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(12, -16, 8, 7, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // head
    const hx = 18, hy = -27;
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(hx, hy, 13, 11, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = lite;
    ctx.beginPath();
    ctx.ellipse(hx + 10, hy + 3, 8, 5.5, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // ears
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.moveTo(hx - 5, hy - 7);
    ctx.bezierCurveTo(hx - 10, hy - 28, hx - 13, hy - 37, hx - 10, hy - 41);
    ctx.bezierCurveTo(hx - 6, hy - 37, hx - 3, hy - 27, hx - 3, hy - 7);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.moveTo(hx + 1, hy - 8);
    ctx.bezierCurveTo(hx - 3, hy - 30, hx - 7, hy - 40, hx - 4, hy - 44);
    ctx.bezierCurveTo(hx, hy - 40, hx + 4, hy - 29, hx + 5, hy - 8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#c06868';
    ctx.beginPath();
    ctx.moveTo(hx, hy - 9);
    ctx.bezierCurveTo(hx - 2, hy - 28, hx - 5, hy - 38, hx - 3, hy - 42);
    ctx.bezierCurveTo(hx - 1, hy - 38, hx + 2, hy - 27, hx + 3, hy - 9);
    ctx.closePath();
    ctx.fill();

    // eye
    ctx.fillStyle = '#120500';
    ctx.beginPath();
    ctx.arc(hx + 6, hy - 2, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b86020';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(hx + 6, hy - 2, 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(hx + 7, hy - 3, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // nose
    ctx.fillStyle = '#6a2828';
    ctx.beginPath();
    ctx.ellipse(hx + 17, hy + 4, 2.5, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
