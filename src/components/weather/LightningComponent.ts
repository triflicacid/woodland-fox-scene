import {prob, rnd, rndf} from '@/utils';
import {PROBABILITY} from '@/config';
import {DrawComponent} from '@/core/DrawComponent';
import {Events} from '@/core/Events';

interface Bolt {
    path: [number, number][];
    t: number;
    superBolt: boolean;
}

const LIGHTNING_ENDPOINT_Y_MARGIN = 0.03;
const BOLT_LIFETIME = 8;
const BOLT_SPREAD_NORMAL = 40;
const BOLT_SPREAD_SUPER = 70;

/**
 * render lightning bolts during a storm
 */
export class LightningComponent extends DrawComponent {
    public static COMPONENT_NAME = 'LightningComponent';

    private bolts: Bolt[] = [];

    public override getName() {
        return LightningComponent.COMPONENT_NAME;
    }

    public override draw() {
        const {ctx, W, H} = this;
        if (!this.bolts.length) return;

        // single canvas flash driven by the brightest active bolt
        const maxFade = Math.max(...this.bolts.map(b => 1 - b.t / BOLT_LIFETIME));
        const hasSuper = this.bolts.some(b => b.superBolt);
        ctx.fillStyle = `rgba(200,220,255,${(hasSuper ? 0.25 : 0.15) * maxFade})`;
        ctx.fillRect(0, 0, W, H);

        this.bolts.forEach(bolt => {
            const fade = 1 - bolt.t / BOLT_LIFETIME;

            // core bolt
            ctx.strokeStyle = bolt.superBolt
                ? `rgba(240,245,255,${fade})`
                : `rgba(220,230,255,${fade})`;
            ctx.lineWidth = bolt.superBolt ? 3 : 2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            bolt.path.forEach(([lx, ly], i) => i === 0 ? ctx.moveTo(lx, ly) : ctx.lineTo(lx, ly));
            ctx.stroke();

            // wide glow
            ctx.strokeStyle = bolt.superBolt
                ? `rgba(235,210,255,${0.6 * fade})`
                : `rgba(180,200,255,${0.4 * fade})`;
            ctx.lineWidth = bolt.superBolt ? 16 : 8;
            ctx.beginPath();
            bolt.path.forEach(([lx, ly], i) => i === 0 ? ctx.moveTo(lx, ly) : ctx.lineTo(lx, ly));
            ctx.stroke();
        });
    }

    public override tick() {
        // chance to spawn a new bolt each frame
        if (this.scene.weather === 'storm' && prob(PROBABILITY.LIGHTNING)) {
            this.summonBolt();
        }

        // advance all bolts, remove expired ones
        this.bolts.forEach(b => b.t++);
        this.bolts = this.bolts.filter(b => b.t < BOLT_LIFETIME);
    }

    /**
     * summon a lightning bolt.
     * @param superBolt is this bolt a super bolt (if `undefined`, this is probabilistic)
     * @param silent if true (default), do not fire an event
     */
    public summonBolt(superBolt?: boolean, silent = false) {
        if (superBolt === undefined) superBolt = prob(PROBABILITY.SUPER_BOLT);

        const spread = superBolt ? BOLT_SPREAD_SUPER : BOLT_SPREAD_NORMAL;
        const path: [number, number][] = [];
        let lx = 200 + rnd(300), ly = 0;
        const endY = this.scene.groundY + (this.H * LIGHTNING_ENDPOINT_Y_MARGIN);
        while (ly < endY) {
            path.push([lx, ly]);
            lx += rndf(spread);
            ly += 20 + rnd(20);
        }
        this.bolts.push({path, t: 0, superBolt});

        if (!silent) this.eventBus.dispatch(Events.lightningStrike(this.getName(), superBolt));
    }
}
