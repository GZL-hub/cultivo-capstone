import React, { useState, useEffect } from 'react';
import { fetchWeatherData, WeatherData } from '../../../components/analytics/weather/weatherService';
import WeatherIcon from '../../../components/analytics/weather/icons/WeatherIcons';
import { AlertCircle } from 'lucide-react';

interface WeatherCardProps {
  apiKey?: string;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ apiKey }) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update the time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    // Clean up the interval on component unmount
    return () => clearInterval(timer);
  }, []);
  
  // Fetch weather data
  useEffect(() => {
    const getWeatherData = async () => {
      try {
        setLoading(true);
        // Use environment variable if apiKey is not provided as prop
        const key = apiKey || process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
        
        if (!key) {
          throw new Error('No API key available');
        }
        
        const data = await fetchWeatherData(key);
        setWeatherData(data);
        setError(data.error);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
        console.error('Weather fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    getWeatherData();
    
    // Refresh weather data every 30 minutes
    const refreshInterval = setInterval(getWeatherData, 30 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, [apiKey]);
  
  // Format date and time
  const dateOptions: Intl.DateTimeFormatOptions = { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short' 
  };
  const timeOptions: Intl.DateTimeFormatOptions = { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  };
  
  const formattedDate = currentTime.toLocaleDateString('en-US', dateOptions);
  const formattedTime = currentTime.toLocaleTimeString('en-US', timeOptions);
  
  // Function to get time-based gradient
  const getTimeBasedStyle = () => {
    const hour = currentTime.getHours();
    
    // Night: 19:00 - 5:59 (7pm - 5:59am)
    if (hour >= 19 || hour < 6) {
      return {
        background: 'linear-gradient(135deg, #07204bff, #8947c7ff)',
        color: 'white'
      };
    }
    // Morning: 6:00 - 11:59 (6am - 11:59am)
    else if (hour >= 6 && hour < 12) {
      return {
        background: 'linear-gradient(135deg, #ff9500, #ff5f6d)',
        color: 'white'
      };
    }
    // Day: 12:00 - 18:59 (12pm - 6:59pm)
    else {
      return {
        background: 'linear-gradient(to bottom, #0ea5e9, #6366f1)',
        color: 'white'
      };
    }
  };
  
  const timeBasedStyle = getTimeBasedStyle();

  // Loading state
  if (loading) {
    return (
      <div className="p-4 rounded-2xl shadow-2xl" style={timeBasedStyle}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Weather</h2>
          <div className="text-sm text-white/80">Loading...</div>
        </div>
        <div className="flex justify-center items-center h-16">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-white/80 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  // Error state - check if it's a "no farm" error
  if (error) {
    const isNoFarmError = error.includes('No farms registered') || error.includes('Farm boundary not drawn');

    if (isNoFarmError) {
      return (
        <div className="p-4 rounded-2xl shadow-2xl" style={timeBasedStyle}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">Weather</h2>
            <div className="text-sm text-white/80">{formattedDate}</div>
          </div>
          <div className="text-center py-4">
            <p className="text-white/90 font-medium mb-1">
              {error.includes('boundary not drawn')
                ? 'Please draw your farm boundary on the map'
                : 'Create a farm to view weather data'}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="p-4 rounded-2xl shadow-2xl" style={timeBasedStyle}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-white">Weather</h2>
          <div className="text-sm text-white/80">{formattedDate}</div>
        </div>
        <div className="text-center py-4">
          <AlertCircle className="h-12 w-12 mx-auto text-white/40 mb-3" />
          <p className="text-white/90 font-medium">Unable to load weather data</p>
          <p className="text-xs mt-1 text-white/60">{error}</p>
        </div>
      </div>
    );
  }

  // No data state
  if (!weatherData) {
    return (
      <div className="p-4 rounded-2xl shadow-2xl" style={timeBasedStyle}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-white">Weather</h2>
          <div className="text-sm text-white/80">{formattedDate}</div>
        </div>
        <div className="text-center py-2 text-white/80">
          <p>No weather data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-sky-500/25" style={timeBasedStyle}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-white">Weather</h2>
        <div className="flex space-x-3 items-center">
          <span className="text-sm text-white/80">{formattedDate}</span>
          <span className="text-base font-medium text-white">{formattedTime}</span>
        </div>
      </div>
      
      <div className="flex items-center">
        {/* Left side - Current conditions */}
        <div className="flex items-center flex-1">
          {/* Weather icon */}
          <div className="w-14 h-14 mr-3 flex-shrink-0 flex items-center justify-center">
            <WeatherIcon 
              condition={weatherData.weatherCondition || 'CLOUDY'} 
              isDay={weatherData.isDay !== undefined ? weatherData.isDay : true} 
              size={48}
              color="#ffffff"
            />
          </div>
          
          {/* Temperature and condition */}
          <div>
            <div className="text-2xl font-bold text-white">
              {Math.round(weatherData.temperature)}°C
            </div>
            <div className="text-sm text-white/80">
              {weatherData.weatherDescription || weatherData.weatherCondition?.replace(/_/g, ' ').toLowerCase() || 'Unknown'}
            </div>
          </div>
        </div>
        
        {/* Right side - Additional info */}
        <div className="flex flex-col text-right">
          <div className="flex items-center justify-end mb-1">
            <span className="text-sm text-white/80 mr-1">Humidity:</span>
            <span className="text-sm font-medium text-white">{weatherData.humidity}%</span>
          </div>
          <div className="flex items-center justify-end">
            <span className="text-sm text-white/80 mr-1">Wind:</span>
            <span className="text-sm font-medium text-white">{weatherData.windSpeed.value} km/h</span>
          </div>
        </div>
      </div>
      
      {/* Location info */}
      <div className="mt-2 text-xs text-white/70 text-right">
        {weatherData.location}
      </div>
    </div>
  );
};

export default WeatherCard;