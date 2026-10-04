const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const regex = /pc\.onconnectionstatechange = \(\) => \{/;

if(regex.test(code)) {
    code = code.replace(
        regex,
        `pc.onnegotiationneeded = async () => {
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
    pc.onconnectionstatechange = () => {`
    );
    fs.writeFileSync('app.js', code);
    console.log("Patched onnegotiationneeded");
}
