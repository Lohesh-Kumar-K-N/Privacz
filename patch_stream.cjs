const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const oldStream = `function streamFile(fileId, file) {
    const CHUNK_SIZE = 16384; // 16KB WebRTC chunk
    const reader = new FileReader();
    let offset = 0;

    reader.onload = (e) => {
        const chunk = e.target.result;
        broadcast(chunk);
        offset += chunk.byteLength;
        const percent = Math.min(100, Math.round((offset / file.size) * 100));
        updateProgressRing(fileId, percent);

        if (offset < file.size) {
            readNextChunk();
        } else {
            toast(\`Sent \${file.name} successfully!\`);
        }
    };

    function readNextChunk() {
        const slice = file.slice(offset, offset + CHUNK_SIZE);
        reader.readAsArrayBuffer(slice);
    }

    readNextChunk();
}`;

const newStream = `function streamFile(fileId, file) {
    const CHUNK_SIZE = 16384; // 16KB WebRTC chunk
    const reader = new FileReader();
    let offset = 0;

    reader.onload = (e) => {
        const chunk = e.target.result;
        broadcast(chunk);
        offset += chunk.byteLength;
        const percent = Math.min(100, Math.round((offset / file.size) * 100));
        updateProgressRing(fileId, percent);

        if (offset < file.size) {
            // Check backpressure to prevent crashing the data channel
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
        } else {
            toast(\`Sent \${file.name} successfully!\`);
        }
    };

    function readNextChunk() {
        const slice = file.slice(offset, offset + CHUNK_SIZE);
        reader.readAsArrayBuffer(slice);
    }

    readNextChunk();
}`;

code = code.replace(oldStream, newStream);
fs.writeFileSync('app.js', code);
