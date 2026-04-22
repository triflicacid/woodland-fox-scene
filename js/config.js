export const CANVAS = {
  WIDTH: 720,
  HEIGHT: 500,
};

/**
 * fox appearance and position config.
 */
export const FOX = {
  /** default x position on canvas */
  X: 350,
  /** y position (fraction of canvas height) */
  Y_FRACTION: 0.64,
  /** fox curled body half-width for click detection */
  CLICK_RADIUS_X: 46,
  /** fox curled body half-height for click detection */
  CLICK_RADIUS_Y: 32,
};

/**
 * phase durations in frames.
 */
export const FOX_PHASES = {
  standup: {f: 80},
  stretch: {f: 80},
  shake: {f: 90},
  spin: {f: 110},
  curling: {f: 80},
  bunny_standup: {f: 70},
  bunny_curling: {f: 85},
  wander_out: {f: 120},
  wander_sniff: {f: 80},
  wander_in: {f: 120},
};

/**
 * random event probability thresholds (per frame).
 * @type {Object<string, number>}
 */
export const PROBABILITY = {
  LIGHTNING: 0.03,
  SUPER_BOLT: 0.15, // super-bolt once lightning has spawned
  FOX_YAWN: 0.0008,
  EAR_TWITCH: 0.002,
  HEDGEHOG: 0.004,
  DEER: 0.008,
  OWL_BLINK: 0.15,
  COMET: 0.0002,
};

/**
 * colour palettes, one per season.
 * each palette defines sky gradients, ground gradients, and foliage hsl params.
 * @type {Object<string, Object>}
 */
export const PALETTES = {
  spring: {
    sky0: '#1a2840', sky1: '#2a4060', sky2: '#3a6040',
    daySky0: '#a8d8f8', daySky1: '#d8eeff', daySky2: '#b8e8a0',
    gnd0: '#2a4a18', gnd1: '#203c10', gnd2: '#121e08',
    treeH: 115, treeSat: 50, treeL: 20,
    fH: 115, fSat: 55, fL: 22,
    gH: 115, gSat: 50, gL: 25,
  },
  summer: {
    sky0: '#0a1120', sky1: '#162235', sky2: '#1e3d22',
    daySky0: '#7abce8', daySky1: '#c0e0ff', daySky2: '#90c870',
    gnd0: '#1a3a12', gnd1: '#162e0f', gnd2: '#0a1a08',
    treeH: 122, treeSat: 40, treeL: 18,
    fH: 122, fSat: 42, fL: 18,
    gH: 120, gSat: 45, gL: 22,
  },
  autumn: {
    sky0: '#1a1010', sky1: '#2a1a18', sky2: '#3a2010',
    daySky0: '#d8a868', daySky1: '#f0c888', daySky2: '#c87840',
    gnd0: '#3a2808', gnd1: '#2e1e06', gnd2: '#1a1004',
    treeH: 25, treeSat: 65, treeL: 25,
    fH: 28, fSat: 70, fL: 28,
    gH: 35, gSat: 40, gL: 22,
  },
  winter: {
    sky0: '#08101a', sky1: '#101828', sky2: '#182030',
    daySky0: '#b8c8d8', daySky1: '#dce8f0', daySky2: '#a8b8c8',
    gnd0: '#d8e4ec', gnd1: '#c0d0dc', gnd2: '#a8b8c8',
    treeH: 210, treeSat: 10, treeL: 55,
    fH: 210, fSat: 15, fL: 60,
    gH: 210, gSat: 15, gL: 70,
  },
};

/**
 * tree definitions. each tree has position, size, sway params, and type.
 * background:true means the tree is rendered in the foreground pass (in front of animals).
 * @type {Array<Object>}
 */
export const TREE_DEFS = [
  {x: 25, h: 140, r: 32, sway: 0.016, ph: 1.7, layers: 2, dark: true, type: 'pine', background: true, xmasLights: true},
  {x: 50, h: 220, r: 50, sway: 0.012, ph: 0.0, layers: 3, dark: false, type: 'oak', background: false, xmasLights: false},
  {x: 100, h: 270, r: 58, sway: 0.008, ph: 3.1, layers: 4, dark: false, type: 'oak', background: false, xmasLights: true},
  {x: 148, h: 170, r: 40, sway: 0.009, ph: 1.1, layers: 3, dark: true, type: 'birch', background: true, xmasLights: false},
  {x: 200, h: 130, r: 28, sway: 0.014, ph: 0.8, layers: 2, dark: true, type: 'birch', background: true, xmasLights: false},
  {x: 260, h: 100, r: 22, sway: 0.018, ph: 1.4, layers: 2, dark: true, type: 'pine', background: true, xmasLights: true},
  {x: 440, h: 110, r: 24, sway: 0.016, ph: 3.5, layers: 2, dark: false, type: 'pine', background: true, xmasLights: true},
  {x: 480, h: 120, r: 26, sway: 0.011, ph: 2.5, layers: 2, dark: false, type: 'birch', background: true, xmasLights: false},
  {x: 555, h: 230, r: 52, sway: 0.011, ph: 0.7, layers: 3, dark: false, type: 'oak', background: false, xmasLights: true},
  {x: 598, h: 260, r: 54, sway: 0.010, ph: 2.0, layers: 4, dark: true, type: 'oak', background: false, xmasLights: false},
  {x: 625, h: 180, r: 44, sway: 0.013, ph: 2.3, layers: 3, dark: true, type: 'birch', background: true, xmasLights: false},
  {x: 678, h: 150, r: 34, sway: 0.014, ph: 0.5, layers: 2, dark: false, type: 'pine', background: true, xmasLights: true},
];

