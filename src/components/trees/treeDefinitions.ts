export interface TreeDef {
    x: number;
    y: number;
    h: number;
    r: number;
    sway: number;
    ph: number;
    layers: number;
    dark: boolean;
    type: 'pine' | 'oak' | 'birch';
    background: boolean;
    xmasLights: boolean;
    balloonCount: number;
}

export const TREE_DEFS: TreeDef[] = [
    {
        x: 25,
        y: 0,
        h: 140,
        r: 32,
        sway: 0.016,
        ph: 1.7,
        layers: 2,
        dark: true,
        type: 'pine',
        background: true,
        xmasLights: true,
        balloonCount: 0
    },
    {
        x: 50,
        y: 0,
        h: 220,
        r: 50,
        sway: 0.012,
        ph: 0.0,
        layers: 3,
        dark: false,
        type: 'oak',
        background: false,
        xmasLights: false,
        balloonCount: 2
    },
    {
        x: 100,
        y: 0,
        h: 270,
        r: 58,
        sway: 0.008,
        ph: 3.1,
        layers: 4,
        dark: false,
        type: 'oak',
        background: false,
        xmasLights: true,
        balloonCount: 4
    },
    {
        x: 148,
        y: 0,
        h: 170,
        r: 40,
        sway: 0.009,
        ph: 1.1,
        layers: 3,
        dark: true,
        type: 'birch',
        background: true,
        xmasLights: false,
        balloonCount: 0
    },
    {
        x: 200,
        y: 0,
        h: 130,
        r: 28,
        sway: 0.014,
        ph: 0.8,
        layers: 2,
        dark: true,
        type: 'birch',
        background: true,
        xmasLights: false,
        balloonCount: 1
    },
    {
        x: 260,
        y: 0,
        h: 100,
        r: 22,
        sway: 0.018,
        ph: 1.4,
        layers: 2,
        dark: true,
        type: 'pine',
        background: true,
        xmasLights: true,
        balloonCount: 4
    },
    {
        x: 440,
        y: 0,
        h: 110,
        r: 24,
        sway: 0.016,
        ph: 3.5,
        layers: 2,
        dark: false,
        type: 'pine',
        background: true,
        xmasLights: true,
        balloonCount: 3
    },
    {
        x: 480,
        y: 0,
        h: 120,
        r: 26,
        sway: 0.011,
        ph: 2.5,
        layers: 2,
        dark: false,
        type: 'birch',
        background: true,
        xmasLights: false,
        balloonCount: 0
    },
    {
        x: 555,
        y: 0,
        h: 230,
        r: 52,
        sway: 0.011,
        ph: 0.7,
        layers: 3,
        dark: false,
        type: 'oak',
        background: false,
        xmasLights: true,
        balloonCount: 0
    },
    {
        x: 598,
        y: 0,
        h: 260,
        r: 54,
        sway: 0.010,
        ph: 2.0,
        layers: 4,
        dark: true,
        type: 'oak',
        background: false,
        xmasLights: false,
        balloonCount: 3
    },
    {
        x: 625,
        y: 0,
        h: 180,
        r: 44,
        sway: 0.013,
        ph: 2.3,
        layers: 3,
        dark: true,
        type: 'birch',
        background: true,
        xmasLights: false,
        balloonCount: 2
    },
    {
        x: 678,
        y: 0,
        h: 150,
        r: 34,
        sway: 0.014,
        ph: 0.5,
        layers: 2,
        dark: false,
        type: 'pine',
        background: true,
        xmasLights: true,
        balloonCount: 0
    },
];
