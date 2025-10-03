import React from 'react';
import { Calendar, CloudRain, Droplet } from 'lucide-react';
import WeatherIcon from './icons/WeatherIcons';

interface DailyForecast {
  date: string;
  weatherCondition: string;
  tempMax: number;
  tempMin: number;
  precipitationChance: number;
}

interface WeeklyForecastProps {
  data: DailyForecast[];
  isLoading: boolean;
  error: string | null;
}

const WeeklyForecast: React.FC<WeeklyForecastProps> = ({ data, isLoading, error }) => {
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
  
  if (isLoading) {
    return (
      <div className={`${theme.bg} rounded-xl shadow-lg overflow-hidden p-6 h-full flex flex-col`}>
        <div className="flex items-center mb-4">
          <Calendar className="h-5 w-5 mr-2 text-white" />
          <h2 className="text-xl font-bold text-white">7-Day Forecast</h2>
        </div>
        <div className="flex-grow flex items-center justify-center">
          <div className="h-8 w-8 border-4 border-blue-300 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={`${theme.bg} rounded-xl shadow-lg overflow-hidden p-6 h-full flex flex-col`}>
        <div className="flex items-center mb-4">
          <Calendar className="h-5 w-5 mr-2 text-white" />
          <h2 className="text-xl font-bold text-white">7-Day Forecast</h2>
        </div>
        <div className="flex-grow flex flex-col items-center justify-center text-white/80">
          <p>Unable to load weekly forecast.</p>
          <p className="text-sm text-white/60 mt-1">{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`${theme.bg} rounded-xl shadow-xl overflow-hidden h-full flex flex-col`}>
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex items-center mb-4">
          <Calendar className="h-5 w-5 mr-2 text-white" />
          <h2 className="text-xl font-bold text-white">7-Day Forecast</h2>
        </div>
        
        {/* Daily forecast - Added flex-grow to fill container height */}
        <div className="space-y-8 flex-grow flex flex-col">
          {data.map((day, index) => (
            <div 
              key={index} 
              className="bg-white/10 backdrop-blur-md rounded-lg p-4 flex items-center justify-between shadow-md border border-white/20 w-full"
            >
              <div className="flex items-center">
                <div className="w-8 text-white font-medium">{day.date}</div>
                <div className="mx-3">
                  <WeatherIcon 
                    condition={day.weatherCondition} 
                    isDay={true} 
                    size={28} 
                  />
                </div>
                <div className="hidden sm:block text-white/90 text-sm">
                  {day.weatherCondition.toLowerCase().replace('_', ' ')}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center text-white/80">
                  <Droplet className="h-3 w-3 mr-1 text-blue-300" />
                  <span className="text-xs">{day.precipitationChance}%</span>
                </div>
                
                <div className="flex gap-2 min-w-[60px] justify-end">
                  <span className="text-white font-medium">{day.tempMax}°</span>
                  <span className="text-white/60">{day.tempMin}°</span>
                </div>
              </div>
            </div>
          ))}
          
          {/* If we have fewer than 7 days, add spacer divs to fill the height */}
          {data.length < 7 && (
            <div className="flex-grow"></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeeklyForecast;