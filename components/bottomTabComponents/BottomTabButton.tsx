import { PrimaryButton } from "@components/common/Buttons"
import { AppStyles } from "@lib/AppColorStyle"
import { ButtonProps, StyleProp, StyleSheet, View, ViewStyle } from "react-native"

const BOTTOM_TAB_HEIGHT = 80

type ButtonTabProps = {
  title: string
  onPress: () => void
  disabled? : boolean
  style?: StyleProp<ViewStyle>
} & ButtonProps

const BottomTabButton = ({title, onPress, disabled, style }: ButtonTabProps) => {
  return (
    <View style={[style, styles.bottomTab]}>
      <PrimaryButton
        title={title}
        style={disabled ? styles.disabledButton : styles.buttonStyle}
        onPress={onPress}
        disabled={disabled}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  bottomTab: {
    flexDirection: "row",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: BOTTOM_TAB_HEIGHT,
    backgroundColor: "white",
    marginHorizontal: 16
  },
  buttonStyle: {
    flex: 1
  },
  disabledButton: {
    flex: 1,
    backgroundColor: AppStyles.colorOpacity50,
    borderWidth: 0
  },
})

export default BottomTabButton
