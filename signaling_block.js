// SERVERLESS WEBRTC SIGNALING PIPELINE (STORAGE & BROADCAST ENGINE)
// ============================================================================
function initGuestSignaling() {
    const statusEl = document.getElementById('guest-status');
    if (statusEl) statusEl.innerText = 'Binding WebRTC channels...';

    // Send join packet via storage bus
    localStorage.setItem(`privacz_${roomID}_join_${myId}`, JSON.stringify({
        type: 'join',
        from: myId,
        color: myColor
    }));
}

function broadcast(msg) {
    const payload = typeof msg === 'string' ? msg : JSON.stringify(msg);
    Object.values(peers).forEach(peer => {
        if (peer.dc && peer.dc.readyState === 'open') {
            try { peer.dc.send(payload); } catch(e) {}
        }
    });
}

function sendToHost(msg) {
    broadcast(msg);
}

window.addEventListener('storage', async (e) => {
    if (!e.key || !e.key.startsWith(`privacz_${roomID}_`)) return;
    if (!e.newValue) return;
    let data;
    try {
        data = JSON.parse(e.newValue);
    } catch (err) {
        return;
    }
    if (!data || data.from === myId) return;

    try {
        if (isHost) {
            if (data.type === 'join') {
                const guestId = data.from;
                if (!peers[guestId]) {
                    peers[guestId] = createPeer(guestId, data.color);
                    const dc = peers[guestId].pc.createDataChannel('privacz');
                    setupDataChannel(dc, guestId);
                    peers[guestId].dc = dc;

                    const offer = await peers[guestId].pc.createOffer();
                    await peers[guestId].pc.setLocalDescription(offer);
                    localStorage.setItem(`privacz_${roomID}_offer_${guestId}`, JSON.stringify({
                        type: 'offer',
                        sdp: offer,
                        from: myId,
                        to: guestId,
                        hostColor: myColor
                    }));
                }
            }
            if (data.type === 'answer' && data.to === myId && peers[data.from]) {
                await peers[data.from].pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
                updatePresence();
            }
            if (data.type === 'candidate' && data.to === myId && peers[data.from]) {
                await peers[data.from].pc.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
        } else {
            if (data.type === 'offer' && data.to === myId) {
                const hostId = data.from;
                if (!peers[hostId]) {
                    peers[hostId] = createPeer(hostId, data.hostColor || 'Host');
                    peers[hostId].pc.ondatachannel = (event) => {
                        peers[hostId].dc = event.channel;
                        setupDataChannel(event.channel, hostId);
                    };
                }
                await peers[hostId].pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
                const answer = await peers[hostId].pc.createAnswer();
                await peers[hostId].pc.setLocalDescription(answer);
                localStorage.setItem(`privacz_${roomID}_answer_${myId}`, JSON.stringify({
                    type: 'answer',
                    sdp: answer,
                    from: myId,
                    to: hostId
                }));
            }
            if (data.type === 'candidate' && data.to === myId && peers[data.from]) {
                await peers[data.from].pc.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
        }
    } catch (err) {
        console.warn("Signaling notification:", err);
    }
});
