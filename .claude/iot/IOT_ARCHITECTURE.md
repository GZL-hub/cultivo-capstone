# IoT Architecture - ESP32 Dual Reporting System

This document describes the complete architecture for integrating ESP32 sensors with the Cultivo platform.

---

## System Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           CULTIVO IoT ECOSYSTEM                          │
└──────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐
│   FIELD DEPLOYMENT  │
└─────────────────────┘
         │
         │  ┌──────────────────────────────────────────────┐
         └──│  ESP32 + Soil Sensors                       │
            │  • Moisture, Temp, pH, EC, N-P-K            │
            │  • Pump Relay Control                        │
            │  • WiFi Connection                           │
            │  • Dual Reporting Logic                      │
            └──────────────┬────────────┬──────────────────┘
                           │            │
                  ┌────────┘            └────────┐
                  │                              │
                  │ 2s Interval                  │ 30s Interval
                  │ Real-time                    │ Historical
                  │                              │
                  ▼                              ▼
         ┌─────────────────┐          ┌──────────────────────┐
         │   BLYNK CLOUD   │          │  CULTIVO CLOUD RUN   │
         └─────────────────┘          └──────────────────────┘
                  │                              │
                  │                              │
                  ▼                              ▼
         ┌─────────────────┐          ┌──────────────────────┐
         │  BLYNK MOBILE   │          │   MONGODB ATLAS      │
         │      APP        │          │   (Time-Series)      │
         │                 │          └──────────────────────┘
         │  • Real-time    │                     │
         │  • Pump Control │                     │
         │  • Notifications│                     ▼
         └─────────────────┘          ┌──────────────────────┐
                                      │  CULTIVO WEB         │
                                      │  DASHBOARD           │
                                      │                      │
                                      │  • Analytics         │
                                      │  • Historical Charts │
                                      │  • Multi-farm View   │
                                      │  • Alert Management  │
                                      └──────────────────────┘
```

---

## Data Flow Architecture

### 1. Data Collection (ESP32)

```cpp
┌──────────────────────────────────────────────────────┐
│                  ESP32 MAIN LOOP                     │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Every 1 second:                                     │
│  ┌─────────────────────────────────────────┐        │
│  │  readSensors()                          │        │
│  │  • Read 7 analog pins (moisture-NPK)    │        │
│  │  • Convert raw ADC to meaningful units  │        │
│  │  • Apply calibration                    │        │
│  │  • Update pump control logic            │        │
│  └─────────────────────────────────────────┘        │
│                                                      │
│  Every 2 seconds:                                    │
│  ┌─────────────────────────────────────────┐        │
│  │  sendToBlynk()                          │        │
│  │  • Blynk.virtualWrite(V0-V7)            │        │
│  │  • Non-blocking                         │        │
│  │  • For real-time mobile monitoring      │        │
│  └─────────────────────────────────────────┘        │
│                                                      │
│  Every 30 seconds:                                   │
│  ┌─────────────────────────────────────────┐        │
│  │  sendToCloudRun()                       │        │
│  │  • Create JSON payload                  │        │
│  │  • HTTPS POST to /api/sensors/data      │        │
│  │  • Handle response                      │        │
│  │  • Blink LED on success                 │        │
│  └─────────────────────────────────────────┘        │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 2. Cloud Ingestion (Backend)

