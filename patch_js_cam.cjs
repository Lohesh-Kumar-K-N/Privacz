const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const camToggleCode = `
let currentFacingMode = 'user';
document.getElementById('btn-video-switch')?.addEventListener('click', async () => {
    if (!localVideoStream) return;
    currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
    
    // Stop old video tracks
    localVideoStream.getVideoTracks().forEach(t => t.stop());
    
    try {
        const newStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: currentFacingMode, width: 640, height: 480, frameRate: 24 }
        });
        const newVideoTrack = newStream.getVideoTracks()[0];
        
        // Replace in local stream
        localVideoStream.removeTrack(localVideoStream.getVideoTracks()[0]);
        localVideoStream.addTrack(newVideoTrack);
        
        // Replace in peers
        Object.values(peers).forEach(peer => {
            const sender = peer.pc.getSenders().find(s => s.track && s.track.kind === 'video');
            if (sender) {
                sender.replaceTrack(newVideoTrack);
            }
        });
        
        // Re-render local video
        renderVideoCell('local', localVideoStream, \`\${myColor} (You)\`);
        toast("Camera switched.");
    } catch (err) {
        toast("Error switching camera.");
    }
});
`;

code = code.replace(/async function startVideoCall\(\) \{/, camToggleCode + '\nasync function startVideoCall() {');
code = code.replace(
    /video: \{ width: 640, height: 480, frameRate: 24 \}/g,
    "video: { facingMode: currentFacingMode, width: 640, height: 480, frameRate: 24 }"
);

fs.writeFileSync('app.js', code);
console.log("Camera flip patched");
