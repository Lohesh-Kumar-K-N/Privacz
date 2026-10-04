const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const hashLogic = `// Check if loaded with hash (Guest View)
window.addEventListener('DOMContentLoaded', () => {
    const hash = window.location.hash;
    if (hash && hash.length > 1) {
        let route = hash.substring(1);
        let targetHostId = route;
        if (route.startsWith('ft-')) {
            targetHostId = route.replace('ft-', '');
            initialRoute = 'isolated-file';
        }
        
        isHost = false;
        hostId = targetHostId;
        myId = generateId();
        myColor = 'Peer_' + myId.substring(0, 4);

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
});
`;

code = code.replace(/window\.addEventListener\('DOMContentLoaded', \(\) => \{\s*\/\/\s*============================================================================/, hashLogic + "\n// ============================================================================");

fs.writeFileSync('app.js', code);
