import { PrimaryButton } from "@components/Buttons"
import { IoniconCloseButton } from "@components/common/Icons"
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet"
import { DurationPickerView } from "@modules/tif-duration-picker"
import { ReactNode, useMemo, useRef, useState } from "react"
import {
  LayoutRectangle,
  StyleProp,
  StyleSheet,
  TouchableHighlightProps,
  View,
  ViewStyle
} from "react-native"
import { useSharedValue } from "react-native-reanimated"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

export type DurationPickerProps = {
  onAddPresetTapped: (durationSeconds: number) => void
  durationSeconds: number
  onDurationChange: (durationSeconds: number) => void
  style?: StyleProp<ViewStyle>
}

export type DurationPickerButtonProps<Children extends ReactNode> = Omit<
  TouchableHighlightProps,
  "onPress"
> &
  DurationPickerProps & {
    pickerStyle?: StyleProp<ViewStyle>
    children: Children
  }

/**
 * A button which when pressed will display {@link DurationPickerView}.
 */
export const DurationPickerButton = <Children extends ReactNode>({
  pickerStyle,
  onAddPresetTapped,
  durationSeconds,
  onDurationChange,
  ...props
}: DurationPickerButtonProps<Children>) => {
  const sheetRef = useRef<BottomSheetModal>(null)
  const [pickerLayout, setpickerLayout] = useState<LayoutRectangle>()
  const { bottom } = useSafeAreaInsets()
  const paddingForNonSafeAreaScreens = bottom === 0 ? 24 : 0
  const sheetHeight =
    pickerLayout?.height && pickerLayout.height + paddingForNonSafeAreaScreens
  const animatedIndex = useSharedValue(1)
  const closeButtonHitSlop = 16
  return (
    <>
      <PrimaryButton {...props} onPress={() => sheetRef.current?.present()} />
      <BottomSheetModal
        ref={sheetRef}
        enableContentPanningGesture={false}
        snapPoints={useMemo(() => [sheetHeight ?? "50%"], [sheetHeight])}
        handleStyle={styles.bottomSheetHandle}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={1}
            animatedIndex={animatedIndex}
          />
        )}
      >
        <SafeAreaView
          edges={["bottom"]}
          onLayout={(e) => setpickerLayout(e.nativeEvent.layout)}
          style={styles.bottomSheetView}
        >
          <View style={styles.bottonSheetTopRow}>
            <View style={styles.bottomSheetTopRowSpacer} />
            <IoniconCloseButton
              size={20}
              hitSlop={{
                top: closeButtonHitSlop,
                left: closeButtonHitSlop,
                right: closeButtonHitSlop,
                bottom: closeButtonHitSlop
              }}
              onPress={() => sheetRef.current?.dismiss()}
            />
          </View>
          <View style={[styles.durationPickerSheetStyle, pickerStyle]}>
            <DurationPickerView
              initialDurationSeconds={6000}
              onDurationChange={onDurationChange}
              style={styles.timePicker}
            />
            <PrimaryButton
              onPress={() => {
                sheetRef.current?.dismiss()
                onAddPresetTapped(durationSeconds)
              }}
              style={styles.pickerButton}
            >
              Save Duration
            </PrimaryButton>
          </View>
        </SafeAreaView>
      </BottomSheetModal>
    </>
  )
}

const styles = StyleSheet.create({
  timePicker: {
    width: "100%",
    alignSelf: "center",
    height: 256
  },
  pickerTitle: {
    textAlign: "center"
  },
  pickerDescription: {
    textAlign: "center"
  },
  pickerButton: {
    width: "100%"
  },
  durationPickerSheetStyle: {
    paddingBottom: 24,
    rowGap: 16
  },
  bottomSheetHandle: {
    opacity: 0
  },
  bottomSheetView: {
    rowGap: 16,
    paddingHorizontal: 24
  },
  textButton: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center"
  },
  bottonSheetTopRow: {
    display: "flex",
    flexDirection: "row"
  },
  bottomSheetTopRowSpacer: {
    flex: 1
  },
  placeholderIllustration: {
    backgroundColor: "red",
    height: 200
  }
})
