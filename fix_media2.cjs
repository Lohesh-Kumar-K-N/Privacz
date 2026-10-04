const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const regex = /    if \(stream\.getAudioTracks\(\)\.length > 0\) \{\n        renderVoiceParticipant\(peerColor, false\);\n    \}\n\}/;

code = code.replace(regex, '');
fs.writeFileSync('app.js', code);
console.log("Patched media 2");
