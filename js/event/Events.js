import {Event} from "./event.js";
import {ValueChange} from "./ValueChange.js";
import {Subscription} from "./Subscription.js";

/**
 * utility for creating events used in this application
 */
export class Events {
  static EVENT_SEASON_CHANGE = "SeasonChange";
  static EVENT_WEATHER_CHANGE = "WeatherChange";

  /**
   * register all events we support onto the given bus
   * @param {EventBus} eventBus
   */
  static registerAll(eventBus) {
    eventBus.registerEvent(Events.EVENT_SEASON_CHANGE);
    eventBus.registerEvent(Events.EVENT_WEATHER_CHANGE);
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
}