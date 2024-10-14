import React, { useEffect, useRef, useState } from "react"
import { Dimensions, StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native"
import { INITIAL_PLATFORM_COUNT, initializePlatforms, Platform, PLATFORM_SPACING, PlatformType } from "./Platform"
import { Player } from "./Player"
import { Position } from "./Types"

const { width, height } = Dimensions.get("window")

const initialPlayerPosition: Position = { x: width / 2 - 25, y: height - 100 }

const Game = () => {
  const [score, setScore] = useState<number>(0)
  const [, setTick] = useState(0)

  const rerender = () => { setTick((tick) => tick + 1) }

  const [player] = useState(() => new Player(initialPlayerPosition.x, initialPlayerPosition.y, 50, width))
  const [velocity, setVelocity] = useState<{ x: number; y: number }>({ x: 0, y: -5 })

  const [platforms, setPlatforms] = useState<Array<{ x: number; y: number; id: number }>>([])
  const [gameOver, setGameOver] = useState<boolean>(false)

  const highestPlatformY = useRef<number>(platforms[0]?.y || height - 100)

  const resetGame = (): void => {
    player.reset(initialPlayerPosition.x, initialPlayerPosition.y)
    setPlatforms(initializePlatforms(width, height))
    setVelocity({ x: 0, y: -5 })
    setGameOver(false)
    rerender()
  }
  useEffect(resetGame, [])

  useEffect(() => {
    let animationFrameId: number

    const gameLoop = () => {
      const newY: number = player.getPosition().y + velocity.y

      platforms.forEach((platform) => {
        if (
          player.getPosition().x + 50 > platform.x &&
          player.getPosition().x < platform.x + 100 &&
          player.getPosition().y + 50 > platform.y &&
          player.getPosition().y + 50 < platform.y + 20 &&
          velocity.y > 0
        ) {
          setVelocity((v) => ({ ...v, y: -15 }))
        }
      })

      setVelocity((v) => ({ ...v, y: v.y + 0.5 }))

      if (newY > height) {
        setGameOver(true)
        return
      } else {
        player.reset(player.getPosition().x, newY)
        rerender()
      }

      if (player.getPosition().y < height / 2) {
        setPlatforms((prevPlatforms) =>
          prevPlatforms.map((platform) => ({ ...platform, y: platform.y - velocity.y }))
        )
      }

      // Update highestPlatformY if necessary
      const currentHighest = Math.min(...platforms.map(p => p.y))
      if (currentHighest < highestPlatformY.current) {
        highestPlatformY.current = currentHighest
      }

      // Determine if new platforms need to be generated
      while (highestPlatformY.current > (height / 2) - (PLATFORM_SPACING * INITIAL_PLATFORM_COUNT)) {
        const newPlatformY = highestPlatformY.current - PLATFORM_SPACING
        const newPlatform: PlatformType = {
          id: Date.now(), // Unique ID
          x: Math.random() * (width - 100),
          y: newPlatformY
        }
        setPlatforms(prevPlatforms => [...prevPlatforms, newPlatform])
        highestPlatformY.current = newPlatformY
      }

      setScore(Math.floor(player.getPosition().y))

      // Remove platforms that are below the visible screen
      setPlatforms(prevPlatforms => prevPlatforms.filter(p => p.y < height + 100))

      animationFrameId = requestAnimationFrame(gameLoop)
    }

    animationFrameId = requestAnimationFrame(gameLoop)

    return () => cancelAnimationFrame(animationFrameId)
  }, [velocity, platforms, player])

  if (gameOver) {
    return (
      <TouchableWithoutFeedback onPress={resetGame}>
        <View style={styles.gameOver}>
        <Text style={styles.score}>Score: {-score}</Text>
          <Text style={styles.gameOverText}>Game Over</Text>
          <Text style={styles.tapToRestartText}>Tap to Restart</Text>
        </View>
      </TouchableWithoutFeedback>
    )
  }

  return (
    <TouchableWithoutFeedback
      onPressIn={(e) => {
        const touchX: number = e.nativeEvent.locationX
        player.movePlayer(touchX > width / 2)
        rerender()
      }}
    >
      <View style={styles.container}>
      <Text style={styles.score}>Score: {-score}</Text>
        {player.render()}
        {platforms.map((platform) => (
          <Platform key={platform.id} position={{ x: platform.x, y: platform.y }} />
        ))}
      </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black"
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
