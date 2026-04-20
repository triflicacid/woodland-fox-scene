import {clamp, lerp, rndf, prob, rnd, rndchoice} from '../utils.js';
import {Component} from '../core/Component.js';
import {Events} from "../event/Events.js";

/**
 * DrawWorld handles all background rendering: sky gradients,
 * celestial stuff, clouds, ground, undergrowth, grass, and seasonal details.
 */
export class DrawWorld extends Component {
  /**
   * @param {EventBus} eventBus
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} W - canvas width
   * @param {number} H - canvas height
   */
  constructor(eventBus, ctx, W, H) {
    super(eventBus);
    this.ctx = ctx;
    this.W = W;
    this.H = H;

    // array of worms to draw
    /** @type {Array<object>} */
    this._worms = [];
  }

  initialise() {
    this.eventBus.subscribe(Events.seasonChangeSubscription("DrawWorld", this._onSeasonOrWeatherChange.bind(this)));
    this.eventBus.subscribe(Events.weatherChangeSubscription("DrawWorld", this._onSeasonOrWeatherChange.bind(this)));
  }

  /**
   * @param {ValueChange<string>} update
   */
  _onSeasonOrWeatherChange(update) {
    console.log(update, this);
    const {state} = update;
    const {weather, season} = state;

    this._worms.length = 0;

    if (weather !== 'rain' && weather !== 'storm') return;
    if (season !== 'spring' && season !== 'summer') return;

    const k = weather === 'storm' ? 3 : 1;

    this._worms = Array.from({length: k + rnd(4)}, (_, i) => {
      // get a random puddle
      const pd = rndchoice(state.puddles);

      const p = prob(0.5);

      return {
        alpha: st => Math.min(1, (st.puddleLevel - 0.3) / 0.4), // fade-in,
        x: st => pd.x + Math.sin(st.frame * 0.008 + i * 2.1) * (pd.maxRx * 0.6),
        y: _ => pd.y + 6,
        wiggle: st => st.frame * 0.04 + i * 1.3,
        stroke: p ? '#c06080' : '#9060a0',
        fill: p ? '#d07090' : '#a070b0',
      };
    });
  }

  draw(state) {
    const {ctx, W, H} = this;
    const p = state.pal();
    const td = state.todBlend;
    const {frame, season, weather} = state;

    // blend todBlend toward target
    state.todBlend = lerp(state.todBlend, state.todTarget, 0.025);

    // base night sky
    const skyN = ctx.createLinearGradient(0, 0, 0, H * 0.7);
    skyN.addColorStop(0, p.sky0);
    skyN.addColorStop(0.5, p.sky1);
    skyN.addColorStop(1, p.sky2);
    ctx.fillStyle = skyN;
    ctx.fillRect(0, 0, W, H);

    // day sky overlay
    if (weather !== 'storm' && weather !== 'rain') {
      const skyD = ctx.createLinearGradient(0, 0, 0, H * 0.7);
      skyD.addColorStop(0, p.daySky0);
      skyD.addColorStop(0.5, p.daySky1);
      skyD.addColorStop(1, p.daySky2);
      ctx.globalAlpha = td;
      ctx.fillStyle = skyD;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    } else {
      ctx.fillStyle = '#1a2030';
      ctx.globalAlpha = 0.85;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }

    // aurora (winter night only)
    if (state.auroraOn && season === 'winter' && td < 0.35) {
      this._drawAurora(state);
    }

    // moon and stars at night
    if (td < 0.8 && weather !== 'storm' && weather !== 'rain') {
      this._drawMoon(td, frame);
      if (weather === 'clear' || weather === 'wind') {
        this._drawStars(td, frame);
      }
    }

    // sun during day
    if (td > 0.2 && weather !== 'fog' && weather !== 'rain' && weather !== 'storm') {
      this._drawSun(td, season, weather, frame);
    }

    // dawn/dusk glow
    if (td > 0.1 && td < 0.9) {
      const dg = clamp(1 - Math.abs(td - 0.5) * 8, 0, 1) * 0.38;
      const hor = ctx.createLinearGradient(0, H * 0.5, 0, H * 0.72);
      hor.addColorStop(0, `rgba(255,155,55,${dg})`);
      hor.addColorStop(1, 'rgba(255,90,10,0)');
      ctx.fillStyle = hor;
      ctx.fillRect(0, H * 0.5, W, H * 0.22);
    }

    this._drawClouds(season, weather, frame);

    // light mist over ground
    if (weather !== 'fog') {
      const mA = season === 'winter' ? 0.22 : season === 'autumn' ? 0.10 : 0.05;
      const mist = ctx.createLinearGradient(0, H * 0.5, 0, H * 0.72);
      mist.addColorStop(0, 'rgba(200,220,200,0)');
      mist.addColorStop(1, `rgba(200,220,210,${mA})`);
      ctx.fillStyle = mist;
      ctx.fillRect(0, H * 0.5, W, H * 0.22);
    }

    this._drawGround(state);
  }

