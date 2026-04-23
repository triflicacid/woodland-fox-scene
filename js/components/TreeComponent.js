import {Component} from '@/core/Component.js';

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

/**
 * compute the current wind-driven sway offset for a tree.
 * @param {Object} tr - tree definition
 * @param {string} weather - current weather string
 * @param {number} frame - current frame count
 * @returns {number} sway amount in pixels
 */
function getWindSway(tr, weather, frame) {
  const windE = (weather === 'wind' || weather === 'storm')
      ? Math.sin(frame * 0.06 + tr.ph) * 10 : 0;
  return Math.sin(frame * tr.sway + tr.ph) * 5 + windE;
}

/**
 * return true if the tree should be drawn without foliage (winter, non-pine).
 * @param {Object} tr
 * @param {string} season
 * @param {string} specialEvent
 * @returns {boolean}
 */
function isBare(tr, season, specialEvent) {
  if (specialEvent === 'halloween' && tr.type !== 'pine') return true;
  return season === 'winter' && tr.type !== 'pine';
}

/**
 * compute the trunk height for a tree based on its bare state.
 * @param {Object} tr
 * @param {boolean} bare
 * @returns {number}
 */
function getTrunkHeight(tr, bare) {
  return bare ? tr.h * 0.75 : tr.h * 0.18;
}

/**
 * compute the world-space position of a tree's canopy top.
 * used by birds to know where to perch.
 * @param {Object} tr - tree definition
 * @param {string} weather
 * @param {string} season
 * @param {string} specialEvent
 * @param {number} frame
 * @param {number} H - canvas height
 * @returns {{x: number, y: number}}
 */
export function getTreeTopPos(tr, weather, season, specialEvent, frame, H) {
  const sway = getWindSway(tr, weather, frame);
  const bare = isBare(tr, season, specialEvent);
  const trunkH = getTrunkHeight(tr, bare);
  const isPine = tr.type === 'pine';
  const topLayerLy = -(trunkH) - (tr.layers - 1) * (tr.h * (isPine ? 0.14 : 0.16));
  const tipOffsetX = sway * 0.7 * (1 + (tr.layers - 1) * 0.3) + Math.sin(sway * 0.008) * (-topLayerLy);
  return {x: tr.x + tipOffsetX, y: H * 0.62 + topLayerLy - 8};
}

/**
 * draw a single tree onto the canvas.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} tr - tree definition
 * @param {Object} pal - current season palette
 * @param {string} season
 * @param {string} weather
 * @param {string} specialEvent
 * @param {number} frame
 * @param {number} H - canvas height
 */
function drawTree(ctx, tr, pal, season, weather, specialEvent, frame, H) {
  const sway = getWindSway(tr, weather, frame);
  const bare = isBare(tr, season, specialEvent);
  const trunkH = getTrunkHeight(tr, bare);

  ctx.save();
  ctx.translate(tr.x, H * 0.62);
  ctx.rotate(sway * 0.008);

  // trunk
  const isBirch = tr.type === 'birch';
  const trunkW = bare ? 7 : 5;
  const tg = ctx.createLinearGradient(-trunkW, 0, trunkW, 0);
  const tb = isBirch ? '#c8b89a' : bare ? '#7a6a5a' : '#2e1a08';
  const tdark = isBirch ? '#a89878' : bare ? '#5a4a3a' : '#1a0e05';
  tg.addColorStop(0, tdark);
  tg.addColorStop(0.4, tb);
  tg.addColorStop(0.6, tb);
  tg.addColorStop(1, tdark);
  ctx.fillStyle = tg;
  ctx.beginPath();
  ctx.moveTo(-trunkW, 0);
  ctx.lineTo(-trunkW * 0.5, -trunkH);
  ctx.lineTo(trunkW * 0.5, -trunkH);
  ctx.lineTo(trunkW, 0);
  ctx.closePath();
  ctx.fill();

  if (isBirch) {
    ctx.strokeStyle = 'rgba(60,40,20,0.35)';
    ctx.lineWidth = 1.5;
    for (let by = -4; by > -trunkH; by -= 18) {
      ctx.beginPath();
      ctx.moveTo(-trunkW * 0.7, by);
      ctx.lineTo(trunkW * 0.7, by + 3);
      ctx.stroke();
    }
  }

  if (bare) {
    _drawBareBranches(ctx, tr, trunkH, season, specialEvent, isBirch);
  } else {
    _drawLeafyCanopy(ctx, tr, trunkH, pal, season, specialEvent, sway);
  }

  if (specialEvent === 'christmas') {
    drawChristmasLights(ctx, tr, frame, sway, trunkH);
  }

  ctx.restore();
}

/**
 * draw twinkling christmas lights within the tree's local transform space.
 * must be called between the tree's ctx.save() and ctx.restore().
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} tr
 * @param {number} frame
 * @param {number} sway
 * @param {number} trunkH
 */
function drawChristmasLights(ctx, tr, frame, sway, trunkH) {
  if (!tr.xmasLights) return;

  const colors = ['#ff2020', '#20ff20', '#2060ff', '#ffdd00', '#ff60ff'];

  if (tr.type === 'pine') {
    // scattered lights through canopy layers
    const layers = tr.layers + 1;
    const count = Math.floor(tr.r * 0.5);
    for (let i = 0; i < count; i++) {
      const layer = i % layers;
      const angle = (i / count) * Math.PI * 2;
      const ly = -(trunkH) - layer * (tr.h * 0.14);
      const lr = tr.r * (1 - layer * 0.08);
      const extraSway = sway * 0.7;
      const ls = extraSway * (1 + layer * 0.3);
      const lx = ls + Math.cos(angle) * lr * 0.7;
      const blink = 0.5 + 0.5 * Math.sin(frame * 0.08 + i * 1.7);
      ctx.save();
      ctx.globalAlpha = 0.7 + 0.3 * blink;
      ctx.shadowBlur = 6 + blink * 6;
      ctx.shadowColor = colors[i % colors.length];
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.arc(lx, ly, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  } else {
    // trafalgar-style: strings of lights hanging from the top of the trunk
    // outward at various angles, with lights dotted along each string
    const stringCount = 10;
    const topY = -trunkH; // top of trunk in local space
    const extraSway = sway * 0.7;

    for (let s = 0; s < stringCount; s++) {
      // spread strings in a full circle around the trunk top
      const angle = (s / stringCount) * Math.PI * 2;
      // how far out the string reaches at ground level
      const reach = tr.r * 0.4 + extraSway * Math.cos(angle);
      const endX = Math.cos(angle) * reach;
      const endY = -tr.h * 0.08; // stop short of the ground
      const lightsPerString = 6;

      for (let l = 0; l < lightsPerString; l++) {
        const t = l / (lightsPerString - 1);
        const sag = Math.sin(t * Math.PI) * tr.r * 0.3;
        const lx = endX * t + Math.cos(angle) * sag;
        const ly = topY + (endY - topY) * t + sag * 0.4;
        const blink = 0.5 + 0.5 * Math.sin(frame * 0.08 + s * 1.3 + l * 2.1);
        const col = colors[(s * lightsPerString + l) % colors.length];

        ctx.save();
        ctx.globalAlpha = 0.75 + 0.25 * blink;
        ctx.shadowBlur = 5 + blink * 7;
        ctx.shadowColor = col;
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(lx, ly, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }
}

/**
 * draw the bare winter branch structure for a tree.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} tr
 * @param {number} trunkH
 * @param {string} season
 * @param {string} specialEvent
 * @param {boolean} isBirch
 */
function _drawBareBranches(ctx, tr, trunkH, season, specialEvent, isBirch) {
  const branchColor = specialEvent === 'halloween'
      ? '#0a0a0a' // spooky oooh
      : isBirch ? '#8a7858' : '#4a3a2a';
  ctx.lineCap = 'round';

  /**
   * recursively draw a branch and its children.
   * @param {number} bx
   * @param {number} by
   * @param {number} angle
   * @param {number} len
   * @param {number} width
   * @param {number} depth
   */
  function drawBranch(bx, by, angle, len, width, depth) {
    if (depth === 0 || len < 3) return;
    const ex = bx + Math.cos(angle) * len;
    const ey = by + Math.sin(angle) * len;
    ctx.strokeStyle = branchColor;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    // snow sits on upward-facing branches
    if (season === 'winter' && angle < -0.3 && width > 1.5) {
      ctx.fillStyle = 'rgba(225,238,252,0.75)';
      ctx.beginPath();
      ctx.ellipse(ex, ey, len * 0.25, Math.max(1, width * 0.4), angle + Math.PI * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    const spread = 0.45 + depth * 0.05;
    const lenMul = 0.65;
    drawBranch(ex, ey, angle - spread, len * lenMul, width * 0.6, depth - 1);
    drawBranch(ex, ey, angle + spread * 0.8, len * lenMul, width * 0.6, depth - 1);
    if (depth > 2) drawBranch(ex, ey, angle - spread * 0.2, len * lenMul * 0.8, width * 0.5, depth - 2);
  }

  const numMain = tr.type === 'oak' ? 4 : 3;
  for (let i = 0; i < numMain; i++) {
    const by = -trunkH * (0.45 + i * 0.14);
    const side = i % 2 === 0 ? 1 : -1;
    const angle = (side > 0 ? -Math.PI * 0.38 : -Math.PI * 0.62) + (i * 0.08);
    const len = tr.r * (0.7 + i * 0.05);
    drawBranch(0, by, angle, len, 3.5 - i * 0.3, 4);
  }
  for (let i = 0; i < 3; i++) {
    const angle = -Math.PI * 0.5 + (i - 1) * 0.38;
    drawBranch(0, -trunkH, angle, tr.r * 0.65, 2.5, 3);
  }
}

/**
 * draw the leafy canopy layers for a non-bare tree.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} tr
 * @param {number} trunkH
 * @param {Object} pal - season palette
 * @param {string} season
 * @param {string} specialEvent
 * @param {number} sway
 */
function _drawLeafyCanopy(ctx, tr, trunkH, pal, season, specialEvent, sway) {
  const layers = tr.type === 'pine' ? tr.layers + 1 : tr.layers;
  const extraSway = sway * 0.7;

  for (let l = 0; l < layers; l++) {
    const isPine = tr.type === 'pine';
    const ly = -(trunkH) - l * (tr.h * (isPine ? 0.14 : 0.16));
    const lr = tr.r * (1 - l * (isPine ? 0.08 : 0.10));
    const ls = extraSway * (1 + l * 0.3);
    const li = tr.dark ? pal.treeL + l * 3 : pal.treeL + l * 5;

    if (isPine) {
      ctx.fillStyle = `hsl(${pal.treeH},${pal.treeSat + 5}%,${li}%)`;
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.moveTo(ls, ly - lr * 1.1);
      ctx.lineTo(ls + lr * 0.95, ly + lr * 0.6);
      ctx.lineTo(ls - lr * 0.95, ly + lr * 0.6);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      if (season === 'winter' || specialEvent === 'christmas') {
        ctx.fillStyle = 'rgba(225,238,252,0.82)';
        ctx.beginPath();
        ctx.moveTo(ls, ly - lr * 0.75);
        ctx.lineTo(ls + lr * 0.6, ly + lr * 0.45);
        ctx.lineTo(ls - lr * 0.6, ly + lr * 0.45);
        ctx.closePath();
        ctx.fill();
      }
    } else {
      const g = ctx.createRadialGradient(ls * 0.3, ly - lr * 0.2, lr * 0.1, ls * 0.3, ly, lr);
      g.addColorStop(0, `hsl(${pal.treeH},${pal.treeSat}%,${li + 9}%)`);
      g.addColorStop(0.55, `hsl(${pal.treeH},${pal.treeSat - 2}%,${li}%)`);
      g.addColorStop(1, `hsl(${pal.treeH - 3},${pal.treeSat - 5}%,${li - 7}%)`);
      ctx.fillStyle = g;
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 7;
      ctx.beginPath();
      ctx.moveTo(ls, ly - lr);
      ctx.bezierCurveTo(ls + lr * 0.6, ly - lr * 0.25, ls + lr * 0.95, ly + lr * 0.55, ls, ly + lr * 0.42);
      ctx.bezierCurveTo(ls - lr * 0.95, ly + lr * 0.55, ls - lr * 0.6, ly - lr * 0.25, ls, ly - lr);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
}

/**
 * DrawTrees renders trees either in the background, foreground, or both.
 * Used to split the rendering into layers.
 */
class TreesComponent extends Component {
  /**
   * @param {EventBus} eventBus
   * @param {SceneState} scene
   * @param {CanvasRenderingContext2D} ctx
   * @param {boolean | undefined} background
   */
  constructor(eventBus, scene, ctx, background) {
    super(eventBus, scene);
    this.ctx = ctx;
    this.background = background;
    /** @type {Array<Object>} - tree data from config */
    this.trees = TREE_DEFS;
  }

  draw() {
    const {ctx, trees, background} = this;
    const {season, weather, specialEvent, frame, H} = this.scene;
    const pal = this.scene.pal();
    trees
        .filter(t => background === undefined || t.background === background)
        .forEach(tr => drawTree(ctx, tr, pal, season, weather, specialEvent, frame, H));
  }
}

/**
 * DrawBackgroundTrees renders trees that appear in the background.
 */
export class BackgroundTreesComponent extends TreesComponent {
  /**
   * @param {EventBus} eventBus
   * @param {SceneState} scene
   * @param {CanvasRenderingContext2D} ctx
   */
  constructor(eventBus, scene, ctx) {
    super(eventBus, scene, ctx, false);
  }
}

/**
 * DrawForegroundTrees renders trees that appear in the foreground.
 */
export class ForegroundTreesComponent extends TreesComponent {
  /**
   * @param {EventBus} eventBus
   * @param {SceneState} scene
   * @param {CanvasRenderingContext2D} ctx
   */
  constructor(eventBus, scene, ctx) {
    super(eventBus, scene, ctx, true);
  }
}
