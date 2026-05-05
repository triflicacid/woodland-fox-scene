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

  isEnabled() {
    return !this.isAtTarget();
  }

  tick() {
    const prevBlend = this.scene.todBlend;
    this.scene.todBlend = lerp(this.scene.todBlend, this.scene.todTarget, 0.025);

    if (this.isAtTarget()) { // done! notify of change completion
      this.eventBus.dispatch(Events.todChange(this.getName(), this.scene.prevTimeOfDay, this.scene));
    }
  }

  isAtTarget() {
    return Math.abs(this.scene.todBlend - this.scene.todTarget) <= 0.01;
  }
}
