import {DrawComponent} from "@/core/DrawComponent";

/**
 * render snowmen during Christmas
 */
export class SnowmenComponent extends DrawComponent {
  snowmen = [{x: 180}, {x: 420}, {x: 560}];

  static COMPONENT_NAME = "SnowmenComponent";

  getName() {
    return SnowmenComponent.COMPONENT_NAME;
  }

  isEnabled() {
    return this.scene.specialEvent === 'christmas';
  }

  draw() {
    const {ctx, H} = this;
    this.snowmen.forEach((sm, i) => {
      const y = H * 0.62;
      ctx.save();
      ctx.translate(sm.x, y);
      // shadow
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.beginPath();
      ctx.ellipse(0, 2, 18, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      // lower body
      ctx.fillStyle = '#eef4ff';
      ctx.beginPath();
      ctx.arc(0, -16, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#c8d8e8';
      ctx.lineWidth = 1;
      ctx.stroke();
      // upper body
      ctx.fillStyle = '#f4f8ff';
      ctx.beginPath();
      ctx.arc(0, -38, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#c8d8e8';
      ctx.stroke();
      // head
      ctx.fillStyle = '#f8faff';
      ctx.beginPath();
      ctx.arc(0, -55, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // eyes
      ctx.fillStyle = '#1a1a2a';
      ctx.beginPath();
      ctx.arc(-3, -57, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(3, -57, 1.2, 0, Math.PI * 2);
      ctx.fill();
      // carrot nose
      ctx.fillStyle = '#e06010';
      ctx.beginPath();
      ctx.moveTo(0, -55);
      ctx.lineTo(9, -54);
      ctx.lineTo(0, -53);
      ctx.closePath();
      ctx.fill();
      // smile
      [-3, -1, 1, 3].forEach(dx => {
        ctx.fillStyle = '#2a2a3a';
        ctx.beginPath();
        ctx.arc(dx, -51, 0.8, 0, Math.PI * 2);
        ctx.fill();
      });
      // scarf
      ctx.strokeStyle = ['#cc2020', '#2060cc', '#20aa40'][i % 3];
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(0, -47, 11, -0.4, Math.PI + 0.4);
      ctx.stroke();
      // scarf tail
      ctx.beginPath();
      ctx.moveTo(-11, -47);
      ctx.lineTo(-14, -43);
      ctx.lineTo(-12, -39);
      ctx.stroke();
      // buttons
      ctx.fillStyle = '#3a3a4a';
      [-44, -38, -32].forEach(by => {
        ctx.beginPath();
        ctx.arc(0, by, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });
      // stick arms
      ctx.strokeStyle = '#6a4020';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-11, -40);
      ctx.lineTo(-22, -48);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-22, -48);
      ctx.lineTo(-24, -44);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(11, -40);
      ctx.lineTo(22, -48);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(22, -48);
      ctx.lineTo(24, -44);
      ctx.stroke();
      // hat
      ctx.fillStyle = '#1a1a2a';
      ctx.fillRect(-9, -70, 18, 5);
      ctx.fillRect(-6, -80, 12, 12);
      // hat band
      ctx.fillStyle = ['#cc2020', '#2060cc', '#20aa40'][i % 3];
      ctx.fillRect(-6, -69, 12, 3);
      ctx.restore();
    });
  }
}
