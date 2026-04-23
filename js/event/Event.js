/**
 * describe an Event for an `EventBus` which can be subscribed to using a `Subscriber`.
 */
export class Event {
  /**
   * @template T
   * @param {string} eventName
   * @param {string} originator name of the originator
   * @param {T} payload event payload
   * @param {boolean | undefined} alertOriginator
   */
  constructor(eventName, originator, payload, alertOriginator=false) {
    this.eventName = eventName;
    this.originator = originator;
    this.payload = payload;
    this.alertOriginator = alertOriginator;
  }
}