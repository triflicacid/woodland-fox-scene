import {ColourStop, KeyframeStop} from '@/utils.ts';
import {Season} from '@/config.ts';

// t=0 night, t=0.25 twilight, t=0.75 dawn, t=1 day
export const SKY_TOP: ColourStop[] = [
    {t: 0.00, r: 10, g: 8, b: 24},
    {t: 0.20, r: 10, g: 8, b: 24},
    {t: 0.25, r: 26, g: 8, b: 40},
    {t: 0.50, r: 26, g: 16, b: 48},
    {t: 0.75, r: 26, g: 16, b: 48},
    {t: 0.88, r: 100, g: 60, b: 120},
    {t: 1.00, r: 168, g: 216, b: 248},
];

export const SKY_MID: ColourStop[] = [
    {t: 0.00, r: 20, g: 16, b: 50},
    {t: 0.20, r: 20, g: 16, b: 50},
    {t: 0.25, r: 40, g: 16, b: 60},
    {t: 0.50, r: 60, g: 24, b: 56},
    {t: 0.75, r: 90, g: 32, b: 64},
    {t: 0.88, r: 180, g: 100, b: 80},
    {t: 1.00, r: 216, g: 238, b: 255},
];

export const SKY_BOT: ColourStop[] = [
    {t: 0.00, r: 30, g: 40, b: 30},
    {t: 0.20, r: 30, g: 40, b: 30},
    {t: 0.25, r: 100, g: 40, b: 24},
    {t: 0.50, r: 140, g: 60, b: 30},
    {t: 0.75, r: 192, g: 80, b: 48},
    {t: 0.88, r: 220, g: 160, b: 80},
    {t: 1.00, r: 184, g: 232, b: 160},
];

export const GLOW_R: KeyframeStop[] = [
    {t: 0.00, v: 0},
    {t: 0.15, v: 0},
    {t: 0.25, v: 0.75},
    {t: 0.35, v: 0.15},
    {t: 0.50, v: 0.10},
    {t: 0.65, v: 0.15},
    {t: 0.75, v: 0.85},
    {t: 0.90, v: 0.1},
    {t: 1.00, v: 0},
];

export const GLOW_Y: KeyframeStop[] = [
    {t: 0.00, v: 0.72},
    {t: 0.25, v: 0.60},
    {t: 0.50, v: 0.55},
    {t: 0.75, v: 0.52},
    {t: 1.00, v: 0.72},
];

export const GLOW_COL: ColourStop[] = [
    {t: 0.00, r: 255, g: 90, b: 10},
    {t: 0.25, r: 240, g: 80, b: 120},
    {t: 0.35, r: 255, g: 120, b: 40},
    {t: 0.50, r: 255, g: 120, b: 40},
    {t: 0.65, r: 255, g: 110, b: 20},
    {t: 0.75, r: 255, g: 80, b: 20},
    {t: 0.90, r: 255, g: 200, b: 80},
    {t: 1.00, r: 255, g: 200, b: 80},
];

// sun colour keyed by tod blend value: 0=night, 0.25=twilight, 0.75=dawn, 1=day
export const SUN_COLS: ColourStop[] = [
    {t: 0.20, r: 200, g: 60, b: 20},
    {t: 0.25, r: 220, g: 80, b: 30},
    {t: 0.60, r: 255, g: 140, b: 40},
    {t: 0.75, r: 255, g: 160, b: 60},
    {t: 0.90, r: 255, g: 220, b: 140},
    {t: 1.00, r: 255, g: 250, b: 200},
];

// offset of transition during different seasons
export const SEASON_GLOW_OFFSET: Record<Season, number> = {
    summer: -0.05,
    spring: 0,
    autumn: 0.03,
    winter: 0.06,
};
