import {DrawComponent} from '@/core/DrawComponent';

interface Drift {
    x: number;
    y: number;
    dm: number;
}

/**
 * render snow drifts during winter
 */
export class SnowDriftsComponent extends DrawComponent {
    static COMPONENT_NAME = 'SnowDriftsComponent';

    private drifts: Drift[] = [
        {x: 130, y: 0, dm: 0},
        {x: 175, y: 0, dm: 0},
        {x: 510, y: 0, dm: 0},
        {x: 545, y: 0, dm: 0},
    ];

    override getName() {
        return SnowDriftsComponent.COMPONENT_NAME;
    }

    override initialise() {
        this.drifts.forEach(d => {
            d.y = this.scene.groundY + (this.H * d.dm);
        });
    }

    override isEnabled() {
        return this.scene.season === 'winter';
    }

    override draw() {
        const {ctx} = this;
        this.drifts.forEach(({x, y}) => {
            ctx.fillStyle = 'rgba(230,242,252,0.95)';
            ctx.beginPath();
            ctx.ellipse(x, y, 32, 10, 0, Math.PI, 0);
            ctx.fill();
        });
    }
}
