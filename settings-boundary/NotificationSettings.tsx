import { StyleProp, ViewStyle, StyleSheet, View } from "react-native"
import { SettingsScrollView } from "./components/ScrollView"
import { SettingsSectionView } from "./components/Section"
import { SettingsCardView } from "./components/Card"
import { BodyText, Headline, Subtitle } from "@components/Text"
import { PrimaryButton } from "@components/Buttons"
import { SettingsPermission } from "./Permissions"
import { SettingsNamedToggleView } from "./components/NamedToggle"
import {
  PushNotificationTriggerID,
  toggleSettingsTriggerId
} from "TiFShared/domain-models/Settings"
import { useUserSettings } from "@settings-storage/Hooks"
import { settingsSelector } from "@settings-storage/Settings"

export type NotificationSettingsProps = {
  notificationPermission: SettingsPermission
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
    <EventChangesSectionView isEnabled={notificationPermission.isGranted} />
    <EventTimingSectionView isEnabled={notificationPermission.isGranted} />
    <EventArrivalsSectionView isEnabled={notificationPermission.isGranted} />
    <ProfileSectionView isEnabled={notificationPermission.isGranted} />
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
            <Headline>Notifications are off!</Headline>
            <BodyText>
              Enable app notifications to receive important event updates, event
              arrivals notifications, and profile notifications.
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

const EventChangesSectionView = ({ isEnabled }: EditableSectionBaseProps) => (
  <SettingsSectionView
    isDisabled={!isEnabled}
    title="Event Changes Notifications"
  >
    <SettingsCardView>
      <NamedTriggerIdToggleView
        name="Event Start Time or Duration Changes"
        id="event-time-changed"
      />
      <NamedTriggerIdToggleView
        name="Event Location Changes"
        id="event-location-changed"
      />
      <NamedTriggerIdToggleView
        name="Event Name Changes"
        id="event-name-changed"
      />
      <NamedTriggerIdToggleView
        name="Event Description Changes"
        id="event-description-changed"
      />
      <NamedTriggerIdToggleView
        name="Event Cancellation"
        id="event-cancelled"
      />
    </SettingsCardView>
  </SettingsSectionView>
)

const EventTimingSectionView = ({ isEnabled }: EditableSectionBaseProps) => (
  <SettingsSectionView
    title="Event Timing Notifications"
    isDisabled={!isEnabled}
  >
    <SettingsCardView>
      <NamedTriggerIdToggleView
        name="Prior to an Event Starting"
        id="event-starting-soon"
      />
      <NamedTriggerIdToggleView
        name="When an Event Starts"
        id="event-started"
      />
      <NamedTriggerIdToggleView name="When an Event Ends" id="event-ended" />
    </SettingsCardView>
  </SettingsSectionView>
)

const EventArrivalsSectionView = ({ isEnabled }: EditableSectionBaseProps) => (
  <SettingsSectionView
    title="Event Arrivals Notifications"
    isDisabled={!isEnabled}
  >
    <SettingsCardView>
      <NamedTriggerIdToggleView
        name="When You Arrive at an Event"
        description="Notification is sent when you’ve arrived at an event."
        id="user-entered-region"
      />
      <NamedTriggerIdToggleView
        name="When Others Arrive at an Event"
        description="Notification is sent periodically on others arrival at an event."
        id="event-periodic-arrivals"
      />
      <NamedTriggerIdToggleView
        name="Attendance Headcount"
        description="Notification is sent when an event starts."
        id="event-attendance-headcount"
      />
    </SettingsCardView>
  </SettingsSectionView>
)

const ProfileSectionView = ({ isEnabled }: EditableSectionBaseProps) => (
  <SettingsSectionView isDisabled={!isEnabled} title="Profile Notifications">
    <SettingsCardView>
      <NamedTriggerIdToggleView
        name="When You Receive a Friend Request"
        id="friend-request-received"
      />
      <NamedTriggerIdToggleView
        name="When Someone Accepts Your Friend Request"
        id="friend-request-accepted"
      />
    </SettingsCardView>
  </SettingsSectionView>
)

type NamedTriggerIdToggleProps = {
  name: string
  description?: string
  id: PushNotificationTriggerID
}

const NamedTriggerIdToggleView = ({
  name,
  description,
  id
}: NamedTriggerIdToggleProps) => {
  const { settings, update } = useUserSettings(
    settingsSelector("pushNotificationTriggerIds")
  )
  return (
    <SettingsNamedToggleView
      name={name}
      description={description}
      isOn={settings.pushNotificationTriggerIds.includes(id)}
      onIsOnChange={(isOn) => {
        update({
          pushNotificationTriggerIds: toggleSettingsTriggerId(
            settings.pushNotificationTriggerIds,
            id,
            isOn
          )
        })
      }}
    />
  )
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
    marginTop: 8
  }
})
