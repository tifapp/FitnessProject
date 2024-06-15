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
import { SettingsScrollView } from "./components/ScrollView"
import { SettingsSectionView } from "./components/Section"
import { SettingsCardView } from "./components/Card"
import { useLocalSettings } from "@settings-storage/Hooks"
import { settingsSelector } from "@settings-storage/Settings"
import { BodyText } from "@components/Text"
import { AppStyles } from "@lib/AppColorStyle"
import { FontScaleFactors, useFontScale } from "@lib/Fonts"
import { useOpenWeblink } from "@modules/tif-weblinks"
import { SettingsPreviewableOptionView } from "./components/PreviewableOption"
import { isOSMajorVersionAvailable } from "@lib/Platform"

export type AppearanceSettingsProps = {
  style?: StyleProp<ViewStyle>
}

export const AppearanceSettingsView = ({ style }: AppearanceSettingsProps) => (
  <SettingsScrollView style={style}>
    <ThemeSectionView />
    <FontFamilySectionView />
  </SettingsScrollView>
)

const ThemeSectionView = () => {
  const { settings, update } = useLocalSettings(
    settingsSelector("userInterfaceStyle")
  )
  return (
    <SettingsSectionView title="Theme">
      <SettingsCardView>
        <View style={styles.previewOptionRow}>
          <SettingsPreviewableOptionView
            name="System"
            isSelected={settings.userInterfaceStyle === "system"}
            onSelected={() => update({ userInterfaceStyle: "system" })}
            previewStyle={styles.userInterfaceStylePreview}
          >
            <View style={styles.systemUserInterfaceStylePreviewDark} />
            <View style={styles.systemUserInterfaceStylePreviewLight} />
          </SettingsPreviewableOptionView>
          <SettingsPreviewableOptionView
            name="Dark"
            isSelected={settings.userInterfaceStyle === "dark"}
            onSelected={() => update({ userInterfaceStyle: "dark" })}
            previewStyle={[
              styles.userInterfaceStylePreview,
              styles.darkUserInterfaceStylePreview
            ]}
          />
          <SettingsPreviewableOptionView
            name="Light"
            isSelected={settings.userInterfaceStyle === "light"}
            onSelected={() => update({ userInterfaceStyle: "light" })}
            previewStyle={[
              styles.userInterfaceStylePreview,
              styles.lightUserInterfaceStylePreview
            ]}
          />
        </View>
      </SettingsCardView>
    </SettingsSectionView>
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
    <SettingsSectionView
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
      <SettingsCardView>
        <View style={styles.previewOptionRow}>
          <SettingsPreviewableOptionView
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
          </SettingsPreviewableOptionView>
          <SettingsPreviewableOptionView
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
          </SettingsPreviewableOptionView>
        </View>
      </SettingsCardView>
    </SettingsSectionView>
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
