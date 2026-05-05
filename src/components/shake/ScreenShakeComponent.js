import {DrawComponent} from '@/core/DrawComponent';
import {Subscriptions} from "@/core/Subscriptions";

/**
 * applies a screen shake effect to the canvas transform.
 * must be registered before all other drawing components so
 * the translate applies to everything drawn after it.
 * call restore() equivalent via a paired component registered last.
 */
export class ScreenShakeComponent extends DrawComponent {
  shakeT = 0;
  shakeAmt = 0;
  active = false;
  didSave = false; // to prevent this: active=true, tick then sets active to false

  static COMPONENT_NAME = 'ScreenShakeComponent';

  getName() {
    return ScreenShakeComponent.COMPONENT_NAME;
  }

  initialise() {
    // shake on loud firework bangs
    this.eventBus.subscribe(Subscriptions.onFireworkBang(this.getName(), ({loud}) => {
      if (loud) this._trigger(loud ? 4 : 2, 8);
    }));
    // shake on super-bolt lightning
    this.eventBus.subscribe(Subscriptions.onLightningStrike(this.getName(), ({superBolt}) => {
      if (superBolt) this._trigger(3, 6);
    }));
    // shake on mothron dive
    this.eventBus.subscribe(Subscriptions.onMothronDive(this.getName(), () => {
      this._trigger(5, 12);
    }));
  }

  /**
   * trigger a screen shake.
   * @param {number} amt - max pixel displacement
   * @param {number} duration - frames
   */
  _trigger(amt, duration) {
    this.shakeAmt = amt;
    this.shakeT = duration;
    this.active = true;
  }

  isEnabled() {
    return this.active;
  }

  tick() {
    this.shakeT--;
    if (this.shakeT <= 0) {
      this.active = false;
    }
  }

  draw() {
    if (this.didSave) { // don't double-save... but this shouldn't happen, so panic
      console.error('draw() called twice without restore');
      return;
    }
    const {ctx} = this;
    const decay = this.shakeT / 12;
    const sx = (Math.random() - 0.5) * this.shakeAmt * decay;
    const sy = (Math.random() - 0.5) * this.shakeAmt * decay;
    ctx.save();
    ctx.translate(sx, sy);
    this.didSave = true;
  }
}
