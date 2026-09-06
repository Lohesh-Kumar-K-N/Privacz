const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const regex = /\\/\\/ --- SECTION 1: TAB DUPLICATION SAFEGUARD ---[\\s\\S]*?\\/\\/ --- SECTION 1: ANTI-OBSTRUCTION NOTIFICATION STACKING GRID ---/;
code = code.replace(regex, '// --- SECTION 1: ANTI-OBSTRUCTION NOTIFICATION STACKING GRID ---');

fs.writeFileSync('app.js', code);
