import { TiFBottomSheet } from "@components/BottomSheet"
import { PrimaryButton } from "@components/Buttons"
import { IoniconCloseButton } from "@components/common/Icons"
import { DurationPickerView } from "@modules/tif-duration-picker"
import { ReactNode, useState } from "react"
import {
  StyleProp,
  StyleSheet,
  TouchableHighlightProps,
  View,
  ViewStyle
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

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
  const [isShowingSheet, setIsShowingSheet] = useState(false)
  const closeButtonHitSlop = 16
  return (
    <>
      <PrimaryButton {...props} onPress={() => setIsShowingSheet(true)} />
      <TiFBottomSheet
        sizing="content-size"
        isPresented={isShowingSheet}
        onDismiss={() => setIsShowingSheet(false)}
        enableContentPanningGesture={false}
        handleStyle="hidden"
      >
        <SafeAreaView edges={["bottom"]} style={styles.bottomSheetView}>
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
              onPress={() => setIsShowingSheet(false)}
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
                setIsShowingSheet(false)
                onAddPresetTapped(durationSeconds)
              }}
              style={styles.pickerButton}
            >
              Save Duration
            </PrimaryButton>
          </View>
        </SafeAreaView>
      </TiFBottomSheet>
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