  /**
   * draw the aurora borealis bands.
   * @param {SceneState} state
   */
  _drawAurora(state) {
    const {ctx, W, H} = this;
    const {frame, auroraBands} = state;
    ctx.save();
    auroraBands.forEach(b => {
      const g = ctx.createLinearGradient(0, b.y - b.width, 0, b.y + b.width);
      const shimmer = b.alpha + Math.sin(frame * 0.008 + b.phase) * 0.05;
      const hShift = Math.sin(frame * 0.003 + b.phase) * 18;
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(0.5, `hsla(${b.hue + hShift}, 85%, 60%, ${shimmer})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, b.y);
      for (let x = 0; x <= W; x += 18) {
        const wy = b.y + Math.sin(x * b.freq + frame * 0.012 + b.phase) * b.amp;
        ctx.lineTo(x, wy);
      }
      ctx.lineTo(W, H * 0.5);
      ctx.lineTo(0, H * 0.5);
      ctx.closePath();
      ctx.fill();
    });
    ctx.restore();
  }

  /**
   * draw the moon and its shadow disc.
   * @param {number} td - time-of-day blend
   * @param {number} frame
   */
  _drawMoon(td, frame) {
    const {ctx} = this;
    const ma = clamp(1 - td * 1.5, 0, 1);
    if (ma <= 0.02) return;
    ctx.save();
    ctx.globalAlpha = ma;
    ctx.shadowBlur = 40;
    ctx.shadowColor = '#fffbe0';
    ctx.fillStyle = '#fffde8';
    ctx.beginPath();
    ctx.arc(580, 55, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(10,17,32,0.35)';
    ctx.beginPath();
    ctx.ellipse(577 + Math.sin(frame * 0.003) * 8, 52, 18, 10, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /**
   * draw twinkling stars.
   * @param {number} td - time-of-day blend
   * @param {number} frame
   */
  _drawStars(td, frame) {
    const {ctx} = this;
    const stars = [
      [80, 30], [140, 18], [220, 40], [310, 12], [410, 28], [480, 15],
      [55, 60], [165, 45], [270, 25], [340, 50], [450, 8], [520, 38],
      [620, 20], [670, 45], [700, 10],
    ];
    stars.forEach(([sx, sy], i) => {
      ctx.globalAlpha = clamp(
          (1 - td * 2) * (0.3 + 0.4 * (0.5 + 0.5 * Math.sin(frame * 0.02 + i * 1.3))),
          0, 1
      );
      ctx.fillStyle = 'rgba(255,255,230,0.8)';
      ctx.beginPath();
      ctx.arc(sx, sy, 1, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  /**
   * draw the sun, including seasonal position and summer rays.
   * @param {number} td
   * @param {string} season
   * @param {string} weather
   * @param {number} frame
   */
  _drawSun(td, season, weather, frame) {
    const {ctx} = this;
    const sa = clamp((td - 0.2) / 0.6, 0, 1);
    const sunX = season === 'autumn' ? 120 : season === 'winter' ? 160 : 550;
    const sunY = season === 'winter' ? 90 : 65;
    ctx.save();
    ctx.globalAlpha = sa;
    ctx.shadowBlur = 60;
    ctx.shadowColor = '#ffe87888';
    ctx.fillStyle = season === 'autumn' ? '#f0a030' : season === 'winter' ? '#dde8f0' : '#fffad0';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = sa * 0.15;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 44, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    if (season === 'summer' && weather === 'clear') {
      ctx.strokeStyle = 'rgba(255,250,180,0.08)';
      ctx.lineWidth = 18;
      ctx.globalAlpha = sa;
      for (let r = 0; r < 6; r++) {
        const a = r * Math.PI / 3 + frame * 0.003;
        ctx.beginPath();
        ctx.moveTo(sunX, sunY);
        ctx.lineTo(sunX + Math.cos(a) * 180, sunY + Math.sin(a) * 180);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  /**
   * draw drifting clouds, style varies by weather and season.
   * @param {string} season
   * @param {string} weather
   * @param {number} frame
   */
  _drawClouds(season, weather, frame) {
    const {ctx} = this;
    const isRainy = weather === 'rain' || weather === 'storm';
    const windM = weather === 'wind' || weather === 'storm' ? 2.2 : 1;
    const seeds = [[100, 80, 0.7], [280, 60, 0.5], [450, 90, 0.6], [600, 70, 0.45]];
    const extra = isRainy ? [[160, 50, 0.8], [380, 40, 0.9], [520, 65, 0.85]] : [];
    [...seeds, ...extra].forEach(([cx, cy, a], i) => {
      const dx = Math.sin(frame * 0.002 + i * 0.8) * 20 * windM;
      ctx.save();
      ctx.globalAlpha = a * (isRainy ? 0.92 : season === 'winter' ? 0.82 : 0.58);
      ctx.fillStyle = isRainy ? '#4a5a6a'
          : season === 'winter' ? '#e8eef4'
              : season === 'autumn' ? '#d8b888' : '#fff';
      const x = cx + dx;
      ctx.beginPath();
      ctx.arc(x, cy, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + 30, cy + 5, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x - 22, cy + 6, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + 10, cy - 12, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  /**
   * draw the ground, including snow/leaves/flowers, undergrowth, and grass.
   * @param {SceneState} state
   */
  _drawGround(state) {
    const {ctx, W, H} = this;
    const {season, weather, frame} = state;
    const p = state.pal();

    const gnd = ctx.createLinearGradient(0, H * 0.62, 0, H);
    gnd.addColorStop(0, p.gnd0);
    gnd.addColorStop(0.4, p.gnd1);
    gnd.addColorStop(1, p.gnd2);
    ctx.fillStyle = gnd;
    ctx.fillRect(0, H * 0.62, W, H * 0.38);

    if (season === 'winter') {
      ctx.fillStyle = 'rgba(235,245,255,0.93)';
      ctx.fillRect(0, H * 0.62, W, H * 0.38);
      ctx.fillStyle = '#e8f2fa';
      ctx.beginPath();
      ctx.moveTo(0, H * 0.62);
      for (let sx = 0; sx <= W; sx += 20) {
        ctx.lineTo(sx, H * 0.62 + Math.sin(sx * 0.05) * 4 + Math.sin(sx * 0.11 + 1) * 3);
      }
      ctx.lineTo(W, H * 0.62);
      ctx.closePath();
      ctx.fill();
    }

    // ground line
    ctx.strokeStyle = season === 'winter' ? '#c8dcea' : season === 'autumn' ? '#5a3a1a' : '#2a5e1a';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, H * 0.62 + 1);
    ctx.lineTo(W, H * 0.62 + 1);
    ctx.stroke();
    ctx.globalAlpha = 1;

    this._drawUndergrowth(state);
    if (season === 'autumn') this._drawFallenLeaves(state);
    if (season === 'winter') this._drawSnowDrifts();
    if (season === 'spring') this._drawSpringFlowers(frame);
    this._drawPuddles(state);
    this._drawGrass(p, season, weather, frame);
    this._drawWorms(state);
  }

  /**
   * draw bushes and ground foliage behind the fox.
   * @param {SceneState} state
   */
  _drawUndergrowth(state) {
    const {ctx, H} = this;
    const {season, weather, frame} = state;
    const p = state.pal();
    const fox = state.fox;

    const bushDefs = [
      {x: 130, r: 28, dark: true}, {x: 175, r: 20, dark: false},
      {x: 510, r: 25, dark: false}, {x: 545, r: 18, dark: true},
      {x: 240, r: 16, dark: true}, {x: 420, r: 14, dark: false},
      {x: 80, r: 18, dark: false}, {x: 620, r: 22, dark: true},
    ];

    bushDefs.forEach(b => {
      const li = b.dark ? p.fL - 5 : p.fL + 3;
      const bg = ctx.createRadialGradient(b.x, H * 0.62 - b.r * 0.4, b.r * 0.1, b.x, H * 0.62, b.r);
      bg.addColorStop(0, `hsl(${p.fH},${p.fSat}%,${li + 12}%)`);
      bg.addColorStop(1, `hsl(${p.fH},${p.fSat - 5}%,${li}%)`);
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.arc(b.x, H * 0.62, b.r, Math.PI, 0);
      ctx.arc(b.x + b.r * 0.7, H * 0.62 - b.r * 0.3, b.r * 0.6, Math.PI, 0);
      ctx.arc(b.x - b.r * 0.6, H * 0.62 - b.r * 0.2, b.r * 0.55, Math.PI, 0);
      ctx.fill();
    });

    const wsh = weather === 'wind' ? Math.sin(frame * 0.04) * 5 : 0;
    for (let fx = 160; fx < 560; fx += 45) {
      if (Math.abs(fx - fox.x) < 60) continue;
      const sw = Math.sin(frame * 0.015 + fx * 0.06) * 2.5 + wsh;
      ctx.strokeStyle = `hsl(${p.fH + 10},${p.fSat}%,${p.fL + 8}%)`;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.7;
      for (let leaf = -3; leaf <= 3; leaf++) {
        const la = leaf * 0.22;
        ctx.beginPath();
        ctx.moveTo(fx, H * 0.62);
        ctx.quadraticCurveTo(
            fx + sw + Math.sin(la) * 18, H * 0.62 - 20 + la * 5,
            fx + Math.cos(la) * 28 + sw, H * 0.62 - 16 + leaf * 4
        );
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // small rocks / roots
    [
      {x: 195, y: H * 0.63}, {x: 290, y: H * 0.64},
      {x: 400, y: H * 0.63}, {x: 490, y: H * 0.64}, {x: 660, y: H * 0.63},
    ].forEach(r => {
      ctx.fillStyle = season === 'winter' ? '#c0d0dc' : '#3a3228';
      ctx.beginPath();
      ctx.ellipse(r.x, r.y, 12, 7, 0.2, 0, Math.PI * 2);
      ctx.fill();
      if (season !== 'winter') {
        ctx.fillStyle = `hsl(${p.fH},40%,20%)`;
        ctx.beginPath();
        ctx.ellipse(r.x, r.y - 3, 8, 4, 0.2, 0, Math.PI);
        ctx.fill();
      }
    });
  }

  /**
   * draw scattered fallen autumn leaves on the ground.
   * @param {SceneState} state
   */
  _drawFallenLeaves(state) {
    const {ctx, W, H} = this;
    const {frame, weather, fallenLeaves} = state;

    fallenLeaves.forEach(l => {
      ctx.save();
      ctx.translate(l.x, l.y);
      ctx.rotate(l.rot + Math.sin(frame * 0.01 + l.x * 0.05) * (weather === 'wind' ? 0.35 : 0.1));
      const hue = [18, 28, 38, 12, 45][Math.floor(l.x * 5 / W) % 5] + l.hueOff;
      ctx.fillStyle = `hsl(${hue},75%,45%)`;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.ellipse(0, 0, l.size, l.size * 0.55, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `hsl(${hue - 5},60%,35%)`;
      ctx.lineWidth = 0.6;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.moveTo(-l.size, 0);
      ctx.lineTo(l.size, 0);
      ctx.stroke();
      ctx.restore();
    });

    // wind-carried leaves
    if (weather === 'wind' || weather === 'storm') {
      fallenLeaves.slice(0, 25).forEach((l, i) => {
        const fl = (l.x + frame * 2 * (1 + i * 0.05)) % W;
        const fy = H * 0.55 + Math.sin(frame * 0.05 + i) * 30;
        ctx.save();
        ctx.translate(fl, fy);
        ctx.rotate(frame * 0.12 + i);
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = `hsl(${20 + i * 4},70%,45%)`;
        ctx.beginPath();
        ctx.ellipse(0, 0, 5, 3, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }
  }

  /**
   * draw snow drifts on top of the bushes in winter.
   */
  _drawSnowDrifts() {
    const {ctx, H} = this;
    [[130, H * 0.62], [175, H * 0.62], [510, H * 0.62], [545, H * 0.62]].forEach(([sx, sy]) => {
      ctx.fillStyle = 'rgba(230,242,252,0.95)';
      ctx.beginPath();
      ctx.ellipse(sx, sy, 32, 10, 0, Math.PI, 0);
      ctx.fill();
    });
  }

  /**
   * draw small spring flowers on the ground.
   * @param {number} frame
   */
  _drawSpringFlowers(frame) {
    const {ctx, H} = this;
    [
      {x: 220, c: '#ff88cc'}, {x: 250, c: '#ffdd44'}, {x: 310, c: '#ff99dd'},
      {x: 380, c: '#ffffaa'}, {x: 420, c: '#ff88bb'}, {x: 475, c: '#ddffaa'},
      {x: 160, c: '#ffaaee'}, {x: 540, c: '#ffcc44'},
    ].forEach(f => {
      const bob = Math.sin(frame * 0.04 + f.x * 0.1) * 0.8;
      ctx.fillStyle = f.c;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.arc(f.x, H * 0.66 + bob, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffee';
      ctx.beginPath();
      ctx.arc(f.x, H * 0.66 + bob, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });
  }

  /**
   * draw rain puddles that grow or shrink based on weather.
   * @param {SceneState} state
   */
  _drawPuddles(state) {
    const {ctx} = this;
    const {weather, todBlend, puddles} = state;
    const growing = weather === 'rain' || weather === 'storm';

    state.puddleLevel = clamp(state.puddleLevel + (growing ? 0.004 : -0.002), 0, 1);

    puddles.forEach(pd => {
      pd.rx = lerp(0, pd.maxRx, state.puddleLevel);
      pd.ry = lerp(0, pd.maxRy, state.puddleLevel);
      if (pd.rx < 1) return;
      const pg = ctx.createRadialGradient(pd.x, pd.y, 0, pd.x, pd.y, pd.rx);
      const c = todBlend > 0.5 ? 'rgba(120,160,200,' : 'rgba(20,40,80,';
      pg.addColorStop(0, `${c}0.4)`);
      pg.addColorStop(1, `${c}0.1)`);
      ctx.fillStyle = pg;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.ellipse(pd.x, pd.y, pd.rx, pd.ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      // rain ripple
      if (growing && prob(0.06)) {
        ctx.strokeStyle = 'rgba(140,180,220,0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(pd.x + rndf(pd.rx * 0.5), pd.y, pd.rx * 0.3, pd.ry * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
  }

  /**
   * draw animated grass blades (or sparse winter stubble).
   * @param {Object} p - palette
   * @param {string} season
   * @param {string} weather
   * @param {number} frame
   */
  _drawGrass(p, season, weather, frame) {
    const {ctx, W, H} = this;
    if (season !== 'winter') {
      const wsh = weather === 'wind' ? Math.sin(frame * 0.04) * 10
          : weather === 'storm' ? Math.sin(frame * 0.06) * 14 : 0;
      for (let gx = 10; gx < W; gx += 18) {
        const sw = Math.sin(frame * 0.018 + gx * 0.07) * 3 + wsh;
        ctx.strokeStyle = `hsl(${p.gH + Math.sin(gx) * 8},${p.gSat}%,${p.gL + Math.sin(gx * 0.3) * 4}%)`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(gx, H - 16);
        ctx.quadraticCurveTo(gx + sw, H - 30, gx + sw * 1.5, H - 42);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(gx + 7, H - 18);
        ctx.quadraticCurveTo(gx + 7 + sw * 0.7, H - 26, gx + 7 + sw, H - 34);
        ctx.stroke();
      }
    } else {
      for (let gx = 10; gx < W; gx += 28) {
        ctx.strokeStyle = 'rgba(180,200,220,0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(gx, H * 0.62);
        ctx.lineTo(gx, H * 0.62 - 12);
        ctx.stroke();
      }
    }
  }

  /**
   * draw slowly-wriggling worms near puddles during rain in spring and summer.
   * worms emerge when puddles are large enough and the season is warm.
   * @param {SceneState} state
   */
  _drawWorms(state) {
    const {ctx} = this;

    if (this._worms.length === 0) return;
    if (state.puddleLevel < 0.3) return; // only appear once puddles are established

    this._worms.forEach(w => {
      const alpha = w.alpha(state);
      const wormX = w.x(state);
      const wormY = w.y(state);
      const wiggle = w.wiggle(state);

      ctx.save();
      ctx.globalAlpha = 0.82 * alpha;
      ctx.strokeStyle = w.stroke;
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // draw worm as a short wiggly path of segments
      ctx.beginPath();
      const len = 18; // half-length in pixels
      ctx.moveTo(wormX - len, wormY + Math.sin(wiggle) * 3);
      for (let sx = -len + 4; sx <= len; sx += 4) {
        const sy = wormY + Math.sin(wiggle + sx * 0.22) * 3.5;
        ctx.lineTo(wormX + sx, sy);
      }
      ctx.stroke();

      // rounded head
      const headX = wormX + len + Math.cos(wiggle) * 1.5;
      const headY = wormY + Math.sin(wiggle + len * 0.22) * 3.5;
      ctx.fillStyle = w.fill;
      ctx.beginPath();
      ctx.arc(headX, headY, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }
}