import { Alert, Linking } from 'react-native';
import * as Location from 'expo-location';

async function locateUser(ask) {
  let { status } = await Location.requestPermissionsAsync();
  if (status !== 'granted') {
    if (ask) {
      Alert.alert(
        "No Location Permission",
        "please goto setting and on notification permission manual",
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