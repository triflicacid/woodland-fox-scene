import {Event} from './Event';
import {Subscription} from './Subscription';

/**
 * a bus which is able to carry events and alert subscribers.
 */
export class EventBus {
    private readonly subscriptions = new Map<string, Subscription<any>[]>();
    private readonly special: Subscription<any>[] = [];

    registerEvent(eventName: string) {
        if (typeof eventName !== 'string') {
            throw new TypeError('eventName must be a string, got ' + typeof eventName);
        }
        this.subscriptions.set(eventName, []);
    }

    deregisterEvent(eventName: string) {
        this.subscriptions.delete(eventName);
    }

    subscribe(subscription: Subscription<any>) {
        if (subscription.eventName === Subscription.CAPTURE_ALL) {
            this.special.push(subscription);
            return;
        }
        if (!this.subscriptions.has(subscription.eventName)) {
            throw new Error(`unknown subscription event: ${subscription.eventName}`);
        }
        this.subscriptions.get(subscription.eventName)!.push(subscription);
    }

    unsubscribe(subscription: Subscription<any>) {
        if (subscription.eventName === Subscription.CAPTURE_ALL) {
            const i = this.special.indexOf(subscription);
            if (i !== -1) this.special.splice(i, 1);
            return;
        }
        if (!this.subscriptions.has(subscription.eventName)) return;

        const subs = this.subscriptions.get(subscription.eventName)!;
        if (subs.length === 1) {
            this.subscriptions.delete(subscription.eventName);
        } else {
            const i = subs.indexOf(subscription);
            if (i !== -1) subs.splice(i, 1);
        }
    }

    dispatch<T>(event: Event<T>) {
        if (!this.subscriptions.has(event.eventName)) {
            throw new Error(`unknown event: ${event.eventName}`);
        }
        const targets = [
            ...this.subscriptions.get(event.eventName)!,
            ...this.special,
        ];
        targets
            .filter(s => event.alertOriginator || s.subscriber !== event.originator)
            .forEach(s => s.trigger(event as Event<unknown>));
    }
}