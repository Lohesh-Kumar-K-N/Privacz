const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const replacement = `document.getElementById('btn-canvas-voice')?.addEventListener('click', () => {
    if (!localAudioStream) {
        startVoiceCall();
        toast("Voice call started in background.");
    } else {
        toast("Voice call is already active.");
    }
    const callBtn = document.getElementById('btn-canvas-voice');
    callBtn?.classList.add('calling');
    toast("Pinging Voice Call to all peers...");
    setTimeout(() => callBtn?.classList.remove('calling'), 4000);
});`;

// Remove the badly formatted block
code = code.replace(/document\.getElementById\('btn-canvas-voice'\)\?\.addEventListener\([\s\S]*?\}\);\s*toast\("Pinging[\s\S]*?\}\);/, replacement);

fs.writeFileSync('app.js', code);
console.log("Syntax fixed");
