import { AppStyles } from "@lib/AppColorStyle"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { Headline } from "./Text"

const COLORS = [
  AppStyles.blue,
  AppStyles.red,
  AppStyles.green,
  AppStyles.orange
]

export type AvatarProps = {
  name: string
  style?: StyleProp<ViewStyle>
}

export const AvatarView = ({ name, style }: AvatarProps) => (
  <View
    style={[
      style,
      styles.profileFrame,
      { backgroundColor: COLORS[name.length % COLORS.length].toString() }
    ]}
  >
    <Headline>{initials(name)}</Headline>
  </View>
)

const initials = (name: string) => {
  if (name === "") {
    return "?"
  }
  if (name.length === 1) {
    return name.toUpperCase()
  }
  const splitName = name.split(" ")
  if (splitName.length === 1) {
    return `${splitName[0][0]}${splitName[0][splitName[0].length - 1]}`.toUpperCase()
  } else {
    return `${splitName[0][0]}${splitName[splitName.length - 1][0]}`.toUpperCase()
  }
}

const styles = StyleSheet.create({
  profileFrame: {
    flex: 1,
    alignContent: "center",
    borderRadius: 128
  }
})
