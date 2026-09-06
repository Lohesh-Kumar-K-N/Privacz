const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

code = code.replace(/audio\.srcObject = stream;\n    \}/, "audio.srcObject = stream;\n        if (typeof updateTeamAudioIsolation === 'function') updateTeamAudioIsolation();\n    }");

fs.writeFileSync('app.js', code);
console.log("Team audio incoming patched");
