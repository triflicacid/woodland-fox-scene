import {Component} from "@/core/Component";
import {Subscription} from "@/event/Subscription";

/**
 * a component for debugging, we intercept all events
 */
export class EventListenerComponent extends Component {
  static COMPONENT_NAME = "EventListenerComponent";

  getName() {
    return EventListenerComponent.COMPONENT_NAME;
  }

  initialise(state) {
    this.eventBus.subscribe(new Subscription(Subscription.CAPTURE_ALL, this.getName(), event => {
      this.logEvent(event.eventName) && console.log(`${event.eventName} (${event.originator})`, event.payload);
    }, true));
  }

  /**
   * are we logging the given event?
   * @param {string} event
   */
  logEvent(event) {
    const f = globalThis.printEvents;
    if (typeof f === 'object') {
      return f.indexOf(event) !== -1;
    }
    return !!f;
  }
}

