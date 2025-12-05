# Soil Sensor Management System

## Overview

The Soil Sensor Management System integrates with ESP32-based IoT devices to provide real-time monitoring of soil conditions including moisture, temperature, pH levels, electrical conductivity (EC), and NPK (Nitrogen-Phosphorus-Potassium) nutrient levels. The system includes automated irrigation pump control based on moisture thresholds.

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

## Architecture

### Backend Components

#### Models (`backend/src/models/Sensor.ts`)
```typescript
interface ISensor {
  deviceId: string;              // Unique device identifier (e.g., ESP32-SM01)
  deviceName: string;            // Friendly name
  farmId: ObjectId;              // Associated farm
  blynkTemplateId: string;       // Blynk IoT template ID
  blynkAuthToken: string;        // Blynk authentication token
  isActive: boolean;             // Sensor active status
  lastReading: ISensorReading;   // Most recent sensor data
  settings: {
    moistureThreshold: number;   // Pump activation threshold (%)
    optimalPh: { min, max };     // Optimal pH range
    optimalTemperature: { min, max }; // Optimal temperature range (°C)
  };
}

interface ISensorReading {
  moisture: number;              // Soil moisture (%)
  temperature: number;           // Soil temperature (°C)
  ph: number;                    // pH level (0-14)
  ec: number;                    // Electrical conductivity (µS/cm)
  nitrogen: number;              // Nitrogen content (mg/kg)
  phosphorus: number;            // Phosphorus content (mg/kg)
  potassium: number;             // Potassium content (mg/kg)
  pumpStatus: boolean;           // Pump on/off status
  timestamp: Date;               // Reading timestamp
}
```

#### API Endpoints

**Sensor Management**
- `GET /api/farms/:farmId/sensors` - Get all sensors for a farm
- `POST /api/farms/:farmId/sensors` - Create new sensor
- `GET /api/sensors/:sensorId` - Get sensor details
- `PUT /api/sensors/:sensorId` - Update sensor settings
- `DELETE /api/sensors/:sensorId` - Delete sensor

**Sensor Data**
- `POST /api/sensors/:sensorId/readings` - Record new reading (from IoT device)
- `GET /api/sensors/:sensorId/readings` - Get reading history (with pagination)
- `GET /api/sensors/:sensorId/readings/latest` - Get latest reading
- `GET /api/sensors/:sensorId/stats` - Get statistical summary

### Frontend Components

#### Main Dashboard (`SensorDashboard.tsx`)
- Grid view of all sensors with status indicators
- Summary cards showing active sensors, warnings, and alerts
- Quick access to add new sensors
- Farm-specific sensor filtering

#### Sensor Card (`SensorCard.tsx`)
- Compact view of current sensor readings
- Color-coded status badges
- Last update timestamp
- Click to open detailed modal

#### Detailed Modal (`SensorDetailModal.tsx`)
Four tabbed sections:
1. **Current Data**: Real-time readings with pump control
2. **History**: Time-series data with statistical analysis
3. **NPK Levels**: Nutrient analysis with recommendations
4. **Settings**: Configure thresholds and optimal ranges

#### NPK Visualization (`NPKChart.tsx`)
- Visual progress bars for each nutrient
- Color-coded status (low/optimal/high)
- Range markers showing optimal levels
- Actionable recommendations

#### History Chart (`SensorHistoryChart.tsx`)
- Tabular view of historical readings
- Time range selection (24h, 7d, 30d)
- Statistical summaries
- Export-ready data format

#### Pump Control (`PumpControl.tsx`)
- Real-time pump status indicator
- Moisture level visualization
- Automation status explanation
- Blynk integration notes

## ESP32 Integration

### Hardware Setup
Based on your Arduino code:
- **Board**: ESP32 DevKit
- **Sensor**: 7-in-1 NPK Soil Sensor (RS485)
- **Display**: OLED SSD1306 (128x64)
- **LED**: WS2812 RGB LED
- **Pump**: Relay-controlled irrigation pump

### Pin Configuration
```cpp
#define RS485RXD1 17        // RS485 Receive
#define RS485TXD1 18        // RS485 Transmit
#define PUMP_PIN 47         // Pump relay control
#define ESP32SDA 8          // OLED SDA
#define ESP32SCL 9          // OLED SCL
#define LED_PIN 38          // WS2812 LED
```

### Data Flow
1. **ESP32 → RS485 Sensor**: Request soil data every second
2. **Sensor → ESP32**: Return 19-byte response with all readings
3. **ESP32 → Blynk**: Push data to virtual pins (V0-V7)
4. **ESP32 → Pump**: Activate when moisture < threshold
5. **Blynk → Backend**: Webhook integration (optional)
6. **Backend → Frontend**: Real-time updates via API polling

### Blynk Virtual Pins
```cpp
V0: Moisture (%)
V1: Temperature (°C)
V2: EC (µS/cm)
V3: pH
V4: Nitrogen (mg/kg)
V5: Phosphorus (mg/kg)
V6: Potassium (mg/kg)
V7: Pump Status (0/1)
```

## Setup Instructions

### 1. Backend Setup

Add sensor routes to `backend/src/index.ts`:
```typescript
import sensorRoutes from './routes/sensorRoutes';
app.use('/api', sensorRoutes);
```

### 2. Frontend Integration

Add route to your router (in `App.tsx` or routing config):
```typescript
<Route path="/farm/:farmId/sensors" element={<SensorDashboard />} />
```

### 3. ESP32 Configuration

Update your Arduino code with:
1. WiFi credentials (`ssid` and `pass`)
2. Blynk template ID and auth token
3. Moisture threshold (`MOISTURE_THRESHOLD`)

### 4. Register New Sensor