```
┌───────────────────────────────────────────────────────────────┐
│              CULTIVO CLOUD RUN BACKEND                        │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  POST /api/sensors/data                                       │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  1. Receive JSON payload                            │     │
│  │     {                                               │     │
│  │       "deviceId": "ESP32_001",                      │     │
│  │       "moisture": 45.2,                             │     │
│  │       "temperature": 25.3,                          │     │
│  │       ...                                           │     │
│  │     }                                               │     │
│  └─────────────────────────────────────────────────────┘     │
│                          ↓                                    │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  2. Validate request                                │     │
│  │     • Check required fields                         │     │
│  │     • Validate data types                           │     │
│  └─────────────────────────────────────────────────────┘     │
│                          ↓                                    │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  3. Find sensor by deviceId                         │     │
│  │     const sensor = await Sensor.findOne({          │     │
│  │       deviceId: "ESP32_001"                         │     │
│  │     });                                             │     │
│  │                                                     │     │
│  │     If not found → 404 error                        │     │
│  │     If inactive → 403 error                         │     │
│  └─────────────────────────────────────────────────────┘     │
│                          ↓                                    │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  4. Create reading document                         │     │
│  │     await SensorReading.create({                    │     │
│  │       sensorId: sensor._id,                         │     │
│  │       moisture, temperature, ph, ec,                │     │
│  │       nitrogen, phosphorus, potassium,              │     │
│  │       pumpStatus,                                   │     │
│  │       timestamp: new Date()                         │     │
│  │     });                                             │     │
│  └─────────────────────────────────────────────────────┘     │
│                          ↓                                    │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  5. Update sensor's lastReading                     │     │
│  │     await Sensor.findByIdAndUpdate(                 │     │
│  │       sensor._id,                                   │     │
│  │       { lastReading: {...} }                        │     │
│  │     );                                              │     │
│  └─────────────────────────────────────────────────────┘     │
│                          ↓                                    │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  6. Return success response (201)                   │     │
│  │     {                                               │     │
│  │       "success": true,                              │     │
│  │       "message": "Data recorded successfully",      │     │
│  │       "data": {                                     │     │
│  │         "readingId": "674...",                      │     │
│  │         "sensorId": "673...",                       │     │
│  │         "timestamp": "2025-11-26T..."               │     │
│  │       }                                             │     │
│  │     }                                               │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### 3. Data Storage (MongoDB)

```
┌─────────────────────────────────────────────────────────────┐
│                    MONGODB ATLAS                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Collection: sensors                                        │
│  ┌───────────────────────────────────────────────────┐     │
│  │  {                                                │     │
│  │    "_id": ObjectId("673..."),                     │     │
│  │    "deviceId": "ESP32_001",                       │     │
│  │    "deviceName": "Farm A - Soil Monitor",         │     │
│  │    "farmId": ObjectId("672..."),                  │     │
│  │    "blynkTemplateId": "TMPL1234567890",           │     │
│  │    "blynkAuthToken": "AbCdEf...",                 │     │
│  │    "isActive": true,                              │     │
│  │    "lastReading": {                               │     │
│  │      "timestamp": ISODate("2025-11-26..."),       │     │
│  │      "moisture": 45.2,                            │     │
│  │      "temperature": 25.3,                         │     │
│  │      "ph": 6.8,                                   │     │
│  │      "ec": 1250,                                  │     │
│  │      "nitrogen": 78,                              │     │
│  │      "phosphorus": 65,                            │     │
│  │      "potassium": 82,                             │     │
│  │      "pumpStatus": false                          │     │
│  │    },                                             │     │
│  │    "settings": {                                  │     │
│  │      "moistureThreshold": 30,                     │     │
│  │      "optimalPh": { "min": 6.0, "max": 7.5 },     │     │
│  │      "optimalTemperature": { "min": 20, "max": 30 }│     │
│  │    },                                             │     │
│  │    "createdAt": ISODate("2025-11-20..."),         │     │
│  │    "updatedAt": ISODate("2025-11-26...")          │     │
│  │  }                                                │     │
│  └───────────────────────────────────────────────────┘     │
│                                                             │
│  Collection: sensorreadings (Time-Series)                   │
│  ┌───────────────────────────────────────────────────┐     │
│  │  {                                                │     │
│  │    "_id": ObjectId("674..."),                     │     │
│  │    "sensorId": ObjectId("673..."),                │     │
│  │    "moisture": 45.2,                              │     │
│  │    "temperature": 25.3,                           │     │
│  │    "ph": 6.8,                                     │     │
│  │    "ec": 1250,                                    │     │
│  │    "nitrogen": 78,                                │     │
│  │    "phosphorus": 65,                              │     │
│  │    "potassium": 82,                               │     │
│  │    "pumpStatus": false,                           │     │
│  │    "timestamp": ISODate("2025-11-26T10:30:45Z")   │     │
│  │  }                                                │     │
│  │  ... (one document per reading)                   │     │
│  └───────────────────────────────────────────────────┘     │
│                                                             │
│  Indexes:                                                   │
│  • sensors: { deviceId: 1 } (unique)                        │
│  • sensors: { farmId: 1 }                                   │
│  • sensorreadings: { sensorId: 1, timestamp: -1 }           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Network Communication

