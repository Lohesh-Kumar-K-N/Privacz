const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');
code = code.replace(
    'Click <strong>Continue</strong> to enter the workspace right away and prepare your tools while waiting for guests.',
    'Wait in this lobby until all expected peers connect, or click <strong>Continue Anyway</strong> to enter the workspace early.'
);
fs.writeFileSync('index.html', code);
