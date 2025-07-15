import axios from 'axios';

const forecastEndpoint = params => 
  `https://api.open-meteo.com/v1/forecast?latitude=${params.latitude}&longitude=${params.longitude}&current=temperature_2m,apparent_temperature,relativehumidity_2m,weathercode,windspeed_10m,precipitation_probability,uv_index,visibility,pressure_msl&hourly=temperature_2m,apparent_temperature,relativehumidity_2m,weathercode,windspeed_10m,precipitation_probability,uv_index&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto&forecast_days=7`;

const airQualityEndpoint = params => 
  `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${params.latitude}&longitude=${params.longitude}&current=pm2_5,dust&timezone=auto`;

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

export const fetchWeatherForecast = async (params) => {
  try {
    // Fetch both weather and air quality data
    const [weatherData, airQualityData] = await Promise.all([
      apiCall(forecastEndpoint(params)),
      apiCall(airQualityEndpoint(params))
    ]);
    
    // Combine the data
    if (weatherData && airQualityData) {
      return {
        ...weatherData,
        airQuality: airQualityData.current
      };
    }
    
    // Return weather data even if air quality fails
    return weatherData;
  } catch (error) {
    console.log('Error fetching weather/air quality data: ', error);
    // Fallback to just weather data
    const weatherUrl = forecastEndpoint(params);
    return apiCall(weatherUrl);
  }
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

// Helper function to format visibility
export const formatVisibility = (visibility) => {
  if (visibility === null || visibility === undefined) return '--';
  return `${Math.round(visibility / 1000)} km`;
};

// Helper function to get visibility description
export const getVisibilityDescription = (visibility) => {
  if (visibility === null || visibility === undefined) return 'No data';
  
  const visibilityKm = visibility / 1000;
  
  if (visibilityKm >= 20) {
    return 'Excellent';
  } else if (visibilityKm >= 10) {
    return 'Very good';
  } else if (visibilityKm >= 4) {
    return 'Good';
  } else if (visibilityKm >= 2) {
    return 'Moderate';
  } else if (visibilityKm >= 1) {
    return 'Poor';
  } else {
    return 'Very poor';
  }
};

// Helper function to format pressure
export const formatPressure = (pressure) => {
  if (pressure === null || pressure === undefined) return '--';
  return `${Math.round(pressure)} hPa`;
};

// Helper function to get UV index level and recommendation
export const getUVIndexInfo = (uvIndex) => {
  if (uvIndex === null || uvIndex === undefined || uvIndex < 0) return { level: '--', recommendation: 'No data available', color: '#9ca3af' };
  
  if (uvIndex < 3) {
    return { 
      level: 'Low', 
      color: '#22c55e' 
    };
  } else if (uvIndex < 6) {
    return { 
      level: 'Moderate', 
      color: '#eab308' 
    };
  } else if (uvIndex < 8) {
    return { 
      level: 'High', 
      color: '#f97316' 
    };
  } else if (uvIndex < 11) {
    return { 
      level: 'Very High', 
      color: '#ef4444' 
    };
  } else {
    return { 
      level: 'Extreme', 
      color: '#8b5cf6' 
    };
  }
};

// Helper function to format PM2.5 air quality
export const formatPM25 = (pm25) => {
  if (!pm25 && pm25 !== 0) return '--';
  return `${Math.round(pm25)} µg/m³`;
};

// Helper function to get PM2.5 air quality description
export const getPM25Description = (pm25) => {
  if (!pm25 && pm25 !== 0) return 'No data';
  
  if (pm25 <= 12) {
    return 'Good';
  } else if (pm25 <= 35) {
    return 'Moderate';
  } else if (pm25 <= 55) {
    return 'Unhealthy for sensitive groups';
  } else if (pm25 <= 150) {
    return 'Unhealthy';
  } else if (pm25 <= 250) {
    return 'Very unhealthy';
  } else {
    return 'Hazardous';
  }
};

// Helper function to get PM2.5 air quality color
export const getPM25Color = (pm25) => {
  if (!pm25 && pm25 !== 0) return '#9ca3af';
  
  if (pm25 <= 12) {
    return '#22c55e'; // Good - Green
  } else if (pm25 <= 35) {
    return '#eab308'; // Moderate - Yellow
  } else if (pm25 <= 55) {
    return '#f97316'; // Unhealthy for sensitive - Orange
  } else if (pm25 <= 150) {
    return '#ef4444'; // Unhealthy - Red
  } else if (pm25 <= 250) {
    return '#8b5cf6'; // Very unhealthy - Purple
  } else {
    return '#7c2d12'; // Hazardous - Maroon
  }
};

// Helper function to format dust concentration
export const formatDust = (dust) => {
  if (!dust && dust !== 0) return '--';
  return `${Math.round(dust)} µg/m³`;
};

// Helper function to get dust description
export const getDustDescription = (dust) => {
  if (!dust && dust !== 0) return 'No data';
  
  if (dust <= 50) {
    return 'Low';
  } else if (dust <= 100) {
    return 'Moderate';
  } else if (dust <= 200) {
    return 'High';
  } else {
    return 'Very high';
  }
};
