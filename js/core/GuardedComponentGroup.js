import {Component} from "./Component";
import {ComponentGroup} from "@/core/ComponentGroup";

/**
 * a group of components which are all guarded by a predicate.
 */
export class GuardedComponentGroup extends ComponentGroup {
  /**
   * @param {EventBus} eventBus
   * @param {function(SceneState): boolean} guard
   * @param {Array<Component> | undefined} components
   */
  constructor(eventBus, guard, components=undefined) {
    super(eventBus);
    this._guard = guard;
    /** @type{Array<Component>} */
    this._components = components !== undefined ? components.slice() : [];
  }

  isEnabled(state) {
    return this._guard(state);
  }
}