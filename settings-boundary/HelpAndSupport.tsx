import { AppStyles } from "@lib/AppColorStyle"
import { StyleProp, ViewStyle } from "react-native"
import { SettingsNavigationLinkView } from "./components/NavigationLink"
import { SettingsScrollView } from "./components/ScrollView"
import { SettingsSectionView } from "./components/Section"

export type EventSettingsProps = {
  style?: StyleProp<ViewStyle>
  onViewHelpTapped: () => void
  onReportBugTapped: () => void
  onRequestFeatureTapped: () => void
}

export const HelpAndSupportView = ({
  style,
  onViewHelpTapped,
  onReportBugTapped,
  onRequestFeatureTapped
}: EventSettingsProps) => (
  <SettingsScrollView style={style}>
    <HelpSectionView
      onViewHelpTapped={onViewHelpTapped}
      onReportBugTapped={onReportBugTapped}
      onRequestFeatureTapped={onRequestFeatureTapped}
    />
  </SettingsScrollView>
)

type PresetSectionProps = {
  onViewHelpTapped: () => void
  onReportBugTapped: () => void
  onRequestFeatureTapped: () => void
}

export const HelpSectionView = ({
  onViewHelpTapped,
  onReportBugTapped,
  onRequestFeatureTapped
}: PresetSectionProps) => {
  return (
    <SettingsSectionView>
      <SettingsSectionView
        title="Help Center"
        subtitle="This is the hub for any help you may want, or reports or feedback you might have about the app."
      >
        <SettingsNavigationLinkView
          title={"View Help Center"}
          onTapped={onViewHelpTapped}
          iconName={"link"}
          iconBackgroundColor={AppStyles.yellow}
        />
      </SettingsSectionView>
      <SettingsSectionView
        title="Contact Us"
        subtitle="Feel free to talk to us about anything you might be feeling about the app!"
      >
        <SettingsNavigationLinkView
          title={"Report a Bug"}
          onTapped={onReportBugTapped}
          iconName={"link"}
          iconBackgroundColor={AppStyles.yellow}
        />
        <SettingsNavigationLinkView
          title={"Request a Feature"}
          onTapped={onRequestFeatureTapped}
          iconName={"link"}
          iconBackgroundColor={AppStyles.yellow}
        />
      </SettingsSectionView>
    </SettingsSectionView>
  )
}
