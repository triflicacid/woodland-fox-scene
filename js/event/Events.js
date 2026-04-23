import {Event} from "./event";
import {ValueChange} from "./ValueChange";
import {Subscription} from "./Subscription";
import {SceneState} from "@/core/SceneState";

/**
 * utility for creating events used in this application
 */
export class Events {
  static EVENT_SEASON_CHANGE = "SeasonChange";
  static EVENT_WEATHER_CHANGE = "WeatherChange";
  static EVENT_TOD_CHANGE = "TODChange";
  static EVENT_MOON_PHASE_CHANGE = "MoonPhaseChange";
  static EVENT_FIREWORK_BANG = 'FireworkBang';
  static EVENT_LIGHTNING_STRIKE = 'LightningStrike';
  static EVENT_CHARACTER_ACTION = 'CharacterAction';

  /**
   * register all events we support onto the given bus
   * @param {EventBus} eventBus
   */
  static registerAll(eventBus) {
    eventBus.registerEvent(Events.EVENT_SEASON_CHANGE);
    eventBus.registerEvent(Events.EVENT_WEATHER_CHANGE);
    eventBus.registerEvent(Events.EVENT_TOD_CHANGE);
    eventBus.registerEvent(Events.EVENT_MOON_PHASE_CHANGE);
    eventBus.registerEvent(Events.EVENT_FIREWORK_BANG);
    eventBus.registerEvent(Events.EVENT_LIGHTNING_STRIKE);
    eventBus.registerEvent(Events.EVENT_CHARACTER_ACTION);
  }

  /**
   * create a new subscription to capture all events which mutate SceneState
   * if this captures any events which do not hold state, ignore.
   * @param {string} subscriber
   * @param {function(SceneState): void} onChange
   * @returns {Subscription<SceneState>}
   */
  static mutateSceneStateSubscription(subscriber, onChange) {
    // payload is a ValueChange
    return new Subscription(Subscription.CAPTURE_ALL, subscriber, update => update instanceof SceneState && onChange(update.state));
  }

  /**
   * create a new subscription to capture all events
   * if this captures any events which do not hold state, ignore.
   * @param {string} subscriber
   * @param {function(any): void} onChange
   * @returns {Subscription<any>}
   */
  static captureAllSubscription(subscriber, onChange) {
    // payload is a ValueChange
    return new Subscription(Subscription.CAPTURE_ALL, subscriber, onChange);
  }

  /**
   * create a season change event
   * @param {string} originator name of event originator
   * @param {string} oldSeason
   * @param {SceneState} state
   */
  static seasonChange(originator, oldSeason, state) {
    return new Event(Events.EVENT_SEASON_CHANGE, originator, new ValueChange(oldSeason, state.season, state));
  }

  /**
   * create a new subscription for a season change
   * @param {string} subscriber
   * @param {function(ValueChange<string>): void} onChange
   * @returns {Subscription<ValueChange<string>>}
   */
  static seasonChangeSubscription(subscriber, onChange) {
    return new Subscription(Events.EVENT_SEASON_CHANGE, subscriber, onChange);
  }

  /**
   * create a weather change event
   * @param {string} originator name of event originator
   * @param {string} oldWeather
   * @param {SceneState} state
   */
  static weatherChange(originator, oldWeather, state) {
    return new Event(Events.EVENT_WEATHER_CHANGE, originator, new ValueChange(oldWeather, state.weather, state));
  }

  /**
   * create a new subscription for weather change
   * @param {string} subscriber
   * @param {function(ValueChange<string>): void} onChange
   * @returns {Subscription<ValueChange<string>>}
   */
  static weatherChangeSubscription(subscriber, onChange) {
    return new Subscription(Events.EVENT_WEATHER_CHANGE, subscriber, onChange);
  }

  /**
   * create a time of day change event
   * @param {string} originator name of event originator
   * @param {string} oldTimeOfDay
   * @param {SceneState} state
   */
  static todChange(originator, oldTimeOfDay, state) {
    return new Event(Events.EVENT_TOD_CHANGE, originator, new ValueChange(oldTimeOfDay, state.timeOfDay, state));
  }

  /**
   * create a new subscription for a time of day change
   * @param {string} subscriber
   * @param {function(ValueChange<string>): void} onChange
   * @returns {Subscription<ValueChange<string>>}
   */
  static todChangeSubscription(subscriber, onChange) {
    return new Subscription(Events.EVENT_TOD_CHANGE, subscriber, onChange);
  }

  /**
   * create a moon phase change event
   * @param {string} originator name of event originator
   * @param {number} oldMoonPhase
   * @param {SceneState} state
   */
  static moonPhaseChange(originator, oldMoonPhase, state) {
    return new Event(Events.EVENT_MOON_PHASE_CHANGE, originator, new ValueChange(oldMoonPhase, state.moonPhase, state));
  }

  /**
   * create a new subscription for a moon phase change
   * @param {string} subscriber
   * @param {function(ValueChange<number>): void} onChange
   * @returns {Subscription<ValueChange<number>>}
   */
  static moonPhaseChangeSubscription(subscriber, onChange) {
    return new Subscription(Events.EVENT_MOON_PHASE_CHANGE, subscriber, onChange);
  }

  /**
   * create a firework bang event
   * @param {string} originator name of event originator
   * @param {boolean} loud was the firework loud?
   */
  static fireworkBang(originator, loud) {
    return new Event(Events.EVENT_FIREWORK_BANG, originator, { loud });
  }

  /**
   * create a new subscription for a firework bang event
   * @param {string} subscriber
   * @param {function({loud:boolean}): void} onChange taking whether the firework was loud or not
   * @returns {Subscription<{loud:boolean}>}
   */
  static fireworkBangSubscription(subscriber, onChange) {
    return new Subscription(Events.EVENT_FIREWORK_BANG, subscriber, onChange);
  }

  /**
   * create a lightning strike event
   * @param {string} originator name of event originator
   * @param {boolean} superBolt was the bolt a super bolt?
   */
  static lightningStrike(originator, superBolt) {
    return new Event(Events.EVENT_LIGHTNING_STRIKE, originator, { superBolt });
  }

  /**
   * create a new subscription for a lightning strike event
   * @param {string} subscriber
   * @param {function({superBolt:boolean}): void} onChange taking whether the bolt was a super bolt or not
   * @returns {Subscription<{superBolt:boolean}>}
   */
  static lightningStrikeSubscription(subscriber, onChange) {
    return new Subscription(Events.EVENT_LIGHTNING_STRIKE, subscriber, onChange);
  }

  /**
   * create a character action event
   * @param {string} originator name of event originator
   * @param {string} character name of the character performing the action
   * @param {string} action the action being performed e.g. 'enter', 'exit', 'sniff', 'nuzzle'
   * @returns {Event}
   */
  static characterAction(originator, character, action) {
    return new Event(Events.EVENT_CHARACTER_ACTION, originator, { character, action });
  }

  /**
   * create a new subscription for a character action event
   * @param {string} subscriber
   * @param {function({character: string, action: string}): void} onChange
   * @returns {Subscription}
   */
  static characterActionSubscription(subscriber, onChange) {
    return new Subscription(Events.EVENT_CHARACTER_ACTION, subscriber, onChange);
  }
}