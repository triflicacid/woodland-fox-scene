import {Component} from '@/core/Component';
import {Subscription} from '@/event/Subscription';
import {Event} from '@/event/Event';

/**
 * a component for debugging, we intercept all events
 */
export class EventListenerComponent extends Component {
    public static COMPONENT_NAME = 'EventListenerComponent';

    public override getName() {
        return EventListenerComponent.COMPONENT_NAME;
    }

    public override initialise() {
        this.eventBus.subscribe(new Subscription(Subscription.CAPTURE_ALL, this.getName(), (event: Event<any>) => {
            this.logEvent(event.eventName) && console.log(`${event.eventName} (${event.originator})`, event.payload);
        }, true));
    }

    /**
     * are we logging the given event?
     */
    public logEvent(event: string) {
        const f = (globalThis as any).printEvents as string[] | boolean;
        if (typeof f === 'object') return f.indexOf(event) !== -1;
        return f;
    }
}