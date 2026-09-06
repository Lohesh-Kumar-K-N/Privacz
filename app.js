// ============================================================================
// PRIVACZ MULTI-PEER BROWSER ENGINE (VANILLA JAVASCRIPT ES6+)
// Zero-Server WebRTC P2P Architecture with Complete Application Ecosystem
// ============================================================================



// --- SECTION 1: ANTI-OBSTRUCTION NOTIFICATION STACKING GRID ---
function toast(msg, options = {}) {
    const stack = document.getElementById('notification-stack');
    if (!stack) return null;
    const el = document.createElement('div');
    el.className = 'toast';
    
    let html = `<div class="toast-header"><span>${msg}</span><button class="dismiss" title="Close">×</button></div>`;
    if (options.isAction) {
        html += `<div class="toast-actions">
            <button class="accept">${options.acceptText || 'Accept'}</button>
            <button class="decline">${options.declineText || 'Decline'}</button>
        </div>`;
    }
    el.innerHTML = html;
    
    const dismissBtn = el.querySelector('.dismiss');
    dismissBtn.onclick = () => {
        el.remove();
        if (options.onDismiss) options.onDismiss();
    };

    if (options.isAction) {
        const accBtn = el.querySelector('.accept');
        const decBtn = el.querySelector('.decline');
        accBtn.onclick = () => {
            if (options.onAccept) options.onAccept();
            el.remove();
        };
        decBtn.onclick = () => {
            if (options.onDecline) options.onDecline();
            el.remove();
        };
    } else {
        setTimeout(() => {
            if (el.parentNode) el.remove();
        }, 4000);
    }

    stack.appendChild(el);
    return el;
}

// --- COLOR IDENTITIES (NETWORK-WIDE NON-COLLIDING) ---
const COLOR_PALETTE = [
    { name: 'Soft-Mint', bg: '#a3be8c', text: '#1e293b' },
    { name: 'Pastel-Blue', bg: '#88c0d0', text: '#1e293b' },
    { name: 'Lilac-Mists', bg: '#b48ead', text: '#ffffff' },
    { name: 'Peach-Blush', bg: '#d08770', text: '#ffffff' },
    { name: 'Sunset-Gold', bg: '#ebcb8b', text: '#1e293b' },
    { name: 'Slate-Breeze', bg: '#81a1c1', text: '#ffffff' },
    { name: 'Warm-Rose', bg: '#bf616a', text: '#ffffff' },
    { name: 'Nordic-Snow', bg: '#e5e9f0', text: '#2e3440' }
];

let assignedColors = [];
function getUniqueColor() {
    let unassigned = COLOR_PALETTE.filter(c => !assignedColors.includes(c.name));
    if (unassigned.length === 0) unassigned = COLOR_PALETTE;
    const choice = unassigned[Math.floor(Math.random() * unassigned.length)];
    assignedColors.push(choice.name);
    return choice.name;
}

// --- GLOBAL NETWORK & PEER STATES ---
const myId = 'peer_' + Math.random().toString(36).substring(2, 9);
let myColor = getUniqueColor();
let isHost = false;
let roomID = '';
let expectedPeers = 2;
let initialRoute = 'dashboard';
const peers = {}; // id -> { pc, dc, color, stream, statsInterval }

// --- WEBRTC CONFIGURATION ---
const rtcConfig = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

// ============================================================================
// ROUTING & VIEW CONTROLLER
// ============================================================================
function showView(viewId) {
    document.querySelectorAll('.viewport').forEach(v => v.classList.add('hidden'));
    const target = document.getElementById(viewId);
    if (target) target.classList.remove('hidden');

    if (viewId === 'view-dashboard') {
        const landing = document.getElementById('view-landing');
        if (landing) landing.remove();
    }
}

function showApp(appId) {
    showView('view-app-shell');
    document.querySelectorAll('.app-view').forEach(v => v.classList.add('hidden'));
    const appEl = document.getElementById(`app-${appId}`);
    if (appEl) appEl.classList.remove('hidden');

    document.querySelectorAll('.nav-icon').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.app === appId);
    });

    const titles = {
        dashboard: 'Privacz Spaces',
        file: 'File Transfer Pipeline',
        chat: 'Secure Peer Stream',
        voice: 'Opus Voice Link',
        video: 'Video & Screen Streams',
        clipboard: 'Document Clipboard',
        canvas: 'Studio Canvas',
        chess: 'Grandmaster Chess'
    };
    const titleEl = document.getElementById('shell-app-title');
    if (titleEl) titleEl.innerText = titles[appId] || 'Workspace';

    if (appId === 'canvas') resizeCanvas();
}

// Inter-app navigation handler
function navigateApp(targetApp) {
    if (targetApp === 'dashboard') {
        if (!isHost && Object.keys(peers).length > 0) {
            toast("Only the Host can change the active workspace.");
            return;
        }
        showView('view-dashboard');
        if (isHost) broadcast({ type: 'NAV_DASHBOARD' });
        return;
    }

    if (isHost) {
        showApp(targetApp);
        broadcast({ type: 'NAV_SWITCH', target: targetApp });
    } else {
        toast("Waiting for Host's approval to launch " + targetApp + "...");
        sendToHost({ type: 'NAV_REQUEST', target: targetApp, from: myColor });
    }
}

// OS Grid & Sidebar Button Bindings
document.querySelectorAll('.app-icon').forEach(btn => {
    btn.onclick = () => navigateApp(btn.dataset.app);
});
document.querySelectorAll('.nav-icon').forEach(btn => {
    btn.onclick = () => navigateApp(btn.dataset.app);
});
document.getElementById('btn-back-dashboard')?.addEventListener('click', () => {
    navigateApp('dashboard');
});

// ============================================================================
// SECTION 2: INITIAL PORTAL LANDING VIEWPORT & GOOGLE TABS
// ============================================================================
// Google Search Submenu Tabs
document.querySelectorAll('.g-tab').forEach(tab => {
    tab.onclick = () => {
        document.querySelectorAll('.g-tab').forEach(t => {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        const tabNum = tab.dataset.tab;
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('hidden'));
        const pane = document.getElementById(`g-content-${tabNum}`);
        if (pane) pane.classList.remove('hidden');
    };
});

// About Modal
const btnAbout = document.getElementById('btn-about');
const modalAbout = document.getElementById('modal-about');
const btnCloseAbout = document.getElementById('btn-close-about');
if (btnAbout && modalAbout) {
    btnAbout.onclick = () => modalAbout.classList.remove('hidden');
    btnCloseAbout.onclick = () => modalAbout.classList.add('hidden');
    modalAbout.onclick = (e) => { if (e.target === modalAbout) modalAbout.classList.add('hidden'); };
}

// Host Setup Slider
const sliderPeerCount = document.getElementById('slider-peer-count');
const counterVal = document.getElementById('counter-val');
if (sliderPeerCount && counterVal) {
    sliderPeerCount.oninput = (e) => {
        counterVal.innerText = e.target.value;
        expectedPeers = parseInt(e.target.value, 10);
        const btnContinue = document.getElementById('btn-continue-host');
        if (btnContinue) {
            btnContinue.style.display = expectedPeers === 2 ? 'none' : 'block';
        }
        updateHostConnectionStatus();
    };
}

let pendingFilesForTransfer = [];
let hostedFiles = {}; // fileId -> file object

// Landing Action Buttons
document.getElementById('btn-file-transfer')?.addEventListener('click', () => {
    const tempInput = document.createElement('input');
    tempInput.type = 'file';
    tempInput.multiple = true;
    tempInput.onchange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            initialRoute = 'isolated-file';
            pendingFilesForTransfer = Array.from(e.target.files);
            openFileTransferModalHost();
        }
    };
    tempInput.click();
});
document.getElementById('btn-connect')?.addEventListener('click', () => {
    initialRoute = 'dashboard';
    openHostSetup();
});

document.getElementById('btn-close-ft')?.addEventListener('click', () => {
    document.getElementById('modal-file-transfer')?.classList.add('hidden');
    window.location.hash = '';
    window.history.replaceState({}, document.title, window.location.pathname);
});

document.getElementById('btn-copy-ft-url')?.addEventListener('click', () => {
    const urlBox = document.getElementById('ft-url-box');
    if (urlBox) {
        navigator.clipboard?.writeText(urlBox.value).then(() => {
            toast("Link copied to clipboard!");
        }).catch(() => {
            urlBox.select();
            document.execCommand('copy');
            toast("Link copied!");
        });
    }
});

