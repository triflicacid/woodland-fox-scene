import {requireNonNull} from "../utils.js";

/**
 * represents a component which may be registered to a scene.
 */
export class Component {
  /** @type {EventBus} */
  eventBus;

  /**
   * @param {EventBus} eventBus event bus used to issue/receive events
   */
  constructor(eventBus) {
    this.eventBus = requireNonNull(eventBus);
  }

  /**
   * called once after scene has been initialised
   * @param {SceneState} state
   */
  initialise(state) {}

  /**
   * is this component enabled this frame?
   * if returns `false`, we do not tick or draw this component.
   * (this is not enforced in this class and should be done elsewhere.)
   * @param {SceneState} state
   * @returns {boolean} is the component enabled? (defaults to true)
   */
  isEnabled(state) {
    return true;
  }

  /**
   * draw this component.
   * @param {SceneState} state
   */
  draw(state) {}

  /**
   * process a tick update for this component.
   * @param {SceneState} state
   * @param {function(string): void} setStatus - callback to update the status text
   * @param {function(): void} enableButtons - callback to re-enable UI buttons
   */
  tick(state, setStatus, enableButtons) {}
}