import {blob, clamp, eio, eo, lerp, lg, prob, rg} from '@/utils';
import {PROBABILITY} from '@/config';
import {DrawComponent} from '@/core/DrawComponent';
import {Events} from '@/core/Events';
import {Subscriptions} from '@/core/Subscriptions';
import type {MusicalNotesComponent} from '@/components/birthday/MusicalNotesComponent';
import type {EventBus} from '@/event/EventBus';
import type {SceneState} from '@/core/SceneState';

type FoxPhase =
    | 'idle' | 'standup' | 'stretch' | 'shake' | 'spin' | 'curling'
    | 'bunny_standup' | 'bunny_curling'
    | 'wander_out' | 'wander_sniff' | 'wander_in'
    | 'singing' | 'eclipse_watch';

const FOX_PHASES: Record<Exclude<FoxPhase, 'idle' | 'singing' | 'eclipse_watch'>, { f: number }> = {
    standup: {f: 80},
    stretch: {f: 80},
    shake: {f: 90},
    spin: {f: 110},
    curling: {f: 80},
    bunny_standup: {f: 70},
    bunny_curling: {f: 85},
    wander_out: {f: 120},
    wander_sniff: {f: 80},
    wander_in: {f: 120},
};

interface QuiverLine {
    ox: number;
    oy: number;
    angle: number;
    len: number;
}

/**
 * FoxComponent manages fox animation state ticking and all fox drawing.
 * also handles the bunny interaction sequence.
 */
export class FoxComponent extends DrawComponent {
    public static COMPONENT_NAME = 'FoxComponent';

    private x = 0;
    private y = 0;
    private phase: FoxPhase = 'idle';
    private phaseT = 0;
    private poseBlend = 0;
    private stretchBlend = 0;
    private spinAngle = 0;
    private tailWag = 0;
    private wanderX = 0;
    private rainTuck = 0;
    private breathT = 0;
    private yawnT = -1;
    private grumbleT = -1;
    private earTwitchT = -1;
    private earTwitchSide = 0;
    private snowLevel = 0;
    private shiverT = 0;
    private eyeTransitionT = -1;
    private singingMouthT: number | undefined;
    private quiverT = -1;
    private facingLeft = false;
    private asleep = true;
    private readonly notes: MusicalNotesComponent;

    public constructor(eventBus: EventBus, scene: SceneState, ctx: CanvasRenderingContext2D, W: number, H: number, notes: MusicalNotesComponent) {
        super(eventBus, scene, ctx, W, H);
        this.notes = notes;
    }

    public override getName() {
        return FoxComponent.COMPONENT_NAME;
    }

    public override initialise() {
        this.x = this.scene.fox.x;
        this.y = this.scene.fox.y;
        this.wanderX = this.x;

        this.eventBus.subscribe(Subscriptions.onFireworkBang(this.getName(), ({loud}) => {
            if (loud && prob(PROBABILITY.FIREWORK_BANG_REACTION)) {
                this.earTwitchT = 0;
                this.earTwitchSide = prob(0.5) ? 1 : -1;
                if (prob(PROBABILITY.STARTLE_TRIGGERS_EYE)) this.triggerEyeTransition();
            }
        }));
        this.eventBus.subscribe(Subscriptions.onLightningStrike(this.getName(), ({superBolt}) => {
            if (superBolt && prob(PROBABILITY.SUPER_BOLT_REACTION)) {
                this.earTwitchT = 0;
                this.earTwitchSide = prob(0.5) ? 1 : -1;
                if (prob(PROBABILITY.STARTLE_TRIGGERS_EYE)) this.triggerEyeTransition();
            }
        }));
        this.eventBus.subscribe(Subscriptions.onCharacterAction(this.getName(), ({character, action}) => {
            this.onCharacterAction(character, action);
        }));
        this.eventBus.subscribe(Subscriptions.onMothronDive(this.getName(), () => {
            this.triggerEyeTransition();
            this.quiverT = 0;
        }));
    }

    private onCharacterAction(character: string, action: string) {
        if (character === 'guyfawkes') {
            if (action === 'watch.start') {
                this.asleep = false;
                this.eyeTransitionT = 0;
            } else if (action === 'watch.end') {
                this.asleep = true;
                this.eyeTransitionT = 0;
            }
        } else if (character === 'bunny') {
            if (action === 'nuzzle.prepare') {
                this.phase = 'bunny_standup';
                this.phaseT = 0;
                this.poseBlend = 0;
                this.facingLeft = true;
                this.eventBus.dispatch(Events.statusText(this.getName(), 'The fox stirs...'));
            } else if (action === 'nuzzle.end') {
                this.phase = 'bunny_curling';
                this.phaseT = 0;
                this.facingLeft = false;
                this.eventBus.dispatch(Events.statusText(this.getName(), 'The fox drifts off...'));
            }
        }
    }

    public override tick() {
        // birthday management
        if (this.scene.specialEvent === 'birthday') {
            if (this.phase === 'idle') {
                this.phase = 'singing';
                this.poseBlend = 1;
                this.asleep = false;
                this.singingMouthT = this.scene.frame;
                this.eventBus.dispatch(Events.characterAction(this.getName(), 'fox', 'sing.start'));
            } else if (this.phase === 'singing') {
                this.singingMouthT = this.scene.frame;
                if (prob(PROBABILITY.FOX_SPAWN_NOTE)) {
                    this.notes.spawnNote(this.x - 35, this.y - 95);
                }
            }
        } else if (this.phase === 'singing') {
            this.phase = 'curling';
            this.phaseT = 0;
            this.asleep = true;
            this.singingMouthT = undefined;
            this.eventBus.dispatch(Events.characterAction(this.getName(), 'fox', 'sing.end'));
        }

        // eclipse management
        if (this.scene.specialEvent === 'eclipse') {
            if (this.phase === 'idle') {
                this.phase = 'eclipse_watch';
                this.poseBlend = 1;
                this.asleep = false;
                this.quiverT = 0;
                this.eventBus.dispatch(Events.statusText(this.getName(), 'The sky darkens... the fox stirs nervously...'));
                this.eventBus.dispatch(Events.characterAction(this.getName(), 'fox', 'eclipse_watch.start'));
            }
        } else if (this.phase === 'eclipse_watch') {
            this.phase = 'curling';
            this.phaseT = 0;
            this.asleep = true;
            this.eventBus.dispatch(Events.characterAction(this.getName(), 'fox', 'eclipse_watch.end'));
        }

        // passive idle behaviours
        if (this.phase === 'idle' && this.poseBlend < 0.01) {
            if (this.asleep && this.yawnT < 0 && prob(PROBABILITY.FOX_YAWN)) {
                this.yawnT = 0;
                this.eventBus.dispatch(Events.characterAction(this.getName(), 'fox', 'yawn'));
            }
            if (this.yawnT >= 0) {
                this.yawnT++;
                if (this.yawnT >= 80) this.yawnT = -1;
            }
            if (this.earTwitchT < 0 && prob(PROBABILITY.EAR_TWITCH)) {
                this.earTwitchT = 0;
                this.earTwitchSide = prob(0.5) ? 1 : -1;
            }
            if (this.earTwitchT >= 0) {
                this.earTwitchT++;
                if (this.earTwitchT >= 20) this.earTwitchT = -1;
            }
        }

        // randomly blink if awake
        if (!this.asleep && this.eyeTransitionT < 0 && prob(PROBABILITY.FOX_BLINK)) {
            this.triggerEyeTransition();
        }

        if (this.grumbleT >= 0) {
            this.grumbleT++;
            if (this.grumbleT >= 40) this.grumbleT = -1;
        }

        if (this.eyeTransitionT >= 0) {
            this.eyeTransitionT++;
            if (this.eyeTransitionT >= 50) this.eyeTransitionT = -1;
        }

        if (this.quiverT >= 0) {
            this.quiverT++;
            if (this.quiverT >= 60) this.quiverT = -1;
        }

        if (this.phase === 'idle' || this.phase === 'singing' || this.phase === 'eclipse_watch') return;

        this.phaseT++;
        const cfg = FOX_PHASES[this.phase];
        if (!cfg) return;
        const t = clamp(this.phaseT / cfg.f, 0, 1);

        if (this.phase === 'standup') {
            this.poseBlend = eio(t);
            this.stretchBlend = 0;
            if (this.phaseT >= cfg.f) {
                this.phase = 'stretch';
                this.phaseT = 0;
                this.eventBus.dispatch(Events.characterAction(this.getName(), 'fox', 'wake'));
            }
        } else if (this.phase === 'stretch') {
            this.poseBlend = 1;
            this.stretchBlend = Math.sin(t * Math.PI);
            if (this.phaseT >= cfg.f) {
                this.phase = 'shake';
                this.phaseT = 0;
                this.stretchBlend = 0;
            }
        } else if (this.phase === 'shake') {
            this.poseBlend = 1;
            this.tailWag = Math.sin(this.phaseT * 0.25) * 0.55;
            if (this.phaseT >= cfg.f) {
                this.phase = 'spin';
                this.phaseT = 0;
                this.tailWag = 0;
            }
        } else if (this.phase === 'spin') {
            this.poseBlend = 1;
            this.spinAngle = eio(t) * Math.PI * 2;
            if (this.phaseT >= cfg.f) {
                this.phase = 'curling';
                this.phaseT = 0;
                this.spinAngle = 0;
            }
        } else if (this.phase === 'curling') {
            this.poseBlend = 1 - eio(t);
            if (this.phaseT >= cfg.f) {
                if (this.scene.specialEvent === 'birthday') {
                    this.phase = 'singing';
                    this.poseBlend = 1;
                    this.asleep = false;
                } else if (this.scene.specialEvent === 'eclipse') {
                    this.phase = 'eclipse_watch';
                    this.poseBlend = 1;
                    this.asleep = false;
                } else {
                    this.phase = 'idle';
                    this.poseBlend = 0;
                    this.eventBus.dispatch(Events.statusText(this.getName(), 'Curled up, fast asleep...'));
                    this.eventBus.dispatch(Events.setMainButtons(this.getName(), true));
                    this.eventBus.dispatch(Events.characterAction(this.getName(), 'fox', 'sleep'));
                }
            }
        } else if (this.phase === 'bunny_standup') {
            this.poseBlend = eio(t);
            this.stretchBlend = 0;
            if (this.phaseT >= cfg.f) this.phase = 'idle';
        } else if (this.phase === 'bunny_curling') {
            this.poseBlend = 1 - eio(t);
            if (this.phaseT >= cfg.f) {
                this.phase = 'idle';
                this.poseBlend = 0;
            }
        } else if (this.phase === 'wander_out') {
            this.poseBlend = 1;
            this.wanderX = lerp(this.x, this.x + 180, eo(t));
            if (this.phaseT >= cfg.f) {
                this.phase = 'wander_sniff';
                this.phaseT = 0;
                this.eventBus.dispatch(Events.characterAction(this.getName(), 'fox', 'wander.start'));
            }
        } else if (this.phase === 'wander_sniff') {
            this.wanderX = this.x + 180 + Math.sin(this.phaseT * 0.05) * 15;
            if (this.phaseT >= cfg.f) {
                this.phase = 'wander_in';
                this.phaseT = 0;
            }
        } else if (this.phase === 'wander_in') {
            this.wanderX = lerp(this.x + 180, this.x, eo(t));
            if (this.phaseT >= cfg.f) {
                this.phase = 'curling';
                this.phaseT = 0;
                this.wanderX = this.x;
                this.eventBus.dispatch(Events.statusText(this.getName(), 'Back home, curling up...'));
                this.eventBus.dispatch(Events.characterAction(this.getName(), 'fox', 'wander.end'));
            }
        }
    }

    public override draw() {
        const {ctx} = this;
        const {season, weather, frame, todBlend} = this.scene;

        let fx = this.x;
        if (this.phase === 'wander_out' || this.phase === 'wander_sniff' || this.phase === 'wander_in') {
            fx = this.wanderX;
        }

        // shiver in cold weather while asleep
        const shivering = this.poseBlend < 0.05 &&
            (season === 'winter' || weather === 'storm' || weather === 'rain' || weather === 'snow');
        if (shivering) this.shiverT++;
        const sx = shivering ? Math.sin(this.shiverT * 1.9) * 0.6 : 0;
        const sy = shivering ? Math.sin(this.shiverT * 2.7) * 0.3 : 0;

        // snow accumulation on sleeping fox
        if (weather === 'snow' && this.poseBlend < 0.05) this.snowLevel = Math.min(1, this.snowLevel + 0.00025);
        else this.snowLevel = Math.max(0, this.snowLevel - 0.0012);

        ctx.save();
        ctx.translate(fx + sx, this.y + sy);
        if (this.spinAngle !== 0) ctx.scale(Math.cos(this.spinAngle), 1 - Math.abs(Math.sin(this.spinAngle)) * 0.08);

        const b = this.poseBlend;
        const fl = this.facingLeft || !(this.phase === 'wander_out' || this.phase === 'wander_sniff');

        if (b < 0.01) {
            this.drawCurled(frame, weather, todBlend);
        } else if (b > 0.99) {
            this.drawStanding(fl);
        } else {
            ctx.save();
            ctx.globalAlpha = 1 - b;
            this.drawCurled(frame, weather, todBlend);
            ctx.restore();
            ctx.save();
            ctx.globalAlpha = b;
            this.drawStanding(fl);
            ctx.restore();
        }
        ctx.restore();

        // winter breath puff
        if (season === 'winter' && b < 0.05) {
            this.breathT++;
            if (this.breathT % 90 < 22) {
                const bt = (this.breathT % 90) / 22;
                ctx.save();
                ctx.globalAlpha = 0.25 * (1 - bt);
                ctx.fillStyle = '#ddeeff';
                ctx.beginPath();
                ctx.arc(fx - 40 + bt * 10, this.y - 22 - bt * 7, 2 + bt * 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }
    }

    private drawCurled(frame: number, weather: string, todBlend: number) {
        const {ctx} = this;
        const tuck = (weather === 'rain' || weather === 'storm') ? 1 : 0;
        this.rainTuck = lerp(this.rainTuck, tuck, 0.05);
        const bob = Math.sin(frame * 0.038) * lerp(1.4, 0.25, this.rainTuck);

        ctx.save();
        ctx.translate(0, bob);
        ctx.scale(1 + this.rainTuck * 0.04, 1 - this.rainTuck * 0.03);

        blob(ctx, () => ctx.ellipse(2, 6, 42, 9, 0, 0, Math.PI * 2), 'rgba(0,0,0,0.18)');

        blob(ctx, () => {
            ctx.moveTo(28, -2);
            ctx.bezierCurveTo(62, -2, 66, -32, 48, -52);
            ctx.bezierCurveTo(40, -62, 22, -58, 18, -48);
            ctx.bezierCurveTo(12, -36, 16, -18, 10, -8);
            ctx.bezierCurveTo(8, -2, 16, 0, 28, -2);
        }, rg(ctx, 38, -28, 4, 34, [0, '#f5a030'], [0.5, '#e06018'], [1, '#9a2c08']));

        blob(ctx, () => {
            ctx.moveTo(18, -48);
            ctx.bezierCurveTo(12, -62, 28, -70, 48, -52);
            ctx.bezierCurveTo(38, -58, 24, -54, 18, -48);
        }, rg(ctx, 32, -58, 2, 18, [0, '#ffffff'], [0.5, '#e8f5f0'], [1, '#b8ddd8']));

        blob(ctx, () => ctx.ellipse(0, -10, 38, 22, 0.12, 0, Math.PI * 2),
            rg(ctx, -4, -20, 3, 40, [0, '#f5a050'], [0.4, '#e86820'], [0.75, '#c04412'], [1, '#882408']));

        blob(ctx, () => ctx.ellipse(6, -5, 20, 15, 0.1, 0, Math.PI * 2),
            rg(ctx, 8, -2, 2, 20, [0, '#fdecd8'], [0.5, '#f8d4b0'], [1, '#e8b080']));

        blob(ctx, () => ctx.ellipse(-12, 4, 10, 5.5, 0.1, 0, Math.PI * 2),
            rg(ctx, -12, 4, 1, 10, [0, '#d85c18'], [1, '#882408']));
        blob(ctx, () => ctx.ellipse(-1, 5, 10, 5.5, 0.08, 0, Math.PI * 2),
            rg(ctx, -1, 5, 1, 10, [0, '#e06820'], [1, '#9a2c0a']));

        // toe lines
        ctx.strokeStyle = 'rgba(90,18,4,0.4)';
        ctx.lineWidth = 1;
        ctx.lineCap = 'round';
        ([[-5, 5], [-2, 5.5], [1, 6], [-12, 5], [-9, 5.5], [-6, 5.5]] as [number, number][]).forEach(([tx, ty]) => {
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
        const earOff = this.earTwitchT >= 0
            ? Math.sin(this.earTwitchT * 0.4) * 3 * this.earTwitchSide : 0;
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
        const eyeOpen = this.eyeOpenAmount();
        ctx.strokeStyle = '#4a1804';
        ctx.lineWidth = 1.5;
        if (eyeOpen > 0.1) {
            ctx.save();
            blob(ctx, () => ctx.arc(-22, -26 + hb, 4, 0, Math.PI * 2),
                rg(ctx, -22, -26 + hb, 0, 4, [0, 'rgba(255,245,220,0.6)'], [1, 'rgba(255,245,220,0)']));
            ctx.save();
            ctx.translate(-22, -26 + hb);
            ctx.scale(1, eyeOpen);
            ctx.fillStyle = '#c06010';
            ctx.beginPath();
            ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#0a0402';
            ctx.beginPath();
            ctx.ellipse(0, 0, 1, 2.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.beginPath();
            ctx.arc(1, -1, 1, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            ctx.restore();
        } else if (this.yawnT >= 0 && this.yawnT < 80) {
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
        if (this.yawnT >= 0 && this.yawnT < 80) {
            const yt = this.yawnT / 80;
            const mo = Math.sin(yt * Math.PI) * 7;
            ctx.fillStyle = '#5a0800';
            ctx.beginPath();
            ctx.ellipse(-38, -12 + hb, 4, mo * 0.55, 0.1, 0, Math.PI * 2);
            ctx.fill();
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
        if (this.grumbleT >= 0) {
            const gt = this.grumbleT / 40;
            ctx.save();
            ctx.globalAlpha = Math.sin(gt * Math.PI) * 0.9;
            ctx.fillStyle = '#ff4444';
            ctx.font = `bold ${10 + gt * 4}px sans-serif`;
            ctx.fillText('!', -8, -55 - gt * 14);
            ctx.restore();
        }

        // zzz sleep indicators (when asleep and at night)
        if (todBlend < 0.5 && this.phase === 'idle' && this.asleep) {
            ['z', 'z', 'Z'].forEach((z, i) => {
                ctx.globalAlpha = 0.45 + 0.3 * Math.sin(frame * 0.04 + i * 0.9 + Math.PI);
                ctx.fillStyle = 'rgba(180,210,255,0.9)';
                ctx.font = `bold ${10 + i * 3}px serif`;
                ctx.fillText(z, -2 - i * 6, -46 - i * 12);
            });
            ctx.globalAlpha = 1;
        }

        // snow piling up on sleeping fox
        if (this.snowLevel > 0.02) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(-40, 0);
            ctx.bezierCurveTo(-38, -44, 20, -44, 30, -16);
            ctx.lineTo(26, 0);
            ctx.closePath();
            ctx.clip();
            const d = this.snowLevel * 15;
            ctx.fillStyle = 'rgba(255,255,255,0.93)';
            ctx.beginPath();
            ctx.moveTo(-42, -44);
            for (let sx = -42; sx <= 32; sx += 5) {
                const lump = Math.sin(sx * 0.42 + frame * 0.01) * 1.8 * this.snowLevel;
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

    private drawStanding(facingLeft: boolean) {
        const {ctx} = this;
        const s = this.stretchBlend;
        const legLen = 34 + s * 14;
        const nk = s * 8;

        ctx.save();
        if (!facingLeft) ctx.scale(-1, 1);

        // birthday sway - whole body rocks side to side
        if (this.singingMouthT !== undefined) {
            const sway = Math.sin(this.singingMouthT * 0.07) * 6;
            ctx.translate(sway, 0);
            ctx.rotate(sway * 0.012);
        }

        blob(ctx, () => ctx.ellipse(0, 5, 44, 8, 0, 0, Math.PI * 2), 'rgba(0,0,0,0.18)');

        // tail with optional wag rotation
        ctx.save();
        ctx.translate(24, -18);
        ctx.rotate(this.tailWag);
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
        ([[14, -4], [8, -4], [-12, -8], [-6, -8]] as [number, number][]).forEach(([lx, ly], i) => {
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

        // eye
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

        // birthday singing mouth
        if (this.singingMouthT !== undefined) {
            const mouthOpen = Math.abs(Math.sin(this.singingMouthT * 0.12)) * 6;
            ctx.fillStyle = '#5a0800';
            ctx.beginPath();
            ctx.ellipse(-28, hy + 4, 5, mouthOpen * 0.6 + 1, -0.1, 0, Math.PI * 2);
            ctx.fill();
            if (mouthOpen > 3) {
                ctx.fillStyle = '#cc4444';
                ctx.beginPath();
                ctx.ellipse(-28, hy + 4 + mouthOpen * 0.3, 3, 2, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // scared quiver lines when eclipse_watch
        if (this.quiverT >= 0) {
            const qt = this.quiverT / 60;
            const alpha = Math.sin(qt * Math.PI) * 0.8;
            const jitter = Math.sin(this.quiverT * 1.8) * 2.5;

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = '#ff8040';
            ctx.lineWidth = 1.2;
            ctx.lineCap = 'round';

            const lines: QuiverLine[] = [
                {ox: -30, oy: -30, angle: -2.4, len: 8},
                {ox: -28, oy: -45, angle: -2.0, len: 6},
                {ox: 10, oy: -50, angle: -0.8, len: 7},
                {ox: 12, oy: -30, angle: -0.4, len: 6},
                {ox: -5, oy: -60, angle: -1.5, len: 9},
            ];

            lines.forEach((l, i) => {
                const wobble = Math.sin(this.quiverT * 0.6 + i) * 0.3;
                const a = l.angle + wobble;
                const sx = l.ox + jitter * (i % 2 === 0 ? 1 : -1);
                ctx.beginPath();
                ctx.moveTo(sx, l.oy);
                const mx = sx + Math.cos(a) * l.len * 0.5;
                const my = l.oy + Math.sin(a) * l.len * 0.5;
                ctx.lineTo(mx + jitter * 0.5, my);
                ctx.lineTo(mx + Math.cos(a + 0.5) * l.len * 0.5, my + Math.sin(a + 0.5) * l.len * 0.5);
                ctx.stroke();
            });

            ctx.restore();
        }

        ctx.restore();
    }

    /**
     * return the current eye openness from 0 (closed) to 1 (open).
     * handles transitions in both directions.
     */
    private eyeOpenAmount() {
        if (this.eyeTransitionT < 0) return this.asleep ? 0 : 1;
        const t = clamp(this.eyeTransitionT / 50, 0, 1);
        const curve = Math.sin(t * Math.PI); // bell curve - peaks at 0.5
        return this.asleep
            ? curve       // asleep: transitions open then back closed
            : 1 - curve;  // awake: transitions closed then back open (blink)
    }

    /**
     * trigger an eye transition (either opening or closing)
     */
    public triggerEyeTransition(force = false) {
        if (force || (this.phase === 'idle' && this.poseBlend < 0.05)) {
            this.eyeTransitionT = 0;
        }
    }

    /**
     * set us to be idle, cancels any actions or transitions.
     */
    public forceIdle() {
        this.phase = 'idle';
        this.phaseT = 0;
        this.poseBlend = 0;
        this.stretchBlend = 0;
        this.spinAngle = 0;
        this.tailWag = 0;
    }

    public triggerGrumble() {
        this.grumbleT = 0;
        this.earTwitchT = 0;
        this.earTwitchSide = 1;
        this.eventBus.dispatch(Events.statusText(this.getName(), 'The fox grumbles sleepily...'));
        this.eventBus.dispatch(Events.characterAction(this.getName(), 'fox', 'grumble'));
    }

    public triggerYawn() {
        if (this.phase === 'idle' && this.poseBlend < 0.05) {
            this.yawnT = 0;
            this.eventBus.dispatch(Events.statusText(this.getName(), 'The fox has a big yawn...'));
            this.eventBus.dispatch(Events.characterAction(this.getName(), 'fox', 'yawn'));
        }
    }

    public triggerEarTwitch() {
        this.earTwitchT = 0;
        this.earTwitchSide = Math.random() < 0.5 ? 1 : -1;
        this.eventBus.dispatch(Events.statusText(this.getName(), "The fox's ear twitches..."));
        this.eventBus.dispatch(Events.characterAction(this.getName(), 'fox', 'ear_twitch'));
    }

    public startWakeUpScene() {
        if (this.phase !== 'idle') return;
        this.phase = 'standup';
        this.phaseT = 0;
    }

    public startWanderScene() {
        if (this.phase !== 'idle') return;
        this.phase = 'wander_out';
        this.phaseT = 0;
        this.poseBlend = 1;
        this.wanderX = this.x;
    }

    public containsPoint(cx: number, cy: number) {
        return Math.abs(cx - this.getX()) < 46 && Math.abs(cy - (this.getY() - 15)) < 32;
    }

    public click() {
        if (this.phase === 'idle' && this.poseBlend < 0.05) this.triggerGrumble();
    }

    public isIdle() {
        return this.phase === 'idle';
    }

    public isAsleep() {
        return this.asleep;
    }

    public setAsleep(asleep: boolean) {
        this.asleep = asleep;
    }

    private getX() {
        const wandering = ['wander_out', 'wander_sniff', 'wander_in'].includes(this.phase);
        return wandering ? this.wanderX : this.x;
    }

    private getY() {
        return this.y;
    }
}
