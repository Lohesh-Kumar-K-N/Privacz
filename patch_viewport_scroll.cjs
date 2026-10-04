const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const scrollFix = `
// Mobile Keyboard Visual Viewport Fix
if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
        document.body.style.height = window.visualViewport.height + 'px';
        window.scrollTo(0, 0);
        
        // Ensure chat scrolls to bottom if keyboard pops up
        const chatBox = document.getElementById('chat-messages');
        if (chatBox) {
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    });
}
`;

code = code.replace(/\/\/ Mobile Keyboard Visual Viewport Fix[\s\S]*?\}\n\}/, scrollFix.trim());
fs.writeFileSync('app.js', code);
console.log("Viewport scroll fix added");
