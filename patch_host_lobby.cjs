const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

// Update openHostSetup
const oldHostSetup = `function openHostSetup() {
    isHost = true;
    roomID = Math.random().toString(36).substring(2, 10);
    document.getElementById('modal-host-setup')?.classList.remove('hidden');

    const sliderGroup = document.querySelector('.counter-slider-group');
    if (sliderGroup) sliderGroup.style.display = 'flex';`;

const newHostSetup = `function openHostSetup() {
    isHost = true;
    roomID = Math.random().toString(36).substring(2, 10);
    document.getElementById('modal-host-setup')?.classList.remove('hidden');

    const sliderGroup = document.querySelector('.counter-slider-group');
    if (sliderGroup) sliderGroup.style.display = 'flex';
    
    const btnContinue = document.getElementById('btn-continue-host');
    if (btnContinue) {
        btnContinue.style.display = expectedPeers === 2 ? 'none' : 'block';
        btnContinue.innerText = "Continue Anyway";
    }`;

code = code.replace(oldHostSetup, newHostSetup);

// Update slider oninput
const oldSlider = `if (sliderPeerCount && counterVal) {
    sliderPeerCount.oninput = (e) => {
        counterVal.innerText = e.target.value;
        expectedPeers = parseInt(e.target.value, 10);
    };
}`;

const newSlider = `if (sliderPeerCount && counterVal) {
    sliderPeerCount.oninput = (e) => {
        counterVal.innerText = e.target.value;
        expectedPeers = parseInt(e.target.value, 10);
        const btnContinue = document.getElementById('btn-continue-host');
        if (btnContinue) {
            btnContinue.style.display = expectedPeers === 2 ? 'none' : 'block';
        }
    };
}`;

code = code.replace(oldSlider, newSlider);

// Update btn-continue-host logic
const oldBtn = `document.getElementById('btn-continue-host')?.addEventListener('click', () => {
    document.getElementById('modal-host-setup')?.classList.add('hidden');
    document.getElementById('view-app-shell')?.classList.remove('isolated-mode');
    showView('view-dashboard');
    toast(\`Entered session. Waiting for peers to join...\`);
});`;

const newBtn = `document.getElementById('btn-continue-host')?.addEventListener('click', () => {
    document.getElementById('modal-host-setup')?.classList.add('hidden');
    document.getElementById('view-app-shell')?.classList.remove('isolated-mode');
    showView('view-dashboard');
    toast(\`Entered session manually.\`);
});`;

code = code.replace(oldBtn, newBtn);

// Update onconnectionstatechange
const oldConn = `    pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') {
            toast(\`\${peerObj.color} Connected!\`);
            updatePresence();
            startStatsMonitoring(pc);
            if (!isHost) {`;

const newConn = `    pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') {
            toast(\`\${peerObj.color} Connected!\`);
            updatePresence();
            startStatsMonitoring(pc);
            if (isHost) {
                const activeGuests = Object.values(peers).filter(p => p.pc && p.pc.connectionState === 'connected').length;
                if (activeGuests >= expectedPeers - 1) {
                    const hostModal = document.getElementById('modal-host-setup');
                    if (hostModal && !hostModal.classList.contains('hidden')) {
                        hostModal.classList.add('hidden');
                        document.getElementById('view-app-shell')?.classList.remove('isolated-mode');
                        showView('view-dashboard');
                        toast(\`All expected peers connected! Workspace active.\`);
                    }
                }
            }
            if (!isHost) {`;

code = code.replace(oldConn, newConn);

fs.writeFileSync('app.js', code);
