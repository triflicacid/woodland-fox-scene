import {DrawComponent} from '@/core/DrawComponent';
import {rnd, rndf} from '@/utils';

interface WindDebris {
    x: number;
    y: number;
    vx: number;
    vy: number;
    len: number;
    alpha: number;
}

/**
 * render wind lines
 * (other components handle their own wind calculations, if required)
 */
export class WindComponent extends DrawComponent {
    public static COMPONENT_NAME = 'WindComponent';

    private windDebris: WindDebris[] = [];

    public override getName() {
        return WindComponent.COMPONENT_NAME;
    }

    private makeDebris(): WindDebris {
        return {
            x: -30 - rnd(100),
            y: this.H * 0.2 + rnd(this.H * 0.7),
            vx: 4 + rnd(3),
            vy: rndf(0.5),
            len: 12 + rnd(22),
            alpha: 0.2 + rnd(0.4),
        };
    }

    public override initialise() {
        this.windDebris = Array.from({length: 50}, () => this.makeDebris());
    }

    public override isEnabled() {
        return this.scene.weather === 'wind';
    }

    public override tick() {
        const {W} = this;
        this.windDebris.forEach(wd => {
            wd.x += wd.vx;
            wd.y += wd.vy;
            if (wd.x > W + 30) Object.assign(wd, this.makeDebris());
        });
    }

    public override draw() {
        const {ctx} = this;
        this.windDebris.forEach(wd => {
            ctx.save();
            ctx.globalAlpha = wd.alpha;
            ctx.strokeStyle = 'rgba(180,200,170,0.6)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(wd.x, wd.y);
            ctx.lineTo(wd.x - wd.len, wd.y + wd.vy * 3);
            ctx.stroke();
            ctx.restore();
        });
    }
}