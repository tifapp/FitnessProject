import { CircularIonicon, IoniconName } from "@components/common/Icons"
import { ColorString } from "TiFShared/domain-models/ColorString"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { TiFFormLabelView } from "./Label"

export type TiFFormNamedIconRowProps = {
  iconName: IoniconName
  iconBackgroundColor: ColorString
  name: string
  description?: string
  children: JSX.Element
  style?: StyleProp<ViewStyle>
}

export const TiFFormNamedIconRowView = ({
  iconName,
  iconBackgroundColor,
  name,
  description,
  children,
  style
}: TiFFormNamedIconRowProps) => (
  <View style={style}>
    <View style={styles.container}>
      <CircularIonicon
        size={24}
        name={iconName}
        backgroundColor={iconBackgroundColor.toString()}
      />
      <TiFFormLabelView
        title={name}
        description={description}
        style={styles.name}
      />
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
    columnGap: 8,
    padding: 16
  }
})
