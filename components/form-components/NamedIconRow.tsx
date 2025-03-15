import { CircularIonicon, IoniconName } from "@components/common/Icons"
import { AppStyles } from "@lib/AppColorStyle"
import { ColorString } from "TiFShared/domain-models/ColorString"
import { ReactNode } from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { TiFFormLabelView } from "./Label"

export type TiFFormNamedIconRowProps = {
  iconName: IoniconName
  iconBackgroundColor: ColorString
  name: ReactNode
  maximumFontScaleFactor?: number
  description?: ReactNode
  children?: JSX.Element
  style?: StyleProp<ViewStyle>
}

export const TiFFormNamedIconRowView = ({
  iconName,
  iconBackgroundColor,
  name,
  description,
  maximumFontScaleFactor: maximumFontSizeMultiplier,
  children,
  style
}: TiFFormNamedIconRowProps) => (
  <View style={style}>
    <View style={styles.container}>
      <CircularIonicon
        style={{ borderWidth: 2, borderColor: AppStyles.colorOpacity10, borderRadius: 128 }}
        color={AppStyles.primaryBlue.toString()}
        size={24}
        name={iconName}
        maximumFontScaleFactor={maximumFontSizeMultiplier}
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
    columnGap: 16
  }
})
