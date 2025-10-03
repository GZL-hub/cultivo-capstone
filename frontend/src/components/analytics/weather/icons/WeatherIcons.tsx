import React from 'react';
import { 
  // Day icons
  WiDaySunny,
  WiDayCloudy,
  WiDayCloudyHigh,
  WiDayFog,
  WiDayHail,
  WiDayHaze,
  WiDayLightning,
  WiDayRain,
  WiDayShowers,
  WiDaySleet,
  WiDaySnow,
  WiDayStormShowers,
  WiDayThunderstorm,
  
  // Night icons
  WiNightClear,
  WiNightCloudy,
  WiNightFog,
  WiNightHail,
  WiNightLightning,
  WiNightRain,
  WiNightShowers,
  WiNightSnow,
  WiNightStormShowers,
  WiNightThunderstorm,
  
  // Neutral icons
  WiCloud,
  WiCloudy,
  WiFog,
  WiRain,
  WiRaindrops,
  WiShowers,
  WiSleet,
  WiSnow,
  WiSnowflakeCold,
  WiStormShowers,
  WiThunderstorm,
  WiDust,
  WiSmoke,
  WiTornado,
  WiHurricane,
  WiHail
} from 'weather-icons-react';

// Weather condition descriptions mapping
export const weatherDescriptionMap: Record<string, string> = {
  'CLEAR': 'Clear Sky',
  'MOSTLY_CLEAR': 'Mostly Clear',
  'PARTLY_CLOUDY': 'Partly Cloudy',
  'MOSTLY_CLOUDY': 'Mostly Cloudy',
  'CLOUDY': 'Cloudy',
  'FOG': 'Foggy',
  'LIGHT_RAIN': 'Light Rain',
  'RAIN': 'Rain',
  'HEAVY_RAIN': 'Heavy Rain',
  'LIGHT_SNOW': 'Light Snow',
  'SNOW': 'Snow',
  'HEAVY_SNOW': 'Heavy Snow',
  'SLEET': 'Sleet',
  'HAIL': 'Hail',
  'THUNDERSTORM': 'Thunderstorm',
  'LIGHT_THUNDERSTORM': 'Light Thunderstorm',
  'HEAVY_THUNDERSTORM': 'Severe Thunderstorm',
  'THUNDERSTORM_RAIN': 'Thunderstorm with Rain',
  'LIGHT_THUNDERSTORM_RAIN': 'Light Thunderstorm with Rain',
  'HEAVY_THUNDERSTORM_RAIN': 'Severe Thunderstorm with Rain',
  'DUST': 'Dust',
  'SMOKE': 'Smoke',
  'TORNADO': 'Tornado Warning',
  'HURRICANE': 'Hurricane Warning',
  'HAZE': 'Haze',
  'MIST': 'Mist'
};

/**
 * Format a weather condition to a human-readable string
 */
export const formatWeatherCondition = (condition: string): string => {
  // First check if we have a direct mapping
  const normalizedCondition = condition.toUpperCase().trim();
  if (weatherDescriptionMap[normalizedCondition]) {
    return weatherDescriptionMap[normalizedCondition];
  }
  
  // If no direct mapping, format the string nicely
  return normalizedCondition
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')
    .replace('And', 'and')
    .replace('With', 'with');
};

interface WeatherIconProps {
  condition: string;
  isDay?: boolean;
  size?: number;
  color?: string;
  className?: string;
}

/**
 * A component that renders a weather icon based on the condition and time of day
 */
const WeatherIcon: React.FC<WeatherIconProps> = ({ 
  condition, 
  isDay = true, 
  size = 60, 
  color = '#ffffff',
  className = ''
}) => {
  const normalizedCondition = condition.toUpperCase().trim();
  
  // Map conditions to appropriate icons
  switch (normalizedCondition) {
    // Clear conditions
    case 'CLEAR':
      return isDay ? <WiDaySunny size={size} color={color} className={className} /> : <WiNightClear size={size} color={color} className={className} />;
    case 'MOSTLY_CLEAR':
      return isDay ? <WiDaySunny size={size} color={color} className={className} /> : <WiNightClear size={size} color={color} className={className} />;
    case 'PARTLY_CLOUDY':
      return isDay ? <WiDayCloudy size={size} color={color} className={className} /> : <WiNightCloudy size={size} color={color} className={className} />;
    case 'MOSTLY_CLOUDY':
      return isDay ? <WiDayCloudyHigh size={size} color={color} className={className} /> : <WiNightCloudy size={size} color={color} className={className} />;
    case 'CLOUDY':
      return <WiCloudy size={size} color={color} className={className} />;
    
    // Precipitation conditions
    case 'FOG':
      return isDay ? <WiDayFog size={size} color={color} className={className} /> : <WiNightFog size={size} color={color} className={className} />;
    case 'LIGHT_RAIN':
      return isDay ? <WiDayShowers size={size} color={color} className={className} /> : <WiNightShowers size={size} color={color} className={className} />;
    case 'RAIN':
      return isDay ? <WiDayRain size={size} color={color} className={className} /> : <WiNightRain size={size} color={color} className={className} />;
    case 'HEAVY_RAIN':
      return isDay ? <WiDayRain size={size} color={color} className={className} /> : <WiNightRain size={size} color={color} className={className} />;
    case 'LIGHT_SNOW':
      return isDay ? <WiDaySnow size={size} color={color} className={className} /> : <WiNightSnow size={size} color={color} className={className} />;
    case 'SNOW':
      return isDay ? <WiDaySnow size={size} color={color} className={className} /> : <WiNightSnow size={size} color={color} className={className} />;
    case 'HEAVY_SNOW':
      return isDay ? <WiDaySnow size={size} color={color} className={className} /> : <WiNightSnow size={size} color={color} className={className} />;
    case 'SLEET':
      return isDay ? <WiDaySleet size={size} color={color} className={className} /> : <WiSleet size={size} color={color} className={className} />;
    case 'HAIL':
      return isDay ? <WiDayHail size={size} color={color} className={className} /> : <WiNightHail size={size} color={color} className={className} />;
    
    // Thunderstorm conditions
    case 'THUNDERSTORM':
    case 'LIGHT_THUNDERSTORM':
    case 'HEAVY_THUNDERSTORM':
      return isDay ? <WiDayThunderstorm size={size} color={color} className={className} /> : <WiNightThunderstorm size={size} color={color} className={className} />;
    case 'THUNDERSTORM_RAIN':
    case 'LIGHT_THUNDERSTORM_RAIN':
    case 'HEAVY_THUNDERSTORM_RAIN':
      return isDay ? <WiDayStormShowers size={size} color={color} className={className} /> : <WiNightStormShowers size={size} color={color} className={className} />;
    
    // Other conditions
    case 'DUST':
      return <WiDust size={size} color={color} className={className} />;
    case 'SMOKE':
      return <WiSmoke size={size} color={color} className={className} />;
    case 'TORNADO':
      return <WiTornado size={size} color={color} className={className} />;
    case 'HURRICANE':
      return <WiHurricane size={size} color={color} className={className} />;
    case 'HAZE':
      return isDay ? <WiDayHaze size={size} color={color} className={className} /> : <WiFog size={size} color={color} className={className} />;
    case 'MIST':
      return isDay ? <WiDayFog size={size} color={color} className={className} /> : <WiNightFog size={size} color={color} className={className} />;
    
    // Default
    default:
      return isDay ? <WiDayCloudy size={size} color={color} className={className} /> : <WiNightCloudy size={size} color={color} className={className} />;
  }
};

export default WeatherIcon;