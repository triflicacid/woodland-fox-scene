import type {Event} from './Event';

/**
 * a subscription to a given event
 */
export class Subscription<T> {
    /** captures any and all events */
    static readonly CAPTURE_ALL = '*ALL*';

    constructor(
        public readonly eventName: string,
        public readonly subscriber: string,
        private readonly onReceive: ((value: T) => void) | ((event: Event<T>) => void),
        private readonly detailed = false,
    ) {}

    trigger(event: Event<T>) {
        this.onReceive(this.detailed ? event as any : event.payload);
    }
}