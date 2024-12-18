import { XMarkBackButton } from "@components/Navigation"
import { Headline } from "@components/Text"
import { StaticScreenProps } from "@react-navigation/native"
import { UserHandle, UserID } from "TiFShared/domain-models/User"

export const profileScreens = () => ({
  userProfile: {
    options: { headerLeft: XMarkBackButton, headerTitle: "" },
    screen: ProfileScreen
  }
})

type ProfileScreenProps = StaticScreenProps<{
  id: UserID | UserHandle
  method?: "navigate" | "replace"
}>

const ProfileScreen = ({ route }: ProfileScreenProps) => (
  <Headline>User {route.params.id.toString()}</Headline>
)
