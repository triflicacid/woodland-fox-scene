import {DrawComponent} from "@/core/DrawComponent";
import {clamp, rgb, sample, sampleCol} from "@/utils";

// t=0 night, t=0.25 twilight, t=0.75 dawn, t=1 day
const SKY_TOP = [
  {t: 0.00, r: 10, g: 8, b: 24},  // night
  {t: 0.20, r: 10, g: 8, b: 24},  // night hold
  {t: 0.25, r: 26, g: 8, b: 40},  // twilight - deep indigo
  {t: 0.50, r: 26, g: 16, b: 48},  // mid transition
  {t: 0.75, r: 26, g: 16, b: 48},  // dawn - dark purple
  {t: 0.88, r: 100, g: 60, b: 120}, // dawn brightening
  {t: 1.00, r: 168, g: 216, b: 248}, // day (spring default)
];

const SKY_MID = [
  {t: 0.00, r: 20, g: 16, b: 50},
  {t: 0.20, r: 20, g: 16, b: 50},
  {t: 0.25, r: 40, g: 16, b: 60},  // twilight mid
  {t: 0.50, r: 60, g: 24, b: 56},
  {t: 0.75, r: 90, g: 32, b: 64},  // dawn mid - warm purple
  {t: 0.88, r: 180, g: 100, b: 80},  // warming
  {t: 1.00, r: 216, g: 238, b: 255}, // day
];

const SKY_BOT = [
  {t: 0.00, r: 30, g: 40, b: 30},  // night horizon
  {t: 0.20, r: 30, g: 40, b: 30},
  {t: 0.25, r: 100, g: 40, b: 24},  // twilight horizon - burnt orange
  {t: 0.50, r: 140, g: 60, b: 30},
  {t: 0.75, r: 192, g: 80, b: 48},  // dawn horizon - warm red-orange
  {t: 0.88, r: 220, g: 160, b: 80},  // golden
  {t: 1.00, r: 184, g: 232, b: 160}, // day (spring)
];

const GLOW_R = [
  {t: 0.00, v: 0},
  {t: 0.15, v: 0},
  {t: 0.25, v: 0.45},  // twilight glow peak
  {t: 0.50, v: 0.15},  // mid transition faint glow
  {t: 0.75, v: 0.55},  // dawn glow peak
  {t: 0.90, v: 0.1},
  {t: 1.00, v: 0},
];

const GLOW_Y = [
  {t: 0.00, v: 0.72},
  {t: 0.25, v: 0.60},  // twilight - glow sits mid-low
  {t: 0.50, v: 0.55},
  {t: 0.75, v: 0.52},  // dawn - glow sits just above treeline
  {t: 1.00, v: 0.72},
];

const GLOW_COL = [
  {t: 0.00, r: 255, g: 90, b: 10},
  {t: 0.25, r: 180, g: 60, b: 140}, // twilight - purple-pink
  {t: 0.50, r: 255, g: 120, b: 40},
  {t: 0.75, r: 255, g: 100, b: 30},  // dawn - warm orange
  {t: 1.00, r: 255, g: 200, b: 80},
];

// offset og transition during different seasons
const SEASON_GLOW_OFFSET = {summer: -0.05, spring: 0, autumn: 0.03, winter: 0.06};

export class SkyBackdropComponent extends DrawComponent {
  static COMPONENT_NAME = "SkyBackdropComponent";

  getName() {
    return SkyBackdropComponent.COMPONENT_NAME;
  }

  draw() {
    const {ctx, W, H} = this;
    const {weather, todBlend: td, specialEvent} = this.scene;

    const top = sampleCol(td, SKY_TOP);
    const mid = sampleCol(td, SKY_MID);
    const bot = sampleCol(td, SKY_BOT);

    const skyG = ctx.createLinearGradient(0, 0, 0, H * 0.7);
    skyG.addColorStop(0, rgb(top));
    skyG.addColorStop(0.5, rgb(mid));
    skyG.addColorStop(1, rgb(bot));
    ctx.fillStyle = skyG;
    ctx.fillRect(0, 0, W, H);

    // horizon glow band
    const glowR = sample(td, GLOW_R);
    if (glowR > 0.01 && weather !== 'storm' && weather !== 'rain') {
      const glowY = sample(td, GLOW_Y) + (SEASON_GLOW_OFFSET[this.scene.season] ?? 0);
      const glowCol = sampleCol(td, GLOW_COL);
      const hor = ctx.createLinearGradient(0, H * (glowY - 0.18), 0, H * (glowY + 0.1));
      hor.addColorStop(0, rgb(glowCol, 0));
      hor.addColorStop(0.4, rgb(glowCol, glowR));
      hor.addColorStop(1, rgb(glowCol, 0));
      ctx.fillStyle = hor;
      ctx.fillRect(0, H * (glowY - 0.18), W, H * 0.28);
    }

    // storm/rain overlay
    if (weather === 'storm' || weather === 'rain') {
      ctx.fillStyle = '#1a2030';
      ctx.globalAlpha = 0.85;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }

    // eclipse darkening
    if (specialEvent === 'eclipse') {
      const sa = clamp((td - 0.2) / 0.6, 0, 1);
      ctx.fillStyle = `rgba(10,4,20,${0.88 * sa})`;
      ctx.fillRect(0, 0, W, H);
    }
  }
}