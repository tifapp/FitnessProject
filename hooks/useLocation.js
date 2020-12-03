import { Auth } from 'aws-amplify';
import { Alert } from 'react-native';
import { createUser, updateUser, deleteUser } from '../src/graphql/mutations.js'
import { getUser } from '../src/graphql/queries.js'
import { API, graphqlOperation, Storage, Cache } from "aws-amplify";
import * as ImageManipulator from 'expo-image-manipulator';

export default () => {
  const [location, setLocation] = useState(null); //object with latitude and longitude properties
 
  const toggleAddLocation = async () => {
    if (location == null) {
      setLocation({ latitude: -1, longitude: -1 });

      let { status } = await Location.requestPermissionsAsync();
      if (status !== 'granted') {
        setLocation(null);
        Alert.alert(
          "No Notification Permission",
          "please goto setting and on notification permission manual",
          [
            { text: "cancel", onPress: () => console.log("cancel") },
            { text: "Allow", onPress: () => Linking.openSettings() },
          ],
          { cancelable: false }
        );
      }

      let location = await Location.getCurrentPositionAsync({ accuracy: 3 });
      location = { latitude: location.coords.latitude, longitude: location.coords.longitude };
      setLocation(location);
      updateUserLocationAsync(location);
    } else {
      setLocation(null);
    }
  }
}