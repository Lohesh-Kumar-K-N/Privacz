const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

code = code.replace(
    /await peers\[data\.from\]\.pc\.setRemoteDescription\(new RTCSessionDescription\(data\.sdp\)\);\n\s*updatePresence\(\);/g,
    `await peers[data.from].pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
                if (peers[data.from].candidateQueue) {
                    for (let c of peers[data.from].candidateQueue) {
                        try { await peers[data.from].pc.addIceCandidate(new RTCIceCandidate(c)); } catch(e){}
                    }
                    peers[data.from].candidateQueue = [];
                }
                updatePresence();`
);

code = code.replace(
    /await peers\[hostId\]\.pc\.setRemoteDescription\(new RTCSessionDescription\(data\.sdp\)\);\n\s*const answer = await peers\[hostId\]\.pc\.createAnswer\(\);/g,
    `await peers[hostId].pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
                if (peers[hostId].candidateQueue) {
                    for (let c of peers[hostId].candidateQueue) {
                        try { await peers[hostId].pc.addIceCandidate(new RTCIceCandidate(c)); } catch(e){}
                    }
                    peers[hostId].candidateQueue = [];
                }
                const answer = await peers[hostId].pc.createAnswer();`
);

fs.writeFileSync('app.js', code);
console.log("Patched!");
