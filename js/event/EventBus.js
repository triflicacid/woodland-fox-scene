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
  }

  /**
   * register a new event
   * @param {string} eventName
   */
  registerEvent(eventName) {
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
   * receive an event
   * @param {Event} event
   */
  receive(event) {
    if (!this._subscriptions.has(event.eventName)) {
      throw new Error(`Unknown subscription event: ${event.eventName}`);
    }

    console.log("received event", event);
    this._subscriptions.get(event.eventName)
        .filter(s => s.eventName === s.eventName) // not needed, but eh
        .filter(s => event.alertOriginator || s.subscriber !== event.originator)
        .forEach(s => s.trigger(event.payload));
  }
}