# Sensor Management Migration Notes

## Changes Made

### ✅ Updated Files

1. **`frontend/src/App.tsx`**
   - Removed import: `import SensorDevices from './components/devices/sensor/SensorDevices'`
   - Added import: `import SensorDashboard from './components/sensor-management/SensorDashboard'`
   - Removed route: `/device-settings/sensors` → `SensorDevices`
   - Added route: `/farm/:farmId/sensors` → `SensorDashboard`
   - Sensors now accessed per-farm instead of globally

2. **`frontend/src/components/layout/Sidebar.tsx`**
   - Removed icon import: `Cpu` (replaced with `Activity`)
   - Removed navigation item: "Sensor Management" under "Device Management"
   - Sensors are now accessed through Farm Overview, not sidebar

3. **`frontend/src/components/farm-management/components/farm-overview/FarmOverview.tsx`**
   - Added import: `Activity` icon from lucide-react
   - Added handler: `handleManageSensors()` - navigates to `/farm/${farmId}/sensors`
   - Added button: "Manage Sensors" button in farm overview card
   - Button appears next to farm details for quick access

### ✅ Removed Files

Deleted entire old sensor module:
```
frontend/src/components/devices/sensor/
├── components/
│   ├── AddSensorModal.tsx
│   ├── BatteryIndicator.tsx
│   ├── SensorHeader.tsx
│   ├── SensorStats.tsx
│   └── SensorTable.tsx
├── data/
│   └── sensorData.ts
└── SensorDevices.tsx
```

### ✅ New Architecture

**Old Structure (Device-Centric):**
```
/device-settings/sensors → Generic sensor list (not farm-specific)
```

**New Structure (Farm-Centric):**
```
/farm/overview → Click "Manage Sensors" → /farm/{farmId}/sensors
```

**Benefits:**
- Sensors are farm-specific (better data organization)
- Integration with real IoT devices (ESP32)
- Backend API with MongoDB storage
- Real-time data recording capability
- Historical data and analytics
- NPK nutrient analysis
- Automated pump control

## User Flow

### Old Flow
1. Sidebar → "Sensor Management"
2. Global sensor list (all sensors mixed together)
3. Limited functionality (mostly UI mockup)

### New Flow
1. Sidebar → "Farm Overview"
2. View specific farm details
3. Click "Manage Sensors" button
4. See sensors for THAT specific farm
5. Add/configure sensors for that farm
6. View real-time data from ESP32 devices
7. Analyze historical data and NPK levels
8. Monitor pump automation

## API Integration

### Endpoints Available
```
GET    /api/farms/:farmId/sensors          - List farm sensors
POST   /api/farms/:farmId/sensors          - Add sensor to farm
GET    /api/sensors/:sensorId              - Get sensor details
PUT    /api/sensors/:sensorId              - Update sensor
DELETE /api/sensors/:sensorId              - Delete sensor
POST   /api/sensors/:sensorId/readings     - Record data (from ESP32)
GET    /api/sensors/:sensorId/readings     - Get history
GET    /api/sensors/:sensorId/stats        - Get statistics
```

## ESP32 Integration

The new system is designed to work with your Arduino code:

### Data Mapping
```
ESP32 Blynk Pins → Database Fields
─────────────────────────────────────
V0 (Moisture)    → readings.moisture
V1 (Temperature) → readings.temperature
V2 (EC)          → readings.ec
V3 (pH)          → readings.ph
V4 (Nitrogen)    → readings.nitrogen
V5 (Phosphorus)  → readings.phosphorus
V6 (Potassium)   → readings.potassium
V7 (Pump Status) → readings.pumpStatus
```

### Sending Data to API

Add to your ESP32 code (in the `loop()` function after `lastMillis = millis();`):

