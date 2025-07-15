import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef } from 'react';
import { Image, TextInput, TouchableOpacity, View, StyleSheet, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalendarDaysIcon, MagnifyingGlassIcon, MapPinIcon as MapPinOutlineIcon, SunIcon, EyeIcon } from 'react-native-heroicons/outline';
import { MapPinIcon } from 'react-native-heroicons/solid';
import { theme } from '../theme';
import {debounce} from 'lodash';
import { fetchLocations, fetchWeatherForecast, getWeatherCondition, getDayName, formatTemperature, formatTime, formatVisibility, formatPressure, getUVIndexInfo, getVisibilityDescription, formatPM25, getPM25Description, getPM25Color, formatDust, getDustDescription } from '../api/weather';
import { getWeatherImage } from '../constants';
import { saveLastCity, loadLastCity } from '../storage/asyncStorage';
import * as Location from 'expo-location';

export default function HomeScreen({ navigation }) {

  const [showSearch, toggleSearch] = React.useState(false);
  const [locations, setLocations] = React.useState([]);
  const [weather, setWeather] = React.useState({});
  const [fullHourlyData, setFullHourlyData] = React.useState(null);
  const [currentLocation, setCurrentLocation] = React.useState(null);
  const [loadingLocation, setLoadingLocation] = React.useState(false);
  const searchInputRef = useRef(null);

  // Load last searched city
  useEffect(() => {
    loadLastSearchedCity();
  }, []);

  const loadLastSearchedCity = async () => {
    const cityData = await loadLastCity();
    if (cityData) {
      handleLocation(cityData, false); // false to avoid saving again
    }
  };

  const handleLocation = (location, shouldSave = true) => {
    console.log('Selected location:', location);
    console.log('City name:', location.name);
    console.log('Country:', location.country);
    
    setLocations([]); // Clear locations after selection
    toggleSearch(false); // Hide search dropdown
    setCurrentLocation(location); // Store the selected location
    
    // Save to AsyncStorage if this is a new selection (not loading from storage)
    if (shouldSave) {
      saveLastCity(location);
    }
    
    // Use the latitude and longitude from the selected location
    fetchWeatherForecast({
      latitude: location.latitude,
      longitude: location.longitude
    }).then(data => {
      console.log('API Response structure:', {
        hasData: !!data,
        hasCurrent: !!data?.current,
        hasHourly: !!data?.hourly,
        hasDaily: !!data?.daily
      });
      
      if (!data) {
        console.error('No data received from weather API');
        return;
      }
      
      if (!data.current) {
        console.error('No current weather data received');
        return;
      }
      
      if (!data.hourly || !data.hourly.time) {
        console.error('No hourly weather data received');
        return;
      }
      
      // Store the full hourly data for the detailed view (24 hours)
      if (data?.hourly?.time && data?.current?.time) {
        const currentTimeInCity = new Date(data.current.time);
        let startIndex = 0;
        
        for (let i = 0; i < data.hourly.time.length; i++) {
          const hourlyTime = new Date(data.hourly.time[i]);
          if (hourlyTime >= currentTimeInCity) {
            startIndex = i;
            break;
          }
        }
        
        // Store full 24 hours for detailed view
        const full24Hours = {
          ...data.hourly,
          time: data.hourly.time.slice(startIndex, startIndex + 24),
          temperature_2m: data.hourly.temperature_2m?.slice(startIndex, startIndex + 24),
          apparent_temperature: data.hourly.apparent_temperature?.slice(startIndex, startIndex + 24),
          weathercode: data.hourly.weathercode?.slice(startIndex, startIndex + 24),
          relativehumidity_2m: data.hourly.relativehumidity_2m?.slice(startIndex, startIndex + 24),
          windspeed_10m: data.hourly.windspeed_10m?.slice(startIndex, startIndex + 24),
          precipitation_probability: data.hourly.precipitation_probability?.slice(startIndex, startIndex + 24)
        };
        
        setFullHourlyData(full24Hours);
        
        // Process hourly data to show only next 13 hours from current time in city's timezone for home screen
        const next13Hours = {
          ...data.hourly,
          time: data.hourly.time.slice(startIndex, startIndex + 13),
          temperature_2m: data.hourly.temperature_2m?.slice(startIndex, startIndex + 13),
          apparent_temperature: data.hourly.apparent_temperature?.slice(startIndex, startIndex + 13),
          weathercode: data.hourly.weathercode?.slice(startIndex, startIndex + 13),
          relativehumidity_2m: data.hourly.relativehumidity_2m?.slice(startIndex, startIndex + 13),
          windspeed_10m: data.hourly.windspeed_10m?.slice(startIndex, startIndex + 13),
          precipitation_probability: data.hourly.precipitation_probability?.slice(startIndex, startIndex + 13)
        };
        
        data.hourly = next13Hours;
      }
      
      setWeather(data);
      console.log('Got forecast:', data);
      console.log('Daily data:', data?.daily);
      console.log('Hourly data:', data?.hourly);
      console.log('Daily time array:', data?.daily?.time);
      console.log('Hourly time array:', data?.hourly?.time);
      console.log('Weather code:', data?.current?.weathercode);
      console.log('Weather condition:', data?.current?.weathercode ? getWeatherCondition(data.current.weathercode) : 'No weather code');
    }).catch(error => {
      console.error('Error fetching weather data:', error);
      Alert.alert('Error', 'Failed to fetch weather data. Please try again.');
    });
  }

  const toggleSearchWithFocus = () => {
    const newSearchState = !showSearch;
    toggleSearch(newSearchState);
    
    // If opening search, focus the input immediately
    if (newSearchState) {
      requestAnimationFrame(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      });
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLoadingLocation(true);
      
      // Request permission to access location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Permission to access location was denied. Please enable location access in your device settings.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;

      // Get location name using reverse geocoding
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode.length > 0) {
        const place = reverseGeocode[0];
        const locationData = {
          name: place.city || place.subregion || place.region || 'Current Location',
          country: place.country || '',
          latitude,
          longitude,
        };

        // Set this as current location and fetch weather
        handleLocation(locationData, true);
      } else {
        // If reverse geocoding fails, still use coordinates
        const locationData = {
          name: 'Current Location',
          country: '',
          latitude,
          longitude,
        };
        handleLocation(locationData, true);
      }
    } catch (error) {
      console.log('Error getting location:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please try again or search for a city manually.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleSearch = value => {
    // Fetch locations
    if(value.length > 2){
      fetchLocations({ cityName: value }).then(data=> {
        console.log('got locations: ', data);
        if(data && data.results) {
          setLocations(data.results);
        }
      })
    }
  }

  const handleTextDebounce = useCallback(debounce(handleSearch, 700), []);
  const {current, daily, hourly, airQuality} = weather;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Image 
        source={require('../assets/images/bg.png')} 
        blurRadius={70}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Search bar */}
        <View style={styles.searchContainer}>
          <View style={[
            styles.searchBar,
            {backgroundColor: showSearch ? theme.bgWhite(0.2) : 'transparent'}
          ]}>
            {showSearch ? (
              <TextInput
                ref={searchInputRef}
                onChangeText={handleTextDebounce}
                placeholder="Search city"
                placeholderTextColor={'lightgrey'}
                style={styles.textInput}
              />
            ) : null}

            <View style={styles.searchActions}>
              {/* Location button - only show when search is not active */}
              {!showSearch && (
                <TouchableOpacity
                  onPress={getCurrentLocation}
                  disabled={loadingLocation}
                  style={[
                    styles.locationButton, 
                    {backgroundColor: theme.bgWhite(0.3)},
                    loadingLocation && {opacity: 0.6}
                  ]}
                >
                  <MapPinOutlineIcon size="25" color="white" />
                </TouchableOpacity>
              )}

              {/* Search button */}
              <TouchableOpacity
                onPress={toggleSearchWithFocus}
                style={[styles.searchButton, {backgroundColor: theme.bgWhite(0.3)}]}
              >
                <MagnifyingGlassIcon size="25" color="white" />
              </TouchableOpacity>
            </View>
          </View>
          {
            locations.length > 0 && showSearch ? (
                <View style={styles.searchResults}>
                    {
                        locations.map((loc, index) => {
                            let showBorder = index + 1 !== locations.length;
                            return (
                                <TouchableOpacity 
                                    onPress={() => handleLocation(loc)}
                                    key={index} 
                                    style={[
                                      styles.locationItem,
                                      showBorder && styles.locationItemBorder
                                    ]}
                                >
                                    <MapPinIcon size="20" color="gray" />
                                    <Text style={styles.locationText}>{loc?.name}, {loc?.country}</Text>
                                </TouchableOpacity>
                            );
                        })
                    }
                </View>
            ) : null
          }
        </View>
        
        {/* Scrollable content */}
        <ScrollView 
          style={styles.mainScrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContainer}
        >
          {/* Current Weather section */}
          <View style={styles.forecastContainer}>
              {/* Location section */}
              <Text style={styles.locationName}>
                {currentLocation?.name || "Select a city"}
                {currentLocation?.name && currentLocation?.country && ", "}
                <Text style={styles.countryName}> 
                  {currentLocation?.country || ""}
                </Text>
              </Text>
              {/* Weather image section */}
              <View style={styles.weatherImageContainer}>
                <Image 
                  source={
                    current?.weathercode 
                      ? getWeatherImage(getWeatherCondition(current.weathercode).image)
                      : getWeatherImage('sun')
                  } 
                  style={styles.weatherImage}
                />
              </View>
              {/* Temperature section */}
              <View style={styles.temperatureContainer}>
                  <Text style={styles.temperature}>
                      {current?.temperature_2m !== undefined && current?.temperature_2m !== null ? `${Math.round(current.temperature_2m)}` : ''}
                      {(current?.temperature_2m !== undefined && current?.temperature_2m !== null) && <Text>&#176;C</Text>}
                  </Text>
                  <Text style={styles.weatherDescription}>
                      {current?.weathercode !== undefined ? getWeatherCondition(current.weathercode).condition : ''}
                  </Text>
                  {(current?.apparent_temperature !== undefined && current?.apparent_temperature !== null) && (
                    <Text style={styles.feelsLike}>
                      Feels like {Math.round(current.apparent_temperature)}&#176;C
                    </Text>
                  )}
              </View>
              {/* Other statistics/details */}
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Image
                      source={require('../assets/images/wind.png')}
                      style={styles.statIcon} 
                      />
                  <Text style={styles.statText}> 
                      {current?.windspeed_10m !== undefined && current?.windspeed_10m !== null ? `${Math.round(current.windspeed_10m)} km/h` : '--'}
                      </Text>
                </View>
                  <View style={styles.statItem}>
                  <Image
                      source={require('../assets/images/drop.png')}
                      style={styles.statIcon} 
                      />
                  <Text style={styles.statText}> 
                      {current?.relativehumidity_2m !== undefined && current?.relativehumidity_2m !== null ? `${current.relativehumidity_2m}%` : '--'}
                      </Text>
                </View>
                  <View style={styles.statItem}>
                  {(() => {
                    const todaySunrise = daily?.sunrise?.[0];
                    const todaySunset = daily?.sunset?.[0];
                    
                    if (!todaySunrise || !todaySunset) {
                      return (
                        <>
                          <Image source={require('../assets/images/sun.png')} style={styles.statIcon} />
                          <Text style={styles.statText}>--</Text>
                        </>
                      );
                    }
                    
                    // The API returns ISO datetime strings with the local timezone
                    const sunriseDate = new Date(todaySunrise);
                    const sunsetDate = new Date(todaySunset);
                    
                    // For determining morning vs afternoon, use the current time from the weather data
                    // which is also in the city's timezone, or fall back to local time
                    let currentHour;
                    if (current?.time) {
                      // Use the current time from weather data (city's timezone)
                      const weatherCurrentTime = new Date(current.time);
                      currentHour = weatherCurrentTime.getHours();
                    } else {
                      // Fallback to local device time
                      currentHour = new Date().getHours();
                    }
                    
                    // Show sunrise in morning (before 12 PM) and sunset in afternoon/evening (after 12 PM)
                    const isAfterNoon = currentHour >= 12;
                    
                    if (isAfterNoon) {
                      // Show sunset time in afternoon/evening
                      const sunsetTime = sunsetDate.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      });
                      return (
                        <>
                          <Image source={require('../assets/images/sunset.png')} style={styles.statIcon} />
                          <Text style={styles.statText}>{sunsetTime}</Text>
                        </>
                      );
                    } else {
                      // Show sunrise time in morning
                      const sunriseTime = sunriseDate.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      });
                      return (
                        <>
                          <Image source={require('../assets/images/sunrise.png')} style={styles.statIcon} />
                          <Text style={styles.statText}>{sunriseTime}</Text>
                        </>
                      );
                    }
                  })()}
                </View>
              </View>

              {/* Weather Details Card */}
              <View style={styles.weatherDetailsCard}>
                <Text style={styles.weatherDetailsTitle}>Today's Details</Text>
                <View style={styles.weatherDetailsGrid}>
                  {/* UV Index */}
                  <View style={styles.weatherDetailItem}>
                    <View style={styles.weatherDetailHeader}>
                      <SunIcon size="20" color="#f59e0b" />
                      <Text style={styles.weatherDetailLabel}>UV Index</Text>
                    </View>
                    <Text style={styles.weatherDetailValue}>
                      {current?.uv_index !== undefined && current?.uv_index !== null ? Math.round(current.uv_index) : '--'}
                    </Text>
                    <Text style={[styles.weatherDetailSubtext, { color: getUVIndexInfo(current?.uv_index).color }]}>
                      {getUVIndexInfo(current?.uv_index).level}
                    </Text>
                  </View>

                  {/* Visibility */}
                  <View style={styles.weatherDetailItem}>
                    <View style={styles.weatherDetailHeader}>
                      <EyeIcon size="20" color="white" />
                      <Text style={styles.weatherDetailLabel}>Visibility</Text>
                    </View>
                    <Text style={styles.weatherDetailValue}>
                      {formatVisibility(current?.visibility)}
                    </Text>
                    <Text style={styles.weatherDetailSubtext}>{getVisibilityDescription(current?.visibility)}</Text>
                  </View>

                  {/* Pressure */}
                  <View style={styles.weatherDetailItem}>
                    <View style={styles.weatherDetailHeader}>
                      <Image
                        source={require('../assets/images/wind.png')}
                        style={[styles.statIcon, { width: 20, height: 20, tintColor: 'white' }]} 
                      />
                      <Text style={styles.weatherDetailLabel}>Pressure</Text>
                    </View>
                    <Text style={styles.weatherDetailValue}>
                      {formatPressure(current?.pressure_msl)}
                    </Text>
                    <Text style={styles.weatherDetailSubtext}>Sea level</Text>
                  </View>

                  {/* Precipitation */}
                  <View style={styles.weatherDetailItem}>
                    <View style={styles.weatherDetailHeader}>
                      <Image
                        source={require('../assets/images/heavyrain.png')}
                        style={[styles.statIcon, { width: 20, height: 20, }]} 
                      />
                      <Text style={styles.weatherDetailLabel}>Probability</Text>
                    </View>
                    <Text style={styles.weatherDetailValue}>
                      {hourly?.precipitation_probability?.[0] !== undefined ? `${hourly.precipitation_probability[0]}%` : '--'}
                    </Text>
                    <Text style={styles.weatherDetailSubtext}>Currently</Text>
                  </View>

                  {/* Air Quality (PM2.5) */}
                  <View style={styles.weatherDetailItem}>
                    <View style={styles.weatherDetailHeader}>
                      <Image
                        source={require('../assets/images/wind.png')}
                        style={[styles.statIcon, { width: 20, height: 20, tintColor: '#60a5fa' }]} 
                      />
                      <Text style={styles.weatherDetailLabel}>Air Quality</Text>
                    </View>
                    <Text style={styles.weatherDetailValue}>
                      {formatPM25(airQuality?.pm2_5)}
                    </Text>
                    <Text style={[styles.weatherDetailSubtext, { color: getPM25Color(airQuality?.pm2_5), textAlign: 'center' }]}>
                      {getPM25Description(airQuality?.pm2_5)}
                    </Text>
                  </View>

                  {/* Dust */}
                  <View style={styles.weatherDetailItem}>
                    <View style={styles.weatherDetailHeader}>
                      <Image
                        source={require('../assets/images/mist.png')}
                        style={[styles.statIcon, { width: 20, height: 20, tintColor: '#d97706' }]} 
                      />
                      <Text style={styles.weatherDetailLabel}>Dust</Text>
                    </View>
                    <Text style={styles.weatherDetailValue}>
                      {formatDust(airQuality?.dust)}
                    </Text>
                    <Text style={styles.weatherDetailSubtext}>{getDustDescription(airQuality?.dust)}</Text>
                  </View>
                </View>
              </View>

              {/* Hourly Forecast section */}
              <View style={styles.hourlyForecastInline}>
                  <View style={styles.forecastHeader}>
                      <CalendarDaysIcon size="22" color="white" />
                      <Text style={styles.forecastHeaderText}> Hourly forecast</Text>
                      <TouchableOpacity 
                        style={styles.seeMoreButton}
                        onPress={() => navigation.navigate('HourlyForecast', {
                          hourlyData: fullHourlyData,
                          locationName: currentLocation?.name ? `${currentLocation.name}${currentLocation.country ? `, ${currentLocation.country}` : ''}` : 'Unknown Location'
                        })}
                      >
                        <Text style={styles.seeMoreText}>See more</Text>
                      </TouchableOpacity>
                  </View>
                  <ScrollView
                      horizontal
                      contentContainerStyle={styles.scrollViewContent}
                      showsHorizontalScrollIndicator={false}
                  >
                      {hourly?.time && hourly.time.map((time, index) => {
                        const weatherCode = hourly.weathercode?.[index];
                        const temperature = hourly.temperature_2m?.[index];
                        const feelsLike = hourly.apparent_temperature?.[index];

                        return (
                          <View key={index} style={[styles.forecastCard, {backgroundColor: theme.bgWhite(0.15)}]}>
                              <Image
                                  source={
                                    weatherCode
                                      ? getWeatherImage(getWeatherCondition(weatherCode).image)
                                      : getWeatherImage('sun')
                                  }
                                  style={styles.forecastIcon} />
                              <Text style={styles.dayText}>{formatTime(time)}</Text>
                              <Text style={styles.tempText}>
                                {temperature ? `${formatTemperature(temperature)}` : '--'}
                                {temperature && <Text>&#176;C</Text>}
                              </Text>
                              {feelsLike && (
                                <Text style={styles.feelsLikeHourly}>
                                  Feels {formatTemperature(feelsLike)}&#176;C
                                </Text>
                              )}
                          </View>
                        );
                      })}
                  </ScrollView>
              </View>
          </View>

          {/* Daily Forecast section */}
          <View style={styles.dailyForecastContainer}>
              <View style={styles.forecastHeader}>
                  <CalendarDaysIcon size="22" color="white" />
                  <Text style={styles.forecastHeaderText}> Daily forecast</Text>
              </View>
              <ScrollView
                  horizontal
                  contentContainerStyle={styles.scrollViewContent}
                  showsHorizontalScrollIndicator={false}
              >
                  {daily?.time && daily.time.map((day, index) => {
                    const weatherCode = daily.weathercode?.[index];
                    const maxTemp = daily.temperature_2m_max?.[index];
                    const minTemp = daily.temperature_2m_min?.[index];
                    
                    console.log(`Day ${index}:`, day, 'Formatted:', getDayName(day));
                    
                    return (
                      <View key={index} style={[styles.forecastCard, {backgroundColor: theme.bgWhite(0.15)}]}>
                          <Image
                              source={
                                weatherCode 
                                  ? getWeatherImage(getWeatherCondition(weatherCode).image)
                                  : getWeatherImage('sun')
                              }
                              style={styles.forecastIcon} />
                          <Text style={styles.dayText}>{getDayName(day)}</Text>
                          <Text style={styles.tempText}>
                            {maxTemp ? `${formatTemperature(maxTemp)}` : '--'}
                            {maxTemp && <Text>&#176;C</Text>}
                          </Text>
                          {minTemp && (
                            <Text style={styles.minTempText}>
                              {formatTemperature(minTemp)}<Text>&#176;C</Text>
                            </Text>
                          )}
                      </View>
                    );
                  })}
              </ScrollView>
          </View>
        </ScrollView>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
  },
  mainScrollView: {
    flex: 1,
  },
  scrollViewContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  searchContainer: {
    height: 70,
    marginHorizontal: 16,
    marginTop: 20,
    position: 'relative',
    zIndex: 50,
  },
  searchBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderRadius: 25,
  },
  searchActions: {
    flexDirection: 'row',
    gap: 8,
  },
  textInput: {
    paddingLeft: 24,
    height: 40,
    paddingBottom: 4,
    flex: 1,
    fontSize: 16,
    color: 'white',
  },
  locationButton: {
    borderRadius: 25,
    padding: 12,
    margin: 4,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButton: {
    borderRadius: 25,
    padding: 12,
    margin: 4,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchResults: {
    position: 'absolute',
    width: '100%',
    backgroundColor: '#d1d5db',
    top: 64,
    borderRadius: 24,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  locationItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#9ca3af',
  },
  locationText: {
    color: 'black',
    marginLeft: 8,
    fontSize: 18,
  },
  // Forecast section styles
  forecastContainer: {
    marginHorizontal: 16,
    justifyContent: 'space-around',
    marginBottom: 10,
    paddingTop: 10,
    paddingBottom: 20,
  },
  locationName: {
    color: 'white',
    textAlign: 'center',
    fontSize: 28,
    fontWeight: 'bold',
  },
  countryName: {
    fontSize: 28,
    fontWeight: '600',
    color: '#c7caceff',
  },
  weatherImageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  weatherImage: {
    width: 208,
    height: 208,
    marginVertical: 20,
  },
  temperatureContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  temperature: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'white',
    fontSize: 60,
    marginLeft: 20,
  },
  weatherDescription: {
    textAlign: 'center',
    color: 'white',
    fontSize: 24,
    letterSpacing: 2,
    marginTop: 8,
    fontWeight: '600',
  },
  feelsLike: {
    textAlign: 'center',
    color: '#8f96a4ff',
    fontSize: 20,
    marginTop: 20,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    height: 24,
    width: 24,
    marginRight: 8,
  },
  statText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  forecastHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  forecastHeaderText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
    flex: 1,
  },
  seeMoreButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    marginLeft: 4,
  },
  seeMoreText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
  },
  scrollViewContent: {
    paddingHorizontal: 15,
  },
  forecastCard: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 110,
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 8,
    marginRight: 16,
  },
  forecastIcon: {
    height: 44, 
    width: 44,  
    marginBottom: 4,
  },
  dayText: {
    color: 'white',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  tempText: {
    color: 'white',
    fontSize: 20, 
    fontWeight: '600', 
  },
  minTempText: {
    color: '#9ca3af',
    fontSize: 18,
    fontWeight: '500',
    marginTop: 2,
  },
  feelsLikeHourly: {
    color: '#9ca3af',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
  },

  // Hourly Forecast section styles
  hourlyForecastContainer: {
    marginBottom: 30,
    marginHorizontal: 16,
  },
  hourlyForecastInline: {
    marginTop: 30,
    marginBottom: 8,
  },
  // Daily Forecast section styles
  dailyForecastContainer: {
    marginHorizontal: 16,
  },
  // Weather Details Card styles
  weatherDetailsCard: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 20,
  },
  weatherDetailsTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  weatherDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  weatherDetailItem: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  weatherDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  weatherDetailLabel: {
    color: '#ffffffff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  weatherDetailValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  weatherDetailSubtext: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
  },
});
