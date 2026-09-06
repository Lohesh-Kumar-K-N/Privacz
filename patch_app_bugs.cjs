const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

// 1. Fix broadcast stringifying ArrayBuffer
code = code.replace(
    /const payload = typeof msg === 'string' \? msg : JSON\.stringify\(msg\);/g,
    `const payload = (typeof msg === 'string' || msg instanceof ArrayBuffer) ? msg : JSON.stringify(msg);`
);

// 2. Fix getUniqueColor picking the same color sequentially on local load
const oldColorLogic = `function getUniqueColor() {
    for (let c of COLOR_PALETTE) {
        if (!assignedColors.includes(c.name)) {
            assignedColors.push(c.name);
            return c.name;
        }
    }
    return 'Peer-' + Math.floor(Math.random() * 900 + 100);
}`;

const newColorLogic = `function getUniqueColor() {
    let unassigned = COLOR_PALETTE.filter(c => !assignedColors.includes(c.name));
    if (unassigned.length === 0) unassigned = COLOR_PALETTE;
    const choice = unassigned[Math.floor(Math.random() * unassigned.length)];
    assignedColors.push(choice.name);
    return choice.name;
}`;

code = code.replace(oldColorLogic, newColorLogic);

fs.writeFileSync('app.js', code);
