# Privacz

**Privacz** is a browser-based temporary peer-to-peer workspace built
around **WebRTC**. It is designed for direct communication between
browsers without using a central application server to carry the actual
workspace data.

The project combines temporary session links, MQTT-based signaling,
WebRTC peer connections, and a collection of collaborative tools in one
browser application.

> **Important architecture note:** Privacz uses a public MQTT broker as
> a **signaling relay** to introduce peers and exchange WebRTC
> connection information. MQTT is not intended to carry the
> application's files, chat payloads, canvas data, voice, or video.
> After WebRTC is established, those application data paths are
> peer-to-peer.

------------------------------------------------------------------------

## 1. Core Architecture

``` text
                         Signaling only
                  ┌────────────────────────┐
                  │      MQTT Broker       │
                  │  EMQX / Mosquitto      │
                  └───────────┬────────────┘
                              │
                    WebRTC negotiation
                              │
             ┌────────────────┴────────────────┐
             │                                 │
        ┌────▼────┐       WebRTC P2P      ┌────▼────┐
        │ Peer 1  │◄────────────────────►│ Peer 2  │
        │  Host   │                        │ Guest   │
        └────┬────┘                        └─────────┘
             │
             │ WebRTC P2P
             ▼
        ┌──────────┐
        │ Peer 3+  │
        │ Guests   │
        └──────────┘
```

### What MQTT does

MQTT is used for signaling messages such as:

-   Guest `JOIN`
-   WebRTC offer
-   WebRTC answer
-   ICE candidates
-   Peer/session introduction

### What WebRTC does

WebRTC is the actual peer communication layer for the application.

The source contains WebRTC DataChannel messaging for application events
and WebRTC media APIs for audio/video/screen sharing.

The project does **not** intentionally use MQTT as a central
file-storage or chat-storage system.

------------------------------------------------------------------------

## 2. Main Concepts

### Peer 1 --- Host

The first person creating a session becomes the Host.

The Host:

-   Creates the temporary session ID.
-   Starts MQTT signaling.
-   Shares a temporary session URL.
-   Controls workspace navigation.
-   Can accept multiple guests.
-   Has Host-only controls.
-   Creates WebRTC connections for guests.

A normal session link has the form:

``` text
https://your-domain.example/#session_<ROOM_ID>
```

### Peer 2+ --- Guests

A Guest opens the temporary session URL.

The application:

1.  Reads `window.location.hash`.
2.  Detects `session_<ROOM_ID>` or `file_<ROOM_ID>`.
3.  Sets the Guest routing state.
4.  Connects to the MQTT signaling relay.
5.  Subscribes to its Guest topic.
6.  Sends a JOIN message to the Host.
7.  Receives the Host's WebRTC offer.
8.  Creates an answer.
9.  Exchanges ICE candidates.
10. Opens the WebRTC DataChannel.
11. Enters the appropriate Privacz workspace.

------------------------------------------------------------------------

## 3. Temporary Session Links

Privacz currently uses URL hash routing.

### Normal workspace

``` text
#session_<ROOM_ID>
```

### Home-page isolated file sharing

``` text
#file_<ROOM_ID>
```

The URL is generated locally by the application using the current origin
and pathname.

The Host's room ID is generated with a random browser-side identifier.

There is no requirement in the current source for a permanent Privacz
account or permanent room database.

------------------------------------------------------------------------

## 4. Signaling Relay

The current source defines two MQTT-over-WebSocket broker endpoints:

``` text
Primary:
wss://broker.emqx.io:8084/mqtt

Fallback:
wss://test.mosquitto.org:8081
```

The application attempts the configured brokers sequentially rather than
intentionally maintaining two simultaneous signaling connections.

The MQTT connection is used for signaling and is separate from the
WebRTC data path.

### Topic structure

The current signaling implementation uses topics based on the room ID.

Host:

``` text
privacz/<roomID>/host
```

Guest:

``` text
privacz/<roomID>/guest/<guestId>
```

The Guest subscribes to its own Guest topic before sending its JOIN
message.

------------------------------------------------------------------------

## 5. WebRTC

Privacz creates an `RTCPeerConnection` using STUN servers for ICE
discovery.

Current STUN configuration includes:

``` text
stun:stun.l.google.com:19302
stun:stun1.l.google.com:19302
```

The project uses:

``` text
MQTT → signaling
WebRTC → actual peer connection
```

This separation is fundamental to the project architecture.

### Connection sequence

``` text
Guest opens session URL
        ↓
Parse room ID
        ↓
Connect MQTT
        ↓
Subscribe Guest topic
        ↓
Send JOIN
        ↓
Host receives JOIN
        ↓
Host creates RTCPeerConnection
        ↓
Host creates WebRTC offer
        ↓
Guest receives offer
        ↓
Guest creates answer
        ↓
Host receives answer
        ↓
ICE candidate exchange
        ↓
WebRTC connection
        ↓
DataChannel opens
```

