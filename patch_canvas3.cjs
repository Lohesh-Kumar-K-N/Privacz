const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

code = code.replace(
    /function getScaledCoords\(e, isTouch = false\) \{[\s\S]*?return \{[\s\S]*?x: \(clientX - rect\.left\) \* scaleX,[\s\S]*?y: \(clientY - rect\.top\) \* scaleY[\s\S]*?\};[\s\S]*?\}/,
    `function getScaledCoords(e, isTouch = false) {
    const rect = cvs.getBoundingClientRect();
    const scaleX = cvs.width / rect.width;
    const scaleY = cvs.height / rect.height;
    let clientX = e.clientX;
    let clientY = e.clientY;
    if (isTouch) {
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else if (e.changedTouches && e.changedTouches.length > 0) {
            clientX = e.changedTouches[0].clientX;
            clientY = e.changedTouches[0].clientY;
        }
    }
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}`
);

code = code.replace(
    /cvs\.addEventListener\('touchend', \(\) => isDrawing = false\);/,
    `cvs.addEventListener('touchend', (e) => { 
        if (isDrawing) {
            const coords = getScaledCoords(e, true);
            endDraw(coords.x, coords.y);
        }
        isDrawing = false;
    });`
);

code = code.replace(
    /const headlen = 15;/,
    `const headlen = Math.max(15, targetCtx.lineWidth * 2.5);`
);

fs.writeFileSync('app.js', code);
console.log("Patched!");
