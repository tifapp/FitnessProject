import { StyleProp, ViewStyle, StyleSheet, View } from "react-native"
import { SettingsScrollView } from "./components/ScrollView"
import { SettingsSectionView } from "./components/Section"
import { SettingsCardView } from "./components/Card"
import { BodyText, Headline } from "@components/Text"
import { PrimaryButton } from "@components/Buttons"
import { SettingsPermission } from "./Permissions"

export type NotificationSettingsProps = {
  notificationPermission: SettingsPermission
  onNotificationPermissionsRequested: () => void
  style?: StyleProp<ViewStyle>
}

export const NotificationSettingsView = ({
  notificationPermission,
  style
}: NotificationSettingsProps) => (
  <SettingsScrollView style={style}>
    {!notificationPermission.isGranted && (
      <PermissionsDisabledSectionView
        onPermissionsRequested={notificationPermission.onToggled}
      />
    )}
  </SettingsScrollView>
)

type PermissionsDisabledSectionProps = {
  onPermissionsRequested: () => void
}

const PermissionsDisabledSectionView = ({
  onPermissionsRequested
}: PermissionsDisabledSectionProps) => (
  <SettingsSectionView>
    <SettingsCardView>
      <View style={styles.permissionsDisabledSectionContainer}>
        <View style={styles.permissionsDisabledSectionRow}>
          <View style={styles.permissionsDisabledIllustration} />
          <View style={styles.permissionsDisabledTextColumn}>
            <Headline>Notifications are disabled!</Headline>
            <BodyText>
              You must turn on notification permissions to receive
              notifications.
            </BodyText>
          </View>
        </View>
        <View style={styles.permissionsDisabledSectionRow}>
          <PrimaryButton
            style={styles.permissionsDisabledButton}
            onPress={onPermissionsRequested}
          >
            Turn on Notifications
          </PrimaryButton>
        </View>
      </View>
    </SettingsCardView>
  </SettingsSectionView>
)

type EditableSectionBaseProps = {
  isEnabled: boolean
}

const styles = StyleSheet.create({
  permissionsDisabledIllustration: {
    width: 64,
    height: 64,
    backgroundColor: "red"
  },
  permissionsDisabledSectionContainer: {
    padding: 16,
    rowGap: 8
  },
  permissionsDisabledSectionRow: {
    display: "flex",
    flexDirection: "row",
    columnGap: 8,
    alignItems: "center"
  },
  permissionsDisabledTextColumn: {
    flex: 1,
    rowGap: 4
  },
  permissionsDisabledButton: {
    width: "100%",
    flex: 1,
    marginLeft: 72
  }
})
