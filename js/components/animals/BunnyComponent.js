import {clamp, eo, lerp, prob} from '@/utils';
import {DrawComponent} from "@/core/DrawComponent";
import {Events} from "@/core/Events";
import {PROBABILITY} from "@/config";

/**
 * render bunny which hops to greet the fox.
 * handles spawning heart particles during Visitor scene.
 */
export class BunnyComponent extends DrawComponent {
  x = -80;
  meetX = 0;
  y = 0;
  phase = 'off';
  phaseT = 0;
  hop = {
    arc: 0,
    from: -80,
    to: -80,
    frame: 1,
    t: 0
  };
  /** @type {MusicalNotesComponent} */
  notes;
  /** @type {HeartsComponent} */
  hearts;

  static COMPONENT_NAME = "BunnyComponent";

  getName() {
    return BunnyComponent.COMPONENT_NAME;
  }

  /**
   * @param {EventBus} eventBus
   * @param {SceneState} scene
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} W - canvas width
   * @param {number} H - canvas height
   * @param {MusicalNotesComponent} notes
   * @param {HeartsComponent} hearts
   */
  constructor(eventBus, scene, ctx, W, H, notes, hearts) {
    super(eventBus, scene, ctx, W, H);
    this.notes = notes;
    this.hearts = hearts;
  }

  isEnabled() {
    const specialEvent = this.scene.specialEvent;
    if (specialEvent === 'birthday' || specialEvent === 'easter') return true;
    return !(this.phase === 'off' || this.phase === 'done');
  }

  initialise() {
    this.meetX = this.scene.fox.x - 80;
    this.y = this.scene.fox.y;
  }

  tick() {
    const {fox, specialEvent} = this.scene;
    this.phaseT++;

    // easter management
    if (specialEvent === 'easter') {
      if (this.phase === 'off' || this.phase === 'done') {
        this.phase = 'easter_bob';
        this.x = fox.x - 100;
        this.y = fox.y;
        this.phaseT = 0;
      } else if (this.phase === 'easter_bob') {
        this.x = (fox.x - 100) + Math.sin(this.scene.frame * 0.015) * 13;
      }
      return;
    } else if (this.phase === 'easter_bob') {
      // easter ended - hop off
      this.phase = 'hopping_out';
      this.phaseT = 0;
      this.startHop(this.x, this.W + 90, 130);
    }

    // birthday - bunny hops in and bobs along
    if (this.scene.specialEvent === 'birthday') {
      if (this.phase === 'off' || this.phase === 'done') {
        this.phase = 'hopping_in';
        this.phaseT = 0;
        this.x = -80;
        this.hop.arc = 0;
        this.startHop(-80, fox.x - 100, 135);
      } else if (this.phase === 'hopping_in' || this.phase === 'birthday_bob') {
        // once arrived, lock into birthday bob
        if (this.phase === 'hopping_in' && this.tickHop()) {
          this.phase = 'birthday_bob';
          this.phaseT = 0;
          this.eventBus.dispatch(Events.characterAction(this.getName(), 'bunny', 'sing.start'));
        }
      }
      // spawn notes occasionally while bobbing
      if (this.phase === 'birthday_bob' && prob(PROBABILITY.BUNNY_SPAWN_NOTE)) {
        this.notes.spawnNote(this.x + 40, this.y - 35);
      }
      return; // skip normal bunny tick during birthday
    } else if (this.phase === 'birthday_bob') {
      // birthday ended - hop off
      this.phase = 'hopping_out';
      this.phaseT = 0;
      this.startHop(this.x, this.W + 90, 130);
      this.eventBus.dispatch(Events.characterAction(this.getName(), 'bunny', 'sing.end'));
    }

    if (this.phase === 'hopping_in') {
      if (this.tickHop()) {
        this.hop.arc = 0;
        this.phase = 'fox_waking';
        this.phaseT = 0;
        this.eventBus.dispatch(Events.characterAction(this.getName(), 'bunny', 'nuzzle.prepare'));
      }

    } else if (this.phase === 'fox_waking') {
      if (this.phaseT >= 90) {
        this.phase = 'nuzzle';
        this.phaseT = 0;
        this.eventBus.dispatch(Events.statusText(this.getName(), 'They touch noses...'));
        this.eventBus.dispatch(Events.characterAction(this.getName(), 'bunny', 'nuzzle.start'));
      }

    } else if (this.phase === 'nuzzle') {
      this.hop.arc = 0;
      // spawn heart particles periodically
      if (this.phaseT % 20 === 0 && this.phaseT < 140) {
        const noseX = (this.x + 35 + fox.x - 34) / 2;
        this.hearts.spawn(noseX + (Math.random() - 0.5) * 20, this.y - 72);
      }

      if (this.phaseT >= 160) {
        this.phase = 'fox_sleep';
        this.phaseT = 0;
        this.eventBus.dispatch(Events.characterAction(this.getName(), 'bunny', 'nuzzle.end'));
      }

    } else if (this.phase === 'fox_sleep') {
      if (this.phaseT >= 95) {
        this.phase = 'hopping_out';
        this.phaseT = 0;
        this.startHop(this.x, this.W + 90, 130);
        this.eventBus.dispatch(Events.characterAction(this.getName(), 'bunny', 'exiting'));
        this.eventBus.dispatch(Events.statusText(this.getName(), 'The bunny hops off...'));
      }

    } else if (this.phase === 'hopping_out') {
      if (this.tickHop()) {
        this.phase = 'done';
        this.eventBus.dispatch(Events.statusText(this.getName(), 'Curled up, fast asleep...'));
        this.eventBus.dispatch(Events.setMainButtons(this.getName(), true));
        this.eventBus.dispatch(Events.characterAction(this.getName(), 'bunny', 'exit'));
      }
    }
  }

