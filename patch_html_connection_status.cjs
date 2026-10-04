const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const oldModalText = `Wait in this lobby until all expected peers connect, or click <strong>Continue Anyway</strong> to enter the workspace early.
            </p>

            <button id="btn-continue-host" class="btn pastel-mint btn-large">Continue</button>`;

const newModalText = `Wait in this lobby until all expected peers connect, or click <strong>Continue Anyway</strong> to enter the workspace early.
            </p>

            <div id="host-connection-status" style="margin-bottom: 1rem; font-weight: 600; font-size: 1.1rem; color: var(--text-main); text-align: center;">0 / 1 Guests Connected</div>

            <button id="btn-continue-host" class="btn pastel-mint btn-large">Continue</button>`;

code = code.replace(oldModalText, newModalText);
fs.writeFileSync('index.html', code);
