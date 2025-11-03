import React from 'react';
import { Cloud, CloudRain, Sun, Droplet, } from 'lucide-react';
import WeatherIcon from './icons/WeatherIcons';

interface HourlyForecast {
  time: string;
  temperature: number;
  weatherCondition: string;
  precipitationChance: number;
}

// New interface for daily forecast data
interface DailyForecast {
  interval: {
    startTime: string;
    endTime: string;
  };
  displayDate: {
    year: number;
    month: number;
    day: number;
  };
  maxTemperature: {
    degrees: number;
    unit: string;
  };
  minTemperature: {
    degrees: number;
    unit: string;
  };
  daytimeForecast: {
    relativeHumidity: number;
    uvIndex: number;
    thunderstormProbability: number;
    weatherCondition?: string;
    precipitation?: {
      probability?: {
        percent?: number;
      };
    };
  };
  nighttimeForecast: {
    relativeHumidity: number;
    uvIndex: number;
    thunderstormProbability: number;
    weatherCondition?: string;
  };
  sunEvents: {
    sunriseTime: string;
    sunsetTime: string;
  };
}

interface TodayForecastProps {
  data: HourlyForecast[] | DailyForecast[];
  isLoading: boolean;
  error: string | null;
  isDaily?: boolean; // Flag to indicate if data is daily forecast
}

const TodayForecast: React.FC<TodayForecastProps> = ({ data, isLoading, error, isDaily = false }) => {
  // Reference for the scroll container
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  
  // Scroll functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

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
          bg: 'bg-gradient-to-br from-amber-500 to-orange-600',
          text: 'text-white',
          card: 'bg-white/10',
          highlight: 'bg-amber-700/40',
          icon: 'text-amber-300'
        };
      case 'afternoon':
        return {
          bg: 'bg-gradient-to-br from-blue-700 to-blue-500',
          text: 'text-white',
          card: 'bg-white/10',
          highlight: 'bg-blue-700/40',
          icon: 'text-blue-300'
        };
      case 'night':
        return {
          bg: 'bg-gradient-to-br from-slate-900 to-blue-900',
          text: 'text-white',
          card: 'bg-white/10',
          highlight: 'bg-slate-700/60',
          icon: 'text-blue-300'
        };
    }
  };
  
  const theme = getThemeColors();
  
  // Process daily forecast data into a format compatible with our display
  const processedData = React.useMemo(() => {
    if (!isDaily) return data as HourlyForecast[];
    
    return (data as DailyForecast[]).map(day => {
      // Format the date as a string (e.g., "Mon, Oct 2")
      const date = new Date(day.interval.startTime);
      const formattedDate = date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
      
      // Get the weather condition from daytime forecast
      const weatherCondition = day.daytimeForecast.weatherCondition || 'UNKNOWN';
      
      // Calculate precipitation chance
      const precipChance = day.daytimeForecast.precipitation?.probability?.percent || 
                          day.daytimeForecast.thunderstormProbability || 0;
      
      return {
        time: formattedDate,
        temperature: day.maxTemperature.degrees,
        minTemperature: day.minTemperature.degrees,
        weatherCondition: weatherCondition,
        precipitationChance: precipChance,
        uvIndex: day.daytimeForecast.uvIndex,
        humidity: day.daytimeForecast.relativeHumidity
      };
    });
  }, [data, isDaily]);
  
  if (isLoading) {
    return (
      <div className={`${theme.bg} rounded-xl shadow-lg overflow-hidden p-4`}>
        <div className="flex items-center mb-4">
          <h2 className="text-xl font-bold text-white">
            {isDaily ? '5-Day Forecast' : 'Today\'s Forecast'}
          </h2>
        </div>
        <div className="flex justify-center py-10">
          <div className="h-8 w-8 border-4 border-blue-300 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }
  
  if (error) {
    const isNoFarmError = error.includes('No farms registered') || error.includes('Farm boundary not drawn');

    return (
      <div className={`${theme.bg} rounded-xl shadow-lg overflow-hidden p-6`}>
        <div className="flex items-center mb-4">
          <Cloud className="h-5 w-5 mr-2" />
          <h2 className="text-xl font-bold text-white">
            {isDaily ? '5-Day Forecast' : 'Today\'s Forecast'}
          </h2>
        </div>
        {isNoFarmError ? (
          <div className="text-center py-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-3 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <p className="text-white/80 mb-1">No Farm Location Available</p>
            <p className="text-sm text-white/60">
              {error.includes('boundary not drawn')
                ? 'Please draw your farm boundary to view forecast data.'
                : 'Create a farm to view forecast data for your location.'}
            </p>
          </div>
        ) : (
          <div className="text-center py-6 text-white/80">
            <p>Unable to load forecast data.</p>
            <p className="text-sm text-white/60 mt-1">{error}</p>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className={`${theme.bg} rounded-xl shadow-xl overflow-hidden`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Sun className="h-5 w-5 mr-2 text-white" />
            <h2 className="text-xl font-bold text-white">
              {isDaily ? '5-Day Forecast' : 'Today\'s Forecast'}
            </h2>
          </div>
        </div>
        
        {/* Horizontal scrollable container with only 4 cards visible */}
        <div 
          ref={scrollContainerRef}
          className="overflow-x-scroll pb-6" 
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 py-2">
            {processedData.map((item, index) => {
              // For daily forecast, show min/max temperature
              const isDay = (item as any).minTemperature !== undefined;
              
              return (
                <div 
                  key={index} 
                  className="bg-white/10 backdrop-blur-md rounded-lg p-4 flex flex-col items-center shadow-md border border-white/20 transition-transform hover:scale-105"
                >
                  <p className="text-base font-medium text-white/90 mb-1">{item.time}</p>
                  <div className="my-2">
                    <WeatherIcon 
                      condition={item.weatherCondition} 
                      isDay={timeOfDay !== 'night' || isDaily} 
                      size={40} 
                    />
                  </div>
                  
                  {isDaily ? (
                    // Display for daily forecast
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-xl font-bold text-white">{Math.round((item as any).temperature)}°</p>
                      <span className="text-white/50">/</span>
                      <p className="text-sm text-white/70">{Math.round((item as any).minTemperature)}°</p>
                    </div>
                  ) : (
                    // Display for hourly forecast
                    <p className="text-xl font-bold text-white mb-1">{Math.round(item.temperature)}°C</p>
                  )}
                  
                  <div className="flex items-center mt-1 text-white/80">
                    <Droplet className="h-3 w-3 mr-1 text-blue-300" />
                    <p className="text-xs">{item.precipitationChance}%</p>
                  </div>
                  
                  {isDaily && (item as any).uvIndex !== undefined && (
                    <div className="flex items-center mt-1 text-white/80">
                      <Sun className="h-3 w-3 mr-1 text-yellow-300" />
                      <p className="text-xs">UV: {(item as any).uvIndex}</p>
                    </div>
                  )}
                  
                  <p className="text-xs mt-1 text-white/70 text-center">
                    {item.weatherCondition.replace(/_/g, ' ').toLowerCase()}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodayForecast;