const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

code = code.replace(/case 'NAV_SWITCH':/,
`case 'NAV_DASHBOARD':
            showView('view-dashboard');
            toast('Host returned to Spaces.');
            break;

        case 'NAV_SWITCH':`);

fs.writeFileSync('app.js', code);
console.log("Nav patched part 2");
