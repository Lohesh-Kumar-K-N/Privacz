const fs = require('fs');
let code = fs.readFileSync('styles.css', 'utf8');

const regex1 = /\\.landing-center \\{[\\s\\S]*?\\}/;
code = code.replace(regex1, `.landing-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 6vh auto auto auto;
    text-align: center;
    max-width: 800px;
    padding: 0 1rem;
}`);

const regex2 = /\\.logo \\{[\\s\\S]*?\\}/;
code = code.replace(regex2, `.logo {
    font-family: 'Playfair Display', serif;
    font-weight: 700;
    font-size: clamp(4rem, 12vw, 8.5rem);
    letter-spacing: -1px;
    color: var(--text-main);
    line-height: 1.1;
    user-select: none;
    margin-bottom: 1rem;
}

.hero-description {
    font-size: clamp(1rem, 2.5vw, 1.25rem);
    color: var(--text-muted);
    line-height: 1.6;
    margin-bottom: 2.5rem;
    max-width: 650px;
}`);

fs.writeFileSync('styles.css', code);
