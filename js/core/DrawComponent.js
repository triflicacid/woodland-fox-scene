import {Component} from "./Component.js";

/**
 * a Component used for drawing.
 * A component which will draw need not extend this, but this adds `ctx`, `W`, and `H` properties.
 * It is more so that this class _aids_ in drawing by providing a constructor, rather than is necessary.
 */
export class DrawComponent extends Component {
  /**
   * @param {EventBus} eventBus
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} W - canvas width
   * @param {number} H - canvas height
   */
  constructor(eventBus, ctx, W, H) {
    super(eventBus);
    this.ctx = ctx;
    this.W = W;
    this.H = H;
  }
}
