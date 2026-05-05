import {DrawComponent} from '@/core/DrawComponent';
import {rnd, rndf} from '@/utils';

interface Note {
    x: number;
    y: number;
    vx: number;
    vy: number;
    alpha: number;
    size: number;
    note: string;
    col: string;
}

const NOTES = ['♪', '♫', '♩'];

/**
 * draws floating musical note particles (fox singing)
 */
export class MusicalNotesComponent extends DrawComponent {
    public static COMPONENT_NAME = 'MusicalNotesComponent';

    private notes: Note[] = [];

    public override getName() {
        return MusicalNotesComponent.COMPONENT_NAME;
    }

    public override tick() {
        this.notes = this.notes.filter(n => {
            n.x += n.vx;
            n.y += n.vy;
            n.alpha -= 0.012;
            n.vx += rndf(0.05);
            return n.alpha > 0;
        });
    }

    public override draw() {
        const {ctx} = this;
        this.notes.forEach(n => {
            ctx.save();
            ctx.globalAlpha = n.alpha;
            ctx.fillStyle = n.col;
            ctx.shadowBlur = 6;
            ctx.shadowColor = n.col;
            ctx.font = `${n.size}px serif`;
            ctx.textAlign = 'center';
            ctx.fillText(n.note, n.x, n.y);
            ctx.restore();
        });
    }

    /**
     * spawn a single note at the given position.
     */
    public spawnNote(x: number, y: number) {
        this.notes.push({
            x: x + rndf(10),
            y: y + rndf(10),
            vx: rndf(0.6),
            vy: -(0.8 + rnd(0.5)),
            alpha: 1,
            size: 10 + rnd(6),
            note: NOTES[Math.floor(rnd(NOTES.length))]!,
            col: `hsl(${Math.floor(rnd(360))}, 80%, 65%)`,
        });
    }
}
