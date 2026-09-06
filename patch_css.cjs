const fs = require('fs');
let code = fs.readFileSync('styles.css', 'utf8');

code = code.replace(
    /\\.landing-center \\{\\s*display: flex;\\s*flex-direction: column;\\s*align-items: center;\\s*margin: auto 0;\\s*\\}/,
    `.landing-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 10vh auto auto auto;
    text-align: center;
    max-width: 800px;
    padding: 0 1rem;
}`
);

code = code.replace(
    /\\.logo \\{\\s*font-family: 'Montserrat', sans-serif;\\s*font-weight: 900;\\s*font-size: clamp\\(3\\.5rem, 11vw, 7\\.5rem\\);\\s*letter-spacing: -2px;\\s*color: var\\(--text-main\\);\\s*line-height: 1;\\s*user-select: none;\\s*margin-bottom: 2rem;\\s*\\}/,
    `.logo {
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
    font-size: clamp(1.1rem, 2.5vw, 1.4rem);
    color: var(--text-muted);
    line-height: 1.6;
    margin-bottom: 2.5rem;
    max-width: 650px;
}`
);

// We should also remove the google tabs if the user felt it was unprofessional and small.
// Actually, let's keep the google tabs but hide them on desktop if they want a clean page, or maybe just remove them.
// Let's just leave google tabs as they are since the prompt just asked to move the 2 button up and change description.

fs.writeFileSync('styles.css', code);
