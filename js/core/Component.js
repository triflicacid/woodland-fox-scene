/**
 * represents a component which may be registered to a scene.
 */
export class Component {
  /**
   * draw this component.
   * @param {SceneState} state
   */
  draw(state) {}

  /**
   * process a tick update for this component.
   * @param {SceneState} state
   * @param {function(string): void} setStatus - callback to update the status text
   * @param {function(): void} enableButtons - callback to re-enable UI buttons
   */
  tick(state, setStatus, enableButtons) {}

  /**
   * process a weather update.
   * @param {SceneState} state
   * @param {string} oldWeather Old weather value
   * @param {string} newWeather New weather value
   */
  onWeatherChange(state, oldWeather, newWeather) {}

  /**
   * process a season update.
   * @param {SceneState} state
   * @param {string} oldSeason Old season value
   * @param {string} newSeason New season value
   */
  onSeasonChange(state, oldSeason, newSeason) {}

  /**
   * process a time of day update.
   * @param {SceneState} state
   * @param {string} oldTOD Old time of day
   * @param {string} newTOD New time of day
   */
  onTODChange(state, oldTOD, newTOD) {}
}