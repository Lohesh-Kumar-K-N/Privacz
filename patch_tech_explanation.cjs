const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const target = `<div class="landing-actions">
                <button id="btn-file-transfer" class="btn btn-hero pastel-blue">File Transfer</button>
                <button id="btn-connect" class="btn btn-hero pastel-mint">Connect</button>
            </div>
        </div>`;

const newCode = `<div class="landing-actions">
                <button id="btn-file-transfer" class="btn btn-hero pastel-blue">File Transfer</button>
                <button id="btn-connect" class="btn btn-hero pastel-mint">Connect</button>
            </div>
            
            <div class="tech-stack-container">
                <div class="tech-card">
                    <div class="tech-anim-mesh">
                        <div class="node n1"></div><div class="node n2"></div><div class="node n3"></div>
                        <div class="line l1"></div><div class="line l2"></div><div class="line l3"></div>
                    </div>
                    <h3>Full Mesh Topology</h3>
                    <p>Unlike centralized servers, every peer connects directly to everyone else. The fewer the peers, the faster and more efficient the matrix becomes.</p>
                </div>
                <div class="tech-card">
                    <div class="tech-anim-pulse">
                        <div class="pulse-ring"></div>
                        <div class="pulse-core"></div>
                    </div>
                    <h3>WebRTC Data Channels</h3>
                    <p>File transfers and chat are chunked and streamed directly across secure browser memory pipes, completely bypassing cloud storage.</p>
                </div>
                <div class="tech-card">
                    <div class="tech-anim-wave">
                        <div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div>
                    </div>
                    <h3>Opus Audio & VP8 Video</h3>
                    <p>Low-latency compression codecs optimize media streams dynamically based on your available direct-peer bandwidth.</p>
                </div>
            </div>
        </div>`;

code = code.replace(target, newCode);
fs.writeFileSync('index.html', code);
