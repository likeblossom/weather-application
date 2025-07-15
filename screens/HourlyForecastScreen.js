import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { theme } from '../theme';
import { getWeatherCondition, formatTemperature, formatTime } from '../api/weather';
import { getWeatherImage } from '../constants';

export default function HourlyForecastScreen({ route, navigation }) {
  const { hourlyData, locationName } = route.params;

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/images/bg.png')} 
        blurRadius={70}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <ChevronLeftIcon size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Text style={styles.titleText}>24-Hour Forecast</Text>
            <Text style={styles.locationText}>{locationName}</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        {/* Hourly Forecast List */}
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {hourlyData?.time && hourlyData.time.map((time, index) => {
            const weatherCode = hourlyData.weathercode?.[index];
            const temperature = hourlyData.temperature_2m?.[index];
            const feelsLike = hourlyData.apparent_temperature?.[index];
            const rainChance = hourlyData.precipitation_probability?.[index];
            const windSpeed = hourlyData.windspeed_10m?.[index];

            return (
              <View key={index} style={[styles.hourlyCard, {backgroundColor: theme.bgWhite(0.15)}]}>
                <View style={styles.timeSection}>
                  <Text style={styles.timeText}>{formatTime(time)}</Text>
                </View>
                
                <View style={styles.weatherSection}>
                  <View style={styles.weatherColumn}>
                    <Image
                      source={
                        weatherCode
                          ? getWeatherImage(getWeatherCondition(weatherCode).image)
                          : getWeatherImage('sun')
                      }
                      style={styles.weatherIcon}
                    />
                    <Text style={styles.conditionText}>
                      {weatherCode ? getWeatherCondition(weatherCode).condition : 'Clear'}
                    </Text>
                  </View>
                </View>

                <View style={styles.temperatureSection}>
                  <Text style={styles.tempText}>
                    {temperature ? `${formatTemperature(temperature)}°C` : '--'}
                  </Text>
                  {feelsLike && (
                    <Text style={styles.feelsLikeText}>
                      Feels {formatTemperature(feelsLike)}°C
                    </Text>
                  )}
                </View>

                <View style={styles.detailsSection}>
                  <View style={styles.detailsContainer}>
                    <View style={styles.detailItem}>
                      <Image source={require('../assets/images/drizzle.png')} style={styles.detailIcon} />
                      <Text style={styles.detailText}>{rainChance !== undefined ? `${rainChance}%` : '--'}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Image source={require('../assets/images/wind.png')} style={styles.detailIcon} />
                      <Text style={styles.detailText}>{windSpeed ? `${Math.round(windSpeed)} km/h` : '--'}</Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  titleText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  locationText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  hourlyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  timeSection: {
    width: 70,
  },
  timeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  weatherSection: {
    alignItems: 'center',
    width: 100,
    marginLeft: 0,
  },
  weatherColumn: {
    alignItems: 'center',
  },
  weatherIcon: {
    width: 32,
    height: 32,
    marginBottom: 6,
  },
  weatherInfo: {
    flex: 1,
  },
  conditionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    flexWrap: 'wrap',
    width: 90,
  },
  temperatureSection: {
    alignItems: 'flex-end',
    marginRight: 8,
    marginLeft: 4
  },
  tempText: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 6,
    marginLeft: 6,
  },
  feelsLikeText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginTop: 6,
    marginLeft: 6,
    fontWeight: '500',
  },
  detailsSection: {
    alignItems: 'flex-start',
    marginLeft: 16,
  },
  detailsContainer: {
    flexDirection: 'column',
    marginTop: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
    marginBottom: 4,
  },
  detailText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
});
