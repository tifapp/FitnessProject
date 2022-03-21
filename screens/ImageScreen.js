import React from "react";
import { Image, View } from "react-native";

var styles = require("../styles/stylesheet");

const ImageScreen = ({ route, navigation }) => {
  //const { uri } = route.params;
  const { uri } = route.params;
  console.log("testing");

  return (
    <View>
      <Image
        style={{
          resizeMode: "contain",
          resizeMethod: "scale",
          height: "100%",
          width: "100%",
        }}
        source={uri === "" ? require("../assets/icon.png") : { uri: uri }}
      />
    </View>
  );
};

export default ImageScreen;
