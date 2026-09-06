const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const m1 = code.match(/function streamFile[\s\S]*?readNextChunk\(\);\n\}/);
if (m1) console.log(m1[0]);

const m2 = code.match(/function handleFileTelemetry[\s\S]*?\n\}/);
if (m2) console.log(m2[0]);