function openFileTransferModalHost() {
    isHost = true;
    roomID = Math.random().toString(36).substring(2, 10);
    initHostSignaling();
    const modal = document.getElementById('modal-file-transfer');
    if (modal) modal.classList.remove('hidden');
    
    document.getElementById('ft-share-section').style.display = 'block';
    document.getElementById('ft-modal-title').innerText = 'Secure File Transfer';
    
    const origin = window.location.origin + window.location.pathname;
    const shareUrl = `${origin}#file_${roomID}`;
    
    const urlBox = document.getElementById('ft-url-box');
    if (urlBox) urlBox.value = shareUrl;
    
    const qrImg = document.getElementById('ft-qr-image');
    if (qrImg) {
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(shareUrl)}`;
        qrImg.onload = () => { qrImg.style.display = 'block'; };
    }

    const ftGrid = document.getElementById('ft-progress-grid');
    if (ftGrid) ftGrid.innerHTML = '';
    
    if (pendingFilesForTransfer.length > 0) {
        handleFilesSelection(pendingFilesForTransfer);
        pendingFilesForTransfer = [];
    }
}


function updateHostConnectionStatus() {
    const statusEl = document.getElementById('host-connection-status');
    if (!statusEl) return;
    const activeGuests = Object.values(peers).filter(p => p.pc && p.pc.connectionState === 'connected').length;
    statusEl.innerHTML = `<span style="color:var(--pastel-mint)">${activeGuests}</span> / ${expectedPeers - 1} Guests Connected`;
}

function openHostSetup() {
    isHost = true;
    roomID = Math.random().toString(36).substring(2, 10);
    initHostSignaling();
    document.getElementById('modal-host-setup')?.classList.remove('hidden');

    const sliderGroup = document.querySelector('.counter-slider-group');
    if (sliderGroup) sliderGroup.style.display = 'flex';
    
    const btnContinue = document.getElementById('btn-continue-host');
    if (btnContinue) {
        btnContinue.style.display = expectedPeers === 2 ? 'none' : 'block';
        btnContinue.innerText = "Continue Anyway";
    }
    updateHostConnectionStatus();

    const origin = window.location.origin + window.location.pathname;
    const shareUrl = `${origin}#session_${roomID}`;
    
    const urlBox = document.getElementById('host-url-box');
    if (urlBox) urlBox.value = shareUrl;

    const qrImg = document.getElementById('qr-image');
    const qrPlaceholder = document.getElementById('qr-placeholder');
    if (qrImg) {
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(shareUrl)}`;
        qrImg.onload = () => {
            qrImg.style.display = 'block';
            if (qrPlaceholder) qrPlaceholder.style.display = 'none';
        };
    }
}

document.getElementById('btn-copy-url')?.addEventListener('click', () => {
    const urlBox = document.getElementById('host-url-box');
    if (urlBox) {
        navigator.clipboard?.writeText(urlBox.value).then(() => {
            toast("Session link copied to clipboard!");
        }).catch(() => {
            urlBox.select();
            document.execCommand('copy');
            toast("Session link copied!");
        });
    }
});

document.getElementById('btn-continue-host')?.addEventListener('click', () => {
    document.getElementById('modal-host-setup')?.classList.add('hidden');
    document.getElementById('view-app-shell')?.classList.remove('isolated-mode');
    showView('view-dashboard');
    toast(`Entered session manually.`);
});

// Check if loaded with hash (Guest View)

// Mobile Keyboard Visual Viewport Fix
if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
        if (window.visualViewport.height > 0) { document.body.style.height = window.visualViewport.height + 'px'; }
        window.scrollTo(0, 0);
        
        // Ensure chat scrolls to bottom if keyboard pops up
        const chatBox = document.getElementById('chat-messages');
        if (chatBox) {
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    });
}

// Check if loaded with hash (Guest View)
function handleIncomingHash() {
    const hash = window.location.hash;
    if (hash && hash.length > 1) {
        let route = hash.substring(1);
        let targetHostId = route;
        if (route.startsWith('file_')) {
            targetHostId = route.replace('file_', '');
            initialRoute = 'isolated-file';
        } else if (route.startsWith('session_')) {
            targetHostId = route.replace('session_', '');
        }
        
        roomID = targetHostId;
        isHost = false;
        hostId = targetHostId;

        const landing = document.getElementById('view-landing');
        if (landing) landing.classList.add('hidden');
        
        const loadingModal = document.getElementById('modal-guest-loading');
        if (loadingModal) loadingModal.classList.remove('hidden');
        
        if (initialRoute === 'isolated-file') {
            const shell = document.getElementById('view-app-shell');
            if (shell) shell.classList.add('isolated-mode');
        }
        
        initGuestSignaling();
    }
}
handleIncomingHash();
window.addEventListener('hashchange', () => {
    if (!isHost && !mqttClient) {
        handleIncomingHash();
    }
});


// ============================================================================
// SERVERLESS WEBRTC SIGNALING PIPELINE (MQTT WEBSOCKET RELAY)
// ============================================================================

let mqttClient = null;

function initHostSignaling() {
    if (mqttClient) mqttClient.end();
    mqttClient = mqtt.connect('wss://broker.emqx.io:8084/mqtt');
    
    mqttClient.on('connect', () => {
        console.log('Host connected to MQTT relay.');
        mqttClient.subscribe(`privacz/${roomID}/host`);
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
    mqttClient = mqtt.connect('wss://broker.emqx.io:8084/mqtt');
    
    mqttClient.on('connect', () => {
        if (statusEl) statusEl.innerText = 'Binding WebRTC channels...';
        console.log('Guest connected to MQTT relay.');
        
        mqttClient.subscribe(`privacz/${roomID}/guest/${myId}`, () => {
            // Send join packet to host only after we are definitely subscribed
            sendSignaling({
                type: 'join',
                from: myId,
                color: myColor
            });
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
            mqttClient.publish(`privacz/${roomID}/guest/${data.to}`, payload);
        } else {
            // broadcast not strictly needed for signaling right now, but we can do it if required
        }
    } else {
        mqttClient.publish(`privacz/${roomID}/host`, payload);
    }
}

function broadcast(msg) {
    const payload = (typeof msg === 'string' || msg instanceof ArrayBuffer) ? msg : JSON.stringify(msg);
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
                if (peers[data.from].candidateQueue) {
                    for (let c of peers[data.from].candidateQueue) {
                        try { await peers[data.from].pc.addIceCandidate(new RTCIceCandidate(c)); } catch(e){}
                    }
                    peers[data.from].candidateQueue = [];
                }
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
                try {
                    await peers[data.from].pc.addIceCandidate(new RTCIceCandidate(data.candidate));
                } catch (e) {
                    // If remote description is not set yet, queue the candidate
                    if (!peers[data.from].candidateQueue) peers[data.from].candidateQueue = [];
                    peers[data.from].candidateQueue.push(data.candidate);
                }
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
                if (peers[hostId].candidateQueue) {
                    for (let c of peers[hostId].candidateQueue) {
                        try { await peers[hostId].pc.addIceCandidate(new RTCIceCandidate(c)); } catch(e){}
                    }
                    peers[hostId].candidateQueue = [];
                }
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
                try {
                    await peers[data.from].pc.addIceCandidate(new RTCIceCandidate(data.candidate));
                } catch (e) {
                    // If remote description is not set yet, queue the candidate
                    if (!peers[data.from].candidateQueue) peers[data.from].candidateQueue = [];
                    peers[data.from].candidateQueue.push(data.candidate);
                }
            }
        }
    } catch (err) {
        console.warn("Signaling notification:", err);
    }
}


function createPeer(id, peerColor) {
    const pc = new RTCPeerConnection(rtcConfig);
    const peerObj = { pc, dc: null, color: peerColor || getUniqueColor() };

    pc.onicecandidate = (event) => {
        if (event.candidate) {
            sendSignaling({
                type: 'candidate',
                candidate: event.candidate,
                from: myId,
                to: id
            });
        }
    };

    pc.onnegotiationneeded = async () => {
        try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            sendSignaling({
                type: 'offer',
                sdp: offer,
                from: myId,
                to: id,
                hostColor: myColor
            });
        } catch (err) {
            console.error("Renegotiation failed:", err);
        }
    };
    pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') {
            toast(`${peerObj.color} Connected!`);
            updatePresence();
            startStatsMonitoring(pc);
            if (isHost) {
                updateHostConnectionStatus();
                const activeGuests = Object.values(peers).filter(p => p.pc && p.pc.connectionState === 'connected').length;
                if (activeGuests >= expectedPeers - 1) {
                    const hostModal = document.getElementById('modal-host-setup');
                    if (hostModal && !hostModal.classList.contains('hidden')) {
                        hostModal.classList.add('hidden');
                        document.getElementById('view-app-shell')?.classList.remove('isolated-mode');
                        showView('view-dashboard');
                        toast(`All expected peers connected! Workspace active.`);
                    }
                }
            }
            if (!isHost) {
                const loadingModal = document.getElementById('modal-guest-loading');
                if (loadingModal && !loadingModal.classList.contains('hidden')) {
                    loadingModal.classList.add('hidden');
                    if (initialRoute === 'isolated-file') {
                        const modal = document.getElementById('modal-file-transfer');
                        if (modal) {
                            modal.classList.remove('hidden');
                            document.getElementById('ft-share-section').style.display = 'none';
                            document.getElementById('ft-modal-title').innerText = 'Receiving Files';
                        }
                    } else {
                        document.getElementById('view-app-shell')?.classList.remove('isolated-mode');
                        showView('view-dashboard');
                    }
                }
            } else {
                if (initialRoute === 'isolated-file') {
                    const shareSection = document.getElementById('ft-share-section');
                    if (shareSection) shareSection.style.display = 'none';
                    const title = document.getElementById('ft-modal-title');
                    if (title) title.innerText = 'Connected - Transferring';
                }
            }
        } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
            toast(`${peerObj.color} Disconnected.`);
            updatePresence();
        }
    };

    pc.ontrack = (event) => {
        handleIncomingMediaStream(event.streams[0], peerObj.color);
    };

    return peerObj;
}

function setupDataChannel(dc, id) {
    dc.binaryType = 'arraybuffer';
    dc.onopen = () => {
        updatePresence();
        // Sync identities
        dc.send(JSON.stringify({ type: 'IDENTITY_SYNC', color: myColor }));
        
        // Late-joiner sync for hosted files
        if (isHost && initialRoute === 'isolated-file') {
            Object.keys(hostedFiles).forEach(fileId => {
                const f = hostedFiles[fileId];
                dc.send(JSON.stringify({
                    type: 'FILE_META',
                    fileId,
                    name: f.name,
                    size: f.size,
                    sender: myColor
                }));
            });
        }
    };
    dc.onmessage = (e) => {
        if (typeof e.data === 'string') {
            handleNetworkMessage(e.data, id);
        } else if (e.data instanceof ArrayBuffer) {
            handleBinaryChunk(e.data);
        }
    };
}

// Presence Tracker & Host Menu Visibility
function updatePresence() {
    let connected = Object.values(peers).filter(p => p.pc && p.pc.connectionState === 'connected').length + 1;
    const tracker1 = document.getElementById('presence-tracker');
    const tracker2 = document.getElementById('presence-tracker-shell');
    if (tracker1) tracker1.innerText = `👁️ ${connected}`;
    if (tracker2) tracker2.innerText = `👁️ ${connected}`;
    
    // Host 3-dot dropdown menu constraints:
    // Dropdown is visible ONLY to Peer 1 (Host).
    const wrapHostMenu = document.getElementById('wrap-host-menu');
    if (wrapHostMenu) {
        wrapHostMenu.style.display = isHost ? 'block' : 'none';
    }

    // Import Chat appears ONLY when user count is exactly 2:
    const importBtn = document.getElementById('menu-import-chat');
    if (importBtn) {
        if (isHost && connected === 2) {
            importBtn.classList.remove('hidden');
        } else {
            importBtn.classList.add('hidden');
        }
    }

    // Live Poll option in tray is Host-exclusive:
    const pollTrayBtn = document.getElementById('btn-tray-live-poll');
    if (pollTrayBtn) {
        pollTrayBtn.style.display = isHost ? 'block' : 'none';
    }

    // Chess Setup & deploy controls are Host-exclusive:
    const chessSetup = document.getElementById('chess-host-setup');
    const chessDeploy = document.getElementById('chess-deploy-controls');
    const hostRosterDeck = document.getElementById('host-roster-deck');
    if (chessSetup) chessSetup.style.display = isHost ? 'flex' : 'none';
    if (chessDeploy) chessDeploy.style.display = isHost ? 'flex' : 'none';
    if (hostRosterDeck) hostRosterDeck.style.display = isHost ? 'block' : 'none';

    updateChessRoster();
}

// Diagnostics Badge Stats Monitor (RTCPeerConnection.getStats())
function startStatsMonitoring(pc) {
    setInterval(async () => {
        try {
            const stats = await pc.getStats();
            let roundTripTime = 0;
            stats.forEach(report => {
                if (report.type === 'candidate-pair' && report.currentRoundTripTime) {
                    roundTripTime = report.currentRoundTripTime * 1000;
                }
            });

            const diagDot = document.getElementById('diag-dot');
            const diagText = document.getElementById('diag-text');
            const diagDotShell = document.getElementById('diag-dot-shell');
            const diagTextShell = document.getElementById('diag-text-shell');

            let colorClass = 'green';
            let label = 'Optimal';
            if (roundTripTime > 250) {
                colorClass = 'red';
                label = 'Poor';
            } else if (roundTripTime > 100) {
                colorClass = 'orange';
                label = 'Medium';
            }

            [diagDot, diagDotShell].forEach(d => {
                if (d) {
                    d.className = `dot ${colorClass}`;
                }
            });
            [diagText, diagTextShell].forEach(t => {
                if (t) {
                    t.innerText = label;
                }
            });
        } catch(e) {}
    }, 3000);
}

// ============================================================================
// NETWORK MESSAGE DISPATCHER
// ============================================================================
function handleNetworkMessage(raw, peerId) {
    let msg;
    try {
        msg = JSON.parse(raw);
    } catch(e) { return; }

    switch(msg.type) {
        case 'IDENTITY_SYNC':
            if (peers[peerId]) peers[peerId].color = msg.color;
            updateChessRoster();
            break;
        case 'NAME_CHANGE':
            if (peers[peerId]) {
                const oldName = peers[peerId].color;
                peers[peerId].color = msg.newName;
                replaceNameInRoster(oldName, msg.newName);
                toast(`${oldName} changed name to ${msg.newName}`);
                updateChessRoster();
            }
            break;

        case 'NAV_REQUEST':
            if (isHost) {
                toast(`${msg.from} requests to launch ${msg.target}`, {
                    isAction: true,
                    acceptText: 'Accept',
                    declineText: 'Decline',
                    onAccept: () => {
                        showApp(msg.target);
                        broadcast({ type: 'NAV_SWITCH', target: msg.target });
                    },
                    onDecline: () => {
                        broadcast({ type: 'NAV_DECLINED', target: msg.target, for: msg.from });
                    }
                });
            }
            break;

        case 'NAV_DASHBOARD':
            showView('view-dashboard');
            toast('Host returned to Spaces.');
            break;

        case 'NAV_SWITCH':
            showApp(msg.target);
            toast(`Switched to ${msg.target}`);
            break;

        case 'NAV_DECLINED':
            if (msg.for === myColor) {
                toast(`Host declined request to open ${msg.target}.`);
            }
            break;

        // FILE PIPELINE
        case 'FILE_META':
            handleIncomingFileMeta(msg);
            break;
        case 'FILE_PROGRESS_TELEMETRY':
            handleFileTelemetry(msg);
            break;
        case 'FILE_REQUEST':
            if (hostedFiles[msg.fileId]) {
                const metaText = document.getElementById(`meta-${msg.fileId}`);
                if (metaText) metaText.innerText = 'Uploading...';
                streamFile(msg.fileId, hostedFiles[msg.fileId]);
            }
            break;

        // CHAT
        case 'MSG':
            appendChatMessage(msg.from, msg.text, false, msg.quote);
            break;
        case 'VOICE_MSG':
            appendVoiceMessage(msg.from, msg.audioData, false);
            break;
        case 'CLEAR_CHAT':
            document.getElementById('chat-messages').innerHTML = '';
            toast("Host cleared the chat history.");
            break;
        case 'POLL_NEW':
            renderPollCard(msg.poll);
            break;
        case 'POLL_VOTE':
            recordPollVote(msg.pollId, msg.optionIndex, msg.from);
            break;

        // CLIPBOARD
        case 'CLIP_UPDATE':
            const cb = document.getElementById('clipboard-canvas');
            if (cb) cb.innerText = msg.text;
            break;
        case 'CLIP_CLEAR':
            const cbClear = document.getElementById('clipboard-canvas');
            if (cbClear) cbClear.innerText = '';
            break;

        // CANVAS
        case 'DRAW_COORDS':
            drawRemoteCoordinates(msg.data);
            break;
        case 'CANVAS_CLEAR':
            clearCanvasDirect();
            toast("Host cleared the canvas.");
            break;
        case 'CANVAS_COMMENT':
            appendCanvasComment(msg.from, msg.text);
            break;
        case 'CANVAS_VOICE_PING':
            toast(`${msg.from} requested a Voice Call from Whiteboard!`, {
                isAction: true,
                onAccept: () => navigateApp('voice')
            });
            break;

        // CHESS
        case 'CHESS_START':
            startChessMatch(msg.config);
            break;
        case 'CHESS_MOVE':
            receiveChessMove(msg);
            break;
        case 'ROSTER_UPDATE':
            chessRoster = msg.roster;
            renderChessRoster();
            break;

        // MEDIA INVITATIONS
        case 'VOICE_INVITE':
            promptVoiceInvite(msg.from);
            break;
        case 'VIDEO_INVITE':
            promptVideoInvite(msg.from);
            break;
        case 'MEDIA_HANGUP':
            teardownLocalMedia(msg.mediaType);
            toast("Media call ended by Host.");
            break;
    }
}

// ============================================================================
// APPLICATION A: THE FILE TRANSFER ENGINE
// ============================================================================
const fileDropZone = document.getElementById('file-drop-zone');
const fileInput = document.getElementById('file-input');
const progressGrid = document.getElementById('file-progress-grid');

if (fileDropZone && fileInput) {
    fileDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileDropZone.classList.add('dragover');
    });
    fileDropZone.addEventListener('dragleave', () => {
        fileDropZone.classList.remove('dragover');
    });
    fileDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        fileDropZone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFilesSelection(e.dataTransfer.files);
        }
    });
    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFilesSelection(e.target.files);
        }
    });
}

const activeTransfers = {}; // fileId -> { file, chunks, total, received, element }

function handleFilesSelection(fileList) {
    Array.from(fileList).forEach(file => {
        const fileId = 'file_' + Math.random().toString(36).substring(2, 9);
        hostedFiles[fileId] = file;
        renderFileCard(fileId, file.name, file.size, true);

        // Announce file metadata to peers
        broadcast({
            type: 'FILE_META',
            fileId,
            name: file.name,
            size: file.size,
            sender: myColor
        });
        
        // Wait for FILE_REQUEST from receiver before streaming
    });
}

function streamFile(fileId, file) {
    const CHUNK_SIZE = 16384; // 16KB WebRTC chunk
    const reader = new FileReader();
    let offset = 0;

    reader.onload = (e) => {
        const chunk = e.target.result;
        broadcast(chunk);
        offset += chunk.byteLength;
        // Do NOT update UI progress here - let the receiver's FILE_PROGRESS_TELEMETRY do it
        // so the sender sees the actual network delivery progress, not just local read speed!

        if (offset < file.size) {
            // Check backpressure to prevent crashing the data channel on large files
            let bufferedAmount = 0;
            Object.values(peers).forEach(p => {
                if (p.dc && p.dc.readyState === 'open') {
                    if (p.dc.bufferedAmount > bufferedAmount) {
                        bufferedAmount = p.dc.bufferedAmount;
                    }
                }
            });
            
            if (bufferedAmount > 1024 * 1024 * 4) { // Pause if > 4MB buffered
                setTimeout(readNextChunk, 50);
            } else {
                readNextChunk();
            }
        }
    };

    function readNextChunk() {
        const slice = file.slice(offset, offset + CHUNK_SIZE);
        reader.readAsArrayBuffer(slice);
    }

    readNextChunk();
}

let currentReceivingFile = null;
function handleIncomingFileMeta(meta) {
    currentReceivingFile = {
        fileId: meta.fileId,
        name: meta.name,
        size: meta.size,
        receivedBytes: 0,
        chunks: [],
        sender: meta.sender
    };
    renderFileCard(meta.fileId, meta.name, meta.size, false);
    toast(`${meta.sender} is sending "${meta.name}"`);
}

function handleBinaryChunk(arrayBuffer) {
    if (!currentReceivingFile) return;
    currentReceivingFile.chunks.push(arrayBuffer);
    currentReceivingFile.receivedBytes += arrayBuffer.byteLength;

    const percent = Math.min(100, Math.round((currentReceivingFile.receivedBytes / currentReceivingFile.size) * 100));
    updateProgressRing(currentReceivingFile.fileId, percent);

    // Mirror back reverse progress telemetry to sending peer
    broadcast({
        type: 'FILE_PROGRESS_TELEMETRY',
        fileId: currentReceivingFile.fileId,
        percent: percent,
        receiver: myColor
    });

    if (currentReceivingFile.receivedBytes >= currentReceivingFile.size) {
        completeFileDownload(currentReceivingFile);
        currentReceivingFile = null;
    }
}

function handleFileTelemetry(msg) {
    // Show peer download progress on Host / sender screen
    updateProgressRing(msg.fileId, msg.percent);
    
    const metaText = document.getElementById(`meta-${msg.fileId}`);
    if (metaText) {
        if (msg.percent < 100) {
            metaText.innerText = `Delivering to ${msg.receiver}... ${msg.percent}%`;
        } else {
            metaText.innerText = `Delivered to ${msg.receiver}!`;
            toast(`File successfully delivered to ${msg.receiver}!`);
        }
    }
}

function renderFileCard(fileId, name, size, isUpload) {
    const card = document.createElement('div');
    card.className = 'file-card';
    card.id = `file-card-${fileId}`;

    const sizeStr = (size / (1024 * 1024)).toFixed(2) + ' MB';
    const radius = 18;
    const circumference = 2 * Math.PI * radius;

    let visualHtml = '';
    if (isUpload) {
        visualHtml = `
            <div class="circular-progress-wrap">
                <svg class="progress-ring" width="48" height="48">
                    <circle class="progress-ring-bg" cx="24" cy="24" r="${radius}"></circle>
                    <circle class="progress-ring-circle" id="ring-${fileId}" cx="24" cy="24" r="${radius}" 
                        stroke-dasharray="${circumference}" stroke-dashoffset="${circumference}"></circle>
                </svg>
                <span class="progress-percentage" id="percent-${fileId}">0%</span>
            </div>`;
    } else {
        visualHtml = `
            <div class="circular-progress-wrap">
                <button class="btn" id="btn-dl-${fileId}" style="width: 100%; height: 100%; border-radius: 50%; font-size: 0.75rem; padding: 0;">↓</button>
                <svg class="progress-ring hidden" id="svg-${fileId}" width="48" height="48" style="position: absolute; top:0; left:0;">
                    <circle class="progress-ring-bg" cx="24" cy="24" r="${radius}"></circle>
                    <circle class="progress-ring-circle" id="ring-${fileId}" cx="24" cy="24" r="${radius}" 
                        stroke-dasharray="${circumference}" stroke-dashoffset="${circumference}"></circle>
                </svg>
                <span class="progress-percentage hidden" id="percent-${fileId}">0%</span>
            </div>`;
    }

    card.innerHTML = `
        ${visualHtml}
        <div class="file-card-info">
            <div class="file-name" title="${name}">${name}</div>
            <div class="file-meta" id="meta-${fileId}">${isUpload ? 'Ready to send' : 'Ready to download'} • ${sizeStr}</div>
        </div>
    `;

    const targetGridId = initialRoute === 'isolated-file' ? 'ft-progress-grid' : 'file-progress-grid';
    document.getElementById(targetGridId)?.prepend(card);

    if (!isUpload) {
        const dlBtn = document.getElementById(`btn-dl-${fileId}`);
        if (dlBtn) {
            dlBtn.onclick = () => {
                dlBtn.classList.add('hidden');
                document.getElementById(`svg-${fileId}`)?.classList.remove('hidden');
                document.getElementById(`percent-${fileId}`)?.classList.remove('hidden');
                document.getElementById(`meta-${fileId}`).innerText = `Receiving • ${sizeStr}`;
                broadcast({ type: 'FILE_REQUEST', fileId });
            };
        }
    }
}

function updateProgressRing(fileId, percent) {
    const ring = document.getElementById(`ring-${fileId}`);
    const label = document.getElementById(`percent-${fileId}`);
    if (ring && label) {
        const radius = 18;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percent / 100) * circumference;
        ring.style.strokeDashoffset = offset;
        label.innerText = `${percent}%`;
    }
}

function completeFileDownload(fileData) {
    const blob = new Blob(fileData.chunks);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileData.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast(`Saved "${fileData.name}" to disk!`);
}

// ============================================================================
// APPLICATION B: THE SECURE CHAT SYSTEM
// ============================================================================
let activeQuote = null;

const btnChatMenu = document.getElementById('btn-chat-menu');
const chatDropdown = document.getElementById('chat-dropdown');
if (btnChatMenu && chatDropdown) {
    btnChatMenu.onclick = (e) => {
        e.stopPropagation();
        chatDropdown.classList.toggle('hidden');
    };
}

const btnChatAttach = document.getElementById('btn-chat-attach');
const attachDropdown = document.getElementById('attach-dropdown');
if (btnChatAttach && attachDropdown) {
    btnChatAttach.onclick = (e) => {
        e.stopPropagation();
        attachDropdown.classList.toggle('hidden');
    };
    attachDropdown.onclick = (e) => {
        const target = e.target.dataset.target;
        if (target) {
            navigateApp(target);
            attachDropdown.classList.add('hidden');
        }
    };
}

// Clear Chat (Host only)
document.getElementById('menu-clear-chat')?.addEventListener('click', () => {
    document.getElementById('chat-messages').innerHTML = '';
    broadcast({ type: 'CLEAR_CHAT' });
    chatDropdown?.classList.add('hidden');
    toast("Chat cleared for all peers.");
});

// Export Chat (Host only)
document.getElementById('menu-export-chat')?.addEventListener('click', () => {
    chatDropdown?.classList.add('hidden');
    const bubbles = document.querySelectorAll('#chat-messages .chat-bubble');
    if (bubbles.length === 0) {
        toast("No chat messages to export.");
        return;
    }
    let exportText = `PRIVACZ SECURE CHAT EXPORT - ${new Date().toLocaleString()}\n` + '='.repeat(45) + '\n\n';
    bubbles.forEach(b => {
        const meta = b.querySelector('.meta')?.innerText || '';
        const text = b.querySelector('.chat-body')?.innerText || '';
        exportText += `[${meta}] ${text}\n`;
    });
    const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `privacz-chat-${roomID.slice(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast("Chat exported.");
});

// Import Chat (Host only, visible when 2 peers connected)
const btnImportChat = document.getElementById('menu-import-chat');
const inputImportChat = document.getElementById('chat-import-input');
if (btnImportChat && inputImportChat) {
    btnImportChat.onclick = () => {
        chatDropdown?.classList.add('hidden');
        inputImportChat.click();
    };
    inputImportChat.onchange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const content = ev.target?.result;
            if (typeof content === 'string') {
                const lines = content.split('\n');
                lines.forEach(line => {
                    const match = line.match(/^\[(.*?)\]\s*(.*)$/);
                    if (match) {
                        appendChatMessage(match[1], match[2], false);
                    }
                });
                toast("Chat history imported and synchronized.");
            }
        };
        reader.readAsText(file);
        inputImportChat.value = '';
    };
}

