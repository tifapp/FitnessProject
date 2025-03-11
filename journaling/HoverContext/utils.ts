import { SharedValue } from "react-native-reanimated"
import type { Measurements, Point } from "./types"

export const isPointInTarget = (
  point: Point,
  measurements: Measurements,
  radius: number = 0
): boolean => {
  "worklet"
  const minX = measurements.x - radius
  const maxX = measurements.x + measurements.width + radius
  const minY = measurements.y - radius
  const maxY = measurements.y + measurements.height + radius

  return (
    point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY
  )
}

export const upsert = <T extends { id: string | number }>(
  array: T[],
  item: T
): T[] => {
  const index = array.findIndex((existing) => existing.id === item.id)
  if (index >= 0) {
    const newArray = [...array]
    newArray[index] = item
    return newArray
  }
  return [...array, item]
}

export const remove = <T extends { id: string | number }>(
  array: T[],
  id: string | number
): T[] => {
  return array.filter((target) => target.id !== id)
}

export const areSetsEqual = (a: Set<string>, b: Set<string>) => {
  "worklet"
  return a.size === b.size && a.size === new Set([...a, ...b]).size
}

export const areArraysEqual = (a: { id: string }[], b: { id: string }[]) => {
  "worklet"
  const setA = new Set(a.map((target) => target.id))
  const setB = new Set<string>(b.map((target) => target.id))
  return areSetsEqual(setA, setB)
}

/**
 * Checks if two measurement regions overlap
 * Similar to collision detection between two rectangles
 *
 * @param a First measurement region
 * @param b Second measurement region
 * @param margin Optional margin to add around the regions (default: 0)
 * @returns boolean indicating if the regions overlap
 */
export const doMeasurementsOverlap = (
  a: Measurements,
  b: Measurements,
  margin: number = 0
): boolean => {
  "worklet"

  // Add margin to measurements
  const aWithMargin = {
    x: a.x - margin,
    y: a.y - margin,
    width: a.width + margin * 2,
    height: a.height + margin * 2
  }

  const bWithMargin = {
    x: b.x - margin,
    y: b.y - margin,
    width: b.width + margin * 2,
    height: b.height + margin * 2
  }

  // Check if one rectangle is to the left of the other
  if (
    aWithMargin.x + aWithMargin.width < bWithMargin.x ||
    bWithMargin.x + bWithMargin.width < aWithMargin.x
  ) {
    return false
  }

  // Check if one rectangle is above the other
  if (
    aWithMargin.y + aWithMargin.height < bWithMargin.y ||
    bWithMargin.y + bWithMargin.height < aWithMargin.y
  ) {
    return false
  }

  // If neither of the above conditions is true, the rectangles overlap
  return true
}

/**
 * Checks if two measurement regions overlap, handling SharedValue measurements
 *
 * @param a First measurement region (SharedValue)
 * @param b Second measurement region (SharedValue)
 * @param margin Optional margin to add around the regions (default: 0)
 * @returns boolean indicating if the regions overlap
 */
export const doSharedMeasurementsOverlap = (
  a: SharedValue<Measurements>,
  b: SharedValue<Measurements>,
  margin: number = 0
): boolean => {
  "worklet"
  return doMeasurementsOverlap(a.value, b.value, margin)
}
