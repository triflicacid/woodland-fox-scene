import {DrawComponent} from '@/core/DrawComponent';

/**
 * a simple folding stool, part of the stargazing setup.
 */
export class FoldingStoolComponent extends DrawComponent {
    static COMPONENT_NAME = 'FoldingStoolComponent';

    // offset from fox
    private readonly offsetX = 160;
    private readonly offsetY = 72;
    private readonly scale = 1.2;

    override getName() {
        return FoldingStoolComponent.COMPONENT_NAME;
    }

    override isEnabled() {
        return this.scene.stargazing;
    }

    override draw() {
        const {ctx} = this;
        const {fox} = this.scene;
        const x = fox.x + this.offsetX;
        const y = fox.y + this.offsetY;

        ctx.save();
        ctx.translate(x, y);
        ctx.scale(this.scale, this.scale);
        this.drawStool();
        ctx.restore();
    }

    private drawStool() {
        const {ctx} = this;
        const sw = 18; // seat half-width
        const sl = 20; // leg length

        // crossed legs
        ctx.strokeStyle = '#a0a8b0';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-sw, -2);
        ctx.lineTo(sw * 0.4, sl);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(sw, -2);
        ctx.lineTo(-sw * 0.4, sl);
        ctx.stroke();

        // leg feet
        ctx.strokeStyle = '#808890';
        ctx.lineWidth = 1.5;
        ([[-sw * 0.4, sl], [sw * 0.4, sl]] as [number, number][]).forEach(([fx, fy]) => {
            ctx.beginPath();
            ctx.moveTo(fx - 4, fy);
            ctx.lineTo(fx + 4, fy);
            ctx.stroke();
        });

        // seat - canvas fabric
        const seatGrad = ctx.createLinearGradient(0, -8, 0, -2);
        seatGrad.addColorStop(0, '#4a6080');
        seatGrad.addColorStop(1, '#3a5070');
        ctx.fillStyle = seatGrad;
        ctx.beginPath();
        ctx.ellipse(0, -4, sw, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // seat highlight
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.beginPath();
        ctx.ellipse(-2, -5, sw * 0.6, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // seat edge stitching
        ctx.strokeStyle = '#2a4060';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.ellipse(0, -4, sw - 2, 4, 0, 0, Math.PI * 2);
        ctx.stroke();
    }
}