// Chat Sending & Quoting
const chatInput = document.getElementById('chat-input');
const btnChatSend = document.getElementById('btn-chat-send');
const btnChatVoice = document.getElementById('btn-chat-record');
const quoteBar = document.getElementById('chat-quote-bar');
const quoteTextPreview = document.getElementById('quote-text-preview');
const btnQuoteCancel = document.getElementById('btn-quote-cancel');

let mediaRecorder;
let audioChunks = [];

if (btnChatVoice) {
    let isRecording = false;
    let pendingAudioBlob = null;
    const audioPreviewBar = document.getElementById('chat-audio-preview-bar');
    const audioPreviewElement = document.getElementById('audio-preview-element');
    const btnAudioSend = document.getElementById('btn-audio-send');
    const btnAudioCancel = document.getElementById('btn-audio-cancel');

    const toggleRecording = async (e) => {
        e.preventDefault();
        
        if (!isRecording) {
            // Start recording
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                audioChunks = [];
                mediaRecorder.ondataavailable = event => {
                    if (event.data.size > 0) audioChunks.push(event.data);
                };
                mediaRecorder.onstop = () => {
                    pendingAudioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType });
                    const audioUrl = URL.createObjectURL(pendingAudioBlob);
                    audioPreviewElement.src = audioUrl;
                    audioPreviewBar.classList.remove('hidden');
                    stream.getTracks().forEach(track => track.stop());
                };
                mediaRecorder.start();
                isRecording = true;
                btnChatVoice.classList.add('sound-wave-active');
                btnChatVoice.style.transform = 'scale(1.2)';
                btnChatVoice.style.backgroundColor = 'var(--accent-red)';
                btnChatVoice.style.color = '#fff';
                btnChatVoice.innerText = '⏹️';
                audioPreviewBar.classList.add('hidden'); // Hide any previous preview
            } catch (err) {
                toast('Microphone access denied or unavailable.');
            }
        } else {
            // Stop recording
            if (mediaRecorder && mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
                isRecording = false;
                btnChatVoice.classList.remove('sound-wave-active');
                btnChatVoice.style.transform = '';
                btnChatVoice.style.backgroundColor = '';
                btnChatVoice.style.color = 'var(--accent-red)';
                btnChatVoice.innerText = '🎤';
            }
        }
    };

    btnChatVoice.addEventListener('click', toggleRecording);
    
    if (btnAudioCancel) {
        btnAudioCancel.addEventListener('click', () => {
            pendingAudioBlob = null;
            audioPreviewElement.src = '';
            audioPreviewBar.classList.add('hidden');
        });
    }

    if (btnAudioSend) {
        btnAudioSend.addEventListener('click', () => {
            if (!pendingAudioBlob) return;
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Audio = reader.result;
                broadcast({ type: 'VOICE_MSG', from: myColor, audioData: base64Audio });
                appendVoiceMessage(myColor, base64Audio, true);
                
                // Cleanup
                pendingAudioBlob = null;
                audioPreviewElement.src = '';
                audioPreviewBar.classList.add('hidden');
            };
            reader.readAsDataURL(pendingAudioBlob);
        });
    }
}

if (btnQuoteCancel) {
    btnQuoteCancel.onclick = () => {
        activeQuote = null;
        quoteBar?.classList.add('hidden');
    };
}

if (btnChatSend) btnChatSend.onclick = sendChat;
if (chatInput) {
    chatInput.onkeypress = (e) => {
        if (e.key === 'Enter') sendChat();
    };
}

function sendChat() {
    const text = chatInput.value.trim();
    if (!text) return;
    appendChatMessage(myColor, text, true, activeQuote);
    broadcast({ type: 'MSG', from: myColor, text, quote: activeQuote });
    chatInput.value = '';
    activeQuote = null;
    quoteBar?.classList.add('hidden');
}

function appendChatMessage(sender, text, isMine, quote = null) {
    const box = document.getElementById('chat-messages');
    if (!box) return;
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${isMine ? 'mine' : ''}`;

    // Safely parse URLs to open with target="_blank"
    const formatted = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');

    let quoteHtml = '';
    if (quote) {
        quoteHtml = `<div class="quote-snip"><strong>${quote.sender}:</strong> ${quote.text}</div>`;
    }

    bubble.innerHTML = `
        <div class="meta">
            <span>${sender}</span>
            <span class="time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        ${quoteHtml}
        <div class="chat-body">${formatted}</div>
        <button class="quote-btn" title="Quote message">💬</button>
    `;

    bubble.querySelector('.quote-btn').onclick = () => {
        activeQuote = { sender, text: text.slice(0, 80) };
        if (quoteTextPreview) quoteTextPreview.innerText = `Replying to ${sender}: "${activeQuote.text}"`;
        quoteBar?.classList.remove('hidden');
        chatInput?.focus();
    };

    box.appendChild(bubble);
    box.scrollTop = box.scrollHeight;
}

function appendVoiceMessage(sender, audioData, isMine) {
    const box = document.getElementById('chat-messages');
    if (!box) return;
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${isMine ? 'mine' : ''}`;

    bubble.innerHTML = `
        <div class="meta">
            <span>${sender}</span>
            <span class="time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div class="chat-body">
            <audio controls src="${audioData}" style="max-width: 100%; height: 36px; outline: none; margin-top: 4px;"></audio>
        </div>
    `;

    box.appendChild(bubble);
    box.scrollTop = box.scrollHeight;
}

// Live Polls in Chat
const btnTrayLivePoll = document.getElementById('btn-tray-live-poll');
const modalCreatePoll = document.getElementById('modal-create-poll');
const btnCancelPoll = document.getElementById('btn-cancel-poll');
const btnDistributePoll = document.getElementById('btn-distribute-poll');

if (btnTrayLivePoll && modalCreatePoll) {
    btnTrayLivePoll.onclick = () => {
        attachDropdown?.classList.add('hidden');
        modalCreatePoll.classList.remove('hidden');
    };
    btnCancelPoll.onclick = () => modalCreatePoll.classList.add('hidden');
    btnDistributePoll.onclick = () => {
        const question = document.getElementById('poll-question-input')?.value.trim();
        const choices = [
            document.getElementById('poll-choice-1')?.value.trim(),
            document.getElementById('poll-choice-2')?.value.trim(),
            document.getElementById('poll-choice-3')?.value.trim(),
            document.getElementById('poll-choice-4')?.value.trim()
        ].filter(Boolean);

        if (!question || choices.length < 2) {
            toast("Please provide a question and at least 2 choices.");
            return;
        }

        const pollId = 'poll_' + Math.random().toString(36).substring(2, 8);
        const poll = { id: pollId, question, choices, votes: {}, creator: myColor };
        livePolls[pollId] = poll;
        renderPollCard(poll);
        broadcast({ type: 'POLL_NEW', poll });
        modalCreatePoll.classList.add('hidden');
        toast("Live Poll distributed!");
    };
}

const livePolls = {}; // pollId -> poll object
function renderPollCard(poll) {
    livePolls[poll.id] = poll;
    const box = document.getElementById('chat-messages');
    if (!box) return;

    const existing = document.getElementById(`poll-card-${poll.id}`);
    if (existing) existing.remove();

    const card = document.createElement('div');
    card.className = 'chat-bubble';
    card.id = `poll-card-${poll.id}`;

    let totalVotes = Object.keys(poll.votes).length;
    let choicesHtml = '';

    poll.choices.forEach((opt, idx) => {
        const count = Object.values(poll.votes).filter(v => v === idx).length;
        const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
        choicesHtml += `
            <div class="poll-option-btn" data-poll="${poll.id}" data-opt="${idx}">
                <div class="poll-bar" style="width: ${pct}%;"></div>
                <span class="poll-opt-text">${opt}</span>
                <span class="poll-opt-votes">${count} (${pct}%)</span>
            </div>
        `;
    });

    card.innerHTML = `
        <div class="meta"><span>📊 Live Poll by ${poll.creator}</span></div>
        <div class="poll-box">
            <div class="poll-question">${poll.question}</div>
            ${choicesHtml}
        </div>
    `;

    card.querySelectorAll('.poll-option-btn').forEach(btn => {
        btn.onclick = () => {
            const pId = btn.dataset.poll;
            const optIdx = parseInt(btn.dataset.opt, 10);
            recordPollVote(pId, optIdx, myColor);
            broadcast({ type: 'POLL_VOTE', pollId: pId, optionIndex: optIdx, from: myColor });
        };
    });

    box.appendChild(card);
    box.scrollTop = box.scrollHeight;
}

function recordPollVote(pollId, optionIndex, voter) {
    if (!livePolls[pollId]) return;
    livePolls[pollId].votes[voter] = optionIndex;
    renderPollCard(livePolls[pollId]);
}

// Shortcuts for Voice and Video from Chat Header
document.getElementById('btn-chat-call-voice')?.addEventListener('click', () => navigateApp('voice'));
document.getElementById('btn-chat-video')?.addEventListener('click', () => navigateApp('video'));

// ============================================================================
// APPLICATION C: VOICE CALLS
// ============================================================================
let localAudioStream = null;
let isVoiceMuted = false;

document.getElementById('btn-voice-mute')?.addEventListener('click', () => {
    if (!localAudioStream) return;
    isVoiceMuted = !isVoiceMuted;
    localAudioStream.getAudioTracks().forEach(t => t.enabled = !isVoiceMuted);
    const muteBtn = document.getElementById('btn-voice-mute');
    if (muteBtn) {
        muteBtn.classList.toggle('muted', isVoiceMuted);
        muteBtn.innerText = isVoiceMuted ? 'Unmute' : 'Mute';
    }
    toast(isVoiceMuted ? "Microphone muted." : "Microphone unmuted.");
});

document.getElementById('btn-voice-hangup')?.addEventListener('click', () => {
    if (isHost) {
        broadcast({ type: 'MEDIA_HANGUP', mediaType: 'voice' });
        teardownLocalMedia('voice');
        toast("Master terminated voice link across all peers.");
        navigateApp('dashboard');
    } else {
        toast("Only the Host can terminate this session. You cannot leave while the Host is active.");
    }
});

async function startVoiceCall() {
    try {
        localAudioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        renderVoiceParticipant(myColor, true);
        Object.values(peers).forEach(peer => {
            localAudioStream.getAudioTracks().forEach(track => {
                peer.pc.addTrack(track, localAudioStream);
            });
        });
        if (isHost) {
            broadcast({ type: 'VOICE_INVITE', from: myColor });
        }
        toast("Opus Voice Link active.");
    } catch(err) {
        toast("Microphone access denied.");
    }
}

