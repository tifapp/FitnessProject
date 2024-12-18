import { AppStyles } from "@lib/AppColorStyle"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { Headline } from "./Text"

const COLORS = [
  AppStyles.red,
  AppStyles.purple,
  AppStyles.orange,
  AppStyles.green,
  AppStyles.yellow,
  AppStyles.blue
]

export type AvatarProps = {
  name: string
  maximumFontSizeMultiplier?: number
  style?: StyleProp<ViewStyle>
}

export const AvatarView = ({
  name,
  maximumFontSizeMultiplier,
  style
}: AvatarProps) => (
  <View
    style={[
      style,
      styles.profileFrame,
      { backgroundColor: COLORS[name.length % COLORS.length].toString() }
    ]}
  >
    <Headline
      maxFontSizeMultiplier={maximumFontSizeMultiplier}
      style={styles.text}
    >
      {initials(name)}
    </Headline>
  </View>
)

const initials = (name: string) => {
  if (name.length === 1) {
    return name.toUpperCase()
  }
  const splitName = name.split(" ").filter((s) => s.length > 0)
  if (splitName.length === 0) return "?"
  const firstName = splitName[0]
  if (splitName.length === 1) {
    return `${firstName[0]}${firstName[firstName.length - 1]}`.toUpperCase()
  } else {
    return `${firstName[0]}${splitName[splitName.length - 1][0]}`.toUpperCase()
  }
}

const styles = StyleSheet.create({
  profileFrame: {
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
    borderRadius: 32
  },
  text: {
    color: "white"
  }
})
