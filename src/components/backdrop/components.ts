import {ComponentGroup} from '@/core/ComponentGroup';
import {StarsComponent} from '@/components/backdrop/sky/StarsComponent';
import {MoonComponent} from '@/components/backdrop/sky/MoonComponent';
import {SunComponent} from '@/components/backdrop/sky/SunComponent';
import {AuroraComponent} from '@/components/backdrop/sky/AuroraComponent';
import {CloudsComponent} from '@/components/backdrop/sky/CloudsComponent';
import {MistComponent} from '@/components/backdrop/sky/MistComponent';
import {GroundComponent} from '@/components/backdrop/ground/GroundComponent';
import {UndergrowthComponent} from '@/components/backdrop/ground/UndergrowthComponent';
import {FallenLeavesComponent} from '@/components/backdrop/ground/FallenLeavesComponent';
import {SnowDriftsComponent} from '@/components/backdrop/ground/SnowDriftsComponent';
import {SpringFlowersComponent} from '@/components/backdrop/ground/SpringFlowersComponent';
import {PuddlesComponent} from '@/components/backdrop/ground/PuddlesComponent';
import {WormsComponent} from '@/components/backdrop/ground/WormsComponent';
import {GrassComponent} from '@/components/backdrop/ground/GrassComponent';
import {SkyBackdropComponent} from '@/components/backdrop/sky/SkyBackdropComponent';
import {CometComponent} from '@/components/backdrop/sky/CometComponent';
import type {EventBus} from '@/event/EventBus';
import type {SceneState} from '@/core/SceneState';

/**
 * group together backdrop ground components
 */
export class GroundBackdropComponents extends ComponentGroup {
    public constructor(eventBus: EventBus, scene: SceneState, ctx: CanvasRenderingContext2D, W: number, H: number) {
        super(eventBus, scene);
        const puddles = new PuddlesComponent(eventBus, scene, ctx, W, H);
        this.add(new GroundComponent(eventBus, scene, ctx, W, H));
        this.add(new UndergrowthComponent(eventBus, scene, ctx, W, H));
        this.add(new FallenLeavesComponent(eventBus, scene, ctx, W, H));
        this.add(new SnowDriftsComponent(eventBus, scene, ctx, W, H));
        this.add(new SpringFlowersComponent(eventBus, scene, ctx, W, H));
        this.add(puddles);
        this.add(new WormsComponent(eventBus, scene, ctx, W, H, puddles));
        this.add(new GrassComponent(eventBus, scene, ctx, W, H));
    }
}

/**
 * group together backdrop sky components
 */
export class SkyBackdropComponents extends ComponentGroup {
    public constructor(eventBus: EventBus, scene: SceneState, ctx: CanvasRenderingContext2D, W: number, H: number) {
        super(eventBus, scene);
        this.add(new SkyBackdropComponent(eventBus, scene, ctx, W, H));
        this.add(new StarsComponent(eventBus, scene, ctx, W, H));
        this.add(new CometComponent(eventBus, scene, ctx, W, H));
        this.add(new MoonComponent(eventBus, scene, ctx, W, H));
        this.add(new SunComponent(eventBus, scene, ctx, W, H));
        this.add(new AuroraComponent(eventBus, scene, ctx, W, H));
        this.add(new CloudsComponent(eventBus, scene, ctx, W, H));
        this.add(new MistComponent(eventBus, scene, ctx, W, H)); // TODO ??
    }
}
