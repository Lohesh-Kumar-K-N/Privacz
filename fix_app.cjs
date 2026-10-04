const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');
code = code.replace(/\\}\\n\\nfunction openHostSetup/g, '}\n\nfunction openHostSetup');
fs.writeFileSync('app.js', code);