function renderVoiceParticipant(name, isLocal) {
    const container = document.getElementById('voice-participants');
    if (!container) return;
    let bubble = document.getElementById(`voice-bubble-${name}`);
    if (!bubble) {
        bubble = document.createElement('div');
        bubble.className = 'voice-bubble pastel-blue-bg speaking';
        bubble.id = `voice-bubble-${name}`;
        bubble.innerHTML = `<span>🎙️</span><span>${name}</span>`;
        container.appendChild(bubble);
    }
}

function promptVoiceInvite(from) {
    const modal = document.getElementById('modal-voice-invite');
    const sender = document.getElementById('voice-invite-sender');
    if (!modal) return;
    if (sender) sender.innerText = `${from} is inviting you to an audio link.`;
    modal.classList.remove('hidden');

    document.getElementById('btn-accept-voice').onclick = () => {
        modal.classList.add('hidden');
        showApp('voice');
        startVoiceCall();
    };
    document.getElementById('btn-decline-voice').onclick = () => {
        modal.classList.add('hidden');
        toast("Declined voice call.");
    };
}

// ============================================================================
// APPLICATION D: VIDEO CALLS & SCREEN SHARING
// ============================================================================
let localVideoStream = null;
let screenStream = null;
let isVideoMuted = false;
let isCameraOff = false;
let videoControlsTimeout = null;

const videoControlTray = document.getElementById('video-control-tray');
const videoGrid = document.getElementById('video-grid');

function resetVideoControlTimeout() {
    if (!videoControlTray) return;
    videoControlTray.classList.remove('hidden-tray');
    clearTimeout(videoControlsTimeout);
    videoControlsTimeout = setTimeout(() => {
        videoControlTray.classList.add('hidden-tray');
    }, 3000);
}

document.getElementById('app-video')?.addEventListener('mousemove', resetVideoControlTimeout);
document.getElementById('app-video')?.addEventListener('touchstart', resetVideoControlTimeout);

document.getElementById('btn-video-cam')?.addEventListener('click', () => {
    if (!localVideoStream) return;
    isCameraOff = !isCameraOff;
    localVideoStream.getVideoTracks().forEach(t => t.enabled = !isCameraOff);
    toast(isCameraOff ? "Camera turned OFF" : "Camera turned ON");
});

document.getElementById('btn-video-mute')?.addEventListener('click', () => {
    if (!localVideoStream) return;
    isVideoMuted = !isVideoMuted;
    localVideoStream.getAudioTracks().forEach(t => t.enabled = !isVideoMuted);
    const muteBtn = document.getElementById('btn-video-mute');
    if (muteBtn) {
        muteBtn.classList.toggle('muted', isVideoMuted);
        muteBtn.innerText = isVideoMuted ? 'Unmute' : 'Mute';
    }
    toast(isVideoMuted ? "Microphone muted" : "Microphone live");
});

document.getElementById('btn-video-share')?.addEventListener('click', async () => {
    try {
        if (!screenStream) {
            screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const screenTrack = screenStream.getVideoTracks()[0];
            Object.values(peers).forEach(peer => {
                const senders = peer.pc.getSenders();
                const videoSender = senders.find(s => s.track && s.track.kind === 'video');
                if (videoSender) videoSender.replaceTrack(screenTrack);
            });
            screenTrack.onended = () => stopScreenShare();
            toast("Screen sharing started.");
        } else {
            stopScreenShare();
        }
    } catch(err) {
        toast("Screen sharing cancelled.");
    }
});

function stopScreenShare() {
    if (screenStream) {
        screenStream.getTracks().forEach(t => t.stop());
        screenStream = null;
        if (localVideoStream) {
            const camTrack = localVideoStream.getVideoTracks()[0];
            Object.values(peers).forEach(peer => {
                const senders = peer.pc.getSenders();
                const videoSender = senders.find(s => s.track && s.track.kind === 'video');
                if (videoSender) videoSender.replaceTrack(camTrack);
            });
        }
        toast("Screen sharing stopped.");
    }
}

document.getElementById('btn-video-hangup')?.addEventListener('click', () => {
    if (isHost) {
        broadcast({ type: 'MEDIA_HANGUP', mediaType: 'video' });
        teardownLocalMedia('video');
        toast("Terminated video call across all peers.");
        navigateApp('dashboard');
    } else {
        toast("Only the Host can terminate this session. You cannot leave while the Host is active.");
    }
});


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
        renderVideoCell('local', localVideoStream, `${myColor} (You)`);
        toast("Camera switched.");
    } catch (err) {
        toast("Error switching camera.");
    }
});

async function startVideoCall() {
    try {
        localVideoStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: { facingMode: currentFacingMode, width: 640, height: 480, frameRate: 24 }
        });
        renderVideoCell('local', localVideoStream, `${myColor} (You)`);
        Object.values(peers).forEach(peer => {
            localVideoStream.getTracks().forEach(track => {
                peer.pc.addTrack(track, localVideoStream);
            });
        });
        if (isHost) broadcast({ type: 'VIDEO_INVITE', from: myColor });
        resetVideoControlTimeout();
    } catch(err) {
        toast("Camera or microphone permission required.");
    }
}

function renderVideoCell(id, stream, label) {
    let cell = document.getElementById(`video-cell-${id}`);
    if (!cell) {
        cell = document.createElement('div');
        cell.className = 'video-cell';
        cell.id = `video-cell-${id}`;
        cell.innerHTML = `
            <video autoplay playsinline ${id === 'local' ? 'muted' : ''}></video>
            <div class="peer-tag">${label}</div>
        `;
        videoGrid?.appendChild(cell);
    }
    const video = cell.querySelector('video');
    if (video) video.srcObject = stream;
}

function handleIncomingMediaStream(stream, peerColor) {
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
        if (typeof updateTeamAudioIsolation === 'function') updateTeamAudioIsolation();
    }
}


function promptVideoInvite(from) {
    const modal = document.getElementById('modal-video-invite');
    const sender = document.getElementById('video-invite-sender');
    if (!modal) return;
    if (sender) sender.innerText = `${from} invited you to join a video stream.`;
    modal.classList.remove('hidden');

    document.getElementById('btn-accept-video').onclick = () => {
        modal.classList.add('hidden');
        showApp('video');
        startVideoCall();
    };
    document.getElementById('btn-decline-video').onclick = () => {
        modal.classList.add('hidden');
        toast("Declined video stream.");
    };
}

function teardownLocalMedia(type) {
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
const origShowApp = showApp; showApp = function(appId) {
    origShowApp(appId);
    if (appId === 'voice' && !localAudioStream) startVoiceCall();
    if (appId === 'video' && !localVideoStream) startVideoCall();
};

// ============================================================================
// APPLICATION E: THE DOCUMENT CLIPBOARD
// ============================================================================
const clipBoard = document.getElementById('clipboard-canvas');
const editToggle = document.getElementById('clipboard-edit-toggle');

if (editToggle && clipBoard) {
    editToggle.onchange = (e) => {
        clipBoard.contentEditable = e.target.checked ? "true" : "false";
        if (e.target.checked) {
            clipBoard.focus();
            toast("Edit mode ON - you can type or paste directly into the board");
        }
    };
}

function syncClipboardContent() {
    if (clipBoard) {
        broadcast({ type: 'CLIP_UPDATE', text: clipBoard.innerText });
    }
}

if (clipBoard) {
    clipBoard.addEventListener('input', syncClipboardContent);
    clipBoard.addEventListener('keyup', syncClipboardContent);
    clipBoard.addEventListener('paste', () => setTimeout(syncClipboardContent, 20));
}

// Copy All
document.getElementById('btn-clip-copy')?.addEventListener('click', async () => {
    const text = clipBoard ? clipBoard.innerText : '';
    if (!text.trim()) {
        toast("Clipboard is empty.");
        return;
    }
    let copied = false;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
            await navigator.clipboard.writeText(text);
            copied = true;
        } catch(e) {}
    }
    if (!copied) {
        try {
            const temp = document.createElement('textarea');
            temp.value = text;
            temp.style.position = 'fixed';
            temp.style.left = '-9999px';
            document.body.appendChild(temp);
            temp.focus();
            temp.select();
            copied = document.execCommand('copy');
            document.body.removeChild(temp);
        } catch(e) {}
    }
    toast(copied ? "Copied all board content to clipboard!" : "Please select text manually to copy.");
});

// Paste In with Graceful Fallback Modal (Permissions Policy CrBug Guard)
document.getElementById('btn-clip-paste')?.addEventListener('click', async () => {
    let text = null;
    let readSuccess = false;
    if (navigator.clipboard && typeof navigator.clipboard.readText === 'function') {
        try {
            text = await navigator.clipboard.readText();
            readSuccess = true;
        } catch(err) {
            readSuccess = false;
        }
    }

    if (readSuccess && typeof text === 'string' && text.length > 0) {
        if (clipBoard) {
            clipBoard.innerText += (clipBoard.innerText ? '\n' : '') + text;
            syncClipboardContent();
        }
        toast("Pasted into document!");
    } else {
        openPasteFallbackModal();
    }
});

function openPasteFallbackModal() {
    const modal = document.getElementById('modal-paste-fallback');
    const textarea = document.getElementById('paste-fallback-textarea');
    if (!modal || !textarea) return;
    textarea.value = '';
    modal.classList.remove('hidden');
    setTimeout(() => textarea.focus(), 50);
}

document.getElementById('btn-paste-cancel')?.addEventListener('click', () => {
    document.getElementById('modal-paste-fallback')?.classList.add('hidden');
});

document.getElementById('btn-paste-insert')?.addEventListener('click', () => {
    const textarea = document.getElementById('paste-fallback-textarea');
    const pasted = textarea ? textarea.value : '';
    if (pasted && clipBoard) {
        clipBoard.innerText += (clipBoard.innerText ? '\n' : '') + pasted;
        syncClipboardContent();
        toast("Text inserted into clipboard!");
    }
    document.getElementById('modal-paste-fallback')?.classList.add('hidden');
});

document.getElementById('btn-clip-clear')?.addEventListener('click', () => {
    if (clipBoard) clipBoard.innerText = '';
    broadcast({ type: 'CLIP_CLEAR' });
    toast("Document wiped globally.");
});

// ============================================================================
// APPLICATION F: STUDIO CANVAS (DRAW / SKETCH)
// ============================================================================
const cvs = document.getElementById('drawing-board');
const ctx = cvs ? cvs.getContext('2d') : null;
const previewCvs = document.getElementById('preview-board');
const previewCtx = previewCvs ? previewCvs.getContext('2d') : null;

let currentTool = 'pen';
let currentColor = '#2d3748';
let currentSize = 3;
let isDrawing = false;
let startX = 0, startY = 0;

let canvasInitialized = false;
function resizeCanvas() {
    if (!cvs || canvasInitialized) return;
    cvs.width = 2000;
    cvs.height = 1500;
    if (previewCvs) {
        previewCvs.width = 2000;
        previewCvs.height = 1500;
    }
    if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, cvs.width, cvs.height);
    }
    canvasInitialized = true;
}
function getScaledCoords(e, isTouch = false) {
    const rect = cvs.getBoundingClientRect();
    const scaleX = cvs.width / rect.width;
    const scaleY = cvs.height / rect.height;
    let clientX = e.clientX;
    let clientY = e.clientY;
    if (isTouch) {
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else if (e.changedTouches && e.changedTouches.length > 0) {
            clientX = e.changedTouches[0].clientX;
            clientY = e.changedTouches[0].clientY;
        }
    }
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}

