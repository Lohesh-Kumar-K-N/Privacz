const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const replacement = `
            if (data.type === 'answer' && data.to === myId && peers[data.from]) {
                await peers[data.from].pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
                updatePresence();
            }
            if (data.type === 'offer' && data.to === myId && peers[data.from]) {
                await peers[data.from].pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
                const answer = await peers[data.from].pc.createAnswer();
                await peers[data.from].pc.setLocalDescription(answer);
                sendSignaling({
                    type: 'answer',
                    sdp: answer,
                    from: myId,
                    to: data.from
                });
            }
            if (data.type === 'candidate' && data.to === myId && peers[data.from]) {
`;

code = code.replace(
    /if \(data\.type === 'answer' && data\.to === myId && peers\[data\.from\]\) \{[\s\S]*?if \(data\.type === 'candidate' && data\.to === myId && peers\[data\.from\]\) \{/,
    replacement.trim() + "\n            if (data.type === 'candidate' && data.to === myId && peers[data.from]) {"
);

fs.writeFileSync('app.js', code);
console.log("Patched host offer");
