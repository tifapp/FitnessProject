import { MaterialIcons } from "@expo/vector-icons";
import React, { ComponentProps } from "react";
import { StyleProp, Text, TextStyle, ViewStyle } from "react-native";

interface Props {
  onPress: () => void,
  iconName: ComponentProps<typeof MaterialIcons>['name'],
  color?: string,
  style?: StyleProp<ViewStyle>,
  label?: string,
  size?: number,
  margin?: number,
  isLabelFirst?: boolean,
  textStyle?: StyleProp<TextStyle>,
}

const checkInternetConnection = () => { //maybe check if websocket is connected or disconnected?
  NetInfo.fetch().then((state) => setOnlineCheck(state.isConnected));
};

export default function DisplayInternetConnection() {
  const [onlineCheck, setOnlineCheck] = useState(true);
  console.log(onlineCheck);
  if (!onlineCheck) {
    return (
      <View style={styles.offlineContainer}>
        <Text style={styles.offlineText}>Not Connected to the Internet</Text>
      </View>
    );
  }
  return null;
};