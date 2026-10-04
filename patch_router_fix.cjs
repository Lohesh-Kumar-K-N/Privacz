const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

// Switch the generator BACK to hash links
code = code.replace(
    /const shareUrl = \`\$\{origin\}\?file=\$\{roomID\}\`;/g,
    'const shareUrl = `${origin}#file_${roomID}`;'
);

code = code.replace(
    /const shareUrl = \`\$\{origin\}\?session=\$\{roomID\}\`;/g,
    'const shareUrl = `${origin}#session_${roomID}`;'
);

// Completely rewrite the incoming route handler to aggressively handle hashes
// and prevent the UI from overriding it before WebRTC sets up
code = code.replace(
    /function handleIncomingRoute\(\) \{[\s\S]*?window\.addEventListener\('hashchange', \(\) => \{\n    if \(\!isHost && \!mqttClient\) \{\n        handleIncomingRoute\(\);\n    \}\n\}\);/g,
    `function handleIncomingHash() {
    const hash = window.location.hash;
    if (hash && hash.length > 1) {
        let route = hash.substring(1);
        let targetHostId = route;
        if (route.startsWith('file_')) {
            targetHostId = route.replace('file_', '');
            initialRoute = 'isolated-file';
        } else if (route.startsWith('session_')) {
            targetHostId = route.replace('session_', '');
        }
        
        roomID = targetHostId;
        isHost = false;
        hostId = targetHostId;

        const landing = document.getElementById('view-landing');
        if (landing) landing.classList.add('hidden');
        
        const loadingModal = document.getElementById('modal-guest-loading');
        if (loadingModal) loadingModal.classList.remove('hidden');
        
        if (initialRoute === 'isolated-file') {
            const shell = document.getElementById('view-app-shell');
            if (shell) shell.classList.add('isolated-mode');
        }
        
        initGuestSignaling();
    }
}
handleIncomingHash();
window.addEventListener('hashchange', () => {
    if (!isHost && !mqttClient) {
        handleIncomingHash();
    }
});`
);

fs.writeFileSync('app.js', code);
console.log("Patched back to raw hash router!");
