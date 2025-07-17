# Weather Application

This is a React Native weather app built with Expo that provides current weather conditions, hourly forecasts, and daily forecasts for any location worldwide.

## Features

- **Current Weather**: Real-time temperature, humidity, wind speed, and weather conditions
- **Location Services**: Get weather for your current location or search for any city
- **Hourly Forecast**: Next 24 hours of weather data with detailed view
- **Daily Forecast**: 7-day weather outlook
- **Air Quality**: PM2.5 and dust levels monitoring
- **Weather Details**: UV index, visibility, pressure, and precipitation probability
- **Location Memory**: Remembers your last searched location

## Tech Stack

- **React Native** with Expo
- **React Navigation** for screen navigation
- **Axios** for API requests
- **AsyncStorage** for local data persistence
- **Expo Location** for GPS functionality
- **Open-Meteo API** for weather data
- **Lodash** for utility functions

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

## Available Scripts

- `npx expo start` - Start Expo development server
- `npm run ios` - Run on iOS device/simulator

## API

This app uses the [Open-Meteo API](https://open-meteo.com/), which provides:
- Weather forecast data
- Air quality information
- Geocoding for location search

No API key required, the service is free and open source.
