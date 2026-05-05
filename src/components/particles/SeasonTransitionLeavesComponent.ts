import {DrawComponent} from '@/core/DrawComponent';
import {rnd, rndf} from '@/utils';
import {Subscriptions} from '@/core/Subscriptions';
import type {Season} from '@/config';

interface TransitionLeaf {
    x: number;
    y: number;
    vx: number;
    vy: number;
    rot: number;
    drot: number;
    hue: number;
    life: number;
}

/**
 * render leaf particles during season transitions
 */
export class SeasonTransitionLeavesComponent extends DrawComponent {
    public static COMPONENT_NAME = 'SeasonTransitionLeavesComponent';

    private seasonLeafActive = false;
    private leaves: TransitionLeaf[] = [];

    public override getName() {
        return SeasonTransitionLeavesComponent.COMPONENT_NAME;
    }

    public override initialise() {
        this.leaves = Array.from({length: 40}, () => ({
            x: rnd(this.W),
            y: -rnd(200),
            vx: rndf(1.5),
            vy: 1.5 + rnd(2),
            rot: rnd(Math.PI * 2),
            drot: 0.04 + rnd(0.08),
            hue: 20 + rnd(30),
            life: 0,
        }));

        this.eventBus.subscribe(Subscriptions.onSeasonChange(this.getName(), update => {
            this.onSeasonChange(update.updated);
        }));
    }

    private onSeasonChange(season: Season) {
        if (season !== 'spring' && season !== 'autumn') return;
        this.seasonLeafActive = true;
        this.leaves.forEach(l => {
            l.x = rnd(this.W);
            l.y = -rnd(200);
            l.life = 0;
            l.vy = 1.5 + rnd(2);
            l.hue = season === 'spring' ? 300 + rnd(60) : 15 + rnd(30);
        });
    }

    public override isEnabled() {
        return this.seasonLeafActive;
    }

    public override tick() {
        let allDone = true;
        this.leaves.forEach(l => {
            if (l.y < this.scene.groundY) {
                allDone = false;
                l.x += l.vx;
                l.y += l.vy;
                l.rot += l.drot;
                l.life++;
            }
        });
        if (allDone) this.seasonLeafActive = false;
    }

    public override draw() {
        const {ctx} = this;
        const {season} = this.scene;
        this.leaves.forEach(l => {
            ctx.save();
            ctx.translate(l.x, l.y);
            ctx.rotate(l.rot);
            ctx.globalAlpha = 0.85;
            ctx.fillStyle = `hsl(${l.hue}, ${season === 'spring' ? 60 : 75}%, ${season === 'spring' ? 80 : 45}%)`;
            ctx.beginPath();
            ctx.ellipse(0, 0, 5, 3, 0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }
}
