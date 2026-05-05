import {ValueChange} from "@/event/ValueChange";
import {Subscription} from "@/event/Subscription";
import {SceneState} from "@/core/SceneState";
import {Events} from "@/core/Events";

/**
 * utility for creating subscriptions to application events (see `Events`)
 */
export class Subscriptions {
  /**
   * create a new subscription to capture all events which mutate SceneState
   * if this captures any events which do not hold state, ignore.
   * @param {string} subscriber
   * @param {function(SceneState): void} onChange
   * @returns {Subscription<SceneState>}
   */
  static onSceneStateMutation(subscriber, onChange) {
    // payload is a ValueChange
    return new Subscription(Subscription.CAPTURE_ALL, subscriber, update => update instanceof ValueChange && onChange(update.state));
  }

  /**
   * create a new subscription to capture all events
   * if this captures any events which do not hold state, ignore.
   * @param {string} subscriber
   * @param {function(any): void} onChange
   * @returns {Subscription<any>}
   */
  static captureAll(subscriber, onChange) {
    // payload is a ValueChange
    return new Subscription(Subscription.CAPTURE_ALL, subscriber, onChange);
  }

  /**
   * create a new subscription for a season change
   * @param {string} subscriber
   * @param {function(ValueChange<string>): void} onChange
   * @returns {Subscription<ValueChange<string>>}
   */
  static onSeasonChange(subscriber, onChange) {
    return new Subscription(Events.EVENT_SEASON_CHANGE, subscriber, onChange);
  }

  /**
   * create a new subscription for weather change
   * @param {string} subscriber
   * @param {function(ValueChange<string>): void} onChange
   * @returns {Subscription<ValueChange<string>>}
   */
  static onWeatherChange(subscriber, onChange) {
    return new Subscription(Events.EVENT_WEATHER_CHANGE, subscriber, onChange);
  }

  /**
   * create a new subscription for a time of day change
   * @param {string} subscriber
   * @param {function(ValueChange<string>): void} onChange
   * @returns {Subscription<ValueChange<string>>}
   */
  static onTODChange(subscriber, onChange) {
    return new Subscription(Events.EVENT_TOD_CHANGE, subscriber, onChange);
  }

  /**
   * create a new subscription for a moon phase change
   * @param {string} subscriber
   * @param {function(ValueChange<number>): void} onChange
   * @returns {Subscription<ValueChange<number>>}
   */
  static onMoonPhaseChange(subscriber, onChange) {
    return new Subscription(Events.EVENT_MOON_PHASE_CHANGE, subscriber, onChange);
  }

  /**
   * create a new subscription for a special event change
   * @param {string} subscriber
   * @param {function(ValueChange<string | null>): void} onChange
   * @returns {Subscription<ValueChange<string | null>>}
   */
  static onSpecialEventChange(subscriber, onChange) {
    return new Subscription(Events.EVENT_SPECIAL_EVENT, subscriber, onChange);
  }

  /**
   * create a new subscription for a firework bang event
   * @param {string} subscriber
   * @param {function({loud:boolean}): void} onChange taking whether the firework was loud or not
   * @returns {Subscription<{loud:boolean}>}
   */
  static onFireworkBang(subscriber, onChange) {
    return new Subscription(Events.EVENT_FIREWORK_BANG, subscriber, onChange);
  }

  /**
   * create a new subscription for a lightning strike event
   * @param {string} subscriber
   * @param {function({superBolt:boolean}): void} onChange taking whether the bolt was a super bolt or not
   * @returns {Subscription<{superBolt:boolean}>}
   */
  static onLightningStrike(subscriber, onChange) {
    return new Subscription(Events.EVENT_LIGHTNING_STRIKE, subscriber, onChange);
  }

  /**
   * create a new subscription for a character action event
   * @param {string} subscriber
   * @param {function({character: string, action: string}): void} onChange
   * @returns {Subscription}
   */
  static onCharacterAction(subscriber, onChange) {
    return new Subscription(Events.EVENT_CHARACTER_ACTION, subscriber, onChange);
  }

  /**
   * create a new subscription for a status text event
   * @param {string} subscriber
   * @param {function({text: string}): void} onChange
   * @returns {Subscription}
   */
  static onStatusTextChange(subscriber, onChange) {
    return new Subscription(Events.EVENT_STATUS_TEXT, subscriber, onChange);
  }

  /**
   * create a subscription for mothron dive events
   * @param {string} subscriber
   * @param {function(): void} onChange
   * @returns {Subscription}
   */
  static onMothronDive(subscriber, onChange) {
    return new Subscription(Events.EVENT_MOTHRON_DIVE, subscriber, onChange);
  }

  /**
   * create a new subscription for a main buttons enable/disable event
   * @param {string} subscriber
   * @param {function({enabled:boolean}): void} onChange
   * @returns {Subscription}
   */
  static onMainButtonsStateChange(subscriber, onChange) {
    return new Subscription(Events.EVENT_MAIN_BUTTONS, subscriber, onChange);
  }
}