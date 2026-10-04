const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const oldStreamRegex = /function streamFile\(fileId, file\) \{[\s\S]*?readNextChunk\(\);\n\}/;

const newStream = `function streamFile(fileId, file) {
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
}`;

code = code.replace(oldStreamRegex, newStream);

const oldTelemetryRegex = /function handleFileTelemetry\(msg\) \{[\s\S]*?\n\}/;
const newTelemetry = `function handleFileTelemetry(msg) {
    // Show peer download progress on Host / sender screen
    updateProgressRing(msg.fileId, msg.percent);
    
    const metaText = document.getElementById(\`meta-\${msg.fileId}\`);
    if (metaText) {
        if (msg.percent < 100) {
            metaText.innerText = \`Delivering to \${msg.receiver}... \${msg.percent}%\`;
        } else {
            metaText.innerText = \`Delivered to \${msg.receiver}!\`;
            toast(\`File successfully delivered to \${msg.receiver}!\`);
        }
    }
}`;

code = code.replace(oldTelemetryRegex, newTelemetry);

fs.writeFileSync('app.js', code);
