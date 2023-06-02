import { Caption, Headline } from "@components/Text"
import { Ionicon } from "@components/common/Icons"
import { AppStyles } from "@lib/AppColorStyle"
import { useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"
import React from "react"
import { ScrollView, StyleSheet, Switch, View } from "react-native"
import { Divider } from "react-native-elements"

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
    <View
      style={[
        styles.flexRow,
        styles.paddingIconSection,
        {
          alignItems: "flex-start",
          justifyContent: "flex-start"
        }
      ]}
    >
      <View
        style={[styles.spacing, { paddingVertical: 0, paddingHorizontal: 10 }]}
      >
        <View style={{ justifyContent: "center" }}>
          <Ionicon style={[styles.iconStyling]} name="mail" color={"black"} />
        </View>
      </View>

      <View style={[styles.spacing, { paddingHorizontal: 2 }]}>
        <View style={{ marginBottom: 0 }}>
          <Headline
            style={[
              styles.textColor,
              { textAlignVertical: "center", textAlign: "left" }
            ]}
          >
            {"Email"}
          </Headline>
        </View>
        <View style={styles.flexRow}>
          <Caption>{"-insert email here-"}</Caption>
        </View>
      </View>
    </View>
  )
}

const ChangePasswdSection = () => {
  return (
    <View
      style={[
        styles.flexRow,
        styles.paddingIconSection,
        { alignItems: "center", justifyContent: "center" }
      ]}
    >
      <View style={[styles.spacing, { paddingHorizontal: 10 }]}>
        <View style={{ justifyContent: "center" }}>
          <Ionicon style={[styles.iconStyling]} name="shield" color={"black"} />
        </View>
      </View>

      <View style={[styles.spacing, { paddingHorizontal: 2 }]}>
        <View style={{ marginBottom: 4 }}>
          <Headline
            style={[
              styles.textColor,
              { textAlignVertical: "center", textAlign: "center" }
            ]}
          >
            {"Change Password"}
          </Headline>
        </View>
      </View>

      <View
        style={[
          styles.flexRow,
          { flex: 1, marginRight: 8, justifyContent: "flex-end" }
        ]}
      >
        <Ionicon
          name="chevron-forward"
          style={{ alignSelf: "center" }}
          color={AppStyles.colorOpacity35}
        />
      </View>
    </View>
  )
}

const BlockedUserSection = () => {
  return (
    <View
      style={[
        styles.flexRow,
        styles.paddingIconSection,
        { alignItems: "center", justifyContent: "center" }
      ]}
    >
      <View
        style={[styles.spacing, { paddingVertical: 0, paddingHorizontal: 10 }]}
      >
        <View style={{ justifyContent: "center" }}>
          <Ionicon
            style={[styles.iconStyling]}
            name="person-remove"
            color={"black"}
          />
        </View>
      </View>

      <View style={[styles.spacing, { paddingHorizontal: 2 }]}>
        <View style={{ marginBottom: 0 }}>
          <Headline
            style={[
              styles.textColor,
              { textAlignVertical: "center", textAlign: "left" }
            ]}
          >
            {"Blocked Users"}
          </Headline>
        </View>
      </View>

      <View
        style={[
          styles.flexRow,
          { flex: 1, marginRight: 8, justifyContent: "flex-end" }
        ]}
      >
        <Ionicon
          name="chevron-forward"
          style={{ alignSelf: "center" }}
          color={AppStyles.colorOpacity35}
        />
      </View>
    </View>
  )
}

const EventNotificationSection = () => {
  const [eventScreenNotifEnabled, setEventScreenNotifEnabled] = useAtom(
    eventScreenNotifEnabledAtom
  )

  return (
    <View>
      <View
        style={[
          styles.flexRow,
          styles.paddingIconSection,
          { alignItems: "center", justifyContent: "flex-start" }
        ]}
      >
        <View
          style={[
            styles.spacing,
            { paddingVertical: 0, paddingHorizontal: 12 }
          ]}
        >
          <View style={{ justifyContent: "center" }}>
            <Ionicon style={[styles.iconStyling]} name="map" color={"black"} />
          </View>
        </View>

        <View style={[styles.spacing, { paddingHorizontal: 2 }]}>
          <View style={{ marginBottom: 0 }}>
            <Headline
              style={[
                styles.textColor,
                { textAlignVertical: "center", textAlign: "left" }
              ]}
            >
              {"Events"}
            </Headline>
          </View>
          <View style={{ flex: 1, flexDirection: "row" }}>
            <Caption style={{ width: "80%" }}>
              {"Enable notifications when an event is about to start."}
            </Caption>
          </View>
          <View
            style={[
              styles.flexRow,
              {
                flex: 1,
                position: "absolute",
                width: "20%",
                marginTop: "1%",
                alignSelf: "flex-end",
                justifyContent: "flex-end"
              }
            ]}
          >
            <SwitchComponent
              value={eventScreenNotifEnabled}
              onValueChange={() =>
                setEventScreenNotifEnabled(
                  (previousState: boolean) => !previousState
                )
              }
            />
          </View>
        </View>
      </View>
    </View>
  )
}