// Canvas Tool Palette
['pen', 'eraser', 'rect', 'circle', 'line', 'arrow', 'fill'].forEach(t => {
    document.getElementById(`tool-${t}`)?.addEventListener('click', () => {
        currentTool = t;
        document.querySelectorAll('.tool-group .icon-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(`tool-${t}`)?.classList.add('active');
    });
});

document.querySelectorAll('.swatch').forEach(sw => {
    sw.onclick = () => {
        document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
        sw.classList.add('active');
        currentColor = sw.dataset.color;
    };
});

document.getElementById('canvas-color')?.addEventListener('input', (e) => {
    currentColor = e.target.value;
});
document.getElementById('canvas-size')?.addEventListener('input', (e) => {
    currentSize = parseInt(e.target.value, 10);
});

// Canvas Drawing Coordinates Streaming
if (cvs && ctx) {
    cvs.onmousedown = (e) => { const coords = getScaledCoords(e); startDraw(coords.x, coords.y); };
    cvs.onmousemove = (e) => { const coords = getScaledCoords(e); moveDraw(coords.x, coords.y); };
    cvs.onmouseup = (e) => { const coords = getScaledCoords(e); endDraw(coords.x, coords.y); };
    cvs.onmouseleave = () => isDrawing = false;

    // Mobile touch support
    cvs.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const coords = getScaledCoords(e, true);
        startDraw(coords.x, coords.y);
    });
    cvs.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const coords = getScaledCoords(e, true);
        moveDraw(coords.x, coords.y);
    });
    cvs.addEventListener('touchend', (e) => { 
        if (isDrawing) {
            const coords = getScaledCoords(e, true);
            endDraw(coords.x, coords.y);
        }
        isDrawing = false;
    });
}

function startDraw(x, y) {
    if (cvs.width === 0 || cvs.height === 0) return;
    if (currentTool === 'fill') {
        floodFill(Math.round(x), Math.round(y), currentColor);
        broadcast({ type: 'DRAW_COORDS', data: { tool: 'fill', x: Math.round(x), y: Math.round(y), color: currentColor } });
        return;
    }
    isDrawing = true;
    startX = x;
    startY = y;
}

function moveDraw(x, y) {
    if (!isDrawing) return;

    if (currentTool === 'pen' || currentTool === 'eraser') {
        const color = currentTool === 'eraser' ? '#ffffff' : currentColor;
        const size = currentTool === 'eraser' ? currentSize * 3 : currentSize;

        ctx.strokeStyle = color;
        ctx.lineWidth = size;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(x, y);
        ctx.stroke();

        broadcast({
            type: 'DRAW_COORDS',
            data: { tool: 'line', x1: startX, y1: startY, x2: x, y2: y, color, width: size }
        });

        startX = x;
        startY = y;
    } else {
        // Shapes preview
        if (previewCtx) {
            previewCtx.clearRect(0, 0, previewCvs.width, previewCvs.height);
            previewCtx.strokeStyle = currentColor;
            previewCtx.lineWidth = currentSize;
            previewCtx.lineCap = 'round';
            previewCtx.lineJoin = 'round';
            drawShapeToCtx(previewCtx, currentTool, startX, startY, x, y);
        }
    }
}

function endDraw(x, y) {
    if (!isDrawing) return;
    isDrawing = false;
    if (['rect', 'circle', 'line', 'arrow'].includes(currentTool)) {
        if (previewCtx) previewCtx.clearRect(0, 0, previewCvs.width, previewCvs.height);
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = currentSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        drawShapeToCtx(ctx, currentTool, startX, startY, x, y);
        broadcast({
            type: 'DRAW_COORDS',
            data: { tool: currentTool, x1: startX, y1: startY, x2: x, y2: y, color: currentColor, width: currentSize }
        });
    }
}

function drawShapeToCtx(targetCtx, type, x1, y1, x2, y2) {
    targetCtx.beginPath();
    if (type === 'rect') {
        targetCtx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    } else if (type === 'circle') {
        const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        targetCtx.arc(x1, y1, radius, 0, 2 * Math.PI);
        targetCtx.stroke();
    } else if (type === 'line') {
        targetCtx.moveTo(x1, y1);
        targetCtx.lineTo(x2, y2);
        targetCtx.stroke();
    } else if (type === 'arrow') {
        targetCtx.moveTo(x1, y1);
        targetCtx.lineTo(x2, y2);
        const headlen = Math.max(15, targetCtx.lineWidth * 2.5);
        const angle = Math.atan2(y2 - y1, x2 - x1);
        targetCtx.lineTo(x2 - headlen * Math.cos(angle - Math.PI / 6), y2 - headlen * Math.sin(angle - Math.PI / 6));
        targetCtx.moveTo(x2, y2);
        targetCtx.lineTo(x2 - headlen * Math.cos(angle + Math.PI / 6), y2 - headlen * Math.sin(angle + Math.PI / 6));
        targetCtx.stroke();
    }
}

function drawRemoteCoordinates(data) {
    if (!ctx) return;
    if (data.tool === 'fill') {
        floodFill(data.x, data.y, data.color);
        return;
    }
    ctx.strokeStyle = data.color;
    ctx.lineWidth = data.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (data.tool === 'line') {
        ctx.beginPath();
        ctx.moveTo(data.x1, data.y1);
        ctx.lineTo(data.x2, data.y2);
        ctx.stroke();
    } else {
        drawShapeToCtx(ctx, data.tool, data.x1, data.y1, data.x2, data.y2);
    }
}

function floodFill(startX, startY, fillColor) {
    if (!ctx || !cvs || cvs.width === 0 || cvs.height === 0) return;
    const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);
    const data = imgData.data;

    // Convert hex fillColor to rgba
    const tempDiv = document.createElement('div');
    tempDiv.style.color = fillColor;
    document.body.appendChild(tempDiv);
    const cs = window.getComputedStyle(tempDiv).color;
    document.body.removeChild(tempDiv);
    const m = cs.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!m) return;
    const fillR = parseInt(m[1], 10);
    const fillG = parseInt(m[2], 10);
    const fillB = parseInt(m[3], 10);

    const startIndex = (startY * cvs.width + startX) * 4;
    const targetR = data[startIndex];
    const targetG = data[startIndex + 1];
    const targetB = data[startIndex + 2];
    const targetA = data[startIndex + 3];

    if (targetR === fillR && targetG === fillG && targetB === fillB) return;

    const stack = [[startX, startY]];
    const width = cvs.width;
    const height = cvs.height;

    while (stack.length > 0) {
        const [x, y] = stack.pop();
        if (x < 0 || x >= width || y < 0 || y >= height) continue;
        const idx = (y * width + x) * 4;

        if (data[idx] === targetR && data[idx + 1] === targetG && data[idx + 2] === targetB && data[idx + 3] === targetA) {
            data[idx] = fillR;
            data[idx + 1] = fillG;
            data[idx + 2] = fillB;
            data[idx + 3] = 255;

            stack.push([x + 1, y]);
            stack.push([x - 1, y]);
            stack.push([x, y + 1]);
            stack.push([x, y - 1]);
        }
    }
    ctx.putImageData(imgData, 0, 0);
}

// Clear Canvas
document.getElementById('btn-canvas-clear')?.addEventListener('click', () => {
    clearCanvasDirect();
    broadcast({ type: 'CANVAS_CLEAR' });
    toast("Canvas cleared.");
});

function clearCanvasDirect() {
    if (ctx && cvs) ctx.clearRect(0, 0, cvs.width, cvs.height);
}

