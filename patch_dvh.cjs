const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

css = css.replace(/body, html \{\s*background-color: var\(--bg-main\);\s*color: var\(--text-main\);\s*height: 100vh;/, 
"body, html {\\n    background-color: var(--bg-main);\\n    color: var(--text-main);\\n    height: 100dvh;");

css = css.replace(/\.viewport \{\s*height: 100vh;/,
".viewport {\\n    height: 100dvh;");

fs.writeFileSync('styles.css', css);
console.log("CSS patched for dvh");
