# Soil Sensor Management System

## Overview

The Soil Sensor Management System integrates with ESP32-based IoT devices to provide real-time monitoring of soil conditions including moisture, temperature, pH levels, electrical conductivity (EC), and NPK (Nitrogen-Phosphorus-Potassium) nutrient levels. The system includes automated irrigation pump control based on moisture thresholds.

---

## Features

### 1. Real-Time Monitoring
- **Soil Moisture**: Track moisture levels with automatic pump activation
- **Temperature**: Monitor soil temperature for optimal growing conditions
- **pH Levels**: Track soil acidity/alkalinity for nutrient availability
- **Electrical Conductivity (EC)**: Measure soil salinity and nutrient concentration
- **NPK Levels**: Monitor essential nutrients (Nitrogen, Phosphorus, Potassium)

### 2. Automated Irrigation Control
- Automatic pump activation when moisture falls below threshold
- Configurable moisture threshold per sensor
- Real-time pump status monitoring
- Integration with ESP32 GPIO control

### 3. Data Visualization
- Live sensor cards with color-coded status indicators
- Historical data charts with 24h, 7d, and 30d views
- NPK nutrient analysis with optimal range indicators
- Statistical summaries (min, max, average values)

### 4. Alert System
- **Normal**: All parameters within optimal ranges (Green)
- **Warning**: Parameters approaching critical thresholds (Yellow)
- **Alert**: Critical conditions requiring immediate attention (Red)
- **Offline**: Sensor not responding or inactive (Gray)

---

## Architecture

### Backend Data Model

**Sensor Document:**
- deviceId: string (unique identifier)
- deviceName: string (friendly name)
- farmId: ObjectId (farm association)
- blynkTemplateId: string
- blynkAuthToken: string
- isActive: boolean
- lastReading: object (most recent sensor data)
- settings: object (thresholds and optimal ranges)
  - moistureThreshold: number (pump activation %)
  - optimalPh: { min, max }
  - optimalTemperature: { min, max }
- createdAt, updatedAt: Date

**SensorReading Document:**
- sensorId: ObjectId (reference to Sensor)
- moisture: number (%)
- temperature: number (°C)
- ph: number (0-14)
- ec: number (µS/cm)
- nitrogen: number (mg/kg)
- phosphorus: number (mg/kg)
- potassium: number (mg/kg)
- pumpStatus: boolean
- timestamp: Date

---

## API Endpoints

### Sensor Management
- `GET /api/farms/:farmId/sensors` - List all sensors for a farm
- `POST /api/farms/:farmId/sensors` - Register new sensor
- `GET /api/sensors/:sensorId` - Get sensor details
- `PUT /api/sensors/:sensorId` - Update sensor settings
- `DELETE /api/sensors/:sensorId` - Delete sensor

### Sensor Data
- `POST /api/sensors/data` - Record reading from IoT device (no auth)
- `GET /api/sensors/:sensorId/readings` - Get reading history
- `GET /api/sensors/:sensorId/readings/latest` - Get latest reading
- `GET /api/sensors/:sensorId/stats` - Get statistical summary

**Note:** IoT data ingestion endpoint (`POST /api/sensors/data`) does not require authentication. All other endpoints require JWT authentication.

---

## Frontend Components

### SensorDashboard
- Grid view of all sensors with status indicators
- Summary cards showing active sensors, warnings, and alerts
- Farm-specific sensor filtering
- Add new sensor button

### SensorCard
- Compact view of current readings
- Color-coded status badge (Normal/Warning/Alert/Offline)
- Last update timestamp
- Click to open detailed modal

### SensorDetailModal
Four tabbed sections:
1. **Current Data**: Real-time readings with pump status
2. **History**: Time-series data with time range selection
3. **NPK Levels**: Nutrient analysis with recommendations
4. **Settings**: Configure thresholds and optimal ranges

### NPKChart
- Visual progress bars for each nutrient (N, P, K)
- Color-coded status: low (red), optimal (green), high (yellow)
- Range markers showing optimal levels
- Actionable recommendations based on levels

