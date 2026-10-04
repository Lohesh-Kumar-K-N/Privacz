const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

code = code.replace(
    /document\.getElementById\('btn-chat-call-voice'\)\?\.addEventListener\('click', \(\) => navigateApp\('voice'\)\);\n\/\*\n        if \(!localAudioStream\) \{\n            startVoiceCall\(\);\n            toast\("Voice call started in background\."\);\n        \} else \{\n            toast\("Voice call is already active\."\);\n        \}\n    \}\);\n/,
    `document.getElementById('btn-chat-call-voice')?.addEventListener('click', () => navigateApp('voice'));\n`
);

fs.writeFileSync('app.js', code);
console.log("Patched!");
