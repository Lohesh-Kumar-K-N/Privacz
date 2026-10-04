const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

code = code.replace(
    /const shareUrl = \`\$\{origin\}#file_\$\{roomID\}\`;/g,
    'const shareUrl = `${origin}?file=${roomID}`;'
);

code = code.replace(
    /const shareUrl = \`\$\{origin\}#session_\$\{roomID\}\`;/g,
    'const shareUrl = `${origin}?session=${roomID}`;'
);

code = code.replace(
    /window\.location\.hash = '';/g,
    "window.location.hash = '';\n    window.history.replaceState({}, document.title, window.location.pathname);"
);

code = code.replace(
    /function handleIncomingHash\(\) \{[\s\S]*?window\.addEventListener\('hashchange', \(\) => \{\n    if \(\!isHost && \!mqttClient\) \{\n        handleIncomingHash\(\);\n    \}\n\}\);/g,
    `function handleIncomingRoute() {
    let route = '';
    const params = new URLSearchParams(window.location.search);
    if (params.has('file')) {
        route = 'file_' + params.get('file');
    } else if (params.has('session')) {
        route = 'session_' + params.get('session');
    } else {
        const hash = window.location.hash;
        if (hash && hash.length > 1) {
            route = hash.substring(1);
        }
    }

    if (route) {
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
handleIncomingRoute();
window.addEventListener('hashchange', () => {
    if (!isHost && !mqttClient) {
        handleIncomingRoute();
    }
});`
);

fs.writeFileSync('app.js', code);
console.log("Patched!");
