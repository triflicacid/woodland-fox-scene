import {Component} from "../core/Component";
import {lerp} from "../utils";

/**
 * a non-drawing component which advanced time of day only.
 */
export class TimeOfDayComponent extends Component {
  /**
   * @param {EventBus} eventBus
   */
  constructor(eventBus) {
    super(eventBus);
  }

  tick(state, _1, _2) {
    // blend todBlend toward target
    state.todBlend = lerp(state.todBlend, state.todTarget, 0.025);
  }
}
