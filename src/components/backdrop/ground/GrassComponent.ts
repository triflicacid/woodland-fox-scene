import {DrawComponent} from '@/core/DrawComponent';

/**
 * render grass blades in foreground.
 * withers and droops during solar eclipse.
 */
export class GrassComponent extends DrawComponent {
    public static COMPONENT_NAME = 'GrassComponent';

    public override getName() {
        return GrassComponent.COMPONENT_NAME;
    }

    public override draw() {
        const {ctx, W, H} = this;
        const {season, weather, frame, specialEvent, groundY: y} = this.scene;

        if (season === 'winter') {
            for (let gx = 10; gx < W; gx += 28) {
                ctx.strokeStyle = 'rgba(180,200,220,0.5)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(gx, y);
                ctx.lineTo(gx, y - 12);
                ctx.stroke();
            }
            return;
        }

        const wilting = specialEvent === 'eclipse';
        const p = this.scene.pal();
        const wsh = weather === 'wind'
            ? Math.sin(frame * 0.04) * 10
            : weather === 'storm' ? Math.sin(frame * 0.06) * 14 : 0;

        for (let gx = 10; gx < W; gx += 18) {
            const sw = Math.sin(frame * 0.018 + gx * 0.07) * 3 + wsh;

            if (wilting) {
                // drooping blades - tips curve down toward ground
                const droop = Math.sin(gx * 0.08) * 4;
                ctx.strokeStyle = `hsl(${p.gH - 15},${p.gSat - 20}%,${p.gL - 3}%)`;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(gx, H - 16);
                ctx.bezierCurveTo(gx + droop, H - 26, gx + droop * 2.5, H - 22, gx + droop * 3, H - 18);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(gx + 7, H - 18);
                ctx.bezierCurveTo(gx + 7 + droop * 0.8, H - 24, gx + 7 + droop * 1.8, H - 21, gx + 7 + droop * 2.2, H - 17);
                ctx.stroke();
            } else {
                // normal upright blades
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
        }
    }
}
