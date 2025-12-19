# CCTV Streaming to Cloud React App via WebRTC - Setup Summary

This document details the configuration and steps required to stream a local IP camera (Hikvision) to a cloud-hosted React application using WebRTC, mediated by a GCP Compute Engine instance running a media server.

## 1. Architecture Overview

The system consists of three main parts communicating across the local network and the public internet:

### Local Network

**Hikvision Camera**: The source of the video/audio feed via RTSP.

**FFmpeg Bridge**: A process running 24/7 on a local machine (Desktop/Raspberry Pi) that pulls the camera's RTSP stream, transcodes it, and pushes it to the cloud media server.

### Google Cloud Platform (GCP)

**Compute Engine (GCE) VM**: Hosts the MediaMTX media server, receiving the stream from the FFmpeg bridge and serving it via WebRTC (WHEP).

**Cloud Run**: Hosts the React frontend application and potentially a Node.js backend API.

### Client

**React Application**: The user interface running in a web browser, connecting to the MediaMTX server via WebRTC to display the low-latency stream.

### Data Flow

```
Camera (RTSP/Private IP) -> FFmpeg Bridge (Local Machine) -> MediaMTX (GCE VM/Public IP) -> React App (Browser/WebRTC)
```

## 2. Component Configuration

### 2.1. Hikvision Camera

- **Model**: DS-2CV2Q_2_1G1-IDW (or similar PT model)
- **Local IP Address**: 192.168.68.112
- **Username**: admin
- **Password**: WOLLQQ (Verification Code from camera sticker)
- **RTSP Stream URL (Main Stream)**: `rtsp://admin:WOLLQQ@192.168.68.112:554/Streaming/Channels/101`
- **Codecs**: H.265 (HEVC) video, AAC audio (requires transcoding)

### 2.2. Local FFmpeg Bridge

**Hardware**: Runs on a dedicated machine on the same local network as the camera (e.g., Raspberry Pi 4/5, Mini PC, Old Laptop, or Desktop for testing). Must run 24/7.

**OS**: Linux (Recommended: Debian, Ubuntu Server, Raspberry Pi OS Lite) or Windows (for testing).

**Software**: FFmpeg command-line tool. Installation varies by OS (e.g., `apt install ffmpeg` on Debian/Ubuntu, `brew install ffmpeg` on macOS, manual download/path config on Windows).

#### Final Working Command (Optimized for Stability & Low Latency)

```powershell
# On Windows PowerShell (run from ffmpeg/bin directory):
.\ffmpeg -rtsp_transport tcp -reconnect 1 -reconnect_streamed 1 -reconnect_delay_max 5 -fflags +genpts+discardcorrupt -use_wallclock_as_timestamps 1 -i "rtsp://admin:WOLLQQ@192.168.68.112:554/Streaming/Channels/102" -c:v libx264 -preset ultrafast -tune zerolatency -vsync cfr -r 25 -g 50 -keyint_min 25 -sc_threshold 0 -b:v 2M -maxrate 2M -bufsize 1M -pix_fmt yuv420p -c:a aac -b:a 64k -ar 48000 -ac 1 -async 1 -max_muxing_queue_size 1024 -flags +global_header+low_delay -rtsp_transport tcp -f rtsp "rtsp://136.110.0.27:8554/livefeed"
```

```bash
# On Linux/macOS:
ffmpeg -rtsp_transport tcp -reconnect 1 -reconnect_streamed 1 -reconnect_delay_max 5 -fflags +genpts+discardcorrupt -use_wallclock_as_timestamps 1 -i "rtsp://admin:WOLLQQ@192.168.68.112:554/Streaming/Channels/102" -c:v libx264 -preset ultrafast -tune zerolatency -vsync cfr -r 25 -g 50 -keyint_min 25 -sc_threshold 0 -b:v 2M -maxrate 2M -bufsize 1M -pix_fmt yuv420p -c:a aac -b:a 64k -ar 48000 -ac 1 -async 1 -max_muxing_queue_size 1024 -flags +global_header+low_delay -rtsp_transport tcp -f rtsp "rtsp://136.110.0.27:8554/livefeed"
```

#### Command Breakdown

