/**
 * describe an Event for an `EventBus` which can be subscribed to using a `Subscriber`.
 */
export class Event<T> {
    public constructor(
        public readonly eventName: string,
        public readonly originator: string,
        public readonly payload: T,
        public readonly alertOriginator = false,
    ) {}
}