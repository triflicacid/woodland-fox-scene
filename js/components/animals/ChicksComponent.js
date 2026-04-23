import {DrawComponent} from '@/core/DrawComponent';
import {prob, rnd} from '@/utils';

// plus-minus from centre
const WANDER_WIDTH = 100;

// fixed spawn zones for clustered pecking chicks [x, y_fraction]
const PECK_ZONES = [
  [170, 0.87],
  [185, 0.88],
  [430, 0.87],
  [450, 0.88],
];

// fixed spawn zones for wandering chicks [x, y_fraction, direction]
const WANDER_ZONES = [
  [220, 0.79],
  [360, 0.80],
  [500, 0.78],
];

/**
 * small fluffy chicks that wander and peck during the easter event.
 * wanderers roam left/right; peckers bob their heads at the ground.
 */
export class ChicksComponent extends DrawComponent {
  /** @type {Array<Object>} wandering chicks */
  _wanderers = [];
  /** @type {Array<Object>} pecking chicks */
  _peckers = [];
  forced = false;

  static COMPONENT_NAME = "ChicksComponent";
  getName() {
    return ChicksComponent.COMPONENT_NAME;
  }

  isEnabled() {
    return this.forced || this.scene.specialEvent === 'easter';
  }

  initialise() {
    this._wanderers = WANDER_ZONES.map(([x, yF], i) => ({
      x,
      yF,
      vx: (0.3 + rnd(0.3)) * (prob(0.5) ? 1 : -1),
      phase: rnd(Math.PI * 2),
      turnTimer: 0,
      facingRight: prob(0.5),
    }));

    this._peckers = PECK_ZONES.map(([x, yF], i) => ({
      x,
      yF,
      peckPhase: rnd(Math.PI * 2),
      peckSpeed: 0.06 + rnd(0.03),
      facingRight: prob(0.5),
    }));
  }

  tick() {
    const {W} = this;

    this._wanderers.forEach(c => {
      // turn randomly or at canvas edges
      c.turnTimer--;
      if (c.turnTimer <= 0 || c.x < WANDER_WIDTH || c.x > W - WANDER_WIDTH) {
        c.vx = (0.3 + rnd(0.3)) * (c.x < W / 2 ? 1 : -1);
        c.facingRight = c.vx > 0;
        c.turnTimer = 80 + Math.floor(rnd(120));
      }
      c.x += c.vx + (this.scene.weather === 'wind' ? 0.3 : 0);
    });

    // peckers just advance their peck animation phase
    this._peckers.forEach(c => {
      c.peckPhase += c.peckSpeed;
    });
  }

  draw() {
    const {H} = this;
    const {frame} = this.scene;

    // sort, render highest-first for perspective
    const all = [
      ...this._wanderers.map(c => ({
        ...c,
        pecking: false,
        peckAmt: 0,
        y: H * c.yF + Math.sin(frame * 0.18 + c.phase) * 1.5 // slight waddle bob
      })),
      ...this._peckers.map(c  => ({
        ...c,
        pecking: true,
        peckAmt: Math.max(0, Math.sin(c.peckPhase)) * 6, // head dips down
        y: H * c.yF
      })),
    ].sort((a, b) => a.y - b.y);

    all.forEach(c => {
      this._drawChick(c.x, c.y, c.facingRight, c.pecking, c.peckAmt);
    });
  }

  /**
   * draw a single fluffy chick.
   * @param {number} x
   * @param {number} y
   * @param {boolean} facingRight
   * @param {boolean} pecking
   * @param {number} peckAmt - how far the head is dipped down (0 = upright)
   */
  _drawChick(x, y, facingRight, pecking, peckAmt) {
    const {ctx} = this;

    ctx.save();
    ctx.translate(x, y);
    if (!facingRight) ctx.scale(-1, 1);

    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.beginPath();
    ctx.ellipse(0, 2, 10, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // body - fluffy yellow ellipse
    ctx.fillStyle = '#ffe066';
    ctx.shadowBlur = 4;
    ctx.shadowColor = '#ffcc00';
    ctx.beginPath();
    ctx.ellipse(0, -6, 10, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // fluffy texture - slightly lighter patches
    ctx.fillStyle = 'rgba(255,255,200,0.5)';
    ctx.beginPath();
    ctx.ellipse(-2, -8, 5, 4, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(3, -5, 4, 3, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // wing nub
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.ellipse(-6, -5, 4, 3, -0.4, 0, Math.PI * 2);
    ctx.fill();

    // tiny tail tuft
    ctx.fillStyle = '#ffe066';
    ctx.beginPath();
    ctx.moveTo(8, -6);
    ctx.bezierCurveTo(12, -8, 14, -5, 11, -3);
    ctx.bezierCurveTo(9, -2, 8, -4, 8, -6);
    ctx.fill();

    // legs
    ctx.strokeStyle = '#e08020';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-2, -1);
    ctx.lineTo(-3, 3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(2, -1);
    ctx.lineTo(3, 3);
    ctx.stroke();
    // feet
    ctx.beginPath();
    ctx.moveTo(-3, 3);
    ctx.lineTo(-6, 3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-3, 3);
    ctx.lineTo(-3, 5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(3, 3);
    ctx.lineTo(6, 3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(3, 3);
    ctx.lineTo(3, 5);
    ctx.stroke();

    // head - tilts down when pecking
    ctx.save();
    ctx.translate(4, -12);
    ctx.rotate(peckAmt * 0.08); // tilt forward when pecking
    ctx.translate(0, peckAmt * 0.4);

    ctx.fillStyle = '#ffe066';
    ctx.shadowBlur = 3;
    ctx.shadowColor = '#ffcc00';
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // fluffy head tuft
    ctx.fillStyle = '#fff5aa';
    ctx.beginPath();
    ctx.moveTo(-2, -5);
    ctx.bezierCurveTo(-3, -10, 1, -12, 3, -9);
    ctx.bezierCurveTo(4, -7, 2, -5, 0, -5);
    ctx.fill();

    // beak
    ctx.fillStyle = '#e07020';
    ctx.beginPath();
    ctx.moveTo(5, -1);
    ctx.lineTo(9, 0);
    ctx.lineTo(5, 2);
    ctx.closePath();
    ctx.fill();

    // eye
    ctx.fillStyle = '#1a0800';
    ctx.beginPath();
    ctx.arc(2, -2, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.arc(2.5, -2.5, 0.7, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore(); // head

    ctx.restore(); // chick
  }
}
