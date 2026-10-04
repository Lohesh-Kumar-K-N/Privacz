const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

if (css.includes('#view-dashboard {') && !css.includes('overflow-y: auto;', css.indexOf('#view-dashboard {'))) {
    css = css.replace(
        /#view-dashboard \{/,
        '#view-dashboard {\n    overflow-y: auto;\n    overflow-x: hidden;'
    );
}

// Also let's fix dashboard-content justify-content on mobile
css = css.replace(
    /\.dashboard-content \{[\s\S]*?justify-content: center;/g,
    (match) => match.replace('justify-content: center;', 'justify-content: flex-start;')
);

fs.writeFileSync('styles.css', css);
