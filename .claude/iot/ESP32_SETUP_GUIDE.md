# ESP32 Setup Guide - Cultivo Dual Reporting System

This guide walks you through setting up your ESP32 device to send soil sensor data to both **Blynk Cloud** (for mobile app) and **Cultivo Cloud Run Backend** (for web dashboard and MongoDB storage).

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Hardware Setup](#hardware-setup)
3. [Arduino IDE Configuration](#arduino-ide-configuration)
4. [Backend Configuration](#backend-configuration)
5. [Device Registration](#device-registration)
6. [Upload and Testing](#upload-and-testing)
7. [Troubleshooting](#troubleshooting)
8. [API Reference](#api-reference)

---

## Prerequisites

### Hardware Requirements
- **ESP32 Development Board** (ESP32-WROOM-32 or similar)
- **Soil Sensors:**
  - Capacitive Soil Moisture Sensor
  - Temperature Sensor (LM35 or DHT22)
  - pH Sensor Module
  - EC (Electrical Conductivity) Sensor
  - NPK Sensor (optional)
- **5V Relay Module** (for pump control)
- **Water Pump** (12V DC recommended)
- **Power Supply** (5V for ESP32, 12V for pump)
- **Jumper Wires** and **Breadboard**
- **Micro-USB Cable** (for programming)

### Software Requirements
- **Arduino IDE** (1.8.19 or later) or **PlatformIO**
- **ESP32 Board Support** (via Arduino Board Manager)
- **Required Libraries:**
  - `WiFi.h` (built-in)
  - `WiFiClientSecure.h` (built-in)
  - `HTTPClient.h` (built-in)
  - `ArduinoJson` (by Benoit Blanchon)
  - `Blynk` (by Volodymyr Shymanskyy)

### Cloud Services
- **Blynk Account** ([blynk.cloud](https://blynk.cloud))
- **Cultivo Backend Access** (Google Cloud Run URL)
- **WiFi Network** with internet access

---

## Hardware Setup

### Wiring Diagram

```
ESP32 Pin          →  Component
============================================
GPIO 34 (ADC1_6)   →  Moisture Sensor (Analog Out)
GPIO 35 (ADC1_7)   →  Temperature Sensor (Analog Out)
GPIO 32 (ADC1_4)   →  pH Sensor (Analog Out)
GPIO 33 (ADC1_5)   →  EC Sensor (Analog Out)
GPIO 25 (ADC2_8)   →  Nitrogen Sensor (Analog Out)
GPIO 26 (ADC2_9)   →  Phosphorus Sensor (Analog Out)
GPIO 27 (ADC2_7)   →  Potassium Sensor (Analog Out)
GPIO 14            →  Relay Module (IN)
GPIO 2             →  Built-in LED
3.3V               →  Sensor VCC (if 3.3V sensors)
5V                 →  Relay VCC / 5V Sensors
GND                →  Common Ground
```

### Important Notes:
- **Use ADC1 pins** (GPIO 32-39) for analog readings when WiFi is active
- **ADC2 pins** (GPIO 0, 2, 4, 12-15, 25-27) may not work reliably with WiFi
- **Never exceed 3.3V** on ESP32 analog input pins
- Use **voltage dividers** if your sensors output 5V

---

## Arduino IDE Configuration

### 1. Install ESP32 Board Support

1. Open Arduino IDE
2. Go to **File → Preferences**
3. Add this URL to **Additional Board Manager URLs:**
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
4. Go to **Tools → Board → Boards Manager**
5. Search for "ESP32" and install **esp32 by Espressif Systems**

### 2. Install Required Libraries

Go to **Sketch → Include Library → Manage Libraries** and install:

1. **ArduinoJson** (by Benoit Blanchon) - Latest version
2. **Blynk** (by Volodymyr Shymanskyy) - Latest version

### 3. Select Board and Port

1. Connect ESP32 via USB
2. **Tools → Board** → Select **ESP32 Dev Module**
3. **Tools → Port** → Select the COM port (Windows) or /dev/ttyUSB0 (Linux/Mac)
4. **Tools → Upload Speed** → 115200

---

## Backend Configuration

### Step 1: Register Your Device in Cultivo

Before your ESP32 can send data, you must register it in the Cultivo system.

#### Using the Web Dashboard:

1. Log in to your Cultivo dashboard
2. Navigate to **Sensor Management**
3. Click **Add New Sensor**
4. Fill in the form:
   - **Device ID:** `ESP32_001` (must match your Arduino code)
   - **Device Name:** "Farm A - Soil Monitor"
   - **Farm:** Select your farm
   - **Blynk Template ID:** Your Blynk template ID
   - **Blynk Auth Token:** Your Blynk auth token

#### Using the API (Alternative):

```bash
curl -X POST https://cultivo-capstone-960317214611.asia-southeast1.run.app/api/farms/{farmId}/sensors \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "ESP32_001",
    "deviceName": "Farm A - Soil Monitor",
    "farmId": "YOUR_FARM_ID",
    "blynkTemplateId": "TMPL1234567890",
    "blynkAuthToken": "YOUR_BLYNK_AUTH_TOKEN",
    "settings": {
      "moistureThreshold": 30,
      "optimalPh": { "min": 6.0, "max": 7.5 },
      "optimalTemperature": { "min": 20, "max": 30 }
    }
  }'
```

### Step 2: Configure Blynk

1. Log in to [Blynk Console](https://blynk.cloud)
2. Create a **New Template** or use an existing one
3. Add **Datastreams:**
   - V0: Moisture (%, 0-100)
   - V1: Temperature (°C, 0-50)
   - V2: pH (0-14)
   - V3: EC (µS/cm, 0-5000)
   - V4: Nitrogen (%, 0-100)
   - V5: Phosphorus (%, 0-100)
   - V6: Potassium (%, 0-100)
   - V7: Pump Status (0-1, switch)
   - V8: Terminal (string)
4. Create a **Mobile Dashboard** with widgets for each datastream
5. Get your **Auth Token** from the device settings

---

## Device Registration

### Step 1: Configure Arduino Sketch

1. Open `.arduino/ESP32_Dual_Reporting.ino`
2. Update the configuration section:

```cpp
// WiFi Credentials
const char* WIFI_SSID = "YourWiFiName";
const char* WIFI_PASSWORD = "YourWiFiPassword";

// Blynk Configuration
#define BLYNK_TEMPLATE_ID "TMPL1234567890"
#define BLYNK_TEMPLATE_NAME "Cultivo Soil Monitor"
#define BLYNK_AUTH_TOKEN "Your_Blynk_Auth_Token"

// Cultivo Configuration
const char* CULTIVO_API_URL = "https://cultivo-capstone-960317214611.asia-southeast1.run.app/api/sensors/data";
const char* DEVICE_ID = "ESP32_001"; // MUST match your registered device
```

### Step 2: Verify Device ID Match

**CRITICAL:** The `DEVICE_ID` in your Arduino sketch **MUST** match the `deviceId` you registered in MongoDB/Cultivo dashboard. If they don't match, you'll get a 404 error.

---

## Upload and Testing

### Step 1: Upload the Sketch

1. Connect ESP32 to your computer via USB
2. Open Serial Monitor (**Tools → Serial Monitor**, 115200 baud)
3. Click **Upload** button (→)
4. Wait for compilation and upload to complete
5. Press **RST button** on ESP32 to restart

### Step 2: Monitor Serial Output

You should see output similar to this:

```
=================================
Cultivo ESP32 Dual Reporting System
=================================

Connecting to WiFi: YourWiFiName
................
✓ WiFi Connected!
IP Address: 192.168.1.100

Setup complete! Starting dual reporting...

✓ Blynk: Data sent
✓ Blynk: Data sent

--- Sending to Cultivo Cloud ---
Device ID: ESP32_001
Payload: {"deviceId":"ESP32_001","moisture":45.2,"temperature":25.3,"ph":6.8,"ec":1250,"nitrogen":78,"phosphorus":65,"potassium":82,"pumpStatus":false}
✓ Cloud Response [201]: {"success":true,"message":"Data recorded successfully","data":{"readingId":"...","sensorId":"...","deviceName":"Farm A - Soil Monitor","timestamp":"2025-11-26T..."}}
--------------------------------
```

### Step 3: Verify Data Reception

#### Blynk App:
1. Open the Blynk app on your phone
2. Check that sensor values are updating every 2 seconds
3. Test pump control by toggling V7 switch

#### Cultivo Web Dashboard:
1. Log in to your Cultivo dashboard
2. Navigate to **Sensor Management**
3. Select your sensor device
4. Verify that **Last Reading** shows recent data
5. Check **Historical Data** for time-series charts

#### MongoDB (Optional):
```javascript
// Connect to MongoDB Atlas
use cultivo;

// Check sensor document
db.sensors.findOne({ deviceId: "ESP32_001" });

// Check recent readings
db.sensorreadings.find({ sensorId: ObjectId("...") })
  .sort({ timestamp: -1 })
  .limit(10);
```

---

## Troubleshooting

### WiFi Connection Issues

**Problem:** ESP32 can't connect to WiFi

**Solutions:**
- Verify SSID and password are correct
- Ensure WiFi is 2.4GHz (ESP32 doesn't support 5GHz)
- Check WiFi signal strength (move closer to router)
- Disable WiFi MAC address filtering on router

### Blynk Connection Failed

**Problem:** `Blynk not connected`

**Solutions:**
- Verify `BLYNK_AUTH_TOKEN` is correct
- Check Blynk server status: [status.blynk.cc](https://status.blynk.cc)
- Ensure datastreams (V0-V8) are configured in Blynk Console
- Check that device is activated in Blynk

### Cloud Run 404 Error

**Problem:** `Cloud Response [404]: Sensor with deviceId 'XXX' not found`

**Solutions:**
- Device ID in Arduino code doesn't match registered device
- Device hasn't been registered in Cultivo yet
- Check spelling and case sensitivity (e.g., "ESP32_001" vs "esp32_001")

**Fix:**
1. Log in to Cultivo dashboard
2. Go to Sensor Management → Add Sensor
3. Use the exact same deviceId as in your code
4. Reset ESP32 after registration

### Cloud Run 400 Error

**Problem:** `Cloud Response [400]: Missing required sensor data fields`

**Solutions:**
- One or more sensor readings are `undefined` or `null`
- Check sensor wiring and connections
- Verify analog pins are reading correctly
- Add debug prints before sending to cloud

### SSL/HTTPS Errors

**Problem:** `SSL handshake failed` or connection timeout

**Solutions:**
- Ensure stable internet connection
- The code uses `wifiClient.setInsecure()` for testing
- For production, implement proper certificate validation:

```cpp
// Add root CA certificate
const char* root_ca = \
"-----BEGIN CERTIFICATE-----\n" \
"MIIDrzCCApegAwIBAgIQCDvgVpBCRrGhdWrJWZHHSjANBgkqhkiG9w0BAQUFADBh\n" \
// ... rest of certificate ...
"-----END CERTIFICATE-----\n";

wifiClient.setCACert(root_ca);
```

### Sensor Reading Issues

**Problem:** Sensor values are 0 or nonsensical

**Solutions:**
- Check analog pin connections
- Verify sensor power supply (3.3V or 5V)
- Calibrate sensors using known reference values
- Add voltage dividers if sensors output > 3.3V
- Use ADC1 pins (32-39) instead of ADC2 when WiFi is active

### Memory Issues

**Problem:** ESP32 crashes or resets randomly

**Solutions:**
- Reduce `StaticJsonDocument` size in code
- Increase `CLOUD_INTERVAL` to reduce memory pressure
- Check for memory leaks (HTTP connections not closed)
- Monitor free heap: `Serial.println(ESP.getFreeHeap());`

---

## API Reference

### Endpoint: POST /api/sensors/data

**URL:** `https://cultivo-capstone-960317214611.asia-southeast1.run.app/api/sensors/data`

**Authentication:** None (public endpoint for IoT devices)

**Request Body:**
```json
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

**Required Fields:**
- `deviceId` (string): Unique device identifier
- `moisture` (number): Soil moisture percentage (0-100)
- `temperature` (number): Temperature in Celsius
- `ph` (number): pH value (0-14)
- `ec` (number): Electrical conductivity (µS/cm)
- `nitrogen` (number): Nitrogen level (0-100)
- `phosphorus` (number): Phosphorus level (0-100)
- `potassium` (number): Potassium level (0-100)

**Optional Fields:**
- `pumpStatus` (boolean): Pump on/off status (default: false)

**Success Response (201):**
```json
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

**Error Responses:**

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Missing required field: deviceId"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Sensor with deviceId 'ESP32_001' not found. Please register this device first."
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": "Sensor is not active"
}
```

**500 Server Error:**
```json
{
  "success": false,
  "error": "Server Error"
}
```

---

## Advanced Configuration

### Custom Reporting Intervals

Adjust timing in the configuration section:

```cpp
const unsigned long BLYNK_INTERVAL = 2000;      // 2 seconds
const unsigned long CLOUD_INTERVAL = 30000;     // 30 seconds (recommended)
const unsigned long SENSOR_READ_INTERVAL = 1000; // 1 second
```

**Recommendations:**
- **Blynk:** 2-5 seconds (for real-time app updates)
- **Cloud Run:** 30-60 seconds (to reduce API calls and costs)
- **Sensor Read:** 1 second (for responsive pump control)

### Sensor Calibration

For accurate readings, calibrate your sensors:

```cpp
// Moisture sensor calibration
int moistureDry = 4095;  // Reading in air
int moistureWet = 1500;  // Reading in water
moisture = map(moistureRaw, moistureWet, moistureDry, 100, 0);

// pH sensor calibration
// Test with pH 4, 7, and 10 buffer solutions
float ph4Voltage = 2.03;
float ph7Voltage = 2.50;
float ph = 7.0 - ((voltage - ph7Voltage) / (ph7Voltage - ph4Voltage) * 3.0);
```

### Power Management

For battery-powered deployments:

```cpp
#include <esp_sleep.h>

// Deep sleep for 5 minutes
esp_sleep_enable_timer_wakeup(5 * 60 * 1000000); // microseconds
esp_deep_sleep_start();
```

---

## Next Steps

1. ✅ **Complete hardware setup** and verify connections
2. ✅ **Register device** in Cultivo dashboard
3. ✅ **Configure Blynk** template and datastreams
4. ✅ **Upload sketch** and verify serial output
5. ✅ **Test data flow** in both Blynk and Cultivo
6. 🔄 **Calibrate sensors** for accurate readings
7. 🔄 **Deploy to field** and monitor performance
8. 🔄 **Set up alerts** in Cultivo for critical thresholds

---

## Support

- **Documentation:** [.claude/ folder](../.claude/)
- **API Docs:** [05-BACKEND-API.md](./05-BACKEND-API.md)
- **Issues:** Contact your Cultivo admin or developer team

---

**Last Updated:** 2025-11-26
