import {
  BottomSheetBackdropProps,
  BottomSheetHandleProps,
  BottomSheetModal,
  BottomSheetModalProvider,
  useBottomSheetModal
} from "@gorhom/bottom-sheet"
import { AppStyles } from "@lib/AppColorStyle"
import { useLastDefinedValue } from "@lib/utils/UseLastDefinedValue"
import React, { useEffect, useRef } from "react"
import {
  ViewStyle,
  Pressable,
  StyleProp,
  StyleSheet,
  Platform,
  Dimensions
} from "react-native"
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
  useSharedValue
} from "react-native-reanimated"
import { FullWindowOverlay } from "react-native-screens"

export const TiFBottomSheetProvider = BottomSheetModalProvider

type BaseTiFBottomSheetProps = {
  sizing: TiFBottomSheetSizing
  overlay?: "on-screen" | "above-screen"
  initialSnapPointIndex?: number
  canSwipeToDismiss?: boolean
  shouldIncludeBackdrop?: boolean
  enableContentPanningGesture?: boolean
  HandleView?: (props: BottomSheetHandleProps) => JSX.Element
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
    | { isTerminallyPresented: boolean; children: JSX.Element }
  )

export const TiFBottomSheet = <Item = boolean,>({
  sizing,
  overlay = "above-screen",
  canSwipeToDismiss = true,
  enableContentPanningGesture = true,
  shouldIncludeBackdrop = true,
  initialSnapPointIndex = 0,
  HandleView,
  onDismiss,
  handleStyle,
  children,
  style,
  ...props
}: TiFBottomSheetProps<Item>) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null)
  const isTerminallyPresented =
    "isTerminallyPresented" in props ? props.isTerminallyPresented : false
  const anchor =
    "isPresented" in props
      ? props.isPresented
      : "isTerminallyPresented" in props
        ? props.isTerminallyPresented
        : props.item
  useEffect(() => {
    if (anchor) {
      bottomSheetRef.current?.present()
    } else {
      bottomSheetRef.current?.dismiss()
    }
  }, [anchor, onDismiss])

  const animatedIndex = useSharedValue(initialSnapPointIndex)

  const bottomSheetHandleStyle =
    handleStyle === "hidden" ? styles.hiddenHandle : handleStyle

  const sizeProp =
    typeof sizing === "object"
      ? { snapPoints: sizing.snapPoints }
      : { enableDynamicSizing: true }

  // NB: When terminally presented, we can use a provider to ensure that `useTiFNavigation` will
  // not dismiss the sheet when navigating.
  const Container = isTerminallyPresented
    ? TiFBottomSheetProvider
    : React.Fragment
  const renderedChildren = useLastDefinedValue(
    typeof children === "function"
      ? typeof anchor !== "boolean" && anchor
        ? children(anchor)
        : undefined
      : children
  )
  return (
    <Container>
      <BottomSheetModal
        ref={bottomSheetRef}
        enablePanDownToClose={canSwipeToDismiss}
        enableContentPanningGesture={enableContentPanningGesture}
        handleStyle={bottomSheetHandleStyle}
        animatedIndex={animatedIndex}
        handleComponent={HandleView}
        onDismiss={onDismiss}
        containerComponent={
          // NB: iOS needs a FullWindowOverlay in order to have the sheet appear above the native
          // stack navigator when presented in a modal.
          overlay === "above-screen" && Platform.OS === "ios"
            ? FullWindowOverlay
            : undefined
        }
        backdropComponent={shouldIncludeBackdrop ? TiFBackdropView : null}
        style={style}
        {...sizeProp}
      >
        <Container>{renderedChildren}</Container>
      </BottomSheetModal>
    </Container>
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
  backdrop: { backgroundColor: AppStyles.primary.withOpacity(0.75).toString() }
})
