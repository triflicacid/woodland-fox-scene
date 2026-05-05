import {clamp, eo, lerp, prob} from '@/utils';
import {DrawComponent} from '@/core/DrawComponent';
import {Events} from '@/core/Events';
import {PROBABILITY} from '@/config';
import type {MusicalNotesComponent} from '@/components/birthday/MusicalNotesComponent';
import type {HeartsComponent} from '@/components/particles/HeartsComponent';
import type {EventBus} from '@/event/EventBus';
import type {SceneState} from '@/core/SceneState';

type BunnyPhase =
    'off'
    | 'hopping_in'
    | 'fox_waking'
    | 'nuzzle'
    | 'fox_sleep'
    | 'hopping_out'
    | 'easter_bob'
    | 'birthday_bob';

const BUNNY_PHASES: Record<Exclude<BunnyPhase, 'off'>, { f: number }> = {
    hopping_in: {f: 135},
    fox_waking: {f: 90},
    nuzzle: {f: 160},
    fox_sleep: {f: 95},
    hopping_out: {f: 130},
    easter_bob: {f: Infinity},
    birthday_bob: {f: Infinity},
};

const OFFSCREEN_BOUNDARY = 25;
const MEET_FOX_OFFSET = -100;
const SING_FOX_OFFSET = -90;
const EASTER_BOB_FOX_OFFSET = -100;

// heart spawning happens in the nuzzle phase, should not exceed that value
const BUNNY_NUZZLE_HEART_FRAMES = 140;
const BUNNY_NUZZLE_HEART_INTERVAL = 20;

interface Hop {
    arc: number;
    from: number;
    to: number;
    frame: number;
    t: number;
}

/**
 * render bunny which hops to greet the fox.
 * handles spawning heart particles during Visitor scene.
 */
export class BunnyComponent extends DrawComponent {
    static COMPONENT_NAME = 'BunnyComponent';

    private x = -OFFSCREEN_BOUNDARY;
    private meetX = 0;
    private y = 0;
    private phase: BunnyPhase = 'off';
    private phaseT = 0;
    private hop: Hop = {arc: 0, from: -OFFSCREEN_BOUNDARY, to: -OFFSCREEN_BOUNDARY, frame: 1, t: 0};
    private readonly notes: MusicalNotesComponent;
    private readonly hearts: HeartsComponent;

    constructor(eventBus: EventBus, scene: SceneState, ctx: CanvasRenderingContext2D, W: number, H: number, notes: MusicalNotesComponent, hearts: HeartsComponent) {
        super(eventBus, scene, ctx, W, H);
        this.notes = notes;
        this.hearts = hearts;
    }

    override getName() {
        return BunnyComponent.COMPONENT_NAME;
    }

    override isEnabled() {
        const {specialEvent} = this.scene;
        if (specialEvent === 'birthday' || specialEvent === 'easter') return true;
        return this.phase !== 'off';
    }

    override initialise() {
        this.meetX = this.scene.fox.x + MEET_FOX_OFFSET;
        this.y = this.scene.fox.y;
    }

    override tick() {
        const {fox, specialEvent} = this.scene;
        this.phaseT++;
        const cfg = this.phase !== 'off' ? BUNNY_PHASES[this.phase] : null;

        // easter management
        if (specialEvent === 'easter') {
            if (this.phase === 'off') {
                this.phase = 'easter_bob';
                this.x = fox.x + EASTER_BOB_FOX_OFFSET;
                this.y = fox.y;
                this.phaseT = 0;
            } else if (this.phase === 'easter_bob') {
                this.x = (fox.x + EASTER_BOB_FOX_OFFSET) + Math.sin(this.scene.frame * 0.015) * 13;
            }
            return;
        } else if (this.phase === 'easter_bob') {
            this.phase = 'hopping_out';
            this.phaseT = 0;
            this.startHop(this.x, this.W + OFFSCREEN_BOUNDARY, BUNNY_PHASES.hopping_out.f);
        }

        // birthday management
        if (specialEvent === 'birthday') {
            if (this.phase === 'off') {
                this.phase = 'hopping_in';
                this.phaseT = 0;
                this.x = -OFFSCREEN_BOUNDARY;
                this.hop.arc = 0;
                this.startHop(-OFFSCREEN_BOUNDARY, fox.x + SING_FOX_OFFSET, BUNNY_PHASES.hopping_in.f);
            } else if (this.phase === 'hopping_in' || this.phase === 'birthday_bob') {
                if (this.phase === 'hopping_in' && this.tickHop()) {
                    this.phase = 'birthday_bob';
                    this.phaseT = 0;
                    this.eventBus.dispatch(Events.characterAction(this.getName(), 'bunny', 'sing.start'));
                }
            }
            if (this.phase === 'birthday_bob' && prob(PROBABILITY.BUNNY_SPAWN_NOTE)) {
                this.notes.spawnNote(this.x + 40, this.y - 35);
            }
            return;
        } else if (this.phase === 'birthday_bob') {
            this.phase = 'hopping_out';
            this.phaseT = 0;
            this.startHop(this.x, this.W + OFFSCREEN_BOUNDARY, BUNNY_PHASES.hopping_out.f);
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
            if (this.phaseT >= cfg!.f) {
                this.phase = 'nuzzle';
                this.phaseT = 0;
                this.eventBus.dispatch(Events.statusText(this.getName(), 'They touch noses...'));
                this.eventBus.dispatch(Events.characterAction(this.getName(), 'bunny', 'nuzzle.start'));
            }
        } else if (this.phase === 'nuzzle') {
            this.hop.arc = 0;
            if (this.phaseT % BUNNY_NUZZLE_HEART_INTERVAL === 0 && this.phaseT < BUNNY_NUZZLE_HEART_FRAMES) {
                const noseX = (this.x + 35 + fox.x - 34) / 2;
                this.hearts.spawn(noseX + (Math.random() - 0.5) * 20, this.y - 72);
            }
            if (this.phaseT >= cfg!.f) {
                this.phase = 'fox_sleep';
                this.phaseT = 0;
                this.eventBus.dispatch(Events.characterAction(this.getName(), 'bunny', 'nuzzle.end'));
            }
        } else if (this.phase === 'fox_sleep') {
            if (this.phaseT >= cfg!.f) {
                this.phase = 'hopping_out';
                this.phaseT = 0;
                this.startHop(this.x, this.W + OFFSCREEN_BOUNDARY, BUNNY_PHASES.hopping_out.f);
                this.eventBus.dispatch(Events.characterAction(this.getName(), 'bunny', 'exiting'));
                this.eventBus.dispatch(Events.statusText(this.getName(), 'The bunny hops off...'));
            }
        } else if (this.phase === 'hopping_out') {
            if (this.tickHop()) {
                this.phase = 'off';
                this.eventBus.dispatch(Events.statusText(this.getName(), 'Curled up, fast asleep...'));
                this.eventBus.dispatch(Events.setMainButtons(this.getName(), true));
                this.eventBus.dispatch(Events.characterAction(this.getName(), 'bunny', 'exit'));
            }
        }
    }

