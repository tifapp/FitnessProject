import { Ionicon, IoniconName } from "@components/common/Icons"
import { ColorString } from "TiFShared/domain-models/ColorString"
import { ReactNode } from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { TiFFormRowButton } from "./Button"
import { TiFFormNamedIconRowView } from "./NamedIconRow"
import { TiFFormRowItemView } from "./RowItem"

type BaseTiFFormNavigationLinkProps = {
  title: string
  description?: string
  onTapped: () => void
  maximumFontScaleFactor?: number
  isDisabled?: boolean
  rightAccessory?: ReactNode
  chevronStyle?: StyleProp<ViewStyle>
  style?: StyleProp<ViewStyle>
}

export type TiFFormNavigationLinkProps = BaseTiFFormNavigationLinkProps &
  (
    | {
        iconName: IoniconName
        iconBackgroundColor: ColorString
      }
    | {
        iconName?: undefined
        iconBackgroundColor?: undefined
      }
  )

export const TiFFormNavigationLinkView = ({
  title,
  description,
  iconName,
  iconBackgroundColor,
  maximumFontScaleFactor: maximumFontSizeMultiplier,
  onTapped,
  isDisabled,
  rightAccessory,
  chevronStyle = styles.chevron,
  style
}: TiFFormNavigationLinkProps) => (
  <TiFFormRowButton onTapped={onTapped} isDisabled={isDisabled} style={style}>
    {iconName ? (
      <TiFFormNamedIconRowView
        iconName={iconName}
        iconBackgroundColor={iconBackgroundColor}
        name={title}
        maximumFontScaleFactor={maximumFontSizeMultiplier}
        description={description}
      >
        <View style={styles.accessoryRow}>
          {rightAccessory}
          <Ionicon
            name="chevron-forward"
            maximumFontScaleFactor={maximumFontSizeMultiplier}
            style={chevronStyle}
          />
        </View>
      </TiFFormNamedIconRowView>
    ) : (
      <TiFFormRowItemView
        title={title}
        description={description}
        maximumFontScaleFactor={maximumFontSizeMultiplier}
      >
        <View style={styles.accessoryRow}>
          {rightAccessory}
          <Ionicon
            name="chevron-forward"
            maximumFontScaleFactor={maximumFontSizeMultiplier}
            style={chevronStyle}
          />
        </View>
      </TiFFormRowItemView>
    )}
  </TiFFormRowButton>
)

const styles = StyleSheet.create({
  titleText: {
    flex: 1
  },
  chevron: {
    opacity: 0.15
  },
  accessoryRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
  }
})
