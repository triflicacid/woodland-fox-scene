import {DrawComponent} from "@/core/DrawComponent";
import {getTreeTopPos} from "@/components/TreeComponent";
import {prob} from "@/utils";
import {PROBABILITY} from "@/config";

/**
 * render an owl sitting in the tree in autumn
 */
export class OwlComponent extends DrawComponent {
  owl = {
    headAngle: 0,
    headTarget: 0,
    headTimer: 0,
    blinkT: -1,
    treeIdx: 2,
  };

  static COMPONENT_NAME = "OwlComponent";

  getName() {
    return OwlComponent.COMPONENT_NAME;
  }

  isEnabled() {
    const {season, weather} = this.scene;
    return this.scene.owlForced || (this.scene.todBlend < 0.35 && (season === 'autumn' || season === 'winter') && weather === 'clear');
  }

  tick() {
    const {owl} = this;

    owl.headTimer++;
    if (owl.headTimer > 120) {
      owl.headTarget = (Math.random() - 0.5) * 1.6;
      owl.headTimer = 0;
      if (prob(PROBABILITY.OWL_BLINK)) owl.blinkT = 0;
    }
    owl.headAngle = owl.headAngle + (owl.headTarget - owl.headAngle) * 0.04;
    if (owl.blinkT >= 0) {
      owl.blinkT++;
      if (owl.blinkT > 8) owl.blinkT = -1;
    }
  }

  draw() {
    const {ctx, owl} = this;
    const {season, weather, frame, specialEvent} = this.scene;

    const tr = this.scene.trees[owl.treeIdx]; // TODO
    let {x, y} = getTreeTopPos(tr, weather, season, specialEvent, frame, this.H);
    y -= 15;
    x -= 5;

    ctx.save();
    ctx.translate(x, y);

    // body and wings
    ctx.fillStyle = '#3a2a18';
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c8a878';
    ctx.beginPath();
    ctx.ellipse(0, 4, 6, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2a1e10';
    ctx.beginPath();
    ctx.ellipse(-9, 2, 5, 11, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(9, 2, 5, 11, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // rotating head
    ctx.save();
    ctx.rotate(owl.headAngle);
    ctx.fillStyle = '#3a2a18';
    ctx.beginPath();
    ctx.arc(0, -14, 9, 0, Math.PI * 2);
    ctx.fill();
    // ear tufts
    ctx.fillStyle = '#2a1a08';
    ctx.beginPath();
    ctx.moveTo(-6, -20);
    ctx.lineTo(-8, -27);
    ctx.lineTo(-3, -21);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(6, -20);
    ctx.lineTo(8, -27);
    ctx.lineTo(3, -21);
    ctx.closePath();
    ctx.fill();
    // face disc
    ctx.fillStyle = '#c8a060';
    ctx.beginPath();
    ctx.arc(0, -14, 6, 0, Math.PI * 2);
    ctx.fill();

    const blinking = owl.blinkT >= 0 && owl.blinkT < 5;
    ctx.fillStyle = '#f0c040';
    if (!blinking) {
      ctx.beginPath();
      ctx.arc(-3, -14, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(3, -14, 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = '#f0c040';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-6, -14);
      ctx.lineTo(0, -14);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -14);
      ctx.lineTo(6, -14);
      ctx.stroke();
    }
    ctx.fillStyle = '#000';
    if (!blinking) {
      ctx.beginPath();
      ctx.arc(-3, -14, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(3, -14, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    // beak
    ctx.fillStyle = '#a08040';
    ctx.beginPath();
    ctx.moveTo(-2, -11);
    ctx.lineTo(2, -11);
    ctx.lineTo(0, -9);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // talons on perch
    ctx.strokeStyle = '#7a5a20';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-4, 13);
    ctx.lineTo(-4, 20);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(4, 13);
    ctx.lineTo(4, 20);
    ctx.stroke();

    ctx.restore();
  }
}
