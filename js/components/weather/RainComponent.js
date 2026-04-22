import {DrawComponent} from "@/core/DrawComponent";
import {rnd} from "@/utils";

/**
 * render rain droplets
 */
export class RainComponent extends DrawComponent {
  /** @type{Array<Object>} */
  raindrops;

  initialise(state) {
    this.raindrops = Array.from({length: 250}, () => this._makeRain());
  }

  /**
   * make a new raindrop
   */
  _makeRain() {
    return {
      x: rnd(this.W),
      y: rnd(this.H),
      len: 8 + rnd(14),
      speed: 12 + rnd(8)
    };
  }

  isEnabled(state) {
    const {weather} = state;
    return weather === 'rain' || weather === 'storm';
  }

  /**
   * get angle of the rain
   * @param {string} weather
   */
  _getRainAngle(weather) {
    return weather === 'storm' ? 0.15 : 0.06;
  }

  tick(state, setStatus, enableButtons) {
    const {W, H} = this;
    const angle = this._getRainAngle(state.weather);
    this.raindrops.forEach(r => {
      r.y += r.speed;
      r.x += r.speed * angle;
      if (r.y > H || r.x > W) Object.assign(r, this._makeRain());
    });
  }

  draw(state) {
    const {ctx} = this;
    const {weather} = state;
    const angle = this._getRainAngle(weather);
    ctx.strokeStyle = weather === 'storm' ? 'rgba(160,180,220,0.5)' : 'rgba(120,160,200,0.45)';
    ctx.lineWidth = weather === 'storm' ? 1.5 : 1;
    this.raindrops.forEach(r => {
      ctx.beginPath();
      ctx.moveTo(r.x, r.y);
      ctx.lineTo(r.x - r.len * angle, r.y - r.len);
      ctx.stroke();
    });
  }
}
