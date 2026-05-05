import {Scene} from './core/Scene';
import {PROBABILITY} from '@/config';

const canvas = document.getElementById('c') as HTMLCanvasElement;
const statusEl = document.getElementById('status')!;

const scene = new Scene(canvas, statusEl);
globalThis.debug = {
    scene,
    probs: PROBABILITY,
    printEvents: false,
};

scene.initialise();
scene.start();