Through the UI:
1. Navigate to Farm Management
2. Click "Add Sensor"
3. Enter device details:
   - **Device ID**: Unique identifier (e.g., ESP32-SM01)
   - **Device Name**: Friendly name (e.g., "Field A Sensor")
   - **Blynk Template ID**: From your Arduino code
   - **Auth Token**: From Blynk device settings
4. Configure thresholds and optimal ranges
5. Click "Add Sensor"

### 5. Send Data from ESP32

Option A: **Direct API Integration** (recommended for production)
```cpp
// Add to your ESP32 code
HTTPClient http;
http.begin("https://your-api-url.com/api/sensors/SENSOR_ID/readings");
http.addHeader("Content-Type", "application/json");

String jsonData = "{\"moisture\":" + String(moisture) +
                  ",\"temperature\":" + String(temperature) +
                  ",\"ph\":" + String(ph) +
                  ",\"ec\":" + String(ec) +
                  ",\"nitrogen\":" + String(nitrogen) +
                  ",\"phosphorus\":" + String(phosphorus) +
                  ",\"potassium\":" + String(potassium) +
                  ",\"pumpStatus\":" + String(digitalRead(PUMP_PIN)) + "}";

int httpCode = http.POST(jsonData);
http.end();
```

Option B: **Blynk Webhook** (current setup)
- Configure Blynk webhook to forward data to your API
- Use Blynk's built-in webhook feature in device settings

## Usage Guide

### Viewing Sensor Data

1. **Dashboard View**: See all sensors at a glance with status colors
2. **Click Sensor Card**: Open detailed modal for in-depth analysis
3. **Switch Tabs**: Navigate between Current, History, NPK, and Settings
4. **Select Time Range**: Choose 24h, 7d, or 30d for historical view

### Interpreting Status Colors

- **Green Border**: All parameters normal
- **Yellow Border**: One or more parameters in warning range
- **Red Border**: Critical condition - immediate attention needed
- **Gray Border**: Sensor offline or no recent data

### Managing Thresholds

1. Click sensor card to open modal
2. Navigate to "Settings" tab
3. Click "Edit Settings"
4. Adjust:
   - Moisture threshold for pump activation
   - Optimal pH range for your crops
   - Optimal temperature range
5. Click "Save"

### Understanding NPK Levels

**Nitrogen (N)**: Promotes leafy growth
- Low: < 20 mg/kg → Add nitrogen fertilizer
- Optimal: 50 mg/kg
- High: > 100 mg/kg → May cause excessive growth

**Phosphorus (P)**: Root development and flowering
- Low: < 10 mg/kg → Add phosphorus
- Optimal: 30 mg/kg
- High: > 60 mg/kg → May interfere with other nutrients

**Potassium (K)**: Plant strength and disease resistance
- Low: < 50 mg/kg → Add potassium
- Optimal: 150 mg/kg
- High: > 300 mg/kg → May affect magnesium/calcium uptake

## Troubleshooting

### Sensor Shows "Offline"
- Check ESP32 power and WiFi connection
- Verify Blynk auth token is correct
- Check if sensor has sent data in last 15 minutes
- Look at OLED display for error messages

### No Pump Activation
- Verify moisture is below threshold
- Check pump relay wiring to pin 47
- Test pump manually via Blynk app
- Ensure `PUMP_PIN` is correctly defined

### Inaccurate Readings
- Calibrate RS485 sensor per manufacturer instructions
- Check sensor probe is properly inserted in soil
- Verify RS485 wiring (TX→RX, RX→TX, GND, VCC)
- Check sensor address (default 0x01)

### Data Not Appearing in Dashboard
- Verify sensor is registered with correct ID
- Check API endpoint is accessible
- Ensure reading format matches expected structure
- Check browser console for errors

## API Testing

### Test Sensor Registration
```bash
curl -X POST https://your-api.com/api/farms/FARM_ID/sensors \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "ESP32-TEST01",
    "deviceName": "Test Sensor",
    "blynkTemplateId": "TMPL6cNqtLZQP",
    "blynkAuthToken": "your_token_here"
  }'
```

### Test Data Recording
```bash
curl -X POST https://your-api.com/api/sensors/SENSOR_ID/readings \
  -H "Content-Type: application/json" \
  -d '{
    "moisture": 45.5,
    "temperature": 25.3,
    "ph": 6.8,
    "ec": 450,
    "nitrogen": 55,
    "phosphorus": 28,
    "potassium": 165,
    "pumpStatus": false
  }'
```

### Get Latest Reading
```bash
curl -X GET https://your-api.com/api/sensors/SENSOR_ID/readings/latest \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Future Enhancements

- [ ] Real-time WebSocket updates for live data streaming
- [ ] Mobile app notifications for critical alerts
- [ ] Advanced analytics with ML predictions
- [ ] Multi-sensor correlation analysis
- [ ] Automated fertilizer recommendations
- [ ] Weather data integration
- [ ] Irrigation schedule optimization
- [ ] Export data to CSV/Excel
- [ ] SMS/Email alerts for critical conditions
- [ ] Integration with weather APIs for smart irrigation

## References

- **ESP32 Documentation**: https://docs.espressif.com/
- **Blynk IoT Platform**: https://blynk.io/
- **RS485 Sensor Protocol**: Check manufacturer datasheet
- **NPK Optimal Ranges**: Based on agricultural research standards

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review ESP32 serial monitor output
3. Check OLED display for error messages
4. Verify Blynk dashboard shows correct values
5. Contact support with sensor ID and error logs

---

**Version**: 1.0.0
**Last Updated**: 2025-01-26
**Compatible With**: ESP32, Arduino Framework, Blynk IoT v2
