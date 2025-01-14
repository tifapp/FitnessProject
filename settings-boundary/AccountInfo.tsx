import { TiFFormRowButton } from "@components/form-components/Button"
import { TiFFormNavigationLinkView } from "@components/form-components/NavigationLink"
import { TiFFormScrollView } from "@components/form-components/ScrollView"
import { TiFFormCardSectionView } from "@components/form-components/Section"
import { BodyText, Headline } from "@components/Text"
import { AlertsObject, presentAlert } from "@lib/Alerts"
import { AppStyles } from "@lib/AppColorStyle"
import { useMutation } from "@tanstack/react-query"
import { ContactInfoTypeFormattable, PrettyFormattable } from "@user/privacy"
import {
  StyleProp,
  StyleSheet,
  View,
  ViewStyle
} from "react-native"

export const ALERTS = {
  signOutConfirmation: (signOut?: () => void) => ({
    title: "Sign Out",
    description: "Are your sure about signing out of your account?",
    buttons: [
      { text: "Cancel" },
      { text: "Sign Out", style: "destructive" as const, onPress: signOut }
    ]
  }),
  signOutError: {
    title: "An Error Occurred",
    description:
      "We were unable to sign you out of your account, we apologize for the inconvenience. Please try again later."
  }
} satisfies AlertsObject

export type UseAccountInfoSettingsEnvironment = {
  signOut: () => Promise<void>
  onSignOutSuccess: () => void
}

export const useAccountInfoSettings = ({
  signOut,
  onSignOutSuccess
}: UseAccountInfoSettingsEnvironment) => {
  const signOutMutation = useMutation({
    mutationFn: signOut,
    onSuccess: onSignOutSuccess,
    onError: () => presentAlert(ALERTS.signOutError)
  })
  return {
    shouldDisableActions: signOutMutation.isPending,
    signOutStarted: !signOutMutation.isPending
      ? () => {
          presentAlert(
            ALERTS.signOutConfirmation(() => signOutMutation.mutate())
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
  <TiFFormScrollView style={style}>
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
  </TiFFormScrollView>
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
    <TiFFormCardSectionView
      title="Contact Info"
      subtitle="Your contact information is only shared with people you explicitly select."
    >
      <View style={styles.contactInfoContainer}>
        <Headline>{userContactInfo.formattedContactInfoType}</Headline>
        <BodyText>{userContactInfo.prettyFormatted}</BodyText>
      </View>
    </TiFFormCardSectionView>
    <TiFFormCardSectionView>
      <TiFFormNavigationLinkView
        title={`Change ${userContactInfo.formattedContactInfoType}`}
        iconName={userContactInfo.contactInfoTypeIconName}
        iconBackgroundColor={AppStyles.primary}
        isDisabled={isDisabled}
        onTapped={onChangeContactInfoTapped}
      />
    </TiFFormCardSectionView>
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
  <TiFFormCardSectionView title="Password">
    <TiFFormNavigationLinkView
      title="Change Password"
      iconName="lock-closed"
      iconBackgroundColor={AppStyles.primary}
      isDisabled={isDisabled}
      onTapped={onChangePasswordTapped}
    />
    <TiFFormNavigationLinkView
      title="Forgot Password"
      iconName="bulb"
      iconBackgroundColor={AppStyles.primary}
      isDisabled={isDisabled}
      onTapped={onForgotPasswordTapped}
    />
  </TiFFormCardSectionView>
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
  <TiFFormCardSectionView>
    <TiFFormRowButton onTapped={onSignOutTapped} isDisabled={isDisabled}>
      <Headline style={styles.destructiveButton}>Sign Out</Headline>
    </TiFFormRowButton>
    <TiFFormRowButton onTapped={onDeleteAccountTapped} isDisabled={isDisabled}>
      <Headline style={styles.destructiveButton}>Delete Account</Headline>
    </TiFFormRowButton>
  </TiFFormCardSectionView>
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
