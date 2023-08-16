import './style.css';

import * as pc from 'playcanvas';
import { game } from './game';

// import ammoWasmGlue from '../static/lib/ammo/ammo.wasm.js'
// import ammoWasm from '../static/lib/ammo/ammo.wasm.wasm'
// import ammoFallbackJS from '../static/lib/ammo/ammo.js'

// This code was heavily adapted from the PlayCanvas engine template at
// https://github.com/playcanvas/engine/blob/main/README.md#usage

// create a PlayCanvas application
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);

const app = new pc.Application(canvas, {});

// fill the available space at full resolution
app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
app.setCanvasResolution(pc.RESOLUTION_AUTO);

// ensure canvas is resized when window changes size
window.addEventListener('resize', () => app.resizeCanvas());

pc.WasmModule.setConfig('Ammo', {
    glueUrl: '/static/lib/ammo/ammo.wasm.js', //ammoWasmGlue as unknown as string,
    wasmUrl: '/static/lib/ammo/ammo.wasm.wasm', // ammoWasm as unknown as string,
    fallbackUrl: '/static/lib/ammo/ammo.js', // ammoFallbackJS as unknown as string
});

pc.WasmModule.getInstance('Ammo', Ammo => {
    ///@ts-ignore
    globalThis['Ammo'] = Ammo
    
    app.start();
    game(app)
});

// (function () {
//     globalThis['pc'] = pc
//     app.mouse = new pc.Mouse(document.body)
//     var a = document.createElement('script');
//     a.src = 'https://yaustar.github.io/playcanvas-devtools/injector.js';
//     document.head.appendChild(a);
// })();