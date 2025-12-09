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
                  │ 2s Interval                  │ 5min Interval
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

```
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
│  Every 5 minutes:                                    │
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
│  │     { deviceId, moisture, temperature, ... }        │     │
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
│  │     If not found → 404 error                        │     │
│  │     If inactive → 403 error                         │     │
│  └─────────────────────────────────────────────────────┘     │
│                          ↓                                    │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  4. Create reading document                         │     │
│  │     Store in SensorReading collection               │     │
│  └─────────────────────────────────────────────────────┘     │
│                          ↓                                    │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  5. Update sensor's lastReading                     │     │
│  └─────────────────────────────────────────────────────┘     │
│                          ↓                                    │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  6. Return success response (201)                   │     │
│  │     { success, message, data }                      │     │
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
│  │  - _id: ObjectId                                  │     │
│  │  - deviceId: string (unique)                      │     │
│  │  - deviceName: string                             │     │
│  │  - farmId: ObjectId (ref Farm)                    │     │
│  │  - blynkTemplateId: string                        │     │
│  │  - blynkAuthToken: string                         │     │
│  │  - isActive: boolean                              │     │
│  │  - lastReading: object                            │     │
│  │    - timestamp, moisture, temperature, ph, ec,    │     │
│  │      nitrogen, phosphorus, potassium, pumpStatus  │     │
│  │  - settings: object                               │     │
│  │    - moistureThreshold                            │     │
│  │    - optimalPh: { min, max }                      │     │
│  │    - optimalTemperature: { min, max }             │     │
│  │  - createdAt, updatedAt: ISODate                  │     │
│  └───────────────────────────────────────────────────┘     │
│                                                             │
│  Collection: sensorreadings (Time-Series)                   │
│  ┌───────────────────────────────────────────────────┐     │
│  │  - _id: ObjectId                                  │     │
│  │  - sensorId: ObjectId (ref Sensor)                │     │
│  │  - moisture: number                               │     │
│  │  - temperature: number                            │     │
│  │  - ph: number                                     │     │
│  │  - ec: number                                     │     │
│  │  - nitrogen: number                               │     │
│  │  - phosphorus: number                             │     │
│  │  - potassium: number                              │     │
│  │  - pumpStatus: boolean                            │     │
│  │  - timestamp: ISODate                             │     │
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

**Endpoint:** `POST /api/sensors/data`

**Required Fields:**
- deviceId (string)
- moisture (number, 0-100%)
- temperature (number, °C)
- ph (number, 0-14)
- ec (number, µS/cm)
- nitrogen (number, mg/kg)
- phosphorus (number, mg/kg)
- potassium (number, mg/kg)
- pumpStatus (boolean)

### Response Codes

**201 Created** - Data recorded successfully
**400 Bad Request** - Missing/invalid fields
**403 Forbidden** - Sensor is not active
**404 Not Found** - Device not registered
**500 Server Error** - Internal error

---

## Security Architecture

### Current Implementation (Development)

```
ESP32 → HTTPS (TLS 1.2) → Cloud Run
        └─ wifiClient.setInsecure()
           (No certificate validation)
```

### Recommended Production Layers

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
│  • 5min interval: ~40,000 concurrent devices (current)│
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Optimization Strategies

1. **Batch Reporting:** Send multiple readings in one request
2. **Data Aggregation:** Store 5-minute averages instead of raw readings
3. **Edge Processing:** Only send alerts/anomalies to cloud

---

## Monitoring & Observability

### ESP32 Monitoring

```
Serial Monitor Output:
├─ WiFi connection status
├─ Sensor readings (every 1s)
├─ Blynk send confirmation (every 2s)
├─ Cloud Run response (every 5 minutes)
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

- Over-The-Air (OTA) firmware updates
- Deep sleep power management for battery operation
- Local data buffering (SPIFFS) for offline resilience
- LoRaWAN integration for farms without WiFi coverage
- ML-based anomaly detection for sensor malfunction alerts

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

## Configuration Parameters

**ESP32 Timing:**
- SENSOR_READ_INTERVAL: 1000ms (1 second)
- BLYNK_INTERVAL: 2000ms (2 seconds)
- CLOUD_INTERVAL: 300000ms (5 minutes)

**Blynk Virtual Pins:**
- V0: Moisture (%)
- V1: Temperature (°C)
- V2: pH (0-14)
- V3: EC (µS/cm)
- V4: Nitrogen (mg/kg)
- V5: Phosphorus (mg/kg)
- V6: Potassium (mg/kg)
- V7: Pump Status (boolean)

---

**Last Updated:** 2025-11-26
