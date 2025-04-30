import { useEffect, useState } from "react"
import { PanGesture } from "react-native-gesture-handler"
import { SharedValue } from "react-native-reanimated"
import { usePanGesture } from "../DraggableView/usePanGesture"
import { useHoverContext } from "../HoverContext/useHoverContext"

type DragAndDropOption = {
  isSelecting: boolean
  onLayout: () => void
}

type DragAndDropToken = {
  isPanning: boolean
  panGesture: PanGesture
  panPosition: {
    x: SharedValue<number>
    y: SharedValue<number>
  }
}

type DragAndDrop<T extends readonly string[]> = {
  [K in T[number]]: DragAndDropOption
} & {
  token: DragAndDropToken
}

// make a version that exports an options factory for the infinite game idea
export const useDragAndDrop = <const T extends readonly string[]>(
  options: T,
  onSelect: (id?: string) => void
): DragAndDrop<T> => {
  const { isPanning: isTokenPanning, panPosition, panGesture } = usePanGesture()

  const dragAndDropOptions = options.reduce<
    Partial<{ [K in T[number]]: DragAndDropOption }>
  >((acc, option) => {
    const { onLayout, isSelecting } = useHoverContext()
    const [isTokenSelecting, setIsTokenSelecting] = useState(false)

    useEffect(() => {
      if (isTokenPanning) {
        onSelect()
      }
      if (isTokenPanning) {
        if (isSelecting) {
          setIsTokenSelecting(true)
        } else {
          setIsTokenSelecting(false)
        }
      }
      if (!isTokenPanning) {
        if (isTokenSelecting) {
          onSelect(option)
        }
      }
    }, [isTokenPanning, isSelecting])

    return {
      ...acc,
      [option]: {
        isSelecting,
        onLayout
      } as DragAndDropOption
    }
  }, {})

  return {
    ...dragAndDropOptions,
    token: {
      isPanning: isTokenPanning,
      panGesture,
      panPosition
    }
  } as DragAndDrop<T>
}
