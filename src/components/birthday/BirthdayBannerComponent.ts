import {DrawComponent} from '@/core/DrawComponent';
import {getTreeTopPos} from '@/components/trees/TreeComponent';

const LETTER_COLS = ['#ffcc00', '#ff6633', '#ff3399', '#33aaff', '#66cc33', '#cc44ff'];

/**
 * draws a HAPPY BIRTHDAY banner with bubbly gold letters strung between the two large trees.
 */
export class BirthdayBannerComponent extends DrawComponent {
    static COMPONENT_NAME = 'BirthdayBannerComponent';

    private leftTreeIndex = 2;
    private rightTreeIndex = 8;
    private letters = 'HAPPY BIRTHDAY!'.split('');

    override getName() {
        return BirthdayBannerComponent.COMPONENT_NAME;
    }

    override isEnabled() {
        return this.scene.specialEvent === 'birthday';
    }

    override draw() {
        const {ctx} = this;
        const {weather, season, frame, trees, specialEvent} = this.scene;

        const leftTree = trees[this.leftTreeIndex]!;
        const rightTree = trees[this.rightTreeIndex]!;
        const leftPos = getTreeTopPos(leftTree, weather, season, specialEvent, frame);
        const rightPos = getTreeTopPos(rightTree, weather, season, specialEvent, frame);

        const y = (leftPos.y + rightPos.y) / 2 + 40; // below bunting
        const x1 = leftPos.x + 20;
        const x2 = rightPos.x - 20;
        const totalW = x2 - x1;

        const sway = (weather === 'wind' || weather === 'storm')
            ? Math.sin(frame * 0.04) * 3 : 0;

        // banner backing - rounded rect
        const bannerPad = 10;
        const bannerH = 32;
        ctx.save();
        ctx.fillStyle = 'rgba(20,10,40,0.65)';
        ctx.beginPath();
        ctx.roundRect(x1 - bannerPad, y - bannerH + sway, totalW + bannerPad * 2, bannerH + 4, 6);
        ctx.fill();
        // gold outline
        ctx.strokeStyle = '#ffcc00';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

        // bubbly letters
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const letterSpacing = totalW / (this.letters.length - 1);
        this.letters.forEach((ch, i) => {
            if (ch === ' ') return;
            const lx = x1 + i * letterSpacing;
            const ly = y - bannerH * 0.45 + sway;
            const bob = Math.sin(frame * 0.05 + i * 0.4) * 1.5;
            const col = LETTER_COLS[i % LETTER_COLS.length]!;

            ctx.font = 'bold 18px Arial Rounded MT Bold, Arial, sans-serif';
            // shadow for bubbly effect
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.fillText(ch, lx + 1.5, ly + bob + 1.5);
            // outer stroke
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.strokeText(ch, lx, ly + bob);
            // coloured fill
            ctx.fillStyle = col;
            ctx.fillText(ch, lx, ly + bob);
            // gold shimmer overlay
            ctx.fillStyle = 'rgba(255,220,80,0.3)';
            ctx.fillText(ch, lx, ly + bob);
        });

        ctx.restore();
    }
}
