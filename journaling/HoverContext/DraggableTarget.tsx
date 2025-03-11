import { DraggableView } from "@journaling/DraggableView/DraggableView"
import { usePanGesture } from "@journaling/DraggableView/usePanGesture"
import React from "react"
import { Text, ViewProps, ViewStyle } from "react-native"
import { useHoverContext } from "./useHoverContext"

export type DraggableTargetProps = ViewProps & {
  activeStyle?: ViewStyle;
};

export const DraggableTarget = ({
  activeStyle,
  style,
  ...props
}: DraggableTargetProps) => {
  const localDraggable = usePanGesture()
  const { hoverGesture } = useHoverContext()

  return (
    <DraggableView
      draggable={{
        ...localDraggable,
        panGesture: localDraggable.panGesture.simultaneousWithExternalGesture(hoverGesture)
      }}
      style={[style, localDraggable.isPanning === true && activeStyle]}
      {...props}
    >
      <Text>Drag me!</Text>
    </DraggableView>
  )
}
