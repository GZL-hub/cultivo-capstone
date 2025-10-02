import React, { useState, useEffect } from 'react';
import { fetchWeatherData, WeatherData } from './weatherData';
import CurrentWeather from './CurrentWeather';
import HistoricalWeatherCharts from './HistoricalWeatherCharts';

// Google Maps API Key
const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';

const WeatherAnalytics: React.FC = () => {
  // State for current weather data
  const [currentWeather, setCurrentWeather] = useState<WeatherData>({
    temperature: 0,
    feelsLike: 0,
    humidity: 0,
    windSpeed: { value: 0, unit: 'KILOMETERS_PER_HOUR' },
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
    cloudCover: 0,
    weatherCondition: 'CLEAR',
    isDay: true
  });

  // Fetch weather data
  const loadWeatherData = async () => {
    setCurrentWeather(prev => ({ ...prev, isLoading: true }));
    const data = await fetchWeatherData(API_KEY);
    setCurrentWeather(data);
  };

  // Fetch current weather data on component mount
  useEffect(() => {
    loadWeatherData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Current Weather Section */}
      <CurrentWeather 
        data={currentWeather} 
        onRetry={loadWeatherData}
      />
      
      {/* Historical Weather Charts */}
      <HistoricalWeatherCharts className="mt-10" />
    </div>
  );
};

export default WeatherAnalytics;