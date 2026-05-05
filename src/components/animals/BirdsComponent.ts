import {DrawComponent} from '@/core/DrawComponent';
import {getTreeTopPos} from '@/components/trees/TreeComponent';
import {prob, rnd} from '@/utils';
import {Subscriptions} from '@/core/Subscriptions';
import type {ValueChange} from '@/event/ValueChange';

interface PerchedBird {
    treeIdx: number;
    offset: number;
    side: number;
}

interface FlyingBird {
    x: number;
    y: number;
    vx: number;
    vy: number;
    flapT: number;
    flapSpeed: number;
    scale: number;
    life?: number;
}

/**
 * render flying birds, perched birds, and startled birds.
 */
export class BirdsComponent extends DrawComponent {
    static COMPONENT_NAME = 'BirdsComponent';

    private perchedBirds: PerchedBird[] = [];
    private windStartledBirds: Required<FlyingBird>[] = [];
    private flyingBirds: FlyingBird[] = [];

    override getName() {
        return BirdsComponent.COMPONENT_NAME;
    }

    override initialise() {
        this.perchedBirds = [
            {treeIdx: 0, offset: -0.7, side: 1},
            {treeIdx: 2, offset: -0.6, side: -1},
            {treeIdx: 6, offset: -0.55, side: 1},
            {treeIdx: 7, offset: -0.65, side: -1},
            {treeIdx: 1, offset: -0.5, side: 1},
        ];
        this.windStartledBirds = [];
        this.generateFlyingBirds();

        this.eventBus.subscribe(Subscriptions.onWeatherChange(this.getName(), update => this.onWeatherChange(update)));
    }

    private generateFlyingBirds() {
        const length = this.scene.weather === 'wind' ? 3 : 12;
        this.flyingBirds = Array.from({length}, () => ({
            x: rnd(this.W),
            y: 20 + rnd(this.H * 0.25),
            vx: 0.4 + rnd(0.5),
            vy: 0,
            flapT: rnd(Math.PI * 2),
            flapSpeed: 0.08 + rnd(0.04),
            scale: 0.7 + rnd(0.5),
        }));
    }

    private onWeatherChange(update: ValueChange<string>) {
        const {weather, season, frame, specialEvent, trees} = update.state;

        if (weather === 'wind' || update.previous === 'wind') {
            this.generateFlyingBirds();
        }

        // if we transitioned into wind, startle the perched birds
        if (weather === 'wind') {
            this.perchedBirds.forEach(pb => {
                const tr = trees[pb.treeIdx]!;
                const top = getTreeTopPos(tr, weather, season, specialEvent, frame);
                this.windStartledBirds.push({
                    x: top.x + pb.offset * tr.r * 0.5,
                    y: top.y,
                    vx: (3 + rnd(4)) * (prob(0.5) ? 1 : -1),
                    vy: -(2 + rnd(2)),
                    flapT: 0,
                    flapSpeed: 0.15,
                    scale: 0.8 + rnd(0.3),
                    life: 0,
                });
            });
        }
    }

    override tick() {
        this.windStartledBirds = this.windStartledBirds.filter(b => {
            b.x += b.vx;
            b.y += b.vy;
            b.vy += 0.05;
            b.flapT += b.flapSpeed;
            b.life++;
            return !(b.life > 200 || b.x < -50 || b.x > this.W + 50 || b.y < -50);
        });

        if (this.areBirdsActive()) {
            const M = this.scene.weather === 'wind' ? 4.5 : 1;
            this.flyingBirds.forEach(b => {
                b.x += b.vx * M;
                b.flapT += b.flapSpeed;
                b.y += Math.sin(b.flapT * 0.2) * 0.3;
                if (b.x > this.W + 30) {
                    b.x = -30;
                    b.y = 20 + rnd(this.H * 0.22);
                }
            });
        }
    }

    override draw() {
        const {ctx} = this;
        const {weather, season, frame, specialEvent, trees} = this.scene;

        this.windStartledBirds.forEach(b => this.drawFlyingBird(b.x, b.y, b.flapT, b.scale));

        if (this.areBirdsActive()) {
            // perched birds on tree tops
            this.perchedBirds.forEach(pb => {
                const tr = trees[pb.treeIdx]!;
                if (season === 'winter' && tr.type !== 'pine') return;

                const top = getTreeTopPos(tr, weather, season, specialEvent, frame);
                const px = top.x + pb.offset * tr.r * 0.5;
                const py = top.y + Math.sin(frame * 0.03 + pb.treeIdx) * 0.8;
                const windE = (weather === 'wind' || weather === 'storm')
                    ? Math.sin(frame * 0.06 + tr.ph) * 10 : 0;
                const lean = (Math.sin(frame * tr.sway + tr.ph) * 5 + windE) * 0.008;
                ctx.save();
                ctx.translate(px, py);
                ctx.rotate(lean);
                ctx.translate(-px, -py);
                this.drawPerchBird(px, py, pb.side);
                ctx.restore();
            });

            this.flyingBirds.forEach(b => this.drawFlyingBird(b.x, b.y, b.flapT, b.scale));
        }
    }

    private areBirdsActive() {
        const {season, weather, specialEvent} = this.scene;
        if (season === 'winter') return false;
        if (this.scene.timeOfDay !== 'day') return false;
        if (weather === 'storm') return false;
        if (specialEvent === 'eclipse') return false;
        return true;
    }

    private drawFlyingBird(x: number, y: number, flapT: number, sc: number) {
        const {ctx} = this;
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(sc, sc);
        const wing = Math.sin(flapT) * 12;
        ctx.strokeStyle = 'rgba(30,20,10,0.7)';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-14, wing * 0.5);
        ctx.quadraticCurveTo(-7, wing, 0, 0);
        ctx.quadraticCurveTo(7, wing, 14, wing * 0.5);
        ctx.stroke();
        ctx.restore();
    }

    private drawPerchBird(x: number, y: number, facing: number) {
        const {ctx} = this;
        ctx.save();
        ctx.translate(x, y);
        if (facing < 0) ctx.scale(-1, 1);
        ctx.fillStyle = '#2a1a10';
        ctx.beginPath();
        ctx.ellipse(0, 0, 7, 5, 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#c84010';
        ctx.beginPath();
        ctx.ellipse(2, 1, 4, 3, 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1a1008';
        ctx.beginPath();
        ctx.arc(-5, -4, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-6, -4.5, 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-6, -4.5, 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#888';
        ctx.beginPath();
        ctx.moveTo(-9, -4);
        ctx.lineTo(-12, -3.5);
        ctx.lineTo(-9, -3);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#1a1008';
        ctx.beginPath();
        ctx.moveTo(7, 1);
        ctx.lineTo(14, 0);
        ctx.lineTo(14, 3);
        ctx.lineTo(7, 3);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#5a3a20';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-2, 4);
        ctx.lineTo(-2, 9);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(2, 4);
        ctx.lineTo(2, 9);
        ctx.stroke();
        ctx.restore();
    }

    /**
     * add a startled bird to the screen at the given position
     */
    spawnStartledBird(x: number, y: number) {
        if (!this.areBirdsActive()) return;
        this.windStartledBirds.push({
            x,
            y: y * 0.5,
            vx: (2 + rnd(3)) * (prob(0.5) ? 1 : -1),
            vy: -(3 + rnd(2)),
            flapT: 0,
            flapSpeed: 0.18,
            scale: 0.8 + rnd(0.3),
            life: 0,
        });
    }
}
