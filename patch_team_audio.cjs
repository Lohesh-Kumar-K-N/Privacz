const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const audioLogic = `
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
`;

code = code.replace(/function updateChessRoster\(\) \{/, audioLogic + "\\nfunction updateChessRoster() {");

code = code.replace(/renderChessRoster\(\);\n\}/, "renderChessRoster();\n    updateTeamAudioIsolation();\n}");

code = code.replace(/document\.getElementById\('btn-toggle-team-voice'\)\?\.addEventListener\('click', async \(\) => \{[\s\S]*?toast\("Disconnected from team audio channel\."\);\n    \}\n\}\);/, 
`document.getElementById('btn-toggle-team-voice')?.addEventListener('click', async () => {
    isTeamVoiceActive = !isTeamVoiceActive;
    const statusEl = document.getElementById('team-voice-state');
    const btn = document.getElementById('btn-toggle-team-voice');

    if (isTeamVoiceActive) {
        if (!localAudioStream) {
            await startVoiceCall();
        }
        if (statusEl) statusEl.innerText = \`Connected (\${myChessTeam})\`;
        if (btn) {
            btn.innerText = 'Leave Team Audio';
            btn.classList.add('muted');
        }
        toast(\`Joined encrypted private audio channel for \${myChessTeam} team.\`);
    } else {
        if (statusEl) statusEl.innerText = 'Standby';
        if (btn) {
            btn.innerText = 'Join Team Audio';
            btn.classList.remove('muted');
        }
        toast("Disconnected from team audio channel.");
    }
    updateTeamAudioIsolation();
});`);

fs.writeFileSync('app.js', code);
console.log("Team audio patched");
