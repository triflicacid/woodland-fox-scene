import {DrawComponent} from '@/core/DrawComponent';

interface PresentDef {
    x: number;
    y: number;
    dm: number;
    w: number;
    h: number;
    col: string;
    ribbon: string;
    pattern: 'dots' | 'stripes' | null;
}

const CHRISTMAS_PRESENTS: PresentDef[] = [
    {x: 155, y: 0, dm: 0, w: 22, h: 16, col: '#cc2020', ribbon: '#ffdd00', pattern: null},
    {x: 185, y: 0, dm: 0, w: 16, h: 12, col: '#2060cc', ribbon: '#ff80ff', pattern: null},
    {x: 430, y: 0, dm: 0, w: 20, h: 14, col: '#20aa40', ribbon: '#ff4040', pattern: null},
    {x: 455, y: 0, dm: 0, w: 14, h: 18, col: '#aa20cc', ribbon: '#ffffaa', pattern: null},
    {x: 575, y: 0, dm: 0, w: 18, h: 13, col: '#cc6020', ribbon: '#aaffaa', pattern: null},
];

const BIRTHDAY_PRESENTS: PresentDef[] = [
    {x: 148, y: 0, dm: 0, w: 24, h: 18, col: '#ff3366', ribbon: '#ffff00', pattern: 'dots'},
    {x: 178, y: 0, dm: 0, w: 18, h: 22, col: '#3366ff', ribbon: '#ff66ff', pattern: 'stripes'},
    {x: 210, y: 0, dm: 0, w: 20, h: 15, col: '#ff9900', ribbon: '#ffffff', pattern: 'dots'},
    {x: 240, y: 0, dm: 0, w: 14, h: 19, col: '#00cc88', ribbon: '#ff3366', pattern: 'stripes'},
    {x: 390, y: 0, dm: 0, w: 16, h: 14, col: '#ff66aa', ribbon: '#33ffcc', pattern: 'dots'},
    {x: 420, y: 0, dm: 0, w: 22, h: 16, col: '#ffcc00', ribbon: '#ff3300', pattern: 'dots'},
    {x: 450, y: 0, dm: 0, w: 16, h: 20, col: '#33cc66', ribbon: '#ffffff', pattern: 'stripes'},
    {x: 480, y: 0, dm: 0, w: 20, h: 17, col: '#cc33ff', ribbon: '#ffff66', pattern: 'dots'},
    {x: 510, y: 0, dm: 0, w: 18, h: 21, col: '#ff4400', ribbon: '#aaffaa', pattern: 'stripes'},
    {x: 538, y: 0, dm: 0, w: 22, h: 14, col: '#4488ff', ribbon: '#ffcc00', pattern: 'dots'},
];

/**
 * draws wrapped presents on the ground for christmas or birthday events.
 */
export class PresentsComponent extends DrawComponent {
    static COMPONENT_NAME = 'PresentsComponent';

    override getName() {
        return PresentsComponent.COMPONENT_NAME;
    }

    override initialise() {
        [...CHRISTMAS_PRESENTS, ...BIRTHDAY_PRESENTS].forEach(p => {
            p.y = this.scene.groundY + this.H * p.dm;
        });
    }

    override isEnabled() {
        const {specialEvent} = this.scene;
        return specialEvent === 'christmas' || specialEvent === 'birthday';
    }

    override draw() {
        const {ctx} = this;
        const {frame, specialEvent} = this.scene;
        const presents = specialEvent === 'birthday' ? BIRTHDAY_PRESENTS : CHRISTMAS_PRESENTS;

        presents.forEach((pr, i) => {
            const bob = Math.sin(frame * 0.03 + i * 0.8) * 0.5;

            ctx.save();
            ctx.translate(pr.x, pr.y + bob);

            // box
            ctx.fillStyle = pr.col;
            ctx.fillRect(-pr.w / 2, -pr.h, pr.w, pr.h);

            // optional pattern overlay
            if (pr.pattern === 'dots') {
                ctx.fillStyle = 'rgba(255,255,255,0.25)';
                for (let dx = -pr.w / 2 + 5; dx < pr.w / 2; dx += 7) {
                    for (let dy = -pr.h + 5; dy < 0; dy += 7) {
                        ctx.beginPath();
                        ctx.arc(dx, dy, 1.5, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            } else if (pr.pattern === 'stripes') {
                ctx.strokeStyle = 'rgba(255,255,255,0.2)';
                ctx.lineWidth = 2;
                for (let dx = -pr.w / 2 + 4; dx < pr.w / 2; dx += 6) {
                    ctx.beginPath();
                    ctx.moveTo(dx, -pr.h);
                    ctx.lineTo(dx, 0);
                    ctx.stroke();
                }
            }

            // shading on right side
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            ctx.fillRect(pr.w / 2 - 5, -pr.h, 5, pr.h);

            // ribbon vertical
            ctx.fillStyle = pr.ribbon;
            ctx.fillRect(-2, -pr.h, 4, pr.h);
            // ribbon horizontal
            ctx.fillRect(-pr.w / 2, -pr.h / 2 - 2, pr.w, 4);

            // bow loops
            ctx.fillStyle = pr.ribbon;
            ctx.beginPath();
            ctx.ellipse(-6, -pr.h - 4, 7, 4, -0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(6, -pr.h - 4, 7, 4, 0.4, 0, Math.PI * 2);
            ctx.fill();

            // bow centre
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.beginPath();
            ctx.arc(0, -pr.h - 4, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        });
    }
}
