/**
 * linearly interpolate between a and b by t.
 * @param {number} a - start value
 * @param {number} b - end value
 * @param {number} t - blend factor [0, 1]
 * @returns {number}
 */
export const lerp = (a, b, t) => a + (b - a) * t;

/**
 * clamp v to the range [lo, hi].
 * @param {number} v
 * @param {number} lo
 * @param {number} hi
 * @returns {number}
 */
export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/**
 * ease-in-out quadratic easing.
 * @param {number} t - input [0, 1]
 * @returns {number}
 */
export const eio = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

/**
 * ease-out cubic easing.
 * @param {number} t - input [0, 1]
 * @returns {number}
 */
export const eo = t => 1 - Math.pow(1 - t, 3);

/**
 * return a random float in [0, n).
 * @param {number} n
 * @returns {number}
 */
export const rnd = n => Math.random() * n;

/**
 * return a random float in [-n, n).
 * @param {number} n
 * @returns {number}
 */
export const rndf = n => (Math.random() - 0.5) * n * 2;

/**
 * return true with probability n.
 * @param {number} n - probability [0, 1]
 * @returns {boolean}
 */
export const prob = n => Math.random() < n;

/**
 * return a random item from the given array
 * @template T
 * @param {T[]} array
 * @returns T random element
 */
export function rndchoice(array) {
  if (array.length === 0) {
    return undefined;
  }
  if (array.length === 1) {
    return array[0];
  }
  const idx = Math.floor(rnd(array.length));
  return array[idx];
}

/**
 * build a radial gradient on a given canvas context.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} r1 - inner radius
 * @param {number} r2 - outer radius
 * @param {...[number, string]} stops - [position, color] pairs
 * @returns {CanvasGradient}
 */
export function rg(ctx, x, y, r1, r2, ...stops) {
  const g = ctx.createRadialGradient(x, y, r1, x, y, r2);
  stops.forEach(([t, c]) => g.addColorStop(t, c));
  return g;
}

/**
 * build a linear gradient on a given canvas context.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @param {...[number, string]} stops - [position, color] pairs
 * @returns {CanvasGradient}
 */
export function lg(ctx, x1, y1, x2, y2, ...stops) {
  const g = ctx.createLinearGradient(x1, y1, x2, y2);
  stops.forEach(([t, c]) => g.addColorStop(t, c));
  return g;
}

/**
 * fill a path (described by a callback) with the given fill style.
 * @param {CanvasRenderingContext2D} ctx
 * @param {function(): void} path - function that draws the path using ctx
 * @param {string|CanvasGradient} fill
 */
export function blob(ctx, path, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  path();
  ctx.fill();
}

/**
 * throw if the given argument is undefined or null
 * @template T
 * @param {T} x
 * @returns T the non-null argument
 */
export function requireNonNull(x) {
  if (x === undefined || x === null) {
    throw new TypeError('requireNonNull: must not be null.');
  }
  return x;
}