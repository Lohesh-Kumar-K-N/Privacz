const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

code = code.replace(
    /mqttClient\.subscribe\(\`privacz\/\$\{roomID\}\/guest\/\$\{myId\}\`\);\n\s*\/\/ Send join packet to host\n\s*sendSignaling\(\{\n\s*type: 'join',\n\s*from: myId,\n\s*color: myColor\n\s*\}\);/g,
    `mqttClient.subscribe(\`privacz/\${roomID}/guest/\${myId}\`, () => {
            // Send join packet to host only after we are definitely subscribed
            sendSignaling({
                type: 'join',
                from: myId,
                color: myColor
            });
        });`
);

fs.writeFileSync('app.js', code);
console.log("Patched!");
