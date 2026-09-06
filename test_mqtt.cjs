const WebSocket = require('ws');
const ws = new WebSocket('wss://test.mosquitto.org:8081');
ws.on('open', () => {
    console.log('Mosquitto Connected');
    // Send a basic MQTT connect packet
    const connectPacket = Buffer.from([0x10, 0x0c, 0x00, 0x04, 0x4d, 0x51, 0x54, 0x54, 0x04, 0x02, 0x00, 0x3c, 0x00, 0x00]);
    ws.send(connectPacket);
});
ws.on('message', (data) => {
    console.log('Mosquitto Received:', data);
    ws.close();
});
ws.on('error', (err) => {
    console.log('Mosquitto Error:', err);
});
