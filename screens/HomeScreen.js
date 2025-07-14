import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect } from 'react';
import { Image, TextInput, TouchableOpacity, View, StyleSheet, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalendarDaysIcon, MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import { theme } from '../theme';
import { MapPinIcon } from 'react-native-heroicons/solid';
import {debounce} from 'lodash';
import { fetchLocations, fetchWeatherForecast, getWeatherCondition, getDayName, formatTemperature } from '../api/weather';
import { getWeatherImage } from '../constants';
import { saveLastCity, loadLastCity } from '../storage/asyncStorage';

export default function HomeScreen() {

  const [showSearch, toggleSearch] = React.useState(false);
  const [locations, setLocations] = React.useState([]);
  const [weather, setWeather] = React.useState({});
  const [currentLocation, setCurrentLocation] = React.useState(null);

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
      setWeather(data);
      console.log('Got forecast:', data);
      console.log('Daily data:', data?.daily);
      console.log('Daily time array:', data?.daily?.time);
      console.log('Weather code:', data?.current?.weathercode);
      console.log('Weather condition:', data?.current?.weathercode ? getWeatherCondition(data.current.weathercode) : 'No weather code');
    });
  }

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
  const {current, daily} = weather;

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
                onChangeText={handleTextDebounce}
                placeholder="Search city"
                placeholderTextColor={'lightgrey'}
                style={styles.textInput}
              />
            ) : null}

            <TouchableOpacity
              onPress={() => toggleSearch(!showSearch)}
              style={[styles.searchButton, {backgroundColor: theme.bgWhite(0.3)}]}
            >
              <MagnifyingGlassIcon size="25" color="white" />
            </TouchableOpacity>
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
        {/* Forecast section */}
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
                    {current?.temperature_2m ? `${Math.round(current.temperature_2m)}` : ''}
                    {current?.temperature_2m && <Text>&#176;C</Text>}
                </Text>
                <Text style={styles.weatherDescription}>
                    {current?.weathercode !== undefined ? getWeatherCondition(current.weathercode).condition : ''}
                </Text>
                {current?.apparent_temperature && (
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
                    {current?.windspeed_10m ? `${Math.round(current.windspeed_10m)} km/h` : '--'}
                    </Text>
              </View>
                <View style={styles.statItem}>
                <Image
                    source={require('../assets/images/drop.png')}
                    style={styles.statIcon} 
                    />
                <Text style={styles.statText}> 
                    {current?.relativehumidity_2m ? `${current.relativehumidity_2m}%` : '--'}
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
  searchContainer: {
    height: '7%',
    marginHorizontal: 16,
    position: 'relative',
    zIndex: 50,
  },
  searchBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderRadius: 25,
  },
  textInput: {
    paddingLeft: 24,
    height: 40,
    paddingBottom: 4,
    flex: 1,
    fontSize: 16,
    color: 'white',
  },
  searchButton: {
    borderRadius: 25,
    padding: 12,
    margin: 4,
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
    flex: 1,
    justifyContent: 'space-around',
    marginBottom: 8,
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
  },
  temperatureContainer: {
    alignItems: 'center',
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
  // Daily Forecast section styles
  dailyForecastContainer: {
    marginBottom: 8,
  },
  forecastHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  forecastHeaderText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
  },
  scrollViewContent: {
    paddingHorizontal: 15,
  },
  forecastCard: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 96,
    borderRadius: 24,
    paddingVertical: 12,
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
});
