const WebSocket = require('ws');
const ws = new WebSocket('wss://free.blr2.piesocket.com/v3/1?api_key=oCdCMcMPQpbvNjUIzqtvF1d2X2okWpDQj4AwARJuAgtjhzKxVEjQU6IdCjwm');
ws.on('open', () => {
    console.log('PieSocket Connected');
    ws.send(JSON.stringify({text: 'Hello'}));
});
ws.on('message', (data) => {
    console.log('PieSocket Received:', data.toString());
    ws.close();
});
ws.on('error', (err) => {
    console.log('PieSocket Error:', err);
});
