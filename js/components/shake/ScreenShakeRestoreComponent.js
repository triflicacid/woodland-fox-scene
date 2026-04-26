import {DrawComponent} from '@/core/DrawComponent';
import {ScreenShakeComponent} from "@/components/shake/ScreenShakeComponent";

/**
 * paired with ScreenShakeComponent - restores the canvas transform.
 * must be registered LAST in the component list.
 */
export class ScreenShakeRestoreComponent extends DrawComponent {
  /**
   * @param {EventBus} eventBus
   * @param {SceneState} scene
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} W - canvas width
   * @param {number} H - canvas height
   * @param {ScreenShakeComponent} shake
   */
  constructor(eventBus, scene, ctx, W, H, shake) {
    super(eventBus, scene, ctx, W, H);
    this._shake = shake;
  }

  static COMPONENT_NAME = 'ScreenShakeRestoreComponent';

  getName() {
    return ScreenShakeRestoreComponent.COMPONENT_NAME;
  }

  isEnabled() {
    return this._shake._didSave;
  }

  draw() {
    this.ctx.restore();
    this._shake._didSave = false;
  }
}
