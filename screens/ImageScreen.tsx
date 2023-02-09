import { useRoute } from "@react-navigation/native"
import { ImageScreenRouteProps } from "@stacks/MainStack"
import React from "react"
import { Image } from "react-native"

const ImageScreen = () => {
  // const { uri } = route.params;
  const { uri } = useRoute<ImageScreenRouteProps>().params

  return (
    <Image
      style={{
        resizeMode: "contain",
        // resizeMethod: "scale",
        height: "100%",
        width: "100%"
      }}
      source={uri === "" ? require("../assets/icon.png") : { uri }}
    />
  )
}

export default ImageScreen
