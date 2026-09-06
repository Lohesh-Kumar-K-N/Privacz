const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

css = css.replace(
    /#view-dashboard \{/,
    '#view-dashboard {\n    overflow-y: auto;\n    overflow-x: hidden;'
);

fs.writeFileSync('styles.css', css);
