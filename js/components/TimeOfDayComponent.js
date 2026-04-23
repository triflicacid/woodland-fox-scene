import {Component} from "@/core/Component";
import {lerp} from "@/utils";
import {Events} from "@/core/Events";

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
    const prevBlend = state.todBlend;
    // blend todBlend toward target
    state.todBlend = lerp(state.todBlend, state.todTarget, 0.025);

    const justFinished = state.todTarget === 1
        ? prevBlend < 0.5 && state.todBlend >= 0.5
        : prevBlend > 0.5 && state.todBlend <= 0.5;
    if (justFinished) {
      // send opposite of tod
      this.eventBus.receive(Events.todChange("TimeOfDayComponent", state.timeOfDay === 'day' ? 'night' : 'day', state));
    }
  }
}