**Input Stability Flags:**
- **`-rtsp_transport tcp`**: Forces reliable TCP connections to prevent packet loss
- **`-reconnect 1 -reconnect_streamed 1 -reconnect_delay_max 5`**: Auto-reconnects if camera stream drops
- **`-fflags +genpts`**: Regenerates timestamps (fixes "Non-monotonic DTS" errors)
- **`-use_wallclock_as_timestamps 1`**: Uses system time instead of camera's potentially broken timestamps
- **`/Channels/102`**: Uses camera's substream (more stable than main stream /101)

**Video Encoding (H.265 → H.264):**
- **`-c:v libx264`**: Transcodes to browser-compatible H.264 codec
- **`-preset ultrafast`**: Fast encoding with minimal CPU usage
- **`-tune zerolatency`**: Disables frame reordering for lowest possible latency
- **`-vsync cfr -r 25`**: Constant 25fps frame rate (prevents timing issues)
- **`-g 50 -keyint_min 25`**: Keyframe every 2 seconds for seeking
- **`-b:v 2M -maxrate 2M -bufsize 1M`**: 2Mbps bitrate with 1MB buffer (low latency)

**Audio Encoding (AAC → AAC):**
- **`-c:a aac`**: More stable than Opus for this camera
- **`-b:a 64k -ar 48000 -ac 1`**: 64kbps mono audio at 48kHz
- **`-async 1`**: Audio sync (fixes "Queue input is backward in time" errors)

**Low Latency Flags:**
- **`-flags +global_header+low_delay`**: WebRTC compatibility + reduced delay
- **`-max_muxing_queue_size 1024`**: Prevents queue overflow
- **`rtsp://136.110.0.27:8554/livefeed`**: Pushes to MediaMTX on GCE VM

**Expected Latency:** ~0.5-1.5 seconds (down from 1.5-2.5s with previous command)

**Automation**: On Linux, configure to run as a systemd service for automatic startup and restart.

### 2.3. GCP Compute Engine VM (Media Server)

#### Instance Configuration

- **Instance Name**: (User Defined)
- **Region**: us-central1 (or user preference)
- **Machine Type**: e2-micro (Low cost, sufficient for single stream without transcoding)
- **OS**: Debian 12 (or latest)
- **Boot Disk**: 10GB Standard Persistent Disk
- **External IP**: 136.110.0.27 (Ephemeral, specific to this instance)
- **Network Tags**: `ssh-access`, `rtsp-push`, `webrtc-server`

#### Firewall Rules (Ingress)

