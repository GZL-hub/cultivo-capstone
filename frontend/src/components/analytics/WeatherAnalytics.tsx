import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { CloudRain, Thermometer, Wind, Loader, CloudOff, Eye, Gauge } from 'lucide-react';
import axios from 'axios';

// Example historical data
const temperatureData = [
  { day: '1', temperature: 22 },
  { day: '2', temperature: 23 },
  { day: '3', temperature: 25 },
  { day: '4', temperature: 24 },
  { day: '5', temperature: 20 },
  { day: '6', temperature: 21 },
  { day: '7', temperature: 23 },
  { day: '8', temperature: 25 },
  { day: '9', temperature: 27 },
  { day: '10', temperature: 28 },
  { day: '11', temperature: 26 },
  { day: '12', temperature: 25 },
  { day: '13', temperature: 24 },
  { day: '14', temperature: 23 },
];

const rainfallData = [
  { month: 'Jan', rainfall: 65 },
  { month: 'Feb', rainfall: 59 },
  { month: 'Mar', rainfall: 80 },
  { month: 'Apr', rainfall: 81 },
  { month: 'May', rainfall: 56 },
  { month: 'Jun', rainfall: 55 },
  { month: 'Jul', rainfall: 40 },
];

const humidityData = [
  { day: '1', humidity: 65 },
  { day: '2', humidity: 68 },
  { day: '3', humidity: 70 },
  { day: '4', humidity: 72 },
  { day: '5', humidity: 68 },
  { day: '6', humidity: 65 },
  { day: '7', humidity: 63 },
  { day: '8', humidity: 60 },
  { day: '9', humidity: 58 },
  { day: '10', humidity: 62 },
  { day: '11', humidity: 65 },
  { day: '12', humidity: 68 },
  { day: '13', humidity: 70 },
  { day: '14', humidity: 72 },
];

// Google Maps API Key - use your existing key
const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';

// Interfaces for weather API response
interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  weatherDescription: string;
  weatherIcon: string;
  visibility: number;
  pressure: number;
  uvIndex: number;
  location: string;
  lastUpdated: string;
  isLoading: boolean;
  error: string | null;
  cloudCover: number;
}

