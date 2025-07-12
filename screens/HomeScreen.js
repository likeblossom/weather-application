import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Image, TextInput, TouchableOpacity, View, StyleSheet, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalendarDaysIcon, MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import { theme } from '../theme';
import { MapPinIcon } from 'react-native-heroicons/solid';

export default function HomeScreen() {

  const [showSearch, toggleSearch] = React.useState(false);
  const [locations, setLocations] = React.useState([1,2,3]);

  const handleLocation = (location) => {
    console.log("Selected location:", location);
  }

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
                                    <Text style={styles.locationText}> Montreal, Canada</Text>
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
              Montreal,  
            <Text style={styles.countryName}> 
                 Canada
                </Text>
            </Text>
            {/* Weather image section */}
            <View style={styles.weatherImageContainer}>
              <Image 
                source={require('../assets/images/partlycloudy.png')} 
                style={styles.weatherImage}
              />
            </View>
            {/* Temperature section */}
            <View style={styles.temperatureContainer}>
                <Text style={styles.temperature}>
                    25&#176;
                </Text>
                <Text style={styles.weatherDescription}>
                    Partly Cloudy
                </Text>
            </View>
            {/* Other statistics/details */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Image
                    source={require('../assets/images/wind.png')}
                    style={styles.statIcon} 
                    />
                <Text style={styles.statText}> 
                    10 km/h
                    </Text>
              </View>
                <View style={styles.statItem}>
                <Image
                    source={require('../assets/images/drop.png')}
                    style={styles.statIcon} 
                    />
                <Text style={styles.statText}> 
                    23%
                    </Text>
              </View>
                <View style={styles.statItem}>
                <Image
                    source={require('../assets/images/sun.png')}
                    style={styles.statIcon} 
                    />
                <Text style={styles.statText}> 
                    8:52 AM
                    </Text>
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
                <View style={[styles.forecastCard, {backgroundColor: theme.bgWhite(0.15)}]}>
                    <Image
                        source={require('../assets/images/heavyrain.png')}
                        style={styles.forecastIcon} />
                    <Text style={styles.dayText}>Monday</Text>
                    <Text style={styles.tempText}> 20&#176; </Text>
                </View>
                <View style={[styles.forecastCard, {backgroundColor: theme.bgWhite(0.15)}]}>
                    <Image
                        source={require('../assets/images/heavyrain.png')}
                        style={styles.forecastIcon} />
                    <Text style={styles.dayText}>Tuesday</Text>
                    <Text style={styles.tempText}> 20&#176; </Text>
                </View>
                <View style={[styles.forecastCard, {backgroundColor: theme.bgWhite(0.15)}]}>
                    <Image
                        source={require('../assets/images/heavyrain.png')}
                        style={styles.forecastIcon} />
                    <Text style={styles.dayText}>Wednesday</Text>
                    <Text style={styles.tempText}> 20&#176; </Text>
                </View>
                <View style={[styles.forecastCard, {backgroundColor: theme.bgWhite(0.15)}]}>
                    <Image
                        source={require('../assets/images/heavyrain.png')}
                        style={styles.forecastIcon} />
                    <Text style={styles.dayText}>Thursday</Text>
                    <Text style={styles.tempText}> 20&#176; </Text>
                </View>
                <View style={[styles.forecastCard, {backgroundColor: theme.bgWhite(0.15)}]}>
                    <Image
                        source={require('../assets/images/heavyrain.png')}
                        style={styles.forecastIcon} />
                    <Text style={styles.dayText}>Friday</Text>
                    <Text style={styles.tempText}> 20&#176; </Text>
                </View>
                <View style={[styles.forecastCard, {backgroundColor: theme.bgWhite(0.15)}]}>
                    <Image
                        source={require('../assets/images/heavyrain.png')}
                        style={styles.forecastIcon} />
                    <Text style={styles.dayText}>Saturday</Text>
                    <Text style={styles.tempText}> 20&#176; </Text>
                </View>
                <View style={[styles.forecastCard, {backgroundColor: theme.bgWhite(0.15)}]}>
                    <Image
                        source={require('../assets/images/heavyrain.png')}
                        style={styles.forecastIcon} />
                    <Text style={styles.dayText}>Sunday</Text>
                    <Text style={styles.tempText}> 20&#176; </Text>
                </View>
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
    backgroundColor: '#d1d5db', // bg-gray-300
    top: 64, // top-16 (16 * 4 = 64px)
    borderRadius: 24, // rounded-3xl
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
    borderBottomColor: '#9ca3af', // border-b-gray-400
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
    fontSize: 24,
    fontWeight: 'bold',
  },
  countryName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#d1d5db', // text-gray-300
  },
  weatherImageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  weatherImage: {
    width: 208, // w-52 (52 * 4 = 208px)
    height: 208, // h-52
  },
  temperatureContainer: {
    alignItems: 'center',
  },
  temperature: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'white',
    fontSize: 60, // text-6xl
    marginLeft: 20,
  },
  weatherDescription: {
    textAlign: 'center',
    color: 'white',
    fontSize: 20, // text-xl
    letterSpacing: 2, // tracking-widest
    marginTop: 8,
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
    height: 24, // h-6
    width: 24,  // w-6
    marginRight: 8, // space-x-2
  },
  statText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16, // text-base
  },
  // Daily Forecast section styles
  dailyForecastContainer: {
    marginBottom: 8, // mb-2
  },
  forecastHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20, // mx-5
    marginBottom: 12, // space-y-3
  },
  forecastHeaderText: {
    color: 'white',
    fontSize: 16, // text-base
    marginLeft: 8, // space-x-2
  },
  scrollViewContent: {
    paddingHorizontal: 15,
  },
  forecastCard: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 96, // w-24 (24 * 4 = 96px)
    borderRadius: 24, // rounded-3xl
    paddingVertical: 12, // py-3
    marginRight: 16, // mr-4
  },
  forecastIcon: {
    height: 44, // h-11 (11 * 4 = 44px)
    width: 44,  // w-11
    marginBottom: 4, // space-y-1
  },
  dayText: {
    color: 'white',
    marginBottom: 4, // space-y-1
  },
  tempText: {
    color: 'white',
    fontSize: 20, // text-xl
    fontWeight: '600', // font-semibold
  },
});
