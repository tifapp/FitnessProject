import Toast from "react-native-root-toast"

export namespace AppStyles {
  export const darkColor = "#26282A"
  export const colorOpacity15 = "#26282A26" // 15% Opacity
  export const colorOpacity50 = "#26282A80" // 50% Opacity
  export const colorOpacity35 = "#26282A59" // 35% Opacity
}

export const showToast = (message: string, bottomOffset: number) => {
  Toast.show(message, {
    duration: Toast.durations.SHORT,
    position: Toast.positions.BOTTOM - bottomOffset,
    shadow: false,
    animation: true,
    hideOnPress: true,
    delay: 100,
    textStyle: {
      fontSize: 16,
      fontFamily: "OpenSans",
      textAlignVertical: "center",
      textAlign: "center"
    },
    textColor: "white",
    backgroundColor: AppStyles.darkColor,
    opacity: 1,
    containerStyle: { borderRadius: 12 }
  })
}