- **allow-ssh**: TCP 22 from 0.0.0.0/0 (or restricted IPs) - Target: `ssh-access`
- **allow-rtsp-push**: TCP 8554 from `<Your_Local_Desktop_Public_IP>` - Target: `rtsp-push`
- **allow-webrtc**: TCP & UDP 8889 from 0.0.0.0/0 - Target: `webrtc-server`
- **allow-hls-test**: TCP 8888 from 0.0.0.0/0 - Target: `webrtc-server`
- **allow-webrtc-media-range**: UDP 8000-8001 from 0.0.0.0/0 - Target: `webrtc-server` (Crucial for the specific MediaMTX version's media ports)

#### Software

**MediaMTX** (installed via downloaded release binary)

#### Certificate Generation (for HTTPS)

```bash
# Run in VM SSH terminal
openssl req -x509 -newkey rsa:2048 -keyout server.key -out server.crt -sha256 -days 3650 -nodes -subj "/CN=136.110.0.27"
```

#### Final mediamtx.yml Configuration

```yaml
# HLS Settings (optional fallback/test)
hls: yes
hlsAllowOrigin: '*'

# WebRTC Settings (low-latency primary)
webrtc: yes
webrtcAllowOrigin: '*' # Allow browser connections
webrtcICEServers: # STUN server for NAT traversal
  - "stun:stun.l.google.com:19302"
webrtcEncryption: yes # Enable HTTPS
webrtcServerKey: server.key # Path to generated key
webrtcServerCert: server.crt # Path to generated cert

# Define allowed stream paths
paths:
  livefeed:
    # Empty block registers the path
```

**Running**: Start via SSH terminal: `./mediamtx`. (For production, run as a systemd service).

### 2.4. React Application (Client)

**Hosting**: GCP Cloud Run (or other web hosting). Served over HTTPS.

**Architecture**: Shared stream model to support multiple simultaneous viewers (e.g., 4x4 grid = 16 cameras showing same feed)

#### Key Components

**1. SharedStreamProvider.tsx** (`components/farm-management/components/camera/`)
- Context provider that manages a **single WebRTC connection** shared by all video players
- Creates one `RTCPeerConnection` with STUN servers
- Handles ICE connection state, reconnection logic with exponential backoff
- Provides shared `MediaStream` to all child components
- States: `idle`, `connecting`, `connected`, `error`
- Auto-reconnects on failure (2s, 4s, 8s, 16s, max 30s backoff)

**2. SharedVideoPlayer.tsx**
- Lightweight component that consumes the shared stream from context
- Attaches shared `MediaStream` to HTML5 `<video>` element
- No independent WebRTC connection logic
- Supports fullscreen mode via containerRef prop

**3. CameraGridItem.tsx**
- Individual camera tile in grid layout
- Displays camera label, status indicator, and controls
- **Hover controls**: Fullscreen button, refresh button (on error)
- **Fullscreen functionality**: Click maximize icon to expand camera to full screen
- **Error state**: Shows "Retry Connection" button in center

**4. FarmCCTV.tsx**
- Main CCTV dashboard component
- Wraps grid in `SharedStreamProvider` to enable single connection
- Supports 2x2, 3x3, 4x4 grid layouts
- Global connection status indicator with retry button
- All cameras in grid display the same stream (efficient for monitoring single feed)

#### Connection Logic

**SharedStreamProvider creates one connection:**
- Uses browser's native `RTCPeerConnection` API
- Connects to MediaMTX WHEP endpoint: `https://136.110.0.27:8889/livefeed/whep`
- Configures STUN servers: `stun.l.google.com:19302`, `stun1.l.google.com:19302`
- Initiates connection via POST request with SDP offer
- Sets remote SDP answer received from server
- Handles `ontrack` event to capture `MediaStream`
- Requests video only: `addTransceiver('video', { direction: 'recvonly' })`
- Includes comprehensive error handling for ICE/connection failures
- Uses `useRef` for callbacks to prevent infinite loops

**Performance Benefits:**
- 16 cameras in 4x4 grid = **1 WebRTC connection** (not 16)
- **16x less bandwidth** usage
- **16x less server load** on MediaMTX
- **16x less browser resources** (single video decoder)
- Eliminates "too many connections" errors

**User Interaction:**
- Browser shows warning for self-signed certificate (requires user acceptance)
- Hover over camera tiles to reveal controls
- Click fullscreen icon to expand individual camera
- Click refresh/retry on error to reconnect stream
- Press ESC to exit fullscreen mode

### 2.5. CI/CD Pipeline (Cloud Run App Deployment Only)

**Tools**: GitHub Actions (deploy.yml), GCP Cloud Build (cloudbuild.yaml), Docker (Dockerfile)

#### Process

On push to main branch:

1. GitHub Actions checks out code, authenticates to GCP
2. Triggers Cloud Build using cloudbuild.yaml
3. Cloud Build builds the Docker image (using Dockerfile, which builds React frontend and Node.js backend). Build args pass secrets like API keys
4. Pushes the image to Artifact Registry
5. GitHub Actions deploys the new image to the Cloud Run service (cultivo-capstone)

**Scope**: This pipeline only manages the Cloud Run web application deployment, not the GCE VM or the local FFmpeg bridge.

## 3. Key Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| **RTSP in Browser** | Browsers don't support RTSP. Solved by using MediaMTX server to convert to WebRTC/HLS. |
| **Private IP Access** | Cloud server cannot access local camera IP. Solved by pushing the stream from local network to cloud using FFmpeg bridge. |
| **Latency** | HLS fallback has high latency (10-30s). Solved by implementing WebRTC (sub-second latency). |
| **Codec Incompatibility** | Camera's H.265 video and AAC audio are not universally compatible. Solved by transcoding to H.264 video and AAC audio in the FFmpeg bridge. |
| **Packet Loss** | Initial UDP stream push was unreliable. Solved by forcing TCP transport in FFmpeg (`-rtsp_transport tcp`). |
| **WebRTC Connection Failure (ICE Failed)** | NAT traversal issues preventing direct connection. Solved by adding STUN server config (`webrtcICEServers`) to MediaMTX and opening required UDP media ports (8000-8001) in the GCP firewall. |
| **CORS Errors** | Browser blocked requests from React app domain to MediaMTX IP. Solved by adding `hlsAllowOrigin` / `webrtcAllowOrigin` in mediamtx.yml. |
| **Mixed Content Error** | HTTPS React app blocked requests to HTTP MediaMTX. Solved by generating self-signed certificates, enabling HTTPS (`webrtcEncryption: yes`) in MediaMTX, and changing React URL to https://. |
| **MediaMTX Config Errors** | Iteratively fixed mediamtx.yml syntax based on server error messages related to data types (bool vs object, string vs []string) and unknown fields (iceUDPMuxPort). |
| **MediaMTX Path Error** | Server rejected stream push (400 Bad Request, path not configured). Solved by explicitly defining the path (`paths: livefeed:`) in mediamtx.yml. |
| **React Infinite Loop** | useEffect re-running due to changing callback prop. Solved using useRef for the callback. |
| **FFmpeg Timestamp Errors** | Camera produced non-monotonic DTS/PTS and backward audio timestamps. Solved by regenerating timestamps with `-fflags +genpts`, using system time (`-use_wallclock_as_timestamps 1`), and syncing audio (`-async 1`). Switched to substream (`/Channels/102`) for better stability. |
| **Multiple WebRTC Connections Failing** | 4x4 grid (16 cameras) created 16 simultaneous WebRTC connections, overwhelming MediaMTX and browser. Solved by implementing SharedStreamProvider pattern: single WebRTC connection shared across all video players, reducing bandwidth/CPU by 16x. |
| **Increased Latency Over Time** | Original command lacked zero-latency tuning. Solved by adding `-tune zerolatency`, reducing buffer size (`-bufsize 1M`), and using constant frame rate (`-vsync cfr -r 25`). Achieved ~0.5-1.5s latency (down from 1.5-2.5s). |

---

## 4. Features & User Experience

### Stream Controls

**Refresh/Retry Functionality:**
- **Global Retry Button**: Top-right status indicator shows "Retry" button when connection fails
- **Per-Camera Refresh Icon**: Hover over any camera tile to reveal small refresh icon (appears only on error)
- **Center Error Button**: Large "Retry Connection" button appears in center of failed camera tiles
- **Auto-Reconnect**: Exponential backoff (2s, 4s, 8s, 16s, max 30s) automatically retries failed connections

**Fullscreen Mode:**
- **Maximize Icon**: Hover over any camera tile to reveal fullscreen button (top-right corner)
- **Click to Expand**: Single click expands camera to full screen with overlays intact
- **Exit Fullscreen**: Press `ESC` key or click maximize icon again to return to grid
- **Native Browser API**: Uses standard Fullscreen API for cross-browser compatibility

**Grid Layouts:**
- **2x2 Grid**: 4 cameras displaying same stream
- **3x3 Grid**: 9 cameras displaying same stream
- **4x4 Grid**: 16 cameras displaying same stream (all using single WebRTC connection)

**Connection Status:**
- **Per-Camera Indicators**: Color-coded dots (green=connected, yellow=connecting, red=error, gray=idle)
- **Global Status Bar**: Header shows overall connection state with one-click retry
- **Real-time Timestamp**: Each camera displays current time overlay
- **Recording Indicator**: "REC" label when stream is connected

---

## Summary

This setup enables **ultra-low-latency streaming** (~0.5-1.5 seconds) from a local Hikvision camera to a cloud-hosted React application using WebRTC. The architecture leverages:

- **FFmpeg** for stable H.265→H.264 transcoding with timestamp correction
- **MediaMTX** for WebRTC (WHEP) serving on GCP Compute Engine
- **Shared Stream Provider** for efficient multi-viewer support (single connection for 16+ cameras)
- **Auto-reconnect logic** for production reliability
- **Fullscreen & refresh controls** for enhanced user experience

The solution is optimized for **solo projects with single camera**, eliminating the need for complex streaming servers like GStreamer while maintaining professional-grade performance and scalability.
