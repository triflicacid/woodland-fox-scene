import {DrawComponent} from '@/core/DrawComponent';
import {rnd, rndf} from '@/utils';

interface SmokeParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    alpha: number;
    life: number;
}

/**
 * render campfire/cabin smoke particles
 */
export class SmokeComponent extends DrawComponent {
    public static COMPONENT_NAME = 'SmokeComponent';

    private particles: SmokeParticle[] = [];

    public override getName() {
        return SmokeComponent.COMPONENT_NAME;
    }

    public override initialise() {
        this.particles = Array.from({length: 12}, (_, i) => this.makeSmoke(i));
    }

    /**
     * create or reset a smoke particle.
     * `i` is used to stagger particles vertically on init.
     */
    private makeSmoke(i = 0): SmokeParticle {
        return {
            x: 640 + rndf(3),
            y: this.scene.groundY - 50 - i * 8,
            vx: rndf(0.3) + 0.2,
            vy: -0.4 - rnd(0.3),
            size: 4 + i * 1.5,
            alpha: 0.18 - i * 0.013,
            life: 0,
        };
    }

    public override isEnabled() {
        const {weather, season} = this.scene;
        return !(weather === 'rain' || weather === 'storm' || season === 'summer');
    }

    public override tick() {
        const {weather} = this.scene;
        this.particles.forEach((p, i) => {
            p.x += p.vx + (weather === 'wind' ? 1.5 : 0);
            p.y += p.vy;
            p.life++;
            p.size += 0.08;
            p.alpha -= 0.002;
            if (p.life > 90 || p.alpha <= 0) Object.assign(p, this.makeSmoke(i));
        });
    }

    public override draw() {
        const {ctx} = this;
        const {season} = this.scene;
        this.particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.fillStyle = season === 'winter' ? 'rgba(220,230,240,1)' : 'rgba(180,180,170,1)';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }
}
