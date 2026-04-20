import {Scene} from './core/Scene.js';

const canvas = document.getElementById('c');
const statusEl = document.getElementById('status');

// kick everything off
const scene = new Scene(canvas, statusEl);
scene.initialise();
scene.start();

// FOR DEBUGGING
globalThis.scene = scene;
