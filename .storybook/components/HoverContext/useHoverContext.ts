import { useContext, useEffect, useRef } from "react"
import { LayoutChangeEvent } from "react-native"
import { PanGesture } from "react-native-gesture-handler"
import { useSharedValue } from "react-native-reanimated"
import { uuidString } from "TiFShared/lib/UUID"
import { HoverContext } from "./HoverContext"
import { Measurements, Target } from "./types"

type DragState = {
  hoverGesture: PanGesture
  isHovering: boolean
  isSelecting: boolean
  onLayout: (event: LayoutChangeEvent) => void
  onAnimatedLayoutChange: (layout: Partial<Measurements>) => void
}

export const DEFAULT_MEASUREMENT = {
  x: 0,
  y: 0,
  width: 0,
  height: 0
}

export const useHoverContext = (): DragState => {
  const {
    registerTarget,
    unregisterTarget,
    hoveredTargets,
    hoverGesture,
    isHovering
  } = useContext(HoverContext)

  const targetId = useRef<string>(uuidString())

  const isSelecting = hoveredTargets.some(
    (target) => target.id === targetId.current
  )

  const measurements = useSharedValue<Measurements>(DEFAULT_MEASUREMENT)

  const target: Target = {
    id: targetId.current,
    measurements
  }

  const onLayout = (event: LayoutChangeEvent) => {
    measurements.value = event.nativeEvent.layout
  }

  const onAnimatedLayoutChange = (layout: Partial<Measurements>) => {
    "worklet"
    console.log("new layout is ", layout)
    measurements.value = {
      ...layout,
      ...measurements.value
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
    isHovering,
    hoverGesture,
    isSelecting
  }
}
