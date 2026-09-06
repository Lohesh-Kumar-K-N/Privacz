const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const regex = /function handleIncomingMediaStream\(stream, peerColor\) \{([\s\S]*?)\}/;

code = code.replace(regex, `function handleIncomingMediaStream(stream, peerColor) {
    if (stream.getVideoTracks().length > 0) {
        renderVideoCell(peerColor, stream, peerColor);
    } else if (stream.getAudioTracks().length > 0) {
        renderVoiceParticipant(peerColor, false);
        let audio = document.getElementById('audio-stream-' + peerColor);
        if (!audio) {
            audio = document.createElement('audio');
            audio.id = 'audio-stream-' + peerColor;
            audio.autoplay = true;
            document.body.appendChild(audio);
        }
        audio.srcObject = stream;
    }
}`);

fs.writeFileSync('app.js', code);
console.log("Patched media");
