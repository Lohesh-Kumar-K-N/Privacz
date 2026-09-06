const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

code = code.replace(/cvs\.onmouseup = \(e\) => endDraw\(e\.offsetX, e\.offsetY\);/, `cvs.onmouseup = (e) => { const coords = getScaledCoords(e); endDraw(coords.x, coords.y); };`);
code = code.replace(/cvs\.addEventListener\('touchstart', \(e\) => \{[\s\S]*?\}\);/, `cvs.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const coords = getScaledCoords(e, true);
    startDraw(coords.x, coords.y);
});`);
code = code.replace(/cvs\.addEventListener\('touchmove', \(e\) => \{[\s\S]*?\}\);/, `cvs.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const coords = getScaledCoords(e, true);
    moveDraw(coords.x, coords.y);
});`);

fs.writeFileSync('app.js', code);
console.log("Patched mouse coords");
