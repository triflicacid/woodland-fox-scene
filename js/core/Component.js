import {requireNonNull} from "@/utils";

/**
 * represents a component which may be registered to a scene.
 */
export class Component {
  /** @type {EventBus} */
  eventBus;
  /** @type {SceneState} */
  scene;

  /**
   * @param {EventBus} eventBus event bus used to issue/receive events
   * @param {SceneState} scene global scene state
   */
  constructor(eventBus, scene) {
    this.eventBus = requireNonNull(eventBus);
    this.scene = requireNonNull(scene);
  }

  /**
   * get the name of this component
   * @returns {string}
   */
  getName() {
    return this.constructor.name;
  }

  /**
   * called once after scene has been initialised
   */
  initialise() {}

  /**
   * is this component enabled this frame?
   * if returns `false`, we do not tick or draw this component.
   * (this is not enforced in this class and should be done elsewhere.)
   * @returns {boolean} is the component enabled? (defaults to true)
   */
  isEnabled() {
    return true;
  }

  /**
   * draw this component.
   */
  draw() {}

  /**
   * process a tick update for this component.
   */
  tick() {}
}