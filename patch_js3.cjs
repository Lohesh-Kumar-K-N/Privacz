const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const remoteReplace = `function drawRemoteCoordinates(data) {
    if (!ctx) return;
    if (data.tool === 'fill') {
        floodFill(data.x, data.y, data.color);
        return;
    }
    ctx.strokeStyle = data.color;
    ctx.lineWidth = data.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    drawShapeToCtx(ctx, data.tool, data.x1, data.y1, data.x2, data.y2);
}`;

code = code.replace(/function drawRemoteCoordinates\(data\) \{[\s\S]*?\n\}/, remoteReplace);

fs.writeFileSync('app.js', code);
console.log("Remote draw patched");