------------------------------------------------------------------------

## 6. DataChannel

The project creates a WebRTC DataChannel named:

``` text
privacz
```

The DataChannel carries application-level messages such as:

-   Navigation events
-   Chat messages
-   File metadata
-   File requests
-   File-transfer progress
-   Clipboard updates
-   Canvas events
-   Chess events
-   Presence information
-   Voice-message data
-   Media call control messages

Binary DataChannel messages are also used by the file-transfer engine.

------------------------------------------------------------------------

## 7. File Transfer

Privacz contains two related file-sharing paths.

### 7.1 Normal workspace file transfer

The file-transfer application supports:

-   File selection
-   Drag and drop
-   File metadata announcement
-   File request
-   Chunked transfer
-   Transfer progress
-   Local browser download

The current chunk size is:

``` text
16 KB
```

The transfer implementation also checks DataChannel buffered amount to
avoid continuously filling the browser's send buffer.

### 7.2 Home-page isolated file sharing

From the landing page, the user can select files and generate a
temporary link:

``` text
#file_<ROOM_ID>
```

The Guest can open the link and enter an isolated file-sharing flow.

The current source automatically requests the announced file when the
Guest is in isolated-file mode.

### Important

The current implementation uses WebRTC/DataChannel for the file-transfer
path.

It does **not** intentionally upload the shared file to Firebase,
Supabase, S3, or another file-storage service.

------------------------------------------------------------------------

## 8. Supported Workspace Applications

The current interface contains the following application areas:

### Dashboard

The main Privacz workspace and application launcher.

### File Transfer

Peer-to-peer file transfer with progress indication.

### Chat

Real-time peer messaging.

### Voice

Browser microphone access and WebRTC-based voice communication.

### Video

Camera/video communication and screen sharing.

### Clipboard

Shared clipboard/document text functionality.

### Canvas

Collaborative drawing/whiteboard functionality.

### Chess

Multiplayer chess functionality with shared game state.

------------------------------------------------------------------------

## 9. Host-Controlled Navigation

The Host has special control over application navigation.

When a Guest requests an application, the Host can control whether the
workspace changes.

The source contains Host/Guest checks around navigation and other
workspace controls.

This is intentional: Privacz is not designed as a completely independent
set of isolated browser tabs. The Host acts as the session coordinator
while the actual communication remains peer-to-peer.

------------------------------------------------------------------------

## 10. Peer Identity

Each browser instance generates a temporary local peer ID:

``` text
peer_<random-value>
```

Users also receive a color identity from the project's color palette.

The application maintains a peer collection containing WebRTC connection
information and associated peer state.

------------------------------------------------------------------------

## 11. Permissions

The application can request browser permissions for:

-   Camera
-   Microphone
-   Screen sharing

These permissions are required only for the corresponding features.

A user can use non-media features without necessarily granting
camera/microphone access.

------------------------------------------------------------------------

## 12. Project Structure

Important project files include:

``` text
/
├── index.html
├── app.js
├── styles.css
├── package.json
├── vite.config.ts
├── tsconfig.json
├── metadata.json
├── public/
└── various development/test/patch scripts
```

### `index.html`

Contains the application interface, views, modals, controls, and
workspace structure.

### `app.js`

Contains the primary application logic, including:

-   Routing
-   Host/Guest state
-   MQTT signaling
-   WebRTC connections
-   DataChannel messaging
-   File transfer
-   Chat
-   Voice
-   Video
-   Clipboard
-   Canvas
-   Chess
-   Presence
-   Workspace navigation

### `styles.css`

Contains the visual styling and responsive interface rules.

### `package.json`

Defines the Vite development/build commands and project dependencies.

------------------------------------------------------------------------

## 13. Running Locally

Install dependencies:

``` bash
npm install
```

Start the development server:

``` bash
npm run dev
```

The package configuration currently uses Vite on port `3000` and exposes
the development server on:

``` text
0.0.0.0
```

Build the production application:

``` bash
npm run build
```

Preview the production build:

``` bash
npm run preview
```

Type-check the project:

``` bash
npm run lint
```

------------------------------------------------------------------------

## 14. Basic Testing Procedure

For a basic two-peer test:

### Peer 1

1.  Open Privacz.
2.  Select the normal connection/session option.
3.  Create a session.
4.  Copy the generated session URL.

### Peer 2

1.  Open the session URL in another browser/device.
2.  Allow the page to connect to the signaling relay.
3.  Wait for WebRTC negotiation.
4.  Confirm that the workspace opens.

### File-sharing test

1.  Start a Host session.
2.  Select a small test file.
3.  Generate the file-sharing link.
4.  Open the `#file_<ROOM_ID>` link from another browser/device.
5.  Confirm the Guest receives the file metadata.
6.  Confirm the transfer begins.
7.  Confirm the resulting file can be downloaded locally.

------------------------------------------------------------------------

## 15. Privacy and Data-Flow Model

Privacz's intended data-flow model is:

``` text
                   SIGNALING
Peer A ───────────► MQTT ◄─────────── Peer B
                      │
                      │
              WebRTC negotiation
                      │
                      ▼
                   P2P LINK
Peer A ◄════════════════════════════► Peer B
       Files / Chat / Media / Apps
```

The important distinction is:

**MQTT is the introduction/signaling mechanism.**

**WebRTC is the application communication mechanism.**

Therefore, the existence of an MQTT broker does not mean that the broker
is supposed to receive and store Privacz files, chat messages, video
streams, or canvas data.

------------------------------------------------------------------------

## 16. External Services Used by the Current Source

The current source references external services for specific purposes.

### MQTT signaling

``` text
broker.emqx.io
test.mosquitto.org
```

Used for WebRTC signaling.

### STUN

``` text
stun.l.google.com
stun1.l.google.com
```

Used for WebRTC ICE connectivity discovery.

### QR generation

The current file/session sharing UI generates QR images through:

``` text
api.qrserver.com
```

This is used to render a QR code for the temporary sharing URL. It is
not the file-transfer transport.

------------------------------------------------------------------------

## 17. Security Model

Privacz is based on browser WebRTC connections and temporary session
identifiers.

The project should not be described as providing a formal security
guarantee simply because it uses WebRTC.

In particular:

-   Session IDs should be treated as capabilities for joining the
    corresponding session.
-   Public MQTT brokers are third-party infrastructure.
-   STUN servers are third-party infrastructure.
-   Browser WebRTC security is provided by the WebRTC stack, but
    application-level authorization must still be designed carefully.
-   Public broker availability is outside the control of Privacz.

For production deployment, signaling infrastructure should ideally be
controlled or isolated rather than relying indefinitely on shared public
brokers.

------------------------------------------------------------------------

## 18. Current Architecture Limitations

The following are important engineering considerations for the current
source.

### Public signaling brokers

The application currently depends on public MQTT WebSocket brokers for
signaling.

Therefore:

-   Broker availability is external.
-   Broker performance is external.
-   Public broker policies can change.
-   A production deployment should consider a dedicated signaling
    broker.

### Multi-peer file transfer

The current file streaming implementation broadcasts binary chunks
through the available peer DataChannels.

This should be treated carefully for simultaneous multi-peer transfers.
The current receiving state also uses a single `currentReceivingFile`
object.

The two-peer/single-transfer case should be tested separately from
simultaneous multi-peer file transfers.

### Runtime verification

Static source inspection does not prove that every browser/network
combination works.

A complete verification should include:

-   Two-browser session connection
-   Different devices/networks
-   File transfer
-   Multi-peer connection
-   Voice
-   Video
-   Screen sharing
-   Canvas synchronization
-   Chat synchronization
-   Chess synchronization
-   Disconnect/reconnect behavior

------------------------------------------------------------------------

## 19. Design Principles

Privacz should preserve these principles when the code is modified:

1.  **WebRTC remains the actual P2P transport.**
2.  **MQTT remains signaling only.**
3.  **Do not introduce central file storage unless explicitly
    required.**
4.  **Temporary links remain temporary session capabilities.**
5.  **Do not replace the WebRTC architecture with a centralized data
    server.**
6.  **Host and Guest roles remain distinct.**
7.  **Changes should be incremental and should not rewrite unrelated
    working features.**
8.  **File sharing should remain browser-to-browser.**

------------------------------------------------------------------------

## 20. Development Rule

When modifying Privacz, prefer:

``` text
Inspect
  ↓
Identify the first failure
  ↓
Make the smallest possible change
  ↓
Test
  ↓
Only then modify the next layer
```

Avoid large AI-generated rewrites of `app.js`.

The project contains several tightly connected systems. Changing
routing, MQTT, WebRTC, file transfer, and UI simultaneously makes it
difficult to identify the real cause of a regression.

------------------------------------------------------------------------

## 21. Project Status

This README describes the **current source structure and intended
architecture**.

It does not claim that every feature has been fully runtime-tested.

Before calling a release stable, test the complete path:

``` text
Temporary URL
     ↓
Guest routing
     ↓
MQTT signaling
     ↓
JOIN
     ↓
WebRTC offer/answer
     ↓
ICE
     ↓
DataChannel
     ↓
Application data
```

For file sharing, additionally test:

``` text
File selection
     ↓
FILE_META
     ↓
Guest request
     ↓
WebRTC binary chunks
     ↓
File reconstruction
     ↓
Local download
```

------------------------------------------------------------------------

## 22. License

No license information is defined in the current project source
inspected for this README.

Add an explicit license before distributing the project publicly.
