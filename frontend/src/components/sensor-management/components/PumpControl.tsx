import React from 'react';
import { ISensor } from '../../../services/sensorService';
import { Power, Droplets, AlertTriangle } from 'lucide-react';

interface PumpControlProps {
  sensor: ISensor;
}

const PumpControl: React.FC<PumpControlProps> = ({ sensor }) => {
  if (!sensor.lastReading) {
    return null;
  }

  const { moisture, pumpStatus } = sensor.lastReading;
  const { moistureThreshold } = sensor.settings;

  const isPumpNeeded = moisture < moistureThreshold;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border-2 border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Power className="w-5 h-5 mr-2 text-blue-600" />
          Irrigation Pump
        </h3>
        <div className={`flex items-center px-3 py-1 rounded-full ${
          pumpStatus ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-800'
        }`}>
          <div className={`w-3 h-3 rounded-full mr-2 ${
            pumpStatus ? 'bg-green-600 animate-pulse' : 'bg-gray-600'
          }`} />
          <span className="text-sm font-semibold">
            {pumpStatus ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Moisture Status */}
        <div className="bg-white p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 flex items-center">
              <Droplets className="w-4 h-4 mr-2 text-blue-600" />
              Current Moisture
            </span>
            <span className={`text-lg font-bold ${
              moisture < moistureThreshold ? 'text-red-600' : 'text-green-600'
            }`}>
              {moisture.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                moisture < moistureThreshold ? 'bg-red-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(moisture, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span className="font-semibold">Threshold: {moistureThreshold}%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Automation Status */}
        <div className="bg-white p-4 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Automation Status</h4>
          <div className="space-y-2 text-sm">
            {isPumpNeeded ? (
              <div className="flex items-start">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2 mt-0.5" />
                <div>
                  <p className="text-yellow-700 font-semibold">Moisture Below Threshold</p>
                  <p className="text-gray-600">
                    Pump should activate automatically when moisture drops below {moistureThreshold}%
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start">
                <Droplets className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
                <div>
                  <p className="text-green-700 font-semibold">Moisture Level Adequate</p>
                  <p className="text-gray-600">
                    Pump will remain off while moisture is above {moistureThreshold}%
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Operation Info */}
        <div className="bg-blue-600 text-white p-4 rounded-lg">
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ul className="text-sm space-y-1">
            <li>• Pump activates when moisture &lt; {moistureThreshold}%</li>
            <li>• Automatic control via ESP32 sensor</li>
            <li>• Real-time monitoring every second</li>
            <li>• Data synced with Blynk IoT platform</li>
          </ul>
        </div>

        {/* Manual Control Note */}
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
          <p className="text-xs text-yellow-800">
            <strong>Note:</strong> Pump control is automated by the ESP32 device.
            Manual control can be configured through the Blynk mobile app or web dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PumpControl;
