import { PrimaryButton } from "@components/Buttons"
import { BodyText, Headline } from "@components/Text"
import { useUserSettings } from "@settings-storage/Hooks"
import { settingsSelector } from "@settings-storage/Settings"
import {
  PushNotificationTriggerID,
  toggleSettingsTriggerId
} from "TiFShared/domain-models/Settings"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { SettingsPermission } from "./Permissions"
import { SettingsCardView } from "./components/Card"
import { SettingsNamedToggleView } from "./components/NamedToggle"
import { SettingsScrollView } from "./components/ScrollView"
import { SettingsSectionView } from "./components/Section"

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
              Turn on notifications to stay up to date on the latest and
              greatest developments in your fitness journey!
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
        name="When the Start Time or Duration Changes"
        id="event-time-changed"
      />
      <NamedTriggerIdToggleView
        name="When the Location Changes"
        id="event-location-changed"
      />
      <NamedTriggerIdToggleView
        name="When the Name Changes"
        id="event-name-changed"
      />
      <NamedTriggerIdToggleView
        name="When the Description Changes"
        id="event-description-changed"
      />
      <NamedTriggerIdToggleView
        name="When the Event is Cancelled"
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
        name="Prior to the Event Starting"
        id="event-starting-soon"
      />
      <NamedTriggerIdToggleView
        name="When the Event Starts"
        id="event-started"
      />
      <NamedTriggerIdToggleView name="When the Event Ends" id="event-ended" />
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
        name="When I Arrive at the Event"
        id="user-entered-region"
      />
      <NamedTriggerIdToggleView
        name="When Others Arrive at the Event"
        description="This notification is sent periodically throughout the duration of the event, not on every arrival."
        id="event-periodic-arrivals"
      />
      <NamedTriggerIdToggleView
        name="Attendance Headcount"
        description="This notification is sent at the start of the event."
        id="event-attendance-headcount"
      />
    </SettingsCardView>
  </SettingsSectionView>
)

const ProfileSectionView = ({ isEnabled }: EditableSectionBaseProps) => (
  <SettingsSectionView isDisabled={!isEnabled} title="Profile Notifications">
    <SettingsCardView>
      <NamedTriggerIdToggleView
        name="When I Receive a Friend Request"
        id="friend-request-received"
      />
      <NamedTriggerIdToggleView
        name="When Someone Accepts my Friend Request"
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
