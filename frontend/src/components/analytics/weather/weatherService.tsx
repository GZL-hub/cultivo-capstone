import axios from 'axios';

// WhetherData Interface
export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: { value: number, unit: string };
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
  weatherCondition?: string;
  isDay?: boolean;
}

// HourlyForecast Interface
export interface HourlyForecast {
  time: string;
  temperature: number;
  weatherCondition: string;
  precipitationChance: number;
}

// DailyForecast Interface
export interface DailyForecast {
  date: string;
  weatherCondition: string;
  tempMax: number;
  tempMin: number;
  precipitationChance: number;
}

// Function to format time from ISO string to readable format
const formatTime = (isoTime: string): string => {
  try {
    const date = new Date(isoTime);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return isoTime;
  }
};

// Function to format date from ISO string to day name
const formatDate = (isoDate: string): string => {
  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString([], { weekday: 'short' });
  } catch (e) {
    return isoDate;
  }
};

// Helper function to convert wind direction in degrees to cardinal directions
export const getWindDirection = (degrees: number | { degrees?: number, cardinal?: string }): string => {
  // If we already have a cardinal direction, use that
  if (typeof degrees === 'object' && degrees.cardinal) {
    return degrees.cardinal;
  }

  // Otherwise, convert degrees to cardinal direction
  const degValue = typeof degrees === 'number' ? degrees : (degrees?.degrees || 0);
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round((degValue % 360) / 22.5) % 16;
  return directions[index];
};

// Function to process wind speed from Google Maps Weather API
export const processWindSpeed = (windData: any): { value: number, unit: string } => {
  if (!windData) {
    return { value: 0, unit: 'KILOMETERS_PER_HOUR' };
  }

  // If we have a direct speed object with value and unit
  if (windData.speed && typeof windData.speed === 'object') {
    return {
      value: windData.speed.value || 0,
      unit: windData.speed.unit || 'KILOMETERS_PER_HOUR'
    };
  }

  // If we just have kilometers directly
  if (windData.kilometers) {
    return {
      value: windData.kilometers || 0,
      unit: 'KILOMETERS_PER_HOUR'
    };
  }

  // Fallback
  return { 
    value: typeof windData === 'number' ? windData : 0,
    unit: 'KILOMETERS_PER_HOUR'
  };
};

// Function to fetch weather data
export const fetchWeatherData = async (API_KEY: string): Promise<WeatherData> => {
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
      
      // Determine if it's day or night based on local time
      const currentHour = new Date().getHours();
      const isDay = currentHour >= 6 && currentHour < 18;
      
      // Get weather condition
      const weatherCondition = data.weatherCondition?.type || 'CLOUDY';
      
      // Process wind data
      const windSpeed = processWindSpeed(data.wind);
      
      // Get wind direction
      const windDirection = getWindDirection(data.wind?.direction || 0);
      
      // Format the weather data based on the actual API response structure
      return {
        temperature: data.temperature?.degrees || 0,
        feelsLike: data.feelsLikeTemperature?.degrees || 0,
        humidity: data.relativeHumidity || 0,
        windSpeed: windSpeed,
        windDirection: windDirection,
        weatherDescription: data.weatherCondition?.description?.defaultText || '',
        weatherIcon: '',
        visibility: data.visibility?.distance || 0,
        pressure: data.airPressure?.meanSeaLevelMillibars || 0,
        uvIndex: data.uvIndex || 0,
        location: 'Kuala Lumpur, Malaysia',
        lastUpdated: data.currentTime || new Date().toISOString(),
        isLoading: false,
        error: null,
        cloudCover: data.cloudCover || 0,
        weatherCondition: weatherCondition,
        isDay: isDay
      };
    }
    throw new Error("Invalid response format");
  } catch (error: any) {
    console.error('Error fetching weather data:', error);
    
    // Check for specific error types
    let errorMessage = 'Failed to load weather data. Using fallback data.';
    
    if (error.response) {
      errorMessage = `API Error: ${error.response.status} - ${error.response.data?.error?.message || 'Unknown error'}`;
      console.error('Error response:', error.response.data);
    } else if (error.request) {
      errorMessage = 'No response from weather API. Check network or API status.';
    } else {
      errorMessage = `Request Error: ${error.message}`;
    }
    
    // Use fallback data if API fails
    return {
      temperature: 28,
      feelsLike: 31.5,
      humidity: 75,
      windSpeed: { value: 6, unit: 'KILOMETERS_PER_HOUR' },
      windDirection: 'NE',
      weatherDescription: 'Light Thunderstorm with Rain',
      weatherIcon: '',
      visibility: 16,
      pressure: 1010,
      uvIndex: 1,
      location: 'Kuala Lumpur, Malaysia',
      lastUpdated: new Date().toISOString(),
      isLoading: false,
      error: errorMessage,
      cloudCover: 100,
      weatherCondition: 'LIGHT_THUNDERSTORM_RAIN',
      isDay: true
    };
  }
};

