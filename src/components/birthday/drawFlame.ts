/**
 * draw a flickering flame at the given position.
 */
export function drawFlame(ctx: CanvasRenderingContext2D, x: number, y: number, flicker: number, sway: number) {
    ctx.fillStyle = 'rgba(255,140,20,0.9)';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ffaa00';
    ctx.beginPath();
    ctx.moveTo(x + sway - 3, y);
    ctx.bezierCurveTo(x + sway - 2, y - 6 + flicker, x + sway + 2, y - 6 + flicker, x + sway + 3, y);
    ctx.bezierCurveTo(x + sway + 2, y - 12 + flicker, x + sway, y - 14 + flicker, x + sway, y - 14 + flicker);
    ctx.bezierCurveTo(x + sway, y - 12 + flicker, x + sway - 2, y - 6 + flicker, x + sway - 3, y);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,230,80,0.95)';
    ctx.shadowBlur = 4;
    ctx.shadowColor = '#ffee44';
    ctx.beginPath();
    ctx.moveTo(x + sway - 1.5, y);
    ctx.bezierCurveTo(x + sway - 1, y - 4 + flicker, x + sway + 1, y - 4 + flicker, x + sway + 1.5, y);
    ctx.bezierCurveTo(x + sway + 1, y - 9 + flicker, x + sway, y - 10 + flicker, x + sway, y - 10 + flicker);
    ctx.bezierCurveTo(x + sway, y - 9 + flicker, x + sway - 1, y - 4 + flicker, x + sway - 1.5, y);
    ctx.fill();
    ctx.shadowBlur = 0;
}
