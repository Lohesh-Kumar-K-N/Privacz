const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const fsLogic = `
const btnFs = document.getElementById('btn-canvas-fullscreen');
if (btnFs) {
    btnFs.addEventListener('click', () => {
        const wrapper = document.getElementById('app-canvas');
        if (!document.fullscreenElement) {
            wrapper.requestFullscreen().catch(err => {
                toast("Error attempting to enable fullscreen: " + err.message);
            });
        } else {
            document.exitFullscreen();
        }
    });
}
`;

code += "\n" + fsLogic;
fs.writeFileSync('app.js', code);
console.log("FS patched");
