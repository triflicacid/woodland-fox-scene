import {GuardedComponentGroup} from '@/core/GuardedComponentGroup';
import {BonfireComponent} from './BonfireComponent';
import {FireworksComponent} from './FireworkComponent';
import {GuyFawkesComponent} from "@/components/bonfire/GuyFawkesComponent";

/**
 * groups bonfire and fireworks, only active during bonfire night special event.
 */
export class BonfireNightComponent extends GuardedComponentGroup {
  constructor(eventBus, ctx, W, H) {
    /** @type{GuyFawkesComponent} */
    let guyFawkes;
    super(eventBus, state => state.specialEvent === 'bonfire', [
      new FireworksComponent(eventBus, ctx, W, H),
      guyFawkes = new GuyFawkesComponent(eventBus, ctx, W, H),
      new BonfireComponent(eventBus, ctx, W, H),
    ]);
    this._guyFawkes = guyFawkes;
  }

  /**
   * summon guy fawkes immediately.
   */
  summonGuyFawkes() {
    this._guyFawkes.summon();
  }
}
