const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const startIndex = code.indexOf("const cvs = document.getElementById('drawing-board');");
const endIndex = code.indexOf("function floodFill(startX, startY, fillColor) {");

const replacement = `const cvs = document.getElementById('drawing-board');
const ctx = cvs ? cvs.getContext('2d') : null;
const previewCvs = document.getElementById('preview-board');
const previewCtx = previewCvs ? previewCvs.getContext('2d') : null;

let currentTool = 'pen';
let currentColor = '#2d3748';
let currentSize = 3;
let isDrawing = false;
let startX = 0, startY = 0;

let canvasInitialized = false;
function resizeCanvas() {
    if (!cvs || canvasInitialized) return;
    cvs.width = 2000;
    cvs.height = 1500;
    if (previewCvs) {
        previewCvs.width = 2000;
        previewCvs.height = 1500;
    }
    if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, cvs.width, cvs.height);
    }
    canvasInitialized = true;
}
function getScaledCoords(e, isTouch = false) {
    const rect = cvs.getBoundingClientRect();
    const scaleX = cvs.width / rect.width;
    const scaleY = cvs.height / rect.height;
    let clientX = isTouch ? e.touches[0].clientX : e.clientX;
    let clientY = isTouch ? e.touches[0].clientY : e.clientY;
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}

// Canvas Tool Palette
['pen', 'eraser', 'rect', 'circle', 'line', 'arrow', 'fill'].forEach(t => {
    document.getElementById(\`tool-\${t}\`)?.addEventListener('click', () => {
        currentTool = t;
        document.querySelectorAll('.tool-group .icon-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(\`tool-\${t}\`)?.classList.add('active');
    });
});

document.querySelectorAll('.swatch').forEach(sw => {
    sw.onclick = () => {
        document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
        sw.classList.add('active');
        currentColor = sw.dataset.color;
    };
});

document.getElementById('canvas-color')?.addEventListener('input', (e) => {
    currentColor = e.target.value;
});
document.getElementById('canvas-size')?.addEventListener('input', (e) => {
    currentSize = parseInt(e.target.value, 10);
});

// Canvas Drawing Coordinates Streaming
if (cvs && ctx) {
    cvs.onmousedown = (e) => { const coords = getScaledCoords(e); startDraw(coords.x, coords.y); };
    cvs.onmousemove = (e) => { const coords = getScaledCoords(e); moveDraw(coords.x, coords.y); };
    cvs.onmouseup = (e) => { const coords = getScaledCoords(e); endDraw(coords.x, coords.y); };
    cvs.onmouseleave = () => isDrawing = false;

    // Mobile touch support
    cvs.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const coords = getScaledCoords(e, true);
        startDraw(coords.x, coords.y);
    });
    cvs.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const coords = getScaledCoords(e, true);
        moveDraw(coords.x, coords.y);
    });
    cvs.addEventListener('touchend', () => isDrawing = false);
}

function startDraw(x, y) {
    if (cvs.width === 0 || cvs.height === 0) return;
    if (currentTool === 'fill') {
        floodFill(Math.round(x), Math.round(y), currentColor);
        broadcast({ type: 'DRAW_COORDS', data: { tool: 'fill', x: Math.round(x), y: Math.round(y), color: currentColor } });
        return;
    }
    isDrawing = true;
    startX = x;
    startY = y;
}

function moveDraw(x, y) {
    if (!isDrawing) return;

    if (currentTool === 'pen' || currentTool === 'eraser') {
        const color = currentTool === 'eraser' ? '#ffffff' : currentColor;
        const size = currentTool === 'eraser' ? currentSize * 3 : currentSize;

        ctx.strokeStyle = color;
        ctx.lineWidth = size;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(x, y);
        ctx.stroke();

        broadcast({
            type: 'DRAW_COORDS',
            data: { tool: 'line', x1: startX, y1: startY, x2: x, y2: y, color, width: size }
        });

        startX = x;
        startY = y;
    } else {
        // Shapes preview
        if (previewCtx) {
            previewCtx.clearRect(0, 0, previewCvs.width, previewCvs.height);
            previewCtx.strokeStyle = currentColor;
            previewCtx.lineWidth = currentSize;
            previewCtx.lineCap = 'round';
            previewCtx.lineJoin = 'round';
            drawShapeToCtx(previewCtx, currentTool, startX, startY, x, y);
        }
    }
}

function endDraw(x, y) {
    if (!isDrawing) return;
    isDrawing = false;
    if (['rect', 'circle', 'line', 'arrow'].includes(currentTool)) {
        if (previewCtx) previewCtx.clearRect(0, 0, previewCvs.width, previewCvs.height);
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = currentSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        drawShapeToCtx(ctx, currentTool, startX, startY, x, y);
        broadcast({
            type: 'DRAW_COORDS',
            data: { tool: currentTool, x1: startX, y1: startY, x2: x, y2: y, color: currentColor, width: currentSize }
        });
    }
}

function drawShapeToCtx(targetCtx, type, x1, y1, x2, y2) {
    targetCtx.beginPath();
    if (type === 'rect') {
        targetCtx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    } else if (type === 'circle') {
        const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        targetCtx.arc(x1, y1, radius, 0, 2 * Math.PI);
        targetCtx.stroke();
    } else if (type === 'line') {
        targetCtx.moveTo(x1, y1);
        targetCtx.lineTo(x2, y2);
        targetCtx.stroke();
    } else if (type === 'arrow') {
        targetCtx.moveTo(x1, y1);
        targetCtx.lineTo(x2, y2);
        const headlen = 15;
        const angle = Math.atan2(y2 - y1, x2 - x1);
        targetCtx.lineTo(x2 - headlen * Math.cos(angle - Math.PI / 6), y2 - headlen * Math.sin(angle - Math.PI / 6));
        targetCtx.moveTo(x2, y2);
        targetCtx.lineTo(x2 - headlen * Math.cos(angle + Math.PI / 6), y2 - headlen * Math.sin(angle + Math.PI / 6));
        targetCtx.stroke();
    }
}

function drawRemoteCoordinates(data) {
    if (!ctx) return;
    if (data.tool === 'fill') {
        floodFill(data.x, data.y, data.color);
        return;
    }
    ctx.strokeStyle = data.color;
    ctx.lineWidth = data.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (data.tool === 'line') {
        ctx.beginPath();
        ctx.moveTo(data.x1, data.y1);
        ctx.lineTo(data.x2, data.y2);
        ctx.stroke();
    } else {
        drawShapeToCtx(ctx, data.tool, data.x1, data.y1, data.x2, data.y2);
    }
}

`;

code = code.substring(0, startIndex) + replacement + code.substring(endIndex);
fs.writeFileSync('app.js', code);
console.log("Canvas patched");
