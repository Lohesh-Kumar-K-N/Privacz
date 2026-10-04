const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

// Add status update function
const helperText = `
function updateHostConnectionStatus() {
    const statusEl = document.getElementById('host-connection-status');
    if (!statusEl) return;
    const activeGuests = Object.values(peers).filter(p => p.pc && p.pc.connectionState === 'connected').length;
    statusEl.innerHTML = \`<span style="color:var(--pastel-mint)">\${activeGuests}</span> / \${expectedPeers - 1} Guests Connected\`;
}`;

code = code.replace('function openHostSetup() {', helperText + '\\n\\nfunction openHostSetup() {');

// Update openHostSetup
const oldHostSetup = `    const btnContinue = document.getElementById('btn-continue-host');
    if (btnContinue) {
        btnContinue.style.display = expectedPeers === 2 ? 'none' : 'block';
        btnContinue.innerText = "Continue Anyway";
    }`;

const newHostSetup = `    const btnContinue = document.getElementById('btn-continue-host');
    if (btnContinue) {
        btnContinue.style.display = expectedPeers === 2 ? 'none' : 'block';
        btnContinue.innerText = "Continue Anyway";
    }
    updateHostConnectionStatus();`;

code = code.replace(oldHostSetup, newHostSetup);

// Update slider oninput
const oldSlider = `        const btnContinue = document.getElementById('btn-continue-host');
        if (btnContinue) {
            btnContinue.style.display = expectedPeers === 2 ? 'none' : 'block';
        }`;

const newSlider = `        const btnContinue = document.getElementById('btn-continue-host');
        if (btnContinue) {
            btnContinue.style.display = expectedPeers === 2 ? 'none' : 'block';
        }
        updateHostConnectionStatus();`;

code = code.replace(oldSlider, newSlider);

// Update pc.onconnectionstatechange
const oldConn = `            if (isHost) {
                const activeGuests = Object.values(peers).filter(p => p.pc && p.pc.connectionState === 'connected').length;`;

const newConn = `            if (isHost) {
                updateHostConnectionStatus();
                const activeGuests = Object.values(peers).filter(p => p.pc && p.pc.connectionState === 'connected').length;`;

code = code.replace(oldConn, newConn);

// Also handle disconnection
const oldDisconnect = `        } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
            toast(\`\${peerObj.color} Disconnected.\`);
            updatePresence();
            if (peerObj.statsInterval) clearInterval(peerObj.statsInterval);
            delete peers[id];
        }`;

const newDisconnect = `        } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
            toast(\`\${peerObj.color} Disconnected.\`);
            updatePresence();
            if (peerObj.statsInterval) clearInterval(peerObj.statsInterval);
            delete peers[id];
            if (isHost) updateHostConnectionStatus();
        }`;

code = code.replace(oldDisconnect, newDisconnect);

fs.writeFileSync('app.js', code);
