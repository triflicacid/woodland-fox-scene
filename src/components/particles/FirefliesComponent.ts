import {DrawComponent} from '@/core/DrawComponent';
import {clamp, rnd} from '@/utils';
import {Subscriptions} from '@/core/Subscriptions';

interface Firefly {
    x: number;
    y: number;
    speed: number;
    angle: number;
    phase: number;
    size: number;
}

const MIN_FIREFLIES = 18;
const MAX_FIREFLIES = 64;

/**
 * render fireflies during nighttime
 */
export class FirefliesComponent extends DrawComponent {
    public static COMPONENT_NAME = 'FirefliesComponent';

    private fireflies: Firefly[] = [];

    public override getName() {
        return FirefliesComponent.COMPONENT_NAME;
    }

    public override initialise() {
        this.generateFireflies();

        this.eventBus.subscribe(Subscriptions.onSceneStateMutation(this.getName(), () => {
            if (this.isEnabled()) this.generateFireflies();
        }));
    }

    private generateFireflies() {
        if (this.scene.specialEvent === 'bonfire') return; // reasoning: too loud

        const {W, H} = this;
        const t = Math.abs(this.scene.moonPhase - 4) / 4; // 0 at full, 1 at new
        const length = Math.round(MIN_FIREFLIES + (MAX_FIREFLIES - MIN_FIREFLIES) * t * t);

        this.fireflies = Array.from({length}, () => ({
            x: 80 + rnd(W - 160),
            y: H * 0.35 + rnd(H * 0.3),
            speed: 0.3 + rnd(0.4),
            angle: rnd(Math.PI * 2),
            phase: rnd(Math.PI * 2),
            size: 1.5 + rnd(1.5),
        }));
    }

    public override isEnabled() {
        return this.scene.todBlend < 0.5 && !(this.scene.weather === 'rain' || this.scene.weather === 'storm');
    }

    public override tick() {
        const {W, H} = this;
        const minX = 60, maxX = W - 60;
        const minY = H * 0.3, maxY = H * 0.65;

        this.fireflies.forEach(f => {
            f.angle += (Math.random() - 0.5) * 0.08;
            f.x += Math.cos(f.angle) * f.speed;
            f.y += Math.sin(f.angle) * f.speed * 0.5;

            // bounce off edges by reflecting the angle rather than clamping position
            if (f.x < minX) {
                f.x = minX;
                f.angle = Math.PI - f.angle;
            }
            if (f.x > maxX) {
                f.x = maxX;
                f.angle = Math.PI - f.angle;
            }
            if (f.y < minY) {
                f.y = minY;
                f.angle = -f.angle;
            }
            if (f.y > maxY) {
                f.y = maxY;
                f.angle = -f.angle;
            }

            // nudge after bounce to prevent resonance
            if (f.x < minX || f.x > maxX || f.y < minY || f.y > maxY) {
                f.angle += (Math.random() - 0.5) * 0.3;
            }
        });
    }

    public override draw() {
        const {ctx} = this;
        const {todBlend, frame} = this.scene;
        const alpha = clamp(1 - todBlend * 2, 0, 1);

        this.fireflies.forEach(f => {
            const g = 0.4 + 0.6 * Math.sin(frame * 0.05 + f.phase);
            ctx.save();
            ctx.globalAlpha = g * 0.85 * alpha;
            ctx.shadowBlur = 12 + g * 8;
            ctx.shadowColor = '#aaff88';
            ctx.fillStyle = '#ccff99';
            ctx.beginPath();
            ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }
}
