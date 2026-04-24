import {DrawComponent} from '@/core/DrawComponent';
import {lerp, prob, rnd, rndf} from '@/utils';
import {Events} from '@/core/Events';
import {PROBABILITY} from "@/config";

/**
 * mothron - giant moth boss that flies across the sky and occasionally dives at the fox.
 */
export class MothronComponent extends DrawComponent {
  _x = -200;
  _y = 80;
  _vx = 0;
  _vy = 0;
  _phase = 'off'; // off | flying | diving | returning
  _flapT = 0;
  _diveTargetX = 0;
  _diveTargetY = 0;
  _cooldown = 0;

  static COMPONENT_NAME = 'MothronComponent';

  getName() {
    return MothronComponent.COMPONENT_NAME;
  }

  isEnabled() {
    return this.scene.specialEvent === 'eclipse';
  }

  tick() {
    const {W, fox} = this.scene;
    this._cooldown--;
    this._flapT += 0.12;

    if (this._phase === 'off') {
      if (this._cooldown <= 0 && prob(PROBABILITY.ECLIPSE.MOTHRON_SPAWN)) {
        this.summon();
      }
      return;
    }

    if (this._phase === 'flying') {
      this._x += this._vx;
      this._y += Math.sin(this._flapT * 0.08) * 1.2;

      // occasionally dive at fox
      if (prob(PROBABILITY.ECLIPSE.MOTHRON_DIVE) && this._cooldown <= 0) {
        this._phase = 'diving';
        this._diveTargetX = fox.x;
        this._diveTargetY = fox.y - 30;
        this.eventBus.dispatch(Events.mothronDive(this.getName()));
      }

      if (this._x < -100 || this._x > W + 100) {
        this._phase = 'off';
        this._cooldown = 300;
      }
    }

    if (this._phase === 'diving') {
      this._x = lerp(this._x, this._diveTargetX, 0.04);
      this._y = lerp(this._y, this._diveTargetY, 0.04);
      if (Math.abs(this._x - this._diveTargetX) < 20) {
        this._phase = 'returning';
        this._cooldown = 200;
      }
    }

    if (this._phase === 'returning') {
      this._y = lerp(this._y, 60 + rnd(60), 0.02);
      this._x += this._vx;
      if (this._x < -100 || this._x > W + 100) {
        this._phase = 'off';
        this._cooldown = 400;
      }
    }
  }

  draw() {
    if (this._phase === 'off') return;
    const {ctx} = this;
    const flap = Math.sin(this._flapT) * 0.8;
    const facingRight = this._vx > 0;

    ctx.save();
    ctx.translate(this._x, this._y);
    if (!facingRight) ctx.scale(-1, 1);

    // upper wings
    ctx.fillStyle = '#3a2010';
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#e07020';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-15, -10 + flap * 20, -40, -5 + flap * 30, -45, 10 + flap * 15);
    ctx.bezierCurveTo(-35, 20, -15, 10, 0, 5);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(15, -10 + flap * 20, 40, -5 + flap * 30, 45, 10 + flap * 15);
    ctx.bezierCurveTo(35, 20, 15, 10, 0, 5);
    ctx.closePath();
    ctx.fill();

    // wing patterns
    ctx.fillStyle = 'rgba(200,100,20,0.5)';
    ctx.beginPath();
    ctx.ellipse(-25, 8 + flap * 15, 10, 6, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(25, 8 + flap * 15, 10, 6, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // lower wings
    ctx.fillStyle = '#2a1808';
    ctx.beginPath();
    ctx.moveTo(0, 5);
    ctx.bezierCurveTo(-10, 15 - flap * 10, -30, 20 - flap * 15, -28, 35);
    ctx.bezierCurveTo(-18, 30, -8, 20, 0, 12);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, 5);
    ctx.bezierCurveTo(10, 15 - flap * 10, 30, 20 - flap * 15, 28, 35);
    ctx.bezierCurveTo(18, 30, 8, 20, 0, 12);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;

    // body
    ctx.fillStyle = '#2a1808';
    ctx.beginPath();
    ctx.ellipse(0, 6, 5, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // head
    ctx.fillStyle = '#1a1008';
    ctx.beginPath();
    ctx.arc(0, -4, 6, 0, Math.PI * 2);
    ctx.fill();

    // glowing eyes
    ctx.fillStyle   = '#ff8020';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#e06000';
    ctx.beginPath();
    ctx.arc(-2.5, -4, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(2.5, -4, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // antennae
    ctx.strokeStyle = '#8a5020';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-2, -8);
    ctx.bezierCurveTo(-8, -18, -12, -22, -10, -26);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(2, -8);
    ctx.bezierCurveTo(8, -18, 12, -22, 10, -26);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * force-summon mothron immediately.
   */
  summon() {
    if (this._phase !== 'off') return;
    this._phase = 'flying';
    this._x = prob(0.5) ? -80 : this.W + 80;
    this._y = 40 + rnd(this.H * 0.3);
    this._vx = this._x < 0 ? 2 + rnd(1.5) : -(2 + rnd(1.5));
    this._vy = rndf(0.3);
  }
}
