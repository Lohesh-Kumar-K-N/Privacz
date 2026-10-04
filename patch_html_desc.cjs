const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const oldDesc = '<p class="hero-description">An elite, serverless P2P communication matrix. Experience zero-latency file transfers, encrypted mesh networking, and synchronized collaborative workspaces directly in your browser.</p>';

const newDesc = '<p class="hero-description">An elite, serverless P2P communication matrix.<br><b>Capacity:</b> Up to 8 peers • Unlimited file sizes • Encrypted mesh chat • 480p Thermal Video • Opus Voice Links • Canvas • FIDE Chess.</p>';

code = code.replace(oldDesc, newDesc);
fs.writeFileSync('index.html', code);
