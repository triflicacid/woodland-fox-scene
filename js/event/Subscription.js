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
   * @param {(function(value: T): void) | (function(initiator: string, value: T): void)} onReceive called with the event's value
   */
  constructor(eventName, subscriber, onReceive) {
    this.eventName = eventName;
    this.subscriber = subscriber;
    this.onReceive = onReceive;
  }

  /**
   * trigger an update for the given event
   * @param {string} initiator
   * @param {T} payload
   */
  trigger(initiator, payload) {
    if (typeof this.onReceive === 'function') {
      if (this.onReceive.length === 2) {
        this.onReceive(initiator, payload);
      } else {
        this.onReceive(payload);
      }
    }
  }
}