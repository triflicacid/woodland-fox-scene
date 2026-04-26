import {DrawComponent} from '@/core/DrawComponent';
import {clamp} from '@/utils';

const PLANETS = [
  {name: 'Mercury', x: 310, y: 48, r: 2.5, col: '#b8b0a8', glow: '#a0988e', glowR: 7},
  {name: 'Venus', x: 85, y: 42, r: 5, col: '#fffff0', glow: '#ffffcc', glowR: 14},
  {name: 'Mars', x: 390, y: 68, r: 3.5, col: '#ff5533', glow: '#ff3311', glowR: 10},
  {
    name: 'Jupiter', x: 520, y: 90, r: 7, col: '#e8c89a', glow: '#d4a870', glowR: 16,
    bands: ['#c8a878', '#e8d0a8', '#b89060', '#ddc090']
  },
  {
    name: 'Saturn', x: 180, y: 55, r: 5.5, col: '#e8dca0', glow: '#d4c880', glowR: 12,
    rings: true
  },
];

/**
 * draws visible planets in the night sky.
 * venus has a bright glow, mars is red-orange, jupiter is banded,
 * saturn has rings. all dim slightly under a bright moon.
 */
export class PlanetsComponent extends DrawComponent {
  static COMPONENT_NAME = 'PlanetsComponent';

  getName() {
    return PlanetsComponent.COMPONENT_NAME;
  }

  isEnabled() {
    const {stargazing, weather, timeOfDay} = this.scene;
    return stargazing && timeOfDay === 'night'
        && (weather === 'clear' || weather === 'wind');
  }

  draw() {
    const {ctx} = this;
    const {moonPhase} = this.scene;
    const nightAlpha = clamp(1 - this.scene.todBlend * 2.5, 0, 1);
    const moonDim = 0.15 + (Math.abs(moonPhase - 4) / 4) * 0.85;
    const baseAlpha = nightAlpha * moonDim;

    PLANETS.forEach(p => {
      ctx.save();
      ctx.globalAlpha = baseAlpha;

      // outer glow
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.glowR);
      glow.addColorStop(0, `${p.glow}cc`);
      glow.addColorStop(0.4, `${p.glow}44`);
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.glowR, 0, Math.PI * 2);
      ctx.fill();

      if (p.rings) {
        // saturn rings behind planet
        ctx.save();
        ctx.globalAlpha = baseAlpha * 0.8;
        const rg = ctx.createLinearGradient(p.x - p.r * 2.8, p.y, p.x + p.r * 2.8, p.y);
        rg.addColorStop(0, 'rgba(0,0,0,0)');
        rg.addColorStop(0.2, 'rgba(210,195,140,0.6)');
        rg.addColorStop(0.4, 'rgba(235,220,160,0.8)');
        rg.addColorStop(0.6, 'rgba(235,220,160,0.8)');
        rg.addColorStop(0.8, 'rgba(210,195,140,0.6)');
        rg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y + 2, p.r * 2.8, p.r * 0.6, 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // planet disc
      if (p.bands) {
        // jupiter - banded
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = p.col;
        ctx.fillRect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
        // horizontal bands
        p.bands.forEach((col, i) => {
          const by = p.y - p.r + (i / p.bands.length) * p.r * 2;
          ctx.fillStyle = col;
          ctx.fillRect(p.x - p.r, by, p.r * 2, p.r * 2 / p.bands.length);
        });
        ctx.restore();
      } else {
        ctx.fillStyle = p.col;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (p.rings) {
        // saturn rings in front of planet (lower half)
        ctx.save();
        ctx.globalAlpha = baseAlpha * 0.8;
        ctx.beginPath();
        ctx.rect(p.x - p.r * 3, p.y, p.r * 6, p.r * 2);
        ctx.clip();
        const rg2 = ctx.createLinearGradient(p.x - p.r * 2.8, p.y, p.x + p.r * 2.8, p.y);
        rg2.addColorStop(0, 'rgba(0,0,0,0)');
        rg2.addColorStop(0.2, 'rgba(210,195,140,0.6)');
        rg2.addColorStop(0.5, 'rgba(235,220,160,0.8)');
        rg2.addColorStop(0.8, 'rgba(210,195,140,0.6)');
        rg2.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = rg2;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y + 2, p.r * 2.8, p.r * 0.6, 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // highlight
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.beginPath();
      ctx.arc(p.x - p.r * 0.3, p.y - p.r * 0.3, p.r * 0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }
}
