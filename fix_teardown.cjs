const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const regex = /function teardownLocalMedia\(type\) \{([\s\S]*?)function/m;

code = code.replace(regex, `function teardownLocalMedia(type) {
    if (type === 'voice' || type === 'all') {
        if (localAudioStream) {
            localAudioStream.getTracks().forEach(t => t.stop());
            localAudioStream = null;
        }
        const vPart = document.getElementById('voice-participants');
        if (vPart) vPart.innerHTML = '';
    }
    if (type === 'video' || type === 'all') {
        if (localVideoStream) {
            localVideoStream.getTracks().forEach(t => t.stop());
            localVideoStream = null;
        }
        if (screenStream) {
            screenStream.getTracks().forEach(t => t.stop());
            screenStream = null;
        }
        const vGrid = document.getElementById('video-grid');
        if (vGrid) vGrid.innerHTML = '';
    }
    // Remove senders from peers to stop sending
    Object.values(peers).forEach(peer => {
        if (peer.pc) {
            peer.pc.getSenders().forEach(sender => {
                if (sender.track && sender.track.kind === (type === 'voice' ? 'audio' : 'video')) {
                    peer.pc.removeTrack(sender);
                }
            });
        }
    });
}
function`);

fs.writeFileSync('app.js', code);
console.log("Patched teardown");
