import { PrimaryButton } from "@components/Buttons"
import { BodyText, Headline } from "@components/Text"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { TiFFormCardView } from "@components/form-components/Card"
import { TiFFormScrollView } from "@components/form-components/ScrollView"
import { TiFFormSectionView } from "@components/form-components/Section"

import { useUserSettings } from "@settings-storage/Hooks"
import { settingsSelector } from "@settings-storage/Settings"
import {
  PushNotificationTriggerID,
  toggleSettingsTriggerId
} from "TiFShared/domain-models/Settings"

import { SettingsPermission } from "./Permissions"

import { TiFFormNamedToggleView } from "@components/form-components/NamedToggle"

export type NotificationSettingsProps = {
  notificationPermission: SettingsPermission
  style?: StyleProp<ViewStyle>
}

export const NotificationSettingsView = ({
  notificationPermission,
  style
}: NotificationSettingsProps) => (
  <TiFFormScrollView style={style}>
    {!notificationPermission.isGranted && (
      <PermissionsDisabledSectionView
        onPermissionsRequested={notificationPermission.onToggled}
      />
    )}
    <EventChangesSectionView isEnabled={notificationPermission.isGranted} />
    <EventTimingSectionView isEnabled={notificationPermission.isGranted} />
    <EventArrivalsSectionView isEnabled={notificationPermission.isGranted} />
    <ProfileSectionView isEnabled={notificationPermission.isGranted} />
  </TiFFormScrollView>
)

type PermissionsDisabledSectionProps = {
  onPermissionsRequested: () => void
}

const PermissionsDisabledSectionView = ({
  onPermissionsRequested
}: PermissionsDisabledSectionProps) => (
  <TiFFormSectionView>
    <TiFFormCardView>
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
    </TiFFormCardView>
  </TiFFormSectionView>
)

type EditableSectionBaseProps = {
  isEnabled: boolean
}

const EventChangesSectionView = ({ isEnabled }: EditableSectionBaseProps) => (
  <TiFFormSectionView
    isDisabled={!isEnabled}
    title="Event Changes Notifications"
  >
    <TiFFormCardView>
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
    </TiFFormCardView>
  </TiFFormSectionView>
)

const EventTimingSectionView = ({ isEnabled }: EditableSectionBaseProps) => (
  <TiFFormSectionView
    title="Event Timing Notifications"
    isDisabled={!isEnabled}
  >
    <TiFFormCardView>
      <NamedTriggerIdToggleView
        name="Prior to an Event Starting"
        id="event-starting-soon"
      />
      <NamedTriggerIdToggleView
        name="When an Event Starts"
        id="event-started"
      />
      <NamedTriggerIdToggleView name="When an Event Ends" id="event-ended" />
    </TiFFormCardView>
  </TiFFormSectionView>
)

const EventArrivalsSectionView = ({ isEnabled }: EditableSectionBaseProps) => (
  <TiFFormSectionView
    title="Event Arrivals Notifications"
    isDisabled={!isEnabled}
  >
    <TiFFormCardView>
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
    </TiFFormCardView>
  </TiFFormSectionView>
)

const ProfileSectionView = ({ isEnabled }: EditableSectionBaseProps) => (
  <TiFFormSectionView isDisabled={!isEnabled} title="Profile Notifications">
    <TiFFormCardView>
      <NamedTriggerIdToggleView
        name="When You Receive a Friend Request"
        id="friend-request-received"
      />
      <NamedTriggerIdToggleView
        name="When Someone Accepts Your Friend Request"
        id="friend-request-accepted"
      />
    </TiFFormCardView>
  </TiFFormSectionView>
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
    <TiFFormNamedToggleView
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
