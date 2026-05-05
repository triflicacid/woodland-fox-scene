import {DrawComponent} from '@/core/DrawComponent';
import {rnd} from '@/utils';

interface Snowflake {
    x: number;
    y: number;
    size: number;
    speed: number;
    phase: number;
}

/**
 * render snowflakes during snowfall
 */
export class SnowflakesComponent extends DrawComponent {
    public static COMPONENT_NAME = 'SnowflakesComponent';

    private snowflakes: Snowflake[] = [];

    public override getName() {
        return SnowflakesComponent.COMPONENT_NAME;
    }

    private makeSnowflake(): Snowflake {
        return {
            x: rnd(this.W),
            y: -10 - rnd(this.H),
            size: 1.5 + rnd(3),
            speed: 0.5 + rnd(0.8),
            phase: rnd(Math.PI * 2),
        };
    }

    public override initialise() {
        this.snowflakes = Array.from({length: 120}, () => this.makeSnowflake());
    }

    public override isEnabled() {
        return this.scene.weather === 'snow';
    }

    public override tick() {
        const {H} = this;
        const {frame} = this.scene;
        this.snowflakes.forEach(sf => {
            sf.y += sf.speed;
            sf.x += Math.sin(frame * 0.02 + sf.phase) * 0.5;
            if (sf.y > H) Object.assign(sf, this.makeSnowflake());
        });
    }

    public override draw() {
        const {ctx} = this;
        this.snowflakes.forEach(sf => {
            ctx.save();
            ctx.globalAlpha = 0.75;
            ctx.fillStyle = '#e8f0ff';
            ctx.shadowBlur = 3;
            ctx.shadowColor = '#fff';
            ctx.beginPath();
            ctx.arc(sf.x, sf.y, sf.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }
}
