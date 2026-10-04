const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

code = code.replace(/function navigateApp\(targetApp\) \{[\s\S]*?\}\n\n\/\/ OS Grid/, 
`function navigateApp(targetApp) {
    if (targetApp === 'dashboard') {
        if (!isHost && Object.keys(peers).length > 0) {
            toast("Only the Host can change the active workspace.");
            return;
        }
        showView('view-dashboard');
        if (isHost) broadcast({ type: 'NAV_DASHBOARD' });
        return;
    }

    if (isHost) {
        showApp(targetApp);
        broadcast({ type: 'NAV_SWITCH', target: targetApp });
    } else {
        toast("Waiting for Host's approval to launch " + targetApp + "...");
        sendToHost({ type: 'NAV_REQUEST', target: targetApp, from: myColor });
    }
}

// OS Grid`);

code = code.replace(/document\.getElementById\('btn-back-dashboard'\)\?\.addEventListener\('click', \(\) => \{[\s\S]*?\}\);/,
`document.getElementById('btn-back-dashboard')?.addEventListener('click', () => {
    navigateApp('dashboard');
});`);

fs.writeFileSync('app.js', code);
console.log("Nav patched part 1");
