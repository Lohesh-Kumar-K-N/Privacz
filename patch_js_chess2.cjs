const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const chessLogic = `
let chessMode = 'realtime';

// Sliders UI
document.getElementById('slider-chess-time')?.addEventListener('input', (e) => {
    document.getElementById('clock-minutes-display').innerText = e.target.value;
});
document.getElementById('slider-chess-inc')?.addEventListener('input', (e) => {
    document.getElementById('clock-inc-display').innerText = e.target.value;
});

// Mode Tabs
document.querySelectorAll('#chess-mode-tabs button').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('#chess-mode-tabs button').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        chessMode = e.target.dataset.mode;
        const timeWrap = document.getElementById('time-controls-wrap');
        if (timeWrap) timeWrap.style.display = chessMode === 'unlimited' ? 'none' : 'block';
    });
});

// Randomize Side
document.getElementById('btn-chess-random')?.addEventListener('click', () => {
    const sides = ['w', 'b'];
    const chosen = sides[Math.floor(Math.random() * sides.length)];
    const radio = document.querySelector('input[name="side"][value="' + chosen + '"]');
    if (radio) radio.checked = true;
});
`;

// Replace Start
code = code.replace(/document\.getElementById\('btn-chess-start'\)\?\.addEventListener\('click', \(\) => \{[\s\S]*?\}\);/,
`document.getElementById('btn-chess-start')?.addEventListener('click', () => {
    if (!isHost) return;
    
    // Determine teams based on host choice
    const checkedSide = document.querySelector('input[name="side"]:checked');
    const hostSide = checkedSide ? checkedSide.value : 'w';
    chessRoster.white = [];
    chessRoster.black = [];
    
    const allPeers = [{ id: myId, color: myColor }, ...Object.values(peers).map(p => ({ id: p.pc, color: p.color }))];
    const otherPeers = allPeers.filter(p => p.color !== myColor);
    
    if (hostSide === 'w') {
        chessRoster.white.push(myColor);
        otherPeers.forEach(p => chessRoster.black.push(p.color));
    } else {
        chessRoster.black.push(myColor);
        otherPeers.forEach(p => chessRoster.white.push(p.color));
    }
    
    const timeVal = parseInt(document.getElementById('slider-chess-time')?.value || 10, 10);
    const incVal = parseInt(document.getElementById('slider-chess-inc')?.value || 5, 10);
    
    initChessBoard();
    matchStarted = true;
    
    const config = { 
        started: true, 
        mode: chessMode,
        time: timeVal, 
        inc: incVal,
        roster: chessRoster
    };
    
    broadcast({ type: 'CHESS_START', config });
    updateChessRoster();
    
    if (config.mode === 'unlimited') {
        document.getElementById('white-timer').innerText = '∞';
        document.getElementById('black-timer').innerText = '∞';
    } else {
        document.getElementById('white-timer').innerText = config.time + ':00';
        document.getElementById('black-timer').innerText = config.time + ':00';
    }
    
    toast("Grandmaster Chess match deployed!");
});`);

// Update startChessMatch function
code = code.replace(/function startChessMatch\(config\) \{[\s\S]*?\}/, 
`function startChessMatch(config) {
    if (config.roster) {
        chessRoster = config.roster;
        if (chessRoster.white.includes(myColor)) myChessTeam = 'white';
        else if (chessRoster.black.includes(myColor)) myChessTeam = 'black';
        else myChessTeam = 'spectator';
        renderChessRoster();
    }
    initChessBoard();
    matchStarted = true;
    
    if (config.mode === 'unlimited') {
        document.getElementById('white-timer').innerText = '∞';
        document.getElementById('black-timer').innerText = '∞';
    } else {
        document.getElementById('white-timer').innerText = config.time + ':00';
        document.getElementById('black-timer').innerText = config.time + ':00';
    }
    
    toast("Chess match is live!");
}`);

fs.writeFileSync('app.js', code + "\n" + chessLogic);
console.log("Chess logic patched");
