import { Headline } from "@components/Text"
import { CircularIonicon, IoniconName } from "@components/common/Icons"
import { ColorString } from "TiFShared/domain-models/ColorString"
import { StyleProp, ViewStyle, StyleSheet, View } from "react-native"

export type SettingsNamedIconRowProps = {
  iconName: IoniconName
  iconBackgroundColor: ColorString
  name: string
  children: JSX.Element
  style?: StyleProp<ViewStyle>
}

export const SettingsNamedIconRowView = ({
  iconName,
  iconBackgroundColor,
  name,
  children,
  style
}: SettingsNamedIconRowProps) => (
  <View style={style}>
    <View style={styles.container}>
      <CircularIonicon
        name={iconName}
        backgroundColor={iconBackgroundColor.toString()}
      />
      <Headline style={styles.name}>{name}</Headline>
      {children}
    </View>
  </View>
)

const styles = StyleSheet.create({
  name: {
    flex: 1
  },
  container: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    columnGap: 8
  }
})
