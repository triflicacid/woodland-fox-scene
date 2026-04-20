/**
 * A subscription to a given event
 */
export class Subscription {
  /**
   * @template T type of event payload
   * @param {string} eventName
   * @param {string} subscriber name of the subscriber
   * @param {function(value: T): void} onReceive called with the event's value
   */
  constructor(eventName, subscriber, onReceive) {
    this.eventName = eventName;
    this.subscriber = subscriber;
    this.onReceive = onReceive;
  }

  /**
   * trigger an update for the given event
   * @param {T} payload
   */
  trigger(payload) {
    if (typeof this.onReceive === 'function') {
      this.onReceive(payload);
    }
  }
}