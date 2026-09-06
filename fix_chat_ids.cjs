const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(
    '<button class="icon-btn" id="btn-chat-voice" title="Voice Call">🎙️</button>',
    '<button class="icon-btn" id="btn-chat-call-voice" title="Voice Call">🎙️</button>'
);

html = html.replace(
    '<button class="icon-btn" id="btn-chat-voice" title="Hold to record voice" style="color: var(--accent-red);">🎤</button>',
    '<button class="icon-btn" id="btn-chat-record" title="Hold to record voice" style="color: var(--accent-red);">🎤</button>'
);
fs.writeFileSync('index.html', html);

let js = fs.readFileSync('app.js', 'utf8');
js = js.replace(
    /const btnChatVoice = document\.getElementById\('btn-chat-voice'\);/g,
    "const btnChatVoice = document.getElementById('btn-chat-record');"
);

js = js.replace(
    /document\.getElementById\('btn-chat-voice'\)\?\.addEventListener\('click', \(\) => navigateApp\('voice'\)\);/g,
    "document.getElementById('btn-chat-call-voice')?.addEventListener('click', () => navigateApp('voice'));"
);

fs.writeFileSync('app.js', js);
