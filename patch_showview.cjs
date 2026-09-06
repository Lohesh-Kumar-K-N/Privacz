const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const oldShowView = `function showView(viewId) {
    document.querySelectorAll('.viewport').forEach(v => v.classList.add('hidden'));
    const target = document.getElementById(viewId);
    if (target) target.classList.remove('hidden');
}`;

const newShowView = `function showView(viewId) {
    document.querySelectorAll('.viewport').forEach(v => v.classList.add('hidden'));
    const target = document.getElementById(viewId);
    if (target) target.classList.remove('hidden');

    if (viewId === 'view-dashboard') {
        const landing = document.getElementById('view-landing');
        if (landing) landing.remove();
    }
}`;

code = code.replace(oldShowView, newShowView);
fs.writeFileSync('app.js', code);