    override draw() {
        const {ctx} = this;
        const {fox, frame} = this.scene;

        if (this.phase === 'easter_bob') {
            const bob = Math.sin(frame * 0.08) * 3;
            this.drawBunny(this.x, this.y + bob, 0);
            this.drawCrown(this.x, this.y + bob);
            return;
        }

        if (this.phase === 'birthday_bob') {
            const bob = Math.sin(frame * 0.1 + 1.0) * 4;
            this.drawBunny(this.x, this.y + bob, 0);
            return;
        }

        this.drawBunny(this.x, this.y, this.hop.arc);

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

    private drawBunny(bx: number, by: number, arcT: number) {
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
     */
    private drawCrown(bx: number, by: number) {
        const {ctx} = this;
        const hx = bx + 18;
        const hy = by - 27;
        const cr = 11;
        const ch = 15;

        ctx.save();
        ctx.translate(hx, hy - 12);

        const gold = ctx.createLinearGradient(-cr, -ch, cr, 0);
        gold.addColorStop(0, '#b8860b');
        gold.addColorStop(0.35, '#ffd700');
        gold.addColorStop(0.6, '#ffec5c');
        gold.addColorStop(1, '#b8860b');

        ctx.beginPath();
        ctx.moveTo(-cr, 0);
        ctx.lineTo(-cr, -ch * 0.4);
        ctx.lineTo(-cr * 0.6, -ch);
        ctx.lineTo(-cr * 0.2, -ch * 0.45);
        ctx.lineTo(0, -ch * 1.1);
        ctx.lineTo(cr * 0.2, -ch * 0.45);
        ctx.lineTo(cr * 0.6, -ch);
        ctx.lineTo(cr, -ch * 0.4);
        ctx.lineTo(cr, 0);
        ctx.closePath();
        ctx.fillStyle = gold;
        ctx.fill();
        ctx.strokeStyle = '#b8860b';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        ctx.fillStyle = 'rgba(255,236,92,0.4)';
        ctx.fillRect(-cr, -4, cr * 2, 4);

        const JEWELS: { x: number; y: number; col: string }[] = [
            {x: -cr * 0.55, y: -ch * 0.88, col: '#cc0000'},
            {x: 0, y: -ch, col: '#00aa44'},
            {x: cr * 0.55, y: -ch * 0.88, col: '#0044cc'},
            {x: -cr * 0.2, y: -ch * 0.35, col: '#cc0000'},
            {x: cr * 0.2, y: -ch * 0.35, col: '#0044cc'},
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
        this.x = -OFFSCREEN_BOUNDARY;
        this.hop.arc = 0;
        this.startHop(-OFFSCREEN_BOUNDARY, this.meetX, BUNNY_PHASES.hopping_in.f);
        this.eventBus.dispatch(Events.characterAction(this.getName(), 'bunny', 'enter'));
    }

    private startHop(from: number, to: number, frame: number) {
        this.hop.from = from;
        this.hop.to = to;
        this.hop.frame = frame;
        this.hop.t = 0;
    }

    private tickHop(): boolean {
        const hop = this.hop;
        hop.t++;
        const p = clamp(hop.t / hop.frame, 0, 1);
        hop.arc = (p * Math.max(1, Math.round(Math.abs(hop.to - hop.from) / 55))) % 1;
        this.x = lerp(hop.from, hop.to, eo(p));
        return p >= 1;
    }
}