### SensorHistoryChart
- Tabular view of historical readings
- Time range selection (24h, 7d, 30d)
- Statistical summaries (min, max, average)
- Pagination support

### PumpControl
- Real-time pump status indicator
- Moisture level visualization
- Automation status explanation
- Threshold display

---

## Data Flow

### ESP32 to Cloud
1. ESP32 reads sensors every 1 second
2. Sends to Blynk Cloud every 2 seconds (real-time mobile monitoring)
3. Sends to Cultivo Cloud Run every 5 minutes (historical storage)
4. HTTPS POST to `/api/sensors/data` with JSON payload

### Backend Processing
1. Validate device ID and sensor active status
2. Create new SensorReading document
3. Update Sensor.lastReading field
4. Return success response (201) or error (400/403/404)

### Frontend Display
1. Dashboard polls API every 30-60 seconds
2. Displays current readings from Sensor.lastReading
3. Fetches historical data on demand
4. Updates status indicators based on thresholds

---

## Status Indicators

### Status Colors
- **Green Border**: All parameters within optimal ranges
- **Yellow Border**: One or more parameters in warning range
- **Red Border**: Critical condition requiring immediate attention
- **Gray Border**: Sensor offline (no data in last 15 minutes)

### Status Logic
- **Normal**: moisture >= threshold, pH in range, temp in range
- **Warning**: moisture 5-10% above threshold, pH/temp approaching limits
- **Alert**: moisture < threshold, pH outside range, temp outside range
- **Offline**: timestamp > 15 minutes old, isActive = false

---

## NPK Interpretation

### Nitrogen (N)
- **Optimal**: 50 mg/kg
- **Low**: < 20 mg/kg (add nitrogen fertilizer)
- **High**: > 100 mg/kg (may cause excessive growth)
- **Function**: Promotes leafy green growth

### Phosphorus (P)
- **Optimal**: 30 mg/kg
- **Low**: < 10 mg/kg (add phosphorus)
- **High**: > 60 mg/kg (may interfere with other nutrients)
- **Function**: Root development and flowering

### Potassium (K)
- **Optimal**: 150 mg/kg
- **Low**: < 50 mg/kg (add potassium)
- **High**: > 300 mg/kg (may affect magnesium/calcium uptake)
- **Function**: Plant strength and disease resistance

---

## Hardware Integration

### ESP32 Configuration
- WiFi connection to internet
- RS485 interface for 7-in-1 NPK sensor
- GPIO control for pump relay
- OLED display for local status
- WS2812 LED for visual feedback

### Sensor Communication
- RS485 protocol for NPK sensor (19-byte response)
- 1-second polling interval
- Automatic error detection and retry

### Pump Control
- GPIO pin toggles relay module
- Activates when moisture < threshold
- Deactivates when moisture >= threshold + 5% (hysteresis)
- Manual override via Blynk app

---

## Troubleshooting

### Sensor Shows "Offline"
- Check ESP32 power and WiFi connection
- Verify device is registered with correct ID
- Check if data received in last 15 minutes
- View serial monitor output for errors

### No Pump Activation
- Verify moisture is below threshold
- Check pump relay wiring
- Ensure pump GPIO pin is correctly configured
- Test manual control via Blynk

### Inaccurate Readings
- Calibrate sensors per manufacturer instructions
- Check sensor probe insertion depth
- Verify RS485 wiring (TX→RX, RX→TX)
- Check power supply voltage stability

### Data Not Appearing in Dashboard
- Verify sensor registered with correct device ID
- Check API endpoint accessibility
- Ensure reading format matches expected structure
- Check browser console for errors

---

## Related Documentation
- IOT_ARCHITECTURE.md - Complete system architecture
- ESP32_SETUP_GUIDE.md - Hardware setup and configuration

---

**Version**: 1.0.0
**Last Updated**: 2025-01-26
**Compatible With**: ESP32, Arduino Framework, Blynk IoT v2
