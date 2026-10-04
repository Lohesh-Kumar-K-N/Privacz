const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(
    '<button class="btn pastel-mint" id="btn-video-cam">Cam Toggle</button>',
    '<button class="btn pastel-mint" id="btn-video-cam">Cam Toggle</button>\n<button class="btn pastel-purple" id="btn-video-switch">🔄 Flip</button>'
);

fs.writeFileSync('index.html', html);
console.log("Cam HTML patched");
