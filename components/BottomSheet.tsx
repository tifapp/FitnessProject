import {
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
  useBottomSheetModal
} from "@gorhom/bottom-sheet"
import { AppStyles } from "@lib/AppColorStyle"
import { useLastDefinedValue } from "@lib/utils/UseLastDefinedValue"
import { useEffect, useRef } from "react"
import {
  ViewStyle,
  Pressable,
  StyleProp,
  StyleSheet,
  Dimensions
} from "react-native"
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
  useSharedValue
} from "react-native-reanimated"

export const TiFBottomSheetProvider = BottomSheetModalProvider

type BaseTiFBottomSheetProps = {
  sizing: TiFBottomSheetSizing
  enableContentPanningGesture?: boolean
  onDismiss?: () => void
  handleStyle?: StyleProp<ViewStyle> | "hidden"
  style?: StyleProp<ViewStyle>
}

export type TiFBottomSheetSizing =
  | {
      snapPoints: (number | string)[] | SharedValue<(string | number)[]>
    }
  | "content-size"

export type TiFBottomSheetProps<Item = boolean> = BaseTiFBottomSheetProps &
  (
    | {
        item?: Item
        children: (item: Item) => JSX.Element
      }
    | { isPresented: boolean; children: JSX.Element }
  )

export const TiFBottomSheet = <Item = boolean,>({
  sizing,
  enableContentPanningGesture = true,
  onDismiss,
  handleStyle,
  children,
  style,
  ...props
}: TiFBottomSheetProps<Item>) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null)
  const anchor = "isPresented" in props ? props.isPresented : props.item
  useEffect(() => {
    if (anchor) {
      bottomSheetRef.current?.present()
    } else {
      bottomSheetRef.current?.dismiss()
    }
  }, [anchor, onDismiss])
  const animatedIndex = useSharedValue(0)
  const bottomSheetHandleStyle =
    handleStyle === "hidden" ? styles.hiddenHandle : handleStyle
  const sizeProp =
    typeof sizing === "object"
      ? { snapPoints: sizing.snapPoints }
      : { enableDynamicSizing: true }
  const renderedChildren = useLastDefinedValue(
    typeof children === "function"
      ? typeof anchor !== "boolean" && anchor
        ? children(anchor)
        : undefined
      : children
  )
  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      enableContentPanningGesture={enableContentPanningGesture}
      handleStyle={bottomSheetHandleStyle}
      animatedIndex={animatedIndex}
      onDismiss={onDismiss}
      backdropComponent={TiFBackdropView}
      {...sizeProp}
    >
      <BottomSheetView style={style}>{renderedChildren}</BottomSheetView>
    </BottomSheetModal>
  )
}

const TiFBackdropView = ({
  animatedPosition,
  style
}: BottomSheetBackdropProps) => {
  const modal = useBottomSheetModal()
  const windowHeight = Dimensions.get("window").height
  const animatedBackdropStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animatedPosition.value,
      [0, windowHeight],
      [1, 0],
      Extrapolation.CLAMP
    )
    return { opacity }
  })
  return (
    <Pressable
      style={[style, StyleSheet.absoluteFillObject]}
      onPress={() => modal.dismiss()}
    >
      <Animated.View style={[style, styles.backdrop, animatedBackdropStyle]} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  hiddenHandle: {
    opacity: 0
  },
  backdrop: { backgroundColor: AppStyles.black.withOpacity(0.75).toString() }
})
