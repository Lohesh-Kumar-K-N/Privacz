const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

// Replace resizeCanvas
const resizeReplacement = `
let canvasInitialized = false;
function resizeCanvas() {
    if (!cvs || canvasInitialized) return;
    cvs.width = 2000;
    cvs.height = 1500;
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
`;

code = code.replace(/function resizeCanvas\(\) \{[\s\S]*?window\.addEventListener\('resize', resizeCanvas\);/, resizeReplacement);

// Replace drawing coords
code = code.replace(/cvs\.onmousedown = \(e\) => startDraw\(e\.offsetX, e\.offsetY\);/, `cvs.onmousedown = (e) => { const coords = getScaledCoords(e); startDraw(coords.x, coords.y); };`);
code = code.replace(/cvs\.onmousemove = \(e\) => moveDraw\(e\.offsetX, e\.offsetY\);/, `cvs.onmousemove = (e) => { const coords = getScaledCoords(e); moveDraw(coords.x, coords.y); };`);
code = code.replace(/cvs\.onmouseup = \(e\) => {/, `cvs.onmouseup = (e) => {`); // Wait, let's just do it directly.

fs.writeFileSync('app.js', code);
console.log("Replaced resizeCanvas");
