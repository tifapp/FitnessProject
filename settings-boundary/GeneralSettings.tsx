import { StyleProp, ViewStyle, Platform } from "react-native"
import { SettingsScrollView } from "./components/ScrollView"
import {
  SettingsCardSectionView,
  SettingsSectionView
} from "./components/Section"
import { SettingsNamedToggleView } from "./components/NamedToggle"
import { useHaptics } from "@modules/tif-haptics"
import { useLocalSettings } from "@settings-storage/Hooks"
import { settingsSelector } from "@settings-storage/Settings"
import { SettingsChecklistPickerView } from "./components/ChecklistPicker"
import { PreferredBrowserName } from "@settings-storage/LocalSettings"
import { SettingsButton } from "./components/Button"
import { Headline } from "@components/Text"

export type GeneralSettingsProps = {
  onClearCacheTapped: () => void
  style?: StyleProp<ViewStyle>
}

export const GeneralSettingsView = ({
  onClearCacheTapped,
  style
}: GeneralSettingsProps) => {
  const { isAudioSupportedOnDevice, isFeedbackSupportedOnDevice } = useHaptics()
  const hapticsTitle = hapticsSettingsTitle(
    isFeedbackSupportedOnDevice,
    isAudioSupportedOnDevice
  )
  return (
    <SettingsScrollView style={style}>
      {hapticsTitle && (
        <HapticsSectionView
          title={hapticsTitle}
          isAudioSupported={isAudioSupportedOnDevice}
          isFeedbackSupported={isFeedbackSupportedOnDevice}
        />
      )}
      {/* TODO: - Check for Availability */}
      <WebBrowserSectionView />
      <AdvancedSectionView onClearCacheTapped={onClearCacheTapped} />
    </SettingsScrollView>
  )
}

export const hapticsSettingsTitle = (
  isFeedbackSupported: boolean,
  isAudioSupported: boolean
) => {
  if (!isFeedbackSupported && !isAudioSupported) return undefined
  if (isFeedbackSupported && isAudioSupported) {
    return HAPTICS_SETTINGS_TITLE.feedbackAndAudio
  }
  return HAPTICS_SETTINGS_TITLE[isAudioSupported ? "audioOnly" : "feedbackOnly"]
}

export const HAPTICS_SETTINGS_TITLE = {
  feedbackAndAudio: "Haptics and Audio",
  feedbackOnly: "Haptics",
  audioOnly: "Audio"
} as const

type HapticsSectionProps = {
  title: string
  isFeedbackSupported: boolean
  isAudioSupported: boolean
}

const HapticsSectionView = ({
  title,
  isFeedbackSupported,
  isAudioSupported
}: HapticsSectionProps) => {
  const { settings, update } = useLocalSettings(
    settingsSelector("isHapticAudioEnabled", "isHapticFeedbackEnabled")
  )
  return (
    <SettingsCardSectionView title={title}>
      {isFeedbackSupported && (
        <SettingsNamedToggleView
          name="Haptic Feedback"
          description="Some app actions will cause slight device vibrations."
          isOn={settings.isHapticFeedbackEnabled}
          onIsOnChange={(isHapticFeedbackEnabled) => {
            update({ isHapticFeedbackEnabled })
          }}
        />
      )}
      {isAudioSupported && (
        <SettingsNamedToggleView
          name="Sound Effects"
          isOn={settings.isHapticAudioEnabled}
          onIsOnChange={(isHapticAudioEnabled) => {
            update({ isHapticAudioEnabled })
          }}
        />
      )}
    </SettingsCardSectionView>
  )
}

const WebBrowserSectionView = () => {
  const { settings, update } = useLocalSettings(
    settingsSelector("preferredBrowserName", "isUsingSafariReaderMode")
  )
  return (
    <>
      <SettingsCardSectionView title="Open Websites In">
        <SettingsChecklistPickerView<PreferredBrowserName>
          options={WEB_BROWSER_CHECKLIST_OPTIONS}
          onOptionSelected={(preferredBrowserName) => {
            update({ preferredBrowserName })
          }}
          selectedOptions={[settings.preferredBrowserName]}
        />
      </SettingsCardSectionView>
      {Platform.OS === "ios" && settings.preferredBrowserName === "in-app" && (
        <SettingsCardSectionView>
          <SettingsNamedToggleView
            name="Safari Reader Mode"
            description="Makes websites easier to read by removing visual styling. This may not be supported on some websites."
            isOn={settings.isUsingSafariReaderMode}
            onIsOnChange={(isUsingSafariReaderMode) => {
              update({ isUsingSafariReaderMode })
            }}
          />
        </SettingsCardSectionView>
      )}
    </>
  )
}

const WEB_BROWSER_CHECKLIST_OPTIONS = [
  { title: "tiF", value: "in-app" },
  { title: "Default System Browser", value: "system-default" }
] as const

type AdvancedSectionProps = {
  onClearCacheTapped: () => void
}

const AdvancedSectionView = ({ onClearCacheTapped }: AdvancedSectionProps) => (
  <SettingsCardSectionView title="Advanced">
    {/* TODO: - Show Cache Size? */}
    <SettingsButton onTapped={onClearCacheTapped}>
      <Headline>Clear Cache</Headline>
    </SettingsButton>
  </SettingsCardSectionView>
)