const MentionNotificationSection = () => {
  const [mentionNotifEnabled, setMentionNotifEnabled] = useAtom(
    mentionNotifEnabledAtom
  )
  return (
    <View>
      <View
        style={[
          styles.flexRow,
          styles.paddingIconSection,
          { alignItems: "center", justifyContent: "flex-start" }
        ]}
      >
        <View
          style={[
            styles.spacing,
            { paddingVertical: 0, paddingHorizontal: 12 }
          ]}
        >
          <View style={{ justifyContent: "center" }}>
            <Ionicon
              style={[styles.iconStyling]}
              name="at-circle"
              color={"black"}
            />
          </View>
        </View>

        <View style={[styles.spacing, { paddingHorizontal: 2 }]}>
          <View style={{ marginBottom: 0 }}>
            <Headline
              style={[
                styles.textColor,
                { textAlignVertical: "center", textAlign: "left" }
              ]}
            >
              {"Mentions"}
            </Headline>
          </View>
          <View style={{ flex: 1, flexDirection: "row" }}>
            <Caption style={{ width: "80%" }}>
              {
                "Enable notifications when others @ your name in events and chats."
              }
            </Caption>
          </View>
          <View
            style={[
              styles.flexRow,
              {
                flex: 1,
                position: "absolute",
                width: "20%",
                marginTop: "1%",
                alignSelf: "flex-end",
                justifyContent: "flex-end"
              }
            ]}
          >
            <SwitchComponent
              value={mentionNotifEnabled}
              onValueChange={() =>
                setMentionNotifEnabled(
                  (previousState: boolean) => !previousState
                )
              }
            />
          </View>
        </View>
      </View>
    </View>
  )
}

const ChatMsgNotificationSection = () => {
  const [chatMsgNotifEnabled, setChatMsgNotifEnabled] = useAtom(
    chatMsgNotifEnabledAtom
  )
  return (
    <View>
      <View
        style={[
          styles.flexRow,
          styles.paddingIconSection,
          { alignItems: "center", justifyContent: "flex-start" }
        ]}
      >
        <View
          style={[
            styles.spacing,
            { paddingVertical: 0, paddingHorizontal: 12 }
          ]}
        >
          <View style={{ justifyContent: "center" }}>
            <Ionicon
              style={[styles.iconStyling]}
              name="chatbox"
              color={"black"}
            />
          </View>
        </View>

        <View style={[styles.spacing, { paddingHorizontal: 2 }]}>
          <View style={{ marginBottom: 0 }}>
            <Headline
              style={[
                styles.textColor,
                { textAlignVertical: "center", textAlign: "left" }
              ]}
            >
              {"Chat Messages"}
            </Headline>
          </View>

          <View style={{ flex: 1, flexDirection: "row" }}>
            <Caption style={{ width: "80%" }}>
              {"Enable notifications for all chat messages."}
            </Caption>
          </View>
          <View
            style={[
              styles.flexRow,
              {
                flex: 1,
                position: "absolute",
                width: "20%",
                marginTop: "1%",
                alignSelf: "flex-end",
                justifyContent: "flex-end"
              }
            ]}
          >
            <SwitchComponent
              value={chatMsgNotifEnabled}
              onValueChange={() =>
                setChatMsgNotifEnabled(
                  (previousState: boolean) => !previousState
                )
              }
            />
          </View>
        </View>
      </View>
    </View>
  )
}

