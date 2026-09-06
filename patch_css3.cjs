const fs = require('fs');
let code = fs.readFileSync('styles.css', 'utf8');

const oldCenter = `.landing-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: auto 0;
}`;

const newCenter = `.landing-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 6vh auto auto auto;
    text-align: center;
    max-width: 800px;
    padding: 0 1rem;
}`;

const oldLogo = `.logo {
    font-family: 'Montserrat', sans-serif;
    font-weight: 900;
    font-size: clamp(3.5rem, 11vw, 7.5rem);
    letter-spacing: -2px;
    color: var(--text-main);
    line-height: 1;
    user-select: none;
    margin-bottom: 2rem;
}`;

const newLogo = `.logo {
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
}`;

code = code.replace(oldCenter, newCenter);
code = code.replace(oldLogo, newLogo);

fs.writeFileSync('styles.css', code);
