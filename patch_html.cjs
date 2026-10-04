const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const previewHtml = `                    <!-- Quoting Snapping Bar -->
                    <div id="chat-quote-bar" class="chat-quote-bar hidden">
                        <span class="quote-text" id="quote-text-preview"></span>
                        <button id="btn-quote-cancel" class="quote-cancel" title="Cancel Quote">×</button>
                    </div>
                    <!-- Audio Preview Bar -->
                    <div id="chat-audio-preview-bar" class="chat-quote-bar hidden" style="justify-content: space-between; padding: 0.5rem 1rem; align-items: center; border-left: 3px solid var(--accent-red);">
                        <div style="display:flex; align-items:center; gap: 10px;">
                            <span style="font-size:1.2rem;">🎙️</span>
                            <audio id="audio-preview-element" controls style="height: 35px; max-width: 200px;"></audio>
                        </div>
                        <div style="display:flex; gap: 10px;">
                            <button id="btn-audio-cancel" class="btn pastel-gray" style="padding: 0.3rem 0.6rem; font-size: 0.85rem;">Discard</button>
                            <button id="btn-audio-send" class="btn pastel-mint" style="padding: 0.3rem 0.6rem; font-size: 0.85rem;">Send</button>
                        </div>
                    </div>`;

html = html.replace(
    /<!-- Quoting Snapping Bar -->[\s\S]*?<\/div>\s*<!-- Chat Bottom Bar -->/,
    previewHtml + "\n                    <!-- Chat Bottom Bar -->"
);

// update title of btn-chat-record
html = html.replace(
    /title="Hold to record voice"/g,
    'title="Press to record voice"'
);

fs.writeFileSync('index.html', html);
console.log("HTML patched.");