const FriendReqNotificationSection = () => {
  const [friendReqNotifEnabled, setFriendReqNotifEnabled] = useAtom(
    friendReqNotifEnabledAtom
  )
  return (
    <View>
      <View
        style={[
          styles.flexRow,
          styles.paddingIconSection,
          { alignItems: "center", justifyContent: "flex-start" }
        ]}
      >
        <View
          style={[
            styles.spacing,
            { paddingVertical: 0, paddingHorizontal: 12 }
          ]}
        >
          <View style={{ justifyContent: "center" }}>
            <Ionicon
              style={[styles.iconStyling]}
              name="people"
              color={"black"}
            />
          </View>
        </View>

        <View style={[styles.spacing, { paddingHorizontal: 2 }]}>
          <View style={{ marginBottom: 0 }}>
            <Headline
              style={[
                styles.textColor,
                { textAlignVertical: "center", textAlign: "left" }
              ]}
            >
              {"Friend Requests"}
            </Headline>
          </View>

          <View style={{ flex: 1, flexDirection: "row" }}>
            <Caption style={{ width: "80%" }}>
              {"Enable notifications for pending and accepted friend requests."}
            </Caption>
          </View>
          <View
            style={[
              styles.flexRow,
              {
                flex: 1,
                position: "absolute",
                width: "20%",
                marginTop: "1%",
                alignSelf: "flex-end",
                justifyContent: "flex-end"
              }
            ]}
          >
            <SwitchComponent
              value={friendReqNotifEnabled}
              onValueChange={() =>
                setFriendReqNotifEnabled(
                  (previousState: boolean) => !previousState
                )
              }
            />
          </View>
        </View>
      </View>
    </View>
  )
}

const AnalyticsSection = () => {
  const [analyticsEnabled, setAnalyticsEnabled] = useAtom(analyticsEnabledAtom)
  return (
    <View>
      <View
        style={[
          styles.flexRow,
          styles.paddingIconSection,
          { alignItems: "center", justifyContent: "flex-start" }
        ]}
      >
        <View
          style={[
            styles.spacing,
            { paddingVertical: 0, paddingHorizontal: 12 }
          ]}
        >
          <View style={{ justifyContent: "center" }}>
            <Ionicon
              style={[styles.iconStyling]}
              name="people"
              color={"black"}
            />
          </View>
        </View>

        <View style={[styles.spacing, { paddingHorizontal: 2 }]}>
          <View style={{ marginBottom: 0 }}>
            <Headline
              style={[
                styles.textColor,
                { textAlignVertical: "center", textAlign: "left" }
              ]}
            >
              {"Analytics"}
            </Headline>
          </View>

          <View
            style={[
              styles.flexRow,
              {
                flex: 1,
                height: "90%",
                width: "350%",
                position: "absolute",
                alignItems: "flex-end",
                justifyContent: "flex-end"
              }
            ]}
          >
            <SwitchComponent
              value={analyticsEnabled}
              onValueChange={() =>
                setAnalyticsEnabled((previousState: boolean) => !previousState)
              }
            />
          </View>
        </View>
      </View>
    </View>
  )
}

const MoreInfoSection = () => {
  return (
    <View
      style={[
        styles.flexRow,
        styles.paddingIconSection,
        { alignItems: "center", justifyContent: "center" }
      ]}
    >
      <View
        style={[styles.spacing, { paddingVertical: 0, paddingHorizontal: 10 }]}
      >
        <View style={{ justifyContent: "center" }}>
          <Ionicon
            style={[styles.iconStyling]}
            name="information-circle"
            color={"black"}
          />
        </View>
      </View>

      <View style={[styles.spacing, { paddingHorizontal: 2 }]}>
        <View style={{ marginBottom: 0 }}>
          <Headline
            style={[
              styles.textColor,
              { textAlignVertical: "center", textAlign: "left" }
            ]}
          >
            {"Privacy Policy"}
          </Headline>
        </View>
      </View>

      <View
        style={[
          styles.flexRow,
          { flex: 1, marginRight: 8, justifyContent: "flex-end" }
        ]}
      >
        <Ionicon
          name="chevron-forward"
          style={{ alignSelf: "center" }}
          color={AppStyles.colorOpacity35}
        />
      </View>
    </View>
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
      style={[styles.container, styles.spacing, { flex: 1 }]}
      contentContainerStyle={{ flexGrow: 1 }}
      nestedScrollEnabled={true}
    >
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
        {"Other Settings"}
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
