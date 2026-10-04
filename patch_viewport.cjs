const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const viewportFix = `
// Mobile Keyboard Visual Viewport Fix
if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
        document.body.style.height = window.visualViewport.height + 'px';
        window.scrollTo(0, 0);
    });
}
`;

if (!code.includes('Mobile Keyboard Visual Viewport Fix')) {
    code = code.replace(/window\.addEventListener\('DOMContentLoaded', \(\) => \{/, viewportFix + "\nwindow.addEventListener('DOMContentLoaded', () => {");
    fs.writeFileSync('app.js', code);
    console.log("Visual Viewport fix added");
}
