import { StyleProp, ViewStyle, Platform } from "react-native"
import { TiFFormScrollView } from "@components/form-components/ScrollView"
import { TiFFormCardSectionView } from "@components/form-components/Section"
import { TiFFormNamedToggleView } from "@components/form-components/NamedToggle"
import { useHaptics } from "@modules/tif-haptics"
import { useLocalSettings } from "@settings-storage/Hooks"
import { settingsSelector } from "@settings-storage/Settings"
import { TiFFormChecklistPickerView } from "@components/form-components/ChecklistPicker"
import { PreferredBrowserName } from "@settings-storage/LocalSettings"
import { TiFFormRowButton } from "@components/form-components/Button"
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
    <TiFFormScrollView style={style}>
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
    </TiFFormScrollView>
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
    <TiFFormCardSectionView title={title}>
      {isFeedbackSupported && (
        <TiFFormNamedToggleView
          name="Haptic Feedback"
          description="Some app actions will cause slight device vibrations."
          isOn={settings.isHapticFeedbackEnabled}
          onIsOnChange={(isHapticFeedbackEnabled) => {
            update({ isHapticFeedbackEnabled })
          }}
        />
      )}
      {isAudioSupported && (
        <TiFFormNamedToggleView
          name="Sound Effects"
          isOn={settings.isHapticAudioEnabled}
          onIsOnChange={(isHapticAudioEnabled) => {
            update({ isHapticAudioEnabled })
          }}
        />
      )}
    </TiFFormCardSectionView>
  )
}

const WebBrowserSectionView = () => {
  const { settings, update } = useLocalSettings(
    settingsSelector("preferredBrowserName", "isUsingSafariReaderMode")
  )
  return (
    <>
      <TiFFormCardSectionView title="Open Websites In">
        <TiFFormChecklistPickerView<PreferredBrowserName>
          options={WEB_BROWSER_CHECKLIST_OPTIONS}
          onOptionSelected={(preferredBrowserName) => {
            update({ preferredBrowserName })
          }}
          selectedOptions={[settings.preferredBrowserName]}
        />
      </TiFFormCardSectionView>
      {Platform.OS === "ios" && settings.preferredBrowserName === "in-app" && (
        <TiFFormCardSectionView>
          <TiFFormNamedToggleView
            name="Safari Reader Mode"
            description="Makes websites easier to read by removing visual styling. This may not be supported on some websites."
            isOn={settings.isUsingSafariReaderMode}
            onIsOnChange={(isUsingSafariReaderMode) => {
              update({ isUsingSafariReaderMode })
            }}
          />
        </TiFFormCardSectionView>
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
  <TiFFormCardSectionView title="Advanced">
    {/* TODO: - Show Cache Size? */}
    <TiFFormRowButton onTapped={onClearCacheTapped}>
      <Headline>Clear Cache</Headline>
    </TiFFormRowButton>
  </TiFFormCardSectionView>
)
