import { useContext, useEffect, useRef, useState } from "react"
import { LayoutChangeEvent } from "react-native"
import {
  runOnJS,
  runOnUI,
  SharedValue,
  useSharedValue
} from "react-native-reanimated"
import { uuidString } from "TiFShared/lib/UUID"
import { Measurements, Target } from "../HoverContext/types"
import { areArraysEqual } from "../HoverContext/utils"
import { CollisionContext } from "./CollisionContext"

type DragState = {
  onLayout: (event: LayoutChangeEvent) => void
  onAnimatedLayoutChange: (layout: Partial<Measurements>) => void
  collidingTargets: Target[]
}

export const DEFAULT_MEASUREMENT = {
  x: 0,
  y: 0,
  width: 0,
  height: 0
}

export const useCollisionContext = (): DragState => {
  const { registerTarget, unregisterTarget, checkCollidingTargets } =
    useContext(CollisionContext)

  const targetId = useRef<string>(uuidString())

  const measurements = useSharedValue<Measurements>(DEFAULT_MEASUREMENT)

  const target: Target = {
    id: targetId.current,
    measurements
  }

  const [collidingTargets, setCollidingTargets] = useState<Target[]>([target])

  const onLayout = (event: LayoutChangeEvent) => {
    measurements.value = event.nativeEvent.layout
    runOnUI((value: SharedValue<Measurements>) => {
      const newCollidingTargets = checkCollidingTargets(value)

      if (!areArraysEqual(collidingTargets, newCollidingTargets)) {
        runOnJS(setCollidingTargets)(newCollidingTargets)
      }
    })(measurements)
  }

  const onAnimatedLayoutChange = (layout: Partial<Measurements>) => {
    "worklet"
    measurements.value = {
      ...measurements.value,
      ...layout
    }

    const newCollidingTargets = checkCollidingTargets(measurements)

    if (!areArraysEqual(collidingTargets, newCollidingTargets)) {
      runOnJS(setCollidingTargets)(newCollidingTargets)
    }
  }

  useEffect(() => {
    registerTarget(target)

    return () => {
      unregisterTarget(targetId.current)
    }
  }, [])

  return {
    onLayout,
    onAnimatedLayoutChange,
    collidingTargets
  }
}
