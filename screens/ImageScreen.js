// @ts-nocheck
import React from "react";
import { Image } from "react-native";

const ImageScreen = ({ route, navigation }) => {
  //const { uri } = route.params;
  const { uri } = route.params;
  console.log("testing");

  return (
    <Image
      style={{
        resizeMode: "contain",
        resizeMethod: "scale",
        height: "100%",
        width: "100%",
      }}
      source={uri === "" ? require("../assets/icon.png") : { uri: uri }}
    />
  );
};

export default ImageScreen;
