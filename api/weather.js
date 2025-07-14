import axios from 'axios';

const forecastEndpoint = params => 
  `https://api.open-meteo.com/v1/forecast?latitude=${params.latitude}&longitude=${params.longitude}&current=temperature_2m,apparent_temperature,relativehumidity_2m,weathercode,windspeed_10m&hourly=temperature_2m,apparent_temperature,relativehumidity_2m,weathercode,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto&forecast_days=7`;

const locationsEndpoint = params => 
  `https://geocoding-api.open-meteo.com/v1/search?name=${params.cityName}&count=10&language=en&format=json`;

const apiCall = async (endpoint) => {
  const options = {
    method: 'GET',
    url: endpoint,
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.log('error: ', error);
    return null;
  }
};

export const fetchWeatherForecast = (params) => {
  let forecastUrl = forecastEndpoint(params);
  return apiCall(forecastUrl);
};

export const fetchLocations = (params) => {
  let locationsUrl = locationsEndpoint(params);
  return apiCall(locationsUrl);
};

// Helper function to get weather condition from weather code
export const getWeatherCondition = (weatherCode) => {
  const weatherConditions = {
    0: { condition: 'Clear Sky', image: 'sun' },
    1: { condition: 'Mainly Clear', image: 'sun' },
    2: { condition: 'Partly Cloudy', image: 'partlycloudy' },
    3: { condition: 'Overcast', image: 'cloud' },
    45: { condition: 'Foggy', image: 'mist' },
    48: { condition: 'Rime Fog', image: 'mist' },
    51: { condition: 'Light Drizzle', image: 'drizzle' },
    53: { condition: 'Moderate Drizzle', image: 'drizzle' },
    55: { condition: 'Dense Drizzle', image: 'rain' },
    61: { condition: 'Light Rain', image: 'moderaterain' },
    63: { condition: 'Moderate Rain', image: 'rain' },
    65: { condition: 'Heavy Rain', image: 'heavyrain' },
    71: { condition: 'Light Snow', image: 'snow' },
    73: { condition: 'Moderate Snow', image: 'snow' },
    75: { condition: 'Heavy Snow', image: 'snow' },
    80: { condition: 'Light Showers', image: 'moderaterain' },
    81: { condition: 'Moderate Showers', image: 'rain' },
    82: { condition: 'Violent Showers', image: 'heavyrain' },
    95: { condition: 'Thunderstorm', image: 'thunder' },
    96: { condition: 'Thunderstorm with Hail', image: 'thunder' },
    99: { condition: 'Severe Thunderstorm', image: 'thunder' }
  };
  
  return weatherConditions[weatherCode] || { condition: 'Unknown', image: 'sun' };
};

// Helper function to format temperature
export const formatTemperature = (temp) => {
  return Math.round(temp);
};

// Helper function to format wind speed
export const formatWindSpeed = (speed) => {
  return Math.round(speed);
};

// Helper function to format time
export const formatTime = (timeString) => {
  const date = new Date(timeString);
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};

// Helper function to get day name with timezone awareness
export const getDayName = (dateString, timezoneOffset = 0) => {
  // Parse the date string (format: "YYYY-MM-DD")
  const [year, month, day] = dateString.split('-').map(Number);
  const apiDate = new Date(year, month - 1, day); // month is 0-indexed
  
  // Get current date, adjusting for potential timezone differences
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  

  if (apiDate.getTime() === today.getTime()) {
    return 'Today';
  } else if (apiDate.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  } else {
    return apiDate.toLocaleDateString('en-US', { weekday: 'long' });
  }
};
