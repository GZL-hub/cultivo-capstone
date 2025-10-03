import axios from 'axios';
import { getFarms } from '../../../services/farmService';

// WeatherData Interface
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

/**
 * Gets coordinates and name from the farm data
 * @returns Promise with latitude, longitude and farm name
 */
export const getFarmCoordinates = async (): Promise<{latitude: number, longitude: number, farmName: string}> => {
  try {
    // Get all farms
    const farms = await getFarms();
    
    // Check if we have farms
    if (!farms || farms.length === 0) {
      throw new Error('No farms found in the database');
    }
    
    // Get the first farm boundary
    const firstFarm = farms[0];
    
    if (!firstFarm.farmBoundary || 
        !firstFarm.farmBoundary.coordinates || 
        !firstFarm.farmBoundary.coordinates[0] || 
        !firstFarm.farmBoundary.coordinates[0][0]) {
      throw new Error('Farm boundary coordinates not available');
    }
    
    // GeoJSON format: coordinates are [longitude, latitude]
    const firstCoordinate = firstFarm.farmBoundary.coordinates[0][0];
    const longitude = firstCoordinate[0];
    const latitude = firstCoordinate[1];
    
    // Validate the coordinates
    if (isNaN(latitude) || isNaN(longitude) || 
        latitude < -90 || latitude > 90 || 
        longitude < -180 || longitude > 180) {
      throw new Error('Invalid farm coordinates');
    }
    
    // Get the farm name
    const farmName = firstFarm.name || 'My Farm';
    
    console.log(`Using farm: "${farmName}" at Lat ${latitude}, Lng ${longitude}`);
    return { latitude, longitude, farmName };
  } catch (error) {
    console.error('Error getting farm coordinates:', error);
    throw new Error(`Failed to get farm coordinates: ${error instanceof Error ? error.message : String(error)}`);
  }
};

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
    if (!API_KEY || API_KEY.trim() === '') {
      throw new Error("API Key is missing or empty");
    }
    
    // Get farm coordinates and name instead of hardcoded values
    const { latitude, longitude, farmName } = await getFarmCoordinates();
    
    // Google Weather API endpoint for current conditions
    const url = `https://weather.googleapis.com/v1/currentConditions:lookup`;
    
    console.log(`Fetching weather data for ${farmName}`);
    const response = await axios.get(url, {
      headers: {
        'X-Goog-Api-Key': API_KEY,
        'Content-Type': 'application/json',
      },
      params: {
        'key': API_KEY,
        'location.latitude': latitude,
        'location.longitude': longitude
      }
    });
    
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
        location: farmName, // Use farm name instead of coordinates
        lastUpdated: data.currentTime || new Date().toISOString(),
        isLoading: false,
        error: null,
        cloudCover: data.cloudCover || 0,
        weatherCondition: weatherCondition,
        isDay: isDay
      };
    }
    
    throw new Error("Invalid response format from weather API");
  } catch (error: any) {
    console.error('Error fetching weather data:', error);
    
    // Create detailed error message without fallback data
    let errorMessage = 'Failed to load weather data.';
    
    if (error.message && error.message.includes('farm coordinates')) {
      errorMessage = error.message;
    } else if (error.response) {
      errorMessage = `API Error: ${error.response.status} - ${error.response.data?.error?.message || 'Unknown error'}`;
      console.error('Error response:', error.response.data);
    } else if (error.request) {
      errorMessage = 'No response from weather API. Check network or API status.';
    } else {
      errorMessage = `Request Error: ${error.message}`;
    }
    
    // Return error state
    return {
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
      location: 'Unknown Farm Location',
      lastUpdated: new Date().toISOString(),
      isLoading: false,
      error: errorMessage,
      cloudCover: 0,
      weatherCondition: 'UNKNOWN',
      isDay: true
    };
  }
};

// Function to fetch today's hourly forecast
export const fetchTodayForecast = async (API_KEY: string): Promise<HourlyForecast[]> => {
  try {
    if (!API_KEY || API_KEY.trim() === '') {
      throw new Error("API Key is missing or empty");
    }
    
    // Get farm coordinates
    const { latitude, longitude, farmName } = await getFarmCoordinates();
    
    // Updated Google Weather API endpoint for hourly forecast
    const url = `https://weather.googleapis.com/v1/forecast/hours:lookup`;
    
    console.log(`Fetching hourly forecast for coordinates: ${latitude}, ${longitude}`);
    const response = await axios.get(url, {
      headers: {
        'X-Goog-Api-Key': API_KEY,
        'Content-Type': 'application/json',
      },
      params: {
        'key': API_KEY,
        'location.latitude': latitude,
        'location.longitude': longitude
      }
    });
    
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
    
    throw new Error("Invalid hourly forecast response format");
  } catch (error: any) {
    console.error('Error fetching hourly forecast:', error);
    
    // Create error message
    let errorMessage = 'Failed to load hourly forecast.';
    
    if (error.message && error.message.includes('farm coordinates')) {
      errorMessage = error.message;
    } else if (error.response) {
      errorMessage = `API Error: ${error.response.status} - ${error.response.data?.error?.message || 'Unknown error'}`;
    }
    
    // Throw error with message
    throw new Error(errorMessage);
  }
};

// Function to fetch weekly forecast
export const fetchWeeklyForecast = async (API_KEY: string): Promise<DailyForecast[]> => {
  try {
    if (!API_KEY || API_KEY.trim() === '') {
      throw new Error("API Key is missing or empty");
    }
    
    // Get farm coordinates
    const { latitude, longitude, farmName } = await getFarmCoordinates();    
    // Google Weather API endpoint for daily forecast
    const url = `https://weather.googleapis.com/v1/forecast/days:lookup`;
    
    console.log(`Fetching daily forecast for coordinates: ${latitude}, ${longitude}`);
    const response = await axios.get(url, {
      headers: {
        'X-Goog-Api-Key': API_KEY,
        'Content-Type': 'application/json',
      },
      params: {
        'key': API_KEY,
        'location.latitude': latitude,
        'location.longitude': longitude
      }
    });
    
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
    
    throw new Error("Invalid daily forecast response format");
  } catch (error: any) {
    console.error('Error fetching daily forecast:', error);
    
    // Create error message
    let errorMessage = 'Failed to load weekly forecast.';
    
    if (error.message && error.message.includes('farm coordinates')) {
      errorMessage = error.message;
    } else if (error.response) {
      errorMessage = `API Error: ${error.response.status} - ${error.response.data?.error?.message || 'Unknown error'}`;
    }
    
    // Throw error with message
    throw new Error(errorMessage);
  }
};