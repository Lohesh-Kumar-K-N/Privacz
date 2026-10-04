const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

code = code.replace(/chessTurn = chessTurn === 'w' \? 'b' : 'w';\s*renderChessboard\(\);/,
`// Add increment before switching
if (chessMode !== 'unlimited') {
    chessClocks[chessTurn] += chessInc * 1000;
}
chessTurn = chessTurn === 'w' ? 'b' : 'w';
lastClockUpdate = Date.now();
renderChessboard();
updateClockDisplays();`);

fs.writeFileSync('app.js', code);
console.log("Chess clock move switch patched");
