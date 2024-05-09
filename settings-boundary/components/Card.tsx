import { DividerView } from "@components/Divider"
import { AppStyles } from "@lib/AppColorStyle"
import { StyleProp, ViewStyle, View, StyleSheet } from "react-native"

export type SettingsCardProps = {
  children: JSX.Element | JSX.Element[]
  style?: StyleProp<ViewStyle>
}

export const SettingsCardView = ({ children, style }: SettingsCardProps) => (
  <View style={style}>
    <View style={styles.container}>
      {Array.isArray(children)
        ? children.map((child, i) => (
            <View key={`settings-card-item-${i}`}>
              {i !== 0 && <DividerView style={styles.divider} />}
              {child}
            </View>
          ))
        : children}
    </View>
  </View>
)

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppStyles.eventCardColor,
    overflow: "hidden",
    borderRadius: 12
  },
  divider: {
    marginLeft: 60
  }
})
