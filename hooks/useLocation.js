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

    // @ts-ignore
    global.location = null;
  } else {
    let location = await Location.getCurrentPositionAsync({ accuracy: 3 });
    // @ts-ignore
    global.location = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  }
}

export default function getLocation(ask = false) {
  // @ts-ignore
  if (global.location == null) {
    locateUser(ask);
  }

  // @ts-ignore
  return global.location;
}
