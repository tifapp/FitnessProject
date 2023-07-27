import { Caption, Headline } from "@components/Text"
import { Ionicon } from "@components/common/Icons"
import { AppStyles } from "@lib/AppColorStyle"
import { useNavigation } from "@react-navigation/native"
import { useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"
import React from "react"
import {
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View
} from "react-native"
import { Divider } from "react-native-elements"
import { Section } from "./Section"

export type ToggleProps = {
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

const crashReportsEnabledAtom = atomWithStorage("crashReportsEnabled", true)

export const Toggle = ({ value, onValueChange }: ToggleProps) => {
  return (
    <Switch
      trackColor={{ true: AppStyles.darkColor }}
      thumbColor={value ? "#ffffff" : "#f4f3f4"}
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
  const navigation = useNavigation()
  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate("ChangePasswordScreen")
      }}
    >
      <Section
        icon={"shield"}
        style={[styles.flexRow]}
        title="Change Password"
        addOn={
          <Ionicon
            name="chevron-forward"
            style={{ alignSelf: "center" }}
            color={AppStyles.colorOpacity35}
          />
        }
      />
    </TouchableOpacity>
  )
}

const BlockedUserSection = () => {
  return (
    <TouchableOpacity
      onPress={() => {
        console.log("Yes")
      }}
    >
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
    </TouchableOpacity>
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
        <Toggle
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
        <Toggle
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
        <Toggle
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
        <Toggle
          value={friendReqNotifEnabled}
          onValueChange={() =>
            setFriendReqNotifEnabled((previousState: boolean) => !previousState)
          }
        />
      }
    />
  )
}

const MoreInfoSection = () => {
  return (
    <TouchableOpacity
      onPress={() => {
        console.log("Yes")
      }}
    >
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
    </TouchableOpacity>
  )
}

const AnalyticsSection = () => {
  const [analyticsEnabled, setAnalyticsEnabled] = useAtom(analyticsEnabledAtom)
  return (
    <Section
      icon={"bar-chart"}
      style={[styles.flexRow]}
      title="Share Analytics"
      caption="When enabled, we collect some limited usage data to help diagnose issues and improve the app. This data is completely anonymous and is not tied to you as a person in any way."
      addOn={
        <Toggle
          value={analyticsEnabled}
          onValueChange={() =>
            setAnalyticsEnabled((previousState: boolean) => !previousState)
          }
        />
      }
    />
  )
}

const CrashReportSection = () => {
  const [crashReportsEnabled, setCrashReportsEnabled] = useAtom(
    crashReportsEnabledAtom
  )
  return (
    <Section
      icon={"flash"}
      style={[styles.flexRow]}
      title="Share Crash Reports"
      caption="When enabled, we track technical issues that help diagnose app crashes and other issues. These collected issues are completely anonymous and not not tied to you as a person in any way."
      addOn={
        <Toggle
          value={crashReportsEnabled}
          onValueChange={() =>
            setCrashReportsEnabled((previousState: boolean) => !previousState)
          }
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
        <View>
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
        <View>
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
      style={[styles.container, styles.spacing, { flex: 1 }]}
      contentContainerStyle={{ flexGrow: 1 }}
      nestedScrollEnabled={true}
    >
      <Headline style={[styles.textColor, { paddingBottom: 8 }]}>
        {"Your Account"}
      </Headline>
      <View style={styles.iconSection}>
        <EmailSection />

        <Divider style={styles.divider} />

        <ChangePasswdSection />
      </View>

      <Headline style={[styles.textColor, { paddingBottom: 8 }]}>
        {"Users"}
      </Headline>
      <View style={styles.iconSection}>
        <BlockedUserSection />
      </View>

      <Headline style={[styles.textColor, { paddingBottom: 8 }]}>
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

      <Headline style={[styles.textColor, { paddingBottom: 8 }]}>
        {"More Info"}
      </Headline>
      <View style={styles.iconSection}>
        <MoreInfoSection />
      </View>

      <Headline style={[styles.textColor, { paddingBottom: 8 }]}>
        {"Usage Data"}
      </Headline>
      <View style={styles.iconSection}>
        <AnalyticsSection />

        <Divider style={styles.divider} />

        <CrashReportSection />
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
          paddingBottom: 8
        }}
      >
        <Caption>{"Version 0.1 (beta)"}</Caption>
      </View>

      <View
        style={{
          flex: 1,
          alignSelf: "center",
          marginBottom: 8,
          paddingTop: 8,
          paddingBottom: 2
        }}
      ></View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  flexRow: {
    flex: 1,
    flexDirection: "row"
  },
  container: {
    backgroundColor: "white"
  },
  paddingIconSection: {
    paddingVertical: 8
  },
  iconSection: {
    backgroundColor: "#F4F4F6",
    borderRadius: 8,
    paddingVertical: 4,
    marginBottom: 24
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
