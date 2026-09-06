const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

css = css.replace(
    /canvas \{/,
    'canvas {\n    max-width: 100%;\n    max-height: 100%;\n    object-fit: contain;\n    box-shadow: 0 4px 6px rgba(0,0,0,0.1);\n'
);

css = css.replace(
    /\.canvas-board-wrapper \{/,
    '.canvas-board-wrapper {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    position: relative;\n'
);

fs.writeFileSync('styles.css', css);
console.log("CSS patched");
