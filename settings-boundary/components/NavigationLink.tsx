import { Headline } from "@components/Text"
import { CircularIonicon, Ionicon, IoniconName } from "@components/common/Icons"
import { AppStyles } from "@lib/AppColorStyle"
import { ColorString } from "TiFShared/domain-models/ColorString"
import {
  StyleProp,
  ViewStyle,
  StyleSheet,
  View,
  TouchableHighlight
} from "react-native"

export type SettingsNavigationLinkProps = {
  title: string
  iconName: IoniconName
  iconBackgroundColor: ColorString
  onTapped: () => void
  style?: StyleProp<ViewStyle>
}

export const SettingsNavigationLinkView = ({
  title,
  iconName,
  iconBackgroundColor,
  onTapped,
  style
}: SettingsNavigationLinkProps) => (
  <TouchableHighlight
    underlayColor={AppStyles.colorOpacity15}
    onPress={onTapped}
    style={style}
  >
    <View style={styles.container}>
      <CircularIonicon
        name={iconName}
        backgroundColor={iconBackgroundColor.toString()}
      />
      <Headline style={styles.titleText}>{title}</Headline>
      <Ionicon name="chevron-forward" style={styles.chevron} />
    </View>
  </TouchableHighlight>
)

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    columnGap: 8,
    padding: 16
  },
  titleText: {
    flex: 1
  },
  chevron: {
    opacity: 0.5
  }
})