// Download Snapshot
document.getElementById('btn-canvas-dl')?.addEventListener('click', () => {
    if (!cvs) return;
    const url = cvs.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `privacz-canvas-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast("Whiteboard saved to PNG!");
});

// Canvas Embedded Sidebar Chat & Voice Call Ping
const canvasChatIn = document.getElementById('canvas-chat-in');
const btnCanvasSend = document.getElementById('btn-canvas-send');
if (btnCanvasSend) btnCanvasSend.onclick = sendCanvasComment;
if (canvasChatIn) canvasChatIn.onkeypress = (e) => { if (e.key === 'Enter') sendCanvasComment(); };

function sendCanvasComment() {
    const text = canvasChatIn?.value.trim();
    if (!text) return;
    appendCanvasComment(myColor, text);
    broadcast({ type: 'CANVAS_COMMENT', from: myColor, text });
    if (canvasChatIn) canvasChatIn.value = '';
}

function appendCanvasComment(sender, text) {
    const out = document.getElementById('canvas-chat-out');
    if (!out) return;
    const div = document.createElement('div');
    div.innerHTML = `<strong>${sender}:</strong> ${text}`;
    out.appendChild(div);
    out.scrollTop = out.scrollHeight;
}

document.getElementById('btn-canvas-voice')?.addEventListener('click', () => {
    if (!localAudioStream) {
        startVoiceCall();
        toast("Voice call started in background.");
    } else {
        toast("Voice call is already active.");
    }
    const callBtn = document.getElementById('btn-canvas-voice');
    callBtn?.classList.add('calling');
    toast("Pinging Voice Call to all peers...");
    setTimeout(() => callBtn?.classList.remove('calling'), 4000);
});

// ============================================================================
// APPLICATION G: GRANDMASTER CHESS ENGINE (FIDE RULES)
// ============================================================================
let chessBoard = [];
let chessTurn = 'w';
let selectedSquare = null;
let enPassantSquare = null; // {r, c}
let castlingRights = { wK: true, wQ: true, bK: true, bQ: true };
let halfMoveClock = 0;
let fullMoveNumber = 1;
let matchStarted = false;

let chessClocks = { w: 0, b: 0 };
let chessInc = 0;
let chessClockInterval = null;
let lastClockUpdate = 0;

function formatChessTime(ms) {
    if (ms <= 0) return '0:00';
    const totalS = Math.floor(ms / 1000);
    const m = Math.floor(totalS / 60);
    const s = totalS % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
}

function stopChessClock() {
    if (chessClockInterval) clearInterval(chessClockInterval);
    chessClockInterval = null;
}

function runChessClock() {
    lastClockUpdate = Date.now();
    stopChessClock();
    chessClockInterval = setInterval(() => {
        if (!matchStarted || chessMode === 'unlimited') return;
        const now = Date.now();
        const delta = now - lastClockUpdate;
        lastClockUpdate = now;
        
        chessClocks[chessTurn] -= delta;
        
        if (chessClocks[chessTurn] <= 0) {
            chessClocks[chessTurn] = 0;
            stopChessClock();
            matchStarted = false;
            const winner = chessTurn === 'w' ? 'Black' : 'White';
            const statusBanner = document.getElementById('chess-game-status');
            if (statusBanner) statusBanner.innerText = `${winner} wins on time!`;
            updateClockDisplays();
            return;
        }
        updateClockDisplays();
    }, 100);
}

function updateClockDisplays() {
    if (chessMode === 'unlimited') {
        document.getElementById('white-timer').innerText = '∞';
        document.getElementById('black-timer').innerText = '∞';
    } else {
        document.getElementById('white-timer').innerText = formatChessTime(chessClocks.w);
        document.getElementById('black-timer').innerText = formatChessTime(chessClocks.b);
    }
}

let pendingPromotion = null; // { fromR, fromC, toR, toC }

// Roster & Isolated Audio State
let chessRoster = { white: [], black: [], spectators: [] };
let myChessTeam = null; // 'white' | 'black' | 'spectator'
let isTeamVoiceActive = false;

// Initial 8x8 Board Matrix
function initChessBoard() {
    chessBoard = [
        ['br', 'bn', 'bb', 'bq', 'bk', 'bb', 'bn', 'br'],
        ['bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp'],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp'],
        ['wr', 'wn', 'wb', 'wq', 'wk', 'wb', 'wn', 'wr']
    ];
    chessTurn = 'w';
    selectedSquare = null;
    enPassantSquare = null;
    castlingRights = { wK: true, wQ: true, bK: true, bQ: true };
    halfMoveClock = 0;
    fullMoveNumber = 1;
    renderChessboard();
}

function getPieceUnicode(code) {
    const map = {
        'wp': '♙', 'wr': '♖', 'wn': '♘', 'wb': '♗', 'wq': '♕', 'wk': '♔',
        'bp': '♟', 'br': '♜', 'bn': '♞', 'bb': '♝', 'bq': '♛', 'bk': '♚'
    };
    return map[code] || '';
}

function hasLegalMoves(board, color, ep, cr) {
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (board[r][c] && board[r][c][0] === color) {
                for (let tr = 0; tr < 8; tr++) {
                    for (let tc = 0; tc < 8; tc++) {
                        if (isLegalMove(r, c, tr, tc, board, color, ep, cr)) return true;
                    }
                }
            }
        }
    }
    return false;
}


function isInsufficientMaterial(board) {
    let pieces = [];
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (board[r][c]) pieces.push(board[r][c]);
        }
    }
    if (pieces.length === 2) return true;
    if (pieces.length === 3) {
        if (pieces.some(p => p[1] === 'b' || p[1] === 'n')) return true;
    }
    return false;
}

function renderChessboard() {
    const boardEl = document.getElementById('chessboard');
    if (!boardEl) return;
    boardEl.innerHTML = '';

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const sq = document.createElement('div');
            const isLight = (r + c) % 2 === 0;
            sq.className = `sq ${isLight ? 'light' : 'dark'}`;
            sq.dataset.r = r;
            sq.dataset.c = c;

            const piece = chessBoard[r][c];
            if (piece) {
                sq.innerText = getPieceUnicode(piece);
                sq.dataset.piece = piece;
            }

            if (selectedSquare && selectedSquare.r === r && selectedSquare.c === c) {
                sq.classList.add('selected');
            }

            sq.onclick = () => handleSquareClick(r, c);
            boardEl.appendChild(sq);
        }
    }

    // Update status banner
    const statusBanner = document.getElementById('chess-game-status');
    if (statusBanner) {
        if (!matchStarted) {
            statusBanner.innerText = 'Match In Standby';
        } else {
            let stateText = chessTurn === 'w' ? "White's Turn" : "Black's Turn";
            let gameOver = false;
            if (isKingInCheck(chessBoard, chessTurn)) {
                if (!hasLegalMoves(chessBoard, chessTurn, enPassantSquare, castlingRights)) {
                    stateText = "CHECKMATE! " + (chessTurn === 'w' ? "Black" : "White") + " Wins!";
                    gameOver = true;
                } else {
                    stateText += " (CHECK)";
                }
            } else {
                if (!hasLegalMoves(chessBoard, chessTurn, enPassantSquare, castlingRights)) {
                    stateText = "STALEMATE! Draw.";
                    gameOver = true;
                } else if (halfMoveClock >= 100) {
                    stateText = "DRAW! 50-Move Rule.";
                    gameOver = true;
                } else if (isInsufficientMaterial(chessBoard)) {
                    stateText = "DRAW! Insufficient Material.";
                    gameOver = true;
                }
            }
            if (gameOver) {
                matchStarted = false;
                stopChessClock();
            }
            statusBanner.innerText = gameOver ? stateText : `Match Active: ${stateText}`;
        }
    }
}

function handleSquareClick(r, c) {
    if (!matchStarted) {
        toast("Match has not started yet.");
        return;
    }
    if (myChessTeam === 'spectator') {
        toast("Spectator mode: piece movement locked.");
        return;
    }
    // Team-turn validation: only current team players can move
    const teamColor = myChessTeam === 'white' ? 'w' : (myChessTeam === 'black' ? 'b' : null);
    if (teamColor && teamColor !== chessTurn) {
        toast("It is not your team's turn.");
        return;
    }

    const clickedPiece = chessBoard[r][c];

    if (!selectedSquare) {
        if (clickedPiece && clickedPiece[0] === chessTurn) {
            selectedSquare = { r, c };
            renderChessboard();
            highlightLegalMoves(r, c);
        }
    } else {
        const fromR = selectedSquare.r;
        const fromC = selectedSquare.c;

        if (fromR === r && fromC === c) {
            selectedSquare = null;
            renderChessboard();
            return;
        }

        // Validate FIDE legal move
        if (isLegalMove(fromR, fromC, r, c, chessBoard, chessTurn, enPassantSquare, castlingRights)) {
            const movingPiece = chessBoard[fromR][fromC];

            // Pawn Promotion Check
            if (movingPiece === 'wp' && r === 0) {
                pendingPromotion = { fromR, fromC, toR: r, toC: c };
                document.getElementById('modal-chess-promotion')?.classList.remove('hidden');
                return;
            } else if (movingPiece === 'bp' && r === 7) {
                pendingPromotion = { fromR, fromC, toR: r, toC: c };
                document.getElementById('modal-chess-promotion')?.classList.remove('hidden');
                return;
            }

            executeMove(fromR, fromC, r, c, null);
        } else if (clickedPiece && clickedPiece[0] === chessTurn) {
            selectedSquare = { r, c };
            renderChessboard();
            highlightLegalMoves(r, c);
        } else {
            toast("Illegal FIDE move.");
        }
    }
}

function highlightLegalMoves(fromR, fromC) {
    const boardEl = document.getElementById('chessboard');
    if (!boardEl) return;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (isLegalMove(fromR, fromC, r, c, chessBoard, chessTurn, enPassantSquare, castlingRights)) {
                const sq = boardEl.children[r * 8 + c];
                if (sq) {
                    sq.classList.add('valid-dest');
                    if (chessBoard[r][c]) sq.classList.add('has-piece');
                }
            }
        }
    }
}

// Pawn Promotion Buttons
document.querySelectorAll('.promo-btn').forEach(btn => {
    btn.onclick = () => {
        if (!pendingPromotion) return;
        const promoPiece = btn.dataset.piece;
        document.getElementById('modal-chess-promotion')?.classList.add('hidden');
        executeMove(pendingPromotion.fromR, pendingPromotion.fromC, pendingPromotion.toR, pendingPromotion.toC, promoPiece);
        pendingPromotion = null;
    };
});

function executeMove(fromR, fromC, toR, toC, promoPiece) {
    const piece = chessBoard[fromR][fromC];
    const color = piece[0];
    const targetPiece = chessBoard[toR][toC];
    const isEnPassantCap = piece[1] === 'p' && enPassantSquare && toR === enPassantSquare.r && toC === enPassantSquare.c;
    if (piece[1] === 'p' || targetPiece !== '' || isEnPassantCap) {
        halfMoveClock = 0;
    } else {
        halfMoveClock++;
    }
    if (color === 'b') fullMoveNumber++;

    // En Passant capture execution
    if (piece[1] === 'p' && enPassantSquare && toR === enPassantSquare.r && toC === enPassantSquare.c) {
        const capR = color === 'w' ? toR + 1 : toR - 1;
        chessBoard[capR][toC] = '';
    }

    // Castling rook move execution
    if (piece[1] === 'k' && Math.abs(toC - fromC) === 2) {
        if (toC === 6) { // Kingside
            chessBoard[toR][5] = chessBoard[toR][7];
            chessBoard[toR][7] = '';
        } else if (toC === 2) { // Queenside
            chessBoard[toR][3] = chessBoard[toR][0];
            chessBoard[toR][0] = '';
        }
    }

    // Update castling rights
    if (piece === 'wk') { castlingRights.wK = false; castlingRights.wQ = false; }
    if (piece === 'bk') { castlingRights.bK = false; castlingRights.bQ = false; }
    if (piece === 'wr' && fromR === 7 && fromC === 0) castlingRights.wQ = false;
    if (piece === 'wr' && fromR === 7 && fromC === 7) castlingRights.wK = false;
    if (piece === 'br' && fromR === 0 && fromC === 0) castlingRights.bQ = false;
    if (piece === 'br' && fromR === 0 && fromC === 7) castlingRights.bK = false;

    // Track En Passant opportunity
    if (piece[1] === 'p' && Math.abs(toR - fromR) === 2) {
        enPassantSquare = { r: (fromR + toR) / 2, c: fromC };
    } else {
        enPassantSquare = null;
    }

    // Place piece or promoted piece
    chessBoard[toR][toC] = promoPiece ? `${color}${promoPiece}` : piece;
    chessBoard[fromR][fromC] = '';
    selectedSquare = null;

    // Switch turn
    // Add increment before switching
if (chessMode !== 'unlimited') {
    chessClocks[chessTurn] += chessInc * 1000;
}
chessTurn = chessTurn === 'w' ? 'b' : 'w';
lastClockUpdate = Date.now();
renderChessboard();
updateClockDisplays();

    const movePayload = {
        type: 'CHESS_MOVE',
        board: chessBoard,
        turn: chessTurn,
        enPassant: enPassantSquare,
        castling: castlingRights,
        halfMove: halfMoveClock,
        fullMove: fullMoveNumber,
        lastMove: `${piece} to [${toR}, ${toC}]`,
        clocks: chessClocks,
        lastClockUpdate: lastClockUpdate
    };
    broadcast(movePayload);

    const hist = document.getElementById('move-history-bar');
    if (hist) hist.innerText = `Move: ${piece.toUpperCase()} to ${String.fromCharCode(97 + toC)}${8 - toR}`;
}

function receiveChessMove(msg) {
    chessBoard = msg.board;
    chessTurn = msg.turn;
    enPassantSquare = msg.enPassant;
    castlingRights = msg.castling;
    if (msg.halfMove !== undefined) halfMoveClock = msg.halfMove;
    if (msg.fullMove !== undefined) fullMoveNumber = msg.fullMove;
    
    if (msg.clocks) {
        chessClocks = msg.clocks;
        lastClockUpdate = msg.lastClockUpdate || Date.now();
        updateClockDisplays();
    }
    
    renderChessboard();
    const hist = document.getElementById('move-history-bar');
    if (hist && msg.lastMove) hist.innerText = `Move: ${msg.lastMove}`;
}

// FIDE Legal Move Evaluator
function isPseudoLegal(fR, fC, tR, tC, board, turn, ep) {
    const piece = board[fR][fC];
    if (!piece || piece[0] !== turn) return false;
    const dest = board[tR][tC];
    if (dest && dest[0] === turn) return false;

    const type = piece[1];
    const dr = tR - fR;
    const dc = tC - fC;
    const absDr = Math.abs(dr);
    const absDc = Math.abs(dc);

    if (type === "p") {
        const fwd = piece[0] === "w" ? -1 : 1;
        const startRow = piece[0] === "w" ? 6 : 1;
        if (dc === 0 && dr === fwd && !dest) return true;
        if (dc === 0 && dr === 2 * fwd && fR === startRow && !dest && !board[fR + fwd][fC]) return true;
        if (absDc === 1 && dr === fwd && dest && dest[0] !== piece[0]) return true;
        if (absDc === 1 && dr === fwd && ep && ep.r === tR && ep.c === tC) return true;
        return false;
    }
    if (type === "n") {
        return (absDr === 2 && absDc === 1) || (absDr === 1 && absDc === 2);
    }
    if (type === "b") {
        if (absDr !== absDc) return false;
        return isPathClear(fR, fC, tR, tC, board);
    }
    if (type === "r") {
        if (dr !== 0 && dc !== 0) return false;
        return isPathClear(fR, fC, tR, tC, board);
    }
    if (type === "q") {
        if (absDr !== absDc && dr !== 0 && dc !== 0) return false;
        return isPathClear(fR, fC, tR, tC, board);
    }
    if (type === "k") {
        if (absDr <= 1 && absDc <= 1) return true;
        return false;
    }
    return false;
}

function isKingInCheck(board, color) {
    let kR = -1, kC = -1;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (board[r][c] === `${color}k`) { kR = r; kC = c; break; }
        }
    }
    if (kR === -1) return false;
    const oppColor = color === "w" ? "b" : "w";
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (board[r][c] && board[r][c][0] === oppColor) {
                if (isPseudoLegal(r, c, kR, kC, board, oppColor, null)) return true;
            }
        }
    }
    return false;
}

function isLegalMove(fR, fC, tR, tC, board, turn, ep, cr) {
    const piece = board[fR][fC];
    if (!piece || piece[0] !== turn) return false;
    if (piece[1] === "k" && Math.abs(tC - fC) === 2 && (tR - fR) === 0) {
        if (isKingInCheck(board, turn)) return false;
        let valid = false;
        if (turn === "w") {
            if (tC === 6 && cr.wK && !board[7][5] && !board[7][6]) valid = true;
            if (tC === 2 && cr.wQ && !board[7][1] && !board[7][2] && !board[7][3]) valid = true;
        } else {
            if (tC === 6 && cr.bK && !board[0][5] && !board[0][6]) valid = true;
            if (tC === 2 && cr.bQ && !board[0][1] && !board[0][2] && !board[0][3]) valid = true;
        }
        if (!valid) return false;
        const step = Math.sign(tC - fC);
        let simBoard1 = board.map(row => [...row]);
        simBoard1[fR][fC + step] = piece;
        simBoard1[fR][fC] = "";
        if (isKingInCheck(simBoard1, turn)) return false;
        let simBoard2 = board.map(row => [...row]);
        simBoard2[fR][fC + step * 2] = piece;
        simBoard2[fR][fC] = "";
        if (isKingInCheck(simBoard2, turn)) return false;
        return true;
    }
    if (!isPseudoLegal(fR, fC, tR, tC, board, turn, ep)) return false;
    let simBoard = board.map(row => [...row]);
    simBoard[tR][tC] = piece;
    simBoard[fR][fC] = "";
    if (piece[1] === "p" && ep && tR === ep.r && tC === ep.c) {
        const capR = turn === "w" ? tR + 1 : tR - 1;
        simBoard[capR][tC] = "";
    }
    return !isKingInCheck(simBoard, turn);
}
function isPathClear(fR, fC, tR, tC, board) {
    const stepR = Math.sign(tR - fR);
    const stepC = Math.sign(tC - fC);
    let curR = fR + stepR;
    let curC = fC + stepC;
    while (curR !== tR || curC !== tC) {
        if (board[curR][curC]) return false;
        curR += stepR;
        curC += stepC;
    }
    return true;
}

// Host Match Deployment & Setup
document.getElementById('btn-chess-start')?.addEventListener('click', () => {
    if (!isHost) return;
    
    // Determine teams based on host choice
    const checkedSide = document.querySelector('input[name="side"]:checked');
    const hostSide = checkedSide ? checkedSide.value : 'w';
    chessRoster.white = [];
    chessRoster.black = [];
    
    const allPeers = [{ id: myId, color: myColor }, ...Object.values(peers).map(p => ({ id: p.pc, color: p.color }))];
    const otherPeers = allPeers.filter(p => p.color !== myColor);
    
    if (hostSide === 'w') {
        chessRoster.white.push(myColor);
        otherPeers.forEach(p => chessRoster.black.push(p.color));
    } else {
        chessRoster.black.push(myColor);
        otherPeers.forEach(p => chessRoster.white.push(p.color));
    }
    
    const timeVal = parseInt(document.getElementById('slider-chess-time')?.value || 10, 10);
    const incVal = parseInt(document.getElementById('slider-chess-inc')?.value || 5, 10);
    
    initChessBoard();
    matchStarted = true;
    
    const config = { 
        started: true, 
        mode: chessMode,
        time: timeVal, 
        inc: incVal,
        roster: chessRoster
    };
    
    broadcast({ type: 'CHESS_START', config });
    updateChessRoster();
    
    if (config.mode === 'unlimited') {
        document.getElementById('white-timer').innerText = '∞';
        document.getElementById('black-timer').innerText = '∞';
    } else {
        document.getElementById('white-timer').innerText = config.time + ':00';
        document.getElementById('black-timer').innerText = config.time + ':00';
    }
    
    toast("Grandmaster Chess match deployed!");
});

function startChessMatch(config) {
    if (config.roster) {
        chessRoster = config.roster;
        if (chessRoster.white.includes(myColor)) myChessTeam = 'white';
        else if (chessRoster.black.includes(myColor)) myChessTeam = 'black';
        else myChessTeam = 'spectator';
        renderChessRoster();
    }
    
    chessMode = config.mode || 'realtime';
    chessInc = config.inc || 0;
    const timeMs = (config.time || 10) * 60 * 1000;
    chessClocks = { w: timeMs, b: timeMs };
    
    initChessBoard();
    matchStarted = true;
    updateClockDisplays();
    runChessClock();
    
    const statusBanner = document.getElementById('chess-game-status');
    if (statusBanner) statusBanner.innerText = "Match In Progress";
    
    toast("Chess match is live!");
}

// Roster Management & Spectator Lounge

function updateTeamAudioIsolation() {
    Object.values(peers).forEach(peer => {
        const audio = document.getElementById('audio-stream-' + peer.color);
        if (audio) {
            if (isTeamVoiceActive && myChessTeam && myChessTeam !== 'spectator') {
                // We are in a team and team voice is active
                const peerTeam = chessRoster.white.includes(peer.color) ? 'white' : 
                                 (chessRoster.black.includes(peer.color) ? 'black' : 'spectator');
                audio.muted = (peerTeam !== myChessTeam);
            } else {
                // General voice chat (no team isolation)
                audio.muted = false;
            }
        }
    });
}

function updateChessRoster() {
    const allPeers = [{ id: myId, color: myColor }, ...Object.values(peers).map(p => ({ id: p.pc, color: p.color }))];
    
    // Auto-assign teams if empty
    if (chessRoster.white.length === 0 && chessRoster.black.length === 0) {
        allPeers.forEach((p, idx) => {
            if (idx % 2 === 0) chessRoster.white.push(p.color);
            else chessRoster.black.push(p.color);
        });
    }

    if (chessRoster.white.includes(myColor)) myChessTeam = 'white';
    else if (chessRoster.black.includes(myColor)) myChessTeam = 'black';
    else myChessTeam = 'spectator';

    renderChessRoster();
    updateTeamAudioIsolation();
}

function renderChessRoster() {
    const whiteList = document.getElementById('roster-white');
    const blackList = document.getElementById('roster-black');
    if (whiteList) whiteList.innerHTML = chessRoster.white.map(c => `<li>${c}</li>`).join('');
    if (blackList) blackList.innerHTML = chessRoster.black.map(c => `<li>${c}</li>`).join('');

    // Host spectator reassign bar
    const reassignList = document.getElementById('spectator-reassign-list');
    if (reassignList && isHost) {
        reassignList.innerHTML = chessRoster.spectators.map(c => `
            <div class="reassign-item">
                <span>${c}</span>
                <div class="reassign-btns">
                    <button class="btn-w" onclick="hostAssignTeam('${c}', 'white')">W</button>
                    <button class="btn-b" onclick="hostAssignTeam('${c}', 'black')">B</button>
                </div>
            </div>
        `).join('') || '<div style="color:var(--text-faint); font-size:0.75rem;">No spectators</div>';
    }
}

window.hostAssignTeam = function(peerColor, team) {
    chessRoster.spectators = chessRoster.spectators.filter(c => c !== peerColor);
    if (team === 'white') chessRoster.white.push(peerColor);
    if (team === 'black') chessRoster.black.push(peerColor);
    renderChessRoster();
    broadcast({ type: 'ROSTER_UPDATE', roster: chessRoster });
    toast(`Assigned ${peerColor} to ${team} team.`);
};

document.getElementById('btn-spectate')?.addEventListener('click', () => {
    chessRoster.white = chessRoster.white.filter(c => c !== myColor);
    chessRoster.black = chessRoster.black.filter(c => c !== myColor);
    if (!chessRoster.spectators.includes(myColor)) chessRoster.spectators.push(myColor);
    myChessTeam = 'spectator';
    renderChessRoster();
    broadcast({ type: 'ROSTER_UPDATE', roster: chessRoster });
    toast("You are now in the Spectator Lounge. Pieces are locked.");
});

// Team Isolated Voice Line
document.getElementById('btn-toggle-team-voice')?.addEventListener('click', async () => {
    isTeamVoiceActive = !isTeamVoiceActive;
    const statusEl = document.getElementById('team-voice-state');
    const btn = document.getElementById('btn-toggle-team-voice');

    if (isTeamVoiceActive) {
        if (!localAudioStream) {
            await startVoiceCall();
        }
        if (statusEl) statusEl.innerText = `Connected (${myChessTeam})`;
        if (btn) {
            btn.innerText = 'Leave Team Audio';
            btn.classList.add('muted');
        }
        toast(`Joined encrypted private audio channel for ${myChessTeam} team.`);
    } else {
        if (statusEl) statusEl.innerText = 'Standby';
        if (btn) {
            btn.innerText = 'Join Team Audio';
            btn.classList.remove('muted');
        }
        toast("Disconnected from team audio channel.");
    }
    updateTeamAudioIsolation();
});

// Initialize on page load
initChessBoard();
updatePresence();

function replaceNameInRoster(oldName, newName) {
    const swap = (arr) => {
        const idx = arr.indexOf(oldName);
        if (idx !== -1) arr[idx] = newName;
    };
    swap(chessRoster.white);
    swap(chessRoster.black);
    swap(chessRoster.spectators);
}

document.getElementById('btn-change-name')?.addEventListener('click', () => {
    document.getElementById('input-change-name').value = myColor;
    document.getElementById('modal-change-name').classList.remove('hidden');
});

document.getElementById('btn-cancel-name')?.addEventListener('click', () => {
    document.getElementById('modal-change-name').classList.add('hidden');
});

document.getElementById('btn-save-name')?.addEventListener('click', () => {
    const newName = document.getElementById('input-change-name').value;
    if (newName && newName.trim() !== '' && newName.trim() !== myColor) {
        const oldName = myColor;
        myColor = newName.trim();
        replaceNameInRoster(oldName, myColor);
        broadcast({ type: 'NAME_CHANGE', newName: myColor });
        toast(`Name changed from ${oldName} to ${myColor}`);
        updateChessRoster();
    }
    document.getElementById('modal-change-name').classList.add('hidden');
});


const btnFs = document.getElementById('btn-canvas-fullscreen');
if (btnFs) {
    btnFs.addEventListener('click', () => {
        const wrapper = document.getElementById('app-canvas');
        if (!document.fullscreenElement) {
            wrapper.requestFullscreen().catch(err => {
                toast("Error attempting to enable fullscreen: " + err.message);
            });
        } else {
            document.exitFullscreen();
        }
    });
}


let chessMode = 'realtime';

// Sliders UI
document.getElementById('slider-chess-time')?.addEventListener('input', (e) => {
    document.getElementById('clock-minutes-display').innerText = e.target.value;
});
document.getElementById('slider-chess-inc')?.addEventListener('input', (e) => {
    document.getElementById('clock-inc-display').innerText = e.target.value;
});

// Mode Tabs
document.querySelectorAll('#chess-mode-tabs button').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('#chess-mode-tabs button').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        chessMode = e.target.dataset.mode;
        const timeWrap = document.getElementById('time-controls-wrap');
        if (timeWrap) timeWrap.style.display = chessMode === 'unlimited' ? 'none' : 'block';
    });
});

// Randomize Side
document.getElementById('btn-chess-random')?.addEventListener('click', () => {
    const sides = ['w', 'b'];
    const chosen = sides[Math.floor(Math.random() * sides.length)];
    const radio = document.querySelector('input[name="side"][value="' + chosen + '"]');
    if (radio) radio.checked = true;
});
window.addEventListener('load', () => window.dispatchEvent(new Event('resize')));