// New function to fetch today's hourly forecast
export const fetchTodayForecast = async (API_KEY: string): Promise<HourlyForecast[]> => {
  try {
    // Kuala Lumpur coordinates
    const latitude = 3.1390;
    const longitude = 101.6869;
    
    // Updated Google Weather API endpoint for hourly forecast
    const url = `https://weather.googleapis.com/v1/forecast/hours:lookup?key=${API_KEY}&location.latitude=${latitude}&location.longitude=${longitude}`;
    
    console.log("Fetching hourly forecast data from:", url);
    const response = await axios.get(url);
    
    if (response.data && response.data.forecastHours) {
      console.log("Hourly Forecast Response:", response.data);
      
      // Process the hourly data to get the next 12 hours
      const hourlyData = response.data.forecastHours.slice(0, 12).map((hour: any) => {
        // Get precipitation chance from the probability object if available
        const precipChance = hour.precipitation?.probability?.percent || 0;
        
        return {
          // Format time from either interval.startTime or displayDateTime
          time: formatTime(hour.interval?.startTime) || 
                `${hour.displayDateTime?.hours}:00`,
          temperature: hour.temperature?.degrees || 0,
          weatherCondition: hour.weatherCondition?.type || 'UNKNOWN',
          precipitationChance: precipChance
        };
      });
      
      return hourlyData;
    }
    
    throw new Error("Invalid hourly forecast format");
  } catch (error: any) {
    console.error('Error fetching hourly forecast:', error);
    
    // Return fallback data if API fails
    return [
      { time: '09:00', temperature: 27, weatherCondition: 'CLOUDY', precipitationChance: 10 },
      { time: '10:00', temperature: 28, weatherCondition: 'PARTLY_CLOUDY', precipitationChance: 20 },
      { time: '11:00', temperature: 30, weatherCondition: 'SUNNY', precipitationChance: 0 },
      { time: '12:00', temperature: 31, weatherCondition: 'SUNNY', precipitationChance: 0 },
      { time: '13:00', temperature: 32, weatherCondition: 'SUNNY', precipitationChance: 10 },
      { time: '14:00', temperature: 32, weatherCondition: 'PARTLY_CLOUDY', precipitationChance: 20 },
      { time: '15:00', temperature: 31, weatherCondition: 'CLOUDY', precipitationChance: 30 },
      { time: '16:00', temperature: 30, weatherCondition: 'LIGHT_RAIN', precipitationChance: 40 },
      { time: '17:00', temperature: 29, weatherCondition: 'LIGHT_RAIN', precipitationChance: 50 },
      { time: '18:00', temperature: 28, weatherCondition: 'CLOUDY', precipitationChance: 30 },
      { time: '19:00', temperature: 27, weatherCondition: 'CLOUDY', precipitationChance: 20 },
      { time: '20:00', temperature: 27, weatherCondition: 'PARTLY_CLOUDY', precipitationChance: 10 }
    ];
  }
};

// New function to fetch weekly forecast
export const fetchWeeklyForecast = async (API_KEY: string): Promise<DailyForecast[]> => {
  try {
    // Kuala Lumpur coordinates
    const latitude = 3.1390;
    const longitude = 101.6869;
    
    // Google Weather API endpoint for daily forecast
    const url = `https://weather.googleapis.com/v1/forecast/days:lookup?key=${API_KEY}&location.latitude=${latitude}&location.longitude=${longitude}`;
    
    console.log("Fetching daily forecast data from:", url);
    const response = await axios.get(url);
    
    if (response.data && response.data.forecastDays) {
      console.log("Daily Forecast Response:", response.data);
      
      // Process the daily data - limit to 7 days
      const dailyData = response.data.forecastDays.slice(0, 7).map((day: any) => {
        // Get the appropriate weather condition (prioritize daytime)
        const weatherCondition = 
          day.daytimeForecast?.weatherCondition?.type || 
          day.nighttimeForecast?.weatherCondition?.type || 
          'UNKNOWN';
        
        // Extract precipitation chance prioritizing daytime forecast
        const precipChance = 
          (day.daytimeForecast?.precipitation?.probability?.percent) || 
          (day.nighttimeForecast?.precipitation?.probability?.percent) || 
          // Fallback to thunderstorm probability if precipitation isn't available
          (day.daytimeForecast?.thunderstormProbability) ||
          (day.nighttimeForecast?.thunderstormProbability) || 
          0;
        
        // Format the date properly
        let dateStr = '';
        if (day.displayDate) {
          const { year, month, day: dayNum } = day.displayDate;
          dateStr = new Date(year, month - 1, dayNum).toLocaleDateString([], { weekday: 'short' });
        } else if (day.interval?.startTime) {
          dateStr = formatDate(day.interval.startTime);
        } else {
          dateStr = 'Unknown';
        }
        
        return {
          date: dateStr,
          weatherCondition: weatherCondition,
          tempMax: day.maxTemperature?.degrees || 0,
          tempMin: day.minTemperature?.degrees || 0,
          precipitationChance: precipChance
        };
      });
      
      return dailyData;
    }
    
    throw new Error("Invalid daily forecast format");
  } catch (error: any) {
    console.error('Error fetching daily forecast:', error);
    
    // Return fallback data if API fails
    return [
      { date: 'Mon', weatherCondition: 'SUNNY', tempMax: 33, tempMin: 25, precipitationChance: 0 },
      { date: 'Tue', weatherCondition: 'PARTLY_CLOUDY', tempMax: 32, tempMin: 25, precipitationChance: 20 },
      { date: 'Wed', weatherCondition: 'RAINY', tempMax: 29, tempMin: 24, precipitationChance: 80 },
      { date: 'Thu', weatherCondition: 'RAINY', tempMax: 28, tempMin: 24, precipitationChance: 70 },
      { date: 'Fri', weatherCondition: 'CLOUDY', tempMax: 30, tempMin: 25, precipitationChance: 30 },
      { date: 'Sat', weatherCondition: 'PARTLY_CLOUDY', tempMax: 31, tempMin: 26, precipitationChance: 10 },
      { date: 'Sun', weatherCondition: 'SUNNY', tempMax: 32, tempMin: 26, precipitationChance: 0 }
    ];
  }
};