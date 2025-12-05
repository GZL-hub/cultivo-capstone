# Socket.IO Real-Time Updates Guide

## What is Socket.IO?

Socket.IO enables **real-time, bidirectional communication** between your frontend and backend. Instead of refreshing the page or polling the server repeatedly to check for new sensor data, Socket.IO automatically pushes updates to your browser the moment new data arrives.

## What Does It Do in Cultivo?

When your ESP32 soil sensors send data to the backend API, Socket.IO **instantly broadcasts** those updates to all connected users viewing the same farm. This means:

- **Sensor readings update live** on the dashboard without refreshing
- **Connection status** shows "Live" when connected, "Offline" when disconnected
- **Multiple users** can view the same farm and see updates simultaneously
- **No polling delays** - data appears within milliseconds of being recorded

## Architecture Overview

```
ESP32 Device → Backend API → Socket.IO Server → Frontend (Your Browser)
                    ↓
                Database (MongoDB)
```

1. **ESP32** sends sensor data to `/api/sensors/record-data` endpoint
2. **Backend** saves data to MongoDB and emits Socket.IO event
3. **Socket.IO** broadcasts update to all users in the farm's "room"
4. **Frontend** receives event and updates sensor cards in real-time

## What You Need to Do

### For Developers (Already Implemented)

✅ **Backend Setup** - Socket.IO server integrated with Express
✅ **Frontend Service** - `socketService.ts` manages connections
✅ **Component Updates** - Dashboard and SensorDashboard listen for updates
✅ **Event Broadcasting** - Sensor controller emits events on new readings

### For ESP32 Device Integration

Your ESP32 code should send HTTP POST requests to:

**Endpoint:** `POST /api/sensors/record-data`

**Body (JSON):**
```json
{
  "deviceId": "SENSOR-001",
  "moisture": 65.5,
  "temperature": 28.3,
  "ph": 6.8,
  "ec": 1200,
  "nitrogen": 45,
  "phosphorus": 32,
  "potassium": 28,
  "pumpStatus": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Data recorded successfully",
  "data": {
    "readingId": "...",
    "sensorId": "...",
    "deviceName": "...",
    "timestamp": "2025-12-05T..."
  }
}
```

When you POST to this endpoint, Socket.IO **automatically broadcasts** the update to all connected frontends viewing that farm.

## How to Test

### 1. Start the Application

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm start
```

### 2. Open the Dashboard

Navigate to the main dashboard or sensor management page. Look for the **WiFi icon indicator**:
- 🟢 **Green "Live"** - Socket.IO connected
- ⚪ **Gray "Offline"** - Disconnected

### 3. Simulate Sensor Data

Use Postman, curl, or your ESP32 device to POST data:

```bash
curl -X POST http://localhost:8080/api/sensors/record-data \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "SENSOR-001",
    "moisture": 72.5,
    "temperature": 27.0,
    "ph": 6.9,
    "ec": 1150,
    "nitrogen": 50,
    "phosphorus": 35,
    "potassium": 30,
    "pumpStatus": false
  }'
```

**Expected Result:** The sensor card on your dashboard should **update immediately** without refreshing the page.

### 4. Multi-User Test

- Open the dashboard in two browser windows/tabs
- Post new sensor data from Postman
- Both windows should update simultaneously

## Technical Details

### Connection Lifecycle

```typescript
// Frontend connects when farm is loaded
socketService.connect();
socketService.joinFarm(farmId);

// Subscribe to sensor updates
socketService.onSensorUpdate((data) => {
  // Update sensor state
});

// Cleanup on unmount
socketService.offSensorUpdate(callback);
socketService.leaveFarm();
```

### Backend Event Emission

```typescript
// In sensorController.ts - recordDataByDevice()
io.to(`farm-${updatedSensor.farmId}`).emit('sensor-update', {
  sensorId: updatedSensor._id,
  deviceName: updatedSensor.deviceName,
  lastReading: updatedSensor.lastReading,
  timestamp: new Date()
});
```

### Room-Based Broadcasting

Socket.IO uses **rooms** to ensure users only receive updates for **their own farm**:
- When you view a farm, frontend joins room: `farm-${farmId}`
- Backend broadcasts only to that specific room
- Users in different farms don't see each other's updates

## Environment Configuration

### Backend (.env)

```bash
PORT=8080
FRONTEND_URL=http://localhost:3000  # For CORS
```

### Frontend (.env)

```bash
REACT_APP_API_URL=http://localhost:8080
```

For production (Google Cloud Run):
```bash
REACT_APP_API_URL=https://your-app-url.run.app
```

## Troubleshooting

### "Offline" Status Shown

**Possible Causes:**
1. Backend server not running
2. CORS configuration issue
3. Firewall blocking WebSocket connections
4. Wrong `REACT_APP_API_URL` in .env

**Fix:**
- Check backend logs: `npm run dev` should show "Socket.IO enabled"
- Verify CORS origin in `backend/src/index.ts` matches frontend URL
- Check browser console for Socket.IO connection errors

### Updates Not Appearing

**Possible Causes:**
1. Not joined to farm room (farmId is null)
2. Device sending to wrong endpoint
3. Device using wrong deviceId (not registered in database)

**Fix:**
- Check browser console logs: Should see `[Socket.IO] Joined farm room: ...`
- Verify sensor exists in database with matching `deviceId`
- Check backend logs for sensor-update emissions

### Multiple Connections

**Solution:**
The `socketService.ts` uses a **singleton pattern** - only one connection per browser tab. Multiple tabs will each have their own connection, which is normal.

## Deployment Notes

### Google Cloud Run

Socket.IO works with Cloud Run's WebSocket support. No special configuration needed beyond standard deployment.

**Important:** Set `FRONTEND_URL` environment variable to your production domain for CORS:

```bash
gcloud run services update cultivo \
  --set-env-vars FRONTEND_URL=https://your-domain.com
```

### Transport Fallback

Socket.IO automatically handles transport selection:
1. **WebSocket** (preferred) - Low latency, bidirectional
2. **HTTP Polling** (fallback) - Works through restrictive firewalls

The current configuration (`transports: ['websocket', 'polling']`) tries WebSocket first and falls back to polling if needed.

## Summary

**For Users:**
- Dashboard updates automatically when sensors send new data
- Look for green "Live" indicator to confirm connection
- No action needed - Socket.IO works transparently

**For ESP32 Developers:**
- POST sensor data to `/api/sensors/record-data` with `deviceId`
- Socket.IO handles broadcasting automatically
- Test with curl/Postman before deploying to hardware

**For System Admins:**
- Ensure port 8080 is accessible
- Configure CORS with `FRONTEND_URL` environment variable
- Monitor backend logs for connection/emission events

---

**Need Help?** Check browser console and backend logs for Socket.IO messages. All events are logged for debugging.
