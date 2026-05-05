import {DrawComponent} from '@/core/DrawComponent';
import {prob, rnd} from '@/utils';
import {Subscriptions} from '@/core/Subscriptions';
import type {PuddlesComponent} from '@/components/backdrop/ground/PuddlesComponent';
import type {EventBus} from '@/event/EventBus';
import type {SceneState} from '@/core/SceneState';

interface Worm {
    alpha: (puddleLevel: number) => number;
    x: (frame: number) => number;
    y: (frame: number) => number;
    wiggle: (frame: number) => number;
    stroke: string;
    fill: string;
}

/**
 * wiggling worms near puddles when raining
 */
export class WormsComponent extends DrawComponent {
    static COMPONENT_NAME = 'WormsComponent';

    private readonly puddles: PuddlesComponent;
    private worms: Worm[] = [];

    constructor(eventBus: EventBus, scene: SceneState, ctx: CanvasRenderingContext2D, W: number, H: number, puddles: PuddlesComponent) {
        super(eventBus, scene, ctx, W, H);
        this.puddles = puddles;
    }

    override getName() {
        return WormsComponent.COMPONENT_NAME;
    }

    override initialise() {
        this.eventBus.subscribe(Subscriptions.onSeasonChange(this.getName(), () => this.generateWorms()));
        this.eventBus.subscribe(Subscriptions.onWeatherChange(this.getName(), () => this.generateWorms()));
        this.generateWorms();
    }

    private generateWorms() {
        const {weather, season} = this.scene;
        this.worms.length = 0;

        if (weather !== 'rain' && weather !== 'storm') return;
        if (season !== 'spring' && season !== 'summer') return;

        const k = weather === 'storm' ? 3 : 1;

        this.worms = Array.from({length: k + rnd(4)}, (_, i) => {
            const pd = this.puddles.getRandomPuddle();
            if (!pd) return null;
            const p = prob(0.5);
            return {
                alpha: (pl: number) => Math.min(1, (pl - 0.3) / 0.4), // fade-in
                x: (f: number) => pd.x + Math.sin(f * 0.008 + i * 2.1) * (pd.maxRx * 0.6),
                y: (_: number) => pd.y + 6,
                wiggle: (f: number) => f * 0.04 + i * 1.3,
                stroke: p ? '#c06080' : '#9060a0',
                fill: p ? '#d07090' : '#a070b0',
            };
        }).filter((w): w is Worm => w !== null);
    }

    override isEnabled() {
        // only appear once puddles are established
        return this.puddles.getPuddleLevel() > 0.3;
    }

    override draw() {
        const {ctx} = this;
        const {frame} = this.scene;
        const puddleLevel = this.puddles.getPuddleLevel();

        this.worms.forEach(w => {
            const alpha = w.alpha(puddleLevel);
            const wormX = w.x(frame);
            const wormY = w.y(frame);
            const wiggle = w.wiggle(frame);

            ctx.save();
            ctx.globalAlpha = 0.82 * alpha;
            ctx.strokeStyle = w.stroke;
            ctx.lineWidth = 3.5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // draw worm as a short wiggly path of segments
            const len = 18; // half-length in pixels
            ctx.beginPath();
            ctx.moveTo(wormX - len, wormY + Math.sin(wiggle) * 3);
            for (let sx = -len + 4; sx <= len; sx += 4) {
                const sy = wormY + Math.sin(wiggle + sx * 0.22) * 3.5;
                ctx.lineTo(wormX + sx, sy);
            }
            ctx.stroke();

            // rounded head
            const headX = wormX + len + Math.cos(wiggle) * 1.5;
            const headY = wormY + Math.sin(wiggle + len * 0.22) * 3.5;
            ctx.fillStyle = w.fill;
            ctx.beginPath();
            ctx.arc(headX, headY, 2.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        });
    }
}
