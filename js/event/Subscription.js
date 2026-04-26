/**
 * A subscription to a given event
 */
export class Subscription {
  /**
   * captures any and all events
   */
  static CAPTURE_ALL = "*ALL*";

  /**
   * @template T type of event payload
   * @param {string} eventName
   * @param {string} subscriber name of the subscriber
   * @param {(function(value: T): void) | (function(event: Event<T>): void)} onReceive called with the event's value or the event itself
   * @param {boolean} detail provide callback with entire event or just its payload
   */
  constructor(eventName, subscriber, onReceive, detail = false) {
    this.eventName = eventName;
    this.subscriber = subscriber;
    this.onReceive = onReceive;
    this.detailed = detail;
  }

  /**
   * trigger an update for the given event
   * @param {Event<T>} event
   */
  trigger(event) {
    if (typeof this.onReceive === 'function') {
      this.onReceive(this.detailed ? event : event.payload);
    }
  }
}