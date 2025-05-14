import { useBackButton } from "@components/Navigation"
import {
  WithAlphaRegistrationProps,
  withAlphaRegistration
} from "@core-root/AlphaRegister"
import { StaticScreenProps } from "@react-navigation/native"
import {
  HelpAndSupportView,
  useHelpAndSupportSettings
} from "settings-boundary/HelpAndSupport"
import { UserID } from "TiFShared/domain-models/User"

export const helpAndSupportScreens = () => ({
  helpAndSupport: {
    options: {
      headerTitle: "Help and Support"
    },
    screen: HelpAndSupportScreen
  }
})

type RoutableHelpAndSupportScreenValues = {
  id: UserID
}

type HelpAndSupportScreenProps = WithAlphaRegistrationProps<
  StaticScreenProps<{}>
>

const HelpAndSupportScreen = withAlphaRegistration(
  ({ session }: HelpAndSupportScreenProps) => {
    useBackButton()
    const state = useHelpAndSupportSettings({ userID: session.id })
    return <HelpAndSupportView state={state} />
  }
)
