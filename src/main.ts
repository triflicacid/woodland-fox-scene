import {Scene} from './core/Scene';
import {CANVAS, PROBABILITY} from '@/config';

const canvas = document.getElementById('c') as HTMLCanvasElement;
const statusEl = document.getElementById('status')!;

canvas.width = CANVAS.width;
canvas.height = CANVAS.height;

const scene = new Scene(canvas, CANVAS, statusEl);
globalThis.debug = {
    scene,
    probs: PROBABILITY,
    printEvents: false,
};

scene.initialise();
scene.start();
