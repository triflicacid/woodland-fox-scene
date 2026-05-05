import {Event} from './Event.js';
import {Subscription} from './Subscription.js';

/**
 * a bus which is able to carry events and alert subscribers.
 */
export class EventBus {
  constructor() {
    // hold subscriptions for each event
    /** @type{Map<string, Array<Subscription>>} */
    this._subscriptions = new Map();
    // hold all special subscriptions (ALL)
    /** @type{Array<Subscription>} */
    this._special = [];
  }

  /**
   * register a new event
   * @param {string} eventName
   */
  registerEvent(eventName) {
    if (typeof eventName !== 'string') {
      throw new TypeError('eventName must be a string, got ' + typeof eventName);
    }
    this._subscriptions.set(eventName, []);
  }

  /**
   * de-register the given event
   * @param {string} eventName
   */
  deregisterEvent(eventName) {
    this._subscriptions.delete(eventName);
  }

  /**
   * add a subscription for the given service
   * @param {Subscription} subscription
   */
  subscribe(subscription) {
    if (subscription.eventName === Subscription.CAPTURE_ALL) {
      this._special.push(subscription);
      return;
    }

    if (!this._subscriptions.has(subscription.eventName)) {
      throw new Error(`Unknown subscription event: ${subscription.eventName}`);
    }

    this._subscriptions.get(subscription.eventName).push(subscription);
  }

  /**
   * remove a subscription made via `::subscribe`
   * @param {Subscription} subscription
   */
  unsubscribe(subscription) {
    if (subscription.eventName === Subscription.CAPTURE_ALL) {
      let i = this._special.indexOf(subscription);
      if (i === -1) {
        this._special.splice(i, 1);
      }
      return;
    }
    if (!this._subscriptions.has(subscription.eventName)) {
      return;
    }

    const subs = this._subscriptions.get(subscription.eventName);
    if (subs.length === 1) {
      this._subscriptions.delete(subscription.eventName);
    } else {
      let i = subs.indexOf(subscription);
      if (i === -1) {
        subs.splice(i, 1);
      }
    }
  }

  /**
   * dispatch an event into the event bus
   * @param {Event} event
   */
  dispatch(event) {
    if (!this._subscriptions.has(event.eventName)) {
      throw new Error(`Unknown subscription event: ${event.eventName}`);
    }

    [
      ...this._subscriptions.get(event.eventName),
      ...this._special
    ]
        .filter(s => event.alertOriginator || s.subscriber !== event.originator)
        .forEach(s => s.trigger(event));
  }
}