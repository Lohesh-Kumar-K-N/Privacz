const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

// Replace localStorage.setItem in createPeer
code = code.replace(
    /localStorage\.setItem\(\`privacz_\$\{roomID\}_candidate_\$\{myId\}_\$\{Date\.now\(\)\}\`, JSON\.stringify\(\{\n                type: 'candidate',\n                candidate: event\.candidate,\n                from: myId,\n                to: id\n            \}\)\);/g,
    `sendSignaling({ type: 'candidate', candidate: event.candidate, from: myId, to: id });`
);

// We need to replace the whole storage block
