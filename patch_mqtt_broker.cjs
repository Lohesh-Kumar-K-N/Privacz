const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

code = code.replace(
    /wss:\/\/broker\.emqx\.io:8084\/mqtt/g,
    'wss://test.mosquitto.org:8081'
);

fs.writeFileSync('app.js', code);
console.log("Patched back to mosquitto!");
