import { ResizeMode, Video } from "expo-av"
import React from "react"
import { StyleSheet, View } from "react-native"

export const PlayerView = () => {
  return (
    <View style={styles.container}>
      <Video
        source={require("./climb.mp4")} // Adjust the path as necessary
        style={styles.player}
        resizeMode={ResizeMode.COVER}
        isLooping
        shouldPlay
        isMuted={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  player: {
    width: 300,
    height: 300
  }
})
