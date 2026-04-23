import {Component} from "@/core/Component";
import {Subscriptions} from "@/core/Subscriptions";

/**
 * a component for debugging, we intercept all events
 */
export class EventListenerComponent extends Component {
  initialise(state) {
    this.eventBus.subscribe(Subscriptions.captureAll(this.getName(), (a, b) => console.log(a, "|", b)));
  }
}

