const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

// Add debug logs to guest signaling
code = code.replace(
    /conn\.on\('open', \(\) => \{/g,
    `conn.on('open', () => {\n            console.log('PeerJS connection to host opened.');\n            if (statusEl) statusEl.innerText = 'Relay connected. Handshaking...';`
);

code = code.replace(
    /if \(data\.type === 'offer' && data\.to === myId\) \{/g,
    `if (data.type === 'offer' && data.to === myId) {\n                console.log('Received offer from host.');\n                if (statusEl) statusEl.innerText = 'Received keys. Finalizing tunnel...';`
);

// Host logs
code = code.replace(
    /mySignalingPeer\.on\('connection', \(conn\) => \{/g,
    `mySignalingPeer.on('connection', (conn) => {\n        console.log('A guest connected via PeerJS:', conn.peer);`
);

code = code.replace(
    /if \(data\.type === 'join'\) \{/g,
    `if (data.type === 'join') {\n                console.log('Received join from guest:', data.from);`
);

fs.writeFileSync('app.js', code);
