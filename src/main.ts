import {Scene} from './core/Scene';
import {PROBABILITY} from '@/config';

const canvas = document.getElementById('c') as HTMLCanvasElement;
const statusEl = document.getElementById('status')!;

const scene = new Scene(canvas, statusEl);
(globalThis as Record<string, unknown>).scene = scene;
(globalThis as Record<string, unknown>).probs = PROBABILITY;

/** global yes/no, or filter to show */
(globalThis as Record<string, unknown>).printEvents = ['TODChange'];

scene.initialise();
scene.start();