const WeatherAnalytics: React.FC = () => {
  // State for current weather data
  const [currentWeather, setCurrentWeather] = useState<WeatherData>({
    temperature: 0,
    feelsLike: 0,
    humidity: 0,
    windSpeed: 0,
    windDirection: '',
    weatherDescription: '',
    weatherIcon: '',
    visibility: 0,
    pressure: 0,
    uvIndex: 0,
    location: 'Kuala Lumpur, Malaysia',
    lastUpdated: '',
    isLoading: true,
    error: null,
    cloudCover: 0
  });

  // Helper function to convert wind direction in degrees to cardinal directions
  const getWindDirection = (degrees: number): string => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round((degrees % 360) / 22.5) % 16;
    return directions[index];
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Fetch current weather data
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        // Kuala Lumpur coordinates
        const latitude = 3.1390;
        const longitude = 101.6869;
        
        // Google Weather API endpoint for current conditions
        const url = `https://weather.googleapis.com/v1/currentConditions:lookup?key=${API_KEY}&location.latitude=${latitude}&location.longitude=${longitude}`;
        
        console.log("Fetching weather data from:", url);
        const response = await axios.get(url);
        
        if (response.data) {
          const data = response.data;
          console.log("Weather API Response:", data);
          
          // Format the weather data based on the actual API response structure
          setCurrentWeather({
            temperature: data.temperature?.degrees || 0,
            feelsLike: data.feelsLikeTemperature?.degrees || 0,
            humidity: data.relativeHumidity || 0,
            windSpeed: data.wind?.speed?.kilometers || 0,
            windDirection: getWindDirection(data.wind?.direction?.degrees || 0),
            weatherDescription: data.weatherCondition?.description?.defaultText || data.weatherCondition?.type || 'Unknown',
            weatherIcon: data.weatherCondition?.iconBaseUri ? `${data.weatherCondition.iconBaseUri}_small.png` : '',
            visibility: data.visibility?.distance || 0,
            pressure: data.airPressure?.meanSeaLevelMillibars || 0,
            uvIndex: data.uvIndex || 0,
            location: 'Kuala Lumpur, Malaysia',
            lastUpdated: data.currentTime || new Date().toISOString(),
            isLoading: false,
            error: null,
            cloudCover: data.cloudCover || 0
          });
        }
      } catch (error: any) {
        console.error('Error fetching weather data:', error);
        
        // Check for specific error types
        let errorMessage = 'Failed to load weather data. Using fallback data.';
        
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          errorMessage = `API Error: ${error.response.status} - ${error.response.data?.error?.message || 'Unknown error'}`;
          console.error('Error response:', error.response.data);
        } else if (error.request) {
          // The request was made but no response was received
          errorMessage = 'No response from weather API. Check network or API status.';
        } else {
          // Something happened in setting up the request that triggered an Error
          errorMessage = `Request Error: ${error.message}`;
        }
        
        // Use fallback data if API fails
        setCurrentWeather({
          temperature: 28,
          feelsLike: 31.5,
          humidity: 75,
          windSpeed: 12,
          windDirection: 'NE',
          weatherDescription: 'Cloudy',
          weatherIcon: '',
          visibility: 16,
          pressure: 1010,
          uvIndex: 1,
          location: 'Kuala Lumpur, Malaysia',
          lastUpdated: new Date().toISOString(),
          isLoading: false,
          error: errorMessage,
          cloudCover: 100
        });
      }
    };

    fetchWeatherData();
  }, []);

  return (
    <div className="space-y-8">      
      {currentWeather.isLoading ? (
        <div className="bg-white p-8 rounded-lg shadow flex items-center justify-center">
          <Loader className="h-8 w-8 text-green-500 animate-spin mr-3" />
          <p>Loading current weather data for Malaysia...</p>
        </div>
      ) : (
        <>
          {/* Current Location Weather */}
          <div className="bg-white p-6 rounded-lg shadow">
            {currentWeather.error ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CloudOff className="h-12 w-12 text-amber-500 mr-4" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Weather Data</h3>
                    <p className="text-amber-500">{currentWeather.error}</p>
                    <p className="text-sm text-gray-500 mt-1">Using fallback data for demonstration</p>
                  </div>
                </div>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-3 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <div className="flex items-center mb-4 md:mb-0">
                  {currentWeather.weatherIcon ? (
                    <img 
                      src={currentWeather.weatherIcon} 
                      alt={currentWeather.weatherDescription}
                      className="h-16 w-16 mr-4"
                    />
                  ) : (
                    <div className="h-16 w-16 mr-4 flex items-center justify-center bg-blue-100 rounded-full">
                      <CloudRain className="h-8 w-8 text-blue-500" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{currentWeather.location}</h3>
                    <p className="text-gray-500 capitalize">{currentWeather.weatherDescription}</p>
                    <p className="text-xs text-gray-400">Last updated: {formatDate(currentWeather.lastUpdated)}</p>
                  </div>
                </div>
                <div className="text-4xl font-bold text-gray-800">{currentWeather.temperature.toFixed(1)}°C</div>
              </div>
            )}
          </div>
      
          {/* Current Weather Stats - First Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow flex items-center">
              <Thermometer className="h-12 w-12 text-red-500 mr-4" />
              <div>
                <p className="text-sm text-gray-500">Temperature</p>
                <p className="text-3xl font-bold">{currentWeather.temperature.toFixed(1)}°C</p>
                <p className="text-xs text-gray-400">
                  Feels like: {currentWeather.feelsLike.toFixed(1)}°C
                </p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow flex items-center">
              <CloudRain className="h-12 w-12 text-blue-500 mr-4" />
              <div>
                <p className="text-sm text-gray-500">Humidity</p>
                <p className="text-3xl font-bold">{currentWeather.humidity.toFixed(0)}%</p>
                <p className="text-xs text-gray-400">
                  Cloud cover: {currentWeather.cloudCover}%
                </p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow flex items-center">
              <Wind className="h-12 w-12 text-gray-500 mr-4" />
              <div>
                <p className="text-sm text-gray-500">Wind Speed</p>
                <p className="text-3xl font-bold">{currentWeather.windSpeed.toFixed(1)} km/h</p>
                <p className="text-xs text-gray-400">Direction: {currentWeather.windDirection}</p>
              </div>
            </div>
          </div>

          {/* Current Weather Stats - Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow flex items-center">
              <Eye className="h-12 w-12 text-green-500 mr-4" />
              <div>
                <p className="text-sm text-gray-500">Visibility</p>
                <p className="text-3xl font-bold">{currentWeather.visibility} km</p>
                <p className="text-xs text-gray-400">
                  {currentWeather.visibility > 10 ? 'Good visibility' : 'Reduced visibility'}
                </p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow flex items-center">
              <Gauge className="h-12 w-12 text-amber-500 mr-4" />
              <div>
                <p className="text-sm text-gray-500">Pressure</p>
                <p className="text-3xl font-bold">{currentWeather.pressure.toFixed(0)} mb</p>
                <p className="text-xs text-gray-400">
                  {currentWeather.pressure > 1013 ? 'Above average' : 'Below average'}
                </p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow flex items-center">
              <div className="h-12 w-12 text-yellow-500 mr-4 flex items-center justify-center">
                <span className="text-2xl">☀️</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">UV Index</p>
                <p className="text-3xl font-bold">{currentWeather.uvIndex}</p>
                <p className="text-xs text-gray-400">
                  {currentWeather.uvIndex < 3 ? 'Low' : 
                   currentWeather.uvIndex < 6 ? 'Moderate' : 
                   currentWeather.uvIndex < 8 ? 'High' : 'Very High'}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Historical Data Section */}
      <h2 className="text-xl font-semibold text-gray-800 mt-10 mb-6">Historical Weather Data</h2>
      
      {/* Temperature Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4 text-gray-700">Temperature Trends (14 Days)</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={temperatureData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="temperature" stroke="#FF5722" name="Temperature (°C)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Rainfall Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4 text-gray-700">Monthly Rainfall</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rainfallData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="rainfall" fill="#2196F3" name="Rainfall (mm)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Humidity Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4 text-gray-700">Humidity Trends (14 Days)</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={humidityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="humidity" stroke="#3F51B5" fill="#C5CAE9" name="Humidity (%)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default WeatherAnalytics;