### HTTPS POST Request (ESP32 → Cloud Run)

```http
POST /api/sensors/data HTTP/1.1
Host: cultivo-capstone-960317214611.asia-southeast1.run.app
Content-Type: application/json
Content-Length: 198

{
  "deviceId": "ESP32_001",
  "moisture": 45.2,
  "temperature": 25.3,
  "ph": 6.8,
  "ec": 1250,
  "nitrogen": 78,
  "phosphorus": 65,
  "potassium": 82,
  "pumpStatus": false
}
```

### Success Response (201 Created)

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "success": true,
  "message": "Data recorded successfully",
  "data": {
    "readingId": "674123abc...",
    "sensorId": "673abc123...",
    "deviceName": "Farm A - Soil Monitor",
    "timestamp": "2025-11-26T10:30:45.123Z"
  }
}
```

### Error Responses

#### 404 - Device Not Registered
```json
{
  "success": false,
  "error": "Sensor with deviceId 'ESP32_001' not found. Please register this device first."
}
```

#### 400 - Invalid Data
```json
{
  "success": false,
  "error": "Missing required sensor data fields"
}
```

#### 403 - Inactive Device
```json
{
  "success": false,
  "error": "Sensor is not active"
}
```

---

## Security Architecture

### Current Implementation (Testing/Development)

```
ESP32 → HTTPS (TLS 1.2) → Cloud Run
        └─ wifiClient.setInsecure()
           (No certificate validation)
```

**Note:** This is acceptable for testing but should be improved for production.

### Recommended Production Setup

```
┌──────────────────────────────────────────────────────┐
│  SECURITY LAYERS                                     │
├──────────────────────────────────────────────────────┤
│                                                      │
│  1. Transport Layer Security (TLS)                   │
│     • HTTPS with certificate validation              │
│     • Store GCP root CA in ESP32 flash               │
│     • Prevent man-in-the-middle attacks              │
│                                                      │
│  2. Device Authentication                            │
│     • Add API key to request headers                 │
│     • JWT tokens for device authentication           │
│     • Rate limiting per device                       │
│                                                      │
│  3. Data Validation                                  │
│     • Schema validation on backend                   │
│     • Range checks (0-100%, 0-14 pH, etc.)           │
│     • Timestamp verification                         │
│                                                      │
│  4. Access Control                                   │
│     • Device can only write to its own data          │
│     • Read operations require user auth (JWT)        │
│     • Admin-only device registration                 │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## Scalability Considerations

### Current Capacity

