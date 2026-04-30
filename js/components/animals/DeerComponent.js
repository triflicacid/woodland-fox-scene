import {PROBABILITY} from "@/config";
import {clamp, eo, lerp, prob} from "@/utils";
import {DrawComponent} from "@/core/DrawComponent";
import {Events} from "@/core/Events";
import {Subscriptions} from "@/core/Subscriptions";

const OFFSCREEN_BOUNDARY = 45;

const DEER_PHASES = {
  entering: {f: 150},
  grazing: {f: 300},
  leaving: {f: 180},
  birthday_bob: {f: Infinity},
};

/**
 * render a deer which sometimes walks into frame
 */
export class DeerComponent extends DrawComponent {
  x = 0;
  y = 0;
  phase = 'off';
  phaseT = 0;
  cooldown = 0;
  bunnyActive = false;
  /** @type{MusicalNotesComponent} */
  notes;

  /**
   * @param {EventBus} eventBus
   * @param {SceneState} scene
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} W - canvas width
   * @param {number} H - canvas height
   * @param {MusicalNotesComponent} notes
   */
  constructor(eventBus, scene, ctx, W, H, notes) {
    super(eventBus, scene, ctx, W, H);
    this.notes = notes;
  }

  static COMPONENT_NAME = "DeerComponent";

  getName() {
    return DeerComponent.COMPONENT_NAME;
  }

  initialise() {
    this.x = this.W + OFFSCREEN_BOUNDARY;
    this.y = this.H * 0.62;

    this.eventBus.subscribe(Subscriptions.onCharacterAction(this.getName(), ({character, action}) => {
      if (character === 'bunny') {
        if (action === 'enter') {
          this.bunnyActive = true;
        } else if (action === 'exit') {
          this.bunnyActive = false;
        }
      }
    }));
  }

  tick() {
    let cfg = DEER_PHASES[this.phase];
    let t = cfg ? clamp(this.phaseT / cfg.f, 0, 1) : NaN;
    this.cooldown--;

    if (this.scene.specialEvent === 'birthday') {
      if (this.phase === 'off') {
        this.phase = 'entering';
        this.phaseT = 0;
        this.x = this.W + OFFSCREEN_BOUNDARY;
        this.cooldown = 0;
      } else if (this.phase === 'entering') {
        const targetX = this.W * 0.78;
        this.x = lerp(this.W + 80, targetX, eo(t));
        this.phaseT++;
        if (this.phaseT >= cfg.f) {
          this.phase = 'birthday_bob';
          this.phaseT = 0;
          this.eventBus.dispatch(Events.characterAction(this.getName(), 'deer', 'sing.start'));
        }
      }
      if (this.phase === 'birthday_bob' && prob(PROBABILITY.DEER_SPAWN_NOTE)) {
        this.notes.spawnNote(this.x - 50, this.y - 84);
      }
      return;
    } else if (this.phase === 'birthday_bob') {
      this.phase = 'leaving';
      this.phaseT = 0;
      this.eventBus.dispatch(Events.characterAction(this.getName(), 'deer', 'sing.end'));
    }

    if (this.phase === 'off') {
      const atTransition = Math.abs(this.scene.todBlend - 0.5) < 0.15;
      if (atTransition && this.cooldown <= 0 && !this.bunnyActive && prob(PROBABILITY.DEER)) {
        this.phase = 'entering';
        this.phaseT = 0;
        this.x = this.W + 80;
        this.cooldown = 2400;
        cfg = DEER_PHASES.entering;
        t = 0;
        this.eventBus.dispatch(Events.characterAction(this.getName(), 'deer', 'enter'));
      }
    }
    if (this.phase === 'off') return;

    this.phaseT++;
    const gx = this.W * 0.72;

    if (this.phase === 'entering') {
      this.x = lerp(this.W + OFFSCREEN_BOUNDARY, gx, eo(t));
      if (this.phaseT >= cfg.f) {
        this.phase = 'grazing';
        this.phaseT = 0;
        this.eventBus.dispatch(Events.characterAction(this.getName(), 'deer', 'graze.start'));
      }

    } else if (this.phase === 'grazing') {
      this.x = gx + Math.sin(this.scene.frame * 0.008) * 8;
      if (this.phaseT > cfg.f) {
        this.phase = 'leaving';
        this.phaseT = 0;
        this.eventBus.dispatch(Events.characterAction(this.getName(), 'deer', 'graze.end'));
      }

    } else if (this.phase === 'leaving') {
      this.x = lerp(gx, this.W + OFFSCREEN_BOUNDARY, eo(t));
      if (this.phaseT >= cfg.f) {
        this.phase = 'off';
        this.x = this.W + OFFSCREEN_BOUNDARY;
        this.eventBus.dispatch(Events.characterAction(this.getName(), 'deer', 'exit'));
      }
    }
  }

