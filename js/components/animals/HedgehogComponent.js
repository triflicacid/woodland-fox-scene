import {clamp, eo, lerp, prob} from '@/utils';
import {PROBABILITY} from '@/config';
import {DrawComponent} from "@/core/DrawComponent";
import {Events} from "@/core/Events";
import {Subscriptions} from "@/core/Subscriptions";

/**
 * render a hedgehog which occasionally walks into frame
 */
export class HedgehogComponent extends DrawComponent {
  hog = {
    x: -60,
    y_fraction: 0.62,
    phase: 'off',
    phaseT: 0,
  };
  _bunnyActive = false;
  /** @type{MusicalNotesComponent} */
  _notes;

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
    this._notes = notes;
  }

  static COMPONENT_NAME = "HedgehogComponent";

  getName() {
    return HedgehogComponent.COMPONENT_NAME;
  }

  initialise() {
    this.eventBus.subscribe(Subscriptions.onCharacterAction(this.getName(), ({character, action}) => {
      if (character === 'bunny') {
        if (action === 'enter') {
          this._bunnyActive = true;
        } else if (action === 'exit') {
          this._bunnyActive = false;
        }
      }
    }));
  }

  tick() {
    const {hog} = this;
    const {fox, bunny, season, frame} = this.scene;

    if (this.scene.specialEvent === 'birthday') {
      if (hog.phase === 'off') {
        hog.phase = 'in';
        hog.phaseT = 0;
        hog.x = -60;
      } else if (hog.phase === 'in') {
        const targetX = fox.x - 190;
        hog.x = lerp(-60, targetX, eo(clamp(hog.phaseT / 300, 0, 1)));
        hog.phaseT++;
        if (hog.phaseT >= 300) {
          hog.phase = 'birthday_bob';
          hog.phaseT = 0;
          this.eventBus.dispatch(Events.characterAction(this.getName(), 'hedgehog', 'sing.start'));
        }
      }
      if (hog.phase === 'birthday_bob' && prob(PROBABILITY.HEDGEHOG_SPAWN_NOTE)) {
        this._notes.spawnNote(hog.x + 38, this.H * hog.y_fraction - 30);
      }
      return; // early return
    } else if (hog.phase === 'birthday_bob') {
      hog.phase = 'out';
      hog.phaseT = 0;
      this.eventBus.dispatch(Events.characterAction(this.getName(), 'hedgehog', 'sing.end'));
    }

    // spontaneous arrival in autumn
    if (hog.phase === 'off' && !this._bunnyActive && prob(PROBABILITY.HEDGEHOG) && season === 'autumn') {
      hog.phase = 'in';
      hog.phaseT = 0;
      hog.x = -60;
      this.eventBus.dispatch(Events.characterAction(this.getName(), 'hedgehog', 'enter'));
    }
    if (hog.phase === 'off') return;

    hog.phaseT++;
    if (hog.phase === 'in') {
      hog.x = lerp(-60, fox.x - 90, eo(clamp(hog.phaseT / 300, 0, 1)));
      if (hog.phaseT >= 320) {
        hog.phase = 'sniff';
        hog.phaseT = 0;
        this.eventBus.dispatch(Events.characterAction(this.getName(), 'hedgehog', 'sniff.start'));
      }

    } else if (hog.phase === 'sniff') {
      hog.x = fox.x - 90 + Math.sin(frame * 0.04) * 8;
      if (hog.phaseT > 180) {
        hog.phase = 'out';
        hog.phaseT = 0;
        this.eventBus.dispatch(Events.characterAction(this.getName(), 'hedgehog', 'sniff.end'));
      }

    } else if (hog.phase === 'out') {
      hog.x = lerp(fox.x - 90, this.W + 80, eo(clamp(hog.phaseT / 280, 0, 1)));
      if (hog.phaseT >= 280) {
        hog.phase = 'off';
        this.eventBus.dispatch(Events.characterAction(this.getName(), 'hedgehog', 'exit'));
      }
    }
  }

  draw() {
    const {ctx, hog} = this;
    if (hog.phase === 'off') {
      return;
    }
    const isBirthday = this.scene.specialEvent === 'birthday';

    const {frame} = this.scene;
    const bob = isBirthday ? Math.sin(this.scene.frame * 0.1 + 0.5) * 3 : 0;
    const x = hog.x;
    const y = this.H * hog.y_fraction - 5 + bob;
    const facingRight = hog.phase === 'in' || isBirthday || hog.phase === 'out';
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
   * summon the hedgehog immediately (called by the summon button)
   */
  summon() {
    this.hog.phase = 'in';
    this.hog.phaseT = 0;
    this.hog.x = -60;
  }
}
