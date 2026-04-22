import {ComponentGroup} from "@/core/ComponentGroup";
import {StarsComponent} from "@/components/backdrop/sky/StarsComponent";
import {MoonComponent} from "@/components/backdrop/sky/MoonComponent";
import {SunComponent} from "@/components/backdrop/sky/SunComponent";
import {DuskGlowComponent} from "@/components/backdrop/sky/DuskGlowComponent";
import {AuroraComponent} from "@/components/backdrop/sky/AuroraComponent";
import {CloudsComponent} from "@/components/backdrop/sky/CloudsComponent";
import {MistComponent} from "@/components/backdrop/sky/MistComponent";
import {GroundComponent} from "@/components/backdrop/ground/GroundComponent";
import {UndergrowthComponent} from "@/components/backdrop/ground/UndergrowthComponent";
import {FallenLeavesComponent} from "@/components/backdrop/ground/FallenLeavesComponent";
import {SnowDriftsComponent} from "@/components/backdrop/ground/SnowDriftsComponent";
import {SpringFlowersComponent} from "@/components/backdrop/ground/SpringFlowersComponent";
import {PuddlesComponent} from "@/components/backdrop/ground/PuddlesComponent";
import {WormsComponent} from "@/components/backdrop/ground/WormsComponent";
import {GrassComponent} from "@/components/backdrop/ground/GrassComponent";
import {SkyBackdropComponent} from "@/components/backdrop/sky/SkyBackdropComponent";
import {CometComponent} from "@/components/backdrop/sky/CometComponent";

/**
 * group together backdrop ground components
 */
export class GroundBackdropComponents extends ComponentGroup {
  /**
   * @param {EventBus} eventBus
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} W - canvas width
   * @param {number} H - canvas height
   */
  constructor(eventBus, ctx, W, H) {
    super(eventBus);
    this.ctx = ctx;
    this.W = W;
    this.H = H;

    this._components = [
      new GroundComponent(eventBus, ctx, W, H),
      new UndergrowthComponent(eventBus, ctx, W, H),
      new FallenLeavesComponent(eventBus, ctx, W, H),
      new SnowDriftsComponent(eventBus, ctx, W, H),
      new SpringFlowersComponent(eventBus, ctx, W, H),
      new PuddlesComponent(eventBus, ctx, W, H),
      new WormsComponent(eventBus, ctx, W, H),
      new GrassComponent(eventBus, ctx, W, H),
    ];
  }
}

/**
* group together backdrop sky components
*/
export class SkyBackdropComponents extends ComponentGroup {
  /**
   * @param {EventBus} eventBus
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} W - canvas width
   * @param {number} H - canvas height
   */
  constructor(eventBus, ctx, W, H) {
    super(eventBus);
    this.ctx = ctx;
    this.W = W;
    this.H = H;

    this._components = [
      new SkyBackdropComponent(eventBus, ctx, W, H),
      new StarsComponent(eventBus, ctx, W, H),
      new CometComponent(eventBus, ctx, W, H),
      new MoonComponent(eventBus, ctx, W, H),
      new SunComponent(eventBus, ctx, W, H),
      new DuskGlowComponent(eventBus, ctx, W, H),
      new AuroraComponent(eventBus, ctx, W, H),
      new CloudsComponent(eventBus, ctx, W, H),
      new MistComponent(eventBus, ctx, W, H), // TODO ??
    ];
  }
}
