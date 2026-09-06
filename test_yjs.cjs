const WebSocket = require('ws');
const ws = new WebSocket('wss://signaling.yjs.dev');
ws.on('open', () => {
    console.log('Yjs Connected');
    ws.send(JSON.stringify({type: 'subscribe', topics: ['test-room']}));
});
ws.on('message', (data) => {
    console.log('Yjs Received:', data.toString());
    ws.close();
});
ws.on('error', (err) => {
    console.log('Yjs Error:', err);
});
