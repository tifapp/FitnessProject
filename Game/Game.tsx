import React, { useState } from "react"
import { Dimensions, StyleSheet, TouchableWithoutFeedback, View } from "react-native"
import { PlayerView } from "./Player"
import { Position } from "./Types"

const { width, height } = Dimensions.get("window")

const initialPlayerPosition: Position = { x: width / 2 - 25, y: height - 100 }

const Game = () => {
  const [, setTick] = useState(0)

  const rerender = () => { setTick((tick) => tick + 1) }

  // const [player] = useState(() => new Player(initialPlayerPosition.x, initialPlayerPosition.y, 50, width))

  return (
    <TouchableWithoutFeedback
      onPressIn={(e) => {
        const touchX: number = e.nativeEvent.locationX
        // player.movePlayer(touchX > width / 2)
        rerender()
      }}
    >
      <View style={styles.container}>
        <PlayerView/>
      </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  gameOver: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center"
  },
  gameOverText: {
    color: "white",
    fontSize: 32
  },
  tapToRestartText: {
    color: "gray",
    fontSize: 16,
    marginTop: 10
  },
  score: {
    position: "absolute",
    top: 40,
    left: 20,
    color: "white",
    fontSize: 24,
    fontWeight: "bold"
  }
})

export default Game
