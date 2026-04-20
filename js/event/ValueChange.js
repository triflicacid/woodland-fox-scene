/**
 * a data class for a given value change in the scene
 */
export class ValueChange {
  /**
   * @template T
   * @param {T} previous
   * @param {T} updated
   * @param {SceneState} state
   */
  constructor(previous, updated, state) {
    this.previous = previous;
    this.updated = updated;
    this.state = state;
  }
}