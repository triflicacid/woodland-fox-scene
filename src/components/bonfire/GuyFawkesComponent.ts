import {DrawComponent} from '@/core/DrawComponent';
import {PROBABILITY} from '@/config';
import {clamp, eo, lerp, prob} from '@/utils';
import {Events} from '@/core/Events';
import {Position} from '@/core/Position';
import type {EventBus} from '@/event/EventBus';
import type {SceneState} from '@/core/SceneState';

type GuyFawkesPhase = 'off' | 'entering' | 'watching' | 'salute' | 'leaving';

const PHASE_DURATIONS: Record<Exclude<GuyFawkesPhase, 'off'>, number> = {
    entering: 180,
    watching: 80,
    salute: 60,
    leaving: 180,
};

/**
 * guy fawkes occasionally wanders in from one side,
 * watches the bonfire, raises his fist in salute, then leaves.
 * only active during bonfire night special event.
 */
export class GuyFawkesComponent extends DrawComponent {
    static COMPONENT_NAME = 'GuyFawkesComponent';

    private readonly bonfire: Position;
    private phase: GuyFawkesPhase = 'off';
    private phaseT = 0;
    private x = 0;
    private fromRight = false;
    private cooldown = 0;

    constructor(eventBus: EventBus, scene: SceneState, ctx: CanvasRenderingContext2D, W: number, H: number, bonfire: Position) {
        super(eventBus, scene, ctx, W, H);
        this.bonfire = bonfire;
    }

    override getName() {
        return GuyFawkesComponent.COMPONENT_NAME;
    }

    override isEnabled() {
        // check phase to allow for manual overriding
        return this.scene.specialEvent === 'bonfire' || this.phase !== 'off';
    }

    /**
     * summon guy fawkes immediately.
     */
    summon() {
        if (this.phase !== 'off') return;
        this.start();
    }

    override tick() {
        this.cooldown--;

        if (this.phase === 'off') {
            if (this.cooldown <= 0 && prob(PROBABILITY.GUY_FAWKES)) {
                this.start();
                this.eventBus.dispatch(Events.statusText(this.getName(), 'A mysterious cloaked figure approaches...'));
            }
            return;
        }

        this.phaseT++;
        const duration = PHASE_DURATIONS[this.phase];
        const t = clamp(this.phaseT / duration, 0, 1);
        const targetX = this.bonfire.x + (this.fromRight ? 90 : -90);
        const startX = this.fromRight ? this.W + 40 : -40;
        const exitX = this.fromRight ? -40 : this.W + 40;

        if (this.phase === 'entering') {
            this.x = lerp(startX, targetX, eo(t));
            if (this.phaseT >= duration) {
                this.phase = 'watching';
                this.phaseT = 0;
                this.eventBus.dispatch(Events.statusText(this.getName(), 'The figure stares into the flames...'));
                this.eventBus.dispatch(Events.characterAction(this.getName(), 'guyfawkes', 'watch.start'));
            }
        } else if (this.phase === 'watching') {
            this.x = targetX + Math.sin(this.phaseT * 0.03) * 3; // slight sway while watching
            if (this.phaseT >= duration) {
                this.phase = 'salute';
                this.phaseT = 0;
                this.eventBus.dispatch(Events.statusText(this.getName(), 'Remember, remember...'));
                this.eventBus.dispatch(Events.characterAction(this.getName(), 'guyfawkes', 'salute'));
            }
        } else if (this.phase === 'salute') {
            this.x = targetX;
            if (this.phaseT >= duration) {
                this.phase = 'leaving';
                this.phaseT = 0;
                this.eventBus.dispatch(Events.statusText(this.getName(), 'The figure slips back into the dark...'));
                this.eventBus.dispatch(Events.characterAction(this.getName(), 'guyfawkes', 'watch.end'));
            }
        } else if (this.phase === 'leaving') {
            this.x = lerp(targetX, exitX, eo(t));
            if (this.phaseT >= duration) {
                this.phase = 'off';
                this.phaseT = 0;
                this.cooldown = 1800;
                this.eventBus.dispatch(Events.statusText(this.getName(), 'Curled up, fast asleep...'));
                this.eventBus.dispatch(Events.characterAction(this.getName(), 'guyfawkes', 'exit'));
            }
        }
    }

    override draw() {
        if (this.phase === 'off') return;
        const facingRight = !this.fromRight; // faces toward bonfire
        this.drawGuyFawkes(this.x, this.scene.groundY, facingRight, this.scene.frame);
    }

    /**
     * start a new guy fawkes appearance.
     */
    private start() {
        this.fromRight = prob(0.5);
        this.phase = 'entering';
        this.phaseT = 0;
        this.cooldown = 2400;
        this.eventBus.dispatch(Events.characterAction(this.getName(), 'guyfawkes', 'enter'));
    }

    /**
     * draw the guy fawkes figure.
     */
    private drawGuyFawkes(x: number, y: number, facingRight: boolean, frame: number) {
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
        const legSway = Math.sin(frame * 0.08) * (this.phase === 'watching' || this.phase === 'salute' ? 0 : 3);
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
        if (this.phase === 'watching' || this.phase === 'salute') {
            // t goes 0->1 over watching phase, then holds at 1 during salute
            const riseT = this.phase === 'salute' ? 1 : clamp(this.phaseT / 40, 0, 1);
            const pump = this.phase === 'salute' ? Math.sin(this.phaseT * 0.25) * 4 : 0;

            const fistX = 14;
            const fistY = -44 - riseT * 36 + pump; // rises from cloak hem to above head

            // arm - only visible portion above cloak edge
            const armStartY = -36;
            if (fistY < armStartY) {
                ctx.strokeStyle = '#1a1a2a';
                ctx.lineWidth = 5;
                ctx.lineCap = 'round';
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
            ctx.lineWidth = 0.8;
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

        // face - slightly pale
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

        // tall hat - brim
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
