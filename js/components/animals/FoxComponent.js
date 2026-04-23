import {blob, clamp, eio, eo, lerp, lg, prob, rg} from '@/utils';
import {FOX_PHASES, PROBABILITY} from '@/config';
import {DrawComponent} from "@/core/DrawComponent";
import {Events} from "@/core/Events";
import {Subscriptions} from "@/core/Subscriptions";

/**
 * return the current eye openness from 0 (closed) to 1 (open).
 * handles transitions in both directions.
 * @param {Object} fox
 * @returns {number}
 */
function eyeOpenAmount(fox) {
  if (fox.eyeTransitionT < 0) {
    return fox.asleep ? 0 : 1;
  }
  const t = clamp(fox.eyeTransitionT / 50, 0, 1);
  const curve = Math.sin(t * Math.PI); // bell curve - peaks at 0.5
  return fox.asleep
      ? curve          // asleep: transitions open then back closed
      : 1 - curve;     // awake: transitions closed then back open (blink)
}

/**
 * FoxComponent manages fox animation state ticking and all fox drawing.
 * it also handles the bunny interaction sequence.
 */
export class FoxComponent extends DrawComponent {
  initialise() {
    this.eventBus.subscribe(Subscriptions.onFireworkBang(this.getName(), ({loud}) => {
      if (loud && prob(PROBABILITY.FIREWORK_BANG_REACTION)) {
        this.scene.fox.earTwitchT = 0;
        this.scene.fox.earTwitchSide = prob(0.5) ? 1 : -1;
        if (prob(PROBABILITY.STARTLE_TRIGGERS_EYE)) {
          this._triggerEyeTransition();
        }
      }
    }));
    this.eventBus.subscribe(Subscriptions.onLightningStrike(this.getName(), ({superBolt}) => {
      if (superBolt && prob(PROBABILITY.SUPER_BOLT_REACTION)) {
        this.scene.fox.earTwitchT = 0;
        this.scene.fox.earTwitchSide = prob(0.5) ? 1 : -1;
        if (prob(PROBABILITY.STARTLE_TRIGGERS_EYE)) {
          this._triggerEyeTransition();
        }
      }
    }));
  }

