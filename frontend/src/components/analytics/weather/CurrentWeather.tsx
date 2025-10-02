import React from 'react';
import { CloudRain, Thermometer, Wind, CloudOff, Eye, Gauge, Sun, Moon, Sunrise } from 'lucide-react';
import { WiCloudy } from 'weather-icons-react';
import WeatherIcon, { formatWeatherCondition } from './icons/WeatherIcons';
/**
 * Function to get the correct icon URL based on icon base URI
 * According to Google Maps Weather API:
 * - Base URI doesn't include file extension
 * - Then append .svg or .png for the file type
 */
const formatIconUrl = (iconBaseUri: string, useSvg: boolean = true): string => {
  if (!iconBaseUri) return '';
  
  // Add file extension
  const fileExtension = useSvg ? '.svg' : '.png';
  
  return `${iconBaseUri}${fileExtension}`;
};

/**
 * Helper function to format wind speed with units
 */
const formatWindSpeed = (speed: number | { value: number, unit: string }): string => {
  if (typeof speed === 'number') {
    return `${speed.toFixed(1)} km/h`;
  }
  
  if (speed && typeof speed === 'object' && 'value' in speed) {
    const value = speed.value;
    const unit = speed.unit === 'KILOMETERS_PER_HOUR' ? 'km/h' : 'mph';
    return `${value.toFixed(1)} ${unit}`;
  }
  
  return '0.0 km/h';
};

interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number | { value: number, unit: string };
  windDirection: string;
  weatherDescription: string;
  weatherIcon: string;
  iconBaseUri?: string;
  visibility: number;
  pressure: number;
  uvIndex: number;
  location: string;
  lastUpdated: string;
  isLoading: boolean;
  error: string | null;
  cloudCover: number;
  weatherCondition?: string;
  isDay?: boolean;
}

interface CurrentWeatherProps {
  data: WeatherData;
  onRetry?: () => void;
}

