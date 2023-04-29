import Toast from "react-native-root-toast"

export namespace ButtonStyles {
  export const darkColor = "#26282A"
  export const opacity = "26" // 15% Opacity
}

export const showToast = (message: string, bottomOffset: number) => {
  Toast.show(message, {
    duration: Toast.durations.SHORT,
    position: Toast.positions.BOTTOM - bottomOffset,
    shadow: true,
    animation: true,
    hideOnPress: true,
    delay: 100,
    textStyle: {fontSize: 16, fontFamily: "OpenSans"},
    textColor: "white",
    backgroundColor: ButtonStyles.darkColor,
    opacity: 1,
    containerStyle: {borderRadius: 12}
  })
}