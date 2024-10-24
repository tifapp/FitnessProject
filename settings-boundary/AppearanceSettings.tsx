import {
  StyleProp,
  ViewStyle,
  StyleSheet,
  View,
  Text,
  TextProps,
  TextStyle,
  Platform
} from "react-native"
import { TiFFormScrollView } from "@components/form-components/ScrollView"
import { TiFFormSectionView } from "@components/form-components/Section"
import { TiFFormCardView } from "@components/form-components/Card"
import { useLocalSettings } from "@settings-storage/Hooks"
import { settingsSelector } from "@settings-storage/Settings"
import { BodyText } from "@components/Text"
import { AppStyles } from "@lib/AppColorStyle"
import { FontScaleFactors, useFontScale } from "@lib/Fonts"
import { useOpenWeblink } from "@modules/tif-weblinks"
import { TiFFormPreviewableOptionView } from "@components/form-components/PreviewableOption"
import { isOSMajorVersionAvailable } from "@lib/Platform"

export type AppearanceSettingsProps = {
  style?: StyleProp<ViewStyle>
}

export const AppearanceSettingsView = ({ style }: AppearanceSettingsProps) => (
  <TiFFormScrollView style={style}>
    <ThemeSectionView />
    <FontFamilySectionView />
  </TiFFormScrollView>
)

const ThemeSectionView = () => {
  const { settings, update } = useLocalSettings(
    settingsSelector("userInterfaceStyle")
  )
  return (
    <TiFFormSectionView title="Theme">
      <TiFFormCardView>
        <View style={styles.previewOptionRow}>
          <TiFFormPreviewableOptionView
            name="System"
            isSelected={settings.userInterfaceStyle === "system"}
            onSelected={() => update({ userInterfaceStyle: "system" })}
            previewStyle={styles.userInterfaceStylePreview}
          >
            <View style={styles.systemUserInterfaceStylePreviewDark} />
            <View style={styles.systemUserInterfaceStylePreviewLight} />
          </TiFFormPreviewableOptionView>
          <TiFFormPreviewableOptionView
            name="Dark"
            isSelected={settings.userInterfaceStyle === "dark"}
            onSelected={() => update({ userInterfaceStyle: "dark" })}
            previewStyle={[
              styles.userInterfaceStylePreview,
              styles.darkUserInterfaceStylePreview
            ]}
          />
          <TiFFormPreviewableOptionView
            name="Light"
            isSelected={settings.userInterfaceStyle === "light"}
            onSelected={() => update({ userInterfaceStyle: "light" })}
            previewStyle={[
              styles.userInterfaceStylePreview,
              styles.lightUserInterfaceStylePreview
            ]}
          />
        </View>
      </TiFFormCardView>
    </TiFFormSectionView>
  )
}

const FontFamilySectionView = () => {
  const { settings, update } = useLocalSettings(
    settingsSelector("preferredFontFamily")
  )
  const openWeblink = useOpenWeblink()
  const iOSOpenDyslexicTopMagin =
    -4 *
    useFontScale({
      maximumScaleFactor: FontScaleFactors.xxxLarge
    })
  return (
    <TiFFormSectionView
      title="Font"
      subtitle={
        <BodyText>
          <BodyText style={styles.fontSubtitleBase}>
            Open Dyslexic is a font that aids against common symptoms of
            Dyslexia.{" "}
          </BodyText>
          <BodyText
            style={styles.learnMore}
            suppressHighlighting
            onPress={() => openWeblink("https://opendyslexic.org/about")}
            // TODO: - Open web page.
          >
            Learn More...
          </BodyText>
        </BodyText>
      }
    >
      <TiFFormCardView>
        <View style={styles.previewOptionRow}>
          <TiFFormPreviewableOptionView
            name="Open Sans"
            NameComponent={(props: TextProps) => (
              <Text
                {...props}
                style={[props.style, styles.openSansOptionLabel]}
              />
            )}
            isSelected={settings.preferredFontFamily === "OpenSans"}
            onSelected={() => update({ preferredFontFamily: "OpenSans" })}
            previewStyle={styles.fontOptionPreviewContainer}
          >
            <FontOptionPreviewView textStyle={styles.openSansOptionPreview} />
          </TiFFormPreviewableOptionView>
          <TiFFormPreviewableOptionView
            name="Open Dyslexic"
            NameComponent={(props: TextProps) => (
              <Text
                {...props}
                style={[
                  props.style,
                  styles.openDyslexicOptionLabel,
                  {
                    marginTop:
                      Platform.OS === "ios" ? iOSOpenDyslexicTopMagin : 0
                  }
                ]}
              />
            )}
            isSelected={settings.preferredFontFamily === "OpenDyslexic3"}
            onSelected={() => update({ preferredFontFamily: "OpenDyslexic3" })}
            previewStyle={styles.fontOptionPreviewContainer}
          >
            <FontOptionPreviewView
              textStyle={[
                styles.openDyslexicOptionPreview,
                {
                  marginTop:
                    Platform.OS === "ios" && isOSMajorVersionAvailable(18)
                      ? iOSOpenDyslexicTopMagin
                      : 0
                }
              ]}
            />
          </TiFFormPreviewableOptionView>
        </View>
      </TiFFormCardView>
    </TiFFormSectionView>
  )
}

type FontOptionPreviewProps = {
  textStyle: StyleProp<TextStyle>
}

const FontOptionPreviewView = ({ textStyle }: FontOptionPreviewProps) => (
  <View style={styles.optionLabelText}>
    <Text allowFontScaling={false} style={textStyle}>
      ABC 123
    </Text>
  </View>
)

const styles = StyleSheet.create({
  fontSubtitleBase: {
    opacity: 0.5
  },
  previewOptionRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingVertical: 16
  },
  previewOptionPreview: {
    width: 128,
    height: 48,
    borderRadius: 12
  },
  previewOptionLabel: {
    height: 32
  },
  learnMore: {
    color: AppStyles.linkColor,
    opacity: 1
  },
  userInterfaceStylePreview: {
    width: 84,
    height: 48,
    borderRadius: 10,
    display: "flex",
    flexDirection: "row"
  },
  darkUserInterfaceStylePreview: {
    backgroundColor: AppStyles.darkColor
  },
  lightUserInterfaceStylePreview: {
    backgroundColor: "white"
  },
  systemUserInterfaceStylePreviewDark: {
    backgroundColor: AppStyles.darkColor,
    width: "50%",
    height: "100%",
    borderBottomLeftRadius: 10,
    borderTopLeftRadius: 10
  },
  systemUserInterfaceStylePreviewLight: {
    backgroundColor: "white",
    width: "50%",
    height: "100%",
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10
  },
  fontOptionPreviewContainer: {
    width: 128,
    height: 48
  },
  optionLabelText: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  openSansOptionLabel: {
    fontFamily: "OpenSansBold",
    fontSize: 12
  },
  openSansOptionPreview: {
    fontFamily: "OpenSansBold",
    fontSize: 20,
    padding: 8
  },
  openDyslexicOptionLabel: {
    fontFamily: "OpenDyslexic3Bold",
    fontSize: 10
  },
  openDyslexicOptionPreview: {
    fontFamily: "OpenDyslexic3Bold",
    fontSize: 18
  }
})
