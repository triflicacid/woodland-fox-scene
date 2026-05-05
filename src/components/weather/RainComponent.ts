import {DrawComponent} from '@/core/DrawComponent';
import {rnd} from '@/utils';

interface Raindrop {
    x: number;
    y: number;
    len: number;
    speed: number;
}

/**
 * render rain droplets
 */
export class RainComponent extends DrawComponent {
    public static COMPONENT_NAME = 'RainComponent';

    private raindrops: Raindrop[] = [];

    public override getName() {
        return RainComponent.COMPONENT_NAME;
    }

    public override initialise() {
        this.raindrops = Array.from({length: 250}, () => this.makeRain());
    }

    private makeRain(): Raindrop {
        return {
            x: rnd(this.W),
            y: rnd(this.H),
            len: 8 + rnd(14),
            speed: 12 + rnd(8),
        };
    }

    public override isEnabled() {
        const {weather} = this.scene;
        return weather === 'rain' || weather === 'storm';
    }

    /**
     * get angle of the rain
     */
    private getRainAngle() {
        return this.scene.weather === 'storm' ? 0.15 : 0.06;
    }

    public override tick() {
        const {W, H} = this;
        const angle = this.getRainAngle();
        this.raindrops.forEach(r => {
            r.y += r.speed;
            r.x += r.speed * angle;
            if (r.y > H || r.x > W) Object.assign(r, this.makeRain());
        });
    }

    public override draw() {
        const {ctx} = this;
        const {weather} = this.scene;
        const angle = this.getRainAngle();
        ctx.strokeStyle = weather === 'storm' ? 'rgba(160,180,220,0.5)' : 'rgba(120,160,200,0.45)';
        ctx.lineWidth = weather === 'storm' ? 1.5 : 1;
        this.raindrops.forEach(r => {
            ctx.beginPath();
            ctx.moveTo(r.x, r.y);
            ctx.lineTo(r.x - r.len * angle, r.y - r.len);
            ctx.stroke();
        });
    }
}