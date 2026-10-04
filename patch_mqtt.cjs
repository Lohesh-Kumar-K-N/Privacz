const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

// Replace PeerJS signaling with MQTT signaling
const mqttSignalingBlock = `// ============================================================================
// SERVERLESS WEBRTC SIGNALING PIPELINE (MQTT WEBSOCKET RELAY)
// ============================================================================

let mqttClient = null;

function initHostSignaling() {
    if (mqttClient) mqttClient.end();
    mqttClient = mqtt.connect('wss://test.mosquitto.org:8081');
    
    mqttClient.on('connect', () => {
        console.log('Host connected to MQTT relay.');
        mqttClient.subscribe(\`privacz/\${roomID}/host\`);
    });

    mqttClient.on('message', (topic, message) => {
        try {
            const data = JSON.parse(message.toString());
            handleSignalingData(data, data.from);
        } catch (e) { }
    });
}

function initGuestSignaling() {
    const statusEl = document.getElementById('guest-status');
    if (statusEl) statusEl.innerText = 'Connecting to Global Relay...';
    
    if (mqttClient) mqttClient.end();
    mqttClient = mqtt.connect('wss://test.mosquitto.org:8081');
    
    mqttClient.on('connect', () => {
        if (statusEl) statusEl.innerText = 'Binding WebRTC channels...';
        console.log('Guest connected to MQTT relay.');
        
        mqttClient.subscribe(\`privacz/\${roomID}/guest/\${myId}\`);
        
        // Send join packet to host
        sendSignaling({
            type: 'join',
            from: myId,
            color: myColor
        });
    });

    mqttClient.on('message', (topic, message) => {
        try {
            const data = JSON.parse(message.toString());
            handleSignalingData(data, 'host');
        } catch (e) { }
    });
    
    mqttClient.on('error', (err) => {
        if (statusEl) statusEl.innerText = 'Connection failed. Relay might be offline.';
        console.error('Signaling Error:', err);
    });
}

function sendSignaling(data) {
    if (!mqttClient || !mqttClient.connected) return;
    
    const payload = JSON.stringify(data);
    if (isHost) {
        if (data.to) {
            mqttClient.publish(\`privacz/\${roomID}/guest/\${data.to}\`, payload);
        } else {
            // broadcast not strictly needed for signaling right now, but we can do it if required
        }
    } else {
        mqttClient.publish(\`privacz/\${roomID}/host\`, payload);
    }
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

async function handleSignalingData(data, sourcePeerId) {
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
                    sendSignaling({
                        type: 'offer',
                        sdp: offer,
                        from: myId,
                        to: guestId,
                        hostColor: myColor
                    });
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
                sendSignaling({
                    type: 'answer',
                    sdp: answer,
                    from: myId,
                    to: hostId
                });
            }
            if (data.type === 'candidate' && data.to === myId && peers[data.from]) {
                await peers[data.from].pc.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
        }
    } catch (err) {
        console.warn("Signaling notification:", err);
    }
}
`;

const oldBlockRegex = /\/\/ ============================================================================\n\/\/ SERVERLESS WEBRTC SIGNALING PIPELINE[\s\S]*?console\.warn\("Signaling notification:", err\);\n    \}\n\}\n/m;

code = code.replace(oldBlockRegex, mqttSignalingBlock);

fs.writeFileSync('app.js', code);
