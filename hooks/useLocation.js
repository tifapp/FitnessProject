import { Alert, Linking } from 'react-native';
import * as Location from 'expo-location';

async function locateUser(ask) {
  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    if (ask) {
      Alert.alert(
        "No Location Permission",
        "Please go to settings and allow the app to use your location to recommend similar users and groups in your area.",
        [
          { text: "cancel", onPress: () => console.log("cancel") },
          { text: "Allow", onPress: () => Linking.openSettings() },
        ],
        { cancelable: false }
      );
    }

    global.location = null;
  } else {
    let location = await Location.getCurrentPositionAsync({ accuracy: 3 });
    global.location = { latitude: location.coords.latitude, longitude: location.coords.longitude };
  }
}

export default function getLocation(ask = false) {
  if (global.location == null) {
    locateUser(ask);
  }

  return global.location;
}