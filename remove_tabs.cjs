const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const regex = /<!-- Google Search Submenu Interface Layout -->[\\s\\S]*?<\/div>\\s*<\/div>\\s*<\/div>/;
code = code.replace(regex, '');
fs.writeFileSync('index.html', code);
