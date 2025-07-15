export const weatherImages = {
  'sun': require('../assets/images/sun.png'),
  'partlycloudy': require('../assets/images/partlycloudy.png'),
  'cloud': require('../assets/images/cloud.png'),
  'mist': require('../assets/images/mist.png'),
  'moderaterain': require('../assets/images/moderaterain.png'),
  'heavyrain': require('../assets/images/heavyrain.png'),
  'drizzle': require('../assets/images/drizzle.png'),
  'rain': require('../assets/images/moderaterain.png'),
  'snow': require('../assets/images/snow.png'),
  'thunder': require('../assets/images/thunder.png'),
  'moon': require('../assets/images/moon.png'),
  'cloudymoon': require('../assets/images/cloudymoon.png'),
  'moonrain': require('../assets/images/moonrain.png'),
  'moonthunder': require('../assets/images/moonthunder.png'),
  'foggymoon': require('../assets/images/foggymoon.png'),
  'moonsnow': require('../assets/images/moonsnow.png'),
};

export const getWeatherImage = (imageName) => {
  return weatherImages[imageName] || weatherImages['sun'];
};