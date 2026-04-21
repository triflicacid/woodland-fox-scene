import {Component} from "./Component.js";

/**
 * an ordered group of components.
 */
export class ComponentGroup extends Component {
  /**
   * @param {EventBus} eventBus
   * @param {Array<Component> | undefined} components
   */
  constructor(eventBus, components=undefined) {
    super(eventBus);
    /** @type{Array<Component>} */
    this._components = components !== undefined ? components.slice() : [];
  }

  /**
   * add a component to this group.
   * @param {Component} component
   */
  add(component) {
    this._components.push(component);
  }

  initialise(state) {
    this._components.forEach(c => c.initialise(state));
  }

  tick(state, setStatus, enableButtons) {
    this._components.forEach(c => c.tick(state, setStatus, enableButtons));
  }

  draw(state) {
    this._components.forEach(c => c.draw(state));
  }
}