const CurrentWeather: React.FC<CurrentWeatherProps> = ({ 
  data, 
  onRetry,
}) => {
  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Determine if it's day or night based on current time if not provided
  const isDay = data.isDay !== undefined ? data.isDay : 
    (new Date().getHours() > 6 && new Date().getHours() < 18);
  
  // Determine the time of day for styling
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    return 'night';
  };
  
  const timeOfDay = getTimeOfDay();
  
  // Define theme colors based on time of day
  const getThemeColors = () => {
    switch(timeOfDay) {
      case 'morning':
        return {
          bg: 'bg-gradient-to-br from-blue-100 to-yellow-100',
          text: 'text-gray-800',
          card: 'bg-white/90',
          highlight: 'bg-yellow-100',
          icon: 'text-yellow-500'
        };
      case 'afternoon':
        return {
          bg: 'bg-gradient-to-br from-blue-400 to-cyan-200',
          text: 'text-gray-800',
          card: 'bg-white/90',
          highlight: 'bg-blue-100',
          icon: 'text-blue-600'
        };
      case 'night':
        return {
          bg: 'bg-gradient-to-br from-slate-900 to-blue-900',
          text: 'text-white',
          card: 'bg-slate-800/90',
          highlight: 'bg-slate-700',
          icon: 'text-blue-400'
        };
    }
  };
  
  const theme = getThemeColors();
  
  // Get the appropriate weather icon
  const getWeatherIcon = () => {
    // First option: Use weather-icons-react if we have a weather condition
    if (data.weatherCondition) {
      return <WeatherIcon condition={data.weatherCondition} isDay={isDay} size={80} />;
    }
    
    // Second option: Use iconBaseUri if available (from Google Weather API)
    if (data.iconBaseUri) {
      return <img 
        src={formatIconUrl(data.iconBaseUri)}
        alt={data.weatherDescription || 'Weather condition'}
        className="h-20 w-20"
      />;
    } 
    
    // Third option: Use direct weatherIcon URL if provided
    if (data.weatherIcon) {
      return <img 
        src={data.weatherIcon} 
        alt={data.weatherDescription || 'Weather condition'}
        className="h-20 w-20"
      />;
    } 
    
    // Fallback icon
    return <WiCloudy size={80} color={timeOfDay === 'night' ? "#90caf9" : "#1565c0"} />;
  };

  // Get formatted weather description
  const getFormattedWeatherDescription = () => {
    if (data.weatherDescription) {
      return data.weatherDescription;
    }
    
    if (data.weatherCondition) {
      return formatWeatherCondition(data.weatherCondition);
    }
    
    return 'Unknown';
  };

  // Get formatted wind speed
  const getFormattedWindSpeed = () => {
    return formatWindSpeed(data.windSpeed);
  };

  // Get weather recommendations
  const getWeatherRecommendation = () => {
    if (data.uvIndex > 7) return "High UV - Please wear UV protection";
    if (data.humidity > 80) return "High humidity - Please monitor plants for fungal issues";
    if (parseFloat(getFormattedWindSpeed()) > 20) return "Strong winds - Please secure any outdoor equipment";
    return "Good conditions for field inspection";
  };

  if (data.isLoading) {
    return (
      <div className={`${theme.bg} p-8 rounded-xl shadow-lg flex items-center justify-center h-96`}>
        <div className="h-12 w-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mr-3" />
        <p className={theme.text}>Loading current weather data for Malaysia...</p>
      </div>
    );
  }

  return (
    <div className={`${theme.bg} rounded-xl shadow-xl overflow-hidden transition-all duration-500`}>
      {/* Main Hero Section */}
      <div className="p-6">
        {data.error ? (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center">
              <CloudOff className="h-16 w-16 text-amber-500 mr-4" />
              <div>
                <h3 className="text-xl font-semibold text-gray-100">Weather Data Unavailable</h3>
                <p className="text-amber-400">{data.error}</p>
                <p className="text-sm text-gray-300 mt-1">Using fallback data for demonstration</p>
              </div>
            </div>
            <button 
              onClick={onRetry} 
              className="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors shadow-lg"
            >
              Refresh Data
            </button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row justify-between">
            {/* Left section: Location and main weather */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="flex-shrink-0">
                {getWeatherIcon()}
              </div>
              <div className={`${theme.text} text-center md:text-left`}>
                <div className="flex items-center mb-1">
                  {timeOfDay === 'morning' ? (
                    <Sunrise className="w-5 h-5 mr-2" />
                  ) : timeOfDay === 'afternoon' ? (
                    <Sun className="w-5 h-5 mr-2" />
                  ) : (
                    <Moon className="w-5 h-5 mr-2" />
                  )}
                  <span className="text-sm opacity-80">
                    {timeOfDay === 'morning' ? 'Morning' : timeOfDay === 'afternoon' ? 'Afternoon' : 'Night'} in
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">{data.location}</h2>
                <p className="text-lg md:text-xl opacity-90">{getFormattedWeatherDescription()}</p>
                <p className="text-sm opacity-70 mt-2">Last updated: {formatDate(data.lastUpdated)}</p>
                <div className={`mt-4 p-3 rounded-lg ${theme.highlight} inline-block`}>
                  <p className="text-sm font-medium">{getWeatherRecommendation()}</p>
                </div>
              </div>
            </div>
            
            {/* Right section: Temperature */}
            <div className={`${theme.text} text-center md:text-right mt-6 md:mt-0`}>
              <div className="text-6xl md:text-7xl font-bold">{data.temperature.toFixed(1)}°C</div>
              <div className="text-lg opacity-80">Feels like: {data.feelsLike.toFixed(1)}°C</div>
            </div>
          </div>
        )}
      </div>
      
    {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 p-6 backdrop-blur-lg">
        {/* Temperature */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 flex flex-col items-center shadow-md hover:bg-white/20 transition-all">
          <Thermometer className="h-8 w-8 text-red-300 mb-2" />
          <p className="text-xs uppercase tracking-wide text-white/80">Temperature</p>
          <p className="text-xl font-bold text-white">{data.temperature.toFixed(1)}°C</p>
          <p className="text-xs text-white/70">Feels: {data.feelsLike.toFixed(1)}°C</p>
        </div>
        
        {/* Humidity */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 flex flex-col items-center shadow-md hover:bg-white/20 transition-all">
          <CloudRain className="h-8 w-8 text-blue-300 mb-2" />
          <p className="text-xs uppercase tracking-wide text-white/80">Humidity</p>
          <p className="text-xl font-bold text-white">{data.humidity.toFixed(0)}%</p>
          <p className="text-xs text-white/70">Cloud: {data.cloudCover}%</p>
        </div>
        
        {/* Wind Speed */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 flex flex-col items-center shadow-md hover:bg-white/20 transition-all">
          <Wind className="h-8 w-8 text-gray-300 mb-2" />
          <p className="text-xs uppercase tracking-wide text-white/80">Wind</p>
          <p className="text-xl font-bold text-white">{getFormattedWindSpeed()}</p>
          <p className="text-xs text-white/70">Dir: {data.windDirection}</p>
        </div>

        {/* Visibility */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 flex flex-col items-center shadow-md hover:bg-white/20 transition-all">
          <Eye className="h-8 w-8 text-green-300 mb-2" />
          <p className="text-xs uppercase tracking-wide text-white/80">Visibility</p>
          <p className="text-xl font-bold text-white">{data.visibility} km</p>
          <p className="text-xs text-white/70">{data.visibility > 10 ? 'Clear' : 'Limited'}</p>
        </div>
        
        {/* Pressure */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 flex flex-col items-center shadow-md hover:bg-white/20 transition-all">
          <Gauge className="h-8 w-8 text-amber-300 mb-2" />
          <p className="text-xs uppercase tracking-wide text-white/80">Pressure</p>
          <p className="text-xl font-bold text-white">{data.pressure.toFixed(0)}</p>
          <p className="text-xs text-white/70">millibars</p>
        </div>
        
        {/* UV Index */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 flex flex-col items-center shadow-md hover:bg-white/20 transition-all">
          <Sun className="h-8 w-8 text-yellow-300 mb-2" />
          <p className="text-xs uppercase tracking-wide text-white/80">UV Index</p>
          <p className="text-xl font-bold text-white">{data.uvIndex}</p>
          <p className="text-xs text-white/70">
            {data.uvIndex < 3 ? 'Low' : data.uvIndex < 6 ? 'Moderate' : data.uvIndex < 8 ? 'High' : 'Very High'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeather;