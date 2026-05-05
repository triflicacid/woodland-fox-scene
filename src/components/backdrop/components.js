import {ComponentGroup} from "@/core/ComponentGroup";
import {StarsComponent} from "@/components/backdrop/sky/StarsComponent";
import {MoonComponent} from "@/components/backdrop/sky/MoonComponent";
import {SunComponent} from "@/components/backdrop/sky/SunComponent";
import {AuroraComponent} from "@/components/backdrop/sky/AuroraComponent";
import {CloudsComponent} from "@/components/backdrop/sky/CloudsComponent";
import {MistComponent} from "@/components/backdrop/sky/MistComponent";
import {GroundComponent} from "@/components/backdrop/ground/GroundComponent";
import UndergrowthComponent from "@/components/backdrop/ground/UndergrowthComponent";
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
   * @param {SceneState} scene
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} W - canvas width
   * @param {number} H - canvas height
   */
  constructor(eventBus, scene, ctx, W, H) {
    super(eventBus, scene);
    this.ctx = ctx;
    this.W = W;
    this.H = H;

    this._components = [
      new GroundComponent(eventBus, scene, ctx, W, H),
      new UndergrowthComponent(eventBus, scene, ctx, W, H),
      new FallenLeavesComponent(eventBus, scene, ctx, W, H),
      new SnowDriftsComponent(eventBus, scene, ctx, W, H),
      new SpringFlowersComponent(eventBus, scene, ctx, W, H),
      this._puddles = new PuddlesComponent(eventBus, scene, ctx, W, H),
      new WormsComponent(eventBus, scene, ctx, W, H, this._puddles),
      new GrassComponent(eventBus, scene, ctx, W, H),
    ];
  }
}

/**
 * group together backdrop sky components
 */
export class SkyBackdropComponents extends ComponentGroup {
  /**
   * @param {EventBus} eventBus
   * @param {SceneState} scene
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} W - canvas width
   * @param {number} H - canvas height
   */
  constructor(eventBus, scene, ctx, W, H) {
    super(eventBus, scene);
    this.ctx = ctx;
    this.W = W;
    this.H = H;

    this._components = [
      new SkyBackdropComponent(eventBus, scene, ctx, W, H),
      new StarsComponent(eventBus, scene, ctx, W, H),
      new CometComponent(eventBus, scene, ctx, W, H),
      new MoonComponent(eventBus, scene, ctx, W, H),
      new SunComponent(eventBus, scene, ctx, W, H),
      new AuroraComponent(eventBus, scene, ctx, W, H),
      new CloudsComponent(eventBus, scene, ctx, W, H),
      new MistComponent(eventBus, scene, ctx, W, H), // TODO ??
    ];
  }
}
