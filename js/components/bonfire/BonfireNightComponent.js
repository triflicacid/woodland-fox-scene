import {GuardedComponentGroup} from '@/core/GuardedComponentGroup';
import {BonfireComponent} from './BonfireComponent';
import {FireworksComponent} from './FireworkComponent';

/**
 * groups bonfire and fireworks, only active during bonfire night special event.
 */
export class BonfireNightComponent extends GuardedComponentGroup {
  constructor(eventBus, ctx, W, H) {
    super(eventBus, state => state.specialEvent === 'bonfire', [
      new BonfireComponent(eventBus, ctx, W, H),
      new FireworksComponent(eventBus, ctx, W, H),
    ]);
  }
}
