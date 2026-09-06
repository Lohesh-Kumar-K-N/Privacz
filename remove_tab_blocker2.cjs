const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const target = `// --- SECTION 1: TAB DUPLICATION SAFEGUARD ---
const sessionKey = 'privacz_tab_session_id';
let mySessionId = sessionStorage.getItem(sessionKey);
if (!mySessionId) {
    mySessionId = Math.random().toString(36).substring(2, 12);
    sessionStorage.setItem(sessionKey, mySessionId);
}

const bc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('privacz_channel') : null;
if (bc) {
    bc.postMessage({ type: 'ping', sessionId: mySessionId });
    bc.onmessage = (e) => {
        if (!e.data) return;
        if (e.data.type === 'ping' && e.data.sessionId === mySessionId) {
            bc.postMessage({ type: 'pong', sessionId: mySessionId });
        }
        if (e.data.type === 'pong' && e.data.sessionId === mySessionId) {
            const blocker = document.getElementById('tab-blocker');
            if (blocker) blocker.classList.remove('hidden');
            bc.close();
        }
    };
}`;

code = code.replace(target, '');
fs.writeFileSync('app.js', code);
