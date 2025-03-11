import { useMemo, useState } from "react"
import { Gesture, PanGesture } from "react-native-gesture-handler"
import { runOnJS, SharedValue, useSharedValue } from "react-native-reanimated"
import { Point } from "../HoverContext/types"

export type Pannable = {
  panGesture: PanGesture
  panPosition: { x: SharedValue<number>; y: SharedValue<number> }
  isPanning: boolean
}

export const usePanGesture = (
  initialPosition?: Point,
  externalGesture?: PanGesture
) => {
  const panX = useSharedValue(initialPosition?.x ?? 0)
  const panY = useSharedValue(initialPosition?.y ?? 0)
  const [isPanning, setIsPanning] = useState(false)

  const startX = useSharedValue(0)
  const startY = useSharedValue(0)

  let panGesture = Gesture.Pan()
    .onBegin(() => {
      "worklet"
      startX.value = panX.value
      startY.value = panY.value
      runOnJS(setIsPanning)(true)
    })
    .onUpdate(({ translationX, translationY }) => {
      "worklet"
      panX.value = startX.value + translationX
      panY.value = startY.value + translationY
    })
    .onEnd(() => {
      "worklet"
      runOnJS(setIsPanning)(false)
    })
    .onFinalize(() => {
      "worklet"
      runOnJS(setIsPanning)(false)
    })

  if (externalGesture) {
    panGesture = panGesture.simultaneousWithExternalGesture(externalGesture)
  }

  return {
    panGesture,
    panPosition: useMemo(() => ({ x: panX, y: panY }), [panX, panY]),
    isPanning
  }
}
