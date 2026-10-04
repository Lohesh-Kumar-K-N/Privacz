const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const target1 = `function openHostSetup() {
    isHost = true;
    roomID = Math.random().toString(36).substring(2, 10);
    document.getElementById('modal-host-setup')?.classList.remove('hidden');`;

const replacement1 = `function openHostSetup() {
    isHost = true;
    roomID = Math.random().toString(36).substring(2, 10);
    document.getElementById('modal-host-setup')?.classList.remove('hidden');
    
    // Instead of doing local storage signaling, we will generate the WebRTC offer 
    // immediately and bake it into the URL hash so it works across the global internet.
    const dummyId = 'peer_' + Math.random().toString(36).substr(2,9);
    peers[dummyId] = createPeer(dummyId, getUniqueColor());
    const dc = peers[dummyId].pc.createDataChannel('privacz');
    setupDataChannel(dc, dummyId);
    peers[dummyId].dc = dc;

    peers[dummyId].pc.createOffer().then(offer => {
        return peers[dummyId].pc.setLocalDescription(offer);
    }).then(() => {
        // We must wait a moment for ICE candidates to gather before generating the URL
        setTimeout(() => {
            const offerData = {
                sdp: peers[dummyId].pc.localDescription,
                hostId: myId
            };
            const b64Offer = btoa(JSON.stringify(offerData));
            const origin = window.location.origin + window.location.pathname;
            const shareUrl = \`\${origin}#join_\${b64Offer}\`;
            
            const urlBox = document.getElementById('host-url-box');
            if (urlBox) urlBox.value = shareUrl;

            const qrImg = document.getElementById('qr-image');
            const qrPlaceholder = document.getElementById('qr-placeholder');
            if (qrImg) {
                qrImg.src = \`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=\${encodeURIComponent(shareUrl)}\`;
                qrImg.onload = () => {
                    qrImg.style.display = 'block';
                    if (qrPlaceholder) qrPlaceholder.style.display = 'none';
                };
            }
        }, 1500); // Wait 1.5s for ICE gathering
    });
`;

code = code.replace(target1, replacement1);
fs.writeFileSync('app.js', code);
