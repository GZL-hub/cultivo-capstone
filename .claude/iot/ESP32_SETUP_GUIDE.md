# ESP32 Setup Guide - Hardware Configuration

This guide covers the hardware setup and configuration requirements for ESP32-based soil sensors.

---

## Hardware Requirements

### Core Components
- **ESP32 Development Board** (ESP32-WROOM-32 or similar)
- **Soil Sensors:**
  - Capacitive Soil Moisture Sensor
  - Temperature Sensor (LM35 or DHT22)
  - pH Sensor Module
  - EC (Electrical Conductivity) Sensor
  - NPK Sensor (7-in-1 RS485 recommended)
- **5V Relay Module** (for pump control)
- **Water Pump** (12V DC recommended)
- **Power Supply** (5V for ESP32, 12V for pump)
- **Jumper Wires** and **Breadboard**
- **Micro-USB Cable** (for programming)

### Optional Components
- OLED Display (SSD1306 128x64)
- WS2812 RGB LED for status indication
- External antenna for improved WiFi range

---

## Pin Configuration

### Standard 7-Pin Analog Setup

| ESP32 Pin | Pin Type | Sensor Connection |
|-----------|----------|-------------------|
| GPIO 34 (ADC1_6) | Analog Input | Moisture Sensor |
| GPIO 35 (ADC1_7) | Analog Input | Temperature Sensor |
| GPIO 32 (ADC1_4) | Analog Input | pH Sensor |
| GPIO 33 (ADC1_5) | Analog Input | EC Sensor |
| GPIO 25 (ADC2_8) | Analog Input | Nitrogen Sensor |
| GPIO 26 (ADC2_9) | Analog Input | Phosphorus Sensor |
| GPIO 27 (ADC2_7) | Analog Input | Potassium Sensor |
| GPIO 14 | Digital Output | Relay Module (IN) |
| GPIO 2 | Digital Output | Built-in LED |
| 3.3V | Power | Sensor VCC (if 3.3V sensors) |
| 5V | Power | Relay VCC / 5V Sensors |
| GND | Ground | Common Ground |

### RS485 NPK Sensor Setup

| ESP32 Pin | Pin Type | Connection |
|-----------|----------|------------|
| GPIO 17 | UART RX | RS485 Module RXD |
| GPIO 18 | UART TX | RS485 Module TXD |
| GPIO 47 | Digital Output | Pump Relay |
| GPIO 8 | I2C SDA | OLED Display |
| GPIO 9 | I2C SCL | OLED Display |
| GPIO 38 | Digital Output | WS2812 LED |
| 5V | Power | RS485 Module VCC |
| GND | Ground | RS485 Module GND |

---

## Hardware Notes

### ADC Pins
- **Use ADC1 pins (GPIO 32-39)** for analog readings when WiFi is active
- **ADC2 pins (GPIO 0, 2, 4, 12-15, 25-27)** may not work reliably with WiFi enabled
- **Never exceed 3.3V** on ESP32 analog input pins
- Use voltage dividers if sensors output 5V

### Power Requirements
- ESP32 draws 80-160mA during WiFi transmission
- Ensure stable 5V power supply with at least 500mA capacity
- For battery operation, consider LiPo battery with voltage regulator

### Relay Module
- Use optocoupler-isolated relay for noise reduction
- Connect relay VCC to 5V (not 3.3V)
- Relay signal pin can be driven from 3.3V GPIO

---

## Software Requirements

### Arduino IDE
- Arduino IDE 1.8.19 or later (or PlatformIO)
- ESP32 Board Support Package
- Board Manager URL: `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`

### Required Libraries
- WiFi.h (built-in)
- WiFiClientSecure.h (built-in)
- HTTPClient.h (built-in)
- ArduinoJson (by Benoit Blanchon)
- Blynk (by Volodymyr Shymanskyy)

### Optional Libraries
- Adafruit_SSD1306 (for OLED display)
- Adafruit_NeoPixel (for WS2812 LED)
- SoftwareSerial (for RS485 communication)

---

## Configuration Parameters

### WiFi Settings
- WIFI_SSID: Network name
- WIFI_PASSWORD: Network password
- **Note:** ESP32 only supports 2.4GHz WiFi networks

### Blynk Configuration
- BLYNK_TEMPLATE_ID: From Blynk Console
- BLYNK_TEMPLATE_NAME: Device template name
- BLYNK_AUTH_TOKEN: Device authentication token

### Cultivo Backend
- CULTIVO_API_URL: Cloud Run endpoint URL
- DEVICE_ID: Must match registered device in MongoDB

### Timing Parameters
- SENSOR_READ_INTERVAL: 1000ms (sensor polling rate)
- BLYNK_INTERVAL: 2000ms (real-time app updates)
- CLOUD_INTERVAL: 300000ms (5 minutes for historical data)

### Sensor Thresholds
- MOISTURE_THRESHOLD: 30% (pump activation trigger)
- pH range: 6.0-7.5 (optimal)
- Temperature range: 20-30°C (optimal)

---

## Device Registration

### Prerequisites
1. Cultivo account with farm access
2. Blynk account with configured template
3. Unique device ID (e.g., ESP32_001)

### Registration Steps
1. Log in to Cultivo dashboard
2. Navigate to Sensor Management
3. Click "Add New Sensor"
4. Enter device details:
   - Device ID (must match ESP32 code)
   - Device Name (friendly identifier)
   - Farm association
   - Blynk Template ID
   - Blynk Auth Token
5. Configure thresholds and optimal ranges
6. Save registration

### Critical Requirement
**Device ID in ESP32 code MUST exactly match the registered device ID in MongoDB**
- Case-sensitive
- Mismatch results in 404 errors
- Verify match before deployment

---

## Blynk Setup

### Datastream Configuration

| Virtual Pin | Parameter | Unit | Range | Widget Type |
|-------------|-----------|------|-------|-------------|
| V0 | Moisture | % | 0-100 | Gauge |
| V1 | Temperature | °C | 0-50 | Gauge |
| V2 | pH | pH | 0-14 | Gauge |
| V3 | EC | µS/cm | 0-5000 | Gauge |
| V4 | Nitrogen | mg/kg | 0-200 | Gauge |
| V5 | Phosphorus | mg/kg | 0-200 | Gauge |
| V6 | Potassium | mg/kg | 0-400 | Gauge |
| V7 | Pump Status | Boolean | 0-1 | LED/Switch |
| V8 | Terminal | String | - | Terminal |

---

## Upload and Testing

### Board Selection
- Board: ESP32 Dev Module
- Upload Speed: 115200
- Flash Frequency: 80MHz
- Flash Mode: QIO
- Flash Size: 4MB
- Partition Scheme: Default

### Serial Monitor
- Baud Rate: 115200
- Line Ending: Both NL & CR

### Expected Output
```
WiFi: Connected
IP Address: 192.168.x.x
Blynk: Data sent
Cloud Response [201]: Success
```

---

## Troubleshooting

### WiFi Connection Issues
- Verify 2.4GHz network (ESP32 doesn't support 5GHz)
- Check SSID and password spelling
- Ensure signal strength is adequate
- Disable MAC filtering on router temporarily

### Blynk Connection Failed
- Verify auth token is correct
- Check Blynk server status
- Ensure datastreams (V0-V8) are configured
- Confirm device is activated in Blynk Console

### Cloud Run 404 Error
- Device ID mismatch between code and registration
- Device not registered in Cultivo dashboard
- Check case sensitivity (ESP32_001 vs esp32_001)

### Cloud Run 400 Error
- Missing or null sensor readings
- Check sensor wiring and connections
- Verify analog pins are reading correctly
- Add debug prints for sensor values

### Sensor Reading Issues
- Verify analog pin connections
- Check sensor power supply voltage
- Calibrate sensors with known reference values
- Use voltage dividers if sensors output > 3.3V
- Switch to ADC1 pins if using WiFi

### Memory Issues
- Reduce JSON document size
- Increase CLOUD_INTERVAL to reduce memory pressure
- Monitor free heap with ESP.getFreeHeap()

---

## Advanced Configuration

### Sensor Calibration

**Moisture Sensor:**
- Calibrate in air (dry) and water (wet)
- Map raw ADC values to 0-100% scale

**pH Sensor:**
- Use pH 4, 7, and 10 buffer solutions
- Calculate voltage-to-pH conversion formula

**EC Sensor:**
- Calibrate with standard EC solution (1413 µS/cm)

### Power Management
- Deep sleep mode for battery operation
- Wake on timer (5-15 minute intervals)
- Monitor battery voltage on ADC pin

---

## Related Documentation
- IOT_ARCHITECTURE.md - System architecture and data flow
- SENSOR_MANAGEMENT_README.md - Dashboard and features

---

**Last Updated:** 2025-11-26
