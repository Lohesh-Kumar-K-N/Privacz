const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const replacement = `if (btnChatVoice) {
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
                    pendingAudioBlob = new Blob(audioChunks, { type: 'audio/webm' });
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
}`;

code = code.replace(/if \(btnChatVoice\) \{[\s\S]*?btnChatVoice\.addEventListener\('touchend', stopRecording\);\n\}/, replacement);

fs.writeFileSync('app.js', code);
console.log("JS patched.");
