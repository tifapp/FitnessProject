import { CaptionTitle } from "@components/Text"
import { AppStyles } from "@lib/AppColorStyle"
import { useFontScale, FontScaleFactors } from "@lib/Fonts"
import {
  TextProps,
  StyleProp,
  ViewStyle,
  Pressable,
  View,
  StyleSheet
} from "react-native"

export type TiFFormPreviewableOptionProps = {
  name: string
  NameComponent?: (props: TextProps) => JSX.Element
  previewStyle?: StyleProp<ViewStyle>
  isSelected: boolean
  onSelected: () => void
  children?: JSX.Element | JSX.Element[]
  style?: StyleProp<ViewStyle>
}

const DefaultPreviewOptionName = (props: TextProps) => (
  <CaptionTitle {...props} />
)

export const TiFFormPreviewableOptionView = ({
  name,
  NameComponent = DefaultPreviewOptionName,
  previewStyle,
  isSelected,
  onSelected,
  children,
  style
}: TiFFormPreviewableOptionProps) => (
  <View style={style}>
    <Pressable onPress={onSelected} style={styles.previewOptionContainer}>
      <View
        style={[
          previewStyle,
          {
            borderRadius: 12,
            overflow: "hidden",
            borderWidth: isSelected ? 2 : 0
          }
        ]}
      >
        {children}
      </View>
      <View
        style={{
          height:
            32 * useFontScale({ maximumScaleFactor: FontScaleFactors.xxxLarge })
        }}
      >
        <View
          style={{
            borderRadius: 12,
            overflow: "hidden",
            backgroundColor: isSelected ? AppStyles.primaryColor : undefined
          }}
        >
          <NameComponent
            maxFontSizeMultiplier={FontScaleFactors.xxxLarge}
            style={[
              {
                padding: 8,
                color: isSelected ? "white" : AppStyles.primaryColor
              }
            ]}
          >
            {name}
          </NameComponent>
        </View>
      </View>
    </Pressable>
  </View>
)

const styles = StyleSheet.create({
  previewOptionContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    rowGap: 8
  }
})
