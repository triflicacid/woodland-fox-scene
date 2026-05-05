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

/**
 * Show/hide the given element.
 * This sets the element's `style.display` properties, so do not use if you're
 * precious about that.
 * @param {HTMLElement} el
 * @param {boolean} hide hide or show the element?
 */
export function hideElement(el, hide) {
  el.style.display = hide ? "none" : "block";
}

/**
 * darken or lighten a hex colour by an amount.
 * @param {string} hex
 * @param {number} amt - negative darkens, positive lightens
 * @returns {string}
 */
export function shadeHex(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.max(0, (n >> 16) + amt));
  const g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + amt));
  const b = Math.min(255, Math.max(0, (n & 0xff) + amt));
  return `rgb(${r},${g},${b})`;
}

/**
 * samples a value from a set of keyframe stops at position t (0-1)
 * @param {number} t value [0, 1]
 * @param {Array<Object>} stops array of {t, v} where v is a number
 * @returns {number}
 */
export function sample(t, stops) {
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i], b = stops[i + 1];
    if (t >= a.t && t <= b.t) {
      const p = (t - a.t) / (b.t - a.t);
      return a.v + (b.v - a.v) * p;
    }
  }
  return stops[stops.length - 1].v;
}

/**
 * samples an rgb colour from keyframe stops at position t.
 * @param {number} t value [0, 1]
 * @param {Array<Object>} stops array of {t, r, g, b}
 * @returns {[number, number, number]} rgb
 */
export function sampleCol(t, stops) {
  if (stops.length === 0) return undefined;
  if (t <= stops[0].t) {
    const l = stops[0];
    return [l.r, l.g, l.b];
  }

  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i], b = stops[i + 1];
    if (t >= a.t && t <= b.t) {
      const p = (t - a.t) / (b.t - a.t);
      return [
        Math.round(a.r + (b.r - a.r) * p),
        Math.round(a.g + (b.g - a.g) * p),
        Math.round(a.b + (b.b - a.b) * p),
      ];
    }
  }
  const l = stops[stops.length - 1];
  return [l.r, l.g, l.b];
}

/**
 * builds an RGB colour string with the given components
 */
export function rgb([r, g, b], a = 1) {
  return a < 1 ? `rgba(${r},${g},${b},${a})` : `rgb(${r},${g},${b})`;
}
