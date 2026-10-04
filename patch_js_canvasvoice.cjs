const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

code = code.replace(
    /document\.getElementById\('btn-canvas-voice'\)\?\.addEventListener\('click', \(\) => \{[\s\S]*?\}\);/,
    `document.getElementById('btn-canvas-voice')?.addEventListener('click', () => {
        if (!localAudioStream) {
            startVoiceCall();
            toast("Voice call started in background.");
        } else {
            toast("Voice call is already active.");
        }
    });`
);

fs.writeFileSync('app.js', code);
console.log("Canvas voice call patched");
