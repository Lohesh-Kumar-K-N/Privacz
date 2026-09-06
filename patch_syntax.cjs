const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

code = code.replace(/    \}\);\n\}\);/, "    });\n}\n\nwindow.addEventListener('DOMContentLoaded', () => {");
fs.writeFileSync('app.js', code);
