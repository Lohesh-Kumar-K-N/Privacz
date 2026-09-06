# Privacz 🔒

Privacz is a 100% serverless, zero-dependency, ultra-low latency Peer-to-Peer (P2P) collaborative workspace running entirely in the browser. It features secure chat, massive file transfers, a collaborative canvas, voice messaging, and real-time chess—all without a centralized backend server.

## ✨ Features

- **End-to-End P2P Architecture**: All chat messages, file chunks, and voice data stream directly from browser to browser via WebRTC DataChannels. No data is ever stored on a centralized database.
- **Global Serverless Handshake**: Uses the free PeerJS network strictly as an "ephemeral mailman" to swap initial cryptographic connection keys across the open internet, dropping out immediately once the P2P tunnel is established.
- **Secure File Transfer**: Send massive files directly between peers without file size limits imposed by traditional cloud storage providers.
- **Collaborative Canvas**: Draw, sketch, and brainstorm in real-time, then export snapshots instantly.
- **Voice Messages**: Record and send inline voice snippets seamlessly.
- **Built-in Chess**: Play real-time chess with your connected peers.
- **Zero Build Step**: Built strictly with semantic HTML5, native CSS3, and vanilla JavaScript (ES6+). No Webpack, Vite, React, or Node.js backend required.

## 🚀 How It Works

1. **Host Creates a Session**: The Host generates a cryptographic Room ID and registers it on the PeerJS global relay.
2. **Link Sharing**: The Host shares the generated URL (e.g., `https://your-domain.com/#session_a1b2c3d4`) with peers via any messaging app.
3. **The Handshake**: When a Guest opens the link, their browser pings the PeerJS relay to locate the Host, and they silently swap WebRTC SDP keys.
4. **Direct Connection**: Once the WebRTC tunnel binds, the PeerJS relay is abandoned. The connection is now purely direct laptop-to-laptop.

## 💻 Local Development & Deployment

Because Privacz is purely static frontend code, it is incredibly easy to run and deploy.

### Running Locally
You don't need `npm install` or any build tools. Just serve the directory with any basic static file server:
```bash
# Using Python
python3 -m http.server 3000

# Using Node (npx)
npx serve .
```
Then open `http://localhost:3000` in your browser.

### Deploying to Vercel (or GitHub Pages, Netlify)
Since this app contains zero backend code, it is perfect for free static hosting tiers:
1. Push this repository to GitHub.
2. Import the repository into Vercel, Netlify, or GitHub Pages.
3. Deploy! The app will work flawlessly across the internet immediately.

## 📁 Project Structure

- `index.html` - The single-page application layout and UI structure.
- `styles.css` - Custom UI styling utilizing modern CSS Grid, Flexbox, and CSS Variables (zero external CSS frameworks).
- `app.js` - The core engine handling the PeerJS handshake, WebRTC DataChannel routing, UI state, Canvas rendering, and File processing.

## 🛡️ Privacy Notice
Privacz routes data P2P via WebRTC. While WebRTC encrypts traffic in transit via DTLS/SRTP, connecting to another peer inherently reveals your public IP address to that peer (a fundamental requirement of P2P networking). Use a VPN if hiding your IP address from the peer you are connecting with is necessary.
