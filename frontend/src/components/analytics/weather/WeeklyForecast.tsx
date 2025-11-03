import React, { useState } from 'react';
import { Calendar, CloudRain, Droplet, Wind, Sun } from 'lucide-react';
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
  // State to track active/selected day
  const [activeDay, setActiveDay] = useState(0);

  // Extract today and future days
  const today = data.length > 0 ? data[activeDay] : null;
  const futureDays = data.length > 0 ? data.slice(0, 7) : [];
  
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
        icon: 'text-amber-300',
        sideGradient: 'from-orange-400/80 to-amber-700/80',
        activeDay: 'bg-gradient-to-b from-amber-400 to-orange-500',
        bgImage: 'https://images.unsplash.com/photo-1588421357574-87938a86fa28?q=80&w=800&auto=format'
      };
    case 'afternoon':
      return {
        bg: 'bg-gradient-to-br from-blue-700 to-blue-500',
        text: 'text-white',
        card: 'bg-white/10',
        highlight: 'bg-blue-700/40',
        icon: 'text-blue-300',
        sideGradient: 'from-blue-400/80 to-blue-700/80',
        activeDay: 'bg-gradient-to-b from-blue-400 to-blue-600',
        bgImage: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=800&auto=format'
      };
    case 'night':
      return {
        bg: 'bg-gradient-to-br from-slate-900 to-blue-900',
        text: 'text-white',
        card: 'bg-white/10',
        highlight: 'bg-slate-700/60',
        icon: 'text-blue-300',
        sideGradient: 'from-slate-700/80 to-blue-900/80',
        activeDay: 'bg-gradient-to-b from-blue-600 to-indigo-900',
        bgImage: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?q=80&w=800&auto=format'
      };
  }
};
  
  const theme = getThemeColors();
  
  if (isLoading) {
    return (
      <div className={`${theme.bg} rounded-xl shadow-lg overflow-hidden p-6 h-full flex flex-col`}>
        <div className="flex items-center mb-4">
          <h2 className="text-xl font-bold text-white">5-Day Forecast</h2>
        </div>
        <div className="flex-grow flex items-center justify-center">
          <div className="h-8 w-8 border-4 border-blue-300 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }
  
  if (error) {
    const isNoFarmError = error.includes('No farms registered') || error.includes('Farm boundary not drawn');

    return (
      <div className={`${theme.bg} rounded-xl shadow-lg overflow-hidden p-6 h-full flex flex-col`}>
        <div className="flex items-center mb-4">
          <Calendar className="h-5 w-5 mr-2 text-white" />
          <h2 className="text-xl font-bold text-white">5-Day Forecast</h2>
        </div>
        {isNoFarmError ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center py-8">
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
          <div className="flex-grow flex flex-col items-center justify-center text-white/80">
            <p>Unable to load weekly forecast.</p>
            <p className="text-sm text-white/60 mt-1">{error}</p>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className={`${theme.bg} rounded-xl shadow-xl overflow-hidden h-full flex flex-col`}>
      {/* Two column layout for modern UI */}
      <div className="flex flex-col md:flex-row h-full">
        {/* Left side - Featured day (today or selected) */}
          <div className="md:w-2/5 px-6 py-4 relative overflow-hidden">
            {/* Background image */}
            <div 
              className="absolute inset-0 z-0 bg-cover bg-center" 
              style={{ backgroundImage: `url(${theme.bgImage})` }}
            ></div>
            
            {/* Gradient overlay */}
            <div className={`absolute inset-0 z-10 bg-gradient-to-br ${theme.sideGradient}`}></div>
            
            {/* Black overlay for better text contrast */}
            <div className="absolute inset-0 z-20 bg-black/20"></div>
            
            {/* Content */}
            <div className="relative z-30 h-full flex flex-col justify-between">
              {/* Date Section */}
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {activeDay === 0 ? 'Today' : today?.date}
                </h2>
                <div className="text-white/80 text-sm">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            
            {/* Temperature Section */}
            <div className="flex flex-col items-center my-4">
              <div className="flex flex-col items-center">
                <WeatherIcon 
                  condition={today?.weatherCondition || 'CLEAR'} 
                  isDay={timeOfDay !== 'night'} 
                  size={80} 
                />
                <h1 className="text-5xl font-bold text-white my-2">
                  {today ? `${Math.round(today.tempMax)}°` : '--°'}
                </h1>
                <h3 className="text-xl text-white/90">
                  {today?.weatherCondition.replace(/_/g, ' ').toLowerCase() || ''}
                </h3>
              </div>
            </div>
            
            {/* Weather details */}
            <div className="mt-auto">
              <ul className="grid grid-cols-3 gap-3">
                <li className="flex flex-col items-center">
                  <Droplet size={18} className="text-blue-200 mb-1" />
                  <div className="text-xs text-white/80">Precipitation</div>
                  <div className="text-sm font-semibold text-white">
                    {today ? `${today.precipitationChance}%` : '--'}
                  </div>
                </li>
                <li className="flex flex-col items-center">
                  <Sun size={18} className="text-yellow-200 mb-1" />
                  <div className="text-xs text-white/80">Low</div>
                  <div className="text-sm font-semibold text-white">
                    {today ? `${Math.round(today.tempMin)}°` : '--°'}
                  </div>
                </li>
                <li className="flex flex-col items-center">
                  <Wind size={18} className="text-blue-200 mb-1" />
                  <div className="text-xs text-white/80">Wind</div>
                  <div className="text-sm font-semibold text-white">12 km/h</div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Right side - Weekly forecast */}
        <div className="flex-1 p-4 flex flex-col">
          <div className="flex items-center mb-4">
            <Calendar className="h-5 w-5 mr-2 text-white" />
            <h2 className="text-xl font-bold text-white">5-Day Forecast</h2>
          </div>
          
          {/* Week list */}
          <div className="flex-grow flex flex-col justify-center">
            <ul className="grid gap-2">
              {futureDays.map((day, index) => (
                <li 
                  key={index}
                  onClick={() => setActiveDay(index)}
                  className={`
                    cursor-pointer p-3 rounded-lg flex items-center justify-between
                    ${index === activeDay 
                      ? theme.activeDay + ' shadow-lg' 
                      : 'bg-white/10 hover:bg-white/20'}
                    transition-all duration-300
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 text-white font-medium text-center">
                      {day.date}
                    </div>
                    <div className="hidden md:block">
                      <WeatherIcon 
                        condition={day.weatherCondition} 
                        isDay={timeOfDay !== 'night'} 
                        size={28} 
                      />
                    </div>
                    <div className="hidden md:block text-white/80 text-sm">
                      {day.weatherCondition.replace(/_/g, ' ').toLowerCase()}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center text-white/80">
                      <Droplet className="h-3 w-3 mr-1 text-blue-300" />
                      <span className="text-xs">{day.precipitationChance}%</span>
                    </div>
                    
                    <div className="flex gap-2 min-w-[60px] justify-end">
                      <span className="text-white font-medium">{Math.round(day.tempMax)}°</span>
                      <span className="text-white/60">{Math.round(day.tempMin)}°</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyForecast;