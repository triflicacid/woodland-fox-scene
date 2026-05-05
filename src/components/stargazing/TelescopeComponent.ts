import {DrawComponent} from '@/core/DrawComponent';
import {lerp, rnd, rndf} from '@/utils';
import type {Season} from '@/config';

type TripodFoot = [number, number];

const TRIPOD_FEET: TripodFoot[] = [[-22, 28], [0, 32], [22, 28]];

/**
 * draws a telescope on the ground to the right of the fox.
 * when stargazing at night, slowly pans around as if someone is observing.
 */
export class TelescopeComponent extends DrawComponent {
    static COMPONENT_NAME = 'TelescopeComponent';

    // position relative to fox
    private readonly offsetX = 110;
    private readonly offsetY = 50;

    // panning state - target and current angles
    private panAngle = 0.55;
    private panTarget = 0.55;
    private panTimer = 0;
    private panX = 0;
    private panXTarget = 0;
    private panXTimer = 0;

    override getName() {
        return TelescopeComponent.COMPONENT_NAME;
    }

    override isEnabled() {
        return this.scene.stargazing;
    }

    override tick() {
        const {todBlend, weather} = this.scene;
        const observing = todBlend < 0.35 && (weather === 'clear' || weather === 'wind');

        if (observing) {
            // slowly drift toward a new target angle
            this.panTimer--;
            if (this.panTimer <= 0) {
                this.panTarget = 0.35 + rnd(0.45);
                this.panTimer = 180 + Math.floor(rnd(240));
            }
            this.panXTimer--;
            if (this.panXTimer <= 0) {
                this.panXTarget = rndf(Math.PI / 5); // small left/right swing, in rad
                this.panXTimer = 120 + Math.floor(rnd(180));
            }
            // smooth lerp toward targets
            this.panAngle = lerp(this.panAngle, this.panTarget, 0.008);
            this.panX = lerp(this.panX, this.panXTarget, 0.006);
        }
    }

    override draw() {
        const {ctx} = this;
        const {fox} = this.scene;
        const x = fox.x + this.offsetX;
        const y = fox.y + this.offsetY;

        ctx.save();
        ctx.translate(x, y);
        this.drawTelescope(this.panAngle);
        ctx.restore();
    }

    /**
     * draw the telescope at the origin, angled by tubeAngle.
     */
    private drawTelescope(tubeAngle: number) {
        const {ctx} = this;
        const {season} = this.scene;

        // tripod legs
        ctx.strokeStyle = '#a0a8b0';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        // three legs spreading from mount base
        TRIPOD_FEET.forEach(([lx, ly]) => {
            ctx.beginPath();
            ctx.moveTo(0, -8);
            ctx.lineTo(lx, ly);
            ctx.stroke();
        });

        // feet with furrows in ground
        ctx.strokeStyle = '#808890';
        ctx.lineWidth = 2;
        TRIPOD_FEET.forEach(([lx, ly]) => {
            ctx.save();
            ctx.translate(lx, ly);

            ctx.beginPath();
            ctx.moveTo(-5, 0);
            ctx.lineTo(5, 0);
            ctx.stroke();

            this.drawFootDetail(season);

            ctx.restore();
        });

        // cross brace
        ctx.strokeStyle = '#9098a0';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-15, 18);
        ctx.lineTo(15, 18);
        ctx.stroke();

        // mount head
        ctx.fillStyle = '#c8cdd2';
        ctx.beginPath();
        ctx.arc(0, -8, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#e0e4e8';
        ctx.beginPath();
        ctx.arc(-1, -9, 5, 0, Math.PI * 2);
        ctx.fill();

        // tube assembly (this rotates around mount)
        const tubeLen = 62;
        const tubeR = 9;
        ctx.save();
        ctx.translate(tubeLen * 0.35, -14);
        ctx.rotate(tubeAngle);
        ctx.scale(Math.cos(this.panX), 1);

        // finder scope (small secondary tube on top)
        ctx.save();
        ctx.translate(-tubeLen * 0.25, -tubeR - 3);
        ctx.fillStyle = '#b0b8c0';
        ctx.beginPath();
        ctx.roundRect(-3, -10, 6, 12, 2);
        ctx.fill();
        // finder lens
        ctx.fillStyle = '#404858';
        ctx.beginPath();
        ctx.arc(0, -10, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(100,140,180,0.4)';
        ctx.beginPath();
        ctx.arc(0, -10, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // focuser knobs
        ctx.fillStyle = '#9098a0';
        ctx.beginPath();
        ctx.ellipse(-tubeLen * 0.6, tubeR + 2, 5, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#b0b8c0';
        ctx.beginPath();
        ctx.ellipse(tubeLen * 0.6, tubeR + 2, 3, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // main tube body
        const tubeGrad = ctx.createLinearGradient(0, -tubeR, 0, tubeR);
        tubeGrad.addColorStop(0, '#e8ecf0');
        tubeGrad.addColorStop(0.3, '#f4f6f8');
        tubeGrad.addColorStop(0.7, '#d8dce0');
        tubeGrad.addColorStop(1, '#b0b8c0');
        ctx.fillStyle = tubeGrad;
        ctx.beginPath();
        ctx.roundRect(-tubeLen, -tubeR, tubeLen, tubeR * 2, 4);
        ctx.fill();
        // tube outline
        ctx.strokeStyle = '#9098a0';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // tube bands / rings
        [-0.2, -0.5, -0.8].forEach(t => {
            const bx = tubeLen * t;
            ctx.fillStyle = '#c0c8d0';
            ctx.fillRect(bx - 2, -tubeR, 4, tubeR * 2);
            ctx.strokeStyle = '#909aa0';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(bx - 2, -tubeR, 4, tubeR * 2);
        });

        // highlight stripe along top
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.beginPath();
        ctx.roundRect(-tubeLen + 4, -tubeR + 1, tubeLen - 8, tubeR * 0.55, 2);
        ctx.fill();

        // objective lens (far/left end - toward sky)
        const lensGrad = ctx.createRadialGradient(2, 0, 0, 2, 0, tubeR);
        lensGrad.addColorStop(0, 'rgba(80,120,180,0.5)');
        lensGrad.addColorStop(0.6, 'rgba(40,80,140,0.7)');
        lensGrad.addColorStop(1, '#1a2a3a');
        ctx.fillStyle = lensGrad;
        ctx.beginPath();
        ctx.arc(-tubeLen, 0, tubeR, 0, Math.PI * 2);
        ctx.fill();
        // lens rim
        ctx.strokeStyle = '#808890';
        ctx.lineWidth = 2;
        ctx.stroke();
        // lens reflection
        ctx.fillStyle = 'rgba(120,160,220,0.35)';
        ctx.beginPath();
        ctx.arc(-2, -3, tubeR * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // eyepiece end (right end)
        ctx.fillStyle = '#404850';
        ctx.beginPath();
        ctx.roundRect(0, -tubeR * 0.65, 10, tubeR * 1.3, [0, 3, 3, 0]);
        ctx.fill();
        // eyepiece barrel
        ctx.fillStyle = '#303840';
        ctx.beginPath();
        ctx.roundRect(8, -tubeR * 0.4, 8, tubeR * 0.8, 2);
        ctx.fill();
        // eyepiece lens
        ctx.fillStyle = '#1a2030';
        ctx.beginPath();
        ctx.arc(16, 0, tubeR * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(80,120,180,0.3)';
        ctx.beginPath();
        ctx.arc(15, -1, tubeR * 0.18, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore(); // tube rotation
    }

    /**
     * draw season-appropriate ground detail around each tripod foot.
     * must be called within the foot's local transform.
     */
    private drawFootDetail(season: Season) {
        const {ctx} = this;

        if (season === 'winter') {
            // small snow furrow pushed up around each foot
            ctx.fillStyle = 'rgba(225,238,252,0.9)';
            ctx.beginPath();
            ctx.ellipse(0, 0, 7, 3, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.beginPath();
            ctx.ellipse(-1, -1, 4, 1.5, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (season === 'spring' || season === 'summer') {
            // small indent/furrow where the foot has pressed into the ground
            ctx.fillStyle = season === 'spring' ? 'rgba(30,80,20,0.5)' : 'rgba(20,70,15,0.45)';
            ctx.beginPath();
            ctx.ellipse(0, 0, 6, 2.5, 0, 0, Math.PI * 2);
            ctx.fill();
            // darker centre crease
            ctx.fillStyle = season === 'spring' ? 'rgba(15,50,10,0.6)' : 'rgba(10,45,8,0.6)';
            ctx.beginPath();
            ctx.ellipse(0, 0, 3, 1, 0, 0, Math.PI * 2);
            ctx.fill();
            // slight raised edge highlight
            ctx.strokeStyle = season === 'spring' ? 'rgba(60,120,30,0.4)' : 'rgba(40,110,20,0.4)';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.ellipse(0, 0, 6, 2.5, 0, 0, Math.PI * 2);
            ctx.stroke();
        } else if (season === 'autumn') {
            // small fallen leaves scattered around foot
            [-5, 0, 4].forEach((ox, i) => {
                const hue = [18, 28, 38][i]!;
                ctx.save();
                ctx.translate(ox, (i % 2) * 2);
                ctx.rotate(i * 0.6);
                ctx.fillStyle = `hsl(${hue}, 72%, 44%)`;
                ctx.globalAlpha = 0.85;
                ctx.beginPath();
                ctx.ellipse(0, 0, 4, 2.5, 0.2, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });
        }
    }
}