import {Subscription} from '@/event/Subscription';
import {ValueChange} from '@/event/ValueChange';
import {Events} from './Events';
import type {SceneState} from './SceneState';
import type {Season, SpecialEvent, TimeOfDay} from '@/config';

/**
 * utility for creating subscriptions to application events (see `Events`)
 */
export class Subscriptions {
    /**
     * create a new subscription to capture all events which mutate SceneState
     * if this captures any events which do not hold state, ignore.
     */
    static onSceneStateMutation(subscriber: string, onChange: (state: SceneState) => void) {
        return new Subscription(Subscription.CAPTURE_ALL, subscriber, (update: unknown) => {
            if (update instanceof ValueChange) onChange(update.state);
        });
    }

    /**
     * create a new subscription to capture all events
     */
    static captureAll(subscriber: string, onChange: (payload: unknown) => void) {
        return new Subscription(Subscription.CAPTURE_ALL, subscriber, onChange);
    }

    static onSeasonChange(subscriber: string, onChange: (change: ValueChange<Season>) => void) {
        return new Subscription(Events.EVENT_SEASON_CHANGE, subscriber, onChange);
    }

    static onWeatherChange(subscriber: string, onChange: (change: ValueChange<string>) => void) {
        return new Subscription(Events.EVENT_WEATHER_CHANGE, subscriber, onChange);
    }

    static onTODChange(subscriber: string, onChange: (change: ValueChange<TimeOfDay>) => void) {
        return new Subscription(Events.EVENT_TOD_CHANGE, subscriber, onChange);
    }

    static onMoonPhaseChange(subscriber: string, onChange: (change: ValueChange<number>) => void) {
        return new Subscription(Events.EVENT_MOON_PHASE_CHANGE, subscriber, onChange);
    }

    static onSpecialEventChange(subscriber: string, onChange: (change: ValueChange<SpecialEvent>) => void) {
        return new Subscription(Events.EVENT_SPECIAL_EVENT, subscriber, onChange);
    }

    static onFireworkBang(subscriber: string, onChange: (payload: { loud: boolean }) => void) {
        return new Subscription(Events.EVENT_FIREWORK_BANG, subscriber, onChange);
    }

    static onLightningStrike(subscriber: string, onChange: (payload: { superBolt: boolean }) => void) {
        return new Subscription(Events.EVENT_LIGHTNING_STRIKE, subscriber, onChange);
    }

    static onCharacterAction(subscriber: string, onChange: (payload: { character: string; action: string }) => void) {
        return new Subscription(Events.EVENT_CHARACTER_ACTION, subscriber, onChange);
    }

    static onStatusTextChange(subscriber: string, onChange: (payload: { text: string }) => void) {
        return new Subscription(Events.EVENT_STATUS_TEXT, subscriber, onChange);
    }

    static onMothronDive(subscriber: string, onChange: () => void) {
        return new Subscription(Events.EVENT_MOTHRON_DIVE, subscriber, onChange);
    }

    static onMainButtonsStateChange(subscriber: string, onChange: (payload: { enabled: boolean }) => void) {
        return new Subscription(Events.EVENT_MAIN_BUTTONS, subscriber, onChange);
    }
}
