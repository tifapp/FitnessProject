import { Caption, Headline, Title } from "@components/Text"
import { Ionicon } from "@components/common/Icons"
import { AppStyles } from "@lib/AppColorStyle"
import { useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"
import React from "react"
import { ScrollView, StyleSheet, Switch, View } from "react-native"
import { Divider } from "react-native-elements"
import { Section } from "./Section"

export type SwitchComponentProps = {
  value: boolean
  onValueChange: (value: boolean) => void
}

const eventScreenNotifEnabledAtom = atomWithStorage(
  "eventScreenNotifEnabled",
  true
)

const mentionNotifEnabledAtom = atomWithStorage("mentionNotifEnabled", true)

const chatMsgNotifEnabledAtom = atomWithStorage("chatMsgNotifEnabled", true)

const friendReqNotifEnabledAtom = atomWithStorage("friendReqNotifEnabled", true)

const analyticsEnabledAtom = atomWithStorage("analyticsEnabled", true)

const SwitchComponent = ({ value, onValueChange }: SwitchComponentProps) => {
  return (
    <Switch
      trackColor={{ false: "#767577", true: AppStyles.darkColor }}
      thumbColor={value ? "#ffffff" : "#f4f3f4"}
      ios_backgroundColor="#3e3e3e"
      value={value}
      onValueChange={onValueChange}
    />
  )
}

const EmailSection = () => {
  return (
    <Section
      icon={"mail"}
      style={styles.flexRow}
      title="Email"
      caption="-insert email here-"
    />
  )
}

const ChangePasswdSection = () => {
  return (
    <Section
      icon={"shield"}
      style={[styles.flexRow, { paddingVertical: 4 }]}
      title="Change Password"
      addOn={
        <Ionicon
          name="chevron-forward"
          style={{ alignSelf: "center" }}
          color={AppStyles.colorOpacity35}
        />
      }
    />
  )
}

const BlockedUserSection = () => {
  return (
    <Section
      icon={"person-remove"}
      style={styles.flexRow}
      title="Blocked Users"
      addOn={
        <Ionicon
          name="chevron-forward"
          style={{ alignSelf: "center" }}
          color={AppStyles.colorOpacity35}
        />
      }
    />
  )
}

const EventNotificationSection = () => {
  const [eventScreenNotifEnabled, setEventScreenNotifEnabled] = useAtom(
    eventScreenNotifEnabledAtom
  )

  return (
    <Section
      icon={"map"}
      style={styles.flexRow}
      title="Events"
      caption="Enable notifications when an event is about to start."
      addOn={
        <SwitchComponent
          value={eventScreenNotifEnabled}
          onValueChange={() =>
            setEventScreenNotifEnabled(
              (previousState: boolean) => !previousState
            )
          }
        />
      }
    />
  )
}

const MentionNotificationSection = () => {
  const [mentionNotifEnabled, setMentionNotifEnabled] = useAtom(
    mentionNotifEnabledAtom
  )
  return (
    <Section
      icon={"at-circle"}
      style={styles.flexRow}
      title="Mentions"
      caption="Enable notifications when others @ your name in events and chats."
      addOn={
        <SwitchComponent
          value={mentionNotifEnabled}
          onValueChange={() =>
            setMentionNotifEnabled((previousState: boolean) => !previousState)
          }
        />
      }
    />
  )
}

const ChatMsgNotificationSection = () => {
  const [chatMsgNotifEnabled, setChatMsgNotifEnabled] = useAtom(
    chatMsgNotifEnabledAtom
  )
  return (
    <Section
      icon={"chatbox"}
      style={styles.flexRow}
      title="Chat Messages"
      caption="Enable notifications for all chat messages."
      addOn={
        <SwitchComponent
          value={chatMsgNotifEnabled}
          onValueChange={() =>
            setChatMsgNotifEnabled((previousState: boolean) => !previousState)
          }
        />
      }
    />
  )
}

const FriendReqNotificationSection = () => {
  const [friendReqNotifEnabled, setFriendReqNotifEnabled] = useAtom(
    friendReqNotifEnabledAtom
  )
  return (
    <Section
      icon={"people"}
      style={styles.flexRow}
      title="Friend Requests"
      caption="Enable notifications for pending and accepted friend requests."
      addOn={
        <SwitchComponent
          value={friendReqNotifEnabled}
          onValueChange={() =>
            setFriendReqNotifEnabled((previousState: boolean) => !previousState)
          }
        />
      }
    />
  )
}

const AnalyticsSection = () => {
  const [analyticsEnabled, setAnalyticsEnabled] = useAtom(analyticsEnabledAtom)
  return (
    <Section
      icon={"people"}
      style={[styles.flexRow, { paddingVertical: 2 }]}
      title="Analytics"
      addOn={
        <SwitchComponent
          value={analyticsEnabled}
          onValueChange={() =>
            setAnalyticsEnabled((previousState: boolean) => !previousState)
          }
        />
      }
    />
  )
}

const MoreInfoSection = () => {
  return (
    <Section
      icon={"information-circle"}
      style={styles.flexRow}
      title="Privacy Policy"
      addOn={
        <Ionicon
          name="chevron-forward"
          style={{ alignSelf: "center" }}
          color={AppStyles.colorOpacity35}
        />
      }
    />
  )
}

const LogoutSection = () => {
  return (
    <View
      style={[
        styles.flexRow,
        styles.paddingIconSection,
        { alignItems: "flex-start", justifyContent: "flex-start" }
      ]}
    >
      <View style={[styles.spacing, { paddingHorizontal: "4%" }]}>
        <View style={{ marginBottom: 0 }}>
          <Headline
            style={[
              styles.textColor,
              { color: "red", textAlignVertical: "center", textAlign: "left" }
            ]}
          >
            {"Logout"}
          </Headline>
        </View>
      </View>
    </View>
  )
}

const DeleteAccountSection = () => {
  return (
    <View
      style={[
        styles.flexRow,
        styles.paddingIconSection,
        { alignItems: "flex-start", justifyContent: "flex-start" }
      ]}
    >
      <View style={[styles.spacing, { paddingHorizontal: "4%" }]}>
        <View style={{ marginBottom: 0 }}>
          <Headline
            style={[
              styles.textColor,
              { color: "red", textAlignVertical: "center", textAlign: "left" }
            ]}
          >
            {"Delete Account"}
          </Headline>
        </View>
      </View>
    </View>
  )
}

export const SettingsScreen = () => {
  return (
    <ScrollView
      style={[
        styles.container,
        styles.spacing,
        { flex: 1, paddingVertical: 8 }
      ]}
      contentContainerStyle={{ flexGrow: 1 }}
      nestedScrollEnabled={true}
    >
      <Title style={styles.textColor}>{"Settings"}</Title>
      <Headline style={[styles.textColor, { paddingTop: 8, paddingBottom: 2 }]}>
        {"Your Account"}
      </Headline>
      <View style={styles.iconSection}>
        <EmailSection />

        <Divider style={styles.divider} />

        <ChangePasswdSection />
      </View>

      <Headline style={[styles.textColor, { paddingTop: 8, paddingBottom: 2 }]}>
        {"Users"}
      </Headline>
      <View style={styles.iconSection}>
        <BlockedUserSection />
      </View>

      <Headline style={[styles.textColor, { paddingTop: 8, paddingBottom: 2 }]}>
        {"Notifications"}
      </Headline>
      <View style={styles.iconSection}>
        <EventNotificationSection />

        <Divider style={styles.divider} />

        <MentionNotificationSection />

        <Divider style={styles.divider} />

        <ChatMsgNotificationSection />

        <Divider style={styles.divider} />

        <FriendReqNotificationSection />
      </View>

      <Headline style={[styles.textColor, { paddingTop: 8, paddingBottom: 2 }]}>
        {"More Info"}
      </Headline>
      <View style={styles.iconSection}>
        <MoreInfoSection />
      </View>

      <Headline style={[styles.textColor, { paddingTop: 8, paddingBottom: 2 }]}>
        {"Statistics"}
      </Headline>
      <View style={styles.iconSection}>
        <AnalyticsSection />
      </View>

      <View
        style={{
          flex: 1,
          alignSelf: "center",
          paddingTop: 8,
          paddingBottom: 2
        }}
      >
        <Caption>{"Version 0.1 (beta)"}</Caption>
      </View>

      <View style={styles.iconSection}>
        <LogoutSection />

        <Divider style={[styles.divider, { width: "95%" }]} />

        <DeleteAccountSection />
      </View>

      <View
        style={{
          flex: 1,
          alignSelf: "center",
          paddingTop: 8,
          paddingBottom: 2
        }}
      >
        <Caption>{}</Caption>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  flexRow: {
    flex: 1,
    flexDirection: "row"
  },
  container: {
    marginTop: 24,
    backgroundColor: "white"
  },
  paddingIconSection: {
    paddingVertical: 8
  },
  iconSection: {
    backgroundColor: "#F4F4F6",
    borderRadius: 8,
    paddingVertical: 4
  },
  iconStyling: {
    padding: 6
  },
  divider: {
    marginVertical: 8,
    width: "80%",
    height: 1,
    alignSelf: "flex-end",
    color: "#0000001A"
  },
  spacing: {
    paddingHorizontal: 16
  },
  captionLinks: {
    opacity: 1,
    fontWeight: "bold"
  },
  textColor: {
    color: AppStyles.darkColor
  }
})
