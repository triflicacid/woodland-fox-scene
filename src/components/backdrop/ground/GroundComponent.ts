import {DrawComponent} from '@/core/DrawComponent';

/**
 * render the ground
 */
export class GroundComponent extends DrawComponent {
    static COMPONENT_NAME = 'GroundComponent';

    override getName() {
        return GroundComponent.COMPONENT_NAME;
    }

    override draw() {
        const {ctx, W, H} = this;
        const {season, groundY} = this.scene;
        const p = this.scene.pal();

        const gnd = ctx.createLinearGradient(0, groundY, 0, H);
        gnd.addColorStop(0, p.gnd0);
        gnd.addColorStop(0.4, p.gnd1);
        gnd.addColorStop(1, p.gnd2);
        ctx.fillStyle = gnd;
        ctx.fillRect(0, groundY, W, H * 0.38);

        if (season === 'winter') {
            ctx.fillStyle = 'rgba(235,245,255,0.93)';
            ctx.fillRect(0, groundY, W, H * 0.38);
            ctx.fillStyle = '#e8f2fa';
            ctx.beginPath();
            ctx.moveTo(0, groundY);
            for (let sx = 0; sx <= W; sx += 20) {
                ctx.lineTo(sx, groundY + Math.sin(sx * 0.05) * 4 + Math.sin(sx * 0.11 + 1) * 3);
            }
            ctx.lineTo(W, groundY);
            ctx.closePath();
            ctx.fill();
        }

        // ground line
        ctx.strokeStyle = season === 'winter' ? '#c8dcea' : season === 'autumn' ? '#5a3a1a' : '#2a5e1a';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, groundY + 1);
        ctx.lineTo(W, groundY + 1);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
}
