import { useMutation } from "@tanstack/react-query"
import { ContactInfoTypeFormattable, PrettyFormattable } from "@user/privacy"
import {
  StyleProp,
  View,
  ViewStyle,
  Alert,
  AlertButton,
  StyleSheet
} from "react-native"
import { SettingsScrollView } from "./components/ScrollView"
import { SettingsCardSectionView } from "./components/Section"
import { BodyText, Headline } from "@components/Text"
import { SettingsNavigationLinkView } from "./components/NavigationLink"
import { AppStyles } from "@lib/AppColorStyle"
import { SettingsButton } from "./components/Button"

export const ALERTS = {
  signOutConfirmation: {
    title: "Sign Out",
    description: "Are your sure about signing out of your account?",
    buttons: (signOut: () => void) => {
      return [
        { text: "Cancel" },
        { text: "Sign Out", style: "destructive" as const, onPress: signOut }
      ]
    }
  },
  signOutError: {
    title: "An Error Occurred",
    description:
      "We were unable to sign you out of your account, we apologize for the inconvenience. Please try again later."
  }
}

const presentAlert = <Key extends keyof typeof ALERTS>(
  kind: Key,
  actions?: AlertButton[]
) => {
  Alert.alert(ALERTS[kind].title, ALERTS[kind].description, actions)
}

export type UseAccountInfoSettingsEnvironment = {
  signOut: () => Promise<void>
  onSignOutSuccess: () => void
}

export const useAccountInfoSettings = ({
  signOut,
  onSignOutSuccess
}: UseAccountInfoSettingsEnvironment) => {
  const signOutMutation = useMutation(signOut, {
    onSuccess: onSignOutSuccess,
    onError: () => presentAlert("signOutError")
  })
  return {
    shouldDisableActions: signOutMutation.isLoading,
    signOutStarted: !signOutMutation.isLoading
      ? () => {
          presentAlert(
            "signOutConfirmation",
            ALERTS.signOutConfirmation.buttons(() => signOutMutation.mutate())
          )
        }
      : undefined
  }
}

export type AccountInfoSettingsProps = {
  state: ReturnType<typeof useAccountInfoSettings>
  userContactInfo: PrettyFormattable & ContactInfoTypeFormattable
  onChangeContactInfoTapped: () => void
  onChangePasswordTapped: () => void
  onForgotPasswordTapped: () => void
  style?: StyleProp<ViewStyle>
}

export const AccountInfoSettingsView = ({
  state,
  userContactInfo,
  onChangeContactInfoTapped,
  onChangePasswordTapped,
  onForgotPasswordTapped,
  style
}: AccountInfoSettingsProps) => (
  <SettingsScrollView style={style}>
    <ContactInfoSectionView
      isDisabled={state.shouldDisableActions}
      userContactInfo={userContactInfo}
      onChangeContactInfoTapped={onChangeContactInfoTapped}
    />
    <PasswordSectionView
      isDisabled={state.shouldDisableActions}
      onChangePasswordTapped={onChangePasswordTapped}
      onForgotPasswordTapped={onForgotPasswordTapped}
    />
    <DestructiveSectionView
      isDisabled={state.shouldDisableActions}
      onSignOutTapped={state.signOutStarted}
      onDeleteAccountTapped={() => console.log("TODO: - Delete Account")}
    />
  </SettingsScrollView>
)

type ContactInfoSectionProps = {
  isDisabled: boolean
  onChangeContactInfoTapped: () => void
  userContactInfo: PrettyFormattable & ContactInfoTypeFormattable
}

const ContactInfoSectionView = ({
  isDisabled,
  onChangeContactInfoTapped,
  userContactInfo
}: ContactInfoSectionProps) => (
  <>
    <SettingsCardSectionView
      title="Contact Info"
      subtitle="Your contact information is only shared with people you explicitly select."
    >
      <View style={styles.contactInfoContainer}>
        <Headline>{userContactInfo.formattedContactInfoType}</Headline>
        <BodyText>{userContactInfo.prettyFormatted}</BodyText>
      </View>
    </SettingsCardSectionView>
    <SettingsCardSectionView>
      <SettingsNavigationLinkView
        title={`Change ${userContactInfo.formattedContactInfoType}`}
        iconName={userContactInfo.contactInfoTypeIconName}
        iconBackgroundColor={AppStyles.black}
        isDisabled={isDisabled}
        onTapped={onChangeContactInfoTapped}
      />
    </SettingsCardSectionView>
  </>
)

type PasswordSectionProps = {
  isDisabled: boolean
  onChangePasswordTapped: () => void
  onForgotPasswordTapped: () => void
}

const PasswordSectionView = ({
  isDisabled,
  onChangePasswordTapped,
  onForgotPasswordTapped
}: PasswordSectionProps) => (
  <SettingsCardSectionView title="Password">
    <SettingsNavigationLinkView
      title="Change Password"
      iconName="lock-closed"
      iconBackgroundColor={AppStyles.black}
      isDisabled={isDisabled}
      onTapped={onChangePasswordTapped}
    />
    <SettingsNavigationLinkView
      title="Forgot Password"
      iconName="bulb"
      iconBackgroundColor={AppStyles.black}
      isDisabled={isDisabled}
      onTapped={onForgotPasswordTapped}
    />
  </SettingsCardSectionView>
)

type DestructiveSectionProps = {
  isDisabled: boolean
  onSignOutTapped?: () => void
  onDeleteAccountTapped?: () => void
}

const DestructiveSectionView = ({
  isDisabled,
  onSignOutTapped,
  onDeleteAccountTapped
}: DestructiveSectionProps) => (
  <SettingsCardSectionView>
    <SettingsButton onTapped={onSignOutTapped} isDisabled={isDisabled}>
      <Headline style={styles.destructiveButton}>Sign Out</Headline>
    </SettingsButton>
    <SettingsButton onTapped={onDeleteAccountTapped} isDisabled={isDisabled}>
      <Headline style={styles.destructiveButton}>Delete Account</Headline>
    </SettingsButton>
  </SettingsCardSectionView>
)

const styles = StyleSheet.create({
  contactInfoContainer: {
    padding: 16,
    rowGap: 8
  },
  destructiveButton: {
    color: AppStyles.red.toString()
  }
})
