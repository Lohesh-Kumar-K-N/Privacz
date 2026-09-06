const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

code = code.replace(
    /if \(data\.type === 'candidate' && data\.to === myId && peers\[data\.from\]\) \{\n\s*await peers\[data\.from\]\.pc\.addIceCandidate\(new RTCIceCandidate\(data\.candidate\)\);\n\s*\}/g,
    `if (data.type === 'candidate' && data.to === myId && peers[data.from]) {
                try {
                    await peers[data.from].pc.addIceCandidate(new RTCIceCandidate(data.candidate));
                } catch (e) {
                    // If remote description is not set yet, queue the candidate
                    if (!peers[data.from].candidateQueue) peers[data.from].candidateQueue = [];
                    peers[data.from].candidateQueue.push(data.candidate);
                }
            }`
);

fs.writeFileSync('app.js', code);
console.log("Patched!");
