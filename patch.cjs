const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');
code = code.replace(/    let curC = fC \+ stepC;\n    while \(curR !== tR \|\| curC !== tC\) \{/, `function isPathClear(fR, fC, tR, tC, board) {
    const stepR = Math.sign(tR - fR);
    const stepC = Math.sign(tC - fC);
    let curR = fR + stepR;
    let curC = fC + stepC;
    while (curR !== tR || curC !== tC) {`);
fs.writeFileSync('app.js', code);
