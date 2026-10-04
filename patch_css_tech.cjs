const fs = require('fs');
let code = fs.readFileSync('styles.css', 'utf8');

code += `
/* Tech Stack Explanation Layout */
.tech-stack-container {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    margin-top: 4rem;
    justify-content: center;
    width: 100%;
}

.tech-card {
    background: var(--bg-card);
    border: 1px solid var(--border-soft);
    border-radius: 12px;
    padding: 1.5rem;
    width: 250px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: transform 0.2s;
}
.tech-card:hover {
    transform: translateY(-2px);
}

.tech-card h3 {
    font-size: 1.05rem;
    color: var(--text-main);
    margin: 1rem 0 0.5rem 0;
}
.tech-card p {
    font-size: 0.85rem;
    color: var(--text-muted);
    line-height: 1.5;
    margin: 0;
}

/* Animations */
.tech-anim-mesh {
    position: relative;
    width: 50px;
    height: 50px;
}
.tech-anim-mesh .node {
    position: absolute;
    width: 12px;
    height: 12px;
    background: var(--pastel-blue);
    border-radius: 50%;
}
.tech-anim-mesh .n1 { top: 0; left: 19px; }
.tech-anim-mesh .n2 { bottom: 0; left: 0; }
.tech-anim-mesh .n3 { bottom: 0; right: 0; }
.tech-anim-mesh .line {
    position: absolute;
    background: var(--border-soft);
    height: 2px;
    transform-origin: left center;
}
.tech-anim-mesh .l1 { top: 6px; left: 25px; width: 35px; transform: rotate(120deg); }
.tech-anim-mesh .l2 { top: 6px; left: 25px; width: 35px; transform: rotate(60deg); }
.tech-anim-mesh .l3 { bottom: 5px; left: 6px; width: 38px; transform: rotate(0deg); }

.tech-anim-pulse {
    position: relative;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.pulse-core {
    width: 16px;
    height: 16px;
    background: var(--pastel-mint);
    border-radius: 50%;
    z-index: 2;
}
.pulse-ring {
    position: absolute;
    width: 16px;
    height: 16px;
    background: var(--pastel-mint);
    border-radius: 50%;
    animation: pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
}
@keyframes pulse-ring {
    0% { transform: scale(1); opacity: 0.8; }
    100% { transform: scale(3); opacity: 0; }
}

.tech-anim-wave {
    display: flex;
    gap: 4px;
    height: 30px;
    align-items: flex-end;
    margin-top: 10px;
    margin-bottom: 10px;
}
.tech-anim-wave .bar {
    width: 6px;
    background: var(--pastel-pink);
    border-radius: 3px;
    animation: wave-bar 1s ease-in-out infinite alternate;
}
.tech-anim-wave .bar:nth-child(1) { height: 10px; animation-delay: 0s; }
.tech-anim-wave .bar:nth-child(2) { height: 25px; animation-delay: 0.2s; }
.tech-anim-wave .bar:nth-child(3) { height: 15px; animation-delay: 0.4s; }
.tech-anim-wave .bar:nth-child(4) { height: 30px; animation-delay: 0.6s; }

@keyframes wave-bar {
    0% { height: 10px; }
    100% { height: 30px; }
}
`;
fs.writeFileSync('styles.css', code);
