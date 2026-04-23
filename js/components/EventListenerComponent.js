import {Component} from "@/core/Component";
import {Subscriptions} from "@/core/Subscriptions";

/**
 * a component for debugging, we intercept all events
 */
export class EventListenerComponent extends Component {
  /**
   * @param {EventBus} eventBus
   */
  constructor(eventBus) {
    super(eventBus);

    eventBus.subscribe(Subscriptions.captureAll(this.getName(), (a, b) => console.log(a, "|", b)));
  }
}

