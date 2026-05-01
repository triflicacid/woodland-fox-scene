import {clamp, eo, lerp, prob} from '@/utils';
import {PROBABILITY} from '@/config';
import {DrawComponent} from "@/core/DrawComponent";
import {Events} from "@/core/Events";
import {Subscriptions} from "@/core/Subscriptions";

const OFFSCREEN_BOUNDARY = 25;

const HOG_PHASES = {
  in: {f: 200},
  sniff: {f: 180},
  out: {f: 160},
  birthday_bob: {f: Infinity}
};

/**
 * render a hedgehog which occasionally walks into frame
 */
export class HedgehogComponent extends DrawComponent {
  phase = 'off';
  phaseT = 0;
  x = -OFFSCREEN_BOUNDARY;
  y = 0;
  sniffX = 0;
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

  static COMPONENT_NAME = "HedgehogComponent";

  getName() {
    return HedgehogComponent.COMPONENT_NAME;
  }

  initialise() {
    this.y = this.scene.groundY;
    this.sniffX = this.scene.fox.x + 100;

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
    const {fox, season, frame} = this.scene;
    let cfg = HOG_PHASES[this.phase];
    let t = cfg ? clamp(this.phaseT / cfg.f, 0, 1) : NaN;

    if (this.scene.specialEvent === 'birthday') {
      if (this.phase === 'off') {
        this.phase = 'in';
        this.phaseT = 0;
        this.x = -OFFSCREEN_BOUNDARY;
      } else if (this.phase === 'in') {
        const targetX = fox.x - 190;
        this.x = lerp(-OFFSCREEN_BOUNDARY, targetX, eo(t));
        this.phaseT++;
        if (this.phaseT >= cfg.f) {
          this.phase = 'birthday_bob';
          this.phaseT = 0;
          this.eventBus.dispatch(Events.characterAction(this.getName(), 'hedgehog', 'sing.start'));
        }
      }
      if (this.phase === 'birthday_bob' && prob(PROBABILITY.HEDGEHOG_SPAWN_NOTE)) {
        this.notes.spawnNote(this.x + 38, this.y - 30);
      }
      return; // early return
    } else if (this.phase === 'birthday_bob') {
      this.phase = 'out';
      this.phaseT = 0;
      this.eventBus.dispatch(Events.characterAction(this.getName(), 'hedgehog', 'sing.end'));
    }

    // spontaneous arrival in autumn
    if (this.phase === 'off' && !this.bunnyActive && prob(PROBABILITY.HEDGEHOG) && season === 'autumn') {
      this.phase = 'in';
      this.phaseT = 0;
      this.x = -OFFSCREEN_BOUNDARY;
      cfg = HOG_PHASES.in;
      t = 0;
      this.eventBus.dispatch(Events.characterAction(this.getName(), 'hedgehog', 'enter'));
    }
    if (this.phase === 'off') return;

    this.phaseT++;
    if (this.phase === 'in') {
      this.x = lerp(-OFFSCREEN_BOUNDARY, this.sniffX, eo(t));
      if (this.phaseT >= cfg.f) {
        this.phase = 'sniff';
        this.phaseT = 0;
        this.eventBus.dispatch(Events.characterAction(this.getName(), 'hedgehog', 'sniff.start'));
      }

    } else if (this.phase === 'sniff') {
      this.x = this.sniffX + Math.sin(frame * 0.08) * 5;
      if (this.phaseT >= cfg.f) {
        this.phase = 'out';
        this.phaseT = 0;
        this.eventBus.dispatch(Events.characterAction(this.getName(), 'hedgehog', 'sniff.end'));
      }

    } else if (this.phase === 'out') {
      this.x = lerp(this.sniffX, this.W + OFFSCREEN_BOUNDARY, eo(t));
      if (this.phaseT >= cfg.f) {
        this.phase = 'off';
        this.eventBus.dispatch(Events.characterAction(this.getName(), 'hedgehog', 'exit'));
      }
    }
  }

