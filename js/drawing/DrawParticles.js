import {clamp, rnd} from '../utils.js';

/**
 * DrawParticles handles ambient particle effects.
 * it both ticks (advances particle positions) and draws each frame.
 *
 * canopy leaves are exposed as a separate drawCanopyLeaves() call because they
 * need to render between the fox layer and the foreground trees.
 */
export class DrawParticles {
  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} W
   * @param {number} H
   */
  constructor(ctx, W, H) {
    this.ctx = ctx;
    this.W = W;
    this.H = H;
  }

  /**
   * draw all ambient effects for this frame.
   * called once per frame as a registered pre-fox component.
   * @param {SceneState} state
   */
  draw(state) {
    this._drawSmoke(state);
    this._drawFireflies(state);
    this._drawButterflies(state);
    this._drawSeasonTransition(state);
    this._drawHearts(state);
  }

  /**
   * draw and advance woodsmoke particles rising from the chimney.
   * suppressed during rain and storm (smoke gets washed away).
   * @param {SceneState} state
   */
  _drawSmoke(state) {
    const {ctx} = this;
    const {weather, season, smoke} = state;
    if (weather === 'storm' || weather === 'rain') return;

    smoke.forEach((s, i) => {
      s.x += s.vx + (weather === 'wind' ? 1.5 : 0);
      s.y += s.vy;
      s.life++;
      s.size += 0.08;
      s.alpha -= 0.002;
      if (s.life > 90 || s.alpha <= 0) state.resetSmoke(s, i);
      ctx.save();
      ctx.globalAlpha = Math.max(0, s.alpha);
      ctx.fillStyle = season === 'winter' ? 'rgba(220,230,240,1)' : 'rgba(180,180,170,1)';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  /**
   * draw and advance firefly particles.
   * only visible at night; suppressed during rain and storm.
   * @param {SceneState} state
   */
  _drawFireflies(state) {
    const {ctx, W, H} = this;
    const {todBlend, weather, frame, fireflies} = state;
    if (todBlend > 0.5) return;
    if (weather === 'rain' || weather === 'storm') return;

    const alpha = clamp(1 - todBlend * 2, 0, 1);
    fireflies.forEach(f => {
      f.angle += (Math.random() - 0.5) * 0.08;
      f.x += Math.cos(f.angle) * f.speed;
      f.y += Math.sin(f.angle) * f.speed * 0.5;
      f.x = clamp(f.x, 60, W - 60);
      f.y = clamp(f.y, H * 0.3, H * 0.65);
      const g = 0.4 + 0.6 * Math.sin(frame * 0.05 + f.phase);
      ctx.save();
      ctx.globalAlpha = g * 0.85 * alpha;
      ctx.shadowBlur = 12 + g * 8;
      ctx.shadowColor = '#aaff88';
      ctx.fillStyle = '#ccff99';
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  /**
   * draw and advance butterfly particles.
   * only visible during the day in spring and summer; reduced during wind.
   * @param {SceneState} state
   */
  _drawButterflies(state) {
    const {ctx, W} = this;
    const {todBlend, season, weather, butterflies} = state;
    if (todBlend < 0.4) return;
    if (season === 'winter' || season === 'autumn') return;
    if (weather === 'rain' || weather === 'storm') return;

    const count = weather === 'wind' ? 2 : butterflies.length;
    butterflies.slice(0, count).forEach(bf => {
      bf.x += bf.vx + (weather === 'wind' ? 0.8 : 0);
      bf.flapT += 0.12;
      bf.y += Math.sin(bf.flapT * 0.3) * 0.5;
      if (bf.x > W + 30) bf.x = -30;
      const flap = Math.abs(Math.sin(bf.flapT));
      ctx.save();
      ctx.translate(bf.x, bf.y);
      ctx.globalAlpha = 0.75;
      ctx.fillStyle = bf.col;
      ctx.beginPath();
      ctx.ellipse(-7 * flap, -2, 7 * flap, 5, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(7 * flap, -2, 7 * flap, 5, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#2a1a00';
      ctx.beginPath();
      ctx.ellipse(0, 0, 2, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  /**
   * draw and advance falling leaves/petals during a season transition.
   * spring shows pink/white petals; autumn shows warm orange/red leaves.
   * @param {SceneState} state
   */
  _drawSeasonTransition(state) {
    const {ctx} = this;
    const {seasonLeafActive, seasonLeaves, season} = state;
    if (!seasonLeafActive) return;

    let allDone = true;
    seasonLeaves.forEach(l => {
      if (l.y < state.H * 0.62) {
        allDone = false;
        l.x += l.vx;
        l.y += l.vy;
        l.rot += l.drot;
        l.life++;
        ctx.save();
        ctx.translate(l.x, l.y);
        ctx.rotate(l.rot);
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = `hsl(${l.hue}, ${season === 'spring' ? 60 : 75}%, ${season === 'spring' ? 80 : 45}%)`;
        ctx.beginPath();
        ctx.ellipse(0, 0, 5, 3, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });
    if (allDone) state.seasonLeafActive = false;
  }

  /**
   * draw and tick falling autumn canopy leaves dislodged by wind.
   * called separately from draw() because it must render between the fox
   * layer and the foreground trees - see Scene._loop().
   * @param {SceneState} state
   */
  drawCanopyLeaves(state) {
    const {ctx, H} = this;
    const {season, weather, canopyLeaves} = state;
    const shouldFall = season === 'autumn' && (weather === 'wind' || weather === 'storm');

    canopyLeaves.forEach(l => {
      if (!l.active) {
        if (shouldFall) {
          l.timer--;
          if (l.timer <= 0) {
            if (state.makeCanopyLeaf) Object.assign(l, state.makeCanopyLeaf(state.trees));
            l.active = true;
          }
        }
        return;
      }
      l.x += l.vx + (weather === 'wind' ? 1.5 : 0);
      l.y += l.vy;
      l.rot += l.drot;
      if (l.y > H * 0.63) {
        l.active = false;
        l.timer = rnd(120) | 0;
      }
      ctx.save();
      ctx.translate(l.x, l.y);
      ctx.rotate(l.rot);
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = `hsl(${l.hue},72%,44%)`;
      ctx.beginPath();
      ctx.ellipse(0, 0, 5, 3, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  /**
   * draw and tick floating heart particles spawned during the bunny nuzzle.
   * @param {SceneState} state
   */
  _drawHearts(state) {
    const {ctx} = this;
    const {hearts} = state;
    if (!hearts.length) return;
    hearts.forEach(h => {
      const a = clamp(1 - h.life / 60, 0, 1);
      _drawHeart(ctx, h.x, h.y, 6 + h.life * 0.09, a);
    });
  }
}

/**
 * draw a heart shape at the given position.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} size
 * @param {number} alpha
 */
function _drawHeart(ctx, x, y, size, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#ff88aa';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(x, y - size, x - size * 1.5, y - size, x - size * 1.5, y - size * 0.4);
  ctx.bezierCurveTo(x - size * 1.5, y + size * 0.3, x, y + size, x, y + size * 1.2);
  ctx.bezierCurveTo(x, y + size, x + size * 1.5, y + size * 0.3, x + size * 1.5, y - size * 0.4);
  ctx.bezierCurveTo(x + size * 1.5, y - size, x, y - size, x, y);
  ctx.fill();
  ctx.restore();
}