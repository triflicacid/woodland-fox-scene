import {rnd, rndf, prob} from '../utils.js';
import {PROBABILITY} from '../config.js';

/**
 * DrawWeather handles the five weather conditions that overlay the scene.
 * it both ticks (advances particle positions) and draws each frame.
 */
export class DrawWeather {
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
     * draw all active weather effects for this frame.
     * @param {SceneState} state
     */
    draw(state) {
        const {weather} = state;
        if (weather === 'rain' || weather === 'storm') this._drawRain(state);
        if (weather === 'snow') this._drawSnow(state);
        if (weather === 'fog') this._drawFog(state);
        if (weather === 'wind') this._drawWind(state);
    }

    /**
     * tick all active weather effects for this frame.
     * @param {SceneState} state
     * @param _1 (ignore)
     * @param _2 (ignore)
     */
    tick(state, _1, _2) {
      const {weather} = state;
      if (weather === 'storm') this._tickLightning(state);
    }

    /**
     * draw and tick animated rain streaks.
     * storm rain is heavier and more angled than normal rain.
     * @param {SceneState} state
     */
    _drawRain(state) {
        const {ctx, W, H} = this;
        const {weather, raindrops} = state;
        const angle = weather === 'storm' ? 0.15 : 0.06;
        ctx.strokeStyle = weather === 'storm' ? 'rgba(160,180,220,0.5)' : 'rgba(120,160,200,0.45)';
        ctx.lineWidth = weather === 'storm' ? 1.5 : 1;
        raindrops.forEach(r => {
            r.y += r.speed;
            r.x += r.speed * angle;
            if (r.y > H || r.x > W) state.resetRain(r);
            ctx.beginPath();
            ctx.moveTo(r.x, r.y);
            ctx.lineTo(r.x - r.len * angle, r.y - r.len);
            ctx.stroke();
        });
    }

    /**
     * draw and tick snowflakes drifting with a gentle sine wobble.
     * @param {SceneState} state
     */
    _drawSnow(state) {
        const {ctx, H} = this;
        const {frame, weatherSnow} = state;
        weatherSnow.forEach(sf => {
            sf.y += sf.speed;
            sf.x += Math.sin(frame * 0.02 + sf.phase) * 0.5;
            if (sf.y > H) state.resetSnow(sf);
            ctx.save();
            ctx.globalAlpha = 0.75;
            ctx.fillStyle = '#e8f0ff';
            ctx.shadowBlur = 3;
            ctx.shadowColor = '#fff';
            ctx.beginPath();
            ctx.arc(sf.x, sf.y, sf.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }

    /**
     * draw and tick fog: individual radial-gradient blobs plus a full-height overlay.
     * @param {SceneState} state
     */
    _drawFog(state) {
        const {ctx, W, H} = this;
        const {fogParticles} = state;
        fogParticles.forEach(fp => {
            fp.x += fp.speed;
            if (fp.x > W + fp.w) fp.x = -fp.w;
            ctx.save();
            ctx.globalAlpha = fp.alpha;
            const fg = ctx.createRadialGradient(fp.x, fp.y, 0, fp.x, fp.y, fp.w * 0.7);
            fg.addColorStop(0, 'rgba(200,210,200,1)');
            fg.addColorStop(1, 'rgba(200,210,200,0)');
            ctx.fillStyle = fg;
            ctx.beginPath();
            ctx.ellipse(fp.x, fp.y, fp.w, fp.h, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
        // full-scene fog thickening toward the ground
        const fo = ctx.createLinearGradient(0, H * 0.4, 0, H);
        fo.addColorStop(0, 'rgba(175,185,180,0)');
        fo.addColorStop(0.4, 'rgba(175,185,180,0.35)');
        fo.addColorStop(1, 'rgba(175,185,180,0.58)');
        ctx.fillStyle = fo;
        ctx.fillRect(0, H * 0.4, W, H * 0.6);
    }

    /**
     * draw and tick wind-debris streaks scrolling left to right.
     * @param {SceneState} state
     */
    _drawWind(state) {
        const {ctx, W} = this;
        const {windDebris} = state;
        windDebris.forEach(wd => {
            wd.x += wd.vx;
            wd.y += wd.vy;
            if (wd.x > W + 30) state.resetWind(wd);
            ctx.save();
            ctx.globalAlpha = wd.alpha;
            ctx.strokeStyle = 'rgba(180,200,170,0.6)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(wd.x, wd.y);
            ctx.lineTo(wd.x - wd.len, wd.y + wd.vy * 3);
            ctx.stroke();
            ctx.restore();
        });
    }

    /**
     * randomly trigger a new lightning bolt and render it while it fades.
     * also flashes the whole canvas white to simulate the accompanying light.
     * @param {SceneState} state
     */
    _tickLightning(state) {
        const {ctx, W, H} = this;
        const {lightning} = state;

        if (prob(PROBABILITY.LIGHTNING)) {
            lightning.path = [];
            let lx = 200 + rnd(300), ly = 0;
            while (ly < H * 0.65) {
                lightning.path.push([lx, ly]);
                lx += rndf(40);
                ly += 20 + rnd(20);
            }
            lightning.active = true;
            lightning.t = 0;
        }

        if (lightning.active) {
            lightning.t++;
            if (lightning.t < 8) {
                const fade = 1 - lightning.t / 8;
                // full-canvas flash
                ctx.fillStyle = `rgba(200,220,255,${0.15 * fade})`;
                ctx.fillRect(0, 0, W, H);
                // core bolt
                ctx.strokeStyle = `rgba(220,230,255,${fade})`;
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.beginPath();
                lightning.path.forEach(([lx, ly], i) => i === 0 ? ctx.moveTo(lx, ly) : ctx.lineTo(lx, ly));
                ctx.stroke();
                // wide glow
                ctx.strokeStyle = `rgba(180,200,255,${0.4 * fade})`;
                ctx.lineWidth = 8;
                ctx.beginPath();
                lightning.path.forEach(([lx, ly], i) => i === 0 ? ctx.moveTo(lx, ly) : ctx.lineTo(lx, ly));
                ctx.stroke();
            } else {
                lightning.active = false;
            }
        }
    }
}