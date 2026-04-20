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