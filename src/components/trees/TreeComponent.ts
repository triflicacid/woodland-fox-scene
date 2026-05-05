import {Component} from '@/core/Component';
import type {EventBus} from '@/event/EventBus';
import type {SceneState} from '@/core/SceneState';
import type {Season, SeasonPalette, SpecialEvent, Weather} from '@/config';
import {type TreeDef} from './treeDefinitions';

/**
 * compute the current wind-driven sway offset for a tree.
 */
function getWindSway(tr: TreeDef, weather: Weather, frame: number) {
    const windE = (weather === 'wind' || weather === 'storm')
        ? Math.sin(frame * 0.06 + tr.ph) * 10 : 0;
    return Math.sin(frame * tr.sway + tr.ph) * 5 + windE;
}

/**
 * return true if the tree should be drawn without foliage (winter, non-pine).
 */
function isBare(tr: TreeDef, season: Season, specialEvent: SpecialEvent) {
    if (specialEvent === 'halloween' && tr.type !== 'pine') return true;
    return season === 'winter' && tr.type !== 'pine';
}

/**
 * compute the trunk height for a tree based on its bare state.
 */
function getTrunkHeight(tr: TreeDef, bare: boolean) {
    return bare ? tr.h * 0.75 : tr.h * 0.18;
}

/**
 * compute the world-space position of a tree's canopy top.
 * used by birds to know where to perch.
 */
export function getTreeTopPos(tr: TreeDef, weather: Weather, season: Season, specialEvent: SpecialEvent, frame: number) {
    const sway = getWindSway(tr, weather, frame);
    const bare = isBare(tr, season, specialEvent);
    const trunkH = getTrunkHeight(tr, bare);
    const isPine = tr.type === 'pine';
    const topLayerLy = bare ? -trunkH : -(trunkH) - (tr.layers - 1) * (tr.h * (isPine ? 0.14 : 0.16));
    const tipOffsetX = sway * 0.7 * (1 + (tr.layers - 1) * 0.3) + Math.sin(sway * 0.008) * (-topLayerLy);
    return {x: tr.x + tipOffsetX, y: tr.y + topLayerLy - 8};
}

/**
 * draw a single tree onto the canvas.
 */
function drawTree(ctx: CanvasRenderingContext2D, tr: TreeDef, pal: SeasonPalette, season: Season, weather: Weather, specialEvent: SpecialEvent, frame: number) {
    const sway = getWindSway(tr, weather, frame);
    const bare = isBare(tr, season, specialEvent);
    const trunkH = getTrunkHeight(tr, bare);

    ctx.save();
    ctx.translate(tr.x, tr.y);
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
        drawBareBranches(ctx, tr, trunkH, season, specialEvent, isBirch);
    } else {
        drawLeafyCanopy(ctx, tr, trunkH, pal, season, specialEvent, sway);
    }

    if (specialEvent === 'christmas') {
        drawChristmasLights(ctx, tr, frame, sway, trunkH);
    }

    ctx.restore();
}

/**
 * draw twinkling christmas lights within the tree's local transform space.
 * must be called between the tree's ctx.save() and ctx.restore().
 */
function drawChristmasLights(ctx: CanvasRenderingContext2D, tr: TreeDef, frame: number, sway: number, trunkH: number) {
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
            const ls = sway * 0.7 * (1 + layer * 0.3);
            const lx = ls + Math.cos(angle) * lr * 0.7;
            const blink = 0.5 + 0.5 * Math.sin(frame * 0.08 + i * 1.7);
            ctx.save();
            ctx.globalAlpha = 0.7 + 0.3 * blink;
            ctx.shadowBlur = 6 + blink * 6;
            ctx.shadowColor = colors[i % colors.length]!;
            ctx.fillStyle = colors[i % colors.length]!;
            ctx.beginPath();
            ctx.arc(lx, ly, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    } else {
        // trafalgar-style: strings of lights hanging from the top of the trunk
        // outward at various angles, with lights dotted along each string
        const stringCount = 10;
        const topY = -trunkH;
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
                const col = colors[(s * lightsPerString + l) % colors.length]!;

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
 */
function drawBareBranches(ctx: CanvasRenderingContext2D, tr: TreeDef, trunkH: number, season: Season, specialEvent: SpecialEvent, isBirch: boolean) {
    const branchColor = specialEvent === 'halloween'
        ? '#0a0a0a' // spooky oooh
        : isBirch ? '#8a7858' : '#4a3a2a';
    ctx.lineCap = 'round';

    function drawBranch(bx: number, by: number, angle: number, len: number, width: number, depth: number) {
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
 */
function drawLeafyCanopy(ctx: CanvasRenderingContext2D, tr: TreeDef, trunkH: number, pal: SeasonPalette, season: Season, specialEvent: SpecialEvent, sway: number) {
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
 * renders trees either in the background or foreground pass.
 */
class TreesComponent extends Component {
    protected readonly ctx: CanvasRenderingContext2D;
    private readonly background: boolean;
    private trees: TreeDef[] = [];

    constructor(eventBus: EventBus, scene: SceneState, ctx: CanvasRenderingContext2D, background: boolean) {
        super(eventBus, scene);
        this.ctx = ctx;
        this.background = background;
    }

    override getName() {
        return 'TreesComponent';
    }

    override initialise() {
        this.trees = this.scene.trees.filter(t => t.background === this.background);
    }

    override draw() {
        const {ctx, trees} = this;
        const {season, weather, specialEvent, frame} = this.scene;
        const pal = this.scene.pal();
        trees.forEach(tr => drawTree(ctx, tr, pal, season, weather, specialEvent, frame));
    }
}

/**
 * renders trees that appear behind animals.
 */
export class BackgroundTreesComponent extends TreesComponent {
    static COMPONENT_NAME = 'BackgroundTreesComponent';

    constructor(eventBus: EventBus, scene: SceneState, ctx: CanvasRenderingContext2D) {
        super(eventBus, scene, ctx, false);
    }

    override getName() {
        return BackgroundTreesComponent.COMPONENT_NAME;
    }
}

/**
 * renders trees that appear in front of animals.
 */
export class ForegroundTreesComponent extends TreesComponent {
    static COMPONENT_NAME = 'ForegroundTreesComponent';

    constructor(eventBus: EventBus, scene: SceneState, ctx: CanvasRenderingContext2D) {
        super(eventBus, scene, ctx, true);
    }

    override getName() {
        return ForegroundTreesComponent.COMPONENT_NAME;
    }
}
