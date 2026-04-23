import {Event} from "@/event/Event";
import {ValueChange} from "@/event/ValueChange";
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
  static EVENT_STATUS_TEXT = 'StatusText';
  /**
   * used for bunny/fox only
   * @deprecated
   */
  static EVENT_MAIN_BUTTONS = 'MainButtons';

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
    eventBus.registerEvent(Events.EVENT_STATUS_TEXT);
    eventBus.registerEvent(Events.EVENT_MAIN_BUTTONS);
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
   * create a weather change event
   * @param {string} originator name of event originator
   * @param {string} oldWeather
   * @param {SceneState} state
   */
  static weatherChange(originator, oldWeather, state) {
    return new Event(Events.EVENT_WEATHER_CHANGE, originator, new ValueChange(oldWeather, state.weather, state));
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
   * create a moon phase change event
   * @param {string} originator name of event originator
   * @param {number} oldMoonPhase
   * @param {SceneState} state
   */
  static moonPhaseChange(originator, oldMoonPhase, state) {
    return new Event(Events.EVENT_MOON_PHASE_CHANGE, originator, new ValueChange(oldMoonPhase, state.moonPhase, state));
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
   * create a lightning strike event
   * @param {string} originator name of event originator
   * @param {boolean} superBolt was the bolt a super bolt?
   */
  static lightningStrike(originator, superBolt) {
    return new Event(Events.EVENT_LIGHTNING_STRIKE, originator, { superBolt });
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
   * create a status text event
   * @param {string} originator name of event originator
   * @param {string} text the status text to display
   * @returns {Event}
   */
  static statusText(originator, text) {
    return new Event(Events.EVENT_STATUS_TEXT, originator, { text });
  }

  /**
   * create a buttons enabled event, fired when the main action buttons should be re-enabled
   * @param {string} originator name of event originator
   * @param {boolean} enabled whether to enable (or disable) the main buttons
   * @returns {Event}
   */
  static setMainButtons(originator, enabled) {
    return new Event(Events.EVENT_MAIN_BUTTONS, originator, {enabled});
  }
}