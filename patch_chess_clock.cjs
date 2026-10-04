const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

// Add clock variables
const variables = `
let chessClocks = { w: 0, b: 0 };
let chessInc = 0;
let chessClockInterval = null;
let lastClockUpdate = 0;

function formatChessTime(ms) {
    if (ms <= 0) return '0:00';
    const totalS = Math.floor(ms / 1000);
    const m = Math.floor(totalS / 60);
    const s = totalS % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
}

function stopChessClock() {
    if (chessClockInterval) clearInterval(chessClockInterval);
    chessClockInterval = null;
}

function runChessClock() {
    lastClockUpdate = Date.now();
    stopChessClock();
    chessClockInterval = setInterval(() => {
        if (!matchStarted || chessMode === 'unlimited') return;
        const now = Date.now();
        const delta = now - lastClockUpdate;
        lastClockUpdate = now;
        
        chessClocks[chessTurn] -= delta;
        
        if (chessClocks[chessTurn] <= 0) {
            chessClocks[chessTurn] = 0;
            stopChessClock();
            matchStarted = false;
            const winner = chessTurn === 'w' ? 'Black' : 'White';
            const statusBanner = document.getElementById('chess-game-status');
            if (statusBanner) statusBanner.innerText = \`\${winner} wins on time!\`;
            updateClockDisplays();
            return;
        }
        updateClockDisplays();
    }, 100);
}

function updateClockDisplays() {
    if (chessMode === 'unlimited') {
        document.getElementById('white-timer').innerText = '∞';
        document.getElementById('black-timer').innerText = '∞';
    } else {
        document.getElementById('white-timer').innerText = formatChessTime(chessClocks.w);
        document.getElementById('black-timer').innerText = formatChessTime(chessClocks.b);
    }
}
`;

// Insert variables
code = code.replace("let matchStarted = false;", "let matchStarted = false;\n" + variables);

// Update executeMove to handle increment and switch clock
code = code.replace(/chessTurn = chessTurn === 'w' \? 'b' : 'w';\s*renderChessBoard\(\);/,
`// Add increment before switching
if (chessMode !== 'unlimited') {
    chessClocks[chessTurn] += chessInc * 1000;
}
chessTurn = chessTurn === 'w' ? 'b' : 'w';
lastClockUpdate = Date.now();
renderChessBoard();
updateClockDisplays();
`);

// Update startChessMatch
code = code.replace(/function startChessMatch\(config\) \{[\s\S]*?toast\("Chess match is live!"\);\n\}/,
`function startChessMatch(config) {
    if (config.roster) {
        chessRoster = config.roster;
        if (chessRoster.white.includes(myColor)) myChessTeam = 'white';
        else if (chessRoster.black.includes(myColor)) myChessTeam = 'black';
        else myChessTeam = 'spectator';
        renderChessRoster();
    }
    
    chessMode = config.mode || 'realtime';
    chessInc = config.inc || 0;
    const timeMs = (config.time || 10) * 60 * 1000;
    chessClocks = { w: timeMs, b: timeMs };
    
    initChessBoard();
    matchStarted = true;
    updateClockDisplays();
    runChessClock();
    
    const statusBanner = document.getElementById('chess-game-status');
    if (statusBanner) statusBanner.innerText = "Match In Progress";
    
    toast("Chess match is live!");
}`);

fs.writeFileSync('app.js', code);
console.log("Chess clock patched");
