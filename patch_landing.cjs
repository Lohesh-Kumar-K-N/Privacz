const fs = require('fs');

// Patch CSS
let css = fs.readFileSync('styles.css', 'utf8');

// Ensure #view-landing is scrollable
if (css.includes('#view-landing {') && !css.includes('overflow-y: auto;')) {
    css = css.replace(
        /#view-landing \{/,
        '#view-landing {\n    overflow-y: auto;\n    overflow-x: hidden;'
    );
}
fs.writeFileSync('styles.css', css);

// Patch HTML Text
let html = fs.readFileSync('index.html', 'utf8');

const oldHero = `<p class="hero-description">An elite, serverless P2P communication matrix.<br><b>Capacity:</b> Up to 8 peers • Unlimited file sizes • Encrypted mesh chat • 480p Thermal Video • Opus Voice Links • Canvas • FIDE Chess.</p>`;
const newHero = `<p class="hero-description" style="max-width: 800px; margin: 0 auto 2rem auto; line-height: 1.6;">
    A 100% serverless, zero-dependency, ultra-low latency Peer-to-Peer (P2P) collaborative workspace.<br>
    <b>Features:</b> End-to-End P2P Architecture • Global Serverless Handshake • Secure File Transfer • Collaborative Canvas • Voice Messaging • Built-in Chess.
</p>`;

html = html.replace(oldHero, newHero);

const oldCard1 = `<h3>Full Mesh Topology</h3>
                    <p>Unlike centralized servers, every peer connects directly to everyone else. The fewer the peers, the faster and more efficient the matrix becomes.</p>`;
const newCard1 = `<h3>End-to-End P2P Architecture</h3>
                    <p>All chat messages, file chunks, and voice data stream directly from browser to browser via WebRTC DataChannels. No data is ever stored on a centralized database.</p>`;

html = html.replace(oldCard1, newCard1);

const oldCard2 = `<h3>WebRTC Data Channels</h3>
                    <p>File transfers and chat are chunked and streamed directly across secure browser memory pipes, completely bypassing cloud storage.</p>`;
const newCard2 = `<h3>Global Serverless Handshake</h3>
                    <p>Uses a free global relay strictly as an ephemeral mailman to swap initial cryptographic connection keys across the open internet, dropping out immediately once the P2P tunnel is established.</p>`;

html = html.replace(oldCard2, newCard2);

const oldCard3 = `<h3>Opus Audio & VP8 Video</h3>
                    <p>Low-latency compression codecs optimize media streams dynamically based on your available direct-peer bandwidth.</p>`;
const newCard3 = `<h3>Collaborative Features</h3>
                    <p>Draw, sketch, and brainstorm in real-time. Send massive files without cloud storage limits, exchange voice snippets, and play real-time chess with your connected peers.</p>`;

html = html.replace(oldCard3, newCard3);

fs.writeFileSync('index.html', html);
