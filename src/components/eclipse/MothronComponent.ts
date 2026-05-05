import {DrawComponent} from '@/core/DrawComponent';
import {lerp, prob, rnd} from '@/utils';
import {Events} from '@/core/Events';
import {PROBABILITY} from '@/config';

type MothronPhase = 'off' | 'flying' | 'diving' | 'returning';

/**
 * mothron - giant moth boss that flies across the sky and occasionally dives at the fox.
 */
export class MothronComponent extends DrawComponent {
    public static COMPONENT_NAME = 'MothronComponent';

    private x = -200;
    private y = 80;
    private vx = 0;
    private phase: MothronPhase = 'off';
    private flapT = 0;
    private diveTargetX = 0;
    private diveTargetY = 0;
    private cooldown = 0;

    public override getName() {
        return MothronComponent.COMPONENT_NAME;
    }

    public override isEnabled() {
        return this.scene.specialEvent === 'eclipse';
    }

    public override tick() {
        const {W, fox} = this.scene;
        this.cooldown--;
        this.flapT += 0.12;

        if (this.phase === 'off') {
            if (this.cooldown <= 0 && prob(PROBABILITY.ECLIPSE.MOTHRON_SPAWN)) {
                this.summon();
            }
            return;
        }

        if (this.phase === 'flying') {
            this.x += this.vx;
            this.y += Math.sin(this.flapT * 0.08) * 1.2;

            // occasionally dive at fox
            if (prob(PROBABILITY.ECLIPSE.MOTHRON_DIVE) && this.cooldown <= 0) {
                this.phase = 'diving';
                this.diveTargetX = fox.x;
                this.diveTargetY = fox.y - 30;
                this.eventBus.dispatch(Events.mothronDive(this.getName()));
            }

            if (this.x < -100 || this.x > W + 100) {
                this.phase = 'off';
                this.cooldown = 300;
            }
        }

        if (this.phase === 'diving') {
            this.x = lerp(this.x, this.diveTargetX, 0.04);
            this.y = lerp(this.y, this.diveTargetY, 0.04);
            if (Math.abs(this.x - this.diveTargetX) < 20) {
                this.phase = 'returning';
                this.cooldown = 200;
            }
        }

        if (this.phase === 'returning') {
            this.y = lerp(this.y, 60 + rnd(60), 0.02);
            this.x += this.vx;
            if (this.x < -100 || this.x > W + 100) {
                this.phase = 'off';
                this.cooldown = 400;
            }
        }
    }

    public override draw() {
        if (this.phase === 'off') return;
        const {ctx} = this;
        const flap = Math.sin(this.flapT) * 0.8;
        const facingRight = this.vx > 0;

        ctx.save();
        ctx.translate(this.x, this.y);
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
        ctx.fillStyle = '#ff8020';
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
    public summon() {
        if (this.phase !== 'off') return;
        this.phase = 'flying';
        this.x = prob(0.5) ? -80 : this.W + 80;
        this.y = 40 + rnd(this.H * 0.3);
        this.vx = this.x < 0 ? 2 + rnd(1.5) : -(2 + rnd(1.5));
    }
}
