import {Event} from "./event.js";
import {ValueChange} from "./ValueChange.js";

/**
 * utility for creating events used in this application
 */
export class Events {
  static EVENT_SEASON_CHANGE = "SeasonChange";
  static EVENT_WEATHER_CHANGE = "WeatherChange";

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
   * create a weather change event
   * @param {string} originator name of event originator
   * @param {string} oldWeather
   * @param {SceneState} state
   */
  static weatherChange(originator, oldWeather, state) {
    return new Event(Events.EVENT_WEATHER_CHANGE, originator, new ValueChange(oldWeather, state.weather, state));
  }
}