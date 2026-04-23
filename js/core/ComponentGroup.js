import {Component} from "./Component";

/**
 * an ordered group of components.
 */
export class ComponentGroup extends Component {
  /**
   * @param {EventBus} eventBus
   * @param {SceneState} scene
   * @param {Array<Component> | undefined} components
   */
  constructor(eventBus, scene, components=undefined) {
    super(eventBus, scene);
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

  /**
   * return the component with the given name
   * @param {string} name name of the component, as returned by `Component::getName`
   * @returns {null | Component}
   */
  getComponent(name) {
    for (const component of this._components) {
      if (component instanceof ComponentGroup) {
        const found = component.getComponent(name);
        if (found !== null) {
          return found;
        }
      } else if (component.getName() === name) {
        return component;
      }
    }
    return null;
  }

  initialise() {
    this._components.forEach(c => c.initialise());
  }

  isEnabled() {
    return this._components.some(c => c.isEnabled());
  }

  tick(setStatus, enableButtons) {
    this._components
        .filter(c => c.isEnabled())
        .forEach(c => c.tick(setStatus, enableButtons));
  }

  draw() {
    this._components
        .filter(c => c.isEnabled())
        .forEach(c => c.draw());
  }
}