import {Component} from "@/core/Component";
import {Subscription} from "@/event/Subscription";

/**
 * a component for debugging, we intercept all events
 */
export class EventListenerComponent extends Component {
  initialise(state) {
    this.eventBus.subscribe(new Subscription(Subscription.CAPTURE_ALL, this.getName(), event => {
      console.log(`${event.eventName} (${event.originator})`, event.payload);
    }, true));
  }
}

