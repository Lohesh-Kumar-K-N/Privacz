const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

code = code.replace(
    /document\.getElementById\('btn-chat-call-voice'\)\?\.addEventListener\('click', \(\) => navigateApp\('voice'\)\);/,
    `document.getElementById('btn-chat-call-voice')?.addEventListener('click', () => {
        if (!localAudioStream) {
            startVoiceCall();
            toast("Voice call started in background.");
        } else {
            toast("Voice call is already active.");
        }
    });`
);

fs.writeFileSync('app.js', code);
console.log("Chat voice call patched");
