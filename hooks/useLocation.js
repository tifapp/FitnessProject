import * as Location from "expo-location";
import { Alert, Linking } from "react-native";

async function locateUser(ask) {
  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
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

    return null;
  } else {
    let location = await Location.getCurrentPositionAsync({ accuracy: 3 });
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  }
}

export default async function getLocationAsync(ask = false, callback) {
  let location;
  // @ts-ignore
  if (global.location == null) {
    try {
      location = await locateUser(ask); // Not sure if this function call will throw an error
      // @ts-ignore
      global.location = location;
    }
    catch (error) {
      callback(null, error);
    }
  }
  callback(location);
}
