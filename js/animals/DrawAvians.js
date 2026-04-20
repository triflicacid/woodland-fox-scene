import {prob, rnd} from '../utils.js';
import {PROBABILITY} from '../config.js';
import {getTreeTopPos} from '../drawing/DrawTrees.js';
import {Component} from '../core/Component.js';

/**
 * DrawAvians manages all bird, bat, and owl rendering and state.
 */
export class DrawAvians extends Component {
  /**
   * @param {EventBus} eventBus
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} W
   * @param {number} H
   * @param {Array<Object>} trees - tree definitions array
   */
  constructor(eventBus, ctx, W, H, trees) {
    super(eventBus);
    this.ctx = ctx;
    this.W = W;
    this.H = H;
    this.trees = trees;
  }

  draw(state) {
    const {season, weather, todBlend, owlForced} = state;

    // trigger wind-startled birds when wind begins
    if (weather === 'wind' && !state.windWasOn) {
      state.perchBirds.forEach(pb => {
        const tr = this.trees[pb.treeIdx];
        const top = getTreeTopPos(tr, weather, season, state.frame, this.H);
        state.windStartledBirds.push({
          x: top.x + pb.offset * tr.r * 0.5, y: top.y,
          vx: (3 + rnd(4)) * (prob(0.5) ? 1 : -1), vy: -(2 + rnd(2)),
          flapT: 0, flapSpeed: 0.15, scale: 0.8 + rnd(0.3), life: 0,
        });
      });
      state.windWasOn = true;
    }
    if (weather !== 'wind' && weather !== 'storm') state.windWasOn = false;

    // bats (autumn night, or forced)
    const showBats = owlForced || (season === 'autumn' && todBlend < 0.4);
    if (showBats) {
      state.bats.forEach(b => {
        b.x += b.vx;
        b.flapT += b.flapSpeed;
        b.y += Math.sin(b.flapT * 0.15) * 1.2;
        if (b.x > this.W + 40) b.x = -40;
        if (b.x < -40) b.x = this.W + 40;
        this._drawBat(b.x, b.y, b.flapT, 0.9 + Math.random() * 0.1);
      });
    }

    // wind-startled birds
    state.windStartledBirds = state.windStartledBirds.filter(b => {
      b.x += b.vx;
      b.y += b.vy;
      b.vy += 0.05;
      b.flapT += b.flapSpeed;
      b.life++;
      if (b.life > 200 || b.x < -50 || b.x > this.W + 50 || b.y < -50) return false;
      this._drawFlyingBird(b.x, b.y, b.flapT, b.scale);
      return true;
    });

    if (!this._birdsActive(state)) {
      this._drawOwl(state);
      return;
    }

    // flock birds flying across the sky
    const flockCount = weather === 'wind' ? 3 : state.flockBirds.length;
    state.flockBirds.slice(0, flockCount).forEach(b => {
      b.x += b.vx;
      b.flapT += b.flapSpeed;
      b.y += Math.sin(b.flapT * 0.2) * 0.3;
      if (b.x > this.W + 30) {
        b.x = -30;
        b.y = 20 + rnd(this.H * 0.22);
      }
      this._drawFlyingBird(b.x, b.y, b.flapT, b.scale);
    });

    // perched birds on tree tops
    state.perchBirds.forEach(pb => {
      const tr = this.trees[pb.treeIdx];
      if (season === 'winter' && tr.type !== 'pine') return;
      const top = getTreeTopPos(tr, weather, season, state.frame, this.H);
      const px = top.x + pb.offset * tr.r * 0.5;
      const py = top.y + Math.sin(state.frame * 0.03 + pb.treeIdx) * 0.8;
      const windE = (weather === 'wind' || weather === 'storm')
          ? Math.sin(state.frame * 0.06 + tr.ph) * 10 : 0;
      const lean = (Math.sin(state.frame * tr.sway + tr.ph) * 5 + windE) * 0.008;
      this.ctx.save();
      this.ctx.translate(px, py);
      this.ctx.rotate(lean);
      this.ctx.translate(-px, -py);
      this._drawPerchBird(px, py, pb.side);
      this.ctx.restore();
    });

    this._drawOwl(state);
  }

  /**
   * return true when normal daytime birds should be visible.
   * @param {SceneState} state
   * @returns {boolean}
   */
  _birdsActive(state) {
    const {season, todBlend, weather} = state;
    if (season === 'winter') return false;
    if (todBlend <= 0.4) return false;
    if (weather === 'storm' || weather === 'wind') return false;
    return true;
  }

