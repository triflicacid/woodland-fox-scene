import {Component} from "@/core/Component";
import {lerp} from "@/utils";
import {Events} from "@/core/Events";

/**
 * a non-drawing component which advanced time of day only.
 */
export class TimeOfDayComponent extends Component {
  static COMPONENT_NAME = "TimeOfDayComponent";

  getName() {
    return TimeOfDayComponent.COMPONENT_NAME;
  }

  tick() {
    const prevBlend = this.scene.todBlend;
    // blend todBlend toward target
    this.scene.todBlend = lerp(this.scene.todBlend, this.scene.todTarget, 0.025);

    const justFinished = this.scene.todTarget === 1
        ? prevBlend < 0.5 && this.scene.todBlend >= 0.5
        : prevBlend > 0.5 && this.scene.todBlend <= 0.5;
    if (justFinished) {
      // send opposite of tod
      this.eventBus.dispatch(Events.todChange("TimeOfDayComponent", this.scene.timeOfDay === 'day' ? 'night' : 'day', this.scene));
    }
  }
}