```
┌──────────────────────────────────────────────────────┐
│  SYSTEM LIMITS                                       │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Cloud Run (Backend):                                │
│  • Autoscaling: 0-100 instances                      │
│  • Each instance: 1 vCPU, 512MB RAM                  │
│  • Handles ~1000 req/sec per instance                │
│  • Max throughput: ~100,000 req/sec                  │
│                                                      │
│  MongoDB Atlas (M10 Cluster):                        │
│  • Storage: 10GB (expandable)                        │
│  • Memory: 2GB RAM                                   │
│  • Connections: 1,500 simultaneous                   │
│  • Time-series collection for efficient storage      │
│                                                      │
│  Estimated Device Capacity:                          │
│  • 30s interval: ~2,000 concurrent devices           │
│  • 60s interval: ~4,000 concurrent devices           │
│  • 5min interval: ~40,000 concurrent devices         │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Optimization Strategies

1. **Batch Reporting:**
   ```cpp
   // Send multiple readings in one request
   {
     "deviceId": "ESP32_001",
     "readings": [
       { "timestamp": "...", "moisture": 45.2, ... },
       { "timestamp": "...", "moisture": 46.1, ... },
       { "timestamp": "...", "moisture": 47.0, ... }
     ]
   }
   ```

2. **Data Aggregation:**
   ```javascript
   // Store 5-minute averages instead of raw readings
   db.sensorreadings_5min.aggregate([...])
   ```

3. **Edge Processing:**
   ```cpp
   // Only send alerts/anomalies to cloud
   if (moisture < threshold || ph > maxPh) {
     sendAlertToCloud();
   }
   ```

---

## Monitoring & Observability

### ESP32 Monitoring

```
Serial Monitor Output:
├─ WiFi connection status
├─ Sensor readings (every 1s)
├─ Blynk send confirmation (every 2s)
├─ Cloud Run response (every 30s)
│  ├─ HTTP status code (201, 404, 400, etc.)
│  ├─ Response message
│  └─ Round-trip time
├─ Error messages
└─ Memory usage (optional)
```

### Backend Monitoring

```
Cloud Run Logs:
├─ Incoming requests
│  ├─ Device ID
│  ├─ Timestamp
│  └─ Payload size
├─ Processing time
├─ Database operations
├─ Errors & exceptions
└─ HTTP response codes
```

### Dashboard Metrics

```
Cultivo Dashboard:
├─ Device status (online/offline)
├─ Last reading timestamp
├─ Data quality indicators
├─ Alert history
└─ Battery level (if implemented)
```

---

## Deployment Workflow

### Device Provisioning Process

```
1. Administrator Action:
   └─ Register device in Cultivo dashboard
      ├─ Generate unique deviceId
      ├─ Associate with farm
      └─ Configure thresholds

2. Technician Action:
   └─ Flash ESP32 with configured firmware
      ├─ Set WiFi credentials
      ├─ Set deviceId (matches registration)
      ├─ Set Blynk auth token
      └─ Upload sketch

3. Field Deployment:
   └─ Install hardware
      ├─ Connect sensors
      ├─ Position in field
      ├─ Power on
      └─ Verify connectivity

4. Verification:
   └─ Check data flow
      ├─ Serial monitor: Cloud Response [201]
      ├─ Blynk app: Real-time updates
      ├─ Cultivo dashboard: Last reading
      └─ MongoDB: New documents
```

---

## Future Enhancements

### 1. Over-The-Air (OTA) Updates
```cpp
#include <ArduinoOTA.h>

// Allow firmware updates without USB connection
ArduinoOTA.begin();
```

### 2. Power Management
```cpp
// Deep sleep for battery operation
esp_sleep_enable_timer_wakeup(5 * 60 * 1000000); // 5 min
esp_deep_sleep_start();
```

### 3. Local Data Buffering
```cpp
// Store readings locally if cloud unavailable
#include <SPIFFS.h>
saveReadingToFlash(reading);
```

### 4. LoRaWAN Integration
```
ESP32 + LoRa Module → LoRaWAN Gateway → Cloud
(for farms without WiFi coverage)
```

### 5. ML-Based Anomaly Detection
```javascript
// Backend: Detect sensor malfunctions
if (isAnomalous(reading)) {
  sendMaintenanceAlert();
}
```

---

## API Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/sensors/data` | None | IoT device data ingestion |
| POST | `/api/farms/:farmId/sensors` | JWT | Register new device |
| GET | `/api/sensors/:sensorId` | JWT | Get device details |
| GET | `/api/sensors/:sensorId/readings` | JWT | Get historical data |
| GET | `/api/sensors/:sensorId/readings/latest` | JWT | Get latest reading |
| GET | `/api/sensors/:sensorId/stats` | JWT | Get statistics |
| PUT | `/api/sensors/:sensorId` | JWT | Update device settings |
| DELETE | `/api/sensors/:sensorId` | JWT | Delete device |

---

## Related Documentation

- **[ESP32_SETUP_GUIDE.md](./ESP32_SETUP_GUIDE.md)** - Hardware setup and configuration
- **[QUICK_START.md](../.arduino/QUICK_START.md)** - 5-step quick start guide
- **[05-BACKEND-API.md](./05-BACKEND-API.md)** - Complete API reference
- **[06-DATABASE-MODELS.md](./06-DATABASE-MODELS.md)** - Database schema
- **[README.md](../.arduino/README.md)** - Arduino code documentation

---

**Last Updated:** 2025-11-26
