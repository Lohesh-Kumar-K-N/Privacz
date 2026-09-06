const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

code = code.replace(
    /function\(appId\) \{/g,
    "const origShowApp = showApp; showApp = function(appId) {"
);

fs.writeFileSync('app.js', code);
console.log("Patched syntax 2");
