import axios from 'axios';

// Example historical data
export const temperatureData = [
  { day: '1', temperature: 22 },
  { day: '2', temperature: 23 },
  { day: '3', temperature: 25 },
  { day: '4', temperature: 24 },
  { day: '5', temperature: 20 },
  { day: '6', temperature: 21 },
  { day: '7', temperature: 23 },
  { day: '8', temperature: 25 },
  { day: '9', temperature: 27 },
  { day: '10', temperature: 28 },
  { day: '11', temperature: 26 },
  { day: '12', temperature: 25 },
  { day: '13', temperature: 24 },
  { day: '14', temperature: 23 },
];

export const rainfallData = [
  { month: 'Jan', rainfall: 65 },
  { month: 'Feb', rainfall: 59 },
  { month: 'Mar', rainfall: 80 },
  { month: 'Apr', rainfall: 81 },
  { month: 'May', rainfall: 56 },
  { month: 'Jun', rainfall: 55 },
  { month: 'Jul', rainfall: 40 },
];

export const humidityData = [
  { day: '1', humidity: 65 },
  { day: '2', humidity: 68 },
  { day: '3', humidity: 70 },
  { day: '4', humidity: 72 },
  { day: '5', humidity: 68 },
  { day: '6', humidity: 65 },
  { day: '7', humidity: 63 },
  { day: '8', humidity: 60 },
  { day: '9', humidity: 58 },
  { day: '10', humidity: 62 },
  { day: '11', humidity: 65 },
  { day: '12', humidity: 68 },
  { day: '13', humidity: 70 },
  { day: '14', humidity: 72 },
];

// Updated interface with windSpeed as an object and without iconBaseUri
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
