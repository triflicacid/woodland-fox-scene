import {DrawComponent} from "@/core/DrawComponent";
import {clamp} from "@/utils";

/**
 * render the sun on clear days
 */
export class SunComponent extends DrawComponent {
  static COMPONENT_NAME = "SunComponent";

  getName() {
    return SunComponent.COMPONENT_NAME;
  }

  isEnabled() {
    const {weather, specialEvent, timeOfDay} = this.scene;
    return (timeOfDay === 'day' || timeOfDay === 'dawn') &&
        (specialEvent === 'eclipse' || weather !== 'fog' && weather !== 'rain' && weather !== 'storm');
  }

  draw() {
    const {ctx} = this;
    const {season, weather, frame, todBlend: td, specialEvent, timeOfDay} = this.scene;
    const sa = clamp((td - 0.2) / 0.6, 0, 1);

    const isDawn = timeOfDay === 'dawn';

    // dawn: sun sits low on the horizon, warm orange
    const sunX = isDawn ? 180 : (season === 'autumn' ? 120 : season === 'winter' ? 160 : 550);
    const sunY = isDawn ? this.H * 0.52 : (season === 'winter' ? 90 : 65);

    if (specialEvent === 'eclipse') {
      this._drawEclipse(sunX, sunY, frame, sa);
      return;
    }

    const sunCol = isDawn ? '#ff9944' : (season === 'autumn' ? '#f0a030' : season === 'winter' ? '#dde8f0' : '#fffad0');
    const glowCol = isDawn ? '#ff660088' : '#ffe87888';

    ctx.save();
    ctx.globalAlpha = isDawn ? 0.9 : sa;
    ctx.shadowBlur = isDawn ? 80 : 60;
    ctx.shadowColor = glowCol;
    ctx.fillStyle = sunCol;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = (isDawn ? 0.9 : sa) * 0.15;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 44, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    if (season === 'summer' && weather === 'clear' && !isDawn) {
      ctx.strokeStyle = 'rgba(255,250,180,0.08)';
      ctx.lineWidth = 18;
      ctx.globalAlpha = sa;
      for (let r = 0; r < 6; r++) {
        const a = r * Math.PI / 3 + frame * 0.003;
        ctx.beginPath();
        ctx.moveTo(sunX, sunY);
        ctx.lineTo(sunX + Math.cos(a) * 180, sunY + Math.sin(a) * 180);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  /**
   * draw the eclipsed sun - black disc with animated organic corona.
   * @param {number} x
   * @param {number} y
   * @param {number} frame
   * @param {number} sa - sun alpha based on tod blend
   */
  _drawEclipse(x, y, frame, sa) {
    const {ctx} = this;

    ctx.save();
    ctx.globalAlpha = sa;

    // outer diffuse glow
    const glow = ctx.createRadialGradient(x, y, 26, x, y, 26 * 4.5);
    glow.addColorStop(0, 'rgba(255,240,180,0.35)');
    glow.addColorStop(0.3, 'rgba(255,200,80,0.15)');
    glow.addColorStop(0.7, 'rgba(255,140,20,0.05)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, 26 * 4.5, 0, Math.PI * 2);
    ctx.fill();

    // plasma arcs
    const r = 26;
    for (let i = 0; i < 8; i++) {
      const baseAngle = (i / 8) * Math.PI * 2;
      const wobble = Math.sin(frame * 0.018 + i * 1.3) * 0.18;
      const angle = baseAngle + wobble;
      const len = r * (1.4 + 0.6 * Math.sin(frame * 0.025 + i * 0.9));
      const bulge = r * (0.5 + 0.3 * Math.cos(frame * 0.02 + i * 1.1));
      const cx1 = x + Math.cos(angle - 0.4) * (r + bulge);
      const cy1 = y + Math.sin(angle - 0.4) * (r + bulge);
      const cx2 = x + Math.cos(angle + 0.4) * (r + bulge);
      const cy2 = y + Math.sin(angle + 0.4) * (r + bulge);
      const ex = x + Math.cos(angle) * (r + len);
      const ey = y + Math.sin(angle) * (r + len);
      const alpha = sa * (0.4 + 0.3 * Math.sin(frame * 0.03 + i));

      ctx.save();
      ctx.strokeStyle = `rgba(255,220,100,${alpha})`;
      ctx.lineWidth = 1.2 + Math.sin(frame * 0.02 + i) * 0.5;
      ctx.lineCap = 'round';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#ffcc40';
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(angle - 0.3) * r, y + Math.sin(angle - 0.3) * r);
      ctx.bezierCurveTo(cx1, cy1, cx2, cy2, ex, ey);
      ctx.bezierCurveTo(cx2, cy2, cx1, cy1,
          x + Math.cos(angle + 0.3) * r, y + Math.sin(angle + 0.3) * r);
      ctx.stroke();
      ctx.restore();
    }

    // thin streamer rays
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2 + frame * 0.002;
      const rayLen = r * (2 + Math.sin(frame * 0.015 + i * 0.7) * 0.8);
      ctx.save();
      ctx.strokeStyle = `rgba(255,240,180,${sa * (0.15 + 0.1 * Math.sin(frame * 0.02 + i))})`;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
      ctx.lineTo(x + Math.cos(angle) * (r + rayLen), y + Math.sin(angle) * (r + rayLen));
      ctx.stroke();
      ctx.restore();
    }

    // black moon disc
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#050208';
    ctx.beginPath();
    ctx.arc(x, y, 24, 0, Math.PI * 2);
    ctx.fill();

    // chromosphere rim
    ctx.strokeStyle = 'rgba(255,60,20,0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, 24, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }
}
