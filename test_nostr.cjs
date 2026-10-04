const WebSocket = require('ws');
const ws = new WebSocket('wss://relay.damus.io');
ws.on('open', () => {
    console.log('Damus Connected');
    // Nostr requires specific event format, let's see if it just echoes or accepts raw JSON
    ws.send(JSON.stringify(["REQ", "sub1", {"kinds": [1]}]));
});
ws.on('message', (data) => {
    console.log('Damus Received:', data.toString());
    ws.close();
});
ws.on('error', (err) => {
    console.log('Damus Error:', err);
});
