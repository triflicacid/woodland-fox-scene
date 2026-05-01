import {Scene} from './core/Scene.js';
import {PROBABILITY} from "@/config";

const canvas = document.getElementById('c');
const statusEl = document.getElementById('status');

// kick everything off
const scene = new Scene(canvas, statusEl);
globalThis.scene = scene;
globalThis.probs = PROBABILITY;

/** @type{boolean | string[]} global yes/.no, or filter to show */
globalThis.printEvents = ["TODChange"];

scene.initialise();
scene.start();
