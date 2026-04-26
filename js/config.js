export const CANVAS = {
  WIDTH: 720,
  HEIGHT: 500,
};

/**
 * random event probability thresholds (per frame).
 * @type {Object<string, number>}
 */
export const PROBABILITY = {
  LIGHTNING: 0.03,
  SUPER_BOLT: 0.15, // super-bolt once lightning has spawned
  SUPER_BOLT_REACTION: 0.5, // react to super-bolt
  FOX_YAWN: 0.0008,
  EAR_TWITCH: 0.002, // random ear twitch (not related to twitches due to events)
  STARTLE_TRIGGERS_EYE: 0.4, // open/close eye when startled?
  FOX_BLINK: 0.005, // when awake, probability to blink
  HEDGEHOG: 0.0004,
  DEER: 0.0012,
  OWL_BLINK: 0.15,
  COMET: 0.0002,
  FIREWORK_LAUNCH: 0.025,
  LOUD_FIREWORK: 0.3,
  FIREWORK_BANG_REACTION: 0.6, // react to a loud firework
  GUY_FAWKES: 0.0003,
  FOX_SPAWN_NOTE: 0.13,
  BUNNY_SPAWN_NOTE: 0.04,
  DEER_SPAWN_NOTE: 0.03,
  HEDGEHOG_SPAWN_NOTE: 0.04,
  ECLIPSE: {
    MOTHRON_SPAWN: 0.0004,
    MOTHRON_DIVE: 0.6,
    MONSTER_SPAWN: 0.04,
  }
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
 * phases of the moon.
 * internally we use numbers, but emojis here makes it more obvious what they mean.
 * @type {string[]}
 */
export const MOON_PHASES = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];

export const ECLIPSE = {
  SKY_COL: '#1a0a2a',
  CORONA_COL: '#fff8e0',
};