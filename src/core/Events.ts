import {Event} from '@/event/Event';
import {ValueChange} from '@/event/ValueChange';
import type {EventBus} from '@/event/EventBus';
import type {SceneState} from './SceneState';
import type {Season, SpecialEvent, TimeOfDay} from '@/config';

/**
 * utility for creating events used in this application
 */
export class Events {
    public static readonly EVENT_SEASON_CHANGE = 'SeasonChange';
    public static readonly EVENT_WEATHER_CHANGE = 'WeatherChange';
    public static readonly EVENT_TOD_CHANGE = 'TODChange';
    public static readonly EVENT_MOON_PHASE_CHANGE = 'MoonPhaseChange';
    public static readonly EVENT_FIREWORK_BANG = 'FireworkBang';
    public static readonly EVENT_LIGHTNING_STRIKE = 'LightningStrike';
    public static readonly EVENT_CHARACTER_ACTION = 'CharacterAction';
    public static readonly EVENT_STATUS_TEXT = 'StatusText';
    public static readonly EVENT_SPECIAL_EVENT = 'SpecialEvent';
    public static readonly EVENT_MOTHRON_DIVE = 'MothronDive';
    // main buttons are the buttons not in a tab
    public static readonly EVENT_MAIN_BUTTONS = 'MainButtons';

    /**
     * register all events we support onto the given bus
     */
    public static registerAll(eventBus: EventBus) {
        eventBus.registerEvent(Events.EVENT_SEASON_CHANGE);
        eventBus.registerEvent(Events.EVENT_WEATHER_CHANGE);
        eventBus.registerEvent(Events.EVENT_TOD_CHANGE);
        eventBus.registerEvent(Events.EVENT_MOON_PHASE_CHANGE);
        eventBus.registerEvent(Events.EVENT_FIREWORK_BANG);
        eventBus.registerEvent(Events.EVENT_LIGHTNING_STRIKE);
        eventBus.registerEvent(Events.EVENT_CHARACTER_ACTION);
        eventBus.registerEvent(Events.EVENT_STATUS_TEXT);
        eventBus.registerEvent(Events.EVENT_SPECIAL_EVENT);
        eventBus.registerEvent(Events.EVENT_MOTHRON_DIVE);
        eventBus.registerEvent(Events.EVENT_MAIN_BUTTONS);
    }

    public static seasonChange(originator: string, oldSeason: Season, state: SceneState) {
        return new Event(Events.EVENT_SEASON_CHANGE, originator, new ValueChange(oldSeason, state.season, state));
    }

    public static weatherChange(originator: string, oldWeather: string, state: SceneState) {
        return new Event(Events.EVENT_WEATHER_CHANGE, originator, new ValueChange(oldWeather, state.weather, state));
    }

    public static todChange(originator: string, oldTimeOfDay: TimeOfDay, state: SceneState) {
        return new Event(Events.EVENT_TOD_CHANGE, originator, new ValueChange(oldTimeOfDay, state.timeOfDay, state));
    }

    public static moonPhaseChange(originator: string, oldMoonPhase: number, state: SceneState) {
        return new Event(Events.EVENT_MOON_PHASE_CHANGE, originator, new ValueChange(oldMoonPhase, state.moonPhase, state));
    }

    public static fireworkBang(originator: string, loud: boolean) {
        return new Event(Events.EVENT_FIREWORK_BANG, originator, {loud});
    }

    public static lightningStrike(originator: string, superBolt: boolean) {
        return new Event(Events.EVENT_LIGHTNING_STRIKE, originator, {superBolt});
    }

    public static specialEventChange(originator: string, oldSpecialEvent: SpecialEvent, state: SceneState) {
        return new Event(Events.EVENT_SPECIAL_EVENT, originator, new ValueChange(oldSpecialEvent, state.specialEvent, state));
    }

    public static characterAction(originator: string, character: string, action: string) {
        return new Event(Events.EVENT_CHARACTER_ACTION, originator, {character, action});
    }

    public static statusText(originator: string, text: string) {
        return new Event(Events.EVENT_STATUS_TEXT, originator, {text});
    }

    public static setMainButtons(originator: string, enabled: boolean) {
        return new Event(Events.EVENT_MAIN_BUTTONS, originator, {enabled});
    }

    public static mothronDive(originator: string) {
        return new Event(Events.EVENT_MOTHRON_DIVE, originator, {});
    }
}