  draw() {
    const {ctx} = this;
    const {fox, frame} = this.scene;

    // easter bob with crown
    if (this.phase === 'easter_bob') {
      const bob = Math.sin(frame * 0.08) * 3;
      this._drawBunny(this.x, this.y + bob, 0);
      this._drawCrown(this.x, this.y + bob);
      return;
    }

    // birthday bob
    if (this.phase === 'birthday_bob') {
      const bob = Math.sin(frame * 0.1 + 1.0) * 4;
      this._drawBunny(this.x, this.y + bob, 0);
      return; // early return
    }

    this._drawBunny(this.x, this.y, this.hop.arc);

    // nuzzle glow between bunny and fox noses
    if (this.phase === 'nuzzle') {
      const pulse = 0.22 + 0.22 * Math.sin(this.phaseT * 0.15);
      const nx = (this.x + 35 + fox.x - 34) / 2;
      const ny = this.y - 60;
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

  /**
   * draw a prominent gold crown on the bunny's head.
   * @param {number} bx - bunny x
   * @param {number} by - bunny y
   */
  _drawCrown(bx, by) {
    const {ctx} = this;
    // bunny head centre in sprite coords is at roughly (hx+18, by-27)
    const hx = bx + 18;
    const hy = by - 27;
    const cr = 11; // crown half-width
    const ch = 15; // crown height

    ctx.save();
    ctx.translate(hx, hy - 12);

    // gold gradient
    const gold = ctx.createLinearGradient(-cr, -ch, cr, 0);
    gold.addColorStop(0, '#b8860b');
    gold.addColorStop(0.35, '#ffd700');
    gold.addColorStop(0.6, '#ffec5c');
    gold.addColorStop(1, '#b8860b');

    // crown shape - base band + 5 points
    ctx.beginPath();
    ctx.moveTo(-cr, 0);
    ctx.lineTo(-cr, -ch * 0.4);         // left side up to first valley
    ctx.lineTo(-cr * 0.6, -ch);         // left point
    ctx.lineTo(-cr * 0.2, -ch * 0.45);  // valley
    ctx.lineTo(0, -ch * 1.1);  // centre point (tallest)
    ctx.lineTo(cr * 0.2, -ch * 0.45);  // valley
    ctx.lineTo(cr * 0.6, -ch);         // right point
    ctx.lineTo(cr, -ch * 0.4);  // right side
    ctx.lineTo(cr, 0);
    ctx.closePath();
    ctx.fillStyle = gold;
    ctx.fill();
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // base band highlight
    ctx.fillStyle = 'rgba(255,236,92,0.4)';
    ctx.fillRect(-cr, -4, cr * 2, 4);

    // jewels
    const JEWELS = [
      {x: -cr * 0.55, y: -ch * 0.88, col: '#cc0000'}, // ruby  - left point
      {x: 0, y: -ch, col: '#00aa44'}, // emerald - centre
      {x: cr * 0.55, y: -ch * 0.88, col: '#0044cc'}, // sapphire - right point
      {x: -cr * 0.2, y: -ch * 0.35, col: '#cc0000'}, // ruby - left valley
      {x: cr * 0.2, y: -ch * 0.35, col: '#0044cc'}, // sapphire - right valley
    ];
    JEWELS.forEach(({x, y, col}) => {
      ctx.shadowBlur = 6;
      ctx.shadowColor = col;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(x, y, 2.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      ctx.beginPath();
      ctx.arc(x - 0.8, y - 0.8, 1.1, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  /**
   * start the visitor scene, making the bunny enter into the scene
   */
  startVisitorScene() {
    if (this.phase !== 'off') return;

    this.phase = 'hopping_in';
    this.phaseT = 0;
    this.x = -80;
    this.hop.arc = 0;
    this.startHop(-80, this.meetX, 135);
    this.eventBus.dispatch(Events.characterAction(this.getName(), 'bunny', 'enter'));
  }

  /**
   * start a bunny hop from one x position to another
   * @param {number} f - from x
   * @param {number} t - to x
   * @param {number} fr - frame duration of hop
   */
  startHop(f, t, fr) {
    const hop = this.hop;
    hop.from = f;
    hop.to = t;
    hop.frame = fr;
    hop.t = 0;
  }

  /**
   * advance the bunny hop by one frame
   * @returns {boolean} true when the hop is complete
   */
  tickHop() {
    const hop = this.hop;
    hop.t++;
    const p = clamp(hop.t / hop.frame, 0, 1);
    hop.arc = (p * Math.max(1, Math.round(Math.abs(hop.to - hop.from) / 55))) % 1;
    this.x = lerp(hop.from, hop.to, eo(p));
    return p >= 1;
  }
}
