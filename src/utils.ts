/**
 * linearly interpolate between a and b by t.
 */
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * clamp v to the range [lo, hi].
 */
export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/**
 * ease-in-out quadratic easing.
 */
export const eio = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

/**
 * ease-out cubic easing.
 */
export const eo = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * return a random float in [0, n).
 */
export const rnd = (n: number) => Math.random() * n;

/**
 * return a random float in [-n, n).
 */
export const rndf = (n: number) => (Math.random() - 0.5) * n * 2;

/**
 * return true with probability n.
 */
export const prob = (n: number) => Math.random() < n;

/**
 * return a random item from the given array
 */
export function rndchoice<T>(array: T[]): T | undefined {
    if (array.length === 0) return undefined;
    if (array.length === 1) return array[0];
    return array[Math.floor(rnd(array.length))];
}

/**
 * build a radial gradient on a given canvas context.
 */
export function rg(ctx: CanvasRenderingContext2D, x: number, y: number, r1: number, r2: number, ...stops: [number, string][]) {
    const g = ctx.createRadialGradient(x, y, r1, x, y, r2);
    stops.forEach(([t, c]) => g.addColorStop(t, c));
    return g;
}

/**
 * build a linear gradient on a given canvas context.
 */
export function lg(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, ...stops: [number, string][]) {
    const g = ctx.createLinearGradient(x1, y1, x2, y2);
    stops.forEach(([t, c]) => g.addColorStop(t, c));
    return g;
}

/**
 * fill a path (described by a callback) with the given fill style.
 */
export function blob(ctx: CanvasRenderingContext2D, path: () => void, fill: string | CanvasGradient) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    path();
    ctx.fill();
}

/**
 * throw if the given argument is undefined or null
 */
export function requireNonNull<T>(x: T | null | undefined): T {
    if (x === undefined || x === null) {
        throw new TypeError('requireNonNull: must not be null.');
    }
    return x;
}

/**
 * show/hide the given element.
 * this sets the element's `style.display` properties, so do not use if you're
 * precious about that.
 */
export function hideElement(el: HTMLElement, hide: boolean) {
    el.style.display = hide ? 'none' : 'block';
}

/**
 * darken or lighten a hex colour by an amount.
 */
export function shadeHex(hex: string, amt: number) {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.min(255, Math.max(0, (n >> 16) + amt));
    const g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + amt));
    const b = Math.min(255, Math.max(0, (n & 0xff) + amt));
    return `rgb(${r},${g},${b})`;
}

export interface KeyframeStop {
    t: number;
    v: number;
}

/**
 * samples a value from a set of keyframe stops at position t (0-1)
 */
export function sample(t: number, stops: KeyframeStop[]) {
    for (let i = 0; i < stops.length - 1; i++) {
        const a = stops[i]!;
        const b = stops[i + 1]!;
        if (t >= a.t && t <= b.t) {
            const p = (t - a.t) / (b.t - a.t);
            return a.v + (b.v - a.v) * p;
        }
    }
    return stops[stops.length - 1]!.v;
}

export interface ColourStop {
    t: number;
    r: number;
    g: number;
    b: number;
}

export type RGB = [number, number, number];

/**
 * samples an rgb colour from keyframe stops at position t.
 */
export function sampleCol(t: number, stops: ColourStop[]): RGB | undefined {
    if (stops.length === 0) return undefined;
    if (t <= stops[0]!.t) {
        const l = stops[0]!;
        return [l.r, l.g, l.b];
    }
    for (let i = 0; i < stops.length - 1; i++) {
        const a = stops[i]!;
        const b = stops[i + 1]!;
        if (t >= a.t && t <= b.t) {
            const p = (t - a.t) / (b.t - a.t);
            return [
                Math.round(a.r + (b.r - a.r) * p),
                Math.round(a.g + (b.g - a.g) * p),
                Math.round(a.b + (b.b - a.b) * p),
            ];
        }
    }
    const l = stops[stops.length - 1]!;
    return [l.r, l.g, l.b];
}

/**
 * builds an rgb colour string with the given components
 */
export function rgb([r, g, b]: RGB, a = 1) {
    return a < 1 ? `rgba(${r},${g},${b},${a})` : `rgb(${r},${g},${b})`;
}
