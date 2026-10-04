const fs = require('fs');
const code = fs.readFileSync('app.js', 'utf8');

// Print guest signaling block to see exactly what happens
console.log(code.match(/function initGuestSignaling\(\) \{[\s\S]*?\n\}/)[0]);
