const WebSocket = require('ws');
const ws = new WebSocket('wss://socketsbay.com/wss/v2/1/demo/');
ws.on('open', () => {
    console.log('Connected');
    ws.send('Hello');
});
ws.on('message', (data) => {
    console.log('Received:', data.toString());
    ws.close();
});
ws.on('error', (err) => {
    console.log('Error:', err);
});
