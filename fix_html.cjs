const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldHead = `<body>            <h1>Session Duplicated</h1>            <p>Multiple tabs detected. Active network mesh routing protected to prevent topology collapse.</p>            <p class="subtext">Please return to your primary active tab.</p>        </div>    </div>`;

const newHead = `<body>
    <!-- Tab Blocker Guard -->
    <div id="tab-blocker" class="hidden" style="position: fixed; inset: 0; background: var(--bg-main); z-index: 9999; display: flex; align-items: center; justify-content: center; text-align: center; flex-direction: column;">
        <div>
            <h1>Session Duplicated</h1>
            <p>Multiple tabs detected. Active network mesh routing protected to prevent topology collapse.</p>
            <p class="subtext">Please return to your primary active tab.</p>
        </div>
    </div>`;

// Wait, let's just do a regex replace for the top of the body
html = html.replace(/<body>\s*<h1>Session Duplicated<\/h1>/, `<body>\n    <div id="tab-blocker" class="hidden" style="position: fixed; inset: 0; background: var(--bg-main); z-index: 9999; display: flex; align-items: center; justify-content: center; text-align: center; flex-direction: column;">\n        <div>\n            <h1>Session Duplicated</h1>`);
html = html.replace(/<p class="subtext">Please return to your primary active tab\.<\/p>\s*<\/div>\s*<\/div>/, `<p class="subtext">Please return to your primary active tab.</p>\n        </div>\n    </div>`);

fs.writeFileSync('index.html', html);