```cpp
// Optional: Send data directly to your API
if (WiFi.status() == WL_CONNECTED) {
  HTTPClient http;

  // Replace with your sensor ID after registering in UI
  String sensorId = "YOUR_SENSOR_ID_HERE";
  String url = "https://your-api-url.com/api/sensors/" + sensorId + "/readings";

  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  String jsonData = "{";
  jsonData += "\"moisture\":" + String(moisture) + ",";
  jsonData += "\"temperature\":" + String(temperature) + ",";
  jsonData += "\"ph\":" + String(ph) + ",";
  jsonData += "\"ec\":" + String(ec) + ",";
  jsonData += "\"nitrogen\":" + String(nitrogen) + ",";
  jsonData += "\"phosphorus\":" + String(phosphorus) + ",";
  jsonData += "\"potassium\":" + String(potassium) + ",";
  jsonData += "\"pumpStatus\":" + String(digitalRead(PUMP_PIN) == HIGH ? "true" : "false");
  jsonData += "}";

  int httpCode = http.POST(jsonData);

  if (httpCode > 0) {
    Serial.printf("HTTP Response: %d\n", httpCode);
  } else {
    Serial.printf("HTTP Error: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
}
```

## Testing Checklist

### Backend Testing
- [ ] Start backend server: `cd backend && npm run dev`
- [ ] Verify sensor routes loaded in console
- [ ] Test API with Postman/curl (see SENSOR_MANAGEMENT_README.md)

### Frontend Testing
- [ ] Start frontend: `cd frontend && npm start`
- [ ] Navigate to Farm Overview
- [ ] Click "Manage Sensors" button
- [ ] Verify sensor dashboard loads
- [ ] Test "Add Sensor" button
- [ ] Fill form with ESP32 details
- [ ] Submit and verify sensor created

### ESP32 Testing
- [ ] Upload Arduino code to ESP32
- [ ] Verify WiFi connection (check serial monitor)
- [ ] Verify Blynk connection (LED should be green)
- [ ] Verify OLED shows sensor data
- [ ] Check if pump activates when moisture < threshold
- [ ] Register sensor in UI using device ID
- [ ] Send test data to API
- [ ] Verify data appears in dashboard

## Rollback Plan

If you need to rollback to the old sensor system:

1. Restore old files from git:
   ```bash
   git checkout HEAD -- frontend/src/components/devices/sensor
   ```

2. Revert App.tsx changes:
   ```bash
   git checkout HEAD -- frontend/src/App.tsx
   ```

3. Revert Sidebar.tsx changes:
   ```bash
   git checkout HEAD -- frontend/src/components/layout/Sidebar.tsx
   ```

4. Remove new sensor management:
   ```bash
   rm -rf frontend/src/components/sensor-management
   ```

## Future Enhancements

Priority features to add:

1. **Real-time WebSocket Updates**
   - Push updates from backend when ESP32 sends data
   - No need to refresh page for new readings

2. **Sensor Location on Map**
   - Place sensor markers on farm map
   - Show status color on map pins
   - Click pin to see sensor details

3. **Advanced Alerts**
   - SMS/Email notifications for critical conditions
   - Custom alert rules per sensor
   - Alert history and acknowledgment

4. **Mobile App Integration**
   - Native iOS/Android apps
   - Push notifications
   - Quick sensor status view

5. **Data Export**
   - Export readings to CSV/Excel
   - Generate PDF reports
   - Automated weekly/monthly reports

6. **Weather Integration**
   - Correlate weather data with sensor readings
   - Predictive irrigation recommendations
   - Frost/heat wave warnings

7. **Multi-Farm Dashboard**
   - View all farms' sensors at once
   - Compare sensor data across farms
   - Fleet management view

## Support

For issues:

1. Check browser console for errors (F12)
2. Check backend logs for API errors
3. Verify MongoDB connection
4. Check ESP32 serial monitor
5. Verify Blynk dashboard shows correct values

Common Issues:

- **"No sensors found"**: Make sure you added a sensor through the UI first
- **"Failed to load sensors"**: Check backend is running and farmId is valid
- **No data showing**: ESP32 needs to send data to API endpoint
- **Pump not working**: Check relay wiring and PUMP_PIN definition

---

**Migration Date**: 2025-01-26
**Version**: 2.0.0
**Compatibility**: Requires backend API v2.0+, ESP32 with WiFi
