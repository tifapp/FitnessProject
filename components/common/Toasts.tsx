import React, { useEffect, useState } from "react"
import Toast from "react-native-root-toast"
import { AppStyles } from "../../lib/AppColorStyle"
import { StyleSheet, View, Platform, useWindowDimensions } from "react-native"
import { Ionicon } from "./Icons"
import { BodyText } from "@components/Text"

const TOAST_OFFSET = 80

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
    backgroundColor: AppStyles.primaryColor,
    opacity: 1,
    containerStyle: { borderRadius: 12 }
  })
}

export type TextToastProps = {
  isVisible: boolean
  text: string
  offset?: number
  duration?: number
}

/**
 * A toast view that shows simple text.
 */
export const TextToastView = ({
  isVisible,
  text,
  offset = 0,
  duration = 3000
}: TextToastProps) => {
  const [isShowing, setIsShowing] = useState(isVisible)

  useEffect(() => {
    if (isVisible) {
      setIsShowing(true)
      setTimeout(() => setIsShowing(false), duration)
    }
  }, [isVisible, duration])
  return (
    <Toast
      visible={isShowing}
      opacity={1}
      position={Toast.positions.BOTTOM + offset}
      shadow={false}
      animation={true}
      hideOnPress={true}
      containerStyle={[
        styles.toastStyle,
        { width: useWindowDimensions().width - 32 }
      ]}
    >
      <View style={styles.containerStyle}>
        <Ionicon color="white" name="close" />
        <BodyText style={styles.text}>{text}</BodyText>
      </View>
    </Toast>
  )
}

const styles = StyleSheet.create({
  toastStyle: {
    borderRadius: 12,
    backgroundColor: AppStyles.primaryColor
  },
  text: {
    color: "white",
    flex: 1
  },
  containerStyle: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    padding: 8,
    columnGap: 8,
    marginTop: Platform.OS === "ios" ? -4 : 0
  }
})
