import {DrawComponent} from "@/core/DrawComponent";
import {getTreeTopPos} from "@/components/TreeComponent";
import {prob, rnd} from "@/utils";
import {Subscriptions} from "@/core/Subscriptions";

/**
 * render flying birds, perched birds, and startled birds.
 */
export class BirdsComponent extends DrawComponent {
  /** @type{Array<Object>} */
  perchedBirds;
  /** @type{Array<Object>} */
  windStartledBirds;
  /** @type{Array<Object>} */
  flyingBirds;

  static COMPONENT_NAME = "BirdsComponent";

  getName() {
    return BirdsComponent.COMPONENT_NAME;
  }

  initialise() {
    this.perchedBirds = Array.from({length: 5}, (_, i) => ({
      treeIdx: [0, 2, 6, 7, 1][i],
      offset: [-0.7, -0.6, -0.55, -0.65, -0.5][i],
      side: [1, -1, 1, -1, 1][i],
    }));
    this.windStartledBirds = [];
    this._generateFlyingBirds();

    this.eventBus.subscribe(Subscriptions.onWeatherChange(this.getName(), this._onWeatherChange.bind(this)));
  }

  /**
   * generate flying birds
   */
  _generateFlyingBirds() {
    const length = this.scene.weather === 'wind' ? 3 : 12;
    this.flyingBirds = Array.from({length}, () => ({
      x: rnd(this.W),
      y: 20 + rnd(this.H * 0.25),
      vx: 0.4 + rnd(0.5),
      vy: 0,
      flapT: rnd(Math.PI * 2),
      flapSpeed: 0.08 + rnd(0.04),
      scale: 0.7 + rnd(0.5),
    }));
  }

  /**
   * called on a weather change event
   * @param {ValueChange<string>} update
   */
  _onWeatherChange(update) {
    const {weather, season, frame, specialEvent, trees} = update.state;

    // regenerate birds if count changes
    if (weather === 'wind' || update.previous === 'wind') {
      this._generateFlyingBirds(weather);
    }

    // if we transitioned into wind, startle the perched birds
    if (weather === 'wind') {
      this.perchedBirds.forEach(pb => {
        const tr = trees[pb.treeIdx];
        const top = getTreeTopPos(tr, weather, season, specialEvent, frame, this.H);
        this.windStartledBirds.push({
          x: top.x + pb.offset * tr.r * 0.5,
          y: top.y,
          vx: (3 + rnd(4)) * (prob(0.5) ? 1 : -1),
          vy: -(2 + rnd(2)),
          flapT: 0,
          flapSpeed: 0.15,
          scale: 0.8 + rnd(0.3),
          life: 0,
        });
      });
    }
  }

  tick() {
    // wind-startled birds
    this.windStartledBirds = this.windStartledBirds.filter(b => {
      b.x += b.vx;
      b.y += b.vy;
      b.vy += 0.05;
      b.flapT += b.flapSpeed;
      b.life++;
      return !(b.life > 200 || b.x < -50 || b.x > this.W + 50 || b.y < -50);
    });

    if (this._areBirdsActive()) {
      const M = this.scene.weather === 'wind' ? 4.5 : 1;
      // flock birds flying across the sky
      this.flyingBirds.forEach(b => {
        b.x += b.vx * M;
        b.flapT += b.flapSpeed;
        b.y += Math.sin(b.flapT * 0.2) * 0.3;
        if (b.x > this.W + 30) {
          b.x = -30;
          b.y = 20 + rnd(this.H * 0.22);
        }
      });
    }
  }

  draw() {
    const {ctx, H} = this;
    const {weather, season, frame, specialEvent, trees} = this.scene;

    // wind-startled birds
    this.windStartledBirds.forEach(b => this._drawFlyingBird(b.x, b.y, b.flapT, b.scale));

    if (this._areBirdsActive()) {
      // perched birds on tree tops
      this.perchedBirds.forEach(pb => {
        const tr = trees[pb.treeIdx];
        if (season === 'winter' && tr.type !== 'pine') return;

        const top = getTreeTopPos(tr, weather, season, specialEvent, frame, H);
        const px = top.x + pb.offset * tr.r * 0.5;
        const py = top.y + Math.sin(frame * 0.03 + pb.treeIdx) * 0.8;
        const windE = (weather === 'wind' || weather === 'storm')
            ? Math.sin(frame * 0.06 + tr.ph) * 10 : 0;
        const lean = (Math.sin(frame * tr.sway + tr.ph) * 5 + windE) * 0.008;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(lean);
        ctx.translate(-px, -py);
        this._drawPerchBird(px, py, pb.side);
        ctx.restore();
      });

      // flock birds flying across the sky
      this.flyingBirds.forEach(b => this._drawFlyingBird(b.x, b.y, b.flapT, b.scale));
    }
  }

  /**
   * return true when normal daytime birds should be visible.
   * @returns {boolean}
   */
  _areBirdsActive() {
    const {season, todBlend, weather, specialEvent} = this.scene;
    if (season === 'winter') return false;
    if (todBlend <= 0.4) return false;
    if (weather === 'storm') return false;
    if (specialEvent === 'eclipse') return false;
    return true;
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
   * add a started bird to the screen at the given tree position
   * @param {Object} tr tree object
   */
  spawnStartledBird(tr) {
    if (!this._areBirdsActive()) {
      return;
    }
    this.windStartledBirds.push({
      x: tr.x,
      y: this.H * 0.62 - tr.h * 0.5,
      vx: (2 + rnd(3)) * (prob(0.5) ? 1 : -1),
      vy: -(3 + rnd(2)),
      flapT: 0,
      flapSpeed: 0.18,
      scale: 0.8 + rnd(0.3),
      life: 0,
    });
  }
}