  draw() {
    const {ctx} = this;
    if (this.phase === 'off') {
      return;
    }
    const isBirthday = this.scene.specialEvent === 'birthday';

    const {frame} = this.scene;
    const bob = isBirthday ? Math.sin(this.scene.frame * 0.1 + 0.5) * 3 : 0;
    const x = this.x;
    const y = this.y - 5 + bob;
    const facingRight = this.phase === 'in' || isBirthday || this.phase === 'out';
    const waddle = Math.sin(frame * 0.14) * 2.5;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1.4, 1.4);
    if (facingRight) ctx.scale(-1, 1);

    // legs
    ctx.strokeStyle = '#6a4020';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    [[-9, 3, -10, 10 + waddle], [-3, 5, -4, 12 - waddle], [4, 5, 5, 12 + waddle], [9, 3, 10, 10 - waddle]].forEach(([x1, y1, x2, y2]) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });

    // spiny back
    ctx.fillStyle = '#2a1e0a';
    ctx.beginPath();
    ctx.ellipse(2, -5, 17, 11, -0.1, 0, Math.PI * 2);
    ctx.fill();

    const spineCount = 22;
    ctx.strokeStyle = '#3a2a0e';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < spineCount; i++) {
      const t = i / (spineCount - 1);
      const a = Math.PI * 1.05 + t * Math.PI * 0.9;
      const bx = Math.cos(a) * 10 + 2;
      const by = Math.sin(a) * 7.5 - 5;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + Math.cos(a) * 7, by + Math.sin(a) * 7);
      ctx.stroke();
    }
    // golden spine tips
    ctx.strokeStyle = '#c8a850';
    ctx.lineWidth = 0.6;
    for (let i = 2; i < spineCount - 2; i++) {
      const t = i / (spineCount - 1);
      const a = Math.PI * 1.05 + t * Math.PI * 0.9;
      const bx = Math.cos(a) * 10 + 2;
      const by = Math.sin(a) * 7.5 - 5;
      ctx.beginPath();
      ctx.moveTo(bx + Math.cos(a) * 5, by + Math.sin(a) * 5);
      ctx.lineTo(bx + Math.cos(a) * 7, by + Math.sin(a) * 7);
      ctx.stroke();
    }

    // belly
    ctx.fillStyle = '#d4b87a';
    ctx.beginPath();
    ctx.ellipse(2, 2, 13, 5, 0, 0, Math.PI);
    ctx.fill();

    // face
    const hg = ctx.createRadialGradient(-12, -5, 1, -10, -4, 10);
    hg.addColorStop(0, '#b07840');
    hg.addColorStop(1, '#7a5028');
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.ellipse(-10, -4, 10, 7, -0.15, 0, Math.PI * 2);
    ctx.fill();

    // snout
    ctx.fillStyle = '#9a6030';
    ctx.beginPath();
    ctx.ellipse(-18, -3, 5, 3.5, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // nose
    ctx.fillStyle = '#1a0800';
    ctx.beginPath();
    ctx.ellipse(-22, -3, 2.2, 1.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.arc(-21.5, -3.5, 0.7, 0, Math.PI * 2);
    ctx.fill();

    // eye
    ctx.fillStyle = '#0a0500';
    ctx.beginPath();
    ctx.arc(-15, -8, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.arc(-14.3, -8.7, 0.8, 0, Math.PI * 2);
    ctx.fill();

    // ear nub
    ctx.fillStyle = '#8a6030';
    ctx.beginPath();
    ctx.ellipse(-12, -12, 3, 2, -0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
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
   * summon the hedgehog immediately (called by the summon button)
   */
  summon() {
    if (this.phase !== 'off') return;
    this.phase = 'in';
    this.phaseT = 0;
    this.x = -OFFSCREEN_BOUNDARY;
  }
}
