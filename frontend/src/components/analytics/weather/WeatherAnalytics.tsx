import React, { useState, useEffect } from 'react';
import { 
  fetchWeatherData, 
  fetchTodayForecast,
  fetchWeeklyForecast,
  WeatherData, 
  HourlyForecast, 
  DailyForecast
} from './weatherService';
import CurrentWeather from './CurrentWeather';
import TodayForecast from './TodayForecast';
import WeeklyForecast from './WeeklyForecast';

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
  
  // State for today's forecast data
  const [todayForecast, setTodayForecast] = useState<{
    data: HourlyForecast[];
    isLoading: boolean;
    error: string | null;
  }>({
    data: [],
    isLoading: true,
    error: null
  });
  
  // State for weekly forecast data
  const [weeklyForecast, setWeeklyForecast] = useState<{
    data: DailyForecast[];
    isLoading: boolean;
    error: string | null;
  }>({
    data: [],
    isLoading: true,
    error: null
  });

  // Fetch weather data
  const loadWeatherData = async () => {
    // Reset loading states
    setCurrentWeather(prev => ({ ...prev, isLoading: true }));
    setTodayForecast(prev => ({ ...prev, isLoading: true }));
    setWeeklyForecast(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Fetch current weather in parallel with forecasts
      const [currentData, todayData, weeklyData] = await Promise.all([
        fetchWeatherData(API_KEY),
        fetchTodayForecast(API_KEY),
        fetchWeeklyForecast(API_KEY)
      ]);
      
      // Update states with fetched data
      setCurrentWeather(currentData);
      setTodayForecast({
        data: todayData,
        isLoading: false,
        error: null
      });
      setWeeklyForecast({
        data: weeklyData,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      console.error("Error loading weather data:", error);
      
      // Handle errors individually for each component if needed
      if (currentWeather.isLoading) {
        setCurrentWeather(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: "Failed to fetch current weather data" 
        }));
      }
      
      if (todayForecast.isLoading) {
        setTodayForecast(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: "Failed to fetch today's forecast data" 
        }));
      }
      
      if (weeklyForecast.isLoading) {
        setWeeklyForecast(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: "Failed to fetch weekly forecast data" 
        }));
      }
    }
  };

  // Fetch weather data on component mount
  useEffect(() => {
    loadWeatherData();
  }, []);

  return (
    <div className="w-full max-w-full">
      {/* Simple stacked layout with each component in its own row */}
      <div className="flex flex-col gap-6">
        {/* Current Weather - First row */}
        <div>
          <CurrentWeather 
            data={currentWeather} 
            onRetry={loadWeatherData}
          />
        </div>
        
        {/* Today's Forecast - Second row */}
        <div>
          <TodayForecast 
            data={todayForecast.data}
            isLoading={todayForecast.isLoading}
            error={todayForecast.error}
          />
        </div>
        
        {/* Weekly Forecast - Third row */}
        <div>
          <WeeklyForecast 
            data={weeklyForecast.data}
            isLoading={weeklyForecast.isLoading}
            error={weeklyForecast.error}
          />
        </div>
      </div>
    </div>
  );
};

export default WeatherAnalytics;