import {DrawComponent} from '@/core/DrawComponent';
import {PROBABILITY} from '@/config';
import {clamp, eo, lerp, prob} from '@/utils';
import {Events} from "@/event/Events";

const PHASES = {
  off: null,
  entering: {f: 180},
  watching: {f: 80},
  salute: {f: 60},
  leaving: {f: 180},
};

/**
 * guy fawkes occasionally wanders in from one side,
 * watches the bonfire, raises his fist in salute, then leaves.
 * only active during bonfire night special event.
 */
export class GuyFawkesComponent extends DrawComponent {
  _phase = 'off';
  _phaseT = 0;
  _x = 0;
  _fromRight = false;
  _cooldown = 0;

  /**
   * summon guy fawkes immediately.
   */
  summon() {
    if (this._phase !== 'off') return;
    this._start();
  }

  isEnabled(state) {
    // check phase to allow for manual overriding
    return state.specialEvent === 'bonfire' || this._phase !== 'off';
  }

  tick(state, setStatus, enableButtons) {
    this._cooldown--;

    if (this._phase === 'off') {
      if (this._cooldown <= 0 && prob(PROBABILITY.GUY_FAWKES)) {
        this._start();
        setStatus('A mysterious cloaked figure approaches...');
      }
      return;
    }

    this._phaseT++;
    const cfg = PHASES[this._phase];
    const t = clamp(this._phaseT / cfg.f, 0, 1);
    const targetX = state.bonfire.x + (this._fromRight ? 90 : -90);
    const startX = this._fromRight ? state.W + 40 : -40;
    const exitX = this._fromRight ? -40 : state.W + 40;

    if (this._phase === 'entering') {
      this._x = lerp(startX, targetX, eo(t));
      if (this._phaseT >= cfg.f) {
        this._phase = 'watching';
        this._phaseT = 0;
        setStatus('The figure stares into the flames...');
        this.eventBus.receive(Events.characterAction(this.getName(), 'guyfawkes', 'watch.start'));
      }

    } else if (this._phase === 'watching') {
      // slight sway while watching
      this._x = targetX + Math.sin(this._phaseT * 0.03) * 3;
      if (this._phaseT >= cfg.f) {
        this._phase = 'salute';
        this._phaseT = 0;
        setStatus('Remember, remember...');
        this.eventBus.receive(Events.characterAction(this.getName(), 'guyfawkes', 'salute'));
      }

    } else if (this._phase === 'salute') {
      this._x = targetX;
      if (this._phaseT >= cfg.f) {
        this._phase = 'leaving';
        this._phaseT = 0;
        setStatus('The figure slips back into the dark...');
        this.eventBus.receive(Events.characterAction(this.getName(), 'guyfawkes', 'watch.end'));
      }

    } else if (this._phase === 'leaving') {
      this._x = lerp(targetX, exitX, eo(t));
      if (this._phaseT >= cfg.f) {
        this._phase = 'off';
        this._phaseT = 0;
        this._cooldown = 1800;
        setStatus('Curled up, fast asleep...');
        this.eventBus.receive(Events.characterAction(this.getName(), 'guyfawkes', 'exit'));
      }
    }
  }

  draw(state) {
    if (this._phase === 'off') return;
    const y = state.H * 0.62;
    const saluting = this._phase === 'salute';
    const facingRight = !this._fromRight; // faces toward bonfire
    this._drawGuyFawkes(this._x, y, facingRight, saluting, state.frame);
  }

  /**
   * start a new guy fawkes appearance.
   */
  _start() {
    this._fromRight = prob(0.5);
    this._phase = 'entering';
    this._phaseT = 0;
    this._cooldown = 2400;
    this.eventBus.receive(Events.characterAction(this.getName(), 'guyfawkes', 'enter'));
  }

  /**
   * draw the guy fawkes figure.
   * @param {number} x
   * @param {number} y
   * @param {boolean} facingRight
   * @param {boolean} saluting
   * @param {number} frame
   */
  _drawGuyFawkes(x, y, facingRight, saluting, frame) {
    const {ctx} = this;

    ctx.save();
    ctx.translate(x, y);
    if (!facingRight) ctx.scale(-1, 1);

    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 2, 18, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // cloak - dark flowing shape
    ctx.fillStyle = '#1a1a2a';
    ctx.beginPath();
    ctx.moveTo(-16, 0);
    ctx.bezierCurveTo(-20, -20, -18, -40, -12, -50);
    ctx.lineTo(12, -50);
    ctx.bezierCurveTo(18, -40, 20, -20, 16, 0);
    ctx.closePath();
    ctx.fill();

    // cloak highlight
    ctx.fillStyle = '#2a2a3a';
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.bezierCurveTo(-8, -20, -6, -40, -2, -50);
    ctx.lineTo(2, -50);
    ctx.bezierCurveTo(6, -40, 8, -20, 6, 0);
    ctx.closePath();
    ctx.fill();

    // cloak bottom scallop edge
    ctx.fillStyle = '#1a1a2a';
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(i * 5.5, 0, 5, 0, Math.PI);
      ctx.fill();
    }

