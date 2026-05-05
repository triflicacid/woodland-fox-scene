import {DrawComponent} from '@/core/DrawComponent';
import {prob, rnd, rndf} from '@/utils';
import {drawMonster, type MonsterType, randomMonster, randomMonsterForm} from '@/components/eclipse/drawMonsters';
import {Subscriptions} from '@/core/Subscriptions';

interface Silhouette {
    x: number;
    y: number;
    vx: number;
    type: MonsterType;
    form: number;
    phase: number;
    scale: number;
    alpha: number;
}

/**
 * drifting background monster silhouettes during solar eclipse
 */
export class EclipseSilhouettesComponent extends DrawComponent {
    static COMPONENT_NAME = 'EclipseSilhouettesComponent';

    private silhouettes: Silhouette[] = [];

    override getName() {
        return EclipseSilhouettesComponent.COMPONENT_NAME;
    }

    override isEnabled() {
        return this.scene.specialEvent === 'eclipse';
    }

    override initialise() {
        // regenerate silhouettes when entering the eclipse
        this.eventBus.subscribe(Subscriptions.onSpecialEventChange(this.getName(), update => {
            if (update.previous === null && update.updated === 'eclipse') {
                this.generateSilhouettes();
            }
        }));
        if (this.isEnabled()) this.generateSilhouettes();
    }

    private generateSilhouettes() {
        const length = 5 + Math.floor(rnd(6));
        this.silhouettes = Array.from({length}, (_, i) => {
            const type = randomMonster();
            return {
                x: 60 + i * 110 + rndf(30),
                y: this.H * 0.15 + rnd(this.H * 0.3),
                vx: (0.15 + rnd(0.15)) * (prob(0.5) ? 1 : -1),
                type,
                form: randomMonsterForm(type),
                phase: rnd(Math.PI * 2),
                scale: 0.5 + rnd(0.3),
                alpha: 0.5 + rnd(0.25),
            };
        });
    }

    override tick() {
        const {W} = this;
        this.silhouettes.forEach(s => {
            s.x += s.vx;
            if (s.x > W + 80) s.x = -80;
            if (s.x < -80) s.x = W + 80;
        });
    }

    override draw() {
        const {ctx} = this;
        const {frame} = this.scene;
        this.silhouettes.forEach(s => {
            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.scale(s.scale * (s.vx < 0 ? -1 : 1), s.scale);
            ctx.globalAlpha = s.alpha;
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#6a2a9a';
            drawMonster(ctx, s.type, frame + s.phase, true, s.form);
            ctx.restore();
        });
    }
}
