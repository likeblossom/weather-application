import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_CITY_KEY = '@weather_app:last_city';

export const saveLastCity = async (location) => {
  try {
    await AsyncStorage.setItem(LAST_CITY_KEY, JSON.stringify(location));
    console.log('Saved last searched city:', location.name);
  } catch (error) {
    console.log('Error saving last city:', error);
  }
};

export const loadLastCity = async () => {
  try {
    const savedCity = await AsyncStorage.getItem(LAST_CITY_KEY);
    if (savedCity) {
      const cityData = JSON.parse(savedCity);
      console.log('Loading last searched city:', cityData);
      return cityData;
    }
    return null;
  } catch (error) {
    console.log('Error loading last city:', error);
    return null;
  }
};

export const clearLastCity = async () => {
  try {
    await AsyncStorage.removeItem(LAST_CITY_KEY);
    console.log('Cleared last searched city');
  } catch (error) {
    console.log('Error clearing last city:', error);
  }
};
