import { IfAuthenticated, UserSession } from "@user/Session"
import { StyleProp, ViewStyle, StyleSheet, View } from "react-native"
import { SettingsScrollView } from "./components/ScrollView"
import { SettingsCardSectionView } from "./components/Section"
import { useState } from "react"
import { useConst } from "@lib/utils/UseConst"
import { SettingsNavigationLinkView } from "./components/NavigationLink"
import { AppStyles } from "@lib/AppColorStyle"
import { BodyText } from "@components/Text"
import { nativeBuildVersion } from "expo-application"
import { SettingsCardView } from "./components/Card"
import Animated, { FadeIn } from "react-native-reanimated"

export type RootSettingsScreenLinkID =
  | "calendarSettings"
  | "generalSettings"
  | "privacySettings"
  | "eventSettings"
  | "helpAndSupport"
  | "notificationsSettings"
  | "appearanceSettings"
  | "blockList"

export type RootSettingsProps = {
  areNotificationsEnabled: boolean
  onSettingsScreenLinkTapped: (id: RootSettingsScreenLinkID) => void
  onAccountInfoLinkTapped: (session: UserSession) => void
  style?: StyleProp<ViewStyle>
}

export const RootSettingsView = ({ style, ...props }: RootSettingsProps) => (
  <SettingsScrollView style={style}>
    <MainScreenLinksSection {...props} />
    <SupportSectionView
      onSettingsScreenLinkTapped={props.onSettingsScreenLinkTapped}
    />
  </SettingsScrollView>
)

type MainScreenLinksSectionProps = Omit<RootSettingsProps, "style">

const MainScreenLinksSection = ({
  onSettingsScreenLinkTapped,
  onAccountInfoLinkTapped,
  areNotificationsEnabled
}: MainScreenLinksSectionProps) => (
  <SettingsCardSectionView>
    <SettingsNavigationLinkView
      iconName="settings"
      iconBackgroundColor={AppStyles.black}
      title="General"
      onTapped={() => onSettingsScreenLinkTapped("generalSettings")}
    />
    <IfAuthenticated
      thenRender={(session: UserSession) => (
        <SettingsNavigationLinkView
          iconName="person"
          iconBackgroundColor={AppStyles.blue}
          title="Account Info"
          onTapped={() => onAccountInfoLinkTapped(session)}
        />
      )}
    />
    <SettingsNavigationLinkView
      iconName="color-palette"
      iconBackgroundColor={AppStyles.red}
      title="Appearance"
      onTapped={() => onSettingsScreenLinkTapped("appearanceSettings")}
    />
    <SettingsNavigationLinkView
      iconName="golf"
      iconBackgroundColor={AppStyles.green}
      title="Events"
      onTapped={() => onSettingsScreenLinkTapped("eventSettings")}
    />
    <SettingsNavigationLinkView
      iconName="notifications"
      iconBackgroundColor={AppStyles.yellow}
      title="Notifications"
      rightAccessory={
        <BodyText style={styles.notificationsText}>
          {areNotificationsEnabled ? "On" : "Off"}
        </BodyText>
      }
      onTapped={() => onSettingsScreenLinkTapped("notificationsSettings")}
    />
    <SettingsNavigationLinkView
      iconName="calendar"
      iconBackgroundColor={AppStyles.purple}
      title="Calendar"
      onTapped={() => onSettingsScreenLinkTapped("calendarSettings")}
    />
  </SettingsCardSectionView>
)

type SupportSectionProps = Pick<RootSettingsProps, "onSettingsScreenLinkTapped">

const SupportSectionView = ({
  onSettingsScreenLinkTapped
}: SupportSectionProps) => (
  <View style={styles.supportSectionContainer}>
    <SettingsCardSectionView title="Support">
      <SettingsNavigationLinkView
        iconName="bulb-sharp"
        iconBackgroundColor={AppStyles.black}
        title="Help and Feedback"
        onTapped={() => onSettingsScreenLinkTapped("helpAndSupport")}
      />
      <SettingsNavigationLinkView
        iconName="lock-closed"
        iconBackgroundColor={AppStyles.black}
        title="Privacy and Data"
        onTapped={() => onSettingsScreenLinkTapped("privacySettings")}
      />
    </SettingsCardSectionView>
    <VersionNumberView />
  </View>
)

export const useRootSettingsVersionQuote = (
  random: () => number = Math.random
) => {
  const [taps, setTaps] = useState(0)
  const quote = useConst(ALVIS_QUOTES.ext.randomElement(random))
  return {
    quote: taps >= 20 ? quote : undefined,
    versionNumberTapped: () => setTaps((taps) => taps + 1)
  }
}

const VersionNumberView = () => {
  const { quote, versionNumberTapped } = useRootSettingsVersionQuote()
  return (
    <>
      <BodyText
        suppressHighlighting
        style={styles.versionText}
        onPress={versionNumberTapped}
      >
        tiF version {nativeBuildVersion}
      </BodyText>
      {quote && (
        <Animated.View entering={FadeIn}>
          <SettingsCardView style={styles.quoteCard}>
            <BodyText suppressHighlighting style={styles.quoteText}>
              {quote}
            </BodyText>
          </SettingsCardView>
        </Animated.View>
      )}
    </>
  )
}

export const ALVIS_QUOTES = [
  "This is the providence of the world. Even Greats are merely beings restricted to the limited power determined by providence. That power, although great, is not unlimited.",
  "This new world is boundless. It is home not only to you, but many forms of life. I can see it. In this world, all life will walk towards the future. Hand in hand.",
  "Do you wish to change it? The future. It is everyone's desire to change the future. Is that not so? Even if everything is predestined, will you not oppose it?"
]

const styles = StyleSheet.create({
  notificationsText: {
    opacity: 0.5
  },
  supportSectionContainer: {
    rowGap: 8
  },
  versionText: {
    opacity: 0.5,
    textAlign: "center"
  },
  quoteCard: {
    paddingTop: 24
  },
  quoteText: {
    color: AppStyles.red.toString(),
    padding: 16
  }
})