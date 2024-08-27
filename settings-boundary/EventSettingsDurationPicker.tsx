import { PrimaryButton } from "@components/Buttons"
import { IoniconCloseButton } from "@components/common/Icons"
import { Headline } from "@components/Text"
import { TextField } from "@components/TextFields"
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet"
import { useFontScale } from "@lib/Fonts"
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
  onAddPresetTapped: (timeInSeconds: number) => void
  timeInSeconds: string
  onChangeTime: (newTime: string) => void
  style?: StyleProp<ViewStyle>
}

/**
 * What will display on the bottom sheet, to allow for a new duration to be selected.
 */
export const DurationPickerView = ({
  onAddPresetTapped,
  timeInSeconds,
  onChangeTime,
  style
}: DurationPickerProps) => {
  return (
    <View style={style}>
      <View style={styles.pickerContainer}>
        <Headline>Time (in seconds)</Headline>
        <TextField
          value={timeInSeconds}
          onChangeText={onChangeTime}
          placeholder="600"
          style={{ padding: 8 }}
        />
        <PrimaryButton
          onPress={() => onAddPresetTapped(parseInt(timeInSeconds))}
          style={styles.pickerButton}
        >
          Save Duration
        </PrimaryButton>
      </View>
    </View>
  )
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
  timeInSeconds,
  onChangeTime,
  ...props
}: DurationPickerButtonProps<Children>) => {
  const sheetRef = useRef<BottomSheetModal>(null)
  const [pickerLayout, setpickerLayout] = useState<LayoutRectangle>()
  const { bottom } = useSafeAreaInsets()
  const paddingForNonSafeAreaScreens = bottom === 0 ? 24 : 0
  const sheetHeight =
    pickerLayout?.height && pickerLayout.height + paddingForNonSafeAreaScreens
  const animatedIndex = useSharedValue(1)
  const closeButtonHitSlop = 24 * useFontScale()
  return (
    <>
      <PrimaryButton {...props} onPress={() => sheetRef.current?.present()} />
      <BottomSheetModal
        ref={sheetRef}
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
          <DurationPickerView
            onAddPresetTapped={onAddPresetTapped}
            timeInSeconds={timeInSeconds}
            onChangeTime={onChangeTime}
            style={[styles.durationPickerSheetStyle, pickerStyle]}
          />
        </SafeAreaView>
      </BottomSheetModal>
    </>
  )
}

const styles = StyleSheet.create({
  pickerContainer: {
    rowGap: 16
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
    paddingBottom: 24
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