  /**
   * draw a bat at the given position.
   * @param {number} x
   * @param {number} y
   * @param {number} flapT
   * @param {number} sc - scale
   */
  _drawBat(x, y, flapT, sc) {
    const {ctx} = this;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sc, sc);
    const wing = Math.sin(flapT) * 10;
    ctx.fillStyle = 'rgba(30,10,40,0.8)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-8, wing - 4, -16, wing, -18, wing + 2);
    ctx.bezierCurveTo(-14, wing - 2, -8, wing - 6, 0, 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(8, wing - 4, 16, wing, 18, wing + 2);
    ctx.bezierCurveTo(14, wing - 2, 8, wing - 6, 0, 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(40,15,50,0.9)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 4, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, -5, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-3, -7);
    ctx.lineTo(-5, -12);
    ctx.lineTo(-1, -8);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(3, -7);
    ctx.lineTo(5, -12);
    ctx.lineTo(1, -8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  /**
   * draw a small perched bird.
   * @param {number} x
   * @param {number} y
   * @param {number} facing - 1 = right, -1 = left
   */
  _drawPerchBird(x, y, facing) {
    const {ctx} = this;
    ctx.save();
    ctx.translate(x, y);
    if (facing < 0) ctx.scale(-1, 1);
    ctx.fillStyle = '#2a1a10';
    ctx.beginPath();
    ctx.ellipse(0, 0, 7, 5, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c84010';
    ctx.beginPath();
    ctx.ellipse(2, 1, 4, 3, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a1008';
    ctx.beginPath();
    ctx.arc(-5, -4, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-6, -4.5, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-6, -4.5, 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#888';
    ctx.beginPath();
    ctx.moveTo(-9, -4);
    ctx.lineTo(-12, -3.5);
    ctx.lineTo(-9, -3);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#1a1008';
    ctx.beginPath();
    ctx.moveTo(7, 1);
    ctx.lineTo(14, 0);
    ctx.lineTo(14, 3);
    ctx.lineTo(7, 3);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#5a3a20';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-2, 4);
    ctx.lineTo(-2, 9);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(2, 4);
    ctx.lineTo(2, 9);
    ctx.stroke();
    ctx.restore();
  }

  /**
   * draw a flying bird (simple curved wing strokes).
   * @param {number} x
   * @param {number} y
   * @param {number} flapT
   * @param {number} sc
   */
  _drawFlyingBird(x, y, flapT, sc) {
    const {ctx} = this;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sc, sc);
    const wing = Math.sin(flapT) * 12;
    ctx.strokeStyle = 'rgba(30,20,10,0.7)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-14, wing * 0.5);
    ctx.quadraticCurveTo(-7, wing, 0, 0);
    ctx.quadraticCurveTo(7, wing, 14, wing * 0.5);
    ctx.stroke();
    ctx.restore();
  }

  /**
   * draw the owl on its perch tree (shown at night in autumn/winter, or forced).
   * @param {SceneState} state
   */
  _drawOwl(state) {
    const {ctx} = this;
    const owl = state.owl;
    const {owlForced, todBlend, season, weather, frame} = state;

    const visible = owlForced
        || (todBlend < 0.35 && (season === 'autumn' || season === 'winter') && weather === 'clear');
    if (!visible) return;

    const tr = this.trees[owl.treeIdx];
    let {x, y} = getTreeTopPos(tr, weather, season, frame, this.H);
    y -= 15;
    x -= 5;

    owl.headTimer++;
    if (owl.headTimer > 120) {
      owl.headTarget = (Math.random() - 0.5) * 1.6;
      owl.headTimer = 0;
      if (prob(PROBABILITY.OWL_BLINK)) owl.blinkT = 0;
    }
    owl.headAngle = owl.headAngle + (owl.headTarget - owl.headAngle) * 0.04;
    if (owl.blinkT >= 0) {
      owl.blinkT++;
      if (owl.blinkT > 8) owl.blinkT = -1;
    }

    ctx.save();
    ctx.translate(x, y);

    // body and wings
    ctx.fillStyle = '#3a2a18';
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c8a878';
    ctx.beginPath();
    ctx.ellipse(0, 4, 6, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2a1e10';
    ctx.beginPath();
    ctx.ellipse(-9, 2, 5, 11, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(9, 2, 5, 11, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // rotating head
    ctx.save();
    ctx.rotate(owl.headAngle);
    ctx.fillStyle = '#3a2a18';
    ctx.beginPath();
    ctx.arc(0, -14, 9, 0, Math.PI * 2);
    ctx.fill();
    // ear tufts
    ctx.fillStyle = '#2a1a08';
    ctx.beginPath();
    ctx.moveTo(-6, -20);
    ctx.lineTo(-8, -27);
    ctx.lineTo(-3, -21);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(6, -20);
    ctx.lineTo(8, -27);
    ctx.lineTo(3, -21);
    ctx.closePath();
    ctx.fill();
    // face disc
    ctx.fillStyle = '#c8a060';
    ctx.beginPath();
    ctx.arc(0, -14, 6, 0, Math.PI * 2);
    ctx.fill();

    const blinking = owl.blinkT >= 0 && owl.blinkT < 5;
    ctx.fillStyle = '#f0c040';
    if (!blinking) {
      ctx.beginPath();
      ctx.arc(-3, -14, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(3, -14, 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = '#f0c040';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-6, -14);
      ctx.lineTo(0, -14);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -14);
      ctx.lineTo(6, -14);
      ctx.stroke();
    }
    ctx.fillStyle = '#000';
    if (!blinking) {
      ctx.beginPath();
      ctx.arc(-3, -14, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(3, -14, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    // beak
    ctx.fillStyle = '#a08040';
    ctx.beginPath();
    ctx.moveTo(-2, -11);
    ctx.lineTo(2, -11);
    ctx.lineTo(0, -9);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // talons on perch
    ctx.strokeStyle = '#7a5a20';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-4, 13);
    ctx.lineTo(-4, 20);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(4, 13);
    ctx.lineTo(4, 20);
    ctx.stroke();

    ctx.restore();
  }
}