  draw() {
    const {ctx} = this;
    if (this.phase === 'off') {
      return;
    }

    const {frame} = this.scene;
    const x = this.x;
    const bob = this.phase === 'birthday_bob' ? Math.sin(this.scene.frame * 0.1) * 4 : 0;
    const y = this.y - 28 + bob;
    const grazing = this.phase === 'grazing';
    const facingRight = this.phase === 'leaving';
    const graze = grazing ? Math.sin(frame * 0.04) * 0.18 : 0;
    const lb = Math.sin(frame * 0.09) * 2.5;
    const sc = '#6a4020';

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1.15, 1.15);
    if (facingRight) ctx.scale(-1, 1);

    // legs
    ctx.strokeStyle = sc;
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(10, -2);
    ctx.lineTo(12, 28 + lb);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(16, -2);
    ctx.lineTo(18, 28 - lb);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-8, -4);
    ctx.lineTo(-10, 28 + lb);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-2, -4);
    ctx.lineTo(-4, 28 - lb);
    ctx.stroke();

    // hooves
    ctx.fillStyle = '#2a1008';
    [[12, 29], [18, 29], [-10, 29], [-4, 29]].forEach(([hx, hy]) => {
      ctx.beginPath();
      ctx.ellipse(hx, hy + lb * 0.3, 3.5, 2, 0.1, 0, Math.PI * 2);
      ctx.fill();
    });

    // body
    const bg = ctx.createRadialGradient(0, -14, 3, 2, -10, 26);
    bg.addColorStop(0, '#d4844a');
    bg.addColorStop(0.6, '#a85a28');
    bg.addColorStop(1, '#7a3e18');
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.ellipse(4, -12, 26, 16, 0.05, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#d4a06a';
    ctx.beginPath();
    ctx.ellipse(4, -6, 16, 7, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // rump
    ctx.fillStyle = '#e8d4b0';
    ctx.beginPath();
    ctx.ellipse(22, -10, 8, 7, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // tail
    const tf = Math.sin(frame * 0.07) * 0.25;
    ctx.fillStyle = '#f0e0c0';
    ctx.beginPath();
    ctx.ellipse(25, -8, 4, 6, tf, 0, Math.PI * 2);
    ctx.fill();

    // neck and head (angled down when grazing)
    const neckAngle = -0.5 + graze * 1.2;
    ctx.save();
    ctx.translate(-14, -16);
    ctx.rotate(neckAngle);
    const ng = ctx.createLinearGradient(-5, 0, 5, 0);
    ng.addColorStop(0, '#8a4a20');
    ng.addColorStop(0.5, '#b06030');
    ng.addColorStop(1, '#8a4a20');
    ctx.fillStyle = ng;
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.lineTo(-4, -26);
    ctx.lineTo(4, -26);
    ctx.lineTo(5, 0);
    ctx.closePath();
    ctx.fill();

    const headY = -28;
    ctx.fillStyle = '#a85a28';
    ctx.beginPath();
    ctx.ellipse(0, headY, 9, 7, 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c07840';
    ctx.beginPath();
    ctx.ellipse(-8, headY + 2, 7, 5, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3a1a08';
    ctx.beginPath();
    ctx.ellipse(-14, headY + 3, 1.8, 1.4, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // ear
    ctx.fillStyle = '#b06030';
    ctx.beginPath();
    ctx.moveTo(4, headY - 4);
    ctx.bezierCurveTo(10, headY - 18, 16, headY - 20, 14, headY - 10);
    ctx.bezierCurveTo(12, headY - 4, 6, headY, 4, headY - 4);
    ctx.fill();
    ctx.fillStyle = '#e8a070';
    ctx.beginPath();
    ctx.moveTo(5, headY - 5);
    ctx.bezierCurveTo(10, headY - 15, 14, headY - 17, 12, headY - 10);
    ctx.bezierCurveTo(10, headY - 5, 7, headY - 1, 5, headY - 5);
    ctx.fill();

    // eye
    ctx.fillStyle = '#1a0a00';
    ctx.beginPath();
    ctx.arc(-2, headY - 3, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-1, headY - 4, 1, 0, Math.PI * 2);
    ctx.fill();

    // antlers
    ctx.strokeStyle = '#6a3a10';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(2, headY - 7);
    ctx.bezierCurveTo(5, headY - 20, 8, headY - 26, 6, headY - 32);
    ctx.stroke();
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(6, headY - 20);
    ctx.lineTo(12, headY - 26);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(6, headY - 26);
    ctx.lineTo(2, headY - 32);
    ctx.stroke();

    ctx.restore(); // neck rotation
    ctx.restore(); // translate + scale
  }

  /**
   * set us to be off.
   * cancels any act ions or transitions.
   */
  forceOff() {
    this.phase = 'off';
    this.phaseT = 0;
  }

  /**
   * summon the deer immediately (called by the summon button).
   */
  summon() {
    if (this.phase !== 'off') return;
    this.phase = 'entering';
    this.phaseT = 0;
    this.x = this.W + OFFSCREEN_BOUNDARY;
    this.cooldown = 2400;
  }
}