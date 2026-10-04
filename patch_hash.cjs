const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

code = code.replace(
    /window\.addEventListener\('DOMContentLoaded', \(\) => \{\n    const hash = window\.location\.hash;/g,
    `const hash = window.location.hash;`
);

code = code.replace(
    /        initGuestSignaling\(\);\n    \}\n\}\);\n/g,
    `        initGuestSignaling();\n    }\n\n`
);

fs.writeFileSync('app.js', code);
console.log("Patched!");