    // legs
    ctx.strokeStyle = '#111120';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    const legSway = Math.sin(frame * 0.08) * (this._phase === 'watching' || this._phase === 'salute' ? 0 : 3);
    ctx.beginPath();
    ctx.moveTo(-5, -8);
    ctx.lineTo(-6, 2 + legSway);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(5, -8);
    ctx.lineTo(6, 2 - legSway);
    ctx.stroke();

    // boots
    ctx.fillStyle = '#0a0a14';
    ctx.beginPath();
    ctx.ellipse(-6, 3, 6, 3, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(6, 3, 6, 3, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // arms only visible when watching or saluting
    if (this._phase === 'watching' || this._phase === 'salute') {
      // fist rises from side of cloak as he watches
      // t goes 0->1 over watching phase, then holds at 1 during salute
      const riseT  = this._phase === 'salute' ? 1
          : clamp(this._phaseT / 40, 0, 1); // rises over first 40 frames of watching

      // pump slightly during salute
      const pump   = this._phase === 'salute'
          ? Math.sin(this._phaseT * 0.25) * 4 : 0;

      // emerges from right side of cloak, punches upward
      const fistX  = 14;
      const fistY  = -44 - riseT * 36 + pump; // rises from cloak hem to above head

      // arm - only visible portion above cloak edge
      const armStartY = -36; // cloak edge
      if (fistY < armStartY) {
        ctx.strokeStyle = '#1a1a2a';
        ctx.lineWidth   = 5;
        ctx.lineCap     = 'round';
        ctx.beginPath();
        ctx.moveTo(fistX, armStartY);
        ctx.lineTo(fistX, fistY + 4);
        ctx.stroke();
      }

      // fist
      ctx.fillStyle = '#c8a878';
      ctx.beginPath();
      ctx.arc(fistX, fistY, 4.5, 0, Math.PI * 2);
      ctx.fill();
      // knuckle lines
      ctx.strokeStyle = '#a07848';
      ctx.lineWidth   = 0.8;
      [-2, 0, 2].forEach(ky => {
        ctx.beginPath();
        ctx.moveTo(fistX - 3, fistY + ky);
        ctx.lineTo(fistX + 3, fistY + ky);
        ctx.stroke();
      });
    }


    // neck
    ctx.fillStyle = '#c8a878';
    ctx.beginPath();
    ctx.rect(-4, -58, 8, 10);
    ctx.fill();

    // head
    ctx.fillStyle = '#d4b088';
    ctx.beginPath();
    ctx.arc(0, -64, 10, 0, Math.PI * 2);
    ctx.fill();

    // guy fawkes mask features - pale with rosy cheeks, thin moustache, pointed beard
    // face base - slightly pale
    ctx.fillStyle = '#e8d0a8';
    ctx.beginPath();
    ctx.arc(0, -64, 9, 0, Math.PI * 2);
    ctx.fill();

    // rosy cheeks
    ctx.fillStyle = 'rgba(200,100,80,0.3)';
    ctx.beginPath();
    ctx.ellipse(-5, -62, 3.5, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(5, -62, 3.5, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // eyes - dark, slightly upturned
    ctx.fillStyle = '#1a0a00';
    ctx.beginPath();
    ctx.ellipse(-3.5, -66, 2, 1.5, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(3.5, -66, 2, 1.5, 0.2, 0, Math.PI * 2);
    ctx.fill();
    // eyebrow arch
    ctx.strokeStyle = '#3a1a00';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(-3.5, -68, 2.5, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(3.5, -68, 2.5, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();

    // thin curled moustache
    ctx.strokeStyle = '#2a1000';
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, -62);
    ctx.bezierCurveTo(-2, -62, -6, -61, -7, -63);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -62);
    ctx.bezierCurveTo(2, -62, 6, -61, 7, -63);
    ctx.stroke();

    // pointed beard
    ctx.fillStyle = '#2a1000';
    ctx.beginPath();
    ctx.moveTo(-4, -60);
    ctx.bezierCurveTo(-3, -56, 0, -53, 0, -52);
    ctx.bezierCurveTo(0, -53, 3, -56, 4, -60);
    ctx.closePath();
    ctx.fill();

    // tall hat - wide brim, tall crown
    // brim
    ctx.fillStyle = '#0a0a14';
    ctx.beginPath();
    ctx.ellipse(0, -73, 14, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // crown
    ctx.fillStyle = '#111120';
    ctx.beginPath();
    ctx.rect(-8, -96, 16, 24);
    ctx.fill();
    // hat top
    ctx.fillStyle = '#0a0a14';
    ctx.beginPath();
    ctx.ellipse(0, -96, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // hat band
    ctx.fillStyle = '#8a6020';
    ctx.fillRect(-8, -79, 16, 3);

    // cape collar
    ctx.fillStyle = '#2a2a3a';
    ctx.beginPath();
    ctx.moveTo(-12, -54);
    ctx.bezierCurveTo(-14, -50, -10, -48, -6, -50);
    ctx.lineTo(6, -50);
    ctx.bezierCurveTo(10, -48, 14, -50, 12, -54);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}