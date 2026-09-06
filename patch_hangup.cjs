const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

// Replace voice hangup
code = code.replace(/document\.getElementById\('btn-voice-hangup'\)\?\.addEventListener\('click', \(\) => \{[\s\S]*?showView\('view-dashboard'\);\n\}\);/,
`document.getElementById('btn-voice-hangup')?.addEventListener('click', () => {
    if (isHost) {
        broadcast({ type: 'MEDIA_HANGUP', mediaType: 'voice' });
        teardownLocalMedia('voice');
        toast("Master terminated voice link across all peers.");
        navigateApp('dashboard');
    } else {
        toast("Only the Host can terminate this session. You cannot leave while the Host is active.");
    }
});`);

// Replace video hangup
code = code.replace(/document\.getElementById\('btn-video-hangup'\)\?\.addEventListener\('click', \(\) => \{[\s\S]*?showView\('view-dashboard'\);\n\}\);/,
`document.getElementById('btn-video-hangup')?.addEventListener('click', () => {
    if (isHost) {
        broadcast({ type: 'MEDIA_HANGUP', mediaType: 'video' });
        teardownLocalMedia('video');
        toast("Terminated video call across all peers.");
        navigateApp('dashboard');
    } else {
        toast("Only the Host can terminate this session. You cannot leave while the Host is active.");
    }
});`);

fs.writeFileSync('app.js', code);
console.log("Hangup buttons patched");
