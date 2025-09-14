import React, { useState, useEffect } from 'react';
import { WiDaySunny, WiCloudy, WiDayCloudy, WiRain, WiThunderstorm } from 'weather-icons-react';

interface WeatherCardProps {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
}

const WeatherCard: React.FC<WeatherCardProps> = ({
  temperature,
  condition,
  humidity,
  windSpeed
}) => {
  // State for the current time and date
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update the time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    // Clean up the interval on component unmount
    return () => clearInterval(timer);
  }, []);
  
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

  // Lowercase condition for comparison
  const lowerCondition = condition.toLowerCase();
  
  // Function to get time-based gradient
  const getTimeBasedStyle = () => {
    const hour = currentTime.getHours();
    
    // Night: 19:00 - 5:59 (7pm - 5:59am)
    if (hour >= 19 || hour < 6) {
      return {
        background: 'linear-gradient(135deg, #061d45, #330855)',
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

  // Function to render the appropriate weather icon
  const renderWeatherIcon = () => {
    const iconSize = 48;
    const iconColor = "#ffffff"; // White for all modes
    
    // Use a div wrapper to ensure the icon is properly contained
    return (
      <div className="flex items-center justify-center">
        {(lowerCondition === 'sunny' || lowerCondition === 'clear') && (
          <WiDaySunny size={iconSize} color={iconColor} />
        )}
        
        {lowerCondition === 'cloudy' && (
          <WiCloudy size={iconSize} color={iconColor} />
        )}
        
        {lowerCondition === 'partly cloudy' && (
          <WiDayCloudy size={iconSize} color={iconColor} />
        )}
        
        {(lowerCondition === 'rainy' || lowerCondition === 'rain') && (
          <WiRain size={iconSize} color={iconColor} />
        )}
        
        {(lowerCondition === 'stormy' || lowerCondition === 'thunderstorm') && (
          <WiThunderstorm size={iconSize} color={iconColor} />
        )}
        
        {/* Default icon if no condition matches */}
        {!['sunny', 'clear', 'cloudy', 'partly cloudy', 'rainy', 'rain', 'stormy', 'thunderstorm'].includes(lowerCondition) && (
          <WiDaySunny size={iconSize} color={iconColor} />
        )}
      </div>
    );
  };

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
            {renderWeatherIcon()}
          </div>
          
          {/* Temperature and condition */}
          <div>
            <div className="text-2xl font-bold text-white">{temperature}°C</div>
            <div className="text-sm text-white/80">{condition}</div>
          </div>
        </div>
        
        {/* Right side - Additional info */}
        <div className="flex flex-col text-right">
          <div className="flex items-center justify-end mb-1">
            <span className="text-sm text-white/80 mr-1">Humidity:</span>
            <span className="text-sm font-medium text-white">{humidity}%</span>
          </div>
          <div className="flex items-center justify-end">
            <span className="text-sm text-white/80 mr-1">Wind:</span>
            <span className="text-sm font-medium text-white">{windSpeed} km/h</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;