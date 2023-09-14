import React from "react"
import Toast, { ToastContainer } from "react-native-root-toast"
import { AppStyles } from "../../lib/AppColorStyle"
import { StyleSheet, View, useWindowDimensions } from "react-native"
import { Ionicon } from "./Icons"
import { BodyText } from "@components/Text"

const TOAST_OFFSET = 100

export const showToast = (message: string) => {
  Toast.show(message, {
    duration: Toast.durations.SHORT,
    position: Toast.positions.BOTTOM - TOAST_OFFSET,
    shadow: false,
    animation: true,
    hideOnPress: true,
    delay: 100,
    textStyle: { fontSize: 16, fontFamily: "OpenSans" },
    textColor: "white",
    backgroundColor: AppStyles.darkColor,
    opacity: 1,
    containerStyle: { borderRadius: 12 }
  })
}

export type TextToastProps = {
  isVisible: boolean
  text: string
  duration?: number
}

/**
 * A toast view that shows simple text.
 */
export const TextToastView = ({
  isVisible,
  text,
  duration = 3000
}: TextToastProps) => (
  <ToastContainer
    visible={isVisible}
    opacity={1}
    position={Toast.positions.BOTTOM - TOAST_OFFSET}
    shadow={false}
    animation={true}
    hideOnPress={true}
    containerStyle={[
      styles.toastStyle,
      { width: useWindowDimensions().width - 32 }
    ]}
    duration={duration}
  >
    <View style={styles.containerStyle}>
      <Ionicon color="white" name="close" />
      <BodyText style={styles.text}>{text}</BodyText>
    </View>
  </ToastContainer>
)

const styles = StyleSheet.create({
  toastStyle: {
    borderRadius: 12,
    backgroundColor: AppStyles.darkColor
  },
  text: {
    color: "white",
    marginHorizontal: 8
  },
  containerStyle: {
    flexDirection: "row",
    alignItems: "center"
  }
})
