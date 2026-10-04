const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(
    '<canvas id="drawing-board"></canvas>',
    '<canvas id="drawing-board"></canvas>\n<canvas id="preview-board" style="position:absolute; top:0; left:0; pointer-events:none;"></canvas>'
);

html = html.replace(
    '<div class="canvas-action-group">',
    '<div class="canvas-action-group">\n<button class="btn pastel-gray" id="btn-canvas-fullscreen" title="Full Screen">⛶</button>'
);

fs.writeFileSync('index.html', html);
console.log("HTML Canvas patched");
