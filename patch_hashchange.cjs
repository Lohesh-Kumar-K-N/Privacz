const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

code = code.replace(
    /const hash = window\.location\.hash;\n    if \(hash && hash\.length > 1\) \{[\s\S]*?initGuestSignaling\(\);\n    \}\n/g,
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
});
`
);

fs.writeFileSync('app.js', code);
console.log("Patched!");
