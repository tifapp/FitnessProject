import { Footnote } from "@components/Text"
import { IoniconName } from "@components/common/Icons"
import { AppStyles } from "@lib/AppColorStyle"
import { ColorString } from "TiFShared/domain-models/ColorString"
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { TiFFormCardView } from "./Card"
import { TiFFormNamedIconRowView } from "./NamedIconRow"
import { useTiFFormSectionContext } from "./Section"
import { TiFFormSwitchView } from "./Switch"

export type TiFFormToggleCardProps = {
  isOn: boolean
  onIsOnChange?: (isOn: boolean) => void
  onToggleTappedWithoutIsOnChange?: () => void
  isDisabled?: boolean
  iconName: IoniconName
  iconBackgroundColor: ColorString
  title: string
  description: string
  style?: StyleProp<ViewStyle>
}

export const TiFFormToggleCardView = ({
  iconName,
  iconBackgroundColor,
  title,
  description,
  isOn,
  isDisabled,
  onIsOnChange,
  onToggleTappedWithoutIsOnChange,
  style
}: TiFFormToggleCardProps) => (
  <View style={style}>
    <TiFFormCardView>
      <View style={styles.innerContainer}>
        <TiFFormNamedIconRowView
          iconName={iconName}
          iconBackgroundColor={iconBackgroundColor}
          name={title}
        >
          <Pressable
            onPress={
              !useTiFFormSectionContext().isDisabled
                ? onToggleTappedWithoutIsOnChange
                : undefined
            }
          >
            <View
              pointerEvents={onToggleTappedWithoutIsOnChange ? "none" : "auto"}
            >
              <TiFFormSwitchView
                isOn={isOn}
                onIsOnChange={onIsOnChange}
                isDisabled={isDisabled}
              />
            </View>
          </Pressable>
        </TiFFormNamedIconRowView>
        <Footnote style={styles.bottomText}>{description}</Footnote>
      </View>
    </TiFFormCardView>
  </View>
)

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppStyles.cardColor,
    borderRadius: 12
  },
  innerContainer: {
    display: "flex",
    flexDirection: "column"
  },
  bottomText: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    opacity: 0.5
  }
})
