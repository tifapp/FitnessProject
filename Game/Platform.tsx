import React from "react"
import { StyleSheet, View } from "react-native"
import { Position } from "./Types"

export type PlatformType = {
  x: number,
  y: number,
  id: number,
}

export const Platform = ({ position }: {position: Position}) => {
  return (
    <View style={[styles.platform, { left: position.x, top: position.y }]} />
  )
}

export const INITIAL_PLATFORM_COUNT = 10
export const PLATFORM_SPACING = 100

export const initializePlatforms = (width: number, height: number) => {
  const initialPlatforms: PlatformType[] = []
  for (let i = 0; i < INITIAL_PLATFORM_COUNT; i++) {
    initialPlatforms.push({
      x: Math.random() * (width - PLATFORM_SPACING),
      y: i * (height / 10),
      id: i
    })
  }
  return initialPlatforms
}

const styles = StyleSheet.create({
  platform: {
    width: 100,
    height: 20,
    backgroundColor: "green",
    position: "absolute"
  }
})