  tick() {
    const {fox} = this.scene;

    // passive idle behaviours
    if (fox.phase === 'idle' && fox.poseBlend < 0.01) {
      if (fox.yawnT < 0 && prob(PROBABILITY.FOX_YAWN)) {
        fox.yawnT = 0;
        this.eventBus.receive(Events.characterAction(this.getName(), 'fox', 'yawn'));
      }
      if (fox.yawnT >= 0) {
        fox.yawnT++;
        if (fox.yawnT >= 80) fox.yawnT = -1;
      }
      if (fox.earTwitchT < 0 && prob(PROBABILITY.EAR_TWITCH)) {
        fox.earTwitchT = 0;
        fox.earTwitchSide = prob(0.5) ? 1 : -1;
      }
      if (fox.earTwitchT >= 0) {
        fox.earTwitchT++;
        if (fox.earTwitchT >= 20) fox.earTwitchT = -1;
      }
    }

    // randomly blink if awake
    if (!fox.asleep && fox.eyeTransitionT < 0 && prob(PROBABILITY.FOX_BLINK)) {
      this._triggerEyeTransition();
    }

    // countdown the grumble animation
    if (fox.grumbleT >= 0) {
      fox.grumbleT++;
      if (fox.grumbleT >= 40) fox.grumbleT = -1;
    }

    // countdown the eye open animation
    if (fox.eyeTransitionT >= 0) {
      fox.eyeTransitionT++;
      if (fox.eyeTransitionT >= 50) fox.eyeTransitionT = -1;
    }

    if (fox.phase === 'idle') return;

    fox.phaseT++;
    const cfg = FOX_PHASES[fox.phase];
    if (!cfg) return;
    const t = clamp(fox.phaseT / cfg.f, 0, 1);

    if (fox.phase === 'standup') {
      fox.poseBlend = eio(t);
      fox.stretchBlend = 0;
      if (fox.phaseT >= cfg.f) {
        fox.phase = 'stretch';
        fox.phaseT = 0;
        this.eventBus.receive(Events.characterAction(this.getName(), 'fox', 'wake'));
      }

    } else if (fox.phase === 'stretch') {
      fox.poseBlend = 1;
      fox.stretchBlend = Math.sin(t * Math.PI);
      if (fox.phaseT >= cfg.f) {
        fox.phase = 'shake';
        fox.phaseT = 0;
        fox.stretchBlend = 0;
      }

    } else if (fox.phase === 'shake') {
      fox.poseBlend = 1;
      fox.tailWag = Math.sin(fox.phaseT * 0.25) * 0.55;
      if (fox.phaseT >= cfg.f) {
        fox.phase = 'spin';
        fox.phaseT = 0;
        fox.tailWag = 0;
      }

    } else if (fox.phase === 'spin') {
      fox.poseBlend = 1;
      fox.spinAngle = eio(t) * Math.PI * 2;
      if (fox.phaseT >= cfg.f) {
        fox.phase = 'curling';
        fox.phaseT = 0;
        fox.spinAngle = 0;
      }

    } else if (fox.phase === 'curling') {
      fox.poseBlend = 1 - eio(t);
      if (fox.phaseT >= cfg.f) {
        fox.phase = 'idle';
        fox.poseBlend = 0;
        this.eventBus.receive(Events.statusText(this.getName(), 'Curled up, fast asleep...'));
        this.eventBus.receive(Events.mainButtonsEnabled(this.getName(), true));
        this.eventBus.receive(Events.characterAction(this.getName(), 'fox', 'sleep'));
      }

    } else if (fox.phase === 'bunny_standup') {
      fox.poseBlend = eio(t);
      fox.stretchBlend = 0;
      if (fox.phaseT >= cfg.f) fox.phase = 'idle';

    } else if (fox.phase === 'bunny_curling') {
      fox.poseBlend = 1 - eio(t);
      if (fox.phaseT >= cfg.f) {
        fox.phase = 'idle';
        fox.poseBlend = 0;
      }

    } else if (fox.phase === 'wander_out') {
      fox.poseBlend = 1;
      fox.wanderX = lerp(fox.x, fox.x + 180, eo(t));
      if (fox.phaseT >= cfg.f) {
        fox.phase = 'wander_sniff';
        fox.phaseT = 0;
        this.eventBus.receive(Events.characterAction(this.getName(), 'fox', 'wander.start'));
      }

    } else if (fox.phase === 'wander_sniff') {
      fox.wanderX = fox.x + 180 + Math.sin(fox.phaseT * 0.05) * 15;
      if (fox.phaseT >= cfg.f) {
        fox.phase = 'wander_in';
        fox.phaseT = 0;
      }

    } else if (fox.phase === 'wander_in') {
      fox.wanderX = lerp(fox.x + 180, fox.x, eo(t));
      if (fox.phaseT >= cfg.f) {
        fox.phase = 'curling';
        fox.phaseT = 0;
        fox.wanderX = fox.x;
        this.eventBus.receive(Events.statusText(this.getName(), 'Back home curling up...'));
        this.eventBus.receive(Events.characterAction(this.getName(), 'fox', 'wander.end'));
      }
    }
  }

  /**
   * draw the fox for this frame (handles pose blend between curled and standing).
   */
  draw() {
    const {ctx} = this;
    const {fox, bunny, season, weather, frame, todBlend} = this.scene;

    let fx = fox.x;
    if (fox.phase === 'wander_out' || fox.phase === 'wander_sniff' || fox.phase === 'wander_in') {
      fx = fox.wanderX;
    }

    // shiver in cold weather while asleep
    const shivering = fox.poseBlend < 0.05 &&
        (season === 'winter' || weather === 'storm' || weather === 'rain' || weather === 'snow');
    if (shivering) fox.shiverT++;
    const sx = shivering ? Math.sin(fox.shiverT * 1.9) * 0.6 : 0;
    const sy = shivering ? Math.sin(fox.shiverT * 2.7) * 0.3 : 0;

    // snow accumulation on sleeping fox
    if (weather === 'snow' && fox.poseBlend < 0.05) fox.snowLevel = Math.min(1, fox.snowLevel + 0.00025);
    else fox.snowLevel = Math.max(0, fox.snowLevel - 0.0012);

    ctx.save();
    ctx.translate(fx + sx, fox.y + sy);
    if (fox.spinAngle !== 0) ctx.scale(Math.cos(fox.spinAngle), 1 - Math.abs(Math.sin(fox.spinAngle)) * 0.08);

    const b = fox.poseBlend;
    const wanderLeft = !(fox.phase === 'wander_out' || fox.phase === 'wander_sniff');
    const facingLeft = bunny.phase === 'fox_waking' || bunny.phase === 'nuzzle' || bunny.phase === 'fox_sleep';
    const fl = facingLeft || wanderLeft;

    if (b < 0.01) {
      this._drawCurled(fox, frame, season, weather, todBlend);
    } else if (b > 0.99) {
      this._drawStanding(fox, fl);
    } else {
      ctx.save();
      ctx.globalAlpha = 1 - b;
      this._drawCurled(fox, frame, season, weather, todBlend);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = b;
      this._drawStanding(fox, fl);
      ctx.restore();
    }
    ctx.restore();

    // winter breath puff
    if (season === 'winter' && b < 0.05) {
      fox.breathT++;
      if (fox.breathT % 90 < 22) {
        const bt = (fox.breathT % 90) / 22;
        ctx.save();
        ctx.globalAlpha = 0.25 * (1 - bt);
        ctx.fillStyle = '#ddeeff';
        ctx.beginPath();
        ctx.arc(fx - 40 + bt * 10, fox.y - 22 - bt * 7, 2 + bt * 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  /**
   * draw the fox in its curled sleeping pose.
   * @param {Object} fox - fox state
   * @param {number} frame
   * @param {string} season
   * @param {string} weather
   * @param {number} todBlend
   */
  _drawCurled(fox, frame, season, weather, todBlend) {
    const {ctx} = this;
    const tuck = (weather === 'rain' || weather === 'storm') ? 1 : 0;
    fox.rainTuck = lerp(fox.rainTuck, tuck, 0.05);
    const bob = Math.sin(frame * 0.038) * lerp(1.4, 0.25, fox.rainTuck);

    ctx.save();
    ctx.translate(0, bob);
    ctx.scale(1 + fox.rainTuck * 0.04, 1 - fox.rainTuck * 0.03);

    // drop shadow
    blob(ctx, () => ctx.ellipse(2, 6, 42, 9, 0, 0, Math.PI * 2), 'rgba(0,0,0,0.18)');

    // tail (drawn first so body overlaps it)
    blob(ctx, () => {
      ctx.moveTo(28, -2);
      ctx.bezierCurveTo(62, -2, 66, -32, 48, -52);
      ctx.bezierCurveTo(40, -62, 22, -58, 18, -48);
      ctx.bezierCurveTo(12, -36, 16, -18, 10, -8);
      ctx.bezierCurveTo(8, -2, 16, 0, 28, -2);
    }, rg(ctx, 38, -28, 4, 34, [0, '#f5a030'], [0.5, '#e06018'], [1, '#9a2c08']));

    // white tail tip
    blob(ctx, () => {
      ctx.moveTo(18, -48);
      ctx.bezierCurveTo(12, -62, 28, -70, 48, -52);
      ctx.bezierCurveTo(38, -58, 24, -54, 18, -48);
    }, rg(ctx, 32, -58, 2, 18, [0, '#ffffff'], [0.5, '#e8f5f0'], [1, '#b8ddd8']));

    // body
    blob(ctx, () => ctx.ellipse(0, -10, 38, 22, 0.12, 0, Math.PI * 2),
        rg(ctx, -4, -20, 3, 40, [0, '#f5a050'], [0.4, '#e86820'], [0.75, '#c04412'], [1, '#882408']));

    // chest
    blob(ctx, () => ctx.ellipse(6, -5, 20, 15, 0.1, 0, Math.PI * 2),
        rg(ctx, 8, -2, 2, 20, [0, '#fdecd8'], [0.5, '#f8d4b0'], [1, '#e8b080']));

    // far paw
    blob(ctx, () => ctx.ellipse(-12, 4, 10, 5.5, 0.1, 0, Math.PI * 2),
        rg(ctx, -12, 4, 1, 10, [0, '#d85c18'], [1, '#882408']));
    // near paw
    blob(ctx, () => ctx.ellipse(-1, 5, 10, 5.5, 0.08, 0, Math.PI * 2),
        rg(ctx, -1, 5, 1, 10, [0, '#e06820'], [1, '#9a2c0a']));

    // toe lines
    ctx.strokeStyle = 'rgba(90,18,4,0.4)';
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    [[-5, 5], [-2, 5.5], [1, 6], [-12, 5], [-9, 5.5], [-6, 5.5]].forEach(([tx, ty]) => {
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx, ty + 2.5);
      ctx.stroke();
    });

    // head
    const hb = Math.sin(frame * 0.038) * 0.3;
    blob(ctx, () => ctx.arc(-28, -22 + hb, 17, 0, Math.PI * 2),
        rg(ctx, -28, -30 + hb, 3, 19, [0, '#f5a050'], [0.45, '#e86820'], [1, '#b83c10']));

    // far ear
    ctx.fillStyle = '#c04010';
    ctx.beginPath();
    ctx.moveTo(-38, -35 + hb);
    ctx.lineTo(-44, -58 + hb);
    ctx.lineTo(-24, -33 + hb);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(18,5,2,0.78)';
    ctx.beginPath();
    ctx.moveTo(-37, -35 + hb);
    ctx.lineTo(-42, -55 + hb);
    ctx.lineTo(-26, -34 + hb);
    ctx.closePath();
    ctx.fill();

    // near ear (with optional twitch)
    const earOff = fox.earTwitchT >= 0
        ? Math.sin(fox.earTwitchT * 0.4) * 3 * fox.earTwitchSide : 0;
    ctx.fillStyle = '#e06828';
    ctx.beginPath();
    ctx.moveTo(-20, -35 + hb);
    ctx.lineTo(-18 + earOff, -58 + hb);
    ctx.lineTo(-8, -33 + hb);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(18,5,2,0.78)';
    ctx.beginPath();
    ctx.moveTo(-19, -35 + hb);
    ctx.lineTo(-17 + earOff, -55 + hb);
    ctx.lineTo(-10, -34 + hb);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(210,120,100,0.6)';
    ctx.beginPath();
    ctx.moveTo(-18, -36 + hb);
    ctx.lineTo(-16 + earOff, -52 + hb);
    ctx.lineTo(-12, -35 + hb);
    ctx.closePath();
    ctx.fill();

    // muzzle
    blob(ctx, () => ctx.ellipse(-38, -16 + hb, 10, 7, -0.1, 0, Math.PI * 2),
        rg(ctx, -36, -17 + hb, 1, 12, [0, '#fde8c8'], [0.6, '#f5cfa0'], [1, '#d8a068']));

    // nose
    ctx.fillStyle = '#1a0804';
    ctx.beginPath();
    ctx.arc(-45, -16 + hb, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.beginPath();
    ctx.arc(-44.5, -17 + hb, 1, 0, Math.PI * 2);
    ctx.fill();

    // near eye, open or closed
    const eyeOpen = eyeOpenAmount(fox);
    ctx.strokeStyle = '#4a1804';
    ctx.lineWidth   = 1.5;
    if (eyeOpen > 0.1) {
      ctx.save();
      // sclera
      blob(ctx, () => ctx.arc(-22, -26 + hb, 4, 0, Math.PI * 2),
          rg(ctx, -22, -26 + hb, 0, 4, [0, 'rgba(255,245,220,0.6)'], [1, 'rgba(255,245,220,0)']));
      // iris, scaled vertically by openness
      ctx.save();
      ctx.translate(-22, -26 + hb);
      ctx.scale(1, eyeOpen);
      ctx.fillStyle = '#c06010';
      ctx.beginPath();
      ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();
      // slit pupil
      ctx.fillStyle = '#0a0402';
      ctx.beginPath();
      ctx.ellipse(0, 0, 1, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // catchlight
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.beginPath();
      ctx.arc(1, -1, 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.restore();
    } else if (fox.yawnT >= 0 && fox.yawnT < 80) {
      // squinting during yawn
      ctx.beginPath();
      ctx.arc(-22, -26 + hb, 4, Math.PI * 0.1, Math.PI * 0.65);
      ctx.stroke();
    } else {
      // normal closed eye arc
      ctx.beginPath();
      ctx.arc(-22, -26 + hb, 4, Math.PI * 0.18, Math.PI * 0.82);
      ctx.stroke();
    }

    // yawn: squinting eye, open mouth, and rising 'a' bubble
    ctx.strokeStyle = '#4a1804';
    ctx.lineWidth = 1.5;
    if (fox.yawnT >= 0 && fox.yawnT < 80) {
      const yt = fox.yawnT / 80;
      const mo = Math.sin(yt * Math.PI) * 7; // mouth open amount
      // squinting eye during yawn (done in eyeOpen if-else)
      // open mouth cavity
      ctx.fillStyle = '#5a0800';
      ctx.beginPath();
      ctx.ellipse(-38, -12 + hb, 4, mo * 0.55, 0.1, 0, Math.PI * 2);
      ctx.fill();
      // rising 'a' bubble
      ctx.save();
      ctx.globalAlpha = Math.sin(yt * Math.PI) * 0.9;
      ctx.fillStyle = '#ffe8cc';
      ctx.beginPath();
      ctx.arc(-22, -50 + hb - yt * 8, 3 + yt * 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#cc7040';
      ctx.font = `bold ${8 + yt * 5}px serif`;
      ctx.fillText('a', -25 - yt * 2, -50 + hb - yt * 8 + 4);
      ctx.restore();
    }

    // grumble exclamation
    if (fox.grumbleT >= 0) {
      const gt = fox.grumbleT / 40;
      ctx.save();
      ctx.globalAlpha = Math.sin(gt * Math.PI) * 0.9;
      ctx.fillStyle = '#ff4444';
      ctx.font = `bold ${10 + gt * 4}px sans-serif`;
      ctx.fillText('!', -8, -55 - gt * 14);
      ctx.restore();
    }

    // zzz sleep indicators (when asleep and at night)
    if (todBlend < 0.5 && fox.phase === 'idle' && fox.asleep) {
      ['z', 'z', 'Z'].forEach((z, i) => {
        ctx.globalAlpha = 0.45 + 0.3 * Math.sin(frame * 0.04 + i * 0.9 + Math.PI);
        ctx.fillStyle = 'rgba(180,210,255,0.9)';
        ctx.font = `bold ${10 + i * 3}px serif`;
        ctx.fillText(z, -2 - i * 6, -46 - i * 12);
      });
      ctx.globalAlpha = 1;
    }

    // snow piling up on sleeping fox
    if (fox.snowLevel > 0.02) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(-40, 0);
      ctx.bezierCurveTo(-38, -44, 20, -44, 30, -16);
      ctx.lineTo(26, 0);
      ctx.closePath();
      ctx.clip();
      const d = fox.snowLevel * 15;
      ctx.fillStyle = 'rgba(255,255,255,0.93)';
      ctx.beginPath();
      ctx.moveTo(-42, -44);
      for (let sx = -42; sx <= 32; sx += 5) {
        const lump = Math.sin(sx * 0.42 + frame * 0.01) * 1.8 * fox.snowLevel;
        ctx.lineTo(sx, -44 + d * (0.15 + 0.85 * ((sx + 42) / 74)) + lump);
      }
      ctx.lineTo(32, 4);
      ctx.lineTo(-42, 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    ctx.restore(); // bob + scale
  }

  /**
   * draw the fox in its standing pose, used during waking/greeting animations.
   * canonical orientation is facing left; facingLeft=false flips to face right.
   * @param {Object} fox
   * @param {boolean} facingLeft
   */
  _drawStanding(fox, facingLeft) {
    const {ctx} = this;
    const s = fox.stretchBlend;
    const legLen = 34 + s * 14;
    const nk = s * 8;

    ctx.save();
    if (!facingLeft) ctx.scale(-1, 1);

    // shadow
    blob(ctx, () => ctx.ellipse(0, 5, 44, 8, 0, 0, Math.PI * 2), 'rgba(0,0,0,0.18)');

    // tail with optional wag rotation
    ctx.save();
    ctx.translate(24, -18);
    ctx.rotate(fox.tailWag);
    blob(ctx, () => {
      ctx.moveTo(0, 2);
      ctx.bezierCurveTo(28, -2, 40, -24, 30, -48);
      ctx.bezierCurveTo(24, -56, 10, -54, 8, -46);
      ctx.bezierCurveTo(4, -36, 4, -16, 0, 2);
    }, rg(ctx, 12, -24, 4, 30, [0, '#f5a030'], [0.5, '#e06018'], [1, '#9a2c08']));
    blob(ctx, () => {
      ctx.moveTo(8, -46);
      ctx.bezierCurveTo(4, -56, 18, -62, 30, -48);
      ctx.bezierCurveTo(22, -54, 12, -50, 8, -46);
    }, rg(ctx, 20, -52, 2, 14, [0, '#ffffff'], [0.5, '#e8f5f0'], [1, '#b8ddd8']));
    ctx.restore();

    // back legs
    [[14, -4], [8, -4], [-12, -8], [-6, -8]].forEach(([lx, ly], i) => {
      const dark = i < 2;
      const topC = dark ? '#b03c10' : '#c84818';
      const botC = dark ? '#6a1e08' : '#7a2810';
      blob(ctx, () => ctx.ellipse(lx, ly + legLen / 2, 5, legLen / 2 + 2, 0, 0, Math.PI * 2),
          lg(ctx, lx, ly, lx, ly + legLen, [0, topC], [1, botC]));
      blob(ctx, () => ctx.ellipse(lx, ly + legLen, 7, 4, 0, 0, Math.PI * 2),
          rg(ctx, lx, ly + legLen, 1, 7, [0, '#c04010'], [1, '#701808']));
    });

    // body
    blob(ctx, () => ctx.ellipse(2, -22, 30, 18, 0.05, 0, Math.PI * 2),
        rg(ctx, -4, -30, 4, 36, [0, '#f5a050'], [0.4, '#e86820'], [0.75, '#c04412'], [1, '#882408']));

    // belly
    blob(ctx, () => ctx.ellipse(-2, -16, 14, 13, 0.05, 0, Math.PI * 2),
        rg(ctx, -2, -14, 2, 16, [0, '#fdecd8'], [0.5, '#f8d4b0'], [1, '#e0a870']));

    // neck
    blob(ctx, () => {
      ctx.moveTo(-8, -34);
      ctx.bezierCurveTo(-6, -44, -12, -52 - nk, -16, -54 - nk);
      ctx.bezierCurveTo(-22, -52 - nk, -26, -44, -22, -34);
      ctx.closePath();
    }, rg(ctx, -14, -42, 2, 14, [0, '#f5a050'], [1, '#c04412']));

    // head
    const hy = -58 - nk;
    blob(ctx, () => ctx.arc(-16, hy, 16, 0, Math.PI * 2),
        rg(ctx, -16, hy - 4, 3, 18, [0, '#f5a050'], [0.45, '#e86820'], [1, '#b83c10']));

    // far ear
    ctx.fillStyle = '#c04010';
    ctx.beginPath();
    ctx.moveTo(-26, hy - 12);
    ctx.lineTo(-30, hy - 36);
    ctx.lineTo(-14, hy - 12);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(18,5,2,0.78)';
    ctx.beginPath();
    ctx.moveTo(-25, hy - 13);
    ctx.lineTo(-28, hy - 32);
    ctx.lineTo(-16, hy - 13);
    ctx.closePath();
    ctx.fill();

    // near ear
    ctx.fillStyle = '#e06828';
    ctx.beginPath();
    ctx.moveTo(-10, hy - 12);
    ctx.lineTo(-12, hy - 36);
    ctx.lineTo(-1, hy - 12);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(18,5,2,0.78)';
    ctx.beginPath();
    ctx.moveTo(-10, hy - 13);
    ctx.lineTo(-11, hy - 32);
    ctx.lineTo(-3, hy - 13);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(210,120,100,0.6)';
    ctx.beginPath();
    ctx.moveTo(-9, hy - 14);
    ctx.lineTo(-10, hy - 29);
    ctx.lineTo(-4, hy - 14);
    ctx.closePath();
    ctx.fill();

    // cheek ruff
    blob(ctx, () => ctx.ellipse(-18, hy + 6, 14, 9, -0.1, 0, Math.PI * 2),
        rg(ctx, -18, hy + 4, 2, 14, [0, '#fdecd8'], [0.6, '#f5d4a8'], [1, 'rgba(240,200,140,0)']));

    // muzzle
    blob(ctx, () => ctx.ellipse(-28, hy + 2, 11, 8, -0.12, 0, Math.PI * 2),
        rg(ctx, -26, hy + 1, 1, 13, [0, '#fde8c8'], [0.6, '#f5cfa0'], [1, '#d8a068']));

    // nose
    ctx.fillStyle = '#1a0804';
    ctx.beginPath();
    ctx.arc(-36, hy + 2, 3.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.beginPath();
    ctx.arc(-35.5, hy + 1.2, 1.1, 0, Math.PI * 2);
    ctx.fill();

    // eye: sclera glow, iris, pupil, catchlights
    blob(ctx, () => ctx.arc(-8, hy - 4, 5.5, 0, Math.PI * 2),
        rg(ctx, -8, hy - 4, 0, 5.5, [0, 'rgba(255,245,220,0.6)'], [1, 'rgba(255,245,220,0)']));
    ctx.fillStyle = '#1a0804';
    ctx.beginPath();
    ctx.arc(-8, hy - 4, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c06010';
    ctx.beginPath();
    ctx.arc(-8, hy - 4, 3.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0a0402';
    ctx.beginPath();
    ctx.ellipse(-8, hy - 4, 1.2, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.beginPath();
    ctx.arc(-6.8, hy - 5.5, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-9.5, hy - 2.5, 0.7, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * trigger an eye transition (either opening or closing)
   */
  _triggerEyeTransition() {
    const {fox} = this.scene;
    if (fox.phase === 'idle' && fox.poseBlend < 0.05) {
      fox.eyeTransitionT = 0;
    }
  }
}
