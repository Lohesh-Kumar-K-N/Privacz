const WebSocket = require('ws');
const ws = new WebSocket('wss://free.blr2.piesocket.com/v3/1?api_key=VCXCEuvhGcBDP7XhiJJUDvR1e1D3eiVjgZ9VRiaV&notify_self=1');
ws.on('open', () => {
    console.log('Pie Connected');
    ws.send(JSON.stringify({text: 'Hello'}));
});
ws.on('message', (data) => {
    console.log('Pie Received:', data.toString());
    ws.close();
});
ws.on('error', (err) => {
    console.log('Pie Error:', err